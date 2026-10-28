// =======================================
// Accesibility dock core engine
// =======================================
type A11yState = {
  textSize: "normal" | "large";
  spacing: "normal" | "wide";
  contrast: "normal" | "high";
  colorFilter: "none" | "protanopia" | "deuteranopia" | "tritanopia";
  monochrome: boolean;
  dyslexic: boolean;
  reduceMotion: boolean;
  readFocus: boolean;
};

const DEFAULTS: A11yState = {
  textSize: "normal",
  spacing: "normal",
  contrast: "normal",
  colorFilter: "none",
  monochrome: false,
  dyslexic: false,
  reduceMotion: false,
  readFocus: false,
};

const KEY = "a11y";

function load(): A11yState {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

function save(state: A11yState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

// Nilai default menghapus atribut data-* dari <html>
function apply(state: A11yState) {
  const root = document.documentElement;
  const set = (name: string, on: boolean, value: string) => {
    if (on) root.dataset[name] = value;
    else delete root.dataset[name];
  };
  set("textSize", state.textSize !== "normal", state.textSize);
  set("spacing", state.spacing !== "normal", state.spacing);
  set("contrast", state.contrast !== "normal", state.contrast);
  set("colorFilter", state.colorFilter !== "none", state.colorFilter);
  set("monochrome", state.monochrome, "true");
  set("dyslexic", state.dyslexic, "true");
  set("reduceMotion", state.reduceMotion, "true");
  set("readFocus", state.readFocus, "true");
}

function syncControls(state: A11yState) {
  document
    .querySelectorAll<HTMLButtonElement>('[role="radio"][data-a11y]')
    .forEach((btn) => {
      const key = btn.dataset.a11y as keyof A11yState;
      btn.setAttribute(
        "aria-checked",
        String(state[key] === btn.dataset.value),
      );
    });
  document
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-a11y]')
    .forEach((input) => {
      const key = input.dataset.a11y as keyof A11yState;
      input.checked = Boolean(state[key]);
    });
}

export function setupA11y() {
  const dialog = document.querySelector<HTMLDialogElement>(
    '[data-dialog="a11y"]',
  );
  if (!dialog || dialog.dataset.ready === "true") {
    // Terapkan state di setiap navigasi, walau dialog sudah diinisialisasi
    apply(load());
    return;
  }
  dialog.dataset.ready = "true";

  let state = load();
  apply(state);
  syncControls(state);

  const update = (next: A11yState) => {
    state = next;
    save(state);
    apply(state);
    syncControls(state);
  };

  dialog
    .querySelectorAll<HTMLButtonElement>('[role="radio"][data-a11y]')
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.a11y as keyof A11yState;
        update({ ...state, [key]: btn.dataset.value });
      });
    });

  dialog
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-a11y]')
    .forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.a11y as keyof A11yState;
        update({ ...state, [key]: input.checked });
      });
    });

  dialog.querySelector("[data-a11y-reset]")?.addEventListener("click", () => {
    update({ ...DEFAULTS });
  });
}

// =======================================
// Spawn Dialog function
// =======================================
// =======================================
// Dock & dialog: buka dan tutup lewat event delegation
// Satu listener di document, dipasang sekali. Tidak terikat pada elemen,
// sehingga tetap bekerja setelah ClientRouter mengganti DOM.
// =======================================
let dockWired = false;

export function setupDock() {
  if (dockWired) return;
  dockWired = true;

  document.addEventListener("click", (e) => {
    const target = e.target as Element | null;
    if (!target) return;

    // 1. Tombol pembuka (dock dan lainnya)
    const opener = target.closest<HTMLElement>("[data-open]");
    if (opener) {
      const dlg = document.querySelector<HTMLDialogElement>(
        `dialog[data-dialog="${opener.dataset.open}"]`,
      );
      if (dlg && !dlg.open) dlg.showModal();
      return;
    }

    // 2. Tombol ✕ dan link yang menutup dialog
    const closer = target.closest<HTMLElement>("[data-close], [data-close-on-click]");
    if (closer) {
      closer.closest<HTMLDialogElement>("dialog")?.close();
      return;
    }

    // 3. Klik backdrop: target adalah elemen dialog itu sendiri
    if (target instanceof HTMLDialogElement && target.open) {
      target.close();
    }
  });
}
