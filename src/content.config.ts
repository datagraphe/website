import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const software = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/software' }),
});

export const collections = { software };
