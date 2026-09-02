import contract from '@/generated/public-data/comparability/dynamic-comparator.json';

if (contract.public_schema_version !== '1.2') throw new Error('Dynamic comparator requires PUBLIC_DATA_SCHEMA 1.2');
if (contract.runtime_d1_dependency !== 'NONE') throw new Error('Runtime D1 dependency is forbidden');
if (contract.selection_rules.min !== 2 || contract.selection_rules.max !== 3) throw new Error('Comparator selection rules mismatch');

export const dynamicComparatorContract = contract;
