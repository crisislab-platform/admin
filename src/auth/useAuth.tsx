import * as authAPI from "./auth";

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { User } from "../types";
import { showErrorSnackbar } from "./utils";
import { useSnackbar } from "notistack";

const authUserNamespace = "auth-v2-user";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (emailOrToken: string, password?: string) => Promise<void>;
	logout: () => void;
	sendLink: (
		email: string,
		type: "welcome" | "sign-in" | "reset",
	) => Promise<boolean>;
	resetPassword: (password: string, token: string) => Promise<void>;
	goToLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Export the provider as we need to wrap the entire app with it
export function AuthProvider({
	children,
}: {
	children: ReactNode;
}): JSX.Element {
	const [user, setUser] = useState<User | null>(null);
	const { enqueueSnackbar } = useSnackbar();
	const [loading, setLoading] = useState<boolean>(false);
	const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
	const navigate = useNavigate();
	const location = useLocation();

	// Every time the user updates, save their data to localStorage
	useEffect(() => {
		if (user) {
			localStorage.setItem(authUserNamespace, JSON.stringify(user));
		}
	}, [user]);

	// Check if there is a currently active session
	// when the provider is mounted for the first time.
	//
	// If there is an error, it means there is no session.
	//
	// Finally, just signal the component that the initial load
	// is over.
	useEffect(() => {
		try {
			const storedData = localStorage.getItem(authUserNamespace);
			if (storedData) {
				const data = JSON.parse(storedData);
				// If the expiry date is in the past, delete the data and don't log in with it
				if ("exp" in data && Date.now() > data.exp * 1000) {
					localStorage.deleteItem(authUserNamespace);
				} else {
					setUser(data);
					//@ts-ignore
					window.user = data;
				}
			}
		} catch (e) {
			// If there is an error, it means there is no active session.
		}
		setLoadingInitial(false);
	}, []);

	async function login(email: string, password?: string) {
		setLoading(true);

		try {
			const user = await authAPI.login(email, password);
			setUser(user);
			// @ts-ignore
			window.user = user;
			navigate("/");
			enqueueSnackbar("Successfully logged in.", { variant: "success" });
		} catch (error) {
			showErrorSnackbar(enqueueSnackbar, error);
		}

		setLoading(false);
	}

	function logout() {
		setUser(undefined);
		localStorage.removeItem(authUserNamespace);
	}

	async function sendLink(
		email: string,
		type: "welcome" | "sign-in" | "reset",
	): Promise<boolean> {
		try {
			await authAPI.sendLink(email, type);
			enqueueSnackbar("Link sent.", { variant: "success" });
			return true;
		} catch (error) {
			showErrorSnackbar(enqueueSnackbar, error);
			return false;
		}
	}

	async function resetPassword(
		password: string,
		token: string,
	): Promise<void> {
		try {
			await authAPI.resetPassword(password, token);
			enqueueSnackbar("Password changed.", { variant: "success" });
			await login(token);
		} catch (error) {
			showErrorSnackbar(enqueueSnackbar, error);
		}
	}

	function goToLogin() {
		navigate(`/auth/login?return_to=${window.location.href}`);
	}

	// Make the provider update only when it should.
	// We only want to force re-renders if the user
	// or loading states change.
	//
	// Whenever the `value` passed into a provider changes,
	// the whole tree under the provider re-renders, and
	// that can be very costly! Even in this case, where
	// you only get re-renders when logging in and out
	// we want to keep things very performant.
	const memoedValue = useMemo(
		() => ({
			user,
			loading,
			login,
			logout,
			sendLink,
			resetPassword,
			goToLogin,
		}),
		[user, loading],
	);

	return (
		<AuthContext.Provider value={memoedValue}>
			{!loadingInitial && children}
		</AuthContext.Provider>
	);
}

export default function useAuth() {
	return useContext(AuthContext);
}
