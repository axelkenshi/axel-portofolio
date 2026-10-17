// src/scripts/canvas-utils.ts

/**
 * Optimasi: Sumber Jank, kode berulang, Hambatan rendering
 * Ini Khusus: dev/_components/AboutMe.astro & /Milestone.astro
 * Memantau kelas dark pada <html> dan <body>.
 * Hasilnya disimpan di cache agar DOM tidak dibaca setiap frame.
 */
export function createThemeWatcher(): { isDark: () => boolean; dispose: () => void } {
  const readDark = (): boolean =>
    document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');

  let dark = readDark();
  const observer = new MutationObserver(() => {
    dark = readDark();
  });

  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  if (document.body) observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  return {
    isDark: () => dark,
    dispose: () => observer.disconnect(),
  };
}

/**
 * Loop requestAnimationFrame yang otomatis berhenti saat section tidak terlihat
 * atau tab tidak aktif. Panggil dispose() saat transisi halaman.
 */
export function createCanvasLoop(
  section: Element | null,
  frame: () => void
): { start: () => void; dispose: () => void } {
  let rafId = 0;
  let inView = true;

  const tick = () => {
    frame();
    rafId = requestAnimationFrame(tick);
  };

  const start = () => {
    if (rafId || !inView || document.hidden) return;
    rafId = requestAnimationFrame(tick);
  };

  const stop = () => {
    cancelAnimationFrame(rafId);
    rafId = 0;
  };

  const io = section
    ? new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        if (inView) start();
        else stop();
      })
    : null;

  if (section && io) io.observe(section);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  return {
    start,
    dispose: () => {
      stop();
      io?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}