<script lang="ts">
  const currentYear = new Date().getFullYear();
  
  let name = '';
  let email = '';
  let message = '';
  
  // State untuk Honeypot (Input tersembunyi untuk jebakan bot)
  let botcheck = '';

  // State untuk Math Captcha
  let num1 = Math.floor(Math.random() * 9) + 1; // Angka 1-9
  let num2 = Math.floor(Math.random() * 9) + 1; // Angka 1-9
  let userAnswer = '';
  
  // Reactive statement untuk menghitung jawaban yang benar secara otomatis
  $: correctAnswer = num1 + num2;

  let isSubmitting = false;
  let submitStatus = ''; // 'success' | 'error' | 'captcha-error' | ''

  function generateNewQuestion() {
    num1 = Math.floor(Math.random() * 9) + 1;
    num2 = Math.floor(Math.random() * 9) + 1;
    userAnswer = '';
  }

  async function handleSubmit() {
    isSubmitting = true;
    submitStatus = '';

    // 1. Validasi Honeypot
    if (botcheck !== '') {
      console.warn("Bot detected via honeypot!");
      isSubmitting = false;
      return; 
    }

    // 2. Validasi Math Captcha
    if (parseInt(userAnswer) !== correctAnswer) {
      submitStatus = 'captcha-error';
      isSubmitting = false;
      return; 
    }

    // Ganti dengan Access Key yang kamu dapatkan dari Web3Forms
    const ACCESS_KEY = "2a8d92b3-523a-45f6-8c84-a901616bf323"; 

    const formData = {
      access_key: ACCESS_KEY,
      name: name,
      email: email,
      message: message,
      subject: `Portfolio Contact: Message from ${name}`
    };

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        submitStatus = 'success';
        name = '';
        email = '';
        message = '';
        generateNewQuestion();
      } else {
        submitStatus = 'error';
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      submitStatus = 'error';
    } finally {
      isSubmitting = false;
    }
  }
</script>

