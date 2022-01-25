import {
	Box,
	FormControlLabel,
	FormGroup,
	Grow,
	IconButton,
	Paper,
	Stack,
	Switch,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";

import SettingsIcon from "@mui/icons-material/Settings";

export default function SettingsPanel({
	faultLinesVisible,
	setFaultLinesVisible,
	sensorsVisible,
	setSensorsVisible,
	sateliteMode,
	setSateliteMode,
}: {
	faultLinesVisible: boolean;
	setFaultLinesVisible: Dispatch<SetStateAction<boolean>>;
	sensorsVisible: boolean;
	setSensorsVisible: Dispatch<SetStateAction<boolean>>;
	sateliteMode: boolean;
	setSateliteMode: Dispatch<SetStateAction<boolean>>;
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
									checked={faultLinesVisible}
									onChange={(e) =>
										setFaultLinesVisible(e.target.checked)
									}
								/>
							}
							label="Show fault lines"
						/>{" "}
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
				</Paper>
			</Grow>
			<Box>
				<IconButton
					onClick={() =>
						setSettingsPanelVisible(!settingsPanelVisible)
					}>
					<SettingsIcon
						sx={{ color: "rgba(0, 0, 0, 0.7)" }}
						color="inherit"
					/>
				</IconButton>
			</Box>
		</Stack>
	);
}
