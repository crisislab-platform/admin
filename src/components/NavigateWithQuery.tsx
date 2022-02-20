import { Navigate, useLocation } from "react-router-dom";

export function NavigateWithQuery({ to, ...props }) {
	const { search } = useLocation();

	return <Navigate to={to + search} {...props} />;
}
