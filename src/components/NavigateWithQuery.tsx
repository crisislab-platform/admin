import { forwardRef, Ref } from "react";
import {
	Location,
	Navigate,
	NavigateOptions,
	Link as RouterLink,
	useLocation,
	useNavigate
} from "react-router";

function generateTo(to: string, location: Location): string {

	// console.log(`Generating to link from ${location.pathname} to ${to}`);

	// Add trailing slash to make relative paths work properly
	const relative = to.startsWith(".");
	let pathname = location.pathname;
	let addedTrailingSlash = false;
	if (relative && (!pathname.endsWith("/"))) {
		pathname += "/";
		addedTrailingSlash = true;
	}

	const url = new URL(
		window.location.origin + pathname + location.search,
	);

	const toUrl = new URL(to, window.location.origin + pathname);

	// console.log(
	// 	"cuurrent url", url, "to url", toUrl
	// )

	url.pathname = toUrl.pathname;

	// Remove trailing slash if we added one, now that relative paths have been computed
	if (addedTrailingSlash && url.pathname.endsWith("/")) {
		url.pathname = url.pathname.substring(0, url.pathname.length - 1);
	}

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

function _LinkWithQuery({ children, to, href, ...props }, ref: Ref<any>) {
	const location = useLocation();

	to ??= href;

	const newTo = generateTo(to, location)

	return (
		<RouterLink ref={ref} to={newTo} {...props}>
			{children}
		</RouterLink>
	);
}

export const LinkWithQuery = forwardRef(_LinkWithQuery);
