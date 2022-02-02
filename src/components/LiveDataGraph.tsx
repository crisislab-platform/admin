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
import { ShakingDataChannel } from "../types";
import { useSnackbar } from "notistack";

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

	const containerRef = useRef<null | HTMLDivElement>(null);
	const EHZContainerRef = useRef<null | HTMLDivElement>(null);
	const ENEContainerRef = useRef<null | HTMLDivElement>(null);
	const ENZContainerRef = useRef<null | HTMLDivElement>(null);
	const ENNContainerRef = useRef<null | HTMLDivElement>(null);

	const channelContainers = {
		EHZ: EHZContainerRef,
		ENE: ENEContainerRef,
		ENZ: ENZContainerRef,
		ENN: ENNContainerRef,
	};

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
	useEffect(() => {
		if (socketState === null) {
			const lastValues = {};
			const largestValues = {};
			const channelOffsets = {
				EHZ: 10000,
				ENN: 500000,
				ENZ: -2000000,
				ENE: 500000,
			};
			let lastTop = 0;
			let firstChannel;
			function onMessage(message: { data: string }) {
				// Show loading state until messages actually start coming through
				setSocketState("CONNECTED");
				const [channel, timestamp, ...measurments] = JSON.parse(
					message.data,
				) as [ShakingDataChannel, number, ...number[]];
				// if (!channelContainers[channel]) {
				// 	channelContainers[channel] = document.createElement("div");
				// 	channelContainers[channel].style.height = "12.5vh";
				// 	channelContainers[channel].style.top = lastTop + "vh";
				// 	channelContainers[channel].style.position = "absolute";
				// 	lastTop += 22;
				// 	containerRef.current?.appendChild(channelContainers[channel]);
				// }
				const container = channelContainers[channel]?.current;
				if (container) {
					const parent = document.createElement("span");
					parent.setAttribute(
						"style",
						`contain-intrinsic-size: ${25 / devicePixelRatio}px 0;`,
					);
					parent.classList.add("parent");

					for (const unoffsetMeasurement of measurments) {
						const measurement = unoffsetMeasurement + 9999999;
						lastValues[channel] ||= measurement;
						const div = document.createElement("span");
						div.classList.add("div");
						let styles: { [x: string]: any } = {
							width: 1 / devicePixelRatio + "px",
							height: measurement + "px",
						};
						if (lastValues[channel] < measurement) {
							styles.borderTop =
								1 / devicePixelRatio +
								(measurement - lastValues[channel]) +
								"vh solid red";
							styles.boxSizing = "border-box";
						} else {
							styles.borderTop =
								1 / devicePixelRatio +
								(lastValues[channel] - measurement) +
								"vh solid red";
							styles.boxSizing = "content-box";
						}
						Object.assign(div.style, styles);
						largestValues[channel] ||= 0;
						if (
							Math.abs(lastValues[channel] - measurement) >
							largestValues[channel]
						) {
							largestValues[channel] = Math.abs(
								lastValues[channel] - measurement,
							);
						}
						lastValues[channel] = measurement;
						parent.appendChild(div);
					}
					const isAtEnd =
						document.documentElement.scrollWidth -
							(document.documentElement.scrollLeft +
								document.documentElement.clientWidth) <=
						5 + 25 / devicePixelRatio;
					container.style.transform =
						"scaleY(" + 12.5 / largestValues[channel] + ")";
					container.appendChild(parent);
					if (isAtEnd && firstChannel === channel) {
						document.documentElement.scrollLeft =
							document.documentElement.scrollWidth;
					}
				}
			}

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
		}
	}, [
		sensorID,
		setSocket,
		socketState,
		containerRef,
		EHZContainerRef,
		ENEContainerRef,
		ENNContainerRef,
		ENZContainerRef,
	]);
	return (
		<>
			{socket ? (
				socketState === "CONNECTED" ? (
					<Stack
						gap={2}
						ref={containerRef}
						sx={{ minWidth: "min-content", whiteSpace: "nowrap" }}>
						{["EHZ", "ENE", "ENZ", "ENN"].map((c) => (
							<Paper
								key={c}
								variant="outlined"
								sx={{
									p: 1,
									display: "inline-flex",
									flexDirection: "column",
									gap: 1,
									width: "75vw",
								}}
								onWheel={(e) => {
									if (e.movementX !== 0) return;
									// enqueueSnackbar(
									// 	"Use Shift+Scrollwheel to scroll horizontally.",
									// );
								}}>
								<Typography variant="h6">
									{`${c} channel`}
								</Typography>
								<Box
									id={`${c}-channel-graph`}
									ref={channelContainers[c]}
									className="LiveDataGraph"
									sx={{
										overflow: "hidden",
										overflowX: "scroll",
										height: "125px",
										maxHeight: "125px",
										display: "flex",
										alignItems: "center",
										whiteSpace: "nowrap",
										// width: "auto",
										"& > .parent": {
											contentVisibility: "auto",
											containIntrinsicSize:
												25 / devicePixelRatio +
												"px 0px",
											"& > .div": {
												color: (theme) =>
													theme.palette.error.main,
												display: "inline-block",
											},
										},
									}}></Box>
							</Paper>
						))}
					</Stack>
				) : socketState === "CLOSED" ? (
					<Typography>Socket closed</Typography>
				) : (
					<LoadingSpinner message="Connecting" />
				)
			) : (
				<Typography>Socket is null</Typography>
			)}

			<Tooltip title="Reconnect websocket" placement="left">
				<Fab
					sx={{
						position: "fixed",
						bottom: (theme) => theme.spacing(2),
						right: (theme) => theme.spacing(2),
					}}
					color="primary"
					onClick={() => {
						setSocketState(null);
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>
		</>
	);
}
