import {
	AccountPanel,
	AccountsPage,
	SensorPanel,
	SensorsPage,
	SensorsSideBySide,
} from "./pages/index";
import { Route, SidebarLink } from "../types";

import CompareIcon from "@mui/icons-material/Compare";
import CompareOutlinedIcon from "@mui/icons-material/CompareOutlined";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { roles } from "../utils";

export const routes: (Route | SidebarLink)[] = [
	{
		position: 0,
		slug: "sensors",
		text: "Sensors",
		ActiveIcon: SensorsIcon,
		Icon: SensorsOutlinedIcon,
		Element: <SensorsPage />,
		requiredRole: roles["sensors:read"],
		subRoutes: [
			{
				slug: ":sensorID",
				text: "Sensor info",
				Element: <SensorPanel />,
				requiredRole: roles["sensors:read"],
			},
		],
	},
	{
		position: 1,
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

	{
		position: 2,
		slug: "sensors-side-by-side",
		text: "Sensors: side-by-side",
		Element: <SensorsSideBySide />,
		requiredRole: roles["sensors:read"],
		Icon: CompareOutlinedIcon,
		ActiveIcon: CompareIcon,
	},
	{
		position: 3,
		slug: "global-config",
		text: "Global configuration",
		ActiveIcon: SettingsIcon,
		Icon: SettingsOutlinedIcon,
		Element: <div>Global sensor configuration - coming soon?</div>,
		requiredRole: roles["sensors:write"],
	},
];
