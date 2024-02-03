import { ReactElement, ReactNode } from "react";
import { SvgIcon } from "@mui/material";
import { roles } from "./utils";

export interface MotionData {
	time: number;
	value: number;
}

export type Role = {
	text: string;
	raw: keyof typeof roles;
};

export type Account = {
	id: number;
	name?: string;
	email: string;
	roles: Role[];
	picture: string;
};
export type ServerAccount = Omit<Account, "picture">;

export type User = Account & {
	token: string;
};

export type Route = {
	Element: () => JSX.Element;
	text: string;
	requiredRole: Role;
	slug: string;
	indexSlug?: string;
	subRoutes?: Route[];
};

export type SidebarLink = Route & {
	showInSidebar?: boolean;
	position?: number;
	Icon: typeof SvgIcon;
	ActiveIcon?: typeof SvgIcon;
	subRoutes?: (SidebarLink | Route)[];
};

export type SensorType =
	| "Android phone"
	| "Raspberry Shake 4D"
	| "Raspberry Shake 3D"
	| "Raspberry Shake 1D"
	| "Raspberry Boom"
	| "CRISiSLab Sensor"
	| string;

export type SensorID = number;
export interface Sensor {
	online?: boolean;
	location?: [number?, number?];
	public_location?: [number?, number?];
	id: number;
	type?: SensorType;
	name?: string;
	secondary_id?: string;
	ip?: string;
	contact_email?: string;
}
export type SensorSortKey = keyof Sensor;

export type ShakingDataChannel = "EHZ" | "ENE" | "ENZ" | "ENN";

export type FilterRuleOperation =
	| "equals"
	| "less-than"
	| "greater-than"
	| "includes";
export type FilterRule<T> = {
	property: keyof T;
	operation: FilterRuleOperation;
	reversed: boolean;
	value: string;
	id: string;
};
