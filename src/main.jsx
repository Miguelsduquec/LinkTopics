import React from "react";
import { ViteSSG } from "vite-plugin-ssg";
import App from "./App.jsx";
import { routes } from "./routes.jsx";

export const createApp = ViteSSG(
  App,
  { routes }
);
