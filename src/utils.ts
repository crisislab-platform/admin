import { RawRole, Role } from "./types";

import { generateFromString } from "generate-avatar";

export const APIBase = "https://shakemap.benhong.me/api/v1";
export const usersAPIBase = `${APIBase}/users`;
export const sensorsAPIBase = `${APIBase}/sensors`;

export function generateAvatar(email: string) {
	return `data:image/svg+xml;utf8,${generateFromString(email)}`;
}

export const roles: { [roleID: RawRole]: Role } = {
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
