import { Button, GridLegacy as Grid, Stack } from "@mui/material";

import { AccountsList } from "./AccountsList";
import { CreateAccountDialog } from "./CreateAccountDialog";
import { Outlet } from "react-router";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import useAuth from "../../../auth/useAuth";
import { useState } from "react";
import { userHasPermission, useToolbarHeight } from "../../../utils";

export function AccountsPage() {
	const { user } = useAuth();
	const [createAccountPopupOpen, setCreateAccountPopupOpen] = useState(false);
	const toolbarHeight = useToolbarHeight();

	function onCreateAccountPopupClose() {
		setCreateAccountPopupOpen(false);
	}

	return (
		<Grid
			container
			sx={{
				height: `calc(100vh - ${toolbarHeight}px)`,
				maxHeight: `calc(100vh - ${toolbarHeight}px)`,
				w: "100%",
				flex: "1",
			}}>
			<Grid
				item
				xs={12}
				md={6}
				sx={{
					height: "100%",
					maxHeight: "100%",
					overflow: "auto",
					borderRight: (theme) =>
						`1px solid ${theme.palette.divider}`,
				}}>
				<Stack>
					{userHasPermission(user, "users:write") && (
						<Stack
							direction="row"
							padding={1}
							gap={1}
							alignItems="center"
							flexWrap="wrap">
							<Button
								sx={{ ml: "auto" }}
								variant="contained"
								size="small"
								startIcon={<PersonAddIcon />}
								onClick={() => setCreateAccountPopupOpen(true)}>
								Create account
							</Button>
							<CreateAccountDialog
								open={createAccountPopupOpen}
								onClose={onCreateAccountPopupClose}
							/>
						</Stack>
					)}
					<AccountsList />
				</Stack>
			</Grid>
			<Grid
				item
				sx={{
					height: "100%",
					maxHeight: "100%",
					overflow: "auto",
				}}
				xs={12}
				md={6}
				p={1}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
