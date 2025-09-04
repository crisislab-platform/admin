import { useMediaQuery, useTheme } from "@mui/material";
import {
	FilterRuleOperation,
	RawRole,
	Role,
	Sensor,
	User
} from "./types";

import { generateFromString } from "generate-avatar";

function getAPIOrigin() {
	if (window.location.search.includes("use-local-server")) {
		return "http://localhost:8080";
	}

	const customOrigin = localStorage.getItem("cl-custom-api-origin");
	if (customOrigin) {
		return customOrigin;
	}

	if (import.meta.env.VITE_DEFAULT_API_ORIGIN) {
		return import.meta.env.VITE_DEFAULT_API_ORIGIN;
	}

	// Fallback to official
	return "https://crisislab-data.massey.ac.nz";
}

export function setCustomAPIOrigin() {
	const newOrigin = prompt(
		"Enter custom API origin.\n\nInclude 'https://', but not '/api' or any path. (Do include ports if needed)\n\nLeave blank to remove custom API origin.\n\nThis will probably log you out. If something breaks, clear site data then reload.",
	)
		?.trim()
		?.toLowerCase();

	// User canceled action
	if (newOrigin === null || newOrigin === undefined) return;

	if (newOrigin === "") {
		localStorage.removeItem("cl-custom-api-origin");
	} else {
		localStorage.setItem("cl-custom-api-origin", newOrigin);
	}
	location.reload();
}

export const APIOrigin = getAPIOrigin();
export const APIBase = `${APIOrigin}/api/v2`;
export const usersAPIBase = `${APIBase}/users`;
export const sensorsAPIBase = `${APIBase}/sensors`;
export const sensorTypesAPIBase = `${APIBase}/sensor-types`;

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
	"charts:markers": {
		raw: "charts:markers",
		text: "Manage live chart markers",
	},
};

// Granted to all non-logged in public users automatically
export const publicPermissions: Role[] = [role("sensors:read")];

export function role(raw: RawRole): Role {
	return roles[raw];
}

export function userHasPermission(
	user: User | null | undefined,
	_permission: RawRole | Role,
): Boolean {
	const permission =
		typeof _permission === "string" ? role(_permission) : _permission;

	if (!user) return publicPermissions.includes(permission);

	if (!user.roles.find((r) => r.raw == permission.raw)) return false;
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

export const mapURL =
	import.meta.env.VITE_SHAKEMAP_ORIGIN || "https://shakemap.crisislab.org.nz";

export const sensorMenuBuiltinTypes = [
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
	"CRISiSLab Sensor V2",
];

export const filterRuleOperations: FilterRuleOperation[] = [
	"equals",
	"includes",
	"greater-than",
	"less-than",
];

export function getNextSensorID(sensors: Record<number, Sensor>): number {
	// const sensordIDs = Object.keys(sensors);
	// let unusedIDs = [];
	// for (const sensorId of sensordIDs) {
	// 	const prevID = Number(sensorId) - 1 + "";
	// 	if (prevID !== "0" && !sensordIDs.includes(prevID)) {
	// 		unusedIDs.push(prevID);
	// 	}
	// }
	// unusedIDs.push(Number(sensordIDs[sensordIDs.length - 1]) + 1 + "");
	// return unusedIDs[0];

	// Let the server figure it out idk
	return -1;
}

export const accountsQueryStaleTime = 10 * 60 * 1000; // 10 minutes

export function getObjectWithOnlyChangedProperties<
	T extends Record<string, any>,
>(oldThing: T, newThing: T): object {
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

export function useToolbarHeight() {
	const onMobile = useOnMobile();
	return onMobile ? 64 : 56;
}

