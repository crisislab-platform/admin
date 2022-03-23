import {
	FilterRuleOperation,
	RawRole,
	Role,
	Sensor,
	SensorID,
	SensorType,
} from "./types";

import { generateFromString } from "generate-avatar";

export const APIBase = "https://shakemap.benhong.me/api/v1";
export const usersAPIBase = `${APIBase}/users`;
export const sensorsAPIBase = `${APIBase}/sensors`;

export function generateAvatar(email: string) {
	return `data:image/svg+xml;utf8,${generateFromString(email)}`;
}

export const roles: Record<RawRole, Role> = {
	"users:read": { raw: "users:read", text: "View accounts" },
	"users:write": {
		raw: "users:write",
		text: "Create, modify, or delete accounts",
	},
	"sensors:read": { raw: "sensors:read", text: "View sensors" },
	"sensors:write": {
		raw: "sensors:write",
		text: "Create, modify, or delete sensors",
	},
};

// ~Center of New Zealand
export const defaultPosition: [number, number] = [174.8, -41.325];

export const mapURL = "https://shakemap.crisislab.org.nz";

export const sensorMenuTypes: SensorType[] = [
	"Android phone",
	"Raspberry Shake 4D",
	"Raspberry Shake 3D",
	"Raspberry Shake 1D",
	"Raspberry Boom",
	"Raspberry Shake and Boom",
];

export function generateSensorSetupCommand(sensorToken: string) {
	return `curl -s https://raw.githubusercontent.com/rs-Web-Interface-CRISiSLab/pishake-client/main/setup.sh | sudo bash /dev/stdin ${sensorToken}`;
}

export const verifiedEmails = [
	"zade@viggers.net",
	"benjamin.hong476@gmail.com",
];

export const filterRuleOperations: FilterRuleOperation[] = [
	"equals",
	"greater-than",
	"less-than",
	"includes",
];

export const filterRuleSensorProperties: (keyof Sensor)[] = [
	"online",
	"latitude",
	"id",
	"type",
	"name",
	"elevation",
	"total_floors",
	"on_floor",
];

export function getNextSensorID(sensors: Record<SensorID, Sensor>): SensorID {
	const sensordIDs = Object.keys(sensors);
	let unusedIDs = [];
	for (const sensorId of sensordIDs) {
		const prevID = Number(sensorId) - 1 + "";
		if (prevID !== "0" && !sensordIDs.includes(prevID)) {
			unusedIDs.push(prevID);
		}
	}
	unusedIDs.push(Number(sensordIDs[sensordIDs.length - 1]) + 1 + "");
	return unusedIDs[0];
}

export const accountsQueryStaleTime = 10 * 60 * 1000; // 10 minutes

export function getObjectWithOnlyChangedProperties<T>(
	oldThing: T,
	newThing: T,
): object {
	let thing = {};
	for (const [key, value] of Object.entries(oldThing)) {
		if (newThing[key] !== value) {
			thing[key] = newThing[key];
		}
	}
	return thing;
}
