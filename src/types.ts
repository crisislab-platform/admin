export interface Sensor {
	status: "online" | "offline";
	lng: number;
	lat: number;
	id: number;
}
