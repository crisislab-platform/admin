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
	useTheme,
	useMediaQuery,
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
import DeleteIcon from "@mui/icons-material/Delete";
import DoneIcon from "@mui/icons-material/Done";
import FilterListIcon from "@mui/icons-material/FilterList";
import NotIcon from "@mui/icons-material/PriorityHigh";
import { Outlet } from "react-router-dom";
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
	const theme = useTheme();
	const onMobile = useMediaQuery(theme.breakpoints.down("lg"));
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

	const toolbarHeight = onMobile ? 64 : 56;

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
		<Grid
			container
			sx={{
				height: `calc(100vh - ${toolbarHeight}px)`,
				maxHeight: `calc(100vh - ${toolbarHeight}px)`,
				w: "100%",
				flex: "1",
			}}>
			<Grid
				item
				xs={12}
				md={6}
				sx={{
					height: "100%",
					maxHeight: "100%",
					overflow: "auto",
				}}>
				<Stack>
					<Stack
						sx={{
							backgroundColor: (theme) =>
								theme.palette.background.default,
							position: "sticky",
							top: 0,
							paddingTop: (theme) => theme.spacing(1),
							zIndex: (theme) => theme.zIndex.drawer - 1,
						}}
						direction="row"
						p={1}
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
			{onMobile ? (
				<Outlet />
			) : (
				<Grid
					item
					xs={12}
					md={6}
					p={1}
					sx={{
						height: "100%",
						maxHeight: "100%",
						overflow: "auto",
					}}>
					<Outlet />
				</Grid>
			)}
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
		// onFilterPopupClose();
	}

	function createNewEmptyFilterRule() {
		setInProgressFilterRules((oldFilterRules) => [
			...oldFilterRules,
			{
				property: "id",
				operation: "greater-than",
				reversed: false,
				value: "0",
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
					[key]: event.target.value.toLowerCase(),
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
				Filters
				{inProgressFilterRules.length !== 0 &&
					`: ${filterRules.length} applied`}
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
						<Stack direction="row" alignItems="center">
							<Typography variant="h6">Filter rules</Typography>
							<Button
								variant="outlined"
								color="error"
								sx={{ ml: "auto" }}
								size="small"
								startIcon={<DeleteIcon />}
								disabled={inProgressFilterRules.length === 0}
								onClick={() => setInProgressFilterRules([])}>
								Clear all rules
							</Button>
						</Stack>
						{inProgressFilterRules.length === 0 && (
							<Typography>No filter rules.</Typography>
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
											<NotIcon />
										</ToggleButton>
									</span>
								</Tooltip>
								<TextField
									sx={{
										"& .MuiSelect-select": {
											width: "90px",
										},
									}}
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
									sx={{
										"& .MuiSelect-select": {
											width: "90px",
										},
									}}
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
											sx={{
												"&:hover": {
													"& .MuiSvgIcon-root": {
														color: (theme) =>
															theme.palette.error
																.main,
													},
												},
											}}
											onClick={makeDeleteFilterRule(
												index,
											)}>
											<DeleteIcon />
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
							color="error"
							sx={{ ml: "auto" }}
							size="small"
							startIcon={<CloseIcon />}
							disabled={filterRules === inProgressFilterRules}
							onClick={() =>
								setInProgressFilterRules(filterRules)
							}>
							Discard changes
						</Button>
						<Button
							variant="outlined"
							size="small"
							startIcon={<DoneIcon />}
							disabled={filterRules === inProgressFilterRules}
							onClick={() => applyFilterRuleChanges()}>
							Apply changes
						</Button>
					</Stack>
				</Stack>
			</Popover>
		</>
	);
}
