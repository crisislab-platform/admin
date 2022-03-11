import { Divider, Grid, useMediaQuery, useTheme } from "@mui/material";

import { AccountsList } from "./AccountsList";
import { Outlet } from "react-router-dom";

export function AccountsPage() {
	// emFkZUB2aWdnZXJzLm5ldA==
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: 1 }}>
			<Grid item xs={12} md={6}>
				<AccountsList />
			</Grid>
			<Grid item xs={12} md={6} p={2}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
