import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
} from "@mui/material";
import { ChangeEvent, ReactNode, Reducer, useId, useReducer } from "react";
import { Entries } from "../types";
import { K } from "react-router/dist/production/fog-of-war-CbNQuoo8";

type BaseThingType = Record<string, any>;

type FormState<T extends BaseThingType> = {
	[Property in keyof T]: {
		value: undefined | T[Property];
		rawValue: string;
		empty: boolean;
		valid: boolean;
	};
};
export interface CreateAndEditThingsSchema<T extends BaseThingType> {
	fields: {
		[Property in keyof T]?: {
			label: string;
			optional?: boolean;
			type: "select" | "number" | "text" | "colour";
			requires?:
				| keyof Omit<T, Property>
				| ((state: FormState<T>) => boolean);
			validate?: (state: FormState<T>) => boolean;
		} & (
			| {
					type: "select";
					getOptions: (state: FormState<T>) => readonly string[];
					// TODO: Might be able to do fancy inference here
					default?: string;
			  }
			| {
					type: "number";
					placeholder?: string;
					default?: number;
			  }
			| {
					type: "text";
					placeholder?: string;
					default?: string;
			  }
			| {
					type: "colour";
					default?: string;
			  }
		);
	};

	handleCreateSubmit: (newStructure: T) => Promise<boolean>;
	handleEditSubmit: (id: number, structure: T) => Promise<boolean>;
}

function getInitialState<T extends BaseThingType>(
	schema: CreateAndEditThingsSchema<T>,
): FormState<T> {
	const state: Partial<FormState<T>> = {};

	for (const [fieldName, field] of Object.entries(
		schema.fields,
	) as Entries<T>) {
		state[fieldName] = {
			value: field.default ?? undefined,
			empty:
				field.default !== undefined
					? field.default === undefined || field.default === ""
					: true,
			valid: field.optional
				? true
				: field.default !== undefined
				? true
				: false,
			rawValue: field.default !== undefined ? field.default + "" : "",
		};
	}

	return state as FormState<T>;
}

type FormStateReducerAction<
	T extends BaseThingType,
	Property extends keyof T = keyof T,
> = {
	property: Property;
	value: T[Property];
	rawValue: string;
	schema: CreateAndEditThingsSchema<T>;
};
function formStateReducer<T extends BaseThingType>(
	state: FormState<T>,
	{ property, value, rawValue, schema }: FormStateReducerAction<T>,
): FormState<T> {
	const schemaField = schema.fields[property]!;

	const empty = value === undefined || value === "";
	const newState = {
		...state,
		[property]: {
			...state[property],
			value,
			rawValue,
			empty,
			valid: true,
		},
	};

	const validatorPassed =
		schemaField.validate !== undefined
			? schemaField.validate(newState)
			: true;

	const emptinessOkay = schemaField.optional ? true : !empty;

	const valid = validatorPassed && emptinessOkay;

	newState[property].valid = valid;

	return newState;
}

function useFormFields<T extends BaseThingType>(
	schema: CreateAndEditThingsSchema<T>,
) {
	const [formState, updateField] = useReducer<
		Reducer<FormState<T>, FormStateReducerAction<T>>,
		CreateAndEditThingsSchema<T>
	>(formStateReducer, schema, getInitialState);

	const readyToSubmit =
		Object.values(formState).find((v) => !v.valid) === undefined;

	function makeHandleFieldChange<Property extends keyof T = keyof T>(
		property: Property,
	) {
		const schemaField = schema.fields[property]!;

		if (schemaField.type === "number") {
			return (e: ChangeEvent<HTMLInputElement>) => {
				const newValue = Number(e.target.value);
				if (Number.isNaN(newValue)) return;

				updateField({
					property,
					schema,
					rawValue: e.target.value,
					value: newValue as T[Property],
				});
			};
		}

		return (e: ChangeEvent<HTMLInputElement>) =>
			updateField({
				property,
				schema,
				rawValue: e.target.value,
				value: e.target.value as T[Property],
			});
	}

	async function submitCreate(): Promise<boolean> {
		if (!readyToSubmit) return false;

		return schema.handleCreateSubmit(
			Object.fromEntries(
				Object.entries(formState).map(([k, v]) => [k, v.value]),
			) as T,
		);
	}

	async function submitEdit(id: number): Promise<boolean> {
		if (!readyToSubmit) return false;

		return schema.handleEditSubmit(
			id,
			Object.fromEntries(
				Object.entries(formState).map(([k, v]) => [k, v.value]),
			) as T,
		);
	}

	return {
		submitCreate,
		submitEdit,
		readyToSubmit,
		formState,
		updateField,
		makeHandleFieldChange,
		schema,
	};
}
export const useCreateOrEditThingFormFields = useFormFields;

