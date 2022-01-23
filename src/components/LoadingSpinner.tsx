import { CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingSpinner({
	message,
	color,
}: {
	message?: string;
	color?: "primary" | "secondary";
}) {
	return (
		<Stack direction="row" alignItems="center">
			<CircularProgress size={20} color={color} />
			<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
				{message || "Loading..."}...
			</Typography>
		</Stack>
	);
}
