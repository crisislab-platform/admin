import {
	Box,
	FormControlLabel,
	FormGroup,
	Grow,
	IconButton,
	Paper,
	Stack,
	Switch,
	Tooltip,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

import { LoginButton } from "../components";
import SettingsIcon from "@mui/icons-material/Settings";

export default function SettingsPanel({
	faultLinesVisible,
	setFaultLinesVisible,
	sensorsVisible,
	setSensorsVisible,
	sateliteMode,
	setSateliteMode,
	geoNetSensorsVisible,
	setGeoNetSensorsVisible,
}: {
	faultLinesVisible: boolean;
	setFaultLinesVisible: Dispatch<SetStateAction<boolean>>;
	sensorsVisible: boolean;
	setSensorsVisible: Dispatch<SetStateAction<boolean>>;
	sateliteMode: boolean;
	setSateliteMode: Dispatch<SetStateAction<boolean>>;
	geoNetSensorsVisible: boolean;
	setGeoNetSensorsVisible: Dispatch<SetStateAction<boolean>>;
}) {
	const [settingsPanelVisible, setSettingsPanelVisible] = useState(false);
	return (
		<Stack
			gap={1}
			sx={{
				position: "absolute",
				left: (theme) => theme.spacing(1),
				bottom: (theme) => theme.spacing(8),
				zIndex: (theme) => theme.zIndex.speedDial,
			}}>
			<Grow
				in={settingsPanelVisible}
				style={{ transformOrigin: "left bottom" }}>
				<Paper
					elevation={8}
					sx={{
						p: 1,
					}}>
					<FormGroup>
						<FormControlLabel
							control={
								<Switch
									checked={sensorsVisible}
									onChange={(e) =>
										setSensorsVisible(e.target.checked)
									}
								/>
							}
							label="Show CRISiSLab sensors"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={geoNetSensorsVisible}
									onChange={(e) =>
										setGeoNetSensorsVisible(
											e.target.checked,
										)
									}
								/>
							}
							label="Show GeoNet sensors"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={faultLinesVisible}
									onChange={(e) =>
										setFaultLinesVisible(e.target.checked)
									}
								/>
							}
							label="Show fault lines"
						/>
						<FormControlLabel
							control={
								<Switch
									checked={sateliteMode}
									onChange={(e) =>
										setSateliteMode(e.target.checked)
									}
								/>
							}
							label="Satelite view"
						/>
					</FormGroup>
					<Box>
						<LoginButton />
					</Box>
				</Paper>
			</Grow>
			<Box>
				<Tooltip title="Options" placement="right">
					<IconButton
						onClick={() =>
							setSettingsPanelVisible(!settingsPanelVisible)
						}>
						<SettingsIcon
							sx={{
								fill: "rgba(255, 255, 255, 0.7)",
								stroke: "rgba(0, 0, 0, 0.7)",
							}}
						/>
					</IconButton>
				</Tooltip>
			</Box>
		</Stack>
	);
}
