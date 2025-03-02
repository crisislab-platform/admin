import {
	Alert,
	AlertTitle,
	Avatar,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	Tooltip,
} from "@mui/material";
import { useParams } from "react-router";
import { accountsQueryStaleTime } from "../../../utils";

import { LinkWithQuery, LoadingSpinner } from "../../../components";
import TickIcon from "@mui/icons-material/VerifiedUser";
import { makeFetchAccounts } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";

export function AccountsList() {
	const { user } = useAuth();
	const { accountID: encodedSelectedAccountID } = useParams();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user?.token), {
		staleTime: accountsQueryStaleTime,
	});

	const selectedAccountID = encodedSelectedAccountID
		? decodeURIComponent(encodedSelectedAccountID)
		: null;

	if (accountsQuery.isLoading) {
		return <LoadingSpinner addPadding message="Loading accounts" />;
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
			{(accountsQuery.data ?? []).map((account) => (
				<ListItemButton
					key={account.email}
					component={LinkWithQuery}
					to={`./${encodeURIComponent(account.email)}`}
					selected={selectedAccountID === account.email}>
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
					{user && "verified" in user && "verified" in account && (
						<Tooltip title="Verified user">
							<TickIcon />
						</Tooltip>
					)}
				</ListItemButton>
			))}
		</List>
	);
}
