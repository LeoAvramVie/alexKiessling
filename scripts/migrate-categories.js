import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'vlyuixi5',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  apiVersion: '2026-06-18',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

const categories = [
  { title: 'Real', slug: 'Real', order: 0 },
  { title: 'shifts1', slug: 'shifts1', order: 1 },
  { title: 'shifts2', slug: 'shifts2', order: 2 },
  { title: 'Headspins', slug: 'Headspins', order: 3 },
  { title: 'Heads', slug: 'Heads', order: 4 },
  { title: 'water', slug: 'water', order: 5 },
  { title: 'print editions', slug: 'print-editions', order: 6 },
  { title: 'Drawings', slug: 'Drawings', order: 7 },
  { title: 'sculptures', slug: 'sculptures', order: 8 },
  { title: 'long Distance Art', slug: 'long-distance-art', order: 9 }
];

async function run() {
  console.log('🚀 Starting Category Migration...');
  for (const cat of categories) {
    const docId = `category-${cat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    console.log(`Creating category: ${cat.title} (${docId})...`);
    await client.createOrReplace({
      _id: docId,
      _type: 'category',
      title: cat.title,
      slug: {
        _type: 'slug',
        current: cat.slug
      },
      order: cat.order
    });
  }
  console.log('🎉 Migration successful!');
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
});
