import { decodeJWT } from "./utils";

const APIBase = `https://shakemap.benhong.me/api/v1/auth`;

interface User {
	email: string;
}

export async function login(token: string): Promise<User>;
export async function login(username: string, password: string): Promise<User>;
export async function login(arg1: string, arg2?: string): Promise<User> {
	if (arg2 === undefined) {
		// The function has been given a token
		const token: string = arg1;
		return decodeJWT(token);
	} else {
		// The function has been given a username and password
		const username: string = arg1;
		const password: string = arg2;
		try {
			const response = await fetch(`${APIBase}/password`, {
				body: JSON.stringify({ username, password }),
			});
			try {
				const data = await response.json();
				return data;
			} catch (error) {
				throw new Error(`Failed to decode data from server. ${error}`);
			}
		} catch (error) {
			throw new Error(
				`Failed so far to authenticate with server. ${error}`,
			);
		}
	}
}
