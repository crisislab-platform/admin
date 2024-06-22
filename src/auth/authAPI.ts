import { User } from "../types";
import { authAPIBase } from "./utils";

import {
	startAuthentication,
	startRegistration,
} from "@simplewebauthn/browser";

export async function login({
	email,
	conditionalUI,
}: {
	email?: string;
	conditionalUI?: boolean;
}): Promise<User> {
	const challenge = await fetch(
		`${authAPIBase}/login/challenge${email ? `?email=${email}` : ""}`,
	);

	let authResponse = await startAuthentication(
		await challenge.json(),
		conditionalUI,
	);

	const verificationRes = await fetch(`${authAPIBase}/login/verify`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(authResponse),
	});
	const verificationData = await verificationRes.json();
	// Show UI appropriate for the `verified` status
	if (verificationData && verificationData.verified) {
		return verificationData.user;
	} else {
		throw new Error(
			`Something went wrong! Res: ${JSON.stringify(verificationData)}`,
		);
	}
}

export async function addDevice({
	token,
	deviceName,
}: {
	token: string;
	deviceName: string;
}): Promise<User> {
	const challenge = await fetch(
		`${authAPIBase}/add_device/challenge?token=${token}`,
	);

	let authResponse;
	try {
		// Pass the options to the authenticator and wait for a response
		authResponse = await startRegistration(await challenge.json());
	} catch (err) {
		// Basic error handling
		if (err.name === "InvalidStateError") {
			throw new Error(
				"Error: Authenticator was probably already registered by user",
				{ cause: err },
			);
		}
		throw err;
	}

	const verificationRes = await fetch(`${authAPIBase}/add_device/verify`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ ...authResponse, nickname: deviceName }),
	});
	const verificationData = await verificationRes.json();
	// Show UI appropriate for the `verified` status
	if (verificationData && verificationData.verified) {
		return verificationData.user;
	} else {
		throw new Error(
			`Something went wrong! Res: ${JSON.stringify(verificationData)}`,
		);
	}
}
