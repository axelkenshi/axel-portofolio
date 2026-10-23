---
title: test sintaks highlighting
description: ini adalah bagan pengujian teknis sintaksis dan blok khusus dari integrasi widget Sveltia
img: https://plus.unsplash.com/premium_photo-1790978185420-2f96c7d1ab16?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D
tags: []
date: 2025-10-18
category: DeveloperDocs
---

## Pengujian 01

| nomor | huruf | kode |
| --- | --- | --- |
| 1 | satu | @ |
| 2 | dua | \# |



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

---

Test SVG Generated chart

<figure class="embed-plot" data-spec-b64="eyJ4bWluIjotNSwieG1heCI6NSwieW1pbiI6LTUsInltYXgiOjUsInBvaW50cyI6W3sieCI6MCwieSI6MCwibGFiZWwiOiJPIn0seyJ4IjoyLCJ5Ijo0LCJsYWJlbCI6IkEifSx7IngiOi0zLCJ5Ijo0LCJsYWJlbCI6IkIifSx7IngiOjEsInkiOjMsImxhYmVsIjoiIn1dLCJsaW5lcyI6W3sieDEiOi00LCJ5MSI6LTIsIngyIjo0LCJ5MiI6Nn0seyJ4MSI6MCwieTEiOjEsIngyIjo0LCJ5MiI6MX1dLCJjdXJ2ZXMiOltdfQ=="><svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" role="img" class="plot-svg"><line x1="74" y1="40" x2="74" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="142" y1="40" x2="142" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="210" y1="40" x2="210" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="278" y1="40" x2="278" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="346" y1="40" x2="346" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="346" x2="380" y2="346" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="278" x2="380" y2="278" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="210" x2="380" y2="210" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="142.00000000000003" x2="380" y2="142.00000000000003" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="74" x2="380" y2="74" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="210" x2="380" y2="210" stroke="currentColor" stroke-width="1.5"/><line x1="210" y1="40" x2="210" y2="380" stroke="currentColor" stroke-width="1.5"/><text x="74" y="224" text-anchor="middle" font-size="10" fill="currentColor">-4</text><text x="142" y="224" text-anchor="middle" font-size="10" fill="currentColor">-2</text><text x="210" y="224" text-anchor="middle" font-size="10" fill="currentColor">0</text><text x="278" y="224" text-anchor="middle" font-size="10" fill="currentColor">2</text><text x="346" y="224" text-anchor="middle" font-size="10" fill="currentColor">4</text><text x="204" y="349" text-anchor="end" font-size="10" fill="currentColor">-4</text><text x="204" y="281" text-anchor="end" font-size="10" fill="currentColor">-2</text><text x="204" y="213" text-anchor="end" font-size="10" fill="currentColor">0</text><text x="204" y="145.00000000000003" text-anchor="end" font-size="10" fill="currentColor">2</text><text x="204" y="77" text-anchor="end" font-size="10" fill="currentColor">4</text><line x1="74" y1="278" x2="346" y2="5.999999999999943" stroke="currentColor" stroke-width="1.5"/><line x1="210" y1="176" x2="346" y2="176" stroke="currentColor" stroke-width="1.5"/><circle cx="210" cy="210" r="4" fill="#f97316"/><text x="216" y="204" font-size="11" fill="currentColor">O</text><circle cx="278" cy="74" r="4" fill="#f97316"/><text x="284" y="68" font-size="11" fill="currentColor">A</text><circle cx="108" cy="74" r="4" fill="#f97316"/><text x="114" y="68" font-size="11" fill="currentColor">B</text><circle cx="244" cy="108" r="4" fill="#f97316"/></svg></figure>





