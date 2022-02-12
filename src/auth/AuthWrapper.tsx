import {
	Box,
	Paper,
	Stack,
	Typography,
	useMediaQuery,
	useTheme,
} from "@mui/material";

import { Outlet } from "react-router-dom";

export default function AuthPagesWrapper() {
	const theme = useTheme();
	const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

	const card = (
		<Paper
			elevation={16}
			sx={{
				p: 4,
				width: smallScreen ? "100%" : (theme) => theme.spacing(45),
				height: smallScreen ? "100%" : (theme) => theme.spacing(65),
			}}>
			<Stack alignItems="center">
				<Typography variant="h5" component="h1">
					CRISiSLab Shakemap
				</Typography>
				<Outlet />
			</Stack>
		</Paper>
	);

	if (smallScreen) {
		return card;
	}

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				backgroundColor: (theme) => theme.palette.primary.light,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			{card}
		</Box>
	);
}
