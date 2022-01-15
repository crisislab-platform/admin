export interface Sensor {
	status: "online" | "offline";
	longitude: number;
	latitude: number;
	id: number | string;
	type?: "android" | "raspberry-pi";
	name?: string;
}
export interface MotionData {
	time: number;
	value: number;
}
