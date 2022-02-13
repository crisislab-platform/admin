import { Button, Link, Stack, TextField, Typography } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import LoginIcon from "@mui/icons-material/VpnKey";
import MagicIcon from "@mui/icons-material/AutoFixHigh";
import PasswordIcon from "@mui/icons-material/Password";
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
		path: "magic-link",
		component: <MagicLinkPage />,
	},
	{
		path: "register",
		component: <RegisterPage />,
	},
];

export function PasswordResetStartPage() {
	useEffect(() => {
		document.title = `Request a password reset${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [sent, setSent] = useState<false | string>(false);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			enqueueSnackbar("Password reset email sent.", {
				variant: "success",
			});
			setSent(email + "");
		}
	}

	if (sent !== false) {
		return (
			<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
				<Typography variant="body1" sx={{ textAlign: "center" }}>
					Password reset email sent to {sent}.
				</Typography>
				<Typography variant="body1">
					If you don't see it, make sure to check your junk/spam
					folder.
				</Typography>
				<Link component={RouterLink} to="../login">
					← Back to login
				</Link>
			</Stack>
		);
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
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<PasswordIcon />}>
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

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const navigate = useNavigate();

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const password = data.get("password");
		if (!password) {
			enqueueSnackbar("Please provide a password.", {
				variant: "warning",
			});
		} else {
			enqueueSnackbar("Password updated.", {
				variant: "success",
			});
			navigate("../login");
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
				Chose your new password below.
			</Typography>
			<form action="#" onSubmit={onSubmit}>
				<Stack gap={2}>
					<TextField
						name="password"
						required
						label="New password"
						type="password"
					/>
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<PasswordIcon />}>
						Save new password
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../login">
				← Back to login
			</Link>
		</Stack>
	);
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
			enqueueSnackbar("Logged in.", {
				variant: "success",
			});
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
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<LoginIcon />}>
						Login
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../password-reset-start">
				Reset password →
			</Link>
			<Link component={RouterLink} to="../magic-link">
				Get a magic link →
			</Link>
			<Link component={RouterLink} to="../register">
				Register →
			</Link>
		</Stack>
	);
}

export function MagicLinkPage() {
	useEffect(() => {
		document.title = `Request a magic link${titleSuffix}`;
	}, []);

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [sent, setSent] = useState<false | string>(false);

	function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const data = new FormData(e.currentTarget);
		const email = data.get("email");
		if (!email) {
			enqueueSnackbar("Please provide an email address.", {
				variant: "warning",
			});
		} else {
			enqueueSnackbar("Magic link email sent.", {
				variant: "success",
			});
			setSent(email + "");
		}
	}

	if (sent !== false) {
		return (
			<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
				<Typography variant="body1" sx={{ textAlign: "center" }}>
					An email with a magic link to log in with has been sent to{" "}
					{sent}.
				</Typography>
				<Typography variant="body1">
					If you don't see it, make sure to check your junk/spam
					folder.
				</Typography>
				<Link component={RouterLink} to="../login">
					← Back to login
				</Link>
			</Stack>
		);
	}

	return (
		<Stack gap={2} sx={{ width: "100%", mt: 2 }}>
			<Typography
				variant="h4"
				component="h2"
				sx={{ textAlign: "center" }}>
				Get a Magic Link
			</Typography>
			<Typography variant="body1" sx={{ textAlign: "center" }}>
				Enter your email address to request a magic login link.
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
					<Button
						variant="contained"
						type="submit"
						color="secondary"
						endIcon={<MagicIcon />}>
						Do Magic
					</Button>
				</Stack>
			</form>
			<Link component={RouterLink} to="../login">
				← Back to login
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
