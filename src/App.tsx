import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Button,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

interface Sensor {
	status: "online" | "offline";
	lat: number;
	lng: number;
	id: number;
}

function App() {
	const mapContainerRef = useRef<null | HTMLDivElement>(null);

	const [lng, setLng] = useState(5);
	const [lat, setLat] = useState(34);
	const [zoom, setZoom] = useState(1.5);
	const [sensors, setSensors] = useState<Sensor[]>([
		{ status: "online", lat: 11.65147, lng: 55.608166, id: 0 },
		{ status: "online", lat: 12.65147, lng: 55.608166, id: 1 },
		{ status: "offline", lat: 13.65147, lng: 55.608166, id: 2 },
	]);
	const [activeSensor, setActiveSensor] = useState<null | Sensor>(null);

	// Initialize map when component mounts
	useEffect(() => {
		if (mapContainerRef.current) {
			const map = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/streets-v11",
				center: [lng, lat],
				zoom: zoom,
			});

			// Add navigation control (the +/- zoom buttons)
			map.addControl(new mapboxgl.NavigationControl(), "top-right");

			map.on("move", () => {
				setLng(Number(map.getCenter().lng.toFixed(4)));
				setLat(Number(map.getCenter().lat.toFixed(4)));
				setZoom(Number(map.getZoom().toFixed(2)));
			});

			sensors.map((sensor) => {
				const marker = new mapboxgl.Marker({
					color: sensor.status === "online" ? "green" : "red",
				})
					.setLngLat([sensor.lng, sensor.lat])
					.addTo(map);
				marker.getElement().addEventListener("click", () => {
					setActiveSensor(sensor);
				});
			});

			// Clean up on unmount
			return () => map.remove();
		}
	}, [sensors]); // eslint-disable-line react-hooks/exhaustive-deps

	function onDialogClose() {
		setActiveSensor(null);
	}

	return (
		<>
			<Dialog
				open={!!activeSensor}
				onClose={onDialogClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description">
				<DialogTitle id="alert-dialog-title">
					Sensor information
				</DialogTitle>
				<DialogContent>
					<DialogContentText id="alert-dialog-description">
						{activeSensor && (
							<>
								ID: {activeSensor.id}
								<br />
								Status: {activeSensor.status}
								<br />
								Latitude: {activeSensor.lat}
								<br />
								Longatude: {activeSensor.lng}
								<br />
							</>
						)}
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={onDialogClose}>Close</Button>
				</DialogActions>
			</Dialog>
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
