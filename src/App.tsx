import { useEffect, useRef, useState } from "react";

import { Sensor } from "./types";
import Sidebar from "./Sidebar";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
	"pk.eyJ1IjoiemFkZXZpZ2dlcnMiLCJhIjoiY2t5YXRxeXU5MDF1cTJ3cXZoOW02cTJqNCJ9.bHkJaPz9D1xnGfuEU5mmFA";

function App() {
	const mapContainerRef = useRef<null | HTMLDivElement>(null);
	const [drawerWidth, setDrawerWidth] = useState(window.innerWidth / 3);
	const [sensors, setSensors] = useState<Sensor[]>([
		{ status: "offline", lng: 174.8, lat: -41.325, id: 2 },
		{ status: "online", lng: 174.81, lat: -41.326, id: 1 },
		{ status: "online", lng: 174.82, lat: -41.327, id: 0 },
	]);
	const [activeSensor, setActiveSensor] = useState<null | Sensor>(null);
	let map = useRef<null | mapboxgl.Map>(null).current;

	// Initialize map when component mounts
	useEffect(() => {
		if (mapContainerRef.current) {
			map = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: "mapbox://styles/mapbox/streets-v11",
				center: [174.8, -41.325],
				zoom: 10,
			});

			// Add navigation control (the +/- zoom buttons)
			map.addControl(new mapboxgl.NavigationControl(), "top-right");

			sensors.map((sensor) => {
				if (map) {
					const marker = new mapboxgl.Marker({
						color: sensor.status === "online" ? "green" : "red",
					})
						.setLngLat([sensor.lng, sensor.lat])
						.addTo(map);
					marker.getElement().addEventListener("click", () => {
						setActiveSensor(sensor);
						if (map) {
							// Center the map on the marker
							map.easeTo({
								center: [sensor.lng, sensor.lat],
								zoom: 14,
								duration: 2000,
							});
							// Account for the drawer overlapping lots of the page
							setTimeout(() => {
								if (map) {
									// I have no idea why dividing this by 2 centers it but it does
									map.panBy([drawerWidth / 2, 0]);
								}
							}, 2000);
						}
					});
				}
			});

			// Clean up on unmount
			return () => map?.remove();
		}
	}, [sensors]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<>
			<Sidebar
				activeSensor={activeSensor}
				setActiveSensor={setActiveSensor}
				width={drawerWidth}
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

export default App;
