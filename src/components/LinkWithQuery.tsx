import { Link as RouterLink, useLocation } from "react-router";
import { forwardRef, Ref } from "react";

function _LinkWithQuery({ children, to, ...props }, ref: Ref<any>) {
	const { search } = useLocation();

	return (
		<RouterLink ref={ref} to={to + search} {...props}>
			{children}
		</RouterLink>
	);
}

export const LinkWithQuery = forwardRef(_LinkWithQuery);
