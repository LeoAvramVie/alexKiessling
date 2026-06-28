import { createReadStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.SANITY_WRITE_TOKEN;
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'vlyuixi5';
const dataset = 'production';

if (!token) {
  console.error('❌ SANITY_WRITE_TOKEN not found in env!');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion: '2023-05-03'
});

const baseDir = '/Users/leoavram/Code/alexKiessling';
const imagesDir = join(baseDir, 'assets', 'images');

// Upload image helper
async function uploadImage(localPath) {
  if (!localPath || !existsSync(localPath)) {
    console.warn(`⚠️ Local path not found: ${localPath}`);
    return null;
  }
  try {
    const fileStream = createReadStream(localPath);
    const asset = await client.assets.upload('image', fileStream, {
      filename: localPath.split('/').pop()
    });
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (err) {
    console.error(`❌ Error uploading image ${localPath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('🚀 Starting Statements and Complete Vita Migration...');

  // 1. IMPORT STATEMENTS WITH UPDATED TITLES & IMAGES
  console.log('Importing statements...');
  const statementsFile = '/Users/leoavram/.gemini/antigravity-ide/brain/a16e1ea1-3e9d-47e7-9c2e-c488c65b3291/scratch/all_statements.json';
  const statementsData = JSON.parse(readFileSync(statementsFile, 'utf-8'));

  // Updated titles mapping
  const titleMapping = {
    "Statement 1": {
      de: "Der Traum des Individuums",
      en: "The Individual’s Dream",
      image: "come_to_me_180cm_x_180cm_acryliconcanvas_2024cm-scaled.jpeg"
    },
    "Statement 2": {
      de: "Vielschichtigkeit menschlicher Daseinsebenen",
      en: "Complexity of Human Existence",
      image: "02_HEAD_20191120Mono_c100x100cm20070028.01.jpg"
    },
    "Zeit komprimiert im Medium der Malerei": {
      de: "Zeit komprimiert im Medium der Malerei",
      en: "Time compressed in the medium of painting",
      image: "05_SHIFTs28_Neon_Acryliconcanvas_190x250cm_2019-scaled.jpg"
    },
    "Fragmented Identity": {
      de: "Fragmentierte Identität",
      en: "Fragmented Identity",
      image: "05_SHIFTShift_Sarah_Acrylic_on_canvas_170x140cm_2014-scaled.jpg"
    },
    "Zoon Politicon": {
      de: "Zoon Politicon",
      en: "Zoon Politicon",
      image: "04_REALzoon_politicon_Acryliconcanvas_200x200cm_2016-scaled.jpg"
    },
    "Volatile Portraits": {
      de: "Volatile Portraits",
      en: "Volatile Portraits",
      image: "05_SHIFTShift_Martina_Acrylic_on_canvas_170x140cm_2014-scaled.jpg"
    },
    "Long Distance Art": {
      de: "Long Distance Art",
      en: "Long Distance Art",
      image: "08_LDA-Artwork-1-768x299.jpg"
    }
  };

  for (let i = 0; i < statementsData.length; i++) {
    const s = statementsData[i];
    const map = titleMapping[s.title] || { de: s.title, en: s.title, image: "" };
    
    let imgRef = null;
    if (map.image) {
      const imgPath = join(imagesDir, map.image);
      imgRef = await uploadImage(imgPath);
    }

    const docId = `statement-${i}`;
    const doc = {
      _id: docId,
      _type: 'statement',
      title: map.de, // Use the refined German title
      author: s.author,
      textDe: s.textDe,
      textEn: s.textEn,
      order: i
    };
    if (imgRef) {
      doc.image = imgRef;
    }
    await client.createOrReplace(doc);
    console.log(`✅ Statement updated: ${doc.title}`);
  }

  // 2. IMPORT COMPLETE VITA
  console.log('Importing complete Vita data...');
  const vitaFile = '/Users/leoavram/.gemini/antigravity-ide/brain/a16e1ea1-3e9d-47e7-9c2e-c488c65b3291/scratch/complete_vita.json';
  const { highlights, detailed_events } = JSON.parse(readFileSync(vitaFile, 'utf-8'));

  // A. Highlights
  console.log('Uploading Vita Highlights...');
  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    
    let imgRef = null;
    if (h.imageName) {
      const imgPath = join(imagesDir, h.imageName);
      imgRef = await uploadImage(imgPath);
    }

    const docId = `vitaHighlight-${i}`;
    const doc = {
      _id: docId,
      _type: 'vitaHighlight',
      year: h.year,
      title: h.title,
      descriptionDe: h.description,
      descriptionEn: h.description, // Fallback
      order: i
    };
    if (imgRef) {
      doc.image = imgRef;
    }
    await client.createOrReplace(doc);
    console.log(`✅ Vita Highlight uploaded: ${h.year} - ${h.title}`);
  }

  // B. Detailed Entries
  console.log('Uploading Vita Detailed Entries...');
  for (let i = 0; i < detailed_events.length; i++) {
    const e = detailed_events[i];
    const docId = `vitaEntry-${e.year}`;
    
    const doc = {
      _id: docId,
      _type: 'vitaEntry',
      year: e.year,
      eventsDe: e.events,
      eventsEn: e.events, // Fallback
      order: 2025 - parseInt(e.year)
    };
    await client.createOrReplace(doc);
    console.log(`✅ Vita Entry uploaded for year: ${e.year} (${e.events.length} events)`);
  }

  console.log('🎉 Statements and Vita Migration Completed!');
}

run().catch(console.error);
