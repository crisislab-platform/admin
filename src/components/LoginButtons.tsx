import {
	Box,
	Button,
	CircularProgress,
	Fab,
	Tooltip,
	Typography,
} from "@mui/material";

import { LoadingSpinner } from "./LoadingSpinner";
import LoginIcon from "@mui/icons-material/VpnKey";
import LogoutIcon from "@mui/icons-material/Logout";
import { Role } from "../types";
import useAuth from "../auth/useAuth";

export function LoginButton({ message }: { message?: string }) {
	const { logout, loading, user, goToLogin } = useAuth();

	return (
		<>
			{!!user && message && <Typography>{message}</Typography>}
			{loading ? (
				<LoadingSpinner color="secondary" />
			) : (
				<Button
					color="secondary"
					endIcon={!!user ? <LogoutIcon /> : <LoginIcon />}
					variant="contained"
					onClick={() => (!!user ? logout() : goToLogin())}>
					{!!user ? "Log out" : "Log in"}
				</Button>
			)}
		</>
	);
}

export function LoginFab({ message }: { message?: string }) {
	const { logout, goToLogin, loading, user } = useAuth();

	return loading ? (
		<Fab size="small" color="secondary" disabled>
			<CircularProgress size={20} color="secondary" />
		</Fab>
	) : (
		<Tooltip title={message || !!user ? "Log out" : "Log in"}>
			<Fab
				size="small"
				color="secondary"
				onClick={() => (!!user ? logout() : goToLogin())}>
				{!!user ? <LogoutIcon /> : <LoginIcon />}
			</Fab>
		</Tooltip>
	);
}

export function MissingRole({ role }: { role: Role }) {
	const { user } = useAuth();
	return (
		<Box>
			<Typography>
				You do not have the required role to acces this:{" "}
				<code>{role}</code>.
			</Typography>
			{!user && (
				<LoginButton message="You might have the rol required to view this if you log in." />
			)}
		</Box>
	);
}
