import { NavigateWithQuery } from "../components";
import React from "react";
import { useGetQueryParam } from "./utils";

const PasswordResetStartPage = React.lazy(() => import("./PasswordResetStart"));
const PasswordResetFinishPage = React.lazy(
	() => import("./PasswordResetFinish"),
);
const LoginLinkPage = React.lazy(() => import("./LoginLink"));
const LoginLinkFinishPage = React.lazy(() => import("./LoginLinkFinish"));
const LoginPage = React.lazy(() => import("./Login"));
const RegisterPage = React.lazy(() => import("./Register"));

export interface AuthRoute {
	path: string;
	component: any;
}
export const authRoutes: AuthRoute[] = [
	{
		path: "token-sign-in",
		component: <TokenSignIn />,
	},
	{
		path: "password-reset-start",
		component: <PasswordResetStartPage />,
	},
	{
		path: "password-reset-finish",
		component: <PasswordResetFinishPage />,
	},
	{
		path: "login-link",
		component: <LoginLinkPage />,
	},
	{
		path: "login-link-finish",
		component: <LoginLinkFinishPage />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];

function TokenSignIn() {
	const type = useGetQueryParam("type");
	if (type === "reset") {
		return <NavigateWithQuery to="../password-reset-finish" />;
	}
	if (type === "sign-in") {
		return <NavigateWithQuery to="../login-link-finish" />;
	}
	if (type === "welcome") {
		return <NavigateWithQuery to="/" />;
	}
	return <p>Something has gone terribly wrong: Unknown type query param</p>;
}
