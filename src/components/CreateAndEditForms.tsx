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
import {
	type ChangeEvent,
	type ReactNode,
	Fragment,
	useId,
	useReducer,
	useState
} from "react";
import { styled } from "@mui/material/styles";
import type { Entries, FixedKeyOf } from "../types";
import UploadFileIcon from "@mui/icons-material/UploadFile";

// From the MUI example for file upload buttons:
// https://mui.com/material-ui/react-button/#file-upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

type BaseThingType = Record<string, any>;

type FormState<T extends BaseThingType> = {
	[Property in FixedKeyOf<T>]: {
		value: undefined | T[Property];
		rawValue: string;
		fileUploadName?: string;
		empty: boolean;
		valid: boolean;
	};
};
export interface CreateAndEditThingsSchema<
	T extends BaseThingType,
	Identifier extends string | number = number,
> {
	ignoreProperties?: (FixedKeyOf<T>)[];
	fields: {
		[Property in FixedKeyOf<T>]?: {
			label: string;
			optional?: boolean;
			disabled?: boolean;
			type:
				| "select"
				| "number"
				| "text"
				| "colour"
				| "text-file-upload"
				| "custom";
			requires?:
			| FixedKeyOf<Omit<T, Property>>
			| ((state: FormState<T>) => boolean);
			validate?: (state: FormState<T>) => boolean;
			recheckTheseWhenIChange?: (FixedKeyOf<Omit<T, Property>>)[];
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
			| {
				type: "text-file-upload";
				placeholder?: string;
				default?: string | null;
			}
			| {
				type: "custom";
				default?: T[Property];
				render: (props: {
					value: T[Property] | undefined;
					onChange: (value: T[Property]) => void;
					disabled: boolean;
					error: boolean;
				}) => ReactNode;
			}
		);
	};

	handleCreateSubmit: (newStructure: T) => Promise<boolean>;
	handleEditSubmit: (id: Identifier, structure: T) => Promise<boolean>;
}

