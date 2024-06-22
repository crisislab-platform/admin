import { User } from "../types";
import { authAPIBase } from "./utils";

import { startRegistration } from "@simplewebauthn/browser";

export async function login({ email }: { email: string }): Promise<User> {}

export async function addDevice({
	token,
	deviceName,
}: {
	token: string;
	deviceName: string;
}): Promise<User> {
	const challenge = await fetch(`${authAPIBase}/register/challenge`);
	const authResponse = await startRegistration(await challenge.json());
}
