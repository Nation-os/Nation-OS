/** The first page describes the country. Planning actions live on dedicated pages and must not replace this profile. */
// The landing page presents country information; planning remains in dedicated pages.
function countryProfile() {
  const total = regions.reduce((sum, r) => sum + r.pop, 0),
    state = regions[selected];
  const average = (key) =>
    regions.reduce((sum, r, i) => sum + sectorDefinitions[key].baseline[i] * r.pop, 0) / total;
  return (
    title(
      "COUNTRY PROFILE · SYNTHETIC BASELINE",
      "Republic of Aderin",
      "Population, administrative divisions, geography and public services.",
    ) + renderCountryProfileMarkup(average, state)
  );
}
const renderBeforeCountry = render;
render = function () {
  if (page !== "overview") return renderBeforeCountry();
  $("#crumb").textContent = "Country profile";
  $("#content").innerHTML = countryProfile();
  document.querySelectorAll("[data-region]").forEach((b) => {
    const pick = () => {
      selected = Number(b.dataset.region);
      render();
    };
    b.onclick = pick;
    b.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        pick();
      }
    };
  });
};
document.querySelector('[data-page="overview"] span').textContent = "Country profile";
render();
