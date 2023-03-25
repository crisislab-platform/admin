import { ReactNode } from "react";
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
	| "Raspberry Shake and Boom"
	| string;
export type SensorID = number;
export interface Sensor {
	online?: boolean;
	location?: {
		type: "Point";
		coordinates: [number?, number?];
	};
	id: SensorID;
	type?: SensorType;
	name?: string;
	elevation?: number;
	total_floors?: number;
	on_floor?: number;
	secondary_id?: string;
	port?: number;
	ip?: string;
}
export type SensorSortKey = "id" | "type" | "online";

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
