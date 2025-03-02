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
	ignoreProperties?: (keyof T)[];
	fields: {
		[Property in keyof T]?: {
			label: string;
			optional?: boolean;
			type: "select" | "number" | "text" | "colour";
			requires?:
				| keyof Omit<T, Property>
				| ((state: FormState<T>) => boolean);
			validate?: (state: FormState<T>) => boolean;
			recheckTheseWhenIChange?: (keyof Omit<T, Property>)[];
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

function getInitialState<T extends BaseThingType>([schema, initialValue]: [
	CreateAndEditThingsSchema<T>,
	T | undefined,
]): FormState<T> {
	const state: Partial<FormState<T>> = {};

	for (const [fieldName, field] of Object.entries(
		schema.fields,
	) as Entries<T>) {
		const value = initialValue?.[fieldName] ?? field.default ?? undefined;
		state[fieldName] = {
			value,
			empty:
				value !== undefined
					? value === undefined || value === ""
					: true,
			valid: field.optional ? true : value !== undefined ? true : false,
			rawValue: value !== undefined ? value + "" : "",
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
	if (schema.ignoreProperties?.includes(property)) {
		return state;
	}

	const schemaField = schema.fields[property]!;

	const newState = {
		...state,
		[property]: {
			...state[property],
			value,
			rawValue,
			empty: false,
			valid: true,
		},
	};

	const { valid, empty } = isValid(schema, property, newState);

	newState[property].valid = valid;
	newState[property].empty = empty;

	if (schemaField.recheckTheseWhenIChange) {
		for (const recheckProp of schemaField.recheckTheseWhenIChange) {
			newState[recheckProp].valid = isValid(
				schema,
				recheckProp,
				newState,
			).valid;
		}
	}

	return newState;
}

function isValid<T extends BaseThingType, Property extends keyof T = keyof T>(
	schema: CreateAndEditThingsSchema<T>,
	property: Property,
	state: FormState<T>,
) {
	const schemaField = schema.fields[property]!;
	const stateField = state[property];

	const empty = stateField.value === undefined || stateField.value === "";

	const validatorPassed =
		schemaField.validate !== undefined ? schemaField.validate(state) : true;

	const optionsOkay =
		schemaField.type === "select"
			? schemaField.getOptions(state).includes(stateField.value ?? "")
			: true;

	const emptinessOkay = schemaField.optional ? true : !empty;

	const valid = validatorPassed && optionsOkay && emptinessOkay;

	return { valid, empty };
}

function useFormFields<T extends BaseThingType>(
	schema: CreateAndEditThingsSchema<T>,
	initialValue?: T,
) {
	const [formState, updateField] = useReducer<
		Reducer<FormState<T>, FormStateReducerAction<T>>,
		[CreateAndEditThingsSchema<T>, T | undefined]
	>(formStateReducer, [schema, initialValue], getInitialState);

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

	function resetFormWithNewValues(newValues: T) {
		for (const property in newValues) {
			updateField({
				property,
				schema,
				rawValue: newValues[property] + "",
				value: newValues[property],
			});
		}
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
		resetFormWithNewValues,
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
