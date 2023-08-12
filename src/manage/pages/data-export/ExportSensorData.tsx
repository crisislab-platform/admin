import { useQuery } from "react-query";
import useAuth from "../../../auth/useAuth";
import { makeFetchSensors } from "../../../api";
import {
	Alert,
	AlertTitle,
	Autocomplete,
	Button,
	CircularProgress,
	LinearProgress,
	Link,
	Paper,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { useState } from "react";
import { Sensor } from "../../../types";
import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers";

export function ExportSensorDataPage() {
	const { user } = useAuth();
	const sensorsQuery = useQuery("sensors", makeFetchSensors(user?.token));
	const [chosenSensor, setChosenSensor] = useState<Sensor | null>(null);
	const [downloading, setDownloading] = useState(false);
	const [error, setError] = useState<null | string>(null);

	const [fromDate, setFromDate] = useState<Dayjs | null>(
		dayjs(Date.now() - 60 * 1000),
	);
	const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
	const [downloadAbort, setDownloadAbort] = useState<AbortController | null>(
		null,
	);
	const [processedLines, setProcessedLines] = useState(0);
	const [totalLines, setTotalLines] = useState(0);

	async function startDownload() {
		if (
			!("showSaveFilePicker" in window) ||
			!("TransformStream" in window)
		) {
			alert(
				"Missing APIs. Try using latest Firefox or Chrome. Also this doesn't usually work on mobile.",
			);
			return;
		}

		const downloadAbortController = new AbortController();
		setDownloadAbort(downloadAbortController);

		let fileWriteStream: FileSystemWritableFileStream | null = null;
		let res: Response | null = null;

		try {
			setProcessedLines(0);
			setTotalLines(0);
			setDownloading(true);
			setError(null);

			res = await fetch(
				`${
					import.meta.env.DEV
						? "http://localhost:8080"
						: "https://crisislab-data.massey.ac.nz"
				}/api/v1/data-bulk-export?sensor_id=${chosenSensor.id}&from=${
					fromDate.toDate().getTime() / 1000
				}&to=${toDate.toDate().getTime() / 1000}`,
				{
					signal: downloadAbortController.signal,
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				},
			);

			const fileDownloadHandle =
				// @ts-expect-error This should be fixed eventually
				(await window.showSaveFilePicker({
					suggestedName: `sensor_${
						chosenSensor.id
					}_data_from_${fromDate.toISOString()}_to_${toDate.toISOString()}.tsv`,
				})) as FileSystemFileHandle;
			fileWriteStream =
				(await fileDownloadHandle.createWritable()) as FileSystemWritableFileStream;

			setTotalLines(parseInt(res.headers.get("X-Number-Of-Records")) + 1);

			res.body
				.pipeThrough(new TextDecoderStream())
				.pipeThrough(
					new TransformStream({
						transform(chunk, controller) {
							// const lines = new TextDecoder()
							// 	.decode(chunk)
							const lines = chunk.split("\n").length;
							setProcessedLines((oldAmount) => oldAmount + lines);
							controller.enqueue(chunk);
						},
					}),
				)
				.pipeTo(fileWriteStream, {
					signal: downloadAbortController.signal,
				})
				.then(() => {
					setDownloading(false);
				})
				.catch((err) => {
					setDownloading(false);
					setError(err);
					console.error("stream error:", err);
				});
		} catch (err) {
			setDownloading(false);
			setError(err);
			console.error("fetch error:", err);
		}
	}

	return (
		<Stack gap={1} p={1}>
			{!("showSaveFilePicker" in window) && (
				<Alert severity="warning">
					<AlertTitle>
						Downloads won't work in this browser!
					</AlertTitle>
					Downloads will only really work on latest version desktop
					Chrome. Firefox will work as well once{" "}
					<Link href="https://mozilla.github.io/standards-positions/#native-file-system">
						this issue
					</Link>{" "}
					is resolved.
				</Alert>
			)}
			<Alert severity="info">
				If you get a network/fetch error, try disabling your ad-blocker
				or reloading the page.
			</Alert>
			<Paper component="fieldset" variant="outlined" sx={{ p: 2 }}>
				<legend>
					<Typography variant="caption">Export options</Typography>
				</legend>
				<Stack gap={2}>
					<Autocomplete
						options={
							sensorsQuery.data
								? Object.values(sensorsQuery.data.sensors)
								: []
						}
						disabled={sensorsQuery.isLoading}
						getOptionLabel={(option) =>
							`${option.secondary_id} (#${option.id})`
						}
						renderInput={(params) => (
							<TextField {...params} label="Sensor" />
						)}
						onChange={(_, newValue) => setChosenSensor(newValue)}
						value={chosenSensor}
					/>
					<Stack gap={2} direction="row">
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DateTimePicker
								label="From"
								value={fromDate}
								onChange={(newValue) => setFromDate(newValue)}
							/>
							<DateTimePicker
								label="To"
								value={toDate}
								onChange={(newValue) => setToDate(newValue)}
							/>
						</LocalizationProvider>
					</Stack>
				</Stack>
			</Paper>
			<Stack direction="row" gap={1}>
				<Button
					variant="contained"
					disabled={!chosenSensor || downloading}
					onClick={startDownload}>
					Begin download
				</Button>
				<Button
					disabled={!downloading || !downloadAbort}
					onClick={() => {
						downloadAbort.abort("User cancelled download");
						setDownloading(false);
					}}>
					Cancel download
				</Button>
			</Stack>
			<LinearProgress
				variant={
					processedLines > totalLines
						? "indeterminate"
						: "determinate"
				}
				value={(processedLines * 100) / totalLines}
			/>

			<Typography>
				{processedLines} / {totalLines}
			</Typography>
			{downloading && (
				<Stack direction="row" gap={2}>
					<Typography>Downloading... </Typography>
					<CircularProgress variant="indeterminate" size="25px" />
				</Stack>
			)}

			{error && (
				<Alert severity="error">
					<AlertTitle>Error exporting data</AlertTitle>
					{error.toString()}
				</Alert>
			)}
		</Stack>
	);
}
