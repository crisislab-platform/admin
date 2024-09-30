import LoginPage from "./Login";
import HelpPage from "./Help";

export interface AuthRoute {
	path: string;
	component: any;
}
export const authRoutes: AuthRoute[] = [
	{
		path: "login-help",
		component: <HelpPage />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
];
