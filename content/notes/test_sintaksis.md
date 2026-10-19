---
title: test sintaks highlighting
description: ini adalah bagan pengujian teknis sintaksis dan blok khusus dari integrasi widget Sveltia
img: https://plus.unsplash.com/premium_photo-1790978185420-2f96c7d1ab16?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D
tags: []
date: 2025-10-18
category: DeveloperDocs
---

## Pengujian 01



<figure class="embed-video"><video src="https://res.cloudinary.com/pfsm9q7t/video/upload/v1792320385/jj.mp4" poster="" controls preload="metadata" playsinline></video><figcaption class="caption-text">My cloudinary Assets</figcaption></figure>





<div class="embed-grid" data-cols="4"><figure><img src="https://res.cloudinary.com/pfsm9q7t/image/upload/v1792319011/grid4.webp" alt="grid1" loading="lazy"></figure><figure><img src="https://res.cloudinary.com/pfsm9q7t/image/upload/v1792319012/grid2.webp" alt="grid2" loading="lazy"></figure><figure><img src="https://res.cloudinary.com/pfsm9q7t/image/upload/v1792319011/grid1.webp" alt="grid3" loading="lazy"></figure><figure><img src="https://res.cloudinary.com/pfsm9q7t/image/upload/v1792319011/grid3.webp" alt="grid4" loading="lazy"></figure></div>





<pre class="terminal"><span class="term-cmd"><span class="term-prompt">$</span> cp node_modules/@sveltia/cms/dist/sveltia-cms.js public/admin/</span>
<span class="term-out">copied to public/admin/</span></pre>





<a class="embed-link" href="https://github.com/axelkenshi/axel-portofolio" target="_blank" rel="noopener noreferrer"><span class="link-body"><span class="link-title">Repo github ini</span><span class="link-desc">mari lihat karya saya</span></span><img class="link-thumb" src="https://github.com/user-attachments/assets/172cd83f-3f80-4fce-867b-2fe55a0b5015" alt="" loading="lazy"></a>





<details class="fold">
<summary>apakah ini FaQ?</summary>

Ya tentu saja

</details>





```diff title="style.css"
- color: "blue";
+ color: "red";
```





<div class="embed-iframe"><iframe src="https://player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&amp;cid=213186693&amp;p=1&amp;share_source=copy_web" height="480" loading="lazy" allowfullscreen></iframe></div>





```js title="code.js"
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');

// ---------- Mock CMS ----------
const registry = [];
globalThis.CMS = {
  registerEditorComponent: (def) => registry.push(def),
  registerPreviewStyle: () => {},
  init: () => {},
};
new Function(read('public/admin/editor-components.js'))();
```



<div class="callout" data-type="important">

apakah valuenya tersimpan?

</div>

ini rumus matematika



<div class="math-block" data-tex-b64="XGZyYWN7YX17Yn0gPSBcc3FydHt4XjIgKyB5XjJ9"></div>





<div class="mermaid-block" data-src-b64="Z3JhcGggVEQ7IEFbTXVsYWldIC0tPiBCe0NlayBkYXRhfTsgQiAtLT58eWF8IENbU2ltcGFuXTsgQiAtLT58dGlkYWt8IERbQmF0YWxd"></div>
