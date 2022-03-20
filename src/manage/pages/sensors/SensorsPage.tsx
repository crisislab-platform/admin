import {
	Button,
	Grid,
	IconButton,
	Menu,
	MenuItem,
	Popover,
	Stack,
	TextField,
	ToggleButton,
	Tooltip,
	Typography,
} from "@mui/material";
import { Dispatch, SetStateAction, useState } from "react";
import { FilterRule, Sensor, SensorSortKey } from "../../../types";
import {
	filterRuleOperations,
	filterRuleSensorProperties,
} from "../../../utils";

import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CloseIcon from "@mui/icons-material/Close";
import { CreateSensorDialog } from "./CreateSensorDialog";
import DoneIcon from "@mui/icons-material/Done";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Outlet } from "react-router-dom";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { SensorsList } from "./SensorsList";
import SortIcon from "@mui/icons-material/Sort";
import useAuth from "../../../auth/useAuth";

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
	const [filterRules, setFilterRules] = useState<FilterRule<Sensor>[]>([]);
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
							id="sort-sensors-button"
							aria-controls={
								sortMenuOpen ? "sort-sensors-menu" : undefined
							}
							aria-haspopup="true"
							aria-expanded={sortMenuOpen ? "true" : undefined}
							onClick={(event) =>
								setSortMenuAnchorEl(event.currentTarget)
							}>
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
						<EditFilterRues
							filterRules={filterRules}
							setFilterRules={setFilterRules}
						/>
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
						filterRules={filterRules}
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

function EditFilterRues({
	filterRules,
	setFilterRules,
}: {
	filterRules: FilterRule<Sensor>[];
	setFilterRules: Dispatch<SetStateAction<FilterRule<Sensor>[]>>;
}) {
	const [inProgressFilterRules, setInProgressFilterRules] =
		useState<FilterRule<Sensor>[]>(filterRules);

	const [filterPopupAnchorEl, setFilterPopupAnchorEl] =
		useState<null | HTMLElement>(null);
	const filterPopupOpen = Boolean(filterPopupAnchorEl);

	function onFilterPopupClose() {
		setFilterPopupAnchorEl(null);
	}

	function applyFilterRuleChanges() {
		setFilterRules(inProgressFilterRules);
		onFilterPopupClose();
	}

	function createNewEmptyFilterRule() {
		setInProgressFilterRules((oldFilterRules) => [
			...oldFilterRules,
			{
				property: "id",
				operation: "equals",
				reversed: false,
				value: "",
				id:
					Math.random() * 10000 +
					"-" +
					Math.random() * 10000 +
					"-" +
					Math.random() * 10000 +
					"-" +
					Math.random() * 10000,
			},
		]);
	}

	function makeDeleteFilterRule(index: number) {
		return () =>
			setInProgressFilterRules((oldFilterRules) => {
				let updatedFilterRules = [...oldFilterRules];
				updatedFilterRules.splice(index, 1);
				return updatedFilterRules;
			});
	}

	function makeToggleFilterRuleReversed(index: number) {
		return () =>
			setInProgressFilterRules((oldFilterRules) => {
				let updatedFilterRules = [...oldFilterRules];
				updatedFilterRules[index] = {
					...updatedFilterRules[index],
					reversed: !updatedFilterRules[index].reversed,
				};
				return updatedFilterRules;
			});
	}
	function makeUpdateFilterRuleStringValueOnChange(
		index: number,
		key: string,
	) {
		return (event) =>
			setInProgressFilterRules((oldFilterRules) => {
				let updatedFilterRules = [...oldFilterRules];
				updatedFilterRules[index] = {
					...updatedFilterRules[index],
					[key]: event.target.value,
				};
				return updatedFilterRules;
			});
	}

	return (
		<>
			<Button
				startIcon={<FilterListIcon />}
				size="small"
				id="filter-sensors-button"
				aria-controls={
					filterPopupOpen ? "filter-sensors-popup" : undefined
				}
				aria-haspopup="true"
				aria-expanded={filterPopupOpen ? "true" : undefined}
				onClick={(event) =>
					setFilterPopupAnchorEl(event.currentTarget)
				}>
				Filter
			</Button>
			<Popover
				open={filterPopupOpen}
				anchorEl={filterPopupAnchorEl}
				onClose={onFilterPopupClose}
				disableScrollLock={true}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}>
				<Stack sx={{ p: 1 }} gap={1}>
					<Stack gap={1}>
						{inProgressFilterRules.length === 0 && (
							<Typography>No filter rules yet.</Typography>
						)}
						{inProgressFilterRules.map((filterRule, index) => (
							<Stack
								key={filterRule.id}
								direction="row"
								gap={0.5}
								alignItems="center">
								<Tooltip
									title="Make rule negative"
									placement="left">
									<span>
										<ToggleButton
											size="small"
											value="check"
											selected={filterRule.reversed}
											onChange={makeToggleFilterRuleReversed(
												index,
											)}>
											<RemoveCircleIcon />
										</ToggleButton>
									</span>
								</Tooltip>
								<TextField
									select
									size="small"
									label="Attribute"
									value={filterRule.property}
									onChange={makeUpdateFilterRuleStringValueOnChange(
										index,
										"property",
									)}>
									{filterRuleSensorProperties.map(
										(property) => (
											<MenuItem
												key={property}
												value={property}>
												{property}
											</MenuItem>
										),
									)}
								</TextField>
								<TextField
									select
									size="small"
									label="Operation"
									value={filterRule.operation}
									onChange={makeUpdateFilterRuleStringValueOnChange(
										index,
										"operation",
									)}>
									{filterRuleOperations.map((operation) => (
										<MenuItem
											key={operation}
											value={operation}>
											{operation}
										</MenuItem>
									))}
								</TextField>
								<TextField
									size="small"
									label="Value"
									value={filterRule.value}
									onChange={makeUpdateFilterRuleStringValueOnChange(
										index,
										"value",
									)}
								/>

								<Tooltip title="Delete rule" placement="right">
									<span>
										<IconButton
											onClick={makeDeleteFilterRule(
												index,
											)}>
											<CloseIcon />
										</IconButton>
									</span>
								</Tooltip>
							</Stack>
						))}
					</Stack>
					<Stack direction="row" gap={1}>
						<Button
							size="small"
							startIcon={<AddIcon />}
							onClick={() => createNewEmptyFilterRule()}>
							Add rule
						</Button>
						<Button
							variant="outlined"
							sx={{ ml: "auto" }}
							size="small"
							startIcon={<DoneIcon />}
							onClick={() => applyFilterRuleChanges()}>
							Apply changes
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</>
	);
}
