import { createRoot } from "react-dom/client";
import React from "react";

const root = createRoot(document.getElementById("root"));

const myDiv = React.createElement("div", null, "hii");

root.render(myDiv);
