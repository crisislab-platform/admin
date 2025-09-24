import { forwardRef, Ref } from "react";
import { Link as RouterLink, useLocation } from "react-router";

function _LinkWithQuery({ children, to, href, ...props }, ref: Ref<any>) {
	const { search } = useLocation();

	to ??= href;

	return (
		<RouterLink ref={ref} to={to + search} {...props}>
			{children}
		</RouterLink>
	);
}

export const LinkWithQuery = forwardRef(_LinkWithQuery);
