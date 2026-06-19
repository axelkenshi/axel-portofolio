<script>
  import { onMount } from 'svelte';

  // Menerima indeks pencarian sebagai props dari Astro
  export let searchIndex = [];

  let isOpen = false;
  let searchQuery = '';
  let results = [];
  let inputElement;

  // Svelte Reactive Statement: Otomatis memfilter data saat searchQuery berubah
  $: {
      if (searchQuery.trim() === '') {
        results = [];
      } else {
        const query = searchQuery.toLowerCase().trim();
        results = searchIndex.filter(item => 
          (item.title || '').toLowerCase().includes(query) || 
          (item.description || '').toLowerCase().includes(query) ||
          (item.category || '').toLowerCase().includes(query) ||
          (item.tags || []).some(t => (t || '').toLowerCase().includes(query))
      );
    }
  }

  function closeModal() {
    isOpen = false;
    searchQuery = '';
  }

  function openModal() {
    isOpen = true;
    // Beri sedikit delay agar input element sempat dirender oleh Svelte sebelum di-focus
    setTimeout(() => inputElement?.focus(), 50);
  }

  onMount(() => {
    // Daftarkan Hotkey '/' dan 'ESC'
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        openModal();
      }
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Sediakan jembatan global agar tombol di Navbar Astro bisa memicu modal ini
    window.openQuilSearch = openModal;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

{#if isOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div 
    class="fixed inset-0 bg-quilBg/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4 transition-all duration-200"
    on:click|self={closeModal}
  >
    <div class="bg-quilCard border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
      
      <!-- Input Box -->
      <div class="p-4 border-b border-zinc-900 flex items-center gap-3 bg-zinc-900/30">
        <svg class="w-5 h-5 text-quilAccent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          bind:this={inputElement}
          bind:value={searchQuery}
          type="text" 
          placeholder="Ketik kata kunci (Tekan 'ESC' untuk keluar)..." 
          class="w-full bg-transparent text-sm text-zinc-200 focus:outline-none placeholder-zinc-500"
          autocomplete="off"
        />
      </div>

      <!-- Area Hasil Pencarian -->
      <div class="flex-grow overflow-y-auto p-4 space-y-2 quil-scrollbar bg-quilCard">
        {#if searchQuery.trim() === ''}
          <p class="text-xs text-zinc-500 italic text-center py-4">Mulai mengetik untuk mencari catatan...</p>
        {:else if results.length === 0}
          <p class="text-xs text-zinc-600 italic text-center py-8">Tidak menemukan hasil untuk kata kunci "{searchQuery}"</p>
        {:else}
          {#each results as item}
            <a 
              href="/quil-notes/{item.id}" 
              class="block p-3 rounded-xl bg-zinc-900/40 hover:bg-quilAccentMuted/20 border border-zinc-900 hover:border-quilAccent/20 transition-all group"
              on:click={closeModal}
            >
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-mono text-quilText">{item.category}</span>
                <div class="flex gap-1">
                  {#each item.tags.slice(0, 2) as tag}
                    <span class="text-[9px] text-zinc-600 bg-zinc-950 px-1 rounded">#{tag}</span>
                  {/each}
                </div>
              </div>
              <h4 class="text-sm font-bold text-zinc-200 group-hover:text-zinc-50 mt-1 transition-colors">{item.title}</h4>
              {#if item.description}
                <p class="text-xs text-zinc-400 font-light mt-0.5 line-clamp-1">{item.description}</p>
              {/if}
            </a>
          {/each}
        {/if}
      </div>
      
      <!-- Footer Modal -->
      <div class="px-4 py-2.5 bg-zinc-950/60 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-500 font-mono">
        <span>Svelte Engine Activated</span>
        <span>ESC to close</span>
      </div>
    </div>
  </div>
{/if}
