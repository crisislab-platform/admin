import { Menu, MenuItem, Typography } from "@mui/material";
import { MouseEvent, useEffect, useRef, useState } from "react";
import mapboxgl, {
	Map as MapboxMap,
	Marker,
	NavigationControl,
} from "mapbox-gl";

import CopyIcon from "@mui/icons-material/FileCopy";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { Sensor } from "./types";
import Sidebar from "./Sidebar";

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

function App() {
	const mapContainerRef = useRef<null | HTMLDivElement>(null);
	const [drawerWidth, setDrawerWidth] = useState(window.innerWidth / 3);
	const [sensors, setSensors] = useState<Sensor[]>([
		{ status: "offline", longitude: 174.8, latitude: -41.325, id: 2 },
		{ status: "online", longitude: 174.81, latitude: -41.326, id: 1 },
		{ status: "online", longitude: 174.82, latitude: -41.327, id: 0 },
	]);
	const [activeSensor, setActiveSensor] = useState<null | Sensor>(null);
	const [map, setMap] = useState<null | MapboxMap>(null);
	const [contextMenu, setContextMenu] = useState<{
		mouseX: number;
		mouseY: number;
		sensor: Sensor;
	} | null>(null);

	useEffect(() => {
		console.log("mapeffect");
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
				console.log("map removed");
				map?.remove();
			};
		}
	}, []);

	useEffect(() => {
		let markers: Marker[] = [];
		console.log("effect");
		if (map) {
			console.log("map");
			sensors.map((sensor) => {
				console.log(sensor.id);
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
						console.log(`Sensor ${sensor.id} clicked`);
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
								contextMenu.sensor.id,
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
