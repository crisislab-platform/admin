import { AppUser, Permission } from "../types";
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
	useState,
} from "react";
import { IdToken, useAuth0 } from "@auth0/auth0-react";

import { LoadingSpinner } from "./LoadingSpinner";
import LoginIcon from "@mui/icons-material/VpnKey";
import LogoutIcon from "@mui/icons-material/Logout";

export const JWTContext = createContext<
	[null | string, Dispatch<SetStateAction<string | null>>]
>([null, () => {}]);

export function useJWT(): [
	string | null,
	Dispatch<SetStateAction<string | null>>,
] {
	const { isAuthenticated, getAccessTokenSilently } = useAuth0();
	const [JWT, setJWT] = useContext(JWTContext);
	useEffect(() => {
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
		if (isAuthenticated) {
			asyncFunction();
		}
	}, [getAccessTokenSilently, setJWT, isAuthenticated]);
	return [JWT, setJWT];
}

function useLogIn() {
	const { loginWithPopup, logout, isLoading, isAuthenticated } = useAuth0();
	const [JWT, setJWT] = useJWT();

	function logInFn() {
		loginWithPopup();
	}

	function logOutFn() {
		setJWT(null);
		logout({ returnTo: window.location.origin });
	}

	return {
		isLoading: isLoading,
		isLoggedIn: isAuthenticated,
		logOut: logOutFn,
		logIn: logInFn,
	};
}

export function useUser() {
	const { isLoading, isAuthenticated, user, getIdTokenClaims } = useAuth0();
	const [claims, setClaims] = useState<null | IdToken>(null);
	const [JWT] = useJWT();
	const { logIn, logOut } = useLogIn();
	useEffect(() => {
		async function asyncFunction() {
			const freshClaims = await getIdTokenClaims();
			console.log("Fresh claims: ", freshClaims);
			if (freshClaims) {
				setClaims(freshClaims);
			}
		}
		asyncFunction();
	}, [setClaims, getIdTokenClaims, isAuthenticated]);
	const loggedIn = isAuthenticated && JWT;
	let userObj: AppUser = {
		isLoggedIn: false,
		isLoading,
		login: logIn,
		logout: logOut,
		permissions: ["none", "sensors:read"],
	};

	let claimsPerms: Permission[] = [];
	if (claims) {
		claimsPerms = claims["https://crisislab.org.nz/roles"];
	}

	if (loggedIn) {
		userObj = {
			...userObj,
			isLoggedIn: true,
			JWT,
			info: user,
			claims,
			permissions: ["none", "logged_in", "sensors:read", ...claimsPerms],
		};
	}

	return userObj;
}

export function LoginButton({ message }: { message?: string }) {
	const { logIn, logOut, isLoading, isLoggedIn } = useLogIn();

	return (
		<>
			{!isLoggedIn && message && <Typography>{message}</Typography>}
			{isLoading ? (
				<LoadingSpinner color="secondary" />
			) : (
				<Button
					color="secondary"
					endIcon={isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
					variant="contained"
					onClick={() => (isLoggedIn ? logOut() : logIn())}>
					{isLoggedIn ? "Log out" : "Log in"}
				</Button>
			)}
		</>
	);
}

export function LoginFab({ message }: { message?: string }) {
	const { logIn, logOut, isLoading, isLoggedIn } = useLogIn();

	return isLoading ? (
		<Fab size="small" color="secondary" disabled>
			<CircularProgress size={20} color="secondary" />
		</Fab>
	) : (
		<Tooltip title={message || isLoggedIn ? "Log out" : "Log in"}>
			<Fab
				size="small"
				color="secondary"
				onClick={() => (isLoggedIn ? logOut() : logIn())}>
				{isLoggedIn ? <LogoutIcon /> : <LoginIcon />}
			</Fab>
		</Tooltip>
	);
}

export function MissingPermission({ permission }: { permission: Permission }) {
	const user = useUser();
	return (
		<Box>
			<Typography>
				You do not have the required permission to acces this:{" "}
				<code>{permission}</code>.
			</Typography>
			{!user.isLoggedIn && (
				<LoginButton message="You might have permission to view this if you log in." />
			)}
		</Box>
	);
}
