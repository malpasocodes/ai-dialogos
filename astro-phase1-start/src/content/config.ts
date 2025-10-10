import { defineCollection, reference, z } from 'astro:content';

const modules = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    summary: z.string(),
    order: z.number().min(1),
    focusAreas: z.array(z.string()).default([]),
    ctaLabel: z.string().optional(),
    ctaHref: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.startsWith('/') || value.startsWith('http'),
        { message: 'Must be an absolute URL or site-relative path' },
      ),
  }),
});

const lessons = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    module: reference('modules'),
    duration: z.string().optional(),
    learningObjectives: z.array(z.string()).min(1),
    tags: z.array(z.string()).default([]),
    resources: z.array(reference('resources')).default([]),
  }),
});

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    type: z.enum(['worksheet', 'guide', 'toolkit', 'slide-deck', 'case-study', 'podcast']),
    module: reference('modules').optional(),
    href: z.string().url(),
    download: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

const podcast = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    episodeNumber: z.number().min(1),
    published: z.coerce.date(),
    audioUrl: z.string().url(),
    duration: z.string().optional(),
    module: reference('modules').optional(),
    guests: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const events = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string(),
    registrationUrl: z.string().url().optional(),
    module: reference('modules').optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {
  modules,
  lessons,
  resources,
  podcast,
  events,
};
