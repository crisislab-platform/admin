import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import { BasicSensorInfo, LoadingSpinner } from "../components";
import {
	Box,
	Button,
	Fab,
	IconButton,
	Menu,
	MenuItem,
	Popover,
	Stack,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";
import React, {
	MouseEvent,
	Suspense,
	useEffect,
	useRef,
	useState,
} from "react";
import mapboxgl, {
	AttributionControl,
	GeolocateControl,
	Map as MapboxMap,
	Marker,
	NavigationControl,
	ScaleControl,
} from "mapbox-gl";

import CloseIcon from "@mui/icons-material/Close";
import CopyIcon from "@mui/icons-material/FileCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import ReloadIcon from "@mui/icons-material/Replay";
import { Sensor } from "../types";
import SettingsPanel from "./SettingsPanel";
import SunCalc from "suncalc";
import { sensorsAPIBase } from "../utils";
import { useSnackbar } from "notistack";

const Sidebar = React.lazy(() => import("./Sidebar"));

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const mapStyles = {
	normal: "mapbox://styles/zadeviggers/ckypfzqia407v15qo1lruw30b",
	satelite: "mapbox://styles/zadeviggers/ckyteodd6000414pbra6c7e9x",
};

export default function MapApp() {
	const theme = useTheme();
	const [sateliteMode, setSateliteMode] = useState(false);
	const [sensorsVisible, setSensorsVisible] = useState(true);
	const [geoNetSensorsVisible, setGeoNetSensorsVisible] = useState(false);
	const [faultLinesVisible, setFaultLinesVisible] = useState(true);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const mapContainerRef = useRef<null | HTMLDivElement>(null);
	const [drawerWidth, setDrawerWidth] = useState(window.innerWidth / 3);
	const [sensors, setSensors] = useState<Sensor[] | null>(null);
	const [activeSensor, setActiveSensor] = useState<null | Sensor>(null);
	const [popover, setPopover] = useState<null | {
		x: number;
		y: number;
		sensor: Sensor;
		marker: Marker;
	}>(null);
	const [map, setMap] = useState<null | MapboxMap>(null);
	const [contextMenu, setContextMenu] = useState<null | {
		x: number;
		y: number;
		sensor: Sensor;
		marker: Marker;
	}>(null);

	useEffect(() => {
		document.title = "CRISiSLab sensor map";
		// @ts-expect-error
		window.theme = theme;
	}, []);

	useEffect(() => {
		if (sensors) {
			const urlSensorID = new URLSearchParams(window.location.search).get(
				"sensor_id",
			);

			if (urlSensorID) {
				const sensor = sensors.find(
					(s: Sensor) => s.id == urlSensorID, // Non-strict equality comparison is on purpose to account for the id being either a number or a string
				);
				if (sensor) {
					console.info("Sensor in URL: " + sensor.id);
					setActiveSensor(sensor);

					// Timeout to give the map time to load
					setTimeout(
						() => flyToCoords(sensor.longitude, sensor.latitude),
						3000,
					);
				}
			}
		}
	}, [sensors]);

	async function loadSensorLocations() {
		const snack = enqueueSnackbar("Loading sensor locations...", {
			variant: "info",
			persist: true,
		});
		try {
			const res = await fetch(sensorsAPIBase);
			const data = await res.json();
			closeSnackbar(snack);
			if (Array.isArray(data?.sensors)) {
				setSensors(data.sensors);
				enqueueSnackbar("Loaded sensor locations!", {
					variant: "success",
				});
			} else {
				enqueueSnackbar("Received invalid sensor data from server.", {
					variant: "warning",
				});
			}
		} catch (e) {
			closeSnackbar(snack);
			console.warn("Failed to load sensor locations. Error: ", e);
			enqueueSnackbar("Failed to load sensor locations!", {
				variant: "error",
			});
		}
	}

	useEffect(() => {
		loadSensorLocations();

		() => {
			setSensors(null);
			setActiveSensor(null);
		};
	}, [enqueueSnackbar, closeSnackbar, setSensors, setActiveSensor]);

	useEffect(() => {
		function updateDrawerWidth() {
			setDrawerWidth(window.innerWidth / 3);
		}
		updateDrawerWidth();

		window.addEventListener("resize", updateDrawerWidth);

		return () => window.removeEventListener("resize", updateDrawerWidth);
	}, []);

	function loadMap(): () => void {
		if (mapContainerRef.current) {
			console.info("Loading map...");

			const snack = enqueueSnackbar("Loading map...", {
				variant: "info",
				persist: true,
			});
			const newMap = new MapboxMap({
				container: mapContainerRef.current,
				style: sateliteMode ? mapStyles.satelite : mapStyles.normal,
				center: [174.8, -41.325],
				zoom: 4.8,
			});

			const attributionControl = new AttributionControl();
			newMap.addControl(attributionControl, "top-left");

			const geocoderControl = new MapboxGeocoder({
				accessToken: mapboxgl.accessToken,
				mapboxgl: newMap,
			});
			newMap.addControl(geocoderControl, "top-left");

			const navigationControl = new NavigationControl({
				visualizePitch: true,
				showZoom: true,
				showCompass: true,
			});
			newMap.addControl(navigationControl, "top-left");

			const geoLocateControl = new GeolocateControl({
				positionOptions: {
					enableHighAccuracy: true,
				},
				showUserLocation: false,
			});
			newMap.addControl(geoLocateControl, "top-left");

			const scaleControl = new ScaleControl({
				maxWidth: 150,
				unit: "metric",
			});
			newMap.addControl(scaleControl, "bottom-left");

			function onError(e) {
				closeSnackbar(snack);
				console.info("Failed to load map. Error: ", e);
				enqueueSnackbar("Failed to load map!", {
					variant: "error",
				});
			}
			function onLoad() {
				closeSnackbar(snack);
				enqueueSnackbar("Loaded map!", {
					variant: "success",
				});
				// GeoNet
				newMap.addSource("geonet-source", {
					type: "vector",
					url: "mapbox://zadeviggers.ckyti0ozu2wkk20rvo89kd6ur-6jsd8",
				});
				newMap.addLayer({
					id: "geonet-layer",
					type: "symbol",
					source: "geonet-source",
					"source-layer": "stations",
					layout: {
						visibility: "none",
						"text-field": ["get", "Name"],
						"text-size": 12,
						"icon-image": ["image", "border-dot-13"],
					},
					paint: {
						"text-color": theme.palette.text.primary,
						"text-halo-width": 1,
						"text-halo-color": "#ffffff",
						"icon-color": theme.palette.secondary.main,
					},
				});
				// Fault lines
				newMap.addSource("fault-lines-source", {
					type: "vector",
					url: "mapbox://zadeviggers.8hjwpez9",
				});
				newMap.addLayer({
					id: "fault-lines-layer",
					type: "line",
					source: "fault-lines-source",
					"source-layer": "New_Zealand_Active_Faults_Database_1250k",
					layout: {
						// Make the layer visible by default.
						visibility: "visible",
						"line-join": "round",
						"line-cap": "round",
					},
					paint: {
						"line-color": theme.palette.error.main,
					},
				});
				newMap.addLayer({
					id: "fault-lines-labels-layer",
					type: "symbol",
					source: "fault-lines-source",
					"source-layer": "New_Zealand_Active_Faults_Database_1250k",
					layout: {
						visibility: "visible",
						"text-field": ["get", "Name"],
						"text-size": 12,
						"symbol-placement": "line-center",
					},
					paint: {
						"text-color": theme.palette.text.primary,
						"text-halo-width": 1,
						"text-halo-color": "#ffffff",
						// Other theme - try out later
						// "text-color": theme.palette.error.main,
						// "text-halo-width": 1,
						// "text-halo-color": "#000000",
					},
				});
				function getSunPosition() {
					const center = newMap.getCenter();
					const sunPos = SunCalc.getPosition(
						new Date(),
						center.lat,
						center.lng,
					);
					const sunAzimuth = 180 + (sunPos.azimuth * 180) / Math.PI;
					const sunAltitude = 90 - (sunPos.altitude * 180) / Math.PI;
					return [sunAzimuth, sunAltitude];
				}
				newMap.addLayer({
					id: "sky",
					type: "sky",
					paint: {
						"sky-opacity": [
							"interpolate",
							["linear"],
							["zoom"],
							0,
							0,
							5,
							0.3,
							8,
							1,
						],
						// set up the sky layer for atmospheric scattering
						"sky-type": "atmosphere",
						// explicitly set the position of the sun rather than allowing the sun to be attached to the main light source
						"sky-atmosphere-sun": getSunPosition(),
						// set the intensity of the sun as a light source (0-100 with higher values corresponding to brighter skies)
						"sky-atmosphere-sun-intensity": 5,
					},
				});
				setMap(newMap);
			}
			newMap.on("error", onError);
			newMap.on("load", onLoad);

			return () => {
				console.info("Removing map...");
				newMap.off("error", onError);
				newMap.off("load", onLoad);
				newMap.removeControl(navigationControl);
				newMap.removeControl(geoLocateControl);
				newMap.removeControl(attributionControl);
				newMap.removeControl(geocoderControl);
				newMap.removeControl(scaleControl);
				newMap.remove();
				if (mapContainerRef && mapContainerRef.current) {
					mapContainerRef.current.innerHTML = "";
				}
			};
		}
		return () => {};
	}

	useEffect(() => {
		const removeMap = loadMap();
		return () => removeMap();
	}, [theme, sateliteMode]);

	useEffect(() => {
		if (
			map &&
			map.loaded &&
			map.getLayer("fault-lines-layer") &&
			map.getLayer("fault-lines-labels-layer")
		) {
			const visibility = map.getLayoutProperty(
				"fault-lines-layer",
				"visibility",
			);
			if (faultLinesVisible && visibility !== "visible") {
				map.setLayoutProperty(
					"fault-lines-layer",
					"visibility",
					"visible",
				).setLayoutProperty(
					"fault-lines-labels-layer",
					"visibility",
					"visible",
				);
			} else if (!faultLinesVisible && visibility === "visible") {
				map.setLayoutProperty(
					"fault-lines-layer",
					"visibility",
					"none",
				).setLayoutProperty(
					"fault-lines-labels-layer",
					"visibility",
					"none",
				);
			}
		}
	}, [map, faultLinesVisible]);

	useEffect(() => {
		if (map && map.loaded && map.getLayer("geonet-layer")) {
			const visibility = map.getLayoutProperty(
				"geonet-layer",
				"visibility",
			);
			if (geoNetSensorsVisible && visibility !== "visible") {
				map.setLayoutProperty("geonet-layer", "visibility", "visible");
			} else if (!geoNetSensorsVisible && visibility === "visible") {
				map.setLayoutProperty("geonet-layer", "visibility", "none");
			}
		}
	}, [map, geoNetSensorsVisible]);

	useEffect(() => {
		let markers: Marker[] = [];
		if (map && sensors && Array.isArray(sensors) && sensorsVisible) {
			sensors.map((sensor) => {
				function clickHandler(marker: any, markerEl: any) {
					const boundingRect = markerEl.getBoundingClientRect();
					setPopover({
						x: boundingRect.x,
						y: boundingRect.y,
						sensor,
						marker,
					});
					flyToCoords(sensor.longitude, sensor.latitude);
				}
				if (map) {
					const markerElement = document.createElement("div");
					markerElement.setAttribute("title", `Sensor #${sensor.id}`);
					markerElement.classList.add("crisislab-sensor-marker");
					if ("online" in sensor) {
						if (sensor.online === true) {
							markerElement.classList.add("online");
							markerElement.classList.remove("offline");
						} else if (sensor.online === false) {
							markerElement.classList.remove("online");
							markerElement.classList.add("offline");
						}
					}
					if (!!activeSensor && sensor.id === activeSensor.id) {
						markerElement.classList.add("active");
					} else {
						markerElement.classList.remove("active");
					}

					if (!!popover && sensor.id === popover.sensor.id) {
						markerElement.classList.add("popover-open");
					} else {
						markerElement.classList.remove("popover-open");
					}

					const marker = new Marker(markerElement)
						.setLngLat([sensor.longitude, sensor.latitude])
						.addTo(map);

					markerElement.addEventListener("click", (e) =>
						clickHandler(marker, markerElement),
					);
					// Terrible attempt to make the markers keyboard accessible
					/*
					markerElement.setAttribute("tabindex", "1");
					markerElement.addEventListener("focus", () => {
						markerElement.setAttribute("tabindex", "-1");
						clickHandler();
					});
					markerElement.addEventListener("blur", () => {
						setTimeout(
							() => markerElement.setAttribute("tabindex", "1"),
							2000,
						);
					// });*/
					markerElement.addEventListener(
						"contextmenu",
						// @ts-ignore
						(event: MouseEvent) => {
							event.preventDefault();
							setContextMenu(
								contextMenu === null
									? {
											x: event.clientX - 2,
											y: event.clientY - 4,
											sensor,
											marker,
									  }
									: null,
							);
						},
					);
					markers.push(marker);
				}
			});
		}
		return () => {
			markers.map((marker) => marker.remove());
		};
	}, [sensors, activeSensor, map, sensorsVisible]);

	useEffect(() => {
		const newRelativePathQuery = new URL(window.location.href);
		if (activeSensor) {
			newRelativePathQuery.searchParams.set(
				"sensor_id",
				activeSensor.id + "",
			);
		}
		window.history.pushState(null, "", newRelativePathQuery.href);
	}, [activeSensor]);

	function flyToCoords(longatude: number, latitude: number): void {
		const flyTime = 1500;
		if (map) {
			map.easeTo({
				center: [longatude, latitude],
				zoom: 10,
				duration: flyTime,
			});
		}
	}

	function reloadSensors() {
		setSensors(null);
		setActiveSensor(null);
		loadSensorLocations();
	}
	// function reloadMap() {
	// 	setMap(null);
	// 	loadMap();
	// }

	return (
		<>
			<Suspense fallback={<LoadingSpinner />}>
				<Sidebar
					activeSensor={activeSensor}
					setActiveSensor={setActiveSensor}
					width={drawerWidth}
					flyToCoords={flyToCoords}
				/>
			</Suspense>
			<Menu
				open={contextMenu !== null}
				onClose={() => setContextMenu(null)}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.y, left: contextMenu.x }
						: undefined
				}>
				<MenuItem
					onClick={() => {
						if (contextMenu) {
							navigator.clipboard.writeText(
								contextMenu.sensor.id + "",
							);
							setContextMenu(null);
						}
					}}>
					<FingerprintIcon sx={{ mr: 2 }} />
					<Typography>
						Sensor ID: <strong>{contextMenu?.sensor.id}</strong>
					</Typography>
				</MenuItem>
				<MenuItem
					onClick={() => {
						if (contextMenu) {
							navigator.clipboard.writeText(
								`${contextMenu.sensor.longitude}, ${contextMenu.sensor.latitude}`,
							);
							setContextMenu(null);
						}
					}}>
					<CopyIcon sx={{ mr: 2 }} />
					<Typography>Copy coordinates</Typography>
				</MenuItem>
			</Menu>
			{popover && (
				<Popover
					open={!!popover}
					onClose={() => setPopover(null)}
					sx={{
						position: "absolute",
						left: window.innerWidth / 2 - 130,
						top: window.innerHeight / 2 - 260,
						"& > .MuiPaper-root": {
							p: (theme) => theme.spacing(1),
						},
					}}>
					<Stack gap={1}>
						<Box sx={{ display: "flex" }}>
							<Tooltip title="Close popup" placement="right">
								<IconButton
									sx={{ ml: "auto" }}
									onClick={() => setPopover(null)}>
									<CloseIcon />
								</IconButton>
							</Tooltip>
						</Box>
						<BasicSensorInfo sensor={popover.sensor} />
						<Button
							variant="outlined"
							onClick={() => {
								setActiveSensor(popover.sensor);
								setPopover(null);
							}}>
							Show in sidebar
						</Button>
					</Stack>
				</Popover>
			)}

			<Tooltip title="Reload sensor locations" placement="left">
				<Fab
					sx={{
						position: "absolute",
						right: (theme) => theme.spacing(2),
						bottom: (theme) => theme.spacing(2),
						zIndex: (theme) => theme.zIndex.snackbar + 1,
					}}
					color="primary"
					onClick={() => {
						reloadSensors();
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>

			<SettingsPanel
				sensorsVisible={sensorsVisible}
				setSensorsVisible={setSensorsVisible}
				faultLinesVisible={faultLinesVisible}
				setFaultLinesVisible={setFaultLinesVisible}
				sateliteMode={sateliteMode}
				setSateliteMode={setSateliteMode}
				geoNetSensorsVisible={geoNetSensorsVisible}
				setGeoNetSensorsVisible={setGeoNetSensorsVisible}
			/>

			<div
				style={{
					position: "absolute",
					top: 0,
					bottom: 0,
					left: 0,
					right: 0,
				}}
				className="map-container"
				ref={mapContainerRef}
			/>
		</>
	);
}
