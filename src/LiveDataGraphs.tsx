import { Box, Stack, Typography } from "@mui/material";

import ALittleDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet1Bar";
import AllDataIcon from "@mui/icons-material/SignalCellular4Bar";
import LatencyIcon from "@mui/icons-material/HourglassEmpty";
import MostDataIcon from "@mui/icons-material/SignalCellular3Bar";
import { MotionData } from "./types";
import NoDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet0Bar";
import { ResponsiveLineCanvas } from "@nivo/line";
import SomeDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet2Bar";
import { useMeasure } from "react-use";
import { useState } from "react";

export default function LiveDataGraphs() {
	const [hundredthData, setHundredthData] = useState<{
		EHZ: MotionData[];
		ENE: MotionData[];
		ENN: MotionData[];
		ENZ: MotionData[];
	}>({
		EHZ: [],
		ENE: [],
		ENN: [],
		ENZ: [],
	});
	const [quarterlyData, setQuarterlyData] = useState<{
		average: MotionData[];
		offset: MotionData[];
		threshold: MotionData[];
	}>({
		average: [],
		offset: [],
		threshold: [],
	});
	const [timeDifferences, setTimeDifferences] = useState([]);
	const [latency, setLatency] = useState(0);
	const [shaking, setShaking] = useState(false);
	const [detrendTime, setDetrendTime] = useState(2000);
	const [sixRef, sixMeasurements] = useMeasure();
	const [eightRef, eightMeasurements] = useMeasure();

	const percentRecieved =
		timeDifferences.length /
		((Math.max(...timeDifferences) - Math.min(...timeDifferences)) / 250 +
			1);

	const maxTime = {
		EHZ: Math.max(...hundredthData.EHZ.map((x) => x.time)),
		ENE: Math.max(...hundredthData.ENE.map((x) => x.time)),
		ENN: Math.max(...hundredthData.ENN.map((x) => x.time)),
		ENZ: Math.max(...hundredthData.ENZ.map((x) => x.time)),
		average: Math.max(...quarterlyData.average.map((x) => x.time)),
		offset: Math.max(...quarterlyData.offset.map((x) => x.time)),
		threshold: Math.max(...quarterlyData.threshold.map((x) => x.time)),
	};

	return (
		<Stack>
			<Stack direction="row">
				{percentRecieved === 0 ? (
					<NoDataIcon />
				) : percentRecieved < 0.5 ? (
					<ALittleDataIcon />
				) : percentRecieved < 0.8 ? (
					<SomeDataIcon />
				) : percentRecieved < 0.9 ? (
					<MostDataIcon />
				) : (
					<AllDataIcon />
				)}
				<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
					{percentRecieved === 0
						? "Connecting..."
						: Math.round(percentRecieved * 100).toString() +
						  "% of packets recieved"}
				</Typography>
			</Stack>
			<Stack direction="row">
				<LatencyIcon />
				<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
					Latency: {Math.round(latency / 100) / 10} second
					{Math.round(latency / 100) / 10 === 1 ? "" : "s"}
				</Typography>
			</Stack>
			<Box height={200}>
				<ResponsiveLineCanvas
					data={[
						{
							id: "line-1",
							color: "hsl(72, 70%, 50%)",
							data: quarterlyData.threshold.map((i) => ({
								x: (maxTime.threshold - i.time) / 1000,
								y: i.value,
							})),
						},
					]}
					margin={{ top: 50, right: 160, bottom: 50, left: 60 }}
					xScale={{ type: "linear" }}
					yScale={{
						type: "linear",
						stacked: true,
						min: 0,
						max: 2500,
					}}
					yFormat=" >-.2f"
					axisRight={{
						tickValues: [0, 500, 1000, 1500, 2000, 2500],
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: ".2s",
						legend: "",
						legendOffset: 0,
					}}
					axisBottom={{
						tickValues: [0, 20, 40, 60, 80, 100, 120],
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: ".2f",
						legend: "Time",
						legendOffset: 36,
						legendPosition: "middle",
					}}
					axisLeft={{
						tickValues: [0, 500, 1000, 1500, 2000, 2500],
						tickSize: 5,
						tickPadding: 5,
						tickRotation: 0,
						format: ".2s",
						legend: "Shakyness",
						legendOffset: -40,
						legendPosition: "middle",
					}}
					enableGridX
					colors={{ scheme: "spectral" }}
					lineWidth={1}
					enablePoints={false}
					gridXValues={[0, 20, 40, 60, 80, 100, 120]}
					gridYValues={[0, 500, 1000, 1500, 2000, 2500]}
				/>
			</Box>
		</Stack>
	);
}
