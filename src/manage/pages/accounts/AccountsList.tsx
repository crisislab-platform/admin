import {
	Alert,
	AlertTitle,
	Avatar,
	List,
	ListItemAvatar,
	ListItemButton,
	ListItemText,
	useMediaQuery,
	useTheme,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";

import { LoadingSpinner } from "../../../components";
import { makeFetchAccounts } from "../../../api";
import useAuth from "../../../auth/useAuth";
import { useQuery } from "react-query";

export function AccountsList({
	onMobileSelect,
}: {
	onMobileSelect?: (email: string) => void;
}) {
	const { user } = useAuth();
	const { accountID: encodedSelectedAccountID } = useParams();
	const accountsQuery = useQuery("accounts", makeFetchAccounts(user.token));
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));

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
			{accountsQuery.data.map((account) => (
				<ListItemButton
					key={account.email}
					component={RouterLink}
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
				</ListItemButton>
			))}
		</List>
	);
}
