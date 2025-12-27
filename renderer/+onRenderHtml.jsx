import React from "react";
import { renderToString } from "react-dom/server";
import { escapeInject, dangerouslySkipEscape } from "vike/server";

export default function onRenderHtml(pageContext) {
  const { Page } = pageContext;

  const pageHtml = renderToString(
    <React.StrictMode>
      <Page />
    </React.StrictMode>
  );

  return escapeInject`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
  </body>
</html>`;
}
