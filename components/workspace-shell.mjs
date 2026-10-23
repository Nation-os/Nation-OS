/** Trusted initial DOM shell. React owns its container; controllers own the descendants. */
export const workspaceShell = /* HTML */ `<aside>
    <a class="brand" href="#"><span class="logo">N</span>Nation<span>OS</span></a>
    <div class="workspace">
      <span class="flag">▥</span>
      <div>Republic of Aderin<small>National planning workspace</small></div>
      <span>⌄</span>
    </div>
    <p class="navlabel">WORKSPACE</p>
    <nav>
      <button data-page="overview" class="active">◫ <span>National overview</span></button
      ><button data-page="evidence">◎ <span>Evidence explorer</span></button
      ><button data-page="scenarios">⌘ <span>Policy simulator</span><em>3</em></button
      ><button data-page="people">♧ <span>People & places</span></button
      ><button data-page="decisions">▤ <span>Decision memory</span></button>
    </nav>
    <div class="side-note">
      <i></i> A country built to explore
      <p>Fictional places. Synthetic data.<br />Real decision-making questions.</p>
      <button id="about">About this simulation ↗</button>
    </div>
    <div class="profile">
      <span class="avatar">AO</span>
      <div>Amara Okon<small>National planning analyst</small></div>
    </div>
  </aside>
  <main>
    <header>
      <div>
        <span class="breadcrumb">Workspace /</span> <span id="crumb">National overview</span>
      </div>
      <div class="header-right">
        <span class="demo">● SIMULATED COUNTRY</span><span class="date">23 October 2026</span
        ><button id="notifications" aria-label="View alerts">♧<b></b></button>
      </div>
    </header>
    <div id="content"></div>
    <footer>
      NationOS · National Decision Intelligence
      <span>Illustrative demo · No live government data</span>
    </footer>
  </main>
  <dialog id="modal">
    <button id="closeModal" aria-label="Close dialog">×</button>
    <div id="modalContent"></div>
  </dialog>
  <div id="toast" role="status"></div>`;