<figure class="embed-chart embed-bar" data-spec-b64="eyJkYXRhIjoiTWF0ZW1hdGlrYSwgODJcbkZpc2lrYSwgNzRcbkJpb2xvZ2ksIDkxXG5CYWhhc2EgSW5nZ3JpcywgNjgifQ=="><svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" role="img" class="chart-svg"><line x1="36" y1="200" x2="408" y2="200" stroke="currentColor" stroke-opacity="0.12"/><text x="30" y="203" text-anchor="end" font-size="10" fill="currentColor">0</text><line x1="36" y1="159.56043956043956" x2="408" y2="159.56043956043956" stroke="currentColor" stroke-opacity="0.12"/><text x="30" y="162.56043956043956" text-anchor="end" font-size="10" fill="currentColor">20</text><line x1="36" y1="119.12087912087912" x2="408" y2="119.12087912087912" stroke="currentColor" stroke-opacity="0.12"/><text x="30" y="122.12087912087912" text-anchor="end" font-size="10" fill="currentColor">40</text><line x1="36" y1="78.68131868131869" x2="408" y2="78.68131868131869" stroke="currentColor" stroke-opacity="0.12"/><text x="30" y="81.68131868131869" text-anchor="end" font-size="10" fill="currentColor">60</text><line x1="36" y1="38.24175824175825" x2="408" y2="38.24175824175825" stroke="currentColor" stroke-opacity="0.12"/><text x="30" y="41.24175824175825" text-anchor="end" font-size="10" fill="currentColor">80</text><rect x="58.5" y="34.19780219780219" width="48" height="165.8021978021978" fill="#f97316"/><text x="82.5" y="30.19780219780219" text-anchor="middle" font-size="10" fill="currentColor">82</text><text x="82.5" y="214" text-anchor="middle" font-size="10" fill="currentColor">Matematika</text><rect x="151.5" y="50.373626373626365" width="48" height="149.62637362637363" fill="#f97316"/><text x="175.5" y="46.373626373626365" text-anchor="middle" font-size="10" fill="currentColor">74</text><text x="175.5" y="214" text-anchor="middle" font-size="10" fill="currentColor">Fisika</text><rect x="244.5" y="16" width="48" height="184" fill="#f97316"/><text x="268.5" y="12" text-anchor="middle" font-size="10" fill="currentColor">91</text><text x="268.5" y="214" text-anchor="middle" font-size="10" fill="currentColor">Biologi</text><rect x="337.5" y="62.50549450549451" width="48" height="137.4945054945055" fill="#f97316"/><text x="361.5" y="58.50549450549451" text-anchor="middle" font-size="10" fill="currentColor">68</text><text x="361.5" y="214" text-anchor="middle" font-size="10" fill="currentColor">Bahasa Inggris</text><line x1="36" y1="200" x2="408" y2="200" stroke="currentColor" stroke-width="1.5"/></svg></figure>





<figure class="embed-chart embed-donut" data-spec-b64="eyJkYXRhIjoiVmlkZW8sIDQ1XG5BcnRpa2VsLCAzMFxuTGF0aWhhbiwgMjUifQ=="><svg viewBox="0 0 420 220" xmlns="http://www.w3.org/2000/svg" role="img" class="chart-svg"><circle cx="110" cy="110" r="80" fill="none" stroke="#f97316" stroke-width="36" stroke-dasharray="226.1946710584651 276.46015351590177" stroke-dashoffset="0" transform="rotate(-90 110 110)"/><circle cx="110" cy="110" r="80" fill="none" stroke="#0ea5e9" stroke-width="36" stroke-dasharray="150.79644737231007 351.85837720205683" stroke-dashoffset="-226.1946710584651" transform="rotate(-90 110 110)"/><circle cx="110" cy="110" r="80" fill="none" stroke="#22c55e" stroke-width="36" stroke-dasharray="125.66370614359172 376.99111843077515" stroke-dashoffset="-376.99111843077515" transform="rotate(-90 110 110)"/><text x="110" y="110" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="currentColor">100</text><rect x="240" y="14" width="12" height="12" fill="#f97316"/><text x="260" y="24" font-size="12" fill="currentColor">Video (45.0%)</text><rect x="240" y="34" width="12" height="12" fill="#0ea5e9"/><text x="260" y="44" font-size="12" fill="currentColor">Artikel (30.0%)</text><rect x="240" y="54" width="12" height="12" fill="#22c55e"/><text x="260" y="64" font-size="12" fill="currentColor">Latihan (25.0%)</text></svg></figure>





