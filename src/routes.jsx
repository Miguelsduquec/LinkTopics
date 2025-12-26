import React from "react";
import App from "./App.jsx";
import BlogPage, { allPostSlugs } from "./blog.jsx";

export const routes = [
  { path: "/" },
  { path: "/blog" },
  ...allPostSlugs.map(slug => ({
    path: `/blog/${slug}`
  })),
  { path: "/privacy-policy" },
  { path: "/tos" }
];
