import "../../DS1/1-root/one.css";
import "../../DS1/2-core/ds-icon";
import "./app.css";
import "./docs-embed.css";
import "./shell.css";
import "../../DS1/0-face/grid";
import { startAppScale } from "../../DS1/4-page/app-scale";
import { startAuth } from "./lib/backend";
import { followDocsScale, initializeDocsEmbed } from "./lib/docsEmbed";
import "./Root";

// Every screen stands on the app frame's scale: Desktop aligned on a computer, the width over 280
// on a phone or tablet; framed in the documentation, the documentation's own.
initializeDocsEmbed();
if (document.documentElement.hasAttribute("data-docs-embed")) followDocsScale();
else startAppScale();
startAuth();

document.getElementById("root")!.replaceChildren(document.createElement("ds1-root"));
