import { Fab, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import { MouseEvent, useEffect, useRef, useState } from "react";
import mapboxgl, {
	Map as MapboxMap,
	Marker,
	NavigationControl,
} from "mapbox-gl";

import CopyIcon from "@mui/icons-material/FileCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import ReloadIcon from "@mui/icons-material/Replay";
import { Sensor } from "./types";
import Sidebar from "./Sidebar";
import { useSnackbar } from "notistack";

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

function App() {
	const { enqueueSnackbar } = useSnackbar();
	const mapContainerRef = useRef<null | HTMLDivElement>(null);
	const [drawerWidth, setDrawerWidth] = useState(window.innerWidth / 3);
	const [sensors, setSensors] = useState<Sensor[] | null>(null);
	const [activeSensor, setActiveSensor] = useState<null | Sensor>(null);
	const [map, setMap] = useState<null | MapboxMap>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		sensor: Sensor;
	} | null>(null);

	// Simulate loading
	function loadSensorLocations() {
		enqueueSnackbar("Loading sensor locations...", { variant: "info" });
		return setTimeout(() => {
			enqueueSnackbar("Loaded sensor locations!", { variant: "success" });
			setSensors([
				{
					status: "offline",
					longitude: 174.8,
					latitude: -41.325,
					id: 2,
				},
				{
					status: "online",
					longitude: 174.81,
					latitude: -41.326,
					id: 1,
				},
				{
					status: "online",
					longitude: 174.82,
					latitude: -41.327,
					id: 0,
				},
			]);
		}, 5000);
	}
	useEffect(() => {
		const timeout = loadSensorLocations();
		return () => clearTimeout(timeout);
	}, []);

	useEffect(() => {
		if (mapContainerRef.current) {
			setMap(
				new MapboxMap({
					container: mapContainerRef.current,
					style: "mapbox://styles/mapbox/streets-v11",
					center: [174.8, -41.325],
					zoom: 10,
				}),
			);

			// Add navigation control (the +/- zoom buttons)
			map?.addControl(new NavigationControl(), "top-right");

			// Clean up on unmount
			return () => {
				map?.remove();
			};
		}
	}, []);

	useEffect(() => {
		let markers: Marker[] = [];
		if (map) {
			sensors?.map((sensor) => {
				if (map) {
					let markerColour =
						sensor.status === "online" ? "green" : "red";
					if (!!activeSensor && sensor.id === activeSensor.id) {
						markerColour = "blue";
					}
					const marker = new Marker({
						color: markerColour,
					})
						.setLngLat([sensor.longitude, sensor.latitude])
						.addTo(map);
					const markerEl = marker.getElement();
					markerEl.addEventListener("click", () => {
						setActiveSensor(sensor);
						if (map) {
							flyToCoords(sensor.longitude, sensor.latitude);
						}
					});
					markerEl.addEventListener(
						"contextmenu",
						// @ts-ignore
						(event: MouseEvent) => {
							event.preventDefault();
							setContextMenu(
								contextMenu === null
									? {
											mouseX: event.clientX - 2,
											mouseY: event.clientY - 4,
											sensor,
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
		<>
			<Sidebar
				activeSensor={activeSensor}
				setActiveSensor={setActiveSensor}
				width={drawerWidth}
				flyToCoords={flyToCoords}
			/>
			<Menu
				open={contextMenu !== null}
				onClose={() => setContextMenu(null)}
				anchorReference="anchorPosition"
				anchorPosition={
					contextMenu !== null
						? { top: contextMenu.mouseY, left: contextMenu.mouseX }
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
			<Tooltip title="Reload sensor locations" placement="left">
				<Fab
					disabled={!sensors}
					sx={{
						position: "absolute",
						right: (theme) => theme.spacing(2),
						bottom: (theme) => theme.spacing(2),
						zIndex: (theme) => theme.zIndex.drawer + 1,
					}}
					color="primary"
					aria-label="reload sensor lcoations"
					onClick={() => {
						setSensors(null);
						loadSensorLocations();
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>
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

export default App;
