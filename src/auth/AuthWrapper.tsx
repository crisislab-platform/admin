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
				<img
					src="/logo.png"
					alt="CRISiSLab Logo"
					title="CRISiSLab logo"
					width={90}
					height={90}
				/>
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
				background: (theme) =>
					`linear-gradient(${theme.palette.primary.light}, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}>
			{card}
		</Box>
	);
}
