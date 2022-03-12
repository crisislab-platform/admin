import { generateAvatar, usersAPIBase } from "../../../utils";

import { Role } from "../../../types";

export function makeFetchUsers(token: string): () => Promise<
	{
		name?: string;
		email: string;
		roles: Role[];
		picture: string;
	}[]
> {
	return async () => {
		const response = await fetch(usersAPIBase, {
			headers: { Authorization: `Bearer ${token}` },
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
			picture: generateAvatar(account.email),
		}));
	};
}
