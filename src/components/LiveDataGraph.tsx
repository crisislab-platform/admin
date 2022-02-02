import { Button, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";

import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { LoadingSpinner } from "./index";
import { ResponsiveLineCanvas } from "@nivo/line";
import { ShakingDataChannel } from "../types";
import { SimpleDataGraph } from "./SimpleDataGraph.jsx";

// const data = Array.from(Array(10000)).map(() =>
// 	Math.floor(Math.random() * 4000),
// );

const liveDataWebsocketURI = "wss://ingest-worker.benhong.workers.dev/consume";

const useIframe = false;
const useBensCode = true;

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
	if (useBensCode) {
		return (
			<Stack gap={1}>
				<span>
					<Button
						variant="outlined"
						color="primary"
						startIcon={<FullscreenIcon />}
						href={`https://ingest-worker.benhong.workers.dev/consume/${sensorID}`}>
						Open in full-screen
					</Button>
				</span>
				<SimpleDataGraph sensorId={sensorID} />
			</Stack>
		);
	}
	return <_LiveDataGraphs sensorID={sensorID} />;
}

function _LiveDataGraphs({ sensorID }: { sensorID: string }) {
	const [socket, setSocket] = useState<null | WebSocket>(null);
	const [socketState, setSocketState] = useState<
		null | "CLOSED" | "OPEN" | "ERRORED" | "CONNECTED"
	>(null);
	const [channels, setChannels] = useState<Set<string>>(new Set());
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
		if (!channels.has(channel)) {
			setChannels((oldChannels) => oldChannels.add(channel));
		}
		setData((oldData) => {
			// console.log(oldData);
			return oldData
				? {
						...oldData,
						[channel]: [
							...(oldData[channel] || []),
							...measurments.map((m) => m + 9999999),
						],
				  }
				: {
						[channel]: measurments.map((m) => m + 9999999),
				  };
		});
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
			console.info("Closing socket");
			ws.close();
			setSocket(null);
		};
	}, [sensorID, setSocket]);

	return (
		<>
			{socket ? (
				socketState === "CONNECTED" ? (
					data ? (
						<Stack gap={2}>
							{Array.from(channels)
								.sort()
								.map((channel) => (
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
											height: (theme) =>
												theme.spacing(25),
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
										{data[channel] ? (
											<ResponsiveLineCanvas
												data={[
													{
														id: "shakingData",
														color: "red",
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
													min: -250000,
													max: 250000,
												}}
												yFormat=" >-.2f"
												axisTop={null}
												axisRight={null}
												axisBottom={{
													tickValues: [
														0, 20, 40, 60, 80, 100,
														120,
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
														-25000, -20000, -15000,
														-10000, -5000, 0, 5000,
														10000, 15000, 20000,
														25000,
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
												pointColor={{
													theme: "background",
												}}
												pointBorderWidth={1}
												pointBorderColor={{
													from: "serieColor",
												}}
												isInteractive={false}
												gridXValues={[
													0, 20, 40, 60, 80, 100, 120,
												]}
												gridYValues={[
													0, 500, 1000, 1500, 2000,
													2500,
												]}
												legends={[]}
											/>
										) : (
											<Typography>
												No data found for channel{" "}
												{channel}
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
