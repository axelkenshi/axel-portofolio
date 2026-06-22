<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  // 'slide' digunakan sebagai Svelte transition directive di template (transition:slide)
  // Warning Vite adalah false positive — Svelte compiler menangani ini secara internal
  void slide;
  import { Grip, Sun, Moon, X, ChevronRight, ExternalLink, LibraryBig, Feather, Home, User, Briefcase, Award, FolderKanban, Mail } from "@lucide/svelte";

  // --- State (Svelte 5 runes) ---
  let isDark = $state(false);
  let isMenuOpen = $state(false);
  let scrollProgress = $state(0);

  // --- Scroll progress ring math ---
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  let strokeOffset = $derived(circumference * (1 - scrollProgress));

  // --- Handlers ---
  function handleScroll() {
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
  }

  function toggleDark() {
    isDark = !isDark;
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (_) {}
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  // INTERCEPTOR & SMOOTH SCROLL ENGINE CONTROL
  function handleAnchorClick(e: MouseEvent) {
    const target = e.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute("href");

    if (!href) return;

    // Normalisasi pencocokan path URL saat ini vs URL target
    const currentPath = window.location.pathname.replace(/\/$/, "") || "/";

    // Kasus 1: Klik Logo / Home saat sudah di Beranda -> Gulung Halus ke Atas
    if (href === "/" || href === "") {
      if (currentPath === "/") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
        isMenuOpen = false;
      }
      return;
    }

    // Kasus 2: Deteksi Tautan Jangkar Internal (Mengandung Karakter '#')
    if (href.includes("#")) {
      const [path, hashId] = href.split("#");
      const targetPath = path.replace(/\/$/, "") || "/";

      // Jika kita berada di halaman yang sama, lakukan eksekusi animasi animasi scroll
      if (currentPath === targetPath) {
        e.preventDefault();
        const targetElement = document.getElementById(hashId);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          // Perbarui hash URL tanpa memicu lonjakan layout
          window.history.pushState(null, "", `#${hashId}`);
        }
        isMenuOpen = false; // Otomatis menutup dropdown menu mobile
      }
    } else {
      // Kasus 3: Tautan Navigasi Biasa Luar Halaman (Misal: /quil-notes)
      isMenuOpen = false;
    }
  }

  onMount(() => {
    // Baca state dark dari DOM (sudah di-set oleh ThemeInit sebelum hydrate)
    isDark = document.documentElement.classList.contains("dark");

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // inisialisasi nilai awal

    // ── View Transitions: jalankan setiap halaman baru selesai load ──
    const onPageLoad = () => {
      // Reset scroll ring ke 0 (halaman baru selalu mulai dari atas)
      handleScroll();
      // Tutup dropdown menu saat navigasi ke halaman lain
      isMenuOpen = false;

      // Re-sync dark mode from localStorage on page load to ensure consistency
      try {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme === "dark") {
          document.documentElement.classList.add("dark");
          isDark = true;
        } else {
          document.documentElement.classList.remove("dark");
          isDark = false;
        }
      } catch (e) {
        console.error("Error accessing localStorage for theme:", e);
        isDark = document.documentElement.classList.contains("dark"); // Revert to DOM check as fallback
      }
    };

    document.addEventListener("astro:page-load", onPageLoad);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("astro:page-load", onPageLoad);
    };
  });
</script>

