import { AccountPanel, AccountsPage, SensorInfo, Sensors } from "./pages/index";
import { Route, SidebarLink } from "../types";

import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { roles } from "../utils";

export const routes: (Route | SidebarLink)[] = [
	{
		slug: "global-config",
		text: "Global configuration",
		ActiveIcon: SettingsIcon,
		Icon: SettingsOutlinedIcon,
		Element: <div>Global sensor configuration</div>,
		requiredRole: roles["sensors:write"],
	},
	{
		slug: "sensors",
		text: "Sensors",
		ActiveIcon: SensorsIcon,
		Icon: SensorsOutlinedIcon,
		Element: <Sensors />,
		requiredRole: roles["sensors:read"],
	},
	{
		slug: "sensors/:sensorID",
		indexSlug: "sensors/",
		text: "Sensor info",
		Element: <SensorInfo />,
		requiredRole: roles["sensors:read"],
	},
	{
		slug: "accounts",
		text: "Accounts",
		Icon: PersonOutlineOutlinedIcon,
		ActiveIcon: PersonIcon,
		Element: <AccountsPage />,
		requiredRole: roles["users:read"],
		subRoutes: [
			{
				slug: ":accountID",
				text: "Account information",
				Element: <AccountPanel />,
				requiredRole: roles["users:read"],
			},
		],
	},
];
