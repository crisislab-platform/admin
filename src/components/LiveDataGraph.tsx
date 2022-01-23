import { Alert, Box, Paper, Typography, Collapse } from "@mui/material";
import { useRef, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
const data = Array.from(Array(10000)).map(() =>
	Math.floor(Math.random() * 4000),
);

export function LiveDataGraph({
	title,
	showScrollHint = true,
	lineColour,
}: {
	title?: string;
	showScrollHint?: boolean;
	lineColour?: string;
}) {
	const { enqueueSnackbar } = useSnackbar();
	const containerRef = useRef<null | HTMLDivElement>(null);
	const [autoScrolling, setAutoScrolling] = useState(true);

	useEffect(() => {
		let b = 0;
		let previous = data[0];
		let wasAtEnd = true;
		const interval = setInterval(() => {
			if (containerRef?.current) {
				// Add 25 elements to the container
				const parent = document.createElement("span");
				parent.classList.add("parent");
				for (let i = 0; i < 25; i++) {
					const div = document.createElement("span");
					div.classList.add("div");
					const current = data[b * 25 + i];
					div.style.height = current / 50 + "px";
					div.style.width = 1 / devicePixelRatio + "px";
					// div.style.backgroundColor = "black";
					if (previous < current) {
						div.style.borderTop =
							1 / devicePixelRatio +
							(current - previous) / 50 +
							"px solid currentColor";
						div.style.boxSizing = "border-box";
					} else {
						div.style.borderTop =
							1 / devicePixelRatio +
							(previous - current) / 50 +
							"px solid currentColor";
						div.style.boxSizing = "content-box";
					}
					// console.log(previous, current, div.style.height, div.style.borderTop)
					previous = data[b * 25 + i];
					parent.appendChild(div);
				}
				// console.log(
				// 	containerRef.current.scrollWidth,
				// 	containerRef.current.scrollLeft,
				// 	containerRef.current.scrollLeft +
				// 		containerRef.current.clientWidth,
				// );
				const isAtEnd =
					containerRef.current.scrollWidth -
						(containerRef.current.scrollLeft +
							containerRef.current.clientWidth) <=
					5 + 25 / devicePixelRatio;
				containerRef.current.appendChild(parent);
				if (isAtEnd) {
					if (!wasAtEnd) setAutoScrolling(true);
					containerRef.current.scrollLeft =
						containerRef.current.scrollWidth;
					wasAtEnd = true;
				} else {
					if (wasAtEnd) setAutoScrolling(false);
					wasAtEnd = false;
				}
				b++;
			}
		}, 250);
		return () => {
			clearInterval(interval);
		};
	}, [containerRef, setAutoScrolling]);
	return (
		<Paper
			variant="outlined"
			sx={{
				p: 1,
				display: "inline-flex",
				flexDirection: "column",
				gap: 1,
			}}
			onWheel={(e) => {
				if (e.movementX !== 0) return;
				enqueueSnackbar(
					"Use Shift+Scrollwheel to scroll horizontally.",
				);
			}}>
			{title && <Typography variant="h6">{title}</Typography>}
			<Box
				className="LiveDataGraph"
				ref={containerRef}
				sx={{
					overflowX: "scroll",
					height: "125px",
					maxHeight: "125px",
					width: "auto",
					display: "flex",
					alignItems: "center",
					whiteSpace: "nowrap",
					"& > .parent": {
						contentVisibility: "auto",
						containIntrinsicSize: 25 / devicePixelRatio + "px 0px",
						"& > .div": {
							color: lineColour
								? lineColour
								: (theme) => theme.palette.error.main,
							display: "inline-block",
						},
					},
				}}></Box>
			{showScrollHint && (
				<Collapse in={!autoScrolling}>
					<Alert severity="info" variant="outlined">
						To start auto-scrolling again, scroll the graph all the
						way to the right.
					</Alert>
				</Collapse>
			)}
		</Paper>
	);
}
