import {
	AppBar,
	Dialog,
	IconButton,
	Slide,
	Toolbar,
	Typography,
	Box,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, ReactChild } from "react";
import CloseIcon from "@mui/icons-material/Close";

const SlideUpTransition = forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction="up" ref={ref} {...props} />;
});

export function MobileDialog({
	children,
	title,
	open,
	onClose,
}: {
	children: ReactChild | ReactChild[] | null;
	title?: string;
	open: boolean;
	onClose: () => void;
}) {
	return (
		<Dialog
			fullScreen
			open={open}
			onClose={onClose}
			TransitionComponent={SlideUpTransition}>
			<AppBar sx={{ position: "relative" }}>
				<Toolbar>
					<IconButton
						edge="start"
						color="inherit"
						onClick={onClose}
						aria-label="close">
						<CloseIcon />
					</IconButton>
					{title && (
						<Typography
							sx={{ ml: 2, flex: 1 }}
							variant="h6"
							component="div">
							{title}
						</Typography>
					)}
				</Toolbar>
			</AppBar>
			<Box sx={{ p: 2 }}>{children}</Box>
		</Dialog>
	);
}
