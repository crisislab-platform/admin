import { Link as RouterLink, useLocation } from "react-router";
import { Link } from "@mui/material";

export function LinkWithQuery({ children, to, ...props }) {
	const { search } = useLocation();

	return (
		<Link component={RouterLink} to={to + search} {...props}>
			{children}
		</Link>
	);
}
