import {
	Box,
	Button,
	CircularProgress,
	Fab,
	Tooltip,
	Typography,
} from "@mui/material";
import {
	Dispatch,
	SetStateAction,
	createContext,
	useContext,
	useEffect,
} from "react";

import LoadingSpinner from "./LoadingSpinner";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth0 } from "@auth0/auth0-react";

function useLogIn() {
	const {
		loginWithPopup,
		logout,
		isLoading,
		isAuthenticated,
		getAccessTokenSilently,
		user,
	} = useAuth0();
	const [JWT, setJWT] = useContext(JWTContext);

	useEffect(() => {
		if (isAuthenticated) {
			async function asyncFunction() {
				try {
					const JWTToken = await getAccessTokenSilently({
						audience: import.meta.env.VITE_AUTH0_AUDIENCE,
						scope: import.meta.env.VITE_AUTH0_SCOPE,
					});
					console.log(`JWT: ${JWTToken}`);
					setJWT(JWTToken);
				} catch (e) {
					console.log("Error getting JWT: ", e as any);
				}
			}
			asyncFunction();
		}
	}, [getAccessTokenSilently, setJWT, isAuthenticated]);

	function logInFn() {
		loginWithPopup();
	}

	function logOutFn() {
		setJWT(null);
		logout({ returnTo: window.location.origin });
	}

	return {
		loading: isLoading,
		loggedIn: isAuthenticated,
		logOut: logOutFn,
		logIn: logInFn,
	};
}

export const JWTContext = createContext<
	[null | string, Dispatch<SetStateAction<string | null>>]
>([null, () => {}]);

export function LoginButton({ message }: { message?: string }) {
	const { logIn, logOut, loading, loggedIn } = useLogIn();

	return (
		<Box>
			{message && <Typography>{message}</Typography>}
			{loading ? (
				<LoadingSpinner color="secondary" />
			) : (
				<Button
					color="secondary"
					endIcon={loggedIn ? <LogoutIcon /> : <LoginIcon />}
					variant="contained"
					onClick={() => (loggedIn ? logOut() : logIn())}>
					{loggedIn ? "Log out" : "Log in"}
				</Button>
			)}
		</Box>
	);
}

export function LoginFab({ message }: { message?: string }) {
	const { logIn, logOut, loading, loggedIn } = useLogIn();

	return loading ? (
		<Fab size="small" color="secondary" disabled>
			<CircularProgress size={20} color="secondary" />
		</Fab>
	) : (
		<Tooltip title={message || loggedIn ? "Log out" : "Log in"}>
			<Fab
				size="small"
				color="secondary"
				onClick={() => (loggedIn ? logOut() : logIn())}>
				{loggedIn ? <LogoutIcon /> : <LoginIcon />}
			</Fab>
		</Tooltip>
	);
}