<!-- ─────────────────────────── HEADER ─────────────────────────── -->
<div class="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 lg:px-8">
  <header
    class="mx-auto max-w-6xl rounded-b-2xl bg-tan/60 dark:bg-zinc-800/50 backdrop-blur-lg"
  >
    <div
      class="w-full mx-auto px-6 h-14 flex items-center justify-between"
    >
  
      <!-- Logo + Brand -->
      <a
        href="/"
        onclick={handleAnchorClick}
        class="flex items-center gap-2 font-mark-script font-bold text-lg tracking-wide
              text-dark dark:text-tan"
      >
        Axel K.
      </a>
  
      <!-- Center Navigation (Desktop View) -->
      <nav class="flex items-center hidden lg:block border rounded-full p-2 m-4">
        <a href="/#about" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">About Me</a>
        <a href="/#experience" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Experience</a>
        <a href="/#certification" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Certification</a>
        <a href="/#projects" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Projects</a>
        <a href="/#contact" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Contact</a>
        <a href="/#blog-section" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Blogs</a>
        <a href="/quil-notes" onclick={handleAnchorClick} class="text-dark dark:text-tan mx-4 nav-hover">Qnote</a>
      </nav>
  
      <!-- Right controls -->
      <div class="flex items-center gap-3 relative">
  
        <!-- ── Dark/Light Toggle Pill ── -->
        <button
          onclick={toggleDark}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          class="flex items-center gap-1 p-1 rounded-full border-2 transition-colors"
        >
          <!-- Sun (active in light) -->
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center transition-colors
                  {isDark
              ? 'text-dark/40 dark:text-tan/30'
              : 'bg-dark text-tan'}"
          >
            <Sun size={13} strokeWidth={2} />
          </span>
          <!-- Moon (active in dark) -->
          <span
            class="w-6 h-6 rounded-full flex items-center justify-center transition-colors
                  {isDark
              ? 'bg-tan text-dark'
              : 'text-dark/40 dark:text-tan/30'}"
          >
            <Moon size={13} strokeWidth={2} />
          </span>
        </button>
  
        <!-- ── Menu Button + Scroll Ring ── -->
        <button
          onclick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          class="flex flex-col items-center leading-none
                text-dark dark:text-tan md:hidden"
        >
          <!-- Ring container -->
          <div class="relative w-11 h-11 flex items-center justify-center">
            <svg
              class="absolute inset-0 w-full h-full"
              viewBox="0 0 44 44"
              aria-hidden="true"
            >
              <!-- Track -->
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                class="opacity-20"
                transform="rotate(-90 22 22)"
              />
              <!-- Progress circle -->
              <circle
                cx="22"
                cy="22"
                r={radius}
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-dasharray={circumference}
                stroke-dashoffset={strokeOffset}
                transform="rotate(-90 22 22)"
                style="transition: stroke-dashoffset 80ms linear;"
              />
            </svg>
  
            {#if isMenuOpen}
              <X size={16} strokeWidth={2} />
            {:else}
              <Grip size={16} strokeWidth={2} />
            {/if}
          </div>
  
          <span class="text-[9px] tracking-[0.18em] uppercase -mt-0.5 font-medium">
            menu
          </span>
        </button>
  
        <!-- ── Dropdown Menu (Mobile View) ── -->
        {#if isMenuOpen}
          <div
            transition:slide={{ duration: 180 }}
            class="absolute right-0 top-full mt-2 w-48 bg-zinc-100/90 text-dark dark:bg-zinc-800/90 dark:text-tan rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <nav class="p-2 flex flex-col gap-1">
              <a
                href="/"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><Home class="mr-2 h-4 w-4" /> Home</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#about"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><User class="mr-2 h-4 w-4" /> About Me</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#experience"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><Briefcase class="mr-2 h-4 w-4" /> Experience</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#certification"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><Award class="mr-2 h-4 w-4" /> Certification</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#projects"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><FolderKanban class="mr-2 h-4 w-4" /> Projects</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#contact"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><Mail class="mr-2 h-4 w-4" /> Contact</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/#blog-section"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><LibraryBig class="mr-2 h-4 w-4" /> Blogs</span>
                <ChevronRight class="h-4 w-4 text-tan" />
              </a>
              <a
                href="/quil-notes"
                data-astro-prefetch
                onclick={handleAnchorClick}
                class="px-3 py-2 text-sm font-medium rounded-lg flex items-center justify-between hover:bg-gray-700 hover:text-white active:bg-gray-800 active:text-white transition-colors w-full"
              >
                <span class="flex items-center"><Feather class="mr-2 h-4 w-4" /> Quil Notes</span>
                <ExternalLink class="h-4 w-4 text-tan" />
              </a>
            </nav>
          </div>
        {/if}
      </div>
    </div>
  </header>
</div>
