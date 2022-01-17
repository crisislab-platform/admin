import {
	SpeedDial,
	SpeedDialAction,
	Menu,
	MenuItem,
	Popover,
	Typography,
	Button,
	useTheme,
	Stack,
} from "@mui/material";
import React, {
	MouseEvent,
	useEffect,
	useRef,
	useState,
	Suspense,
} from "react";
import mapboxgl, {
	Map as MapboxMap,
	Marker,
	NavigationControl,
} from "mapbox-gl";
import { Auth0Provider, AppState as Auth0AppState } from "@auth0/auth0-react";
import CopyIcon from "@mui/icons-material/FileCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ReloadIcon from "@mui/icons-material/Replay";
import MarkerIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import { Sensor } from "./types";
import { useSnackbar } from "notistack";
import { JWTContext } from "./Auth";

const Sidebar = React.lazy(() => import("./Sidebar"));
import LoadingSpinner from "./LoadingSpinner";
import BasicSensorInfo from "./BasicSensorInfo";

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

function App() {
	const theme = useTheme();
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
	const [JWT, setJWT] = useState<null | string>(null);

	// Simulate loading
	async function loadSensorLocations() {
		const snack = enqueueSnackbar("Loading sensor locations...", {
			variant: "info",
		});
		try {
			const res = await fetch(
				`https://shakemap.benhong.me/api/v1/sensors`,
				{
					headers: {
						Authorisation: `Bearer ${JWT}`,
					},
				},
			);
			const data = await res.json();
			console.log(data);

			closeSnackbar(snack);
			enqueueSnackbar("Loaded sensor locations!", {
				variant: "success",
			});
			setSensors(data.sensors);
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
		setDrawerWidth(window.innerWidth / 3);
	}, [window.innerWidth]);

	function loadMap() {
		if (mapContainerRef.current) {
			const snack = enqueueSnackbar("Loading map...", {
				variant: "info",
			});
			const newMap = new MapboxMap({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/streets-v11",
				center: [174.8, -41.325],
				zoom: 5.2,
			});

			// Add navigation control (the +/- zoom buttons)
			newMap.addControl(new NavigationControl(), "top-right");

			setMap(newMap);

			closeSnackbar(snack);
			enqueueSnackbar("Loaded map!", {
				variant: "success",
			});
		}
	}

	useEffect(() => {
		loadMap();

		// Clean up on unmount
		return () => {
			map?.remove();
		};
	}, []);

	useEffect(() => {
		let markers: Marker[] = [];
		if (map) {
			sensors?.map((sensor) => {
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
					function clickHandler() {
						const boundingRect = markerEl.getBoundingClientRect();
						setPopover({
							x: boundingRect.x,
							y: boundingRect.y,
							sensor,
							marker,
						});
						if (map) {
							flyToCoords(sensor.longitude, sensor.latitude);
						}
					}

					markerEl.addEventListener("click", clickHandler);
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
	}, [sensors, activeSensor, map]);

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
		<JWTContext.Provider value={[JWT, setJWT]}>
			<Auth0Provider
				domain={import.meta.env.VITE_AUTH0_DOMAIN}
				clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
				redirectUri={window.location.origin}
				scope={import.meta.env.VITE_AUTH0_SCOPE}
				audience={import.meta.env.VITE_AUTH0_AUDIENCE}
				onRedirectCallback={(appState: Auth0AppState) => {
					console.log(appState);
				}}>
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
								}}>
								More details
							</Button>
						</Stack>
					</Popover>
				)}
				<SpeedDial
					sx={{
						position: "absolute",
						right: (theme) => theme.spacing(2),
						bottom: (theme) => theme.spacing(2),
						zIndex: (theme) => theme.zIndex.drawer + 1,
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
			</Auth0Provider>
		</JWTContext.Provider>
	);
}

export default App;
