import { QueryClient } from "react-query";
import { Account, Role, Sensor, SensorID, ServerAccount, User } from "./types";
import {
	generateAvatar,
	getObjectWithOnlyChangedProperties,
	parseRoles,
	sensorsAPIBase,
	usersAPIBase,
} from "./utils";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000, // One minute
		},
	},
});

export async function getRefreshToken(
	token: string,
	accountEmail: string,
): Promise<{ token: string; email: string }> {
	const response = await fetch(
		usersAPIBase + "/get-refresh-token/" + accountEmail,
		{ headers: { Authorization: `Bearer ${token}` } },
	);
	if (!response.ok) {
		const data = await response.text();
		throw new Error(
			`Error getting refresh token (${response.status}: ${
				response.statusText
			})${data ? ` ${data}` : ""}`,
		);
	}
	const data = await response.json();
	return data;
}

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
		return data.map((account) => {
			return {
				...account,
				roles: parseRoles(account.roles),
				picture: generateAvatar(account.email),
			};
		});
	};
}

export function makeCreateAccount(
	token?: string,
): (props: Omit<ServerAccount, "id">) => Promise<Account> {
	return async ({ name, email, roles }) => {
		const body = JSON.stringify({
			name,
			email,
			roles: roles.map((role) => role.raw),
		});
		const response = await fetch(usersAPIBase, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "POST",
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
		const data = (await response.json()) as ServerAccount;
		return {
			...data,
			picture: generateAvatar(email),
		};
	};
}
export function makeEditAccount(
	token?: string,
): (props: [ServerAccount, Partial<ServerAccount>]) => Promise<Account> {
	return async ([oldAccount, newAccount]) => {
		// Get an object with the properties that have changed
		let account: any = {
			...getObjectWithOnlyChangedProperties(oldAccount, newAccount),
			email: oldAccount.email,
		};
		if ("roles" in account) {
			account = {
				...account,
				roles: account.roles.map((role) => role.raw),
			};
		}

		const response = await fetch(`${usersAPIBase}/${oldAccount.id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "PATCH",
			body: JSON.stringify(account),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		const data = (await response.json()) as ServerAccount;

		return {
			...data,
			picture: generateAvatar(newAccount.email),
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
		const data = await response.json();

		// Make sure there are no missing IDs
		let newData: { sensors: Record<SensorID, Sensor>; timestamp: number } =
			{ timestamp: data.timestamp, sensors: {} };
		Object.entries(data.sensors).map((value) => {
			const [id, sensor] = value as unknown as [SensorID, Sensor];
			newData.sensors[id] = {
				...sensor,
				id: Number(id),
			};
		});
		return newData;
	};
}

export function makeCreateSensor(
	token?: string,
): (sensor: Omit<Sensor, "id">) => Promise<Sensor> {
	return async (sensor) => {
		const response = await fetch(`${sensorsAPIBase}`, {
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
		const id = Number(await response.text());
		return { ...sensor, id };
	};
}

export function makeEditSensor(
	token?: string,
): (props: Sensor) => Promise<Sensor> {
	return async (newSensor) => {
		// Get an object with the properties that have changed

		const response = await fetch(`${sensorsAPIBase}/${newSensor.id}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "PATCH",
			body: JSON.stringify(newSensor),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		return newSensor;
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

export function makeGetSensorToken(
	id: SensorID,
	token?: string,
): () => Promise<{ token }> {
	return async () => {
		const response = await fetch(`${sensorsAPIBase}/${id}/token`, {
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
