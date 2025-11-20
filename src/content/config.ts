import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const collections = {
  notes
};
