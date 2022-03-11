import { Route, SidebarLink } from "../types";
import { SensorInfo, Sensors, UsersPanel } from "./pages/index";

import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

export const routes: (Route | SidebarLink)[] = [
	{
		slug: "global-config",
		text: "Global configuration",
		ActiveIcon: SettingsIcon,
		Icon: SettingsOutlinedIcon,
		Element: <div>Global sensor configuration</div>,
		requiredRole: "sensors:update",
	},
	{
		slug: "sensors",
		text: "Sensors",
		ActiveIcon: SensorsIcon,
		Icon: SensorsOutlinedIcon,
		Element: <Sensors />,
		requiredRole: "sensors:read",
	},
	{
		slug: "sensors/:sensorID",
		indexSlug: "sensors/",
		text: "Sensor info",
		Element: <SensorInfo />,
		requiredRole: "sensors:read",
	},
	{
		slug: "users",
		text: "Users",
		Icon: PersonOutlineOutlinedIcon,
		ActiveIcon: PersonIcon,
		Element: <UsersPanel />,
		requiredRole: "users:read",
	},
];
