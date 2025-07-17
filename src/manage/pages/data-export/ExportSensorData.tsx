import {
	Alert,
	AlertTitle,
	Autocomplete,
	Button,
	CircularProgress,
	FormControl,
	FormControlLabel,
	FormLabel,
	LinearProgress,
	Link,
	Paper,
	Radio,
	RadioGroup,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import useAuth from "../../../auth/useAuth";
import { useGetQueryParam } from "../../../auth/utils";
import { SensorSelector } from "../../../components";
import { Sensor } from "../../../types";
import {
	APIBase,
	formatBytes,
	sensorTypeChannels,
	setQueryParams,
} from "../../../utils";

const exportTypes: Record<
	string,
	{ channelCount: number; displayName: string }
> = {
	miniseed3: {
		channelCount: 1,
		displayName: "miniSEED V3",
	},
	tsv1: {
		channelCount: Infinity,
		displayName: "CSV file (TSV)",
	},
};

export function ExportSensorDataPage() {
	const { user } = useAuth();
	const defaultSensorID = useGetQueryParam("export_data_sensor_id");
	const [chosenSensor, setChosenSensor] = useState<Sensor | null>(null);
	const [exportFormat, setExportFormat] =
		useState<keyof typeof exportTypes>("tsv1");
	const [selectedChannels, setSelectedChannels] = useState<String[]>([]);
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
	const [bytesDownloaded, setBytesDownloaded] = useState(0);
	const [totalBytes, setTotalBytes] = useState(0);

	useEffect(() => {
		if (chosenSensor === null) return;
		setQueryParams({
			export_data_sensor_id: chosenSensor?.id + "",
		});
	}, [chosenSensor]);

	// Function so that it can be used in effects without going stale
	const singleChannel = () => exportTypes[exportFormat].channelCount === 1;

	useEffect(() => {
		if (singleChannel()) {
			setSelectedChannels(
				chosenSensor?.type && chosenSensor?.type in sensorTypeChannels
					? [sensorTypeChannels[chosenSensor.type][0]]
					: ["All"],
			);
		} else {
			setSelectedChannels(
				chosenSensor?.type && chosenSensor?.type in sensorTypeChannels
					? sensorTypeChannels[chosenSensor.type]
					: ["All"],
			);
		}
	}, [exportFormat, chosenSensor?.type]);

	const progress =
		exportFormat === "tsv1"
			? totalLines === 0
				? 0
				: processedLines > totalLines
				? 100
				: (processedLines * 100) / totalLines
			: totalBytes === 0
			? 0
			: bytesDownloaded > totalBytes
			? 100
			: (bytesDownloaded * 100) / totalBytes;

	async function startDownload() {
		if (!chosenSensor || !fromDate || !toDate || !user) return;

		// Check that we have the APIs we need
		if (
			!("showSaveFilePicker" in window) ||
			!("TransformStream" in window)
		) {
			alert("Missing APIs. Try using latest Chrome desktop.");
			return;
		}

		// This is so that the cancel button works
		const downloadAbortController = new AbortController();
		setDownloadAbort(downloadAbortController);

		try {
			// Reset stuff
			setProcessedLines(0);
			setTotalLines(0);
			setTotalBytes(0);
			setBytesDownloaded(0);
			setDownloading(true);
			setError(null);

			// We await this to get the headers, but not the whole body
			const res = await fetch(
				`${APIBase}/db/data-bulk-export?sensor_id=${
					chosenSensor.id
				}&channels=${selectedChannels.join(
					",",
				)}&format=${exportFormat}&from=${
					fromDate.toDate().getTime() / 1000
				}&to=${toDate.toDate().getTime() / 1000}`,
				{
					signal: downloadAbortController.signal,
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				},
			);

			if (!res.ok) {
				setDownloading(false);
				setError(
					`${res.statusText}! (${res.status}) ` + (await res.text()),
				);
				return;
			}

			if (exportFormat === "miniseed3") {
				setTotalBytes(Number(res.headers.get("Content-Length")));
			} else {
				// This is for the progress bar
				const _totalLines = parseInt(
					res.headers.get("X-Number-Of-Records") ?? "1",
				);
				if (_totalLines === 0) {
					setDownloading(false);
					setError(
						`No records found for sensor #${chosenSensor.id} in that time range.`,
					);
					return;
				}
				// This is the extra line for the column headers
				setTotalLines(_totalLines + 1);
			}

			const extension = exportFormat === "tsv1" ? "tsv" : "mseed3";

			// Now we ask where the user wants to save the file, and get a handle
			// to write to it
			const fileDownloadHandle =
				// @ts-expect-error This should be fixed eventually
				(await window.showSaveFilePicker({
					suggestedName: `sensor_${
						chosenSensor.id
					}_data_from_${fromDate.toISOString()}_to_${toDate.toISOString()}.${extension}`,
				})) as FileSystemFileHandle;
			const fileWriteStream =
				(await fileDownloadHandle.createWritable()) as FileSystemWritableFileStream;

			// This is where the magic happens.
			let stream = res.body?.pipeThrough(
				new TransformStream({
					transform(chunk, controller) {
						setBytesDownloaded(
							(oldAmount) => oldAmount + chunk.length,
						);
						controller.enqueue(chunk);
					},
				}),
			);

			// We DO NOT want to decode miniSEED to text
			// (this caused me so much pain and suffering during development)
			if (exportFormat === "tsv1") {
				stream = stream
					// For the line counting, we convert to text,
					?.pipeThrough(new TextDecoderStream(), {
						signal: downloadAbortController.signal,
					})
					.pipeThrough(
						// By piping it 'through' a 'transformer' that just counts
						// newlines before passing it on
						new TransformStream({
							transform(chunk, controller) {
								// Count the number of '\n's
								const lines = chunk.split("\n").length - 1;
								setProcessedLines(
									(oldAmount) => oldAmount + lines,
								);
								controller.enqueue(chunk);
							},
						}),
						{ signal: downloadAbortController.signal },
					);
			}

			// Then we record stats on number of lines
			stream
				// Lastly we just pipe it into the file
				?.pipeTo(fileWriteStream, {
					signal: downloadAbortController.signal,
				})
				// This happens when we successfully save the file
				.then(() => {
					setDownloading(false);
					alert("Data file saved successfully!");
				})
				// And handle errors with the streams
				.catch((err) => {
					setDownloading(false);
					setError(err);
					console.error("stream error:", err);
				});
		} catch (err) {
			// This handles fetch errors
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
					<FormControl required>
						<FormLabel id="export-format-group-label">
							Export format
						</FormLabel>
						<RadioGroup
							row
							aria-labelledby="export-format-group-label"
							name="export-format-group"
							value={exportFormat}
							onChange={(event) =>
								setExportFormat(event.target.value)
							}>
							{Object.entries(exportTypes).map(
								([type, { displayName }]) => (
									<FormControlLabel
										key={type}
										value={type}
										control={<Radio />}
										label={displayName}
									/>
								),
							)}
						</RadioGroup>
					</FormControl>
					<SensorSelector
						label="Sensor"
						onChange={setChosenSensor}
						sensor={chosenSensor}
						onLoaded={(sensors) => {
							if (chosenSensor !== null) return;

							const sensor =
								(defaultSensorID
									? sensors[parseInt(defaultSensorID)]
									: null) ??
								Object.values(sensors)[0] ??
								null;

							setChosenSensor(sensor);
						}}
					/>
					<Autocomplete
						options={
							chosenSensor?.type &&
							chosenSensor?.type in sensorTypeChannels
								? sensorTypeChannels[chosenSensor.type]
								: ["All"]
						}
						multiple={singleChannel() ? false : true}
						disabled={chosenSensor === null}
						renderInput={(params) => (
							<TextField
								required
								{...params}
								label={
									"Data channel" +
									(singleChannel() ? "" : "s")
								}
							/>
						)}
						onChange={(_, newValue) => {
							if (singleChannel()) {
								// @ts-expect-error Just deal with it okay
								setSelectedChannels([newValue]);
							} else {
								// @ts-expect-error Just deal with it okay
								setSelectedChannels(newValue);
							}
						}}
						value={
							singleChannel()
								? selectedChannels[0] ?? "All"
								: selectedChannels
						}
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
						downloadAbort?.abort("User cancelled download");
						setDownloading(false);
					}}>
					Cancel download
				</Button>
			</Stack>
			<LinearProgress
				variant={
					!downloading
						? "determinate"
						: processedLines > totalLines
						? "indeterminate"
						: "determinate"
				}
				value={progress}
			/>

			<Typography sx={{ fontFamily: "monospace" }}>
				{(Math.round(progress * 10) / 10).toFixed(1)}% done (
				{exportFormat === "tsv1" ? (
					<>
						{processedLines} / {totalLines} records
					</>
				) : (
					<>
						{formatBytes(bytesDownloaded)} /{" "}
						{formatBytes(totalBytes)}
					</>
				)}{" "}
				downloaded)
			</Typography>
			{exportFormat === "tsv1" && (
				<Stack direction="row" gap={2}>
					<Typography sx={{ fontFamily: "monospace" }}>
						Downloaded {formatBytes(bytesDownloaded)}
					</Typography>{" "}
					{downloading && (
						<CircularProgress variant="indeterminate" size="18px" />
					)}
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
