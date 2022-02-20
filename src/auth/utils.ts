import { useSnackbar } from "notistack";
import { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";

export const titleSuffix = " | CRISiSLab Shakemap auth";

export const apiBase = `https://shakemap.benhong.me/api/v1/auth`;

export function getReturnTo(): null | string {
	const searchParams = new URLSearchParams(window.location.href);
	const returnTo = searchParams.get("return_to");

	if (returnTo) {
		return window.decodeURIComponent(returnTo);
	}

	return null;
}

export function useGetReturnTo(): null | string {
	const location = useLocation();
	const memo = useMemo(getReturnTo, [location]);
	return memo;
}

export function useAuth() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const returnTo = useGetReturnTo();

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
			const data = await res.json();
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
				`${apiBase}/link/${email}/sign-in${
					returnTo !== null ? `?return_to=${returnTo}` : ""
				}`,
			);
			const data = await res.json();
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

	return { status, login, sendLoginLink, sendPasswordResetLink };
}
