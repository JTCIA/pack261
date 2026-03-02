import { defineCollection, z } from 'astro:content';

const announcements = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    category: z.enum(['event', 'news', 'fundraiser', 'achievement', 'reminder']),
    pinned: z.boolean().default(false),
    summary: z.string(),
    author: z.string().default('Pack 261 Leadership'),
  }),
});

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    section: z.string(),
    order: z.number().default(99),
    lastUpdated: z.coerce.date().optional(),
  }),
});

export const collections = { announcements, docs };
