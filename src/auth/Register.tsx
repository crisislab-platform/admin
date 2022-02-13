import { Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { titleSuffix } from "./utils";
import { useEffect } from "react";

export default function RegisterPage() {
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
