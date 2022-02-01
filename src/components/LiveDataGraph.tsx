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

export function LiveDataGraph({
	title,
	showScrollHint = true,
	lineColour,
	channel,
}: {
	title?: string;
	showScrollHint?: boolean;
	lineColour?: string;
	channel: ShakingDataChannel;
}) {
	const { enqueueSnackbar } = useSnackbar();
	const containerRef = useRef<null | HTMLDivElement>(null);
	const [autoScrolling, setAutoScrolling] = useState(true);

	useEffect(() => {
		if (window.shakingData) {
			let b = 0;
			let previous = window.shakingData[channel][0];
			let wasAtEnd = true;
			const interval = setInterval(() => {
				if (
					containerRef?.current &&
					window.shakingData[channel] &&
					window.shakingData[channel].length - 1 >= b
				) {
					// Add 25 elements to the container
					const parent = document.createElement("span");
					parent.classList.add("parent");
					for (let i = 0; i < 25; i++) {
						const div = document.createElement("span");
						div.classList.add("div");
						const current = window.shakingData[channel][b * 25 + i];
						div.style.height = current / 50 + "px";
						div.style.width = 1 / devicePixelRatio + "px";
						// div.style.backgroundColor = "black";
						if (previous < current) {
							div.style.borderTop =
								1 / devicePixelRatio +
								(current - previous) / 50 +
								"px solid currentColor";
							div.style.boxSizing = "border-box";
						} else {
							div.style.borderTop =
								1 / devicePixelRatio +
								(previous - current) / 50 +
								"px solid currentColor";
							div.style.boxSizing = "content-box";
						}
						// console.log(previous, current, div.style.height, div.style.borderTop)
						previous = window.shakingData[channel][b * 25 + i];
						parent.appendChild(div);
					}
					// console.log(
					// 	containerRef.current.scrollWidth,
					// 	containerRef.current.scrollLeft,
					// 	containerRef.current.scrollLeft +
					// 		containerRef.current.clientWidth,
					// );
					const isAtEnd =
						containerRef.current.scrollWidth -
							(containerRef.current.scrollLeft +
								containerRef.current.clientWidth) <=
						5 + 25 / devicePixelRatio;
					containerRef.current.appendChild(parent);
					if (isAtEnd) {
						if (!wasAtEnd) setAutoScrolling(true);
						containerRef.current.scrollLeft =
							containerRef.current.scrollWidth;
						wasAtEnd = true;
					} else {
						if (wasAtEnd) setAutoScrolling(false);
						wasAtEnd = false;
					}
					b++;
				}
			}, 250);
			return () => {
				clearInterval(interval);
			};
		}
	}, [containerRef, setAutoScrolling]);
	return (
		<Paper
			variant="outlined"
			sx={{
				p: 1,
				display: "inline-flex",
				flexDirection: "column",
				gap: 1,
			}}
			onWheel={(e) => {
				if (e.movementX !== 0) return;
				// enqueueSnackbar(
				// 	"Use Shift+Scrollwheel to scroll horizontally.",
				// );
			}}>
			<Typography variant="h6">
				{title || `${channel} channel`}
			</Typography>
			<Box
				className="LiveDataGraph"
				ref={containerRef}
				sx={{
					overflowX: "scroll",
					height: "125px",
					maxHeight: "125px",
					width: "auto",
					display: "flex",
					alignItems: "center",
					whiteSpace: "nowrap",
					"& > .parent": {
						contentVisibility: "auto",
						containIntrinsicSize: 25 / devicePixelRatio + "px 0px",
						"& > .div": {
							color: lineColour
								? lineColour
								: (theme) => theme.palette.error.main,
							display: "inline-block",
						},
					},
				}}></Box>
			{showScrollHint && (
				<Collapse in={!autoScrolling}>
					<Alert severity="info" variant="outlined">
						To start auto-scrolling again, scroll the graph all the
						way to the right.
					</Alert>
				</Collapse>
			)}
		</Paper>
	);
}

export function LiveDataGraphs({ sensorID }: { sensorID: string }) {
	const [socket, setSocket] = useState<null | WebSocket>(null);
	const [socketState, setSocketState] = useState<
		null | "CLOSED" | "OPEN" | "ERRORED"
	>(null);

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
	function openSocket() {
		window.shakingData = {
			EHZ: [],
			ENE: [],
			ENZ: [],
			ENN: [],
		};
		console.info("Opening socket");
		const ws = new WebSocket(`${liveDataWebsocketURI}/${sensorID}`);
		ws.addEventListener("message", (message: { data: string }) => {
			const allData = JSON.parse(message.data) as [
				ShakingDataChannel,
				...number[]
			];
			const type = allData[0];
			// console.log(type);
			const data = allData.slice(1) as number[];
			for (const lump of data) {
				if (!window.shakingData) {
					window.shakingData = {
						EHZ: [],
						ENE: [],
						ENZ: [],
						ENN: [],
					};
				}
				console.log(lump);
				window.shakingData[type].push(lump);
			}
		});
		ws.addEventListener("open", onOpen);
		ws.addEventListener("close", onClose);
		ws.addEventListener("error", onError);
		setSocket(ws);
	}
	function closeSocket() {
		if (!socket) return;
		console.info("Closing socket");
		socket.close();
		socket.removeEventListener("open", onOpen);
		socket.removeEventListener("close", onClose);
		socket.removeEventListener("error", onError);
		window.shakingData = null;
		setSocket(null);
	}

	useEffect(() => {
		openSocket();
		return () => closeSocket();
	}, [sensorID, setSocket]);

	return (
		<>
			{socket ? (
				socketState === "OPEN" ? (
					<Stack gap={2}>
						<LiveDataGraph channel="EHZ" />
						<LiveDataGraph channel="ENE" />
						<LiveDataGraph channel="ENZ" />
						<LiveDataGraph channel="ENN" />
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
						closeSocket();
						openSocket();
					}}>
					<ReloadIcon />
				</Fab>
			</Tooltip>
		</>
	);
}
