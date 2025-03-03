import { Slide } from "@mui/material";
import { TransitionProps } from "notistack";
import { forwardRef, ReactElement, Ref } from "react";

export const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: ReactElement;
	},
	ref: Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});
