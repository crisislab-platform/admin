import {
	TimeLine,
	TimeLineDataPoint,
	axisLabelPlugin,
	doubleClickCopyPlugin,
	highlightNearestPointPlugin,
	nearestPointInfoPopupPlugin,
	pointerCrosshairPlugin,
	timeAxisPlugin,
	valueAxisPlugin,
} from "@crisislab/timeline";
import {
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import useAuth from "../../auth/useAuth";
import { APIBase, formatBytes } from "../../utils";

function tbToBytes(tb: number): number {
	const tbToBytesMultiplier = 1024 * 1024 * 1024 * 1024;
	return tb * tbToBytesMultiplier;
}

export function DatabaseSizePage() {
	const { user } = useAuth();
	const [error, setError] = useState<string | null>(null);
	const [time, setTime] = useState<Date | null>(null);
	const [size, setSize] = useState<number | null>(null);
	const [history, setHistory] = useState<TimeLineDataPoint[]>([]);
	const controller = useRef<AbortController | null>(null);
	const [timeWindow, setTimeWindow] = useState<number>(Infinity);
	const [showDiskSize, setShowDiskSize] = useState(true);

	const timelineContainerRef = useRef<HTMLDivElement>(null);
	const timeline = useRef<TimeLine | null>(null);

	function recompute() {
		if (!timeline.current) return;
		console.log("recomputing", timeline.current);
		timeline.current.data = history;
		timeline.current.recompute();
	}

	useEffect(() => {
		if (!timelineContainerRef?.current) return;

		timeline.current = new TimeLine({
			container: timelineContainerRef.current,
			data: history,
			timeAxisLabel: "Time",
			valueAxisLabel: "Size",
			timeWindow,
			plugins: [
				axisLabelPlugin(),
				timeAxisPlugin((time) => new Date(time).toLocaleString(), 4),
				valueAxisPlugin(formatBytes),
				highlightNearestPointPlugin("closest-x"),
				pointerCrosshairPlugin(),
				{
					construct(chart) {
						chart.padding.left += 30;
					},
				},
				nearestPointInfoPopupPlugin(
					(time) => new Date(time).toLocaleDateString(),
					formatBytes,
					"closest-x"
				),
				doubleClickCopyPlugin("closest-x")
			],
			markers: !showDiskSize
				? undefined
				: [
						{
							orientation: "horizontal",
							value: tbToBytes(4),
							label: "Disk size",
							labelSide: "after",
							colour: "red",
							lineStyle: "dashed",
							alwaysShow: true,
						},
					],
		});

		recompute();

		return () => {
			timeline.current = null;
			if (timelineContainerRef.current)
				timelineContainerRef.current.innerHTML = "";
		};
	}, [timelineContainerRef, timeWindow, showDiskSize]);

	useEffect(recompute, [history]);

	useEffect(() => {
		// I hate that I still need to do this
		setError(null);
		(async () => {
			if (!user?.token) return;

			try {
				controller.current = new AbortController();
				const res = await fetch(`${APIBase}/db/database-size`, {
					signal: controller.current.signal,
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
				const body = await res.text();
				if (!res.ok) throw body;
				const soonSize = Number(body);
				const soonTime = new Date();

				setSize(soonSize);
				setError(null);
				setTime(soonTime);

				const historyRes = await fetch(
					`${APIBase}/db/database-size-history`,
					{
						signal: controller.current.signal,
						headers: {
							Authorization: `Bearer ${user.token}`,
						},
					},
				);
				const historyBody = await historyRes.text();
				if (!historyRes.ok) throw historyBody;
				console.log(JSON.parse(historyBody), size, time);
				setHistory([
					...JSON.parse(historyBody).map((d) => ({
						value: Number.parseInt(d.size),
						time: new Date(d.time),
					})),
					{
						value: soonSize,
						time: soonTime,
					},
				]);
				setError(null);
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
	}, [user]);

	return (
		<Stack p={3}>
			<Typography sx={{ fontWeight: "bold", fontSize: "80pt" }}>
				{size ? formatBytes(size) : "..."}
			</Typography>
			{error ? (
				error + ""
			) : size ? (
				<Typography sx={{ fontSize: "15pt" }}>
					Updated at {time?.toString()}
				</Typography>
			) : (
				"Loading..."
			)}
			<Paper variant="outlined" sx={{p:2}}>
				<Stack>
					<Typography variant="h6">
						History
					</Typography>
					<Stack direction="row" alignItems="center" gap={3} py={1}>
						<FormControl
							variant="outlined"
							sx={{ m: 1, minWidth: 120 }}>
							<InputLabel id="time-range-select-label">
								Time range
							</InputLabel>
							<Select
								labelId="time-range-select-label"
								id="time-range-select"
								value={timeWindow}
								onChange={(e) => {
									setTimeWindow(Number(e.target.value));
								}}
								label="Time range">
								<MenuItem value={Infinity}>All data</MenuItem>
								<MenuItem value={1000 * 60 * 60 * 24 * 365.25}>
									Last year
								</MenuItem>
								<MenuItem value={1000 * 60 * 60 * 24 * 30}>
									Last 30 days
								</MenuItem>
							</Select>
						</FormControl>
						<FormControlLabel
							control={
								<Checkbox
									checked={showDiskSize}
									onChange={(e) =>
										setShowDiskSize(e.target.checked)
									}
								/>
							}
							label="Show disk size"
						/>
					</Stack>
					<div>
						{/* Protect from the flex */}
						<div
							id="time-line-container"
							ref={timelineContainerRef}
						/>
					</div>
				</Stack>
			</Paper>
		</Stack>
	);
}
