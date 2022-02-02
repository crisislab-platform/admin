// @ts-nocheck

import React from 'react';


export function SimpleDataGraph(sensorId) {
	const containerRef = React.useRef(null);
	const parentRef = React.useRef(null);

  React.useEffect(() => {
    const main = containerRef.current;
    const channelContainers = {};
    const lastValues = {};
    const largestValues = {};
    const channelOffsets = {EHZ: 10000, ENN: 500000, ENZ: -2000000, ENE: 500000}
    var lastTop = 0;
    const ws = new WebSocket("wss://ingest-worker.benhong.workers.dev/consume/1");
    var firstChannel;
    
    ws.addEventListener("message", (event) => {
      const [channel, timestamp, ...measurements] = JSON.parse(event.data);
      firstChannel ||= channel;
      // if (channel !== "EHZ") return
    
      if (!channelContainers[channel]) {
        channelContainers[channel] = document.createElement("div");
        channelContainers[channel].style.height = "12.5vh";
        channelContainers[channel].style.top = lastTop + "vh";
        channelContainers[channel].style.position = "absolute";
        lastTop += 22;
        main.appendChild(channelContainers[channel]);
      }
    
      const container = channelContainers[channel];
    
      const parent = document.createElement("span");
      parent.style.contentVisibility = "auto";
      parent.style.containIntrinsicSize = 25 / devicePixelRatio + "px 0";
      for (const unoffsetMeasurement of measurements) {
        const measurement = unoffsetMeasurement + 9999999;
    
      lastValues[channel] ||= measurement;
    
      const div = document.createElement("span");
        var styles = {
          width: 1 / devicePixelRatio + "px",
          height: measurement + "px",
          display: "inline-block",
        };
    
        if (lastValues[channel] < measurement) {
          styles.borderTop =
            (measurement - lastValues[channel]) +
            "vh solid red";
          styles.boxSizing = "border-box";
        } else {
          styles.borderTop =
            (lastValues[channel] - measurement) +
            "vh solid red";
        }
    
        Object.assign(div.style, styles);
        // console.log(previous, current, div.style.height, div.style.borderTop)
        largestValues[channel] ||= 0;
        if (Math.abs(lastValues[channel] - measurement) > largestValues[channel])
          largestValues[channel] = Math.abs(lastValues[channel] - measurement);
        lastValues[channel] = measurement;
        parent.appendChild(div);
      }
    
      const parentElement = parentRef.current;
      var isAtEnd =
      parentElement.scrollWidth -
          (parentElement.scrollLeft +
            parentElement.clientWidth) <=
        5 + 25 / devicePixelRatio;
      container.style.transform = "scaleY(" + 12.5 / largestValues[channel] + ")";
      container.appendChild(parent);
      if (isAtEnd && firstChannel === channel) {
        parentElement.scrollLeft = parentElement.scrollWidth;
      }
    });
  }, []);

	return (
    <div ref={parentRef} style={{overflowX: "scroll", overflowY: "hidden", height: '100vh'}}>
		<div ref={containerRef} style={{minWidth: "min-content", whiteSpace: "nowrap", position: "relative", height: '100vh'}}/>
    </div>
	);
}