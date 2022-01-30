import {
	BasicSensorInfo,
	LiveDataGraph,
	LoadingSpinner,
	MissingPermission,
	useUser,
} from "../../components";
import { Box, Fab, Stack, Tooltip, Typography } from "@mui/material";
import { WindowOutlined, WindowSharp } from "@mui/icons-material";
import { useEffect, useState } from "react";

import ReloadIcon from "@mui/icons-material/Refresh";
import { ShakingDataChannel } from "../../types";
import { sensorsAPIBase } from "../../utils";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";

const liveDataWebsocketURI = "wss://ingest-worker.benhong.workers.dev/consume";

export function SensorInfo() {
	const { sensorID } = useParams();
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
		return closeSocket;
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