export function CreateOrEditThingForm<
	T extends BaseThingType,
	Property extends keyof T = keyof T,
>({
	schema,
	formState,
	makeHandleFieldChange,
}: {
	schema: CreateAndEditThingsSchema<T>;
	formState: FormState<T>;
	makeHandleFieldChange: (
		property: Property,
	) => (e: ChangeEvent<HTMLInputElement>) => void;
}) {
	const baseID = useId();

	return (
		<Stack gap={2} sx={{ pt: 1 }}>
			{(
				Object.entries(schema.fields) as Entries<
					CreateAndEditThingsSchema<T>["fields"]
				>
			).map(([property, field]: [Property, T[Property]]) => {
				const fieldState = formState[property];
				let disabled = false;
				if (field.requires !== undefined) {
					if (typeof field.requires === "function") {
						disabled = field.requires(formState);
					} else {
						disabled = !formState[field.requires].valid;
					}
				}
				const error = !fieldState.valid && !fieldState.empty;
				const onChange = makeHandleFieldChange(property);

				// To appease typescript
				const fieldName = String(property);

				if (field.type === "select") {
					return (
						<FormControl
							key={fieldName}
							fullWidth
							disabled={disabled}
							error={error}
							required={!field.optional}>
							<InputLabel id={`${fieldName}-${baseID}-label`}>
								{field.label}
							</InputLabel>
							<Select
								labelId={`${fieldName}-${baseID}-label`}
								id={`${fieldName}-${baseID}-input`}
								label={field.label}
								value={fieldState.rawValue}
								onChange={onChange}>
								{field.getOptions(formState).map((option) => (
									<MenuItem key={option} value={option}>
										{option}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					);
				}
				if (field.type === "colour") {
					return (
						<TextField
							key={fieldName}
							fullWidth
							value={fieldState.rawValue}
							onChange={onChange}
							label={field.label}
							id={`${fieldName}-${baseID}-input`}
							disabled={disabled}
							error={error}
							required={!field.optional}
							type="color"
						/>
					);
				}

				// Text & number
				return (
					<TextField
						key={fieldName}
						fullWidth
						value={fieldState.rawValue}
						onChange={onChange}
						label={field.label}
						id={`${fieldName}-${baseID}-input`}
						disabled={disabled}
						error={error}
						required={!field.optional}
					/>
				);
			})}
		</Stack>
	);
}

export interface CreateThingFormOptions<T extends BaseThingType> {
	schema: CreateAndEditThingsSchema<T>;
	open: boolean;
	onClose: () => void;
	title: string;
	submitLabel?: string;
}
export function CreateThingForm<T extends BaseThingType>({
	schema,
	open,
	onClose,
	title,
	submitLabel = "Create",
}: CreateThingFormOptions<T>) {
	const { submitCreate, readyToSubmit, ...formState } = useFormFields(schema);
	return (
		<Dialog open={open} onClose={onClose} fullWidth>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<CreateOrEditThingForm {...formState} />
			</DialogContent>
			<DialogActions>
				<Button
					onClick={async () => {
						const ok = await submitCreate();
						if (ok) onClose();
					}}
					disabled={!readyToSubmit}>
					{submitLabel}
				</Button>
				<Button onClick={onClose}>Close</Button>
			</DialogActions>
		</Dialog>
	);
}
