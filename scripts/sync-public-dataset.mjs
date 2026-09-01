#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const site=path.resolve('.');
const source=path.resolve(site,'../datagraphe-architecture-a2/generated/public-data');
const target=path.join(site,'src/generated/public-data');
const preprod=path.resolve(site,'../datagraphe-architecture-a3/preproduction');
const entries=['software/jibble.json','software/clockify.json','software/toggl-track.json','comparisons/jibble-vs-clockify.json'];
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>k!=='generated_at').map(k=>[k,stable(value[k])])):value;
const sha=value=>crypto.createHash('sha256').update(typeof value==='string'?value:JSON.stringify(stable(value))).digest('hex');
const datasets={};
for(const rel of entries){const input=path.join(source,rel);if(!fs.existsSync(input))throw new Error(`Missing A2.1 dataset: ${rel}`);const data=JSON.parse(fs.readFileSync(input,'utf8'));if(data.public_schema_version!=='1.1')throw new Error(`${rel}: PUBLIC_DATA_SCHEMA 1.1 required`);const output=path.join(target,rel);fs.mkdirSync(path.dirname(output),{recursive:true});fs.copyFileSync(input,output);datasets[rel]={public_data_hash:data.public_data_hash,snapshot_ids:data.comparison_id?[data.software_a.snapshot_id,data.software_b.snapshot_id]:[data.snapshot_selection.snapshot_id],last_verified_at:data.last_verified_at,bytes:fs.statSync(input).size};}
const manifest={manifest_version:'1.0',public_data_schema:'1.1',target_data_source:'public-dataset',datasets};manifest.manifest_hash=sha(manifest);
fs.mkdirSync(preprod,{recursive:true});fs.writeFileSync(path.join(preprod,'PUBLIC_BUILD_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');fs.writeFileSync(path.join(target,'PUBLIC_BUILD_MANIFEST.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
