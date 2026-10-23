"use client";

/** React owns only the stable shell boundary. Retained renderers own its DOM; the shared Next layout keeps unsaved drafts alive. */

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { workspaceShell } from "./workspace-shell.mjs";
import { pageForPath, workspaceRoutes } from "../lib/routes.mjs";

export default function NationWorkspace() {
  const root = useRef(null),
    workspace = useRef(null),
    routerRef = useRef(null),
    pathRef = useRef(null);
  const router = useRouter(),
    pathname = usePathname();
  const [error, setError] = useState("");
  routerRef.current = router;
  pathRef.current = pathname;
  // Mount once; pathname changes use the existing controller instead of rebuilding its state.
  useEffect(() => {
    let active = true;
    import("../generated/workspace-runtime.mjs")
      .then(({ mountWorkspace }) => {
        if (!active || !root.current) return;
        workspace.current = mountWorkspace(root.current, {
          onNavigate(page) {
            const path = workspaceRoutes[page];
            if (path && path !== pathRef.current) routerRef.current.push(path, { scroll: false });
          },
        });
        workspace.current.show(pageForPath(pathRef.current) || "overview");
      })
      .catch(() => {
        if (active) setError("The workspace could not load. Refresh this page to try again.");
      });
    return () => {
      active = false;
      workspace.current?.destroy();
      workspace.current = null;
    };
  }, []);
  useEffect(() => {
    const page = pageForPath(pathname);
    if (page) workspace.current?.show(page);
  }, [pathname]);
  return (
    <>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      <div ref={root} dangerouslySetInnerHTML={{ __html: workspaceShell }} />
      <noscript>Enable JavaScript to use the interactive planning workspace.</noscript>
    </>
  );
}
