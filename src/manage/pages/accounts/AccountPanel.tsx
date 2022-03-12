import {
	Alert,
	AlertTitle,
	Avatar,
	Box,
	List,
	ListItem,
	ListItemText,
	Stack,
	Typography,
} from "@mui/material";

import { LoadingSpinner } from "../../../components";
import { makeFetchAccounts } from "./api";
import useAuth from "../../../auth/useAuth";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

export function AccountPanel() {
	const { user } = useAuth();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
	const { accountID: encodedAccountID } = useParams();

	const accountID = encodedAccountID
		? decodeURIComponent(encodedAccountID)
		: null;

	if (accountsQuery.isLoading) {
		return <LoadingSpinner message="Loading account details" />;
	}
	if (accountsQuery.isError) {
		return (
			<Alert severity="error">
				<AlertTitle>Error loading account details.</AlertTitle>
				{accountsQuery.error}
			</Alert>
		);
	}

	const account = accountsQuery.data.find(
		(account) => account.email === accountID,
	);

	if (!account) {
		return (
			<Alert severity="warning">
				<AlertTitle>No matching user found.</AlertTitle>
				If you copied the URL from somewhere, make sure that you didin't
				miss any characters.
			</Alert>
		);
	}

	return (
		<Stack>
			<Stack alignItems="center" gap={2}>
				<Avatar
					src={account.picture}
					alt={account.name || account.picture}
					sx={{ width: 160, height: 160 }}
				/>
				<Typography variant="h2">
					{account.name || account.email}
				</Typography>
				{account.name && (
					<Typography variant="subtitle1">{account.email}</Typography>
				)}
			</Stack>
			<Typography variant="h6">Roles:</Typography>
			<List>
				{account.roles.map((role) => (
					<ListItem key={role.raw} disableGutters>
						<ListItemText
							primary={role.text + "."}
							secondary={role.raw}
						/>
					</ListItem>
				))}
			</List>
		</Stack>
	);
}
