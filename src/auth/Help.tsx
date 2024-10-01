import { Typography } from "@mui/material";
import { LinkWithQuery } from "../components";
import { titleSuffix } from "./utils";
import { useEffect } from "react";

export default function RegisterPage() {
	useEffect(() => {
		document.title = `Register${titleSuffix}`;
	}, []);

	return (
		<>
			<Typography>
				To get an account, ask an admin (Danuka or Zade) to create one
				for you.
			</Typography>
			<Typography>
				Similarly, if you've lost your password, ask an admin to reset
				it for you.
			</Typography>
			<LinkWithQuery to="/auth/login" className="arrow-back">
				Back to login
			</LinkWithQuery>
		</>
	);
}
