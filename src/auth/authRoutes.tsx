import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect } from "react";

import { Link as RouterLink } from "react-router-dom";
import { useSnackbar } from "notistack";

const titleSuffix = " | CRISiSLab Shakemap auth";

export interface AuthRoute {
	path: string;
	component: any;
}
export const authRoutes: AuthRoute[] = [
	{
		path: "password-reset-start",
		component: <PasswordResetStartPage />,
	},
	{
		path: "password-reset-finish",
		component: <PasswordResetFinishPage />,
	},
	{
		path: "login",
		component: <LoginPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];

export function PasswordResetStartPage() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		document.title = `Request a password reset${titleSuffix}`;
	}, []);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			alert(`Email: ${email}`);
		}
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Reset password
			</Typography>
			<Typography variant="body1" sx={{ textAlign: "center" }}>
				Enter your email address to request a password reset link.
			</Typography>
			<form action="#" onSubmit={onSubmit}>
				<Stack gap={2}>
					<TextField
						name="email"
						required
						label="Email address"
						placeholder="john@doe.net"
						type="email"
					/>
					<Button variant="contained" type="submit" color="secondary">
						Reset password
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../login">
				← Back to login
			</Link>
		</Stack>
	);
}

export function PasswordResetFinishPage() {
	useEffect(() => {
		document.title = `Choose a new password${titleSuffix}`;
	}, []);

	return <>Enter a new password</>;
}

export function LoginPage() {
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		document.title = `Login${titleSuffix}`;
	}, []);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		const password = data.get("password");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else {
			alert(`Email: ${email}\nPassword: ${password}`);
		}
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Login
			</Typography>
			<form action="#" onSubmit={onSubmit}>
				<Stack gap={2}>
					<TextField
						name="email"
						required
						label="Email address"
						placeholder="john@doe.net"
						type="email"
					/>
					<TextField
						name="password"
						required
						label="Password"
						type="password"
					/>
					<Button variant="contained" type="submit" color="secondary">
						Login
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../register">
				Register →
			</Link>
			<Link component={RouterLink} to="../password-reset-start">
				Reset password →
			</Link>
		</Stack>
	);
}

export function RegisterPage() {
	useEffect(() => {
		document.title = `Register${titleSuffix}`;
	}, []);

	return (
		<>
			<p>To get an account, ask a site admin to create one for you.</p>
			<Link component={RouterLink} to="../login">
				← Back to login
			</Link>
		</>
	);
}
