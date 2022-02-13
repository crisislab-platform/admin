import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import React, { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import LoginIcon from "@mui/icons-material/VpnKey";
import MagicIcon from "@mui/icons-material/AutoFixHigh";
import PasswordIcon from "@mui/icons-material/Password";
import { titleSuffix } from "./utils";
import { useSnackbar } from "notistack";

const PasswordResetStartPage = React.lazy(() => import("./PasswordResetStart"));
const PasswordResetFinishPage = React.lazy(
	() => import("./PasswordResetFinish"),
);
const LoginPage = React.lazy(() => import("./Login"));
const MagicLinkPage = React.lazy(() => import("./MagicLink"));
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
		path: "magic-link",
		component: <MagicLinkPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];
