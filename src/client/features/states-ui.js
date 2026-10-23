/** The state register is read-only browsing; opening a profile does not create a policy proposal. */
const statesNav = document.createElement("button");
statesNav.dataset.page = "states";
statesNav.innerHTML = "▥ <span>States & territories</span>";
document.querySelector("nav").append(statesNav);
statesNav.onclick = () => navigate("states");
const navigateBeforeDirectory = navigate;
navigate = function (p) {
  if (p !== "states") return navigateBeforeDirectory(p);
  page = p;
  document
    .querySelectorAll("nav button")
    .forEach((b) => b.classList.toggle("active", b.dataset.page === p));
  $("#crumb").textContent = "States & territories";
  render();
};
const renderBeforeDirectory = render;
render = function () {
  if (page !== "states") return renderBeforeDirectory();
  $("#content").innerHTML = statesDirectory();
  $("#state-search").oninput = (e) => {
    const cursor = e.target.selectionStart;
    stateSearch = e.target.value;
    render();
    $("#state-search").focus();
    $("#state-search").setSelectionRange(cursor, cursor);
  };
  $("#zone-filter").onchange = (e) => {
    zoneFilter = e.target.value;
    render();
  };
  document.querySelectorAll("[data-open-state]").forEach(
    (b) =>
      (b.onclick = () => {
        stateProfile(Number(b.dataset.openState));
      }),
  );
  $("#states-export").onclick = () => download("aderin-state-data.csv", stateRegisterCSV());
};
render();
