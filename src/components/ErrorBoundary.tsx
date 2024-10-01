import { Alert, AlertTitle, Typography } from "@mui/material";

import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<
	{ children?: ReactNode },
	{ hasError: boolean; error?: unknown }
> {
	constructor(props) {
		super(props);
		this.state = { error: null, hasError: false };
	}
	static getDerivedStateFromError(error) {
		return { error, hasError: true };
	}
	render() {
		if (this.state.hasError) {
			return (
				<Alert severity="error" sx={{ margin: 2 }}>
					<AlertTitle>
						Something has gone cataclysmically wrong!
					</AlertTitle>
					{!!this.state.error && (
						<>
							Send this to a developer to help figure out what
							happened: {this.state.error.toString()}
						</>
					)}
				</Alert>
			);
		}
		return this.props.children;
	}
}
