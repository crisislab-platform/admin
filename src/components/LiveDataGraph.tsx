import {
	Alert,
	Box,
	Collapse,
	Fab,
	Paper,
	Stack,
	Tooltip,
	Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

import { LoadingSpinner } from "./index";
import ReloadIcon from "@mui/icons-material/Refresh";
import { ResponsiveLineCanvas } from "@nivo/line";
import { ShakingDataChannel } from "../types";

// const data = Array.from(Array(10000)).map(() =>
// 	Math.floor(Math.random() * 4000),
// );

const liveDataWebsocketURI = "wss://ingest-worker.benhong.workers.dev/consume";

const useIframe = false;

export function LiveDataGraphs({ sensorID }: { sensorID: string }) {
	if (useIframe) {
		return (
			<iframe
				src={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}
				height={512}
				style={{ overflowY: "hidden" }}
			/>
		);
	}
	return <_LiveDataGraphs sensorID={sensorID} />;
}

function _LiveDataGraphs({ sensorID }: { sensorID: string }) {
	const [socket, setSocket] = useState<null | WebSocket>(null);
	const [socketState, setSocketState] = useState<
		null | "CLOSED" | "OPEN" | "ERRORED" | "CONNECTED"
	>(null);
	const [channels, setChannels] = useState<string[]>([]);
	const [data, setData] = useState<null | { [key: string]: number[] }>(null);

	function onOpen() {
		console.info("Socket opened");
		setSocketState("OPEN");
	}
	function onClose() {
		console.info("Socket closed");
		setSocketState("CLOSED");
	}
	function onError(e) {
		console.warn("Socket errored", e);
		setSocketState("ERRORED");
	}
	function onMessage(message: { data: string }) {
		// Show loading state until messages actually start coming through
		setSocketState("CONNECTED");
		const [channel, timestamp, ...measurments] = JSON.parse(
			message.data,
		) as [ShakingDataChannel, number, ...number[]];
		setData((oldData) =>
			oldData
				? {
						...oldData,
						[channel]: [
							...(oldData[channel] || []),
							...measurments.map((m) => m + 9999999),
						],
				  }
				: {
						[channel]: measurments.map((m) => m + 9999999),
				  },
		);
	}
	useEffect(() => {
		console.info("Opening socket");
		const ws = new WebSocket(`${liveDataWebsocketURI}/${sensorID}`);
		ws.addEventListener("message", onMessage);
		ws.addEventListener("open", onOpen);
		ws.addEventListener("close", onClose);
		ws.addEventListener("error", onError);
		setSocket(ws);

		return () => {
			if (!socket) return;
			console.info("Closing socket");
			socket.close();
			setSocket(null);
		};
	}, [sensorID]);

	return (
		<>
			{socket ? (
				socketState === "CONNECTED" ? (
					data ? (
						<Stack gap={2}>
							{channels.map((channel) => (
								<Paper
									key={channel}
									variant="outlined"
									sx={{
										p: 1,
										display: "inline-flex",
										flexDirection: "column",
										gap: 1,
										minWidth: "min-content",
										whiteSpace: "nowrap",
									}}
									onWheel={(e) => {
										if (e.movementX !== 0) return;
										// enqueueSnackbar(
										// 	"Use Shift+Scrollwheel to scroll horizontally.",
										// );
									}}>
									<Typography variant="h6">
										{`${channel} channel`}
									</Typography>
									{!!data[channel] ? (
										<ResponsiveLineCanvas
											data={[
												{
													id: "shakingData",
													data: data[channel].map(
														(m, i) => ({
															x: i,
															y: m,
														}),
													),
												},
											]}
											margin={{
												top: 50,
												right: 160,
												bottom: 50,
												left: 60,
											}}
											xScale={{ type: "linear" }}
											yScale={{
												type: "linear",
												stacked: true,
												min: 0,
												max: 2500,
											}}
											yFormat=" >-.2f"
											axisTop={null}
											axisRight={{
												tickValues: [
													0, 500, 1000, 1500, 2000,
													2500,
												],
												tickSize: 5,
												tickPadding: 5,
												tickRotation: 0,
												format: ".2s",
												legend: "",
												legendOffset: 0,
											}}
											axisBottom={{
												tickValues: [
													0, 20, 40, 60, 80, 100, 120,
												],
												tickSize: 5,
												tickPadding: 5,
												tickRotation: 0,
												format: ".2f",
												legend: "price",
												legendOffset: 36,
												legendPosition: "middle",
											}}
											axisLeft={{
												tickValues: [
													0, 500, 1000, 1500, 2000,
													2500,
												],
												tickSize: 5,
												tickPadding: 5,
												tickRotation: 0,
												format: ".2s",
												legend: "volume",
												legendOffset: -40,
												legendPosition: "middle",
											}}
											enableGridX={false}
											colors={{ scheme: "spectral" }}
											lineWidth={1}
											enablePoints={false}
											pointSize={4}
											pointColor={{ theme: "background" }}
											pointBorderWidth={1}
											pointBorderColor={{
												from: "serieColor",
											}}
											isInteractive={false}
											gridXValues={[
												0, 20, 40, 60, 80, 100, 120,
											]}
											gridYValues={[
												0, 500, 1000, 1500, 2000, 2500,
											]}
											legends={[]}
										/>
									) : (
										<Typography>
											No data found for channel {channel}
										</Typography>
									)}
								</Paper>
							))}
						</Stack>
					) : (
						<Typography>No data</Typography>
					)
				) : socketState === "CLOSED" ? (
					<Typography>Socket closed</Typography>
				) : (
					<LoadingSpinner message="Connecting" />
				)
			) : (
				<Typography>Socket is null</Typography>
			)}
		</>
	);
}
