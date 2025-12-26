// pages/blog/@slug/+Page.jsx
import React from "react";
import { usePageContext } from "vike-react/usePageContext";
import BlogPage from "../../../src/blog.jsx";

export default function Page() {
  const pageContext = usePageContext();
  const slug = pageContext?.routeParams?.slug;
  return <BlogPage slug={slug} />;
}
