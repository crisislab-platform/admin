import { Typography } from "@mui/material";
import useAuth from "../../auth/useAuth";
import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../utils";

export function DatabaseSizePage() {
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
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
					}/api/v1/database-size`,
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
			} catch (err) {
				setSize(null);
				setError(err);
			}
		})();
		return () => {
			controller?.current?.abort();
		};
	}, [user.token]);

	return (
		<Typography sx={{ fontWeight: "bold", fontSize: "x-large" }}>
			{error ? error + "" : size ? formatBytes(size) : "Loading..."}
		</Typography>
	);
}
