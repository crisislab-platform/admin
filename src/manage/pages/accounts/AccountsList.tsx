import {
	Alert,
	AlertTitle,
	Avatar,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
} from "@mui/material";
import { generateAvatar, usersAPIBase } from "../../../utils";

import { LoadingSpinner } from "../../../components";
import { Role } from "../../../types";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";

export function AccountsList() {
	const { user } = useAuth();
	const accountsQuery = useQuery(
		"accounts",
		async (): Promise<
			{
				name?: string;
				email: string;
				roles: Role[];
				picture: string;
			}[]
		> => {
			const response = await fetch(usersAPIBase, {
				headers: { Authorization: `Bearer ${user.token}` },
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
		},
	);

	if (accountsQuery.isLoading) {
		return <LoadingSpinner addPadding message="Loading users" />;
	}

	if (accountsQuery.isError) {
		return (
			<Alert severity="error" sx={{ m: 2 }}>
				<AlertTitle>Failed to load users.</AlertTitle>
				{(accountsQuery.error as any)?.message ||
					accountsQuery.error + ""}
			</Alert>
		);
	}

	return (
		<List>
			{accountsQuery.data.map((account) => (
				<ListItemButton
					key={account.email}
					component={RouterLink}
					to={`./${btoa(account.email)}`}>
					<ListItemAvatar>
						<Avatar
							src={account.picture}
							alt={account.name || account.email}
						/>
					</ListItemAvatar>
					<ListItemText
						primary={account.name || account.email}
						secondary={account.name ? account.email : undefined}
					/>
				</ListItemButton>
			))}
		</List>
	);
}
