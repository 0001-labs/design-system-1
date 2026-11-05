import { managedFlags, selected, changeRule, audienceRows, tableGroups, type ManagedFlags } from './audience.ts';
export * from './audience.ts';

/** A matrix square's state: a check when the flag is on for its row, a cross when off. */
export function setToggle(button: HTMLButtonElement, on: boolean): void {
  button.setAttribute('aria-checked', String(on));
  const mark = document.createElement('span');
  mark.className = `ds-icon ds-icon--small ${on ? 'ds-icon-check' : 'ds-icon-close'}`;
  mark.setAttribute('aria-hidden', 'true');
  button.replaceChildren(mark);
}

/**
 * Cut words fade over their last square, never an ellipsis: marks an
 * audience's name `data-cut="end"` while it is wider than its column, and
 * matrix.css fades it only then. The matrix measures its own names, the same
 * way as Design system 1's cut-fade module, since a product draws it without that module.
 */
export function markCut(words: Element): void {
  if (words.scrollWidth > words.clientWidth + 1) { if (words.getAttribute('data-cut') !== 'end') words.setAttribute('data-cut', 'end'); }
  else if (words.hasAttribute('data-cut')) words.removeAttribute('data-cut');
}

/**
 * Draws the matrix of the existing release rules. `call()` reads the flags
 * again and `call(rule)` saves one; the host's transport stays owner-authenticated.
 */
export function mountAudienceMatrix(host: HTMLElement, initial: ManagedFlags, call: (value?: unknown) => Promise<unknown>): void {
  let { flags, accounts } = managedFlags(initial);
  let busy = false;
  const status = document.createElement('p'); status.className = 'flags-matrix-status'; status.setAttribute('role', 'status');
  const chart = document.createElement('div'); chart.className = 'flags-matrix matrix-chart';
  // The names are measured when they are drawn and whenever their box changes (a hidden matrix shown, the page's fonts arriving).
  const cuts = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(entries => { for (const entry of entries) markCut(entry.target); });
  const measure = () => { for (const words of chart.querySelectorAll('.matrix-words')) markCut(words); };
  document.fonts?.ready.then(measure, () => {});
  function render() {
    const groups = tableGroups(flags);
    const tables = groups.map((group, index) => {
      const table = document.createElement('table'); table.className = 'matrix-table';
      if (index === groups.length - 1) {
        const caption = table.createCaption(); caption.className = 'flags-matrix-caption';
        caption.textContent = 'Flags across, audiences and accounts down. A check shows who the release rule includes, a cross who it leaves out. Changes save automatically. Choosing an account replaces Owner, a share or Everyone; multiple accounts can be selected. A share releases to that part of the accounts, the same accounts each time, and a larger share keeps them. The accounts are the ones the product knows.';
      }
      const head = table.createTHead().insertRow(); const corner = document.createElement('th'); corner.scope = 'col'; corner.className = 'matrix-corner'; corner.textContent = 'Audience'; head.appendChild(corner);
      for (const flag of group) { const th = document.createElement('th'); th.scope = 'col'; th.className = 'matrix-column'; const span = document.createElement('span'); span.textContent = flag.label; th.title = flag.description || flag.label; th.appendChild(span); head.appendChild(th); }
      const body = table.createTBody();
      for (const [row, name] of audienceRows(flags, accounts)) {
        const tr = body.insertRow(); const th = document.createElement('th'); th.scope = 'row'; th.className = 'matrix-row'; th.title = row.kind === 'account' ? row.id : name; const words = document.createElement('span'); words.className = 'matrix-words'; words.textContent = name; th.appendChild(words); tr.appendChild(th);
        for (const flag of group) {
          const cell = tr.insertCell(); const button = document.createElement('button'); button.type = 'button'; button.className = 'flags-matrix-toggle'; button.setAttribute('role','switch'); button.setAttribute('aria-label',`${name}: ${flag.label}`); button.dataset.audience = row.kind; setToggle(button, selected(flag,row)); button.disabled = busy;
          button.addEventListener('click', async () => {
            if (busy) return; busy = true; render(); status.textContent = `Saving ${flag.label}…`;
            const next = changeRule(flag,row);
            try {
              await call({key:next.key,enabled:next.enabled,audience:next.audience,accountIds:next.accountIds ?? [],...(next.audience === 'percentage' ? {percentage:next.percentage} : {})});
              flags = flags.map(item => item.key === flag.key ? next : item); status.textContent = `${flag.label} saved.`;
            } catch {
              try { ({ flags, accounts } = managedFlags(await call())); status.textContent = 'Save interrupted. Current settings refreshed.'; }
              catch { status.textContent = 'Could not confirm the save. Reopen this app’s controls before trying again.'; render(); return; }
            }
            busy = false; render();
            const same = [...chart.querySelectorAll<HTMLButtonElement>('button')].find(item => item.getAttribute('aria-label') === `${name}: ${flag.label}`); same?.focus();
          });
          cell.appendChild(button);
        }
      }
      return table;
    });
    chart.replaceChildren(...tables);
    cuts?.disconnect(); for (const words of chart.querySelectorAll('.matrix-words')) cuts?.observe(words);
    measure();
  }
  host.replaceChildren(chart,status);
  if (!flags.length) { host.textContent = 'No features are waiting for release.'; return; }
  render();
}
