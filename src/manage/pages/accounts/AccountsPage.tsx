import {
	Autocomplete,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Stack,
	TextField,
	useMediaQuery,
	useTheme,
} from "@mui/material";

import { AccountsList } from "./AccountsList";
import { Outlet } from "react-router-dom";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { roles } from "../../../utils";
import { useState } from "react";

export function AccountsPage() {
	// emFkZUB2aWdnZXJzLm5ldA==
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("md"));
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
							sx={{ ml: "auto" }}
							variant="contained"
							startIcon={<PersonAddIcon />}
							onClick={() => setCreateAccountPopupOpen(true)}>
							Create account
						</Button>
						<Dialog
							open={createAccountPopupOpen}
							onClose={onCreateAccountPopupClose}>
							<DialogTitle>Create account</DialogTitle>
							<DialogContent>
								<TextField
									autoFocus
									margin="dense"
									id="name"
									label="Full name"
									type="text"
									fullWidth
									variant="standard"
								/>
								<TextField
									margin="dense"
									id="email"
									label="Email address"
									type="email"
									fullWidth
									variant="standard"
								/>
								<Autocomplete
									options={roles}
									multiple
									id="roles"
									filterSelectedOptions
									renderInput={(params) => (
										<TextField
											{...params}
											label="Roles"
											margin="dense"
											variant="standard"
											fullWidth
										/>
									)}
								/>
							</DialogContent>
							<DialogActions>
								<Button onClick={onCreateAccountPopupClose}>
									Close
								</Button>
								<Button onClick={onCreateAccountPopupClose}>
									Create
								</Button>
							</DialogActions>
						</Dialog>
					</Stack>
					<AccountsList />
				</Stack>
			</Grid>
			<Grid item xs={12} md={6} p={2}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
