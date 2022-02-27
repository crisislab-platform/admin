import { apiBase, decodeJWT } from "./utils";

import { User } from "../types";

const APIBase = `https://shakemap.benhong.me/api/v1/auth`;

export async function login(token: string): Promise<User>;
export async function login(username: string, password: string): Promise<User>;
export async function login(arg1: string, arg2?: string): Promise<User> {
	if (arg2 === undefined) {
		// The function has been given a token
		const token: string = arg1;
		return { ...decodeJWT(token), token };
	} else {
		// The function has been given a username and password
		const email: string = arg1;
		const password: string = arg2;
		try {
			const response = await fetch(`${APIBase}/password`, {
				body: JSON.stringify({ email, password }),
				method: "POST",
			});
			if (response.status !== 200) {
				let message = "";
				try {
					message = ` ${await response.text()}.`;
				} catch (_) {}
				throw new Error(
					`E: Non-200 status code returned from server.${message} ${response.status} (${response.statusText})`,
				);
			}
			try {
				const data = await response.json();
				return { ...decodeJWT(data.token), token: data.token };
			} catch (error) {
				throw new Error(
					`E: Failed to decode data from server. ${error}`,
				);
			}
		} catch (error) {
			// Don't double-handle errors
			if (typeof error === "string" && error.startsWith("E:")) {
				throw new Error(error);
			}

			throw new Error(`E: Failed to authenticate with server. ${error}`);
		}
	}
}

export async function sendLink(
	email: string,
	type: "welcome" | "sign-in" | "reset",
	returnTo?: string | null,
) {
	try {
		const response = await fetch(
			`${apiBase}/link/${email}/${type}${
				!!returnTo ? `?return_to=${returnTo}` : ""
			}`,
			{ method: "GET" },
		);
		if (response.status !== 200) {
			let message = "";
			try {
				message = ` ${await response.text()}.`;
			} catch (_) {}
			throw new Error(
				`E: Non-200 status code returned from server.${message} ${response.status} (${response.statusText})`,
			);
		}
	} catch (error) {
		// Don't double-handle errors
		if (typeof error === "string" && error.startsWith("E:")) {
			throw new Error(error);
		}
		throw new Error(`E: Failed to get the server to send a link. ${error}`);
	}
}

export async function resetPassword(password: string, token: string) {
	try {
		const response = await fetch(`${apiBase}/reset-password`, {
			method: "POST",
			body: JSON.stringify({
				password,
			}),
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (response.status !== 200) {
			let message = "";
			try {
				message = ` ${await response.text()}.`;
			} catch (_) {}
			throw new Error(
				`E: Non-200 status code returned from server.${message} ${response.status} (${response.statusText})`,
			);
		}
	} catch (error) {
		// Don't double-handle errors
		if (typeof error === "string" && error.startsWith("E:")) {
			throw new Error(error);
		}
		throw new Error(
			`E: Failed to get the server to change password. ${error}`,
		);
	}
}
