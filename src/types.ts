import { ReactNode } from "react";
import { SvgIcon } from "@mui/material";

type ShakingDataLump = {
	d: number;
	t: number;
};
export interface MotionData {
	time: number;
	value: number;
}
type CRUDOp = "write" | "read";
type Section = "sensors" | "users";
export type RawRole = `${Section}:${CRUDOp}`;
export type Role = {
	text: string;
	raw: RawRole;
};

export type Account = {
	name?: string;
	email: string;
	roles: Role[];
	picture: string;
};

export type User = Account & {
	token: string;
};

export type Route = {
	Element: ReactNode;
	text: string;
	requiredRole: Role;
	slug: string;
	indexSlug?: string;
	subRoutes?: Route[];
};

export type SidebarLink = Route & {
	Icon: typeof SvgIcon;
	ActiveIcon?: typeof SvgIcon;
};

export type SensorID = number | string;
export interface Sensor {
	online?: boolean;
	longitude: number;
	latitude: number;
	id: SensorID;
	type?: "android" | "raspberry-pi";
	name?: string;
}

export type ShakingDataChannel = "EHZ" | "ENE" | "ENZ" | "ENN";
