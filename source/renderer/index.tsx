import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "@/renderer/app";

ReactDOM.render(<App focus={false} restore={false} fullscreen={false}/>, document.getElementById("app"));
