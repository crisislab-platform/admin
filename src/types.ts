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
export type Role = `${Section}:${CRUDOp}`;

export type User = {
	roles: Role[];
	name?: string;
	email: string;
	token: string;
	picture?: string;
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

export interface Sensor {
	online?: boolean;
	longitude: number;
	latitude: number;
	id: number | string;
	type?: "android" | "raspberry-pi";
	name?: string;
}

export type ShakingDataChannel = "EHZ" | "ENE" | "ENZ" | "ENN";
