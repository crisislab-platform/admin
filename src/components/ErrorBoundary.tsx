import { Alert, AlertTitle } from "@mui/material";

import { Component } from "react";

export class ErrorBoundary extends Component<
	{},
	{ hasError: boolean; error: any }
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
					<AlertTitle>Something has gone cataclysmically wrong!</AlertTitle>
					{`A child component threw this error: ${this.state.error}`}
				</Alert>
			);
		}
		return this.props.children;
	}
}
