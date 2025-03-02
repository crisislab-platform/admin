import {
	AccountPanel,
	AccountsPage,
	SensorPanel,
	SensorsPage,
	SensorsSideBySide,
} from "./pages/index";
import { Route, SidebarLink } from "../types";
import { DatabaseSizePage } from "./pages/DatabaseSizePage";
import CompareIcon from "@mui/icons-material/Compare";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SensorsIcon from "@mui/icons-material/Sensors";
import SensorsOutlinedIcon from "@mui/icons-material/SensorsOutlined";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { roles } from "../utils";
import { ExportSensorDataPage } from "./pages/data-export/ExportSensorData";
import StorageIcon from "@mui/icons-material/Storage";
import WavesIcon from "@mui/icons-material/Waves";
import { ChartMarkersPage } from "./pages/charts/ChartMarkersPage";
import { EditChartMarkerPanel } from "./pages/charts/EditChartMarkerPanel";

export const routes: (Route | SidebarLink)[] = [
	{
		position: 0,
		slug: "sensors",
		text: "Sensors",
		ActiveIcon: SensorsIcon,
		Icon: SensorsOutlinedIcon,
		Element: SensorsPage,
		requiredRole: roles["sensors:read"],
		subRoutes: [
			{
				slug: ":sensorID",
				text: "Sensor info",
				Element: SensorPanel,
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
		Element: AccountsPage,
		requiredRole: roles["users:read"],
		subRoutes: [
			{
				slug: ":accountID",
				text: "Account information",
				Element: AccountPanel,
				requiredRole: roles["users:read"],
			},
		],
	},
	{
		position: 1.1,
		slug: "chart-markers",
		text: "Chart markers",
		Icon: WavesIcon,
		Element: ChartMarkersPage,
		requiredRole: roles["charts:markers"],
		subRoutes: [
			{
				slug: ":markerID",
				text: "Edit marker",
				Element: EditChartMarkerPanel,
				requiredRole: roles["charts:markers"],
			},
		],
	},

	{
		position: 2,
		slug: "sensors-side-by-side",
		text: "Sensors: side-by-side",
		Element: SensorsSideBySide,
		requiredRole: roles["sensors:read"],
		Icon: CompareIcon,
	},
	{
		position: 3,
		slug: "data-export",
		text: "Data Export",
		Icon: FileDownloadIcon,
		Element: ExportSensorDataPage,
		requiredRole: roles["sensor-data:bulk-export"],
	},
	{
		position: 4,
		slug: "database-size",
		text: "Database size",
		Icon: StorageIcon,
		Element: DatabaseSizePage,
		requiredRole: roles["sensor-data:db-size"],
	},
];
