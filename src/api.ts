import { Account, Role, Sensor, SensorID } from "./types";
import { generateAvatar, roles, sensorsAPIBase, usersAPIBase } from "./utils";

export function makeFetchAccounts(token?: string): () => Promise<Account[]> {
	return async () => {
		const response = await fetch(usersAPIBase, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		const data = await response.json();
		return data.map((account) => ({
			...account,
			roles: account.roles.map((role) => roles[role]),
			picture: generateAvatar(account.email),
		}));
	};
}

export function makeCreateAccount(
	token?: string,
): (props: {
	name?: string;
	email: string;
	roles: Role[];
}) => Promise<Account> {
	return async ({ name, email, roles }) => {
		const body = JSON.stringify({
			name,
			email,
			roles: roles.map((role) => role.raw),
		});
		const response = await fetch(`${usersAPIBase}/${email}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "PUT",
			body,
		});

		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return {
			email,
			name,
			roles,
			picture: generateAvatar(email),
		};
	};
}

export function makeEditAccount(
	token?: string,
): (props: {
	name?: string;
	email: string;
	roles: Role[];
}) => Promise<Account> {
	return async ({ name, email, roles }) => {
		const response = await fetch(`${usersAPIBase}/${email}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "PUT",
			body: JSON.stringify({
				name,
				email,
				roles: roles.map((role) => role.raw),
			}),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return {
			email,
			name,
			roles,
			picture: generateAvatar(email),
		};
	};
}

export function makeDeleteAccount(
	token?: string,
): ({ email }: { email: string }) => Promise<void> {
	return async ({ email }) => {
		const response = await fetch(`${usersAPIBase}/${email}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "DELETE",
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
	};
}

export function makeFetchSensors(
	token?: string,
): () => Promise<{ sensors: Record<SensorID, Sensor>; timestamp: number }> {
	return async () => {
		const response = await fetch(sensorsAPIBase, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return await response.json();
	};
}

export function makeCreateSensor(
	token?: string,
): (props: Sensor) => Promise<Sensor> {
	return async (sensor) => {
		const response = await fetch(`${sensorsAPIBase}/${sensor.id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "POST",
			body: JSON.stringify(sensor),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return sensor;
	};
}

export function makeEditSensor(
	token?: string,
): (props: Sensor) => Promise<Sensor> {
	return async (sensor) => {
		const response = await fetch(`${usersAPIBase}/${sensor.id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "PATCH",
			body: JSON.stringify(sensor),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return sensor;
	};
}

export function makeDeleteSensor(
	token?: string,
): ({ id }: { id: SensorID }) => Promise<void> {
	return async ({ id }) => {
		const response = await fetch(`${sensorsAPIBase}/${id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "DELETE",
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
	};
}
