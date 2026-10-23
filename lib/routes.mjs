/** Single page-to-URL map used by the catch-all validator, client navigation bridge and HTTP tests. */
export const workspaceRoutes = {
  overview: "/",
  states: "/states",
  citizens: "/citizens",
  evidence: "/evidence",
  data: "/data",
  people: "/households",
  sectors: "/sectors",
  scenarios: "/sectors/food",
  recommendations: "/recommendations",
  decisions: "/decisions",
  analyst: "/analyst",
  commerce: "/businesses",
  comparisons: "/comparisons",
};
export function pageForPath(pathname) {
  return (
    Object.entries(workspaceRoutes).find(
      ([, path]) => path === (pathname === "/" ? "/" : pathname.replace(/\/$/, "")),
    )?.[0] || null
  );
}
