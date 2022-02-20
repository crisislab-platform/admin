import { titleSuffix } from "./utils";
import { useEffect } from "react";
import { LinkWithQuery } from "../components";

export default function RegisterPage() {
	useEffect(() => {
		document.title = `Register${titleSuffix}`;
	}, []);

	return (
		<>
			<p>To get an account, ask a site admin to create one for you.</p>
			<LinkWithQuery to="../login">← Back to login</LinkWithQuery>
		</>
	);
}
