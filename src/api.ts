import { QueryClient } from "@tanstack/react-query";
import {
	Account,
	ChartMarker,
	ConfigurableSensorType,
	Sensor,
	SensorID,
	ServerAccount
} from "./types";
import {
	APIBase,
	generateAvatar,
	getObjectWithOnlyChangedProperties,
	parseRoles,
	sensorsAPIBase,
	sensorTypesAPIBase,
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
			picture: generateAvatar(newAccount.email ?? ""),
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
): (sensor: Sensor) => Promise<Sensor> {
	return async (sensor) => {
		// Frontend hack because I'm too lazy to redeploy the server
		// This removes the ID from the sensor object so that the
		// server autogenerates one
		const { id, ...remainingSensor } = sensor;
		const response = await fetch(`${sensorsAPIBase}`, {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "POST",
			body: JSON.stringify(remainingSensor),
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok (${response.status}: ${
					response.statusText
				})${data ? ` ${data}` : ""}`,
			);
		}
		const createdID = Number(await response.text());
		return { ...remainingSensor, id: createdID };
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

export function makeFetchChartMarkers(
	token?: string,
): () => Promise<ChartMarker[]> {
	return async () => {
		const response = await fetch(APIBase + "/charts/markers", {
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

export async function createMarker(
	token: string,
	data: Omit<Omit<ChartMarker, "id">, "enabled">,
): Promise<ChartMarker> {
	const response = await fetch(APIBase + "/charts/markers", {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		method: "POST",
		body: JSON.stringify(data),
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

	return { enabled: true, ...data, id };
}

export async function updateMarker(
	token: string,
	id: number,
	data: Partial<ChartMarker>,
) {
	const response = await fetch(APIBase + "/charts/markers/" + id, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		method: "PATCH",
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const data = await response.text();
		throw new Error(
			`Network response was not ok (${response.status}: ${
				response.statusText
			})${data ? ` ${data}` : ""}`,
		);
	}
}

export async function deleteMarker(token: string, id: number) {
	const response = await fetch(APIBase + "/charts/markers/" + id, {
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
}

export function makeFetchSensorTypes(
	token?: string,
): () => Promise<ConfigurableSensorType[]> {
	return async () => {
		try {
			const response = await fetch(sensorTypesAPIBase, {
				headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			});
			
			// Handle 404 - endpoint doesn't exist on this server version
			if (response.status === 404) {
				console.warn("Sensor types endpoint not found - server may be outdated");
				return [];
			}
			
			if (!response.ok) {
				const data = await response.text();
				throw new Error(
					`Network response was not ok (${response.status}: ${
						response.statusText
					})${data ? ` ${data}` : ""}`,
				);
			}
			
			const result = await response.json();
			const sensorTypes = result.sensorTypes || result || [];
			
			// Validate and normalize the data
			const normalized = sensorTypes.map((sensorType: any): ConfigurableSensorType => {
				// Handle malformed sensor type data
				if (!sensorType || typeof sensorType !== 'object') {
					console.warn("Invalid sensor type data:", sensorType);
					return { name: "Unknown", channels: [], response: null };
				}
				
				const name = typeof sensorType.name === 'string' ? sensorType.name : 'Unknown';
				const sensorResponse =
					typeof sensorType.response === "string"
						? sensorType.response
						: null;
				let channels: { id: string; name: string }[] = [];
				
				// Handle various channel data formats
				if (Array.isArray(sensorType.channels)) {
					channels = sensorType.channels.map((channel: any) => {
						if (typeof channel === 'object' && channel.id && channel.name) {
							return {
								id: String(channel.id),
								name: String(channel.name)
							};
						}
						// Handle legacy format or malformed data
						return { id: "unk", name: "Unknown Channel" };
					}).filter(channel => channel.id && channel.name);
				} else if (typeof sensorType.channels === 'string') {
					// Handle case where server returns channels as JSON string
					try {
						const parsedChannels = JSON.parse(sensorType.channels);
						if (Array.isArray(parsedChannels)) {
							channels = parsedChannels.map((channel: any) => {
								if (typeof channel === 'object' && channel.id && channel.name) {
									return {
										id: String(channel.id),
										name: String(channel.name)
									};
								}
								return { id: "unk", name: "Unknown Channel" };
							}).filter(channel => channel.id && channel.name);
						}
					} catch (e) {
						console.warn("Failed to parse channels JSON string:", sensorType.channels);
					}
				}
				
				return { name, channels, response: sensorResponse };
			});
			
			return normalized;
		} catch (error) {
			// Handle network errors, server unavailable, etc.
			console.warn("Failed to fetch sensor types:", error);
			return [];
		}
	};
}

export async function createSensorType(
	token: string,
	name: string,
	data: Omit<ConfigurableSensorType, "name">,
): Promise<ConfigurableSensorType> {
	const requestBody = JSON.stringify(data);
	
	const response = await fetch(sensorTypesAPIBase + "/" + encodeURIComponent(name), {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		method: "PUT",
		body: requestBody,
	});
	if (!response.ok) {
		const errorData = await response.text();
		if (response.status === 404) {
			throw new Error("This server does not support sensor types management. Please update the server.");
		}
		throw new Error(
			`Failed to create sensor type (${response.status}: ${
				response.statusText
			})${errorData ? ` - ${errorData}` : ""}`,
		);
	}

	let result;
	try {
		result = await response.json();
	} catch (e) {
		result = null;
	}
	
	return result || { name, ...data };
}

export async function updateSensorType(
	token: string,
	name: string,
	data: Omit<ConfigurableSensorType, "name">,
): Promise<ConfigurableSensorType> {
	const response = await fetch(sensorTypesAPIBase + "/" + encodeURIComponent(name), {
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		method: "PUT",
		body: JSON.stringify(data),
	});
	if (!response.ok) {
		const errorData = await response.text();
		if (response.status === 404) {
			throw new Error("This server does not support sensor types management. Please update the server.");
		}
		throw new Error(
			`Failed to update sensor type (${response.status}: ${
				response.statusText
			})${errorData ? ` - ${errorData}` : ""}`,
		);
	}

	const result = await response.json();
	return result || { name, ...data };
}

export async function deleteSensorType(token: string, name: string) {
	const response = await fetch(sensorTypesAPIBase + "/" + encodeURIComponent(name), {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined,
		method: "DELETE",
	});
	if (!response.ok) {
		const data = await response.text();
		if (response.status === 404) {
			throw new Error("This server does not support sensor types management. Please update the server.");
		}
		throw new Error(
			`Failed to delete sensor type (${response.status}: ${
				response.statusText
			})${data ? ` - ${data}` : ""}`,
		);
	}
}


export async function updateDataRetentionPolicy(
	token: string,
	policy: string,
) {
	const response = await fetch(APIBase + "/db/retention-policy", {
		headers: {
			Authorization: `Bearer ${token}`,
		},
		method: "PATCH",
		body: policy,
	});
	if (!response.ok) {
		const data = await response.text();
		if (response.status === 404) {
			throw new Error("This server does not support retention policies. Please update the server.");
		}
		throw new Error(
			`Failed to change data retention policy (${response.status}: ${
				response.statusText
			})${data ? ` - ${data}` : ""}`,
		);
	}
}

export function makeFetchDataRetentionPolicy(
	token?: string,
): () => Promise<string> {
	return async () => {
		const response = await fetch(APIBase + "/db/retention-policy", {
			headers: token ? { Authorization: `Bearer ${token}` } : undefined,
			method: "GET"
		});
		if (!response.ok) {
		const data = await response.text();
		if (response.status === 404) {
			throw new Error("This server does not support retention policies. Please update the server.");
		}
		throw new Error(
			`Failed to get current retention policy (${response.status}: ${
				response.statusText
			})${data ? ` - ${data}` : ""}`,
		);
	}

		return await response.text();
	};
}
