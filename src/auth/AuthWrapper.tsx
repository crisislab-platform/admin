import { Box, Paper, Stack, useMediaQuery, useTheme } from "@mui/material";
import { Outlet, useNavigate } from "react-router";

import { useGetQueryParam } from "./utils";

export default function AuthPagesWrapper() {
	const theme = useTheme();
	const smallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
			<Paper
				elevation={16}
				sx={{
					p: 4,
					width: smallScreen ? "100%" : (theme) => theme.spacing(45),
					height: smallScreen ? "100%" : (theme) => theme.spacing(65),
					borderRadius: smallScreen
						? 0
						: (theme) => theme.spacing(0.5),
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
		</Box>
	);
}
