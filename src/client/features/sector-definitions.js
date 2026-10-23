/** Synthetic sector baselines and intervention coefficients, expanded per state. */
const sectorDefinitions = {
  education: {
    name: "Education",
    icon: "◇",
    metric: "School attendance",
    unit: "%",
    baseline: [64, 61, 81, 78, 68, 84],
    target: 90,
    higher: true,
    eligible: 0.24,
    source: "Synthetic school census · 240 schools",
    gap: "Attendance does not measure learning quality; informal schools are excluded.",
    people: "School-age children",
    impact: "More reliable transport and clean water can reduce barriers to attendance.",
    actions: [
      ["Classroom rehabilitation", 0.07],
      ["Teacher recruitment & support", 0.1],
      ["School meal programme", 0.06],
    ],
    links: "Transport → school access · Water → attendance · Food → concentration",
    milestones: [
      "Audit school capacity and attendance registers",
      "Recruit teachers and verify meal delivery",
      "Compare attendance, learning assessments and rural access",
    ],
  },
  transport: {
    name: "Transport",
    icon: "⇄",
    metric: "Average essential-service journey",
    unit: "min",
    baseline: [94, 86, 42, 67, 81, 38],
    target: 30,
    higher: false,
    eligible: 1,
    source: "Synthetic mobility survey · 1,200 journeys",
    gap: "Journey averages hide disability access and peak-hour delays.",
    people: "Residents relying on regional routes",
    impact: "Shorter journeys may improve access to markets, schools and healthcare.",
    actions: [
      ["Road & bridge repairs", 0.19],
      ["Public bus services", 0.12],
      ["Rural feeder connections", 0.15],
    ],
    links: "Transport → food freight · Transport → school access · Transport → clinic access",
    milestones: [
      "Inspect bridges and establish journey-time baselines",
      "Complete priority repairs and launch bus routes",
      "Audit travel times, fares and access by community",
    ],
  },
  health: {
    name: "Healthcare",
    icon: "✚",
    metric: "Primary care access",
    unit: "%",
    baseline: [48, 44, 73, 70, 52, 77],
    target: 90,
    higher: true,
    eligible: 1,
    source: "Synthetic facility census · 180 clinics",
    gap: "Access represents geographic coverage, not treatment quality or medicine availability.",
    people: "Residents in clinic catchments",
    impact:
      "Reliable electricity and transport can support functioning clinics and timely referrals.",
    actions: [
      ["Primary clinic upgrades", 0.09],
      ["Community health workers", 0.08],
      ["Medicine supply reliability", 0.06],
    ],
    links: "Energy → clinic uptime · Water → infection prevention · Transport → referrals",
    milestones: [
      "Verify clinic readiness and catchment coverage",
      "Staff facilities and establish medicine delivery logs",
      "Review access, stockouts and patient waiting times",
    ],
  },
  energy: {
    name: "Energy",
    icon: "ϟ",
    metric: "Electricity access",
    unit: "%",
    baseline: administrativeZones.map((r) => r.power),
    target: 95,
    higher: true,
    eligible: 1,
    source: "Synthetic utility register · 360 service zones",
    gap: "Connection access does not establish affordability or hours of reliable supply.",
    people: "Residents in service zones",
    impact: "Reliable power can support businesses, cold storage, schools and health facilities.",
    actions: [
      ["Grid rehabilitation", 0.08],
      ["Community solar systems", 0.1],
      ["Last-mile connections", 0.07],
    ],
    links: "Energy → food storage · Energy → clinic uptime · Energy → business productivity",
    milestones: [
      "Map unserved communities and verify demand",
      "Complete grid repairs and commission solar systems",
      "Measure connections, uptime and household bills",
    ],
  },
  water: {
    name: "Water & sanitation",
    icon: "≈",
    metric: "Basic safe-water access",
    unit: "%",
    baseline: [46, 41, 76, 72, 50, 80],
    target: 95,
    higher: true,
    eligible: 1,
    source: "Synthetic water-point audit · 420 sites",
    gap: "Infrastructure coverage is a proxy; regular water-quality testing is still required.",
    people: "Residents in water-service catchments",
    impact: "Safe water may reduce collection time and support health and school attendance.",
    actions: [
      ["Water-point rehabilitation", 0.1],
      ["Piped network expansion", 0.09],
      ["Sanitation & quality testing", 0.06],
    ],
    links: "Water → health · Water → school attendance · Energy → pumping reliability",
    milestones: [
      "Test water quality and audit broken infrastructure",
      "Restore water points and extend priority networks",
      "Check water safety, service continuity and collection time",
    ],
  },
};
// Expand zone seed indicators into state-specific baselines before creating datasets.
for (const [key, s] of Object.entries(sectorDefinitions)) {
  const zoneBaseline = [...s.baseline];
  s.baseline = regions.map((r, i) =>
    key === "energy"
      ? r.power
      : Math.max(
          0,
          Math.min(
            s.unit === "%" ? 100 : 240,
            zoneBaseline[r.parentZone] + [-3, 2, -1, 3, -2, 1][i % 6],
          ),
        ),
  );
}
