import * as authAPI from "./authAPI";

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { getQueryParam, showErrorSnackbar, useGetQueryParam } from "./utils";
import { useLocation, useNavigate } from "react-router-dom";

import { User } from "../types";
import { generateAvatar } from "../utils";
import { useNavigateWithQuery } from "../components";
import { useSnackbar } from "notistack";
import { queryClient } from "../api";

const authUserNamespace = "auth-v2-user";
const baseURL =
	import.meta.env.MODE === "production"
		? "https://shakemap.crisislab.org.nz"
		: "http://localhost:3000";

interface AuthContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	loading: boolean;
	login: (args: { email?: string; conditionalUI?: boolean }) => Promise<void>;
	addDevice: (args: { deviceName: string; token: string }) => Promise<void>;
	logout: () => void;
	goToLogin: () => void;
}

export const AuthContext = createContext<AuthContextType>(
	{} as AuthContextType,
);

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
	const navigate = useNavigateWithQuery();
	const location = useLocation();
	const returnTo = useGetQueryParam("return_to");

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

	function loadUserFromStorage() {
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
		setLoading(false);
	}
	useEffect(() => {
		loadUserFromStorage();
		setLoadingInitial(false);

		// Only fires when other windows/tabs update localstorage.
		// Ideal for keeping pages in sync.
		window.addEventListener("storage", loadUserFromStorage);

		return () => {
			window.removeEventListener("storage", loadUserFromStorage);
		};
	}, []);

	async function login({
		email,
		conditionalUI,
	}: {
		email: string;
		conditionalUI?: boolean;
	}) {
		setLoading(true);
		try {
			let newUser = await authAPI.login({ email, conditionalUI });
			newUser.picture = generateAvatar(newUser.email);
			setUser(newUser);
			// @ts-ignore
			window.user = newUser;

			if (returnTo) {
				navigate(returnTo);
			} else {
				navigate("/");
			}

			enqueueSnackbar(`Logged in${user.name ? ` as ${user.name}` : ""}`);
		} catch (error) {
			if (!conditionalUI) {
				showErrorSnackbar(enqueueSnackbar, error);
			}
			console.warn("Error logging with with webauthn: ", error);
		}
		setLoading(false);

		// // Get stuff up-to-date
		// window.location.reload();
	}

	async function addDevice({
		token,
		deviceName,
	}: {
		token: string;
		deviceName: string;
	}) {
		setLoading(true);
		try {
			let newUser = await authAPI.addDevice({
				deviceName,
				token,
			});

			newUser.picture = generateAvatar(newUser.email);
			setUser(newUser);
			// @ts-ignore
			window.user = newUser;

			if (returnTo) {
				navigate(returnTo);
			} else {
				navigate("/");
			}

			enqueueSnackbar(`Successfully added ${deviceName}`, {
				variant: "success",
			});
		} catch (error) {
			showErrorSnackbar(enqueueSnackbar, error);
		}
		setLoading(false);
	}

	function logout() {
		setUser(undefined);
		localStorage.removeItem(authUserNamespace);

		// See above in login function for reasoning
		window.location.reload();
	}

	/*
	 * Make sure this function is called from an event listener for a user-generated action like a clik
	 */
	function goToLogin() {
		console.info("Logging in with redirect...");

		const newReturnTo = encodeURIComponent(location.pathname);
		navigate(`/auth/login?return_to=${newReturnTo}`);
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
	const memoedValue = useMemo(() => {
		return {
			user,
			loading,
			login,
			logout,
			goToLogin,
			setUser,
			addDevice,
		};
	}, [user, loading]);

	return (
		<AuthContext.Provider value={memoedValue}>
			{!loadingInitial && children}
		</AuthContext.Provider>
	);
}

export default function useAuth() {
	return useContext(AuthContext);
}
