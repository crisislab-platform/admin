import * as authAPI from "./auth";

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

const authUserNamespace = "auth-v2-user";
const baseURL =
	import.meta.env.MODE === "production"
		? "https://shakemap.crisislab.org.nz"
		: "http://localhost:3000";

interface AuthContextType {
	user: User | null;
	loading: boolean;
	popupOpen: boolean;
	closePopup: () => void;
	login: (emailOrToken: string, password?: string) => Promise<void>;
	logout: () => void;
	sendLink: (
		email: string,
		type: "welcome" | "sign-in" | "reset",
	) => Promise<boolean>;
	resetPassword: (password: string, token: string) => Promise<void>;
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

	async function login(email: string, password?: string) {
		setLoading(true);

		try {
			let newUser = await authAPI.login(email, password);
			newUser.picture = generateAvatar(newUser.email);
			setUser(newUser);
			// @ts-ignore
			window.user = newUser;
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
			await authAPI.sendLink(email, type, returnTo);
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

	/*
	 * Make sure this function is called from an event listener for a user-generated action like a clik
	 */
	function goToLogin() {
		if (getQueryParam("use_popup_window")) {
			console.info("Logging in with popup window...");
			const popupWidth = 400;
			const popupHeight = 600;
			const popupLeft =
				window.screenX + (window.innerWidth - popupWidth) / 2;
			const popupTop =
				window.screenY + (window.innerHeight - popupHeight) / 2;

			setLoading(true);
			setPopupWindowRef(
				window.open(
					`${baseURL}/auth/login?in_popup_window=true`,
					"crisislab-shakemap-auth-popup",
					`popup,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`,
				),
			);
			if (popupWindowRef) {
				popupWindowRef.addEventListener("close", () => {
					if (popupWindowCloseTimeout) {
						clearTimeout(popupWindowCloseTimeout);
					}
					setLoading(false);
				});
			}
		} else {
			console.info("Logging in with redirect...");

			const newReturnTo = encodeURIComponent(location.pathname);
			navigate(`/auth/login?return_to=${newReturnTo}`);
		}
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
			sendLink,
			resetPassword,
			goToLogin,
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
