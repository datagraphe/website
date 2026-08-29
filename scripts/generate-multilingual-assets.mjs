import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const locales = ['fr','en','de','it','es'];
const origin = 'https://datagraphe.com';

async function walk(dir) {
  const entries = await readdir(dir,{withFileTypes:true});
  const files = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(dir,entry.name)) : join(dir,entry.name)));
  return files.flat();
}

const htmlFiles = (await walk(dist)).filter(file => file.endsWith('.html'));
const escapeXml = value => value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');

for (const locale of locales) {
  const urls = [];
  for (const file of htmlFiles.filter(file => relative(dist,file).split(sep)[0]===locale)) {
    const html = await readFile(file,'utf8');
    if (/name="robots" content="noindex/i.test(html)) continue;
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/i)?.[1];
    if (canonical) urls.push(canonical);
  }
  urls.sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url=>`  <url><loc>${escapeXml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
  await writeFile(join(dist,`sitemap-${locale}.xml`),xml);
}

const index = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locales.map(locale=>`  <sitemap><loc>${origin}/sitemap-${locale}.xml</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;
await writeFile(join(dist,'sitemap-index.xml'),index);
