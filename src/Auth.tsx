import { useAuth0 } from "@auth0/auth0-react";
import { Button, Box, Typography } from "@mui/material";
import { createContext, Dispatch, SetStateAction } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";

export function LoginButton({ message }: { message?: string }) {
	const { loginWithPopup } = useAuth0();
	return (
		<Box>
			{message && <Typography>{message}</Typography>}
			<Button
				endIcon={<LoginIcon />}
				variant="contained"
				onClick={() => loginWithPopup()}>
				Log in
			</Button>
		</Box>
	);
}

export function LogoutButton({ message }: { message?: string }) {
	const { logout } = useAuth0();
	return (
		<Box>
			{message && <Typography>{message}</Typography>}
			<Button
				endIcon={<LogoutIcon />}
				variant="contained"
				onClick={() => logout({ returnTo: window.location.origin })}>
				Log out
			</Button>
		</Box>
	);
}

export const JWTContext = createContext<
	[null | string, Dispatch<SetStateAction<string | null>>]
>([null, () => {}]);
