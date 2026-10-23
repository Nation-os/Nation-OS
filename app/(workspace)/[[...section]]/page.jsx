import { notFound } from "next/navigation";
import { pageForPath } from "../../../lib/routes.mjs";

export default async function WorkspacePage({ params }) {
  const { section } = await params;
  const pathname = section?.length ? "/" + section.join("/") : "/";
  if (!pageForPath(pathname)) notFound();
  return null;
}