<figure class="embed-chart embed-heatmap" data-spec-b64="eyJ2YWx1ZXMiOiIgIDMsIDUsIDhcbiAgMSwgOSwgNFxuICA3LCAyLCA2IiwieGxhYmVscyI6IlN1bmRheVxuTW9uZGF5XG5UdWVzZGF5IiwieWxhYmVscyI6Ik1vcm5pbmdcbk5vb25cbk5pZ2h0In0="><svg viewBox="0 0 420 120" xmlns="http://www.w3.org/2000/svg" role="img" class="chart-svg"><text x="128" y="20" text-anchor="middle" font-size="10" fill="currentColor">Sunday</text><text x="240" y="20" text-anchor="middle" font-size="10" fill="currentColor">Monday</text><text x="352" y="20" text-anchor="middle" font-size="10" fill="currentColor">Tuesday</text><text x="66" y="46" text-anchor="end" font-size="10" fill="currentColor">Morning</text><rect x="73" y="29" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.33"/><text x="128" y="46" text-anchor="middle" font-size="10" fill="currentColor">3</text><rect x="185" y="29" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.55"/><text x="240" y="46" text-anchor="middle" font-size="10" fill="currentColor">5</text><rect x="297" y="29" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.89"/><text x="352" y="46" text-anchor="middle" font-size="10" fill="currentColor">8</text><text x="66" y="74" text-anchor="end" font-size="10" fill="currentColor">Noon</text><rect x="73" y="57" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.10"/><text x="128" y="74" text-anchor="middle" font-size="10" fill="currentColor">1</text><rect x="185" y="57" width="110" height="26" rx="3" fill="#f97316" fill-opacity="1.00"/><text x="240" y="74" text-anchor="middle" font-size="10" fill="currentColor">9</text><rect x="297" y="57" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.44"/><text x="352" y="74" text-anchor="middle" font-size="10" fill="currentColor">4</text><text x="66" y="102" text-anchor="end" font-size="10" fill="currentColor">Night</text><rect x="73" y="85" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.78"/><text x="128" y="102" text-anchor="middle" font-size="10" fill="currentColor">7</text><rect x="185" y="85" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.21"/><text x="240" y="102" text-anchor="middle" font-size="10" fill="currentColor">2</text><rect x="297" y="85" width="110" height="26" rx="3" fill="#f97316" fill-opacity="0.66"/><text x="352" y="102" text-anchor="middle" font-size="10" fill="currentColor">6</text></svg></figure>





<figure class="embed-chart embed-line" data-spec-b64="eyJkYXRhIjoiaGFyaSwgMFxuU2VuaW4sIDEyXG5TZWxhc2EsIDE4XG5SYWJ1LCAxMFxuS2FtaXMsIDIyXG5KdW1hdCwgMTUifQ=="><svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" role="img" class="chart-svg"><line x1="40" y1="200" x2="404" y2="200" stroke="currentColor" stroke-opacity="0.12"/><text x="34" y="203" text-anchor="end" font-size="10" fill="currentColor">0</text><line x1="40" y1="158.1818181818182" x2="404" y2="158.1818181818182" stroke="currentColor" stroke-opacity="0.12"/><text x="34" y="161.1818181818182" text-anchor="end" font-size="10" fill="currentColor">5</text><line x1="40" y1="116.36363636363636" x2="404" y2="116.36363636363636" stroke="currentColor" stroke-opacity="0.12"/><text x="34" y="119.36363636363636" text-anchor="end" font-size="10" fill="currentColor">10</text><line x1="40" y1="74.54545454545456" x2="404" y2="74.54545454545456" stroke="currentColor" stroke-opacity="0.12"/><text x="34" y="77.54545454545456" text-anchor="end" font-size="10" fill="currentColor">15</text><line x1="40" y1="32.72727272727272" x2="404" y2="32.72727272727272" stroke="currentColor" stroke-opacity="0.12"/><text x="34" y="35.72727272727272" text-anchor="end" font-size="10" fill="currentColor">20</text><polyline points="40,200 112.8,99.63636363636364 185.6,49.45454545454544 258.4,116.36363636363636 331.2,16 404,74.54545454545456" fill="none" stroke="#f97316" stroke-width="2" stroke-linejoin="round"/><circle cx="40" cy="200" r="4" fill="#f97316"/><text x="40" y="192" text-anchor="middle" font-size="10" fill="currentColor">0</text><text x="40" y="214" text-anchor="middle" font-size="10" fill="currentColor">hari</text><circle cx="112.8" cy="99.63636363636364" r="4" fill="#f97316"/><text x="112.8" y="91.63636363636364" text-anchor="middle" font-size="10" fill="currentColor">12</text><text x="112.8" y="214" text-anchor="middle" font-size="10" fill="currentColor">Senin</text><circle cx="185.6" cy="49.45454545454544" r="4" fill="#f97316"/><text x="185.6" y="41.45454545454544" text-anchor="middle" font-size="10" fill="currentColor">18</text><text x="185.6" y="214" text-anchor="middle" font-size="10" fill="currentColor">Selasa</text><circle cx="258.4" cy="116.36363636363636" r="4" fill="#f97316"/><text x="258.4" y="108.36363636363636" text-anchor="middle" font-size="10" fill="currentColor">10</text><text x="258.4" y="214" text-anchor="middle" font-size="10" fill="currentColor">Rabu</text><circle cx="331.2" cy="16" r="4" fill="#f97316"/><text x="331.2" y="8" text-anchor="middle" font-size="10" fill="currentColor">22</text><text x="331.2" y="214" text-anchor="middle" font-size="10" fill="currentColor">Kamis</text><circle cx="404" cy="74.54545454545456" r="4" fill="#f97316"/><text x="404" y="66.54545454545456" text-anchor="middle" font-size="10" fill="currentColor">15</text><text x="404" y="214" text-anchor="middle" font-size="10" fill="currentColor">Jumat</text><line x1="40" y1="200" x2="404" y2="200" stroke="currentColor" stroke-width="1.5"/></svg></figure>





