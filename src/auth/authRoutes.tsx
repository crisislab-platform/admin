import React from "react";

const PasswordResetStartPage = React.lazy(() => import("./PasswordResetStart"));
const PasswordResetFinishPage = React.lazy(
	() => import("./PasswordResetFinish"),
);
const LoginPage = React.lazy(() => import("./Login"));
const LoginLinkPage = React.lazy(() => import("./LoginLink"));
const RegisterPage = React.lazy(() => import("./Register"));

export interface AuthRoute {
	path: string;
	component: any;
}
export const authRoutes: AuthRoute[] = [
	{
		path: "password-reset-start",
		component: <PasswordResetStartPage />,
	},
	{
		path: "password-reset-finish",
		component: <PasswordResetFinishPage />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
	{
		path: "login-link",
		component: <LoginLinkPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];
