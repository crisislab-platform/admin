import "./styles.css";
import "mapbox-gl/dist/mapbox-gl.css";

import { BasicSensorInfo, LoadingSpinner } from "../components";
import {
	Button,
	Menu,
	MenuItem,
	Popover,
	SpeedDial,
	SpeedDialAction,
	Stack,
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

import CopyIcon from "@mui/icons-material/FileCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import MapIcon from "@mui/icons-material/Map";
import MarkerIcon from "@mui/icons-material/LocationOn";
import ReloadIcon from "@mui/icons-material/Replay";
import { Sensor } from "../types";
import SettingsPanel from "./SettingsPanel";
import { useSnackbar } from "notistack";

const Sidebar = React.lazy(() => import("./Sidebar"));

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

export default function MapApp() {
	const theme = useTheme();
	const [sensorsVisible, setSensorsVisible] = useState(true);
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
					console.log("Sensor in URL: " + sensor.id);
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

	// Simulate loading
	async function loadSensorLocations() {
		const snack = enqueueSnackbar("Loading sensor locations...", {
			variant: "info",
		});
		try {
			const res = await fetch(
				`https://shakemap.benhong.me/api/v1/sensors`,
			);
			const data = await res.json();
			// console.log(data);
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
			console.log("Failed to load sensor locations. Error: ", e);
			enqueueSnackbar("Failed to load sensor locations!", {
				variant: "error",
			});
		}
	}

	useEffect(() => {
		loadSensorLocations();
	}, [enqueueSnackbar, closeSnackbar, setSensors]);

	useEffect(() => {
		function updateDrawerWidth() {
			setDrawerWidth(window.innerWidth / 3);
		}
		updateDrawerWidth();

		window.addEventListener("resize", updateDrawerWidth);

		return () => window.removeEventListener("resize", updateDrawerWidth);
	}, []);

	function loadMap() {
		if (mapContainerRef.current) {
			const snack = enqueueSnackbar("Loading map...", {
				variant: "info",
			});
			const newMap = new MapboxMap({
				container: mapContainerRef.current,
				style: "mapbox://styles/zadeviggers/ckypfzqia407v15qo1lruw30b",
				center: [174.8, -41.325],
				zoom: 4.8,
			});

			newMap
				.addControl(new AttributionControl(), "top-left")
				.addControl(
					new NavigationControl({
						visualizePitch: true,
						showZoom: true,
						showCompass: true,
					}),
					"top-left",
				)
				.addControl(
					new GeolocateControl({
						positionOptions: {
							enableHighAccuracy: true,
						},
						showUserLocation: false,
					}),
					"top-left",
				)
				.addControl(
					new ScaleControl({
						maxWidth: 150,
						unit: "metric",
					}),
					"bottom-left",
				);

			newMap.on("load", () => {
				closeSnackbar(snack);
				enqueueSnackbar("Loaded map!", {
					variant: "success",
				});
				newMap.addSource("fault-lines-source", {
					type: "vector",
					url: "mapbox://zadeviggers.8hjwpez9",
				});
				newMap.addLayer({
					id: "fault-lines-layer",
					type: "line",
					source: "fault-lines-source",

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

				setMap(newMap);
			});
		}
	}

	useEffect(() => {
		loadMap();
		// Clean up on unmount
		return () => {
			map?.remove();
		};
	}, [theme]);

	useEffect(() => {
		if (map && map.loaded && map.getLayer("fault-lines-layer")) {
			const visibility = map.getLayoutProperty(
				"fault-lines-layer",
				"visibility",
			);
			if (faultLinesVisible && visibility !== "visible") {
				map.setLayoutProperty(
					"fault-lines-layer",
					"visibility",
					"visible",
				);
			} else if (!faultLinesVisible && visibility === "visible") {
				map.setLayoutProperty(
					"fault-lines-layer",
					"visibility",
					"none",
				);
			}
		}
	}, [map, faultLinesVisible]);

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
					let markerColour =
						sensor.status === "online"
							? theme.palette.success.main
							: theme.palette.error.main;
					if (!!activeSensor && sensor.id === activeSensor.id) {
						markerColour = theme.palette.primary.main;
					}
					const marker = new Marker({
						color: markerColour,
					})
						.setLngLat([sensor.longitude, sensor.latitude])
						.addTo(map);
					const markerEl = marker.getElement();

					markerEl.addEventListener("click", (e) =>
						clickHandler(marker, markerEl),
					);
					// Terrible attempt to make the markers keyboard accessible
					/*
					markerEl.setAttribute("tabindex", "1");
					markerEl.addEventListener("focus", () => {
						markerEl.setAttribute("tabindex", "-1");
						clickHandler();
					});
					markerEl.addEventListener("blur", () => {
						setTimeout(
							() => markerEl.setAttribute("tabindex", "1"),
							2000,
						);
					// });*/
					markerEl.addEventListener(
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

	function flyToCoords(longatude: number, latitude: number): void {
		const flyTime = 1500;
		if (map) {
			map.easeTo({
				center: [longatude, latitude],
				zoom: 13,
				duration: flyTime,
			});
		}
	}

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
						top: window.innerHeight / 2 - 210,
						"& > .MuiPaper-root": {
							p: (theme) => theme.spacing(1),
						},
					}}>
					<Stack>
						<BasicSensorInfo sensor={popover.sensor} />
						<Button
							variant="outlined"
							onClick={() => {
								setActiveSensor(popover.sensor);
								setPopover(null);
								const newRelativePathQuery = new URL(
									window.location.href,
								);
								newRelativePathQuery.searchParams.set(
									"sensor_id",
									popover.sensor.id + "",
								);
								window.history.pushState(
									null,
									"",
									newRelativePathQuery.href,
								);
							}}>
							Show in sidebar
						</Button>
					</Stack>
				</Popover>
			)}
			<SpeedDial
				sx={{
					position: "absolute",
					right: (theme) => theme.spacing(2),
					bottom: (theme) => theme.spacing(2),
					zIndex: (theme) => theme.zIndex.snackbar + 1,
				}}
				color="primary"
				ariaLabel="Reload buttons"
				icon={<ReloadIcon />}>
				<SpeedDialAction
					icon={<MarkerIcon />}
					tooltipTitle="Reload sensor locations"
					onClick={() => {
						setSensors(null);
						setActiveSensor(null);
						loadSensorLocations();
					}}
				/>
				<SpeedDialAction
					icon={<MapIcon />}
					tooltipTitle="Re-initalize map"
					onClick={() => {
						setMap(null);
						loadMap();
					}}
				/>
			</SpeedDial>
			<SettingsPanel
				sensorsVisible={sensorsVisible}
				setSensorsVisible={setSensorsVisible}
				faultLinesVisible={faultLinesVisible}
				setFaultLinesVisible={setFaultLinesVisible}
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
