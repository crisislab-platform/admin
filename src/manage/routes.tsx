import { Route, SidebarLink } from "../types";
import { SensorInfo, Sensors } from "./pages/index";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SensorsIcon from "@mui/icons-material/Sensors";

export const routes: (Route | SidebarLink)[] = [
	{
		index: true,
		text: "Overview",
		Icon: DashboardIcon,
		Element: <div>Overview</div>,
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
