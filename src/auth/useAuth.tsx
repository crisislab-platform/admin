import * as authAPI from "./auth";

import {
	ReactNode,
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type JSX
} from "react";
import { useLocation } from "react-router";
import { getQueryParam, showErrorSnackbar, useGetQueryParam } from "./utils";

import { useSnackbar } from "notistack";
import { useNavigateWithQuery } from "../components";
import { User } from "../types";
import { generateAvatar } from "../utils";

const authUserNamespace = "auth-v2-user";

interface AuthContextType {
	user: User | null;
	setUser: React.Dispatch<React.SetStateAction<User | null>>;
	loading: boolean;
	popupOpen: boolean;
	closePopup: () => void;
	login: (emailOrToken: string, password?: string) => Promise<void>;
	logout: () => void;
	forceReauth: () => void;
	changePassword: (opts: {
		newPassword: string;
		accountID: number;
	}) => Promise<boolean>;
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
	const [popupWindowCloseTimeout, setPopupWindowCloseTimeout] = useState<
		null | any
	>(null);
	const [popupWindowRef, setPopupWindowRef] = useState<null | Window>(null);
	const [popupOpen, setPopupOpen] = useState<boolean>(false);

	function setDebugUser(newUser: User | null) {
		try {
			if (newUser) {
				// @ts-ignore
				window.user = newUser;
			} else {
				// @ts-ignore
				delete window.user;
			}
		} catch (error) {
			console.warn("Failed to update debug user", error);
		}
	}

	function removeStoredAuth() {
		try {
			localStorage.removeItem(authUserNamespace);
		} catch (error) {
			console.warn("Failed to remove stored auth", error);
		}
	}

	function clearAuthState({ removeStorage = true } = {}) {
		setUser(null);
		if (removeStorage) removeStoredAuth();
		setDebugUser(null);
	}

	// Every time the user updates, save their data to localStorage
	useEffect(() => {
		if (user) {
			try {
				localStorage.setItem(authUserNamespace, JSON.stringify(user));
			} catch (error) {
				console.warn("Failed to store auth", error);
			}
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
		let storedData: string | null = null;
		try {
			storedData = localStorage.getItem(authUserNamespace);
		} catch (error) {
			console.warn("Failed to read stored auth", error);
			clearAuthState({ removeStorage: false });
			setLoading(false);
			return;
		}

		if (!storedData) {
			clearAuthState({ removeStorage: false });
			setLoading(false);
			return;
		}

		try {
			const data = JSON.parse(storedData);
			// If the expiry date is in the past, delete the data and don't log in with it
			if ("exp" in data && Date.now() > data.exp * 1000) {
				clearAuthState();
			} else {
				setUser(data);
				setDebugUser(data);
			}
		} catch (e) {
			// If there is an error, it means there is no active session.
			clearAuthState();
		}
		setLoading(false);
	}
	useEffect(() => {
		loadUserFromStorage();
		setLoadingInitial(false);

		// Only fires when other windows/tabs update localstorage.
		// Ideal for keeping pages in sync.
		function onStorage(event: StorageEvent) {
			if (event.key === authUserNamespace || event.key === null) {
				loadUserFromStorage();
			}
		}

		window.addEventListener("storage", onStorage);

		return () => {
			window.removeEventListener("storage", onStorage);
		};
	}, []);

	useEffect(() => {
		setPopupWindowCloseTimeout(
			setTimeout(() => {
				if (popupWindowRef) {
					popupWindowRef.close();
					enqueueSnackbar("Popup closed after 2 minutes.", {
						variant: "warning",
					});
				}

				setLoading(false);
			}, 2 * 60 * 1000 /*2 minutes */),
		);
		return () => {
			clearTimeout(popupWindowCloseTimeout);
		};
	}, [
		setPopupWindowCloseTimeout,
		popupWindowRef,
		setLoading,
		enqueueSnackbar,
	]);

	async function login(email: string, password: string) {
		setLoading(true);

		try {
			let newUser = await authAPI.login(email, password);
			newUser.picture = generateAvatar(newUser.email);
			setUser(newUser);
			setDebugUser(newUser);
			if (getQueryParam("in_popup_window")) {
				console.info(
					"In popup, will try and close because login succeeded.",
				);
				try {
					window.close();
				} catch (e) {
					console.warn("Failed to close popup window");
				}
			} else {
				if (returnTo) {
					navigate(returnTo);
				} else {
					navigate("/");
				}
			}

			enqueueSnackbar("Successfully logged in.", { variant: "success" });
		} catch (error) {
			showErrorSnackbar(enqueueSnackbar, error);
		}

		setLoading(false);

		// TODO: Fix this
		// This hurts my soul, but younger me was very dumb and architected
		// everything wrong, so it's the only way to make sure the data being
		// displayed is up-to-date with the user's auth state.
		// window.location.reload();
	}

	function logout() {
		clearAuthState();

		// See above in login function for reasoning
		navigate("/manage/sensors");
		window.location.reload();
	}

	function forceReauth() {
		const newReturnTo = encodeURIComponent(location.pathname);
		clearAuthState();
		navigate(`/auth/login?return_to=${newReturnTo}`);
	}

	const changePassword: AuthContextType["changePassword"] = async (opts) => {
		if (!user) return false;
		try {
			await authAPI.changePassword({ ...opts, token: user.token });
			if (opts.accountID === user.id) {
				enqueueSnackbar("Password changed. Please log in again.", {
					variant: "success",
				});
			} else {
				enqueueSnackbar("Password changed.", { variant: "success" });
			}
			return true;
		} catch (error) {
			console.error(error);
			showErrorSnackbar(enqueueSnackbar, error);
		}
		return false;
	};

	/*
	 * Make sure this function is called from an event listener for a user-generated action like a clik
	 */
	function goToLogin() {
		const newReturnTo = encodeURIComponent(location.pathname);
		navigate(`/auth/login?return_to=${newReturnTo}`);
	}

	const closePopup = () => setPopupOpen(false);

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
			popupOpen,
			closePopup,
			login,
			logout,
			forceReauth,
			changePassword,
			goToLogin,
			setUser,
		};
	}, [user, loading, popupOpen]);

	return (
		<AuthContext.Provider value={memoedValue}>
			{!loadingInitial && children}
		</AuthContext.Provider>
	);
}

export default function useAuth() {
	return useContext(AuthContext);
}
