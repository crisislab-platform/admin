import { Stack, CircularProgress, Typography } from "@mui/material";

export default function LoadingSpinner() {
	return (
		<Stack direction="row" alignItems="center">
			<CircularProgress size={20} />
			<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
				Logging in...
			</Typography>
		</Stack>
	);
}
