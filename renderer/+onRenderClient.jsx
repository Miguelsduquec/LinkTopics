import React from "react";
import { hydrateRoot } from "react-dom/client";

export default function onRenderClient(pageContext) {
  const { Page } = pageContext;

  hydrateRoot(
    document.getElementById("root"),
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );
}
