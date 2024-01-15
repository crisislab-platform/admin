import { useMediaQuery, useTheme } from "@mui/material";
import {
	FilterRuleOperation,
	Role,
	Sensor,
	SensorID,
	SensorType,
	User,
} from "./types";

import { generateFromString } from "generate-avatar";

export const APIOrigin = "https://crisislab-data.massey.ac.nz";
export const APIBase = `${APIOrigin}/api/v2`;
export const usersAPIBase = `${APIBase}/users`;
export const sensorsAPIBase = `${APIBase}/sensors`;

export function generateAvatar(email: string) {
	return `data:image/svg+xml;utf8,${generateFromString(email)}`;
}

export const roles: Record<string, Role> = {
	"users:read": { raw: "users:read", text: "View dashboard accounts" },
	"users:write": {
		raw: "users:write",
		text: "Create, modify, or delete dashboard accounts",
	},
	"users:issue_refresh_token": {
		raw: "users:issue_refresh_token",
		text: "Maintain perpetual access to an account",
	},
	"sensors:read": {
		raw: "sensors:read",
		text: "View sensitive sensor information, like real locations and IPs",
	},
	"sensors:write": {
		raw: "sensors:write",
		text: "Create, modify, or delete sensors",
	},
	"sensors:online": {
		raw: "sensors:online",
		text: "Update online status of sensors (only used by server)",
	},
	"sensor-data:bulk-export": {
		raw: "sensor-data:bulk-export",
		text: "Export bulk stored sensor data",
	},
	"sensor-data:db-size": {
		raw: "sensor-data:db-size",
		text: "Query size of database",
	},
};

export function userHasPermission(
	user: User | null | undefined,
	permission: keyof typeof roles,
): Boolean {
	if (!user) return false;

	if (!user.roles.find((r) => r.raw == permission)) return false;
	return true;
}

export function setQueryParams(params: Record<string, string | null>) {
	const newURL = new URL(location.toString());

	for (const [key, value] of Object.entries(params)) {
		if (value === null) {
			newURL.searchParams.delete(key);
		} else {
			newURL.searchParams.set(key, value);
		}
	}

	history.replaceState(null, "", newURL);
}

// ~Center of New Zealand
export const defaultPosition: [number, number] = [174.8, -41.325];

export const mapURL = "https://shakemap.crisislab.org.nz";

export const sensorMenuTypes: SensorType[] = [
	"Raspberry Shake 4D",
	"Raspberry Shake and Boom",
	"Palert",
	"CSI",
	"Global Seismic Data",
	"CRISiSLab Sensor",
	// "Raspberry Shake 3D",
	// "Raspberry Shake 1D",
	// "Raspberry Boom",
	"Android Phone",
];

export const sensorTypeChannels: Record<SensorType, string[]> = {
	"Raspberry Shake 4D": ["EHZ", "ENN", "ENZ", "ENE"],
	"Raspberry Shake and Boom": ["EHZ", "HDF"],
	// Stop prettier from getting rid of brackets
	["Palert"]: ["ENN", "ENZ", "ENE"],
};

export function generateSensorSetupCommand(sensorToken: string) {
	return `curl -s https://raw.githubusercontent.com/rs-Web-Interface-CRISiSLab/pishake-client/main/setup.sh | sudo bash /dev/stdin ${sensorToken}`;
}

export const filterRuleOperations: FilterRuleOperation[] = [
	"equals",
	"greater-than",
	"less-than",
	"includes",
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

export function parseRoles(rolesToParse: any): Role[] {
	if (!rolesToParse) throw new Error("No roles provided");
	if (!Array.isArray(rolesToParse)) throw new Error("Roles must be an array");

	const parsedRoles: Role[] = rolesToParse
		.filter((role) => !!role && typeof role === "string")
		.map((role) => roles[role])
		.filter(
			(role) =>
				!!role &&
				"raw" in role &&
				"text" in role &&
				Object.keys(roles).includes(role.raw),
		);
	return parsedRoles;
}

export const useOnMobile = () => {
	const theme = useTheme();
	return useMediaQuery(theme.breakpoints.down("lg"));
};

export function formatBytes(bytes: number, decimals = 1) {
	// From https://stackoverflow.com/a/18650828

	if (!+bytes) return "0 bytes";

	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
}
