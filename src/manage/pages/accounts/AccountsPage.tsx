import { Button, Grid, Stack } from "@mui/material";

import { AccountsList } from "./AccountsList";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { Outlet } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useState } from "react";

export function AccountsPage() {
	const [createAccountPopupOpen, setCreateAccountPopupOpen] = useState(false);

	function onCreateAccountPopupClose() {
		setCreateAccountPopupOpen(false);
	}

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: 1 }}>
			<Grid item xs={12} md={6}>
				<Stack>
					<Stack direction="row" sx={{ pt: 1 }}>
						<Button
							sx={{ mx: 1 }}
							variant="contained"
							startIcon={<PersonAddIcon />}
							onClick={() => setCreateAccountPopupOpen(true)}>
							Create account
						</Button>
						<CreateAccountDialog
							open={createAccountPopupOpen}
							onClose={onCreateAccountPopupClose}
						/>
					</Stack>
					<AccountsList />
				</Stack>
			</Grid>
			<Grid item xs={12} md={6} p={1}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