function getInitialStateGetter<T extends BaseThingType>(
	schema: CreateAndEditThingsSchema<T, any>,
) {
	return function getInitialState<T extends BaseThingType>(initialValue: 	T | undefined,): FormState<T> {
		const state: Partial<FormState<T>> = {};

		for (const [fieldName, field] of Object.entries(
			schema.fields,
		) as Entries<T>)  {
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
}

type FormStateReducerAction<
	T extends BaseThingType,
	Property extends FixedKeyOf<T> = FixedKeyOf<T>,
> = {
	property: Property;
	value: T[Property];
	rawValue: string;
	fileUploadName?: string;
	schema: CreateAndEditThingsSchema<T, any>;
};
function formStateReducer<T extends BaseThingType>(
	state: FormState<T>,
	{
		property,
		value,
		rawValue,
		fileUploadName,
		schema,
	}: FormStateReducerAction<T>,
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
			...(fileUploadName !== undefined ? { fileUploadName } : {}),
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

function isValid<T extends BaseThingType, Property extends FixedKeyOf<T> = FixedKeyOf<T>>(
	schema: CreateAndEditThingsSchema<T, any>,
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

function useFormFields<
	T extends BaseThingType,
	Identifier extends string | number = number,
>(
	schema: CreateAndEditThingsSchema<T, Identifier>,
	initialValue?: T,
) {
	const [formState, updateField] = useReducer
		<
			FormState<T>,
			T | undefined,
			[FormStateReducerAction<T>]
		>
		(formStateReducer, initialValue, getInitialStateGetter(schema));
	const [loading, setLoading] = useState(false);

	const readyToSubmit =
		Object.values(formState).find((v) => !v.valid) === undefined;

	const currentThing = readyToSubmit
		? (Object.fromEntries(
			Object.entries(formState).map(([k, v]) => [k, v.value]),
		) as T)
		: null;

	function makeHandleFieldChange<Property extends FixedKeyOf<T> = FixedKeyOf<T>>(
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
		
		if (schemaField.type === "text-file-upload") {
			return (e: ChangeEvent<HTMLInputElement>) => {
				const files = e.target.files;
				if (!files || files.length === 0) return;
				
				const file = files[0];
				const reader = new FileReader();
				reader.onload = (ev) => {
					const value = ev.target?.result;
					if (typeof value !== "string") return;
					updateField({
						property,
						schema,
						rawValue: value,
						value: value as T[Property],
						fileUploadName: file.name,
					});
				};
				reader.readAsText(file);
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
		if (!readyToSubmit) {
			return false;
		}
		setLoading(true);
		try {
			const v = await schema.handleCreateSubmit(currentThing!);
			setLoading(false);
			return v;
		} catch (err) {
			console.error(err);
			setLoading(false);
			return false;
		}
	}

	async function submitEdit(id: Identifier): Promise<boolean> {
		if (!readyToSubmit) {
			return false;
		}
		setLoading(true);
		try {
			const v = await schema.handleEditSubmit(id, currentThing!);
			setLoading(false);
			return v;
		} catch (err) {
			console.error(err);
			setLoading(false);
			return false;
		}
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
		currentThing,
		loading,
	};
}
export const useCreateOrEditThingFormFields = useFormFields;

export function CreateOrEditThingForm<
	T extends BaseThingType,
	Identifier extends string | number = number,
	Property extends FixedKeyOf<T> = FixedKeyOf<T>,
>({
	schema,
	formState,
	makeHandleFieldChange,
	updateField,
	loading,
}: {
	schema: CreateAndEditThingsSchema<T, Identifier>;
	formState: FormState<T>;
	makeHandleFieldChange: (
		property: Property,
	) => (e: ChangeEvent<HTMLInputElement>) => void;
	updateField: (action: FormStateReducerAction<T, Property>) => void;
	loading: boolean;
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
				let disabled = field.disabled ?? false;
				if (loading) {
					disabled = true;
				} else if (!disabled && field.requires !== undefined) {
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
				const id = `${fieldName}-${baseID}-input`;

				if (field.type === "select") {
					return (
						<FormControl
							key={fieldName}
							fullWidth
							disabled={disabled}
							error={error}
							required={!field.optional}>
							<InputLabel id={id}>
								{field.label}
							</InputLabel>
							<Select
								labelId={id}
								id={id}
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
		if (field.type === "text-file-upload") {
					return (
						<Stack key={fieldName} gap={0.5} alignItems="flex-start">
							<InputLabel htmlFor={id}>{field.label}</InputLabel>
							<span><Button
								disabled={disabled}
								component="label"
								role={undefined}
								variant="contained"
								tabIndex={-1}
								startIcon={<UploadFileIcon />}
							>
								{field.placeholder ||
									"Choose file"}
								<VisuallyHiddenInput
									id={id}
									disabled={disabled}
									required={!field.optional}
									type="file"
									accept="text/plain,text/comma-separated-values,application/json,text/xml,application/xml"
									onChange={onChange}
								/>
							</Button>
							{" "}{fieldState.fileUploadName}</span>
						</Stack>
					);
				}
				if (field.type === "custom") {
					return (
						<Fragment key={fieldName}>
							{field.render({
								value: fieldState.value,
								onChange: (value) => {
									updateField({
										property,
										schema,
										rawValue: String(value ?? ""),
										value,
									});
								},
								disabled,
								error,
							})}
						</Fragment>
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
						id={id}
						disabled={disabled}
						error={error}
						required={!field.optional}
						type={field.type === "number" ? "number" : "text"}
						placeholder={field.placeholder}
					/>
				);
			})}
		</Stack>
	);
}

export interface CreateThingFormOptions<
	T extends BaseThingType,
	Identifier extends string | number = number,
> {
	schema: CreateAndEditThingsSchema<T, Identifier>;
	open: boolean;
	onClose: () => void;
	title: string;
	submitLabel?: string;
	onCreate?: (thing: T) => void;
	onSubmitError?: () => void;
}
export function CreateThingForm<
	T extends BaseThingType,
	Identifier extends string | number = number,
>({
	schema,
	open,
	onClose,
	title,
	submitLabel = "Create",
	onCreate,
	onSubmitError,
	}: CreateThingFormOptions<T, Identifier>) {
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
						if (ok) {
							onClose();
							onCreate?.(formState.currentThing!);
						} else {
							onSubmitError?.();
						}
					}}
					disabled={!readyToSubmit || formState.loading}>
					{submitLabel}
				</Button>
				<Button onClick={onClose} disabled={formState.loading}>
					Close
				</Button>
			</DialogActions>
		</Dialog>
	);
}
