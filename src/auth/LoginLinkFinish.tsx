import { LinkWithQuery, LoadingSpinner } from "../components/index";
import { Stack, Typography } from "@mui/material";

import useAuth from "./useAuth";
import { useEffect } from "react";
import { useGetQueryParam } from "./utils";
import { useSnackbar } from "notistack";

const noTokenFoundText =
	"E: No token found. Please make sure that you got to this page by clicking the login link sent to you from CRISiSLab via email.";

export default function LoginLinkFinish() {
	const token = useGetQueryParam("token");
	const { login, loading } = useAuth();
	const { enqueueSnackbar } = useSnackbar();
	async function onLoad() {
		if (token) {
			await login(token);
		} else {
			enqueueSnackbar(noTokenFoundText, { variant: "warning" });
		}
	}
	useEffect(() => {
		onLoad();
	});

	return (
		<Stack gap={2}>
			<Typography variant="h4" component="h2" sx={{ textAlign: "center" }}>
				Logging you in...
			</Typography>
			{!token && noTokenFoundText}
			{loading && <LoadingSpinner />}
			<LinkWithQuery to="/auth/login" className="arrow-back">
				Back to login
			</LinkWithQuery>
		</Stack>
	);
}
