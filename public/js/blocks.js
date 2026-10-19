// public/js/blocks.js
// Merender blok rumus (KaTeX) dan diagram (Mermaid) di browser.
// Semua aset diambil dari /vendor/ (self-host), sehingga cocok dengan CSP
// script-src 'self' dan style-src 'self'. Berkas ini hanya memuat library
// yang benar-benar dibutuhkan halaman.
(() => {
  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error(`Gagal memuat ${src}`));
      document.head.appendChild(s);
    });

  const loadStyle = (href) => {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };

  // Sumber disimpan base64 (lihat b64encode di editor-components.js)
  const b64decode = (s) => {
    const bin = atob(s);
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  };

  async function renderMath() {
    const els = document.querySelectorAll('.math-block[data-tex-b64]');
    if (!els.length) return;

    loadStyle('/vendor/katex/katex.min.css');
    await loadScript('/vendor/katex/katex.min.js');

    els.forEach((el) => {
      try {
        const tex = b64decode(el.dataset.texB64);
        window.katex.render(tex, el, { displayMode: true, throwOnError: false });
      } catch (err) {
        console.error('[math] gagal render:', err);
      }
    });
  }

  async function renderMermaid() {
    const blocks = document.querySelectorAll('.mermaid-block[data-src-b64]');
    if (!blocks.length) return;

    // Import dinamis: mermaid hanya diunduh di halaman yang memakainya
    const { default: mermaid } = await import('/vendor/mermaid/mermaid.esm.min.mjs');

    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: dark ? 'dark' : 'default',
    });

    const nodes = Array.from(blocks, (block) => {
      const div = document.createElement('div');
      div.className = 'mermaid';
      div.textContent = b64decode(block.dataset.srcB64);
      block.replaceWith(div);
      return div;
    });

    await mermaid.run({ nodes });
  }

  const run = () => {
    renderMath().catch((err) => console.error('[math]', err));
    renderMermaid().catch((err) => console.error('[mermaid]', err));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
