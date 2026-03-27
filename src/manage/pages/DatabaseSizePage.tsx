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
	Alert,
	Button,
	Card,
	Checkbox,
	Collapse,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Paper,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import useAuth from "../../auth/useAuth";
import { APIBase, formatBytes, retentionPolicies, roles, userHasPermission } from "../../utils";
import { useQuery } from "@tanstack/react-query";
import { makeFetchDataRetentionPolicy, queryClient, updateDataRetentionPolicy } from "../../api";

const MAX_DISK_SIZE = tbToBytes(5.9);
const ONE_YEAR_IN_SECONDS = 1000 * 60 * 60 * 24 * 365.25;
const THIRTY_DAYS_IN_SECONDS = 1000 * 60 * 60 * 24 * 30;

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
	const [timeWindow, setTimeWindow] = useState<number>(ONE_YEAR_IN_SECONDS);
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
						// TODO: Use the /database-max-size route instead of hardcoding
						value: MAX_DISK_SIZE,
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
	}, [timeline, timelineContainerRef, timeWindow, showDiskSize]);

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
				const [_soonSize, _soonTime] = body.split(",");
				const soonSize = Number(_soonSize);
				const soonTime = _soonTime !== "undefined" ? new Date(_soonTime) : null;

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
				setHistory(JSON.parse(historyBody).map((d) => ({
					value: Number.parseInt(d.size),
					time: new Date(d.time),
				}))
				);
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
		<Stack p={3} gap={2}>
			<Typography sx={{ fontWeight: "bold", fontSize: "80pt" }}>
				{size ? formatBytes(size) : "..."}
			</Typography>
			{error ? (
				error + ""
			) : size ? (
				<Typography sx={{ fontSize: "15pt" }}>
					Updated at {time?.toString() ?? "[[unknown]]"}
				</Typography>
			) : (
				"Loading..."
			)}
			<RetentionPolicyManager />
			<Paper variant="outlined" sx={{ p: 2 }}>
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
								<MenuItem value={ONE_YEAR_IN_SECONDS}>
									Last year
								</MenuItem>
								<MenuItem value={THIRTY_DAYS_IN_SECONDS}>
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

export function RetentionPolicyManager() {
	const { user } = useAuth();
	const noPerms = !userHasPermission(user, "sensor-data:bulk-delete");
	const retentionQuery = useQuery(
		["db/retention-policy"],
		makeFetchDataRetentionPolicy(user?.token),
	);
	const [retentionPolicySelection, setRetentionPolicySelection] = useState(retentionQuery.data);

	function handleSelectChange(e) {
		setRetentionPolicySelection(e.target.value);
	}
	async function applyChange() {
		if (!user?.token) return;
		if (!retentionPolicySelection || !(retentionPolicySelection in retentionPolicies)) return;

		if (retentionPolicySelection !== "retain") {
			if (!window.confirm(`Are you sure you want to change the policy to ${retentionPolicies[retentionPolicySelection]}?\n\nAny data older than that will be deleted.`)) return;
		}

		await updateDataRetentionPolicy(user.token, retentionPolicySelection)
		queryClient.invalidateQueries(["db/retention-policy"])
	}


	return <Card variant="outlined" sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
		Current data retention policy: {retentionQuery.data ? retentionPolicies[retentionQuery.data] : "--"}
		<Collapse in={noPerms}>
			<Alert severity="info">
				You need the <code>sensor-data:bulk-delete</code> permission to change this.
			</Alert>
		</Collapse>
		<FormControl fullWidth disabled={noPerms}>
			<InputLabel id="retention-policy-select-label">Rention policy</InputLabel>
			<Select
				disabled={noPerms}
				labelId="retention-policy-select-label"
				id="retention-policy-select"
				value={retentionPolicySelection}
				label="Rention policy"
				onChange={handleSelectChange}
			>
				{Object.entries(retentionPolicies).map(([policy, label]) => <MenuItem key={policy} value={policy}>{label}</MenuItem>)}
			</Select>
		</FormControl>
		<Button variant="contained" onClick={applyChange} disabled={noPerms || retentionPolicySelection === retentionQuery.data}>Save</Button>
	</Card>;
}