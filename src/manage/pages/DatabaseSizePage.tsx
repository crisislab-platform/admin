import { Stack, Typography } from "@mui/material";
import useAuth from "../../auth/useAuth";
import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../utils";

export function DatabaseSizePage() {
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [time, setTime] = useState<Date | null>(null);
	const [size, setSize] = useState<number | null>(null);
	const controller = useRef<AbortController>(null);

	useEffect(() => {
		// I hate that I still need to do this
		setError(null);
		(async () => {
			if (!user.token) return;

			try {
				controller.current = new AbortController();
				const res = await fetch(
					`${
						import.meta.env.DEV
							? "http://localhost:8080"
							: "https://crisislab-data.massey.ac.nz"
					}/api/v2/db/database-size`,
					{
						signal: controller.current.signal,
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				);
				const body = await res.text();
				if (!res.ok) throw body;
				setSize(Number(body));
				setError(null);
				setTime(new Date());
			} catch (err) {
				setSize(null);
				setTime(null);
				// Don't show aborted messages
				if (!(err + "").includes("aborted")) setError(err);
			}
		})();
		return () => {
			controller?.current?.abort();
			setError(null);
		};
	}, [user.token]);

	return (
		<Stack p={3}>
			<Typography sx={{ fontWeight: "bold", fontSize: "80pt" }}>
				{error ? error + "" : size ? formatBytes(size) : "Loading..."}
			</Typography>
			{time && (
				<Typography sx={{ fontSize: "15pt" }}>
					Updated at {time?.toString()}
				</Typography>
			)}
		</Stack>
	);
}
