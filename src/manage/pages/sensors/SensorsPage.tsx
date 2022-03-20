import { Button, Grid, Menu, MenuItem, Stack } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { CreateSensorDialog } from "./CreateSensorDialog";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Outlet } from "react-router-dom";
import { SensorSortKey } from "../../../types";
import { SensorsList } from "./SensorsList";
import SortIcon from "@mui/icons-material/Sort";
import useAuth from "../../../auth/useAuth";
import { useState } from "react";

type ExtendedSensorSortKey = {
	label: string;
	shortLabel?: string;
	value: SensorSortKey;
};
const sensorSortKeys: ExtendedSensorSortKey[] = [
	{ label: "ID", value: "id" },
	{ label: "Type", value: "type" },
	{ label: "Connection status", shortLabel: "Status", value: "online" },
];

export function SensorsPage() {
	const { user } = useAuth();
	const [createSensorDialogOpen, setCreateSensorDialogOpen] = useState(false);
	const [sortAscending, setSortAscending] = useState(false);
	const [sortBy, setSortBy] = useState<ExtendedSensorSortKey>(
		sensorSortKeys[0],
	);
	const [sortMenuAnchorEl, setSortMenuAnchorEl] =
		useState<null | HTMLElement>(null);
	const sortMenuOpen = Boolean(sortMenuAnchorEl);

	function onCreateSensorDialogClose() {
		setCreateSensorDialogOpen(false);
	}

	function onSortMenuClose() {
		setSortMenuAnchorEl(null);
	}

	function makeOnSortMenuClick(sortKey: ExtendedSensorSortKey) {
		return () => {
			onSortMenuClose();
			setSortBy(sortKey);
		};
	}

	return (
		<Grid container sx={{ w: "100%", h: "100%", flex: "1" }}>
			<Grid item xs={12} md={6}>
				<Stack>
					<Stack
						direction="row"
						padding={1}
						gap={1}
						alignItems="center"
						flexWrap="wrap">
						<Button
							startIcon={<SortIcon />}
							size="small"
							onClick={(event) =>
								setSortMenuAnchorEl(event.currentTarget)
							}
							id="sort-sensors-button"
							aria-controls={
								sortMenuOpen ? "sort-sensors-menu" : undefined
							}
							aria-haspopup="true"
							aria-expanded={sortMenuOpen ? "true" : undefined}>
							Sort by: {sortBy.shortLabel || sortBy.label}
						</Button>
						<Menu
							open={sortMenuOpen}
							anchorEl={sortMenuAnchorEl}
							onClose={onSortMenuClose}
							disableScrollLock={true}
							id="sort-sensors-menu"
							MenuListProps={{
								"aria-labelledby": "sort-sensors-button",
							}}>
							{sensorSortKeys.map((sortKey) => (
								<MenuItem
									key={sortKey.value}
									onClick={makeOnSortMenuClick(sortKey)}
									selected={sortBy.value === sortKey.value}>
									{sortKey.label}
								</MenuItem>
							))}
						</Menu>
						<Button
							startIcon={
								sortAscending ? (
									<ArrowUpwardIcon />
								) : (
									<ArrowDownwardIcon />
								)
							}
							size="small"
							onClick={() =>
								setSortAscending((oldValue) => !oldValue)
							}>
							{sortAscending ? "Ascending" : "Decending"}
						</Button>

						<Button startIcon={<FilterListIcon />} size="small">
							Filter
						</Button>

						{!!user &&
							user.roles.find(
								(role) => role.raw === "sensors:write",
							) && (
								<>
									<Button
										sx={{ ml: "auto" }}
										startIcon={<AddIcon />}
										variant="contained"
										size="small"
										onClick={() =>
											setCreateSensorDialogOpen(true)
										}>
										Create sensor
									</Button>
									<CreateSensorDialog
										open={createSensorDialogOpen}
										onClose={onCreateSensorDialogClose}
									/>
								</>
							)}
					</Stack>

					<SensorsList
						sortKey={sortBy.value}
						sortAscending={sortAscending}
					/>
				</Stack>
			</Grid>
			<Grid
				item
				xs={12}
				md={6}
				p={1}
				sx={{ maxHeight: "100%", overflow: "auto" }}>
				<Outlet />
			</Grid>
		</Grid>
	);
}
