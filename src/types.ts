export interface Sensor {
	status: "online" | "offline";
	lat: number;
	lng: number;
	id: number;
}
