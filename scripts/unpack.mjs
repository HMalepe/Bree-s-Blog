#!/usr/bin/env node
// Rebuilds the site from bree-site.json.
//   node scripts/unpack.mjs bree-site.json ./out
// Writes every file, then downloads the pinned GSAP / ScrollTrigger / Lenis
// builds into js/vendor/ (needs network; Node 18+ for fetch).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [src = 'bree-site.json', out = 'bree-site'] = process.argv.slice(2);
const bundle = JSON.parse(readFileSync(src, 'utf8'));

const put = (p, data) => { mkdirSync(dirname(join(out, p)), { recursive: true }); writeFileSync(join(out, p), data); };

for (const [p, content] of Object.entries(bundle.files)) put(p, content);
mkdirSync(join(out, 'assets'), { recursive: true });
console.log(`wrote ${Object.keys(bundle.files).length} files to ${out}/`);

for (const [p, url] of Object.entries(bundle.vendor)) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(res.status);
    put(p, await res.text());
    console.log(`fetched ${p}`);
  } catch (e) {
    console.warn(`could not fetch ${url} (${e.message}); download it manually to ${p}`);
  }
}
