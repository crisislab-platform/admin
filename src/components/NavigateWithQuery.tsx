import { Navigate, useLocation, useNavigate } from "react-router-dom";

export function NavigateWithQuery({ to, ...props }) {
	const { search } = useLocation();

	return <Navigate to={to + search} {...props} />;
}

export function useNavigateWithQuery() {
	const { search } = useLocation();
	const navigate = useNavigate();

	return (to, options) => navigate(to + search, options);
}
