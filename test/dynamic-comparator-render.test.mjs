import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../dist/fr/comparatifs/index.html',import.meta.url),'utf8');
const fixed=await readFile(new URL('../dist/fr/comparatifs/jibble-vs-clockify/index.html',import.meta.url),'utf8');
const catalog=await readFile(new URL('../dist/fr/tests/index.html',import.meta.url),'utf8');
for(const [name,needle] of Object.entries({hub:'data-dynamic-comparator',selectors:'data-comparator-select',insufficient:'Pourquoi certaines lignes sont absentes',canonical:'<link rel="canonical" href="https://datagraphe.com/fr/comparatifs/"',catalog:'data-compare-toggle'}))test(name,()=>assert.ok((name==='catalog'?catalog:html).includes(needle)));
test('fixed editorial comparison remains independent',()=>{assert.ok(fixed.includes('Jibble vs Clockify'));assert.ok(!fixed.includes('data-dynamic-comparator'))});
test('no private data marker is rendered',()=>{for(const needle of ['r2_key','/Users/','clerk_user_id','sk_test_'])assert.ok(!html.includes(needle))});
