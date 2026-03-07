/* ================================================================
   PACKAGES PAGE – Tab switching
   ================================================================ */

const tabs   = document.querySelectorAll('.pkg-tab');
const panels = document.querySelectorAll('.tab-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    // Update tabs
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Update panels
    panels.forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${target}`);
    if (panel) {
      panel.classList.add('active');
      // Scroll to just below the sticky tab bar
      const tabBar = document.querySelector('.pkg-tabs-bar');
      const offset = tabBar ? tabBar.offsetHeight + 8 : 80;
      const top = panel.getBoundingClientRect().top + window.scrollY - offset - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Activate tab from URL hash (e.g. packages.html#allin)
const hash = location.hash.replace('#', '');
if (hash) {
  const matchTab = document.querySelector(`.pkg-tab[data-tab="${hash}"]`);
  if (matchTab) matchTab.click();
}
