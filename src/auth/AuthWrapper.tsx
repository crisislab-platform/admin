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
	const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
	const card = (
		<Paper
			elevation={16}
			sx={{
				p: 4,
				width: smallScreen ? "100vw" : (theme) => theme.spacing(45),
				height: smallScreen ? "100vh" : (theme) => theme.spacing(65),
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
				width: "100vw",
				height: "100vh",
				backgroundColor: (theme) => theme.palette.secondary.light,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			{card}
		</Box>
	);
}
