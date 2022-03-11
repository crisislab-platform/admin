import { CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingSpinner({
	message,
	color,
	addPadding,
}: {
	message?: string;
	color?: "primary" | "secondary";
	addPadding?: boolean;
}) {
	return (
		<Stack
			direction="row"
			alignItems="center"
			sx={{ p: addPadding ? 2 : 0 }}>
			<CircularProgress size={20} color={color} />
			<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
				{message || "Loading..."}...
			</Typography>
		</Stack>
	);
}
