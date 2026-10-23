/** Render decision form HTML; the controller supplies transient view state. */
function renderDecisionFormMarkup() {
  return /* HTML */ `<p class="eyebrow">PRESERVE THE CONTEXT</p>
    <h1>Save a decision record</h1>
    <form id="decision-form">
      <div class="field">
        <label for="decision-title">Decision title</label
        ><input
          id="decision-title"
          name="title"
          required
          maxlength="140"
          value="Food affordability: integrated response package"
        />
      </div>
      <div class="field">
        <label for="reason">Why this package? What trade-offs were accepted?</label
        ><textarea
          id="reason"
          name="reason"
          required
          maxlength="3000"
          placeholder="Record your reasoning for the next administration…"
        ></textarea>
      </div>
      <div class="field">
        <label for="reviewer">Responsible reviewer</label
        ><input
          id="reviewer"
          name="reviewer"
          required
          maxlength="100"
          value="Amara Okon · Planning Ministry"
        />
      </div>
      <p>
        Includes the current allocations, evidence references, model assumptions and a milestone
        roadmap. Saved as a draft; outcomes are unverified.
      </p>
      <button class="btn primary" type="submit">Save draft decision</button>
    </form>`;
}
