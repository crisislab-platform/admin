import { Role } from "./types";
import { generateFromString } from "generate-avatar";

export const APIBase = "https://shakemap.benhong.me/api/v1";
export const usersAPIBase = `${APIBase}/users`;
export const sensorsAPIBase = `${APIBase}/sensors`;

export function generateAvatar(email: string) {
	return `data:image/svg+xml;utf8,${generateFromString(email)}`;
}

export const roles: Role[] = [
	"users:read",
	"users:write",
	"sensors:read",
	"sensors:write",
];
