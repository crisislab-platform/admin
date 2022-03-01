import { useEffect, useState } from "react";

import { useLocation } from "react-router-dom";

export const titleSuffix = " | CRISiSLab Shakemap auth";

export const apiBase = `https://shakemap.benhong.me/api/v1/auth`;

export function getQueryParam(paramName: string): null | string {
	const searchParams = new URL(window.location.href).searchParams;
	const param = searchParams.get(paramName);

	if (param) {
		const decoded = window.decodeURIComponent(param);
		if (decoded === "") {
			return "true";
		}
		return decoded;
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
	return param;
}
