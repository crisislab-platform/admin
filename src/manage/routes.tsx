import { Route, SidebarLink } from "../types";
import { SensorInfo, Sensors } from "./pages/index";

import SensorsIcon from "@mui/icons-material/Sensors";
import SettingsIcon from "@mui/icons-material/Settings";

export const routes: (Route | SidebarLink)[] = [
	{
		slug: "global-config",
		text: "Global configuration",
		Icon: SettingsIcon,
		Element: <div>Global sensor configuration</div>,
		requiredPermission: "logged_in",
	},
	{
		slug: "sensors",
		text: "Sensors",
		Icon: SensorsIcon,
		Element: <Sensors />,
		requiredPermission: "sensors:read",
	},
	{
		slug: "sensors/:sensorID",
		indexSlug: "sensors/",
		text: "Sensor info",
		Element: <SensorInfo />,
		requiredPermission: "sensors:read",
	},
];
