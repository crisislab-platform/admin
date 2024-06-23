import { LinkWithQuery, NavigateWithQuery } from "../components";
import { AddDevicePage } from "./AddDevice";
import { LoginPage } from "./Login";
import { useGetQueryParam } from "./utils";

export interface AuthRoute {
	path: string;
	component: any;
}
const HelpLockedOut = () => (
	<>
		<p>
			Just email zviggers@massey.ac.nz, or contact another admin and ask
			them for a link to re-add your device.
		</p>
		<LinkWithQuery to="/auth/login" className="arrow-back">
			Back to login
		</LinkWithQuery>
	</>
);
export const authRoutes: AuthRoute[] = [
	{
		path: "register",
		component: <AddDevicePage variant="register" />,
	},
	{
		path: "recover",
		component: <AddDevicePage variant="recover" />,
	},
	{
		path: "add-device",
		component: <AddDevicePage variant="additional-device" />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
	{
		path: "token-sign-in",
		component: <TokenSignIn />,
	},
	{
		path: "help-locked-out",
		component: <HelpLockedOut />,
	},
];

function TokenSignIn() {
	const type = useGetQueryParam("add_device_type");
	if (type === "additional_device") {
		return <NavigateWithQuery to="/auth/register" />;
	}
	if (type === "recover_access") {
		return <NavigateWithQuery to="/auth/recover" />;
	}
	if (type === "register") {
		return <NavigateWithQuery to="/auth/register" />;
	}
	return (
		<p>
			Something has gone terribly wrong: Unknown add_device_type query
			param
		</p>
	);
}
