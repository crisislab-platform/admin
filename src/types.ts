export interface Sensor {
	status: "online" | "offline";
	longitude: number;
	latitude: number;
	id: number | string;
}

export interface MotionData {
	time: number;
	value: number;
}