<footer id="contact" class="w-full border-t border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/20 px-6 py-12 md:py-16 text-zinc-600 dark:text-zinc-400 text-sm transition-colors duration-300">
  <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
    
    <!-- BRAND / IDENTITY COLUMN -->
    <div class="md:col-span-4 flex flex-col gap-3">
      <h3 class="text-zinc-900 dark:text-zinc-100 font-bold text-lg tracking-tight transition-colors">Axel Kenshi</h3>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm transition-colors">
        A junior web front-end developer who enjoys exploring visual design, learning about creating harmonious UIs and optimizing application performance. <br />
        Besides websites, I enjoy exploring IoT and native app development. Look forward to seeing me become a developer who makes a real contribution to society!
      </p>
      <p class="text-[10px] text-zinc-400 dark:text-zinc-700 mt-auto pt-4 md:pt-0 transition-colors">
        Built with Astro, Svelte & Tailwind CSS
      </p>
    </div>

    <!-- NAVIGATION & LINKS COLUMNS -->
    <div class="grid grid-cols-2 gap-4 md:col-span-4">
      
      <!-- Navigation Links -->
      <div class="flex flex-col gap-3">
        <h4 class="text-zinc-800 dark:text-zinc-200 font-semibold text-xs tracking-wider uppercase transition-colors">Navigation</h4>
        <ul class="flex flex-col gap-2.5 text-xs">
          <li>
            <a href="/" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </a>
          </li>
          <li>
            <a href="/#about" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              About Me
            </a>
          </li>
          <li>
            <a href="/#experience" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/></svg>
              Milestone
            </a>
          </li>
          <li>
            <a href="/#certification" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/></svg>
              Award
            </a>
          </li>
          <li>
            <a href="/#projects" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7h-9l-3-3H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/></svg>
              Projects
            </a>
          </li>
          <li>
            <a href="/#blog-section" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2-2.5z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Blogs
            </a>
          </li>
        </ul>
      </div>

      <!-- Social Connect Links -->
      <div class="flex flex-col gap-3">
        <h4 class="text-zinc-800 dark:text-zinc-200 font-semibold text-xs tracking-wider uppercase transition-colors">Connect</h4>
        <ul class="flex flex-col gap-2.5 text-xs">
          <li>
            <a href="https://github.com/axelkenshi" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub
            </a>
          </li>
          <li>
            <a href="https://linkedin.com/in/axel-kenshi-mikaeel" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </a>
          </li>
          <li>
            <a href="/rss.xml" target="_blank" data-astro-reload class="flex items-center gap-2 text-orange-600 dark:text-orange-500/90 hover:text-orange-500 dark:hover:text-orange-400 active:text-orange-500 font-medium transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>
              RSS Feed
            </a>
          </li>
          <li>
            <a href="/sitemap-index.xml" target="_blank" data-astro-reload class="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-5"/><path d="M9 17H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"/><rect x="9" y="12" width="6" height="5" rx="1"/></svg>
              Sitemap
            </a>
          </li>
        </ul>
      </div>

    </div>

    <!-- FORM COLUMN WITH LIGHT/DARK FORM INPUT VALUES -->
    <div class="md:col-span-4 flex flex-col gap-3">
      <h4 class="text-zinc-800 dark:text-zinc-200 font-semibold text-xs tracking-wider uppercase transition-colors">Get In Touch</h4>

      <form on:submit|preventDefault={handleSubmit} class="flex flex-col gap-2 mt-1">
        
        <!-- Honeypot -->
        <input 
          type="text" 
          name="botcheck" 
          bind:value={botcheck} 
          class="hidden" 
          style="display: none;" 
          tabindex="-1" 
          autocomplete="off" 
        />

        <div class="grid grid-cols-2 gap-2">
          <!-- Name Input Container -->
          <div class="relative text-zinc-400 dark:text-zinc-600 focus-within:text-zinc-600 dark:focus-within:text-zinc-400 transition-colors">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <input 
              type="text" 
              bind:value={name}
              placeholder="Your name..." 
              required 
              class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
            />
          </div>

          <!-- Email Input Container -->
          <div class="relative text-zinc-400 dark:text-zinc-600 focus-within:text-zinc-600 dark:focus-within:text-zinc-400 transition-colors">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </span>
            <input 
              type="email" 
              bind:value={email}
              placeholder="Your email..." 
              required 
              class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
            />
          </div>
        </div>

        <!-- Message Textarea Container -->
        <div class="relative text-zinc-400 dark:text-zinc-600 focus-within:text-zinc-600 dark:focus-within:text-zinc-400 transition-colors">
          <span class="absolute left-3 top-2.5 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </span>
          <textarea 
            bind:value={message}
            rows="3" 
            placeholder="Let's build something amazing together..." 
            required 
            class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all resize-none"
          ></textarea>
        </div>
        
        <!-- Captcha Block -->
        <div class="flex items-center gap-2 mt-0.5 w-full">
          <div class="flex-none bg-zinc-100 dark:bg-zinc-950/30 border border-zinc-200 dark:border-zinc-800/80 px-3 py-2 rounded-lg text-xs font-mono text-zinc-600 dark:text-zinc-400 select-none min-w-[70px] text-center transition-colors">
            {num1} + {num2} =
          </div>
          
          <div class="relative flex-1 text-zinc-400 dark:text-zinc-600 focus-within:text-zinc-600 dark:focus-within:text-zinc-400 transition-colors">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 9-6 6"/><path d="m8 9 6 6"/><path d="M5 12h14"/></svg>
            </span>
            <input 
              type="number" 
              bind:value={userAnswer}
              placeholder="Verify answer" 
              required 
              class="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 transition-all"
            />
          </div>
        </div>
        
        <!-- Premium Contrast Inverted Button -->
        <button 
          type="submit" 
          disabled={isSubmitting}
          class="w-full py-2 mt-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending Message...' : 'Send Message'}
        </button>

        <!-- Status Alerts -->
        {#if submitStatus === 'success'}
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 transition-colors">Message successfully sent directly to Axel, Stay tuned!</p>
        {:else if submitStatus === 'error'}
          <p class="text-[11px] text-rose-600 dark:text-rose-400 mt-1 transition-colors">Failed to send message. Please try again later.</p>
        {:else if submitStatus === 'captcha-error'}
          <p class="text-[11px] text-amber-600 dark:text-amber-400 mt-1 transition-colors">The math answer is wrong, please check again.</p>
        {/if}
      </form>
    </div>

  </div>

  <!-- Bottom Copyright Divider -->
  <div class="max-w-6xl mx-auto border-t border-zinc-200 dark:border-zinc-800/40 mt-10 pt-6 text-center text-[11px] text-zinc-400 dark:text-zinc-600 transition-colors">
    <p>© {currentYear} Axel Kenshi. All Rights Reserved.</p>
  </div>
</footer>
