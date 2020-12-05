import * as React from "react";
import * as ReactDOM from "react-dom";

import router from "@/scheme/router";

import App from "@/renderer/app";

ReactDOM.render(<App view={router.get().view} focus={false} restore={false} fullscreen={false}/>, document.getElementById("app"));
