import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

export const titleSuffix = " | CRISiSLab Shakemap auth";

export const apiBase = `https://shakemap.benhong.me/api/v1/auth`;

export function getQueryParam(paramName: string): null | string {
	const searchParams = new URL(window.location.href).searchParams;
	const param = searchParams.get(paramName);

	if (param) {
		return window.decodeURIComponent(param);
	}

	return null;
}

export function decodeJWT(token: string) {
	const base64Url = token.split(".")[1];
	const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join(""),
	);

	return JSON.parse(jsonPayload);
}

export function showErrorSnackbar(
	enqueueSnackbar: (message: string, options: any) => void,
	error: any,
) {
	enqueueSnackbar(
		typeof error === "string"
			? error
			: "message" in error
			? error.message
			: error + "",
		{ variant: "error" },
	);
}

export function useGetQueryParam(paramName: string): null | string {
	const { search } = useLocation();
	const [param, setParam] = useState<null | string>(null);
	useEffect(() => {
		setParam(getQueryParam(paramName));
	}, [search]);
	console.log(param);
	return param;
}

export function useAuth() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const returnTo = useGetQueryParam("return_to");

	const [status, setStatus] = useState<
		"loading" | "logged_in" | "logged_out"
	>("logged_out");

	async function login(email: string, password: string): Promise<boolean> {
		setStatus("loading");
		let succeeded = false;
		try {
			const res = await fetch(`${apiBase}/password`, {
				body: JSON.stringify({ email, password }),
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
			});
			const data = await res.json();
			succeeded = true;
			console.log(data);
			enqueueSnackbar("Logged in successfully.", { variant: "success" });
			setStatus("logged_in");
		} catch (e) {
			console.info(`Error when trying to login: ${e}`, e);
			enqueueSnackbar("Error when logging in.", { variant: "error" });
			setStatus("logged_out");
		}
		return succeeded;
	}

	async function sendLoginLink(email: string): Promise<boolean> {
		setStatus("loading");
		let succeeded = false;
		try {
			const res = await fetch(
				`${apiBase}/link/${email}/sign-in${
					returnTo !== null ? `?return_to=${returnTo}` : ""
				}`,
			);
			const data = await res.text();
			succeeded = true;
			console.log(data);
			enqueueSnackbar("Magic link email sent.", {
				variant: "success",
			});
		} catch (e) {
			console.info(`Error when trying to send login link: ${e}`, e);
			enqueueSnackbar("Error sending login link email.", {
				variant: "error",
			});
		}
		setStatus("logged_out");
		return succeeded;
	}

	async function sendPasswordResetLink(email: string): Promise<boolean> {
		setStatus("loading");
		let succeeded = false;
		try {
			const res = await fetch(
				`${apiBase}/link/${email}/reset${
					returnTo !== null ? `?return_to=${returnTo}` : ""
				}`,
			);
			const data = await res.text();
			succeeded = true;
			console.log(data);
			enqueueSnackbar("Password reset email sent.", {
				variant: "success",
			});
		} catch (e) {
			console.info(
				`Error when trying to send password reset email: ${e}`,
				e,
			);
			enqueueSnackbar("Error sending password reset email.", {
				variant: "error",
			});
		}
		setStatus("logged_out");
		return succeeded;
	}

	async function updatePassword(
		password: string,
		token: string,
	): Promise<boolean> {
		setStatus("loading");
		let succeeded = false;
		try {
			const res = await fetch(
				`${apiBase}/reset-password${
					returnTo !== null ? `?return_to=${returnTo}` : ""
				}`,
				{
					body: JSON.stringify({ password }),
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (res.status === 200) {
				succeeded = true;
				enqueueSnackbar("Password updated.", {
					variant: "success",
				});
				setStatus("logged_in");
				const data = await res.text();
				console.log(data);
			} else {
				console.info(
					`Error ${res.status} (${res.statusText}) when trying to change password.`,
				);
			}
		} catch (e) {
			console.info(`Error when trying to update password: ${e}`, e);
			enqueueSnackbar("Error updating password.", {
				variant: "success",
			});
			setStatus("logged_out");
		}

		return succeeded;
	}

	return {
		status,
		login,
		sendLoginLink,
		sendPasswordResetLink,
		updatePassword,
	};
}
