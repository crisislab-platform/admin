import { decodeJWT } from "./utils";

import { User } from "../types";
import { APIBase, parseRoles } from "../utils";

// This file just handles the API calls, all of the other logic (such as popups) is in useAuth.tsx

const authAPIBase = `${APIBase}/auth`;

export async function login(email: string, password: string): Promise<User> {
	try {
		const response = await fetch(`${authAPIBase}/password`, {
			body: JSON.stringify({ email, password }),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		});
		if (!response.ok) {
			let message = "";
			try {
				message = ` ${await response.text()}.`;
			} catch (_) {}
			throw new Error(
				`E: Non-ok status code returned from server.${message} ${response.status} (${response.statusText})`,
			);
		}
		try {
			const data = await response.json();
			const decoded = decodeJWT(data.token);
			return {
				...decoded,
				token: data.token,
				roles: parseRoles(decoded.roles),
			};
		} catch (error) {
			throw new Error(`E: Failed to decode data from server. ${error}`);
		}
	} catch (error) {
		// Don't double-handle errors
		if (typeof error === "string" && error.startsWith("E:")) {
			throw new Error(error);
		}

		throw new Error(`E: Failed to authenticate with server. ${error}`);
	}
}

export async function changePassword(opts: {
	newPassword: string;
	accountID: number;
	token: string;
}) {
	try {
		const response = await fetch(`${authAPIBase}/change-password`, {
			method: "PATCH",
			body: JSON.stringify({
				password: opts.newPassword,
				accountID: opts.accountID,
			}),
			headers: {
				Authorization: `Bearer ${opts.token}`,
				"Content-Type": "application/json",
			},
		});
		if (!response.ok) {
			let message = "";
			try {
				message = ` ${await response.text()}.`;
			} catch (_) {}
			throw new Error(
				`E: Non-ok status code returned from server.${message} ${response.status} (${response.statusText})`,
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