<figure class="embed-plot" data-spec-b64="eyJ4bWluIjotNSwieG1heCI6NSwieW1pbiI6LTUsInltYXgiOjUsInBvaW50cyI6W3sieCI6LTUsInkiOjIsImxhYmVsIjoiIn0seyJ4Ijo1LCJ5IjotMiwibGFiZWwiOiIifV0sImxpbmVzIjpbeyJ4MSI6LTQsInkxIjotMiwieDIiOjQsInkyIjo0fV0sImN1cnZlcyI6WyIyKnNpbih4KSwgLTUsIDUiXX0="><svg viewBox="0 0 420 420" xmlns="http://www.w3.org/2000/svg" role="img" class="plot-svg"><line x1="74" y1="40" x2="74" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="142" y1="40" x2="142" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="210" y1="40" x2="210" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="278" y1="40" x2="278" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="346" y1="40" x2="346" y2="380" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="346" x2="380" y2="346" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="278" x2="380" y2="278" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="210" x2="380" y2="210" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="142.00000000000003" x2="380" y2="142.00000000000003" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="74" x2="380" y2="74" stroke="currentColor" stroke-opacity="0.12"/><line x1="40" y1="210" x2="380" y2="210" stroke="currentColor" stroke-width="1.5"/><line x1="210" y1="40" x2="210" y2="380" stroke="currentColor" stroke-width="1.5"/><text x="74" y="224" text-anchor="middle" font-size="10" fill="currentColor">-4</text><text x="142" y="224" text-anchor="middle" font-size="10" fill="currentColor">-2</text><text x="210" y="224" text-anchor="middle" font-size="10" fill="currentColor">0</text><text x="278" y="224" text-anchor="middle" font-size="10" fill="currentColor">2</text><text x="346" y="224" text-anchor="middle" font-size="10" fill="currentColor">4</text><text x="204" y="349" text-anchor="end" font-size="10" fill="currentColor">-4</text><text x="204" y="281" text-anchor="end" font-size="10" fill="currentColor">-2</text><text x="204" y="213" text-anchor="end" font-size="10" fill="currentColor">0</text><text x="204" y="145.00000000000003" text-anchor="end" font-size="10" fill="currentColor">2</text><text x="204" y="77" text-anchor="end" font-size="10" fill="currentColor">4</text><line x1="74" y1="278" x2="346" y2="74" stroke="currentColor" stroke-width="1.5"/><polyline points="40,144.79314932290657 42.83333333333332,143.41387174522012 45.66666666666668,142.4967303031896 48.5,142.0480903496743 51.33333333333332,142.07106563734087 54.16666666666668,142.5654967078917 57,143.5279519987734 59.83333333333333,144.9517516596849 62.66666666666667,146.8270139135882 65.5,149.14072364045634 68.33333333333331,151.8768227077589 71.16666666666669,155.01632142075204 74,158.5374303190609 76.83333333333333,162.4157114048301 79.66666666666669,166.6242477528541 82.5,171.13383032552065 85.33333333333331,175.91316069599253 88.16666666666667,180.9290682726418 91,186.14674051710583 93.83333333333331,191.52996455815497 96.66666666666667,197.04137852446704 99.5,202.64273085195265 102.33333333333331,208.29514576592848 105.16666666666669,213.95939309557772 108,219.59616054807097 110.83333333333334,225.16632655264928 113.66666666666666,230.63123178101424 116.5,235.95294745955854 119.33333333333333,241.0945386112352 122.16666666666666,246.0203204000545 125,250.69610579906904 127.83333333333334,255.08944286292487 130.66666666666669,259.16983995820607 133.5,262.9089773883786 136.33333333333331,266.28090394456535 139.16666666666666,269.262217018006 142,271.83222502414634 144.83333333333334,273.97309101106106 147.66666666666666,275.66995645551 150.5,276.91104438742775 153.33333333333334,277.68774112712003 156.16666666666669,277.9946560678755 159,277.8296590890757 161.83333333333331,277.19389534014107 164.66666666666666,276.0917772927053 167.5,274.5309541161798 170.33333333333334,272.52225858925533 173.16666666666666,270.07963191579586 176,267.220026966937 178.83333333333334,263.9632906209281 181.66666666666669,260.3320260173305 184.5,256.35143568158674 187.33333333333331,252.04914660874215 190.16666666666669,247.45501852031393 193,242.6009366250858 195.83333333333331,237.52059032215652 198.66666666666666,232.24923938213834 201.5,226.82346922930753 204.33333333333331,221.28093702315226 207.16666666666669,215.6601103016211 210,210 212.83333333333331,204.33988969837893 215.66666666666669,198.71906297684774 218.5,193.17653077069244 221.33333333333334,187.75076061786166 224.16666666666669,182.4794096778435 227.00000000000003,177.3990633749142 229.83333333333334,172.54498147968607 232.66666666666666,167.95085339125788 235.49999999999997,163.64856431841326 238.33333333333331,159.6679739826695 241.16666666666666,156.03670937907194 244,152.77997303306304 246.83333333333331,149.92036808420417 249.66666666666669,147.47774141074464 252.5,145.46904588382014 255.33333333333331,143.90822270729475 258.1666666666667,142.80610465985893 261,142.1703409109243 263.83333333333337,142.00534393212448 266.6666666666667,142.31225887288 269.5,143.08895561257228 272.33333333333337,144.33004354449 275.16666666666663,146.0269089889389 278,148.16777497585363 280.8333333333333,150.73778298199392 283.66666666666663,153.7190960554347 286.5,157.09102261162136 289.3333333333333,160.83016004179393 292.1666666666667,164.91055713707516 295,169.30389420093096 297.8333333333333,173.97967959994548 300.6666666666667,178.90546138876485 303.5,184.04705254044146 306.3333333333333,189.36876821898576 309.1666666666667,194.83367344735078 312,200.40383945192903 314.8333333333333,206.0406069044223 317.6666666666667,211.70485423407146 320.5,217.35726914804735 323.33333333333337,222.95862147553305 326.16666666666663,228.47003544184494 329,233.85325948289417 331.83333333333337,239.07093172735824 334.66666666666663,244.0868393040074 337.5,248.86616967447935 340.33333333333337,253.37575224714595 343.16666666666663,257.5842885951699 346,261.4625696809391 348.83333333333337,264.983678579248 351.66666666666663,268.12317729224105 354.5,270.8592763595437 357.3333333333333,273.1729860864118 360.1666666666667,275.04824834031507 363,276.4720480012266 365.83333333333337,277.4345032921083 368.66666666666663,277.9289343626591 371.5,277.9519096503257 374.33333333333337,277.5032696968104 377.16666666666663,276.5861282547799 380,275.2068506770934" fill="none" stroke="#0ea5e9" stroke-width="2" stroke-linejoin="round"/><circle cx="40" cy="142.00000000000003" r="4" fill="#f97316"/><circle cx="380" cy="278" r="4" fill="#f97316"/></svg></figure>
