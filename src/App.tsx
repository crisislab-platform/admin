import mapboxgl, {
	Map as MapboxMap,
	Marker,
	NavigationControl,
} from "mapbox-gl";
import { useEffect, useRef, useState } from "react";

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

	// Initialize map when component mounts
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
					marker.getElement().addEventListener("click", () => {
						console.log(`Sensor ${sensor.id} clicked`);
						setActiveSensor(sensor);
						if (map) {
							flyToCoords(sensor.longitude, sensor.latitude);
						}
					});
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
