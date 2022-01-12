export interface Sensor {
	status: "online" | "offline";
	longitude: number;
	latitude: number;
	id: number | string;
}
