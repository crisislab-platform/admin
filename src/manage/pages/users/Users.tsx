import { Alert, AlertTitle } from "@mui/material";

import { LoadingSpinner } from "../../../components";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";
import { usersAPIBase } from "../../../utils";

export function UsersPanel() {
	const { user } = useAuth();
	const accountsQuery = useQuery("accounts", async () => {
		const response = await fetch(usersAPIBase, {
			headers: { Authorization: `Bearer ${user.token}` },
		});
		if (!response.ok) {
			const data = await response.text();
			throw new Error(
				`Network response was not ok${data ? ` ${data}` : ""}`,
			);
		}
		return response.json();
	});

	if (accountsQuery.isLoading) {
		return <LoadingSpinner addPadding message="Loading users" />;
	}

	if (accountsQuery.isError) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				<AlertTitle>Failed to load users</AlertTitle>
				{(accountsQuery.error as any)?.message ||
					accountsQuery.error + ""}
			</Alert>
		);
	}

	return <>Users</>;
}
