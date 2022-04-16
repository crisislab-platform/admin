import { LinkWithQuery } from "../components";
import { titleSuffix } from "./utils";
import { useEffect } from "react";

export default function RegisterPage() {
	useEffect(() => {
		document.title = `Register${titleSuffix}`;
	}, []);

	return (
		<>
			<p>To get an account, ask a site admin to create one for you.</p>
			<LinkWithQuery to="/auth/login">← Back to login</LinkWithQuery>
		</>
	);
}
