import { ResponsiveLineCanvas } from "@nivo/line";
import { Box, Stack, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useMeasure } from "react-use";
import { useAuth0 } from "@auth0/auth0-react";
import { LoginButton, LogoutButton } from "./Auth";
import { MotionData } from "./types";

import NoDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet0Bar";
import ALittleDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet1Bar";
import SomeDataIcon from "@mui/icons-material/SignalCellularConnectedNoInternet2Bar";
import MostDataIcon from "@mui/icons-material/SignalCellular3Bar";
import AllDataIcon from "@mui/icons-material/SignalCellular4Bar";
import LatencyIcon from "@mui/icons-material/HourglassEmpty";

export default function LiveDataGraphs() {
	const { user, isAuthenticated, isLoading } = useAuth0();

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

	if (isLoading) {
		return (
			<Stack direction="row" alignItems="center">
				<CircularProgress size={20} />
				<Typography sx={{ ml: (theme) => theme.spacing(1) }}>
					Logging in...
				</Typography>
			</Stack>
		);
	}

	if (!isAuthenticated) {
		return <LoginButton message="Log in to view live data" />;
	}

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
							data: testingData,
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
			<LogoutButton />
		</Stack>
	);
}

const testingData = [
	{
		x: 0,
		y: 80,
	},
	{
		x: 1,
		y: 113,
	},
	{
		x: 2,
		y: 149,
	},
	{
		x: 3,
		y: 104,
	},
	{
		x: 4,
		y: 48,
	},
	{
		x: 5,
		y: 277,
	},
	{
		x: 6,
		y: 216,
	},
	{
		x: 7,
		y: 254,
	},
	{
		x: 8,
		y: 51,
	},
	{
		x: 9,
		y: 143,
	},
	{
		x: 10,
		y: 142,
	},
	{
		x: 11,
		y: 258,
	},
	{
		x: 12,
		y: 269,
	},
	{
		x: 13,
		y: 66,
	},
	{
		x: 14,
		y: 289,
	},
	{
		x: 15,
		y: 32,
	},
	{
		x: 16,
		y: 118,
	},
	{
		x: 17,
		y: 260,
	},
	{
		x: 18,
		y: 125,
	},
	{
		x: 19,
		y: 191,
	},
	{
		x: 20,
		y: 130,
	},
	{
		x: 21,
		y: 80,
	},
	{
		x: 22,
		y: 104,
	},
	{
		x: 23,
		y: 162,
	},
	{
		x: 24,
		y: 61,
	},
	{
		x: 25,
		y: 112,
	},
	{
		x: 26,
		y: 239,
	},
	{
		x: 27,
		y: 113,
	},
	{
		x: 28,
		y: 57,
	},
	{
		x: 29,
		y: 46,
	},
	{
		x: 30,
		y: 269,
	},
	{
		x: 31,
		y: 1,
	},
	{
		x: 32,
		y: 219,
	},
	{
		x: 33,
		y: 1,
	},
	{
		x: 34,
		y: 114,
	},
	{
		x: 35,
		y: 92,
	},
	{
		x: 36,
		y: 139,
	},
	{
		x: 37,
		y: 253,
	},
	{
		x: 38,
		y: 114,
	},
	{
		x: 39,
		y: 46,
	},
	{
		x: 40,
		y: 22,
	},
	{
		x: 41,
		y: 26,
	},
	{
		x: 42,
		y: 95,
	},
	{
		x: 43,
		y: 127,
	},
	{
		x: 44,
		y: 14,
	},
	{
		x: 45,
		y: 95,
	},
	{
		x: 46,
		y: 220,
	},
	{
		x: 47,
		y: 88,
	},
	{
		x: 48,
		y: 52,
	},
	{
		x: 49,
		y: 281,
	},
	{
		x: 50,
		y: 133,
	},
	{
		x: 51,
		y: 37,
	},
	{
		x: 52,
		y: 66,
	},
	{
		x: 53,
		y: 255,
	},
	{
		x: 54,
		y: 206,
	},
	{
		x: 55,
		y: 69,
	},
	{
		x: 56,
		y: 58,
	},
	{
		x: 57,
		y: 117,
	},
	{
		x: 58,
		y: 123,
	},
	{
		x: 59,
		y: 148,
	},
	{
		x: 60,
		y: 76,
	},
	{
		x: 61,
		y: 167,
	},
	{
		x: 62,
		y: 13,
	},
	{
		x: 63,
		y: 116,
	},
	{
		x: 64,
		y: 65,
	},
	{
		x: 65,
		y: 230,
	},
	{
		x: 66,
		y: 294,
	},
	{
		x: 67,
		y: 282,
	},
	{
		x: 68,
		y: 156,
	},
	{
		x: 69,
		y: 224,
	},
	{
		x: 70,
		y: 39,
	},
	{
		x: 71,
		y: 13,
	},
	{
		x: 72,
		y: 247,
	},
	{
		x: 73,
		y: 282,
	},
	{
		x: 74,
		y: 147,
	},
	{
		x: 75,
		y: 106,
	},
	{
		x: 76,
		y: 230,
	},
	{
		x: 77,
		y: 267,
	},
	{
		x: 78,
		y: 208,
	},
	{
		x: 79,
		y: 268,
	},
	{
		x: 80,
		y: 214,
	},
	{
		x: 81,
		y: 202,
	},
	{
		x: 82,
		y: 13,
	},
	{
		x: 83,
		y: 253,
	},
	{
		x: 84,
		y: 220,
	},
	{
		x: 85,
		y: 271,
	},
	{
		x: 86,
		y: 155,
	},
	{
		x: 87,
		y: 90,
	},
	{
		x: 88,
		y: 47,
	},
	{
		x: 89,
		y: 9,
	},
	{
		x: 90,
		y: 282,
	},
	{
		x: 91,
		y: 82,
	},
	{
		x: 92,
		y: 36,
	},
	{
		x: 93,
		y: 123,
	},
	{
		x: 94,
		y: 140,
	},
	{
		x: 95,
		y: 272,
	},
	{
		x: 96,
		y: 140,
	},
	{
		x: 97,
		y: 133,
	},
	{
		x: 98,
		y: 207,
	},
	{
		x: 99,
		y: 150,
	},
	{
		x: 100,
		y: 26,
	},
	{
		x: 101,
		y: 265,
	},
	{
		x: 102,
		y: 48,
	},
	{
		x: 103,
		y: 110,
	},
	{
		x: 104,
		y: 12,
	},
	{
		x: 105,
		y: 248,
	},
	{
		x: 106,
		y: 124,
	},
	{
		x: 107,
		y: 187,
	},
	{
		x: 108,
		y: 272,
	},
	{
		x: 109,
		y: 297,
	},
	{
		x: 110,
		y: 115,
	},
	{
		x: 111,
		y: 182,
	},
	{
		x: 112,
		y: 81,
	},
	{
		x: 113,
		y: 300,
	},
	{
		x: 114,
		y: 75,
	},
	{
		x: 115,
		y: 69,
	},
	{
		x: 116,
		y: 215,
	},
	{
		x: 117,
		y: 273,
	},
	{
		x: 118,
		y: 252,
	},
	{
		x: 119,
		y: 239,
	},
	{
		x: 120,
		y: 76,
	},
];
