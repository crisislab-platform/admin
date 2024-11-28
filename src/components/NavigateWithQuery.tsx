import {
	Location,
	Navigate,
	NavigateOptions,
	useLocation,
	useNavigate,
} from "react-router";

export function generateTo(to: string, location: Location): string {
	const url = new URL(
		window.location.origin + location.pathname + location.search,
	);

	const toUrl = new URL(window.location.origin + to);

	url.pathname = toUrl.pathname;

	toUrl.searchParams.forEach((value, key) => {
		url.searchParams.set(key, value);
	});

	return url.pathname + url.search;
}

export function NavigateWithQuery({
	to,
	...props
}: {
	to: string;
	[key: string]: any;
}) {
	const location = useLocation();

	const href = generateTo(to, location);

	return <Navigate to={href} replace {...props} />;
}

export function useNavigateWithQuery() {
	const location = useLocation();
	const navigate = useNavigate();

	return (to: string, options: NavigateOptions = { replace: true }) =>
		navigate(generateTo(to, location), options);
}
