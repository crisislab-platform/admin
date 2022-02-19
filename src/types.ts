import { User as Auth0User, IdToken } from "@auth0/auth0-react";

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
type CRUDOp = "create" | "read" | "update" | "delete";
type Section = "sensors";
export type Permission = "none" | "logged_in" | `${Section}:${CRUDOp}`;

export type AppUser = {
	isLoading: boolean;
	permissions: Permission[];
	login: () => void;
	logout: () => void;
} & (
	| {
			isLoggedIn: true;
			JWT: string | null;
			info?: Auth0User;
			claims: null | IdToken;
	  }
	| { isLoggedIn: false }
);
export type User = Auth0User;

export type Route = {
	Element: ReactNode;
	text: string;
	requiredPermission: Permission;
	slug: string;
	indexSlug?: string;
};
export type SidebarLink = Route & {
	Icon: typeof SvgIcon;
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
