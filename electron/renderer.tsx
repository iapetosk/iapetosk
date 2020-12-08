import * as React from "react";
import * as ReactDOM from "react-dom";

import App from "@/app";

import router from "@/scheme/router";

ReactDOM.render(<App view={router.get().view} focus={false} maximize={false} fullscreen={false}/>, document.getElementById("app"));
