import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { buildComparisonSelection, featureFamily, validateComparisonSlugs } from '../src/lib/comparison-selection.mjs';

const contract = JSON.parse(await readFile(new URL('../src/generated/public-data/comparability/dynamic-comparator.json', import.meta.url)));

test('accepts two and three published software from the same category', () => {
  assert.equal(validateComparisonSlugs('jibble,clockify',contract).valid,true);
  assert.equal(validateComparisonSlugs('jibble,clockify,toggl-track',contract).valid,true);
});
test('rejects duplicate, unknown and more than three software', () => {
  assert.deepEqual(validateComparisonSlugs('jibble,jibble',contract).errors,['DUPLICATE']);
  assert.deepEqual(validateComparisonSlugs('jibble,unknown',contract).errors,['UNKNOWN_SOFTWARE']);
  assert.ok(validateComparisonSlugs('jibble,clockify,toggl-track,fourth',contract).errors.includes('MAX_THREE'));
});
test('rejects unpublished and cross-category software', () => {
  const synthetic=structuredClone(contract);synthetic.software.push({slug:'draft',published:false,category:'time-tracking-attendance'},{slug:'crm',published:true,category:'crm'});
  assert.ok(validateComparisonSlugs('jibble,draft',synthetic).errors.includes('UNPUBLISHED_SOFTWARE'));
  assert.ok(validateComparisonSlugs('jibble,crm',synthetic).errors.includes('DIFFERENT_CATEGORY'));
});
test('one software remains a valid preselection but does not activate results', () => {
  const state=buildComparisonSelection('jibble',contract);assert.equal(state.valid,true);assert.equal(state.active,false);
});
test('Jibble and Clockify reuse all 18 certified editorial dimensions', () => {
  const state=buildComparisonSelection('jibble,clockify',contract);assert.equal(state.active,true);assert.equal(state.dimensions.length,18);assert.equal(state.editorialPath,'/fr/comparatifs/jibble-vs-clockify/');
});
test('uncertified Toggl pairs render insufficient data without conclusions', () => {
  for(const selection of ['jibble,toggl-track','clockify,toggl-track']){const state=buildComparisonSelection(selection,contract);assert.equal(state.dimensions.length,0);assert.equal(state.insufficient.length,1)}
});
test('three-way comparison is the intersection of every pair', () => {
  const state=buildComparisonSelection('jibble,clockify,toggl-track',contract);assert.equal(state.dimensions.length,0);assert.equal(state.insufficient.length,2);
});
test('canonical groups map to public filter families', () => {
  assert.equal(featureFamily('time_entry.manual'),'time');assert.equal(featureFamily('team.group_create'),'team');assert.equal(featureFamily('project.create'),'projects');assert.equal(featureFamily('report.summary'),'reports');assert.equal(featureFamily('export.csv'),'exports');assert.equal(featureFamily('schedule.shift'),'planning');assert.equal(featureFamily('unknown.feature'),'others');
});
