import LoginLinkFinishPage from "./LoginLinkFinish";
import LoginLinkPage from "./LoginLink";
import LoginPage from "./Login";
import { NavigateWithQuery } from "../components";
import PasswordResetFinishPage from "./PasswordResetFinish";
import PasswordResetStartPage from "./PasswordResetStart";
import RegisterPage from "./Register";
import { useGetQueryParam } from "./utils";

export interface AuthRoute {
	path: string;
	component: any;
}
export const authRoutes: AuthRoute[] = [
	{
		path: "token-sign-in",
		component: <TokenSignIn />,
	},
	{
		path: "password-reset-start",
		component: <PasswordResetStartPage />,
	},
	{
		path: "password-reset-finish",
		component: <PasswordResetFinishPage variant="reset" />,
	},
	{
		path: "welcome",
		component: <PasswordResetFinishPage variant="welcome" />,
	},
	{
		path: "login-link",
		component: <LoginLinkPage />,
	},
	{
		path: "login-link-finish",
		component: <LoginLinkFinishPage />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];

function TokenSignIn() {
	const type = useGetQueryParam("type");
	if (type === "reset") {
		return <NavigateWithQuery to="/auth/password-reset-finish" />;
	}
	if (type === "sign-in") {
		return <NavigateWithQuery to="/auth/login-link-finish" />;
	}
	if (type === "welcome") {
		return <NavigateWithQuery to="/auth/welcome" />;
	}
	return <p>Something has gone terribly wrong: Unknown type query param</p>;
}
