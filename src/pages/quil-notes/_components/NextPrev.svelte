<script lang="ts">
  export let prevPage: { title: string; url: string } | null = null;
  export let nextPage: { title: string; url: string } | null = null;
</script>

<nav class="grid grid-cols-2 gap-4 pt-10 mt-8 border-t border-zinc-900/60 font-sans">
  <!-- Tombol Previous (Kiri) -->
  {#if prevPage}
    <a href={prevPage.url} class="flex items-start gap-2.5 p-3.5 rounded-xl bg-zinc-900/30 hover:bg-quilAccentMuted/10 border border-zinc-900/80 hover:border-quilAccent/20 transition-all group col-start-1">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-1 text-zinc-500 group-hover:text-quilText transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
      <div class="flex flex-col min-w-0">
        <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Previous</span>
        <span class="text-xs sm:text-sm font-bold text-zinc-300 group-hover:text-quilText transition-colors mt-0.5 line-clamp-2 leading-snug">{prevPage.title}</span>
      </div>
    </a>
  {:else}
    <!-- Spacer kosong jika tidak ada page sebelumnya agar layout kolom kanan tidak geser -->
    <div class="col-start-1" />
  {/if}

  <!-- Tombol Next (Kanan) -->
  {#if nextPage}
    <a href={nextPage.url} class="flex items-start justify-end text-right gap-2.5 p-3.5 rounded-xl bg-zinc-900/30 hover:bg-quilAccentMuted/10 border border-zinc-900/80 hover:border-quilAccent/20 transition-all group col-start-2">
      <div class="flex flex-col min-w-0">
        <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Next</span>
        <span class="text-xs sm:text-sm font-bold text-zinc-300 group-hover:text-quilText transition-colors mt-0.5 line-clamp-2 leading-snug">{nextPage.title}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 mt-1 text-zinc-500 group-hover:text-quilText transition-colors" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </a>
  {/if}
</nav>
