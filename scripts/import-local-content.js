import { createReadStream, existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve, basename } from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

const token = process.env.SANITY_WRITE_TOKEN;
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'oboaxji6';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

if (!token) {
  console.error('❌ SANITY_WRITE_TOKEN is missing in .env! Cannot import assets.');
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-06-18',
  token,
  useCdn: false
});

// Helper to clean and make deterministic IDs
function makeId(prefix, text, suffix = '') {
  const clean = text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Normalize special chars
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, ''); // Trim - from end
  return `${prefix}-${clean}${suffix ? '-' + suffix : ''}`.substring(0, 64);
}

// Helper to resolve local image file paths
const baseDir = '/Users/leoavram/Code/alexKiessling';
const imagesDir = join(baseDir, 'assets', 'images');

function resolveLocalImagePath(imageUrl) {
  if (!imageUrl) return null;
  const fileName = imageUrl.split('/').pop().split('?')[0];
  if (!fileName) return null;
  const fullPath = join(imagesDir, fileName);
  if (existsSync(fullPath) && statSync(fullPath).isFile()) {
    return fullPath;
  }
  return null;
}

// Upload image helper
async function uploadImage(localPath) {
  if (!localPath || !existsSync(localPath)) return null;
  console.log(`📤 Uploading image: ${basename(localPath)}...`);
  try {
    const fileStream = createReadStream(localPath);
    const asset = await client.assets.upload('image', fileStream, {
      filename: basename(localPath)
    });
    console.log(`✅ Uploaded. Asset ID: ${asset._id}`);
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      }
    };
  } catch (error) {
    console.error(`❌ Failed to upload image ${localPath}:`, error.message);
    return null;
  }
}

async function importContent() {
  console.log('🚀 Starting content migration to Sanity...');

  // 1. IMPORT TEXT DATA (Statement, Vita, GT)
  console.log('Reading extracted_texts.json...');
  const textDataPath = '/Users/leoavram/.gemini/antigravity-ide/brain/a16e1ea1-3e9d-47e7-9c2e-c488c65b3291/scratch/extracted_texts.json';
  if (!existsSync(textDataPath)) {
    console.error('❌ extracted_texts.json not found! Please run the text extractor first.');
    process.exit(1);
  }
  
  const textData = JSON.parse(
      await import('fs').then(fs => fs.readFileSync(textDataPath, 'utf-8'))
  );

  // 2. CREATE HOMEPAGE SINGLETON
  console.log('Creating Homepage singleton...');
  const homepageDoc = {
    _id: 'homepage',
    _type: 'homepage',
    titleDe: 'Alex Kiessling',
    titleEn: 'Alex Kiessling',
    subtitleDe: 'Painting | Graphic | Sculpture | Video',
    subtitleEn: 'Painting | Graphic | Sculpture | Video',
    videoPath: '/assets/videos/NEON-Alex-Kiessling.webm',
    statementDe: textData.statement.de,
    statementEn: textData.statement.en
  };
  await client.createOrReplace(homepageDoc);
  console.log('✅ Homepage singleton imported.');

  // 3. CREATE FOOTER & GLOBAL INFO SINGLETON
  console.log('Creating Footer singleton...');
  const footerDoc = {
    _id: 'footer',
    _type: 'footer',
    email: 'info@alexkiessling.com',
    instagramUrl: 'https://www.instagram.com/alexkiessling/',
    facebookUrl: 'https://de-de.facebook.com/pages/category/Artist/ALEX-KIESSLING-236103737238/',
    youtubeChannelUrl: 'https://www.youtube.com/user/alexkieszling',
    raribleUrl: 'https://rarible.com/alexkiessling',
    gtCooperationTextDe: textData.gt_cooperation.text,
    gtCooperationTextEn: textData.gt_cooperation.text, // English fallback
    gtVerification: textData.gt_cooperation.verification,
    impressumDe: `Offenlegung nach § 25 MedienG / Impressum nach § 5 ECG:

Alexander Kiessling
Bildender Künstler
Wien, Österreich

E-Mail: info@alexkiessling.com
Aufsichtsbehörde: Magistrat der Stadt Wien
Gewerbe- und berufsrechtliche Vorschriften: Gewerbeordnung (GewO) – www.ris.bka.gv.at

Urheberrechtshinweis:
Sämtliche auf dieser Website veröffentlichten Bilder, Texte und Videos sind urheberrechtlich geschützt. Jede Vervielfältigung, Verbreitung oder öffentliche Wiedergabe bedarf der ausdrücklichen Zustimmung des Künstlers.`,
    impressumEn: `Disclosure according to § 25 MedienG / Imprint according to § 5 ECG:

Alexander Kiessling
Fine Artist
Vienna, Austria

Email: info@alexkiessling.com
Regulatory authority: Magistrat der Stadt Wien
Professional regulations: Gewerbeordnung (GewO) – www.ris.bka.gv.at

Copyright Notice:
All images, texts, and videos published on this website are protected by copyright. Any reproduction, distribution, or public display requires the express consent of the artist.`,
    privacyDe: `Datenschutzerklärung (DSGVO)

1. Allgemeine Hinweise
Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften (DSGVO) sowie dieser Datenschutzerklärung.

2. Datenerfassung auf unserer Website
Unsere Website wird statisch über World4You gehostet. Es werden keine Tracking-Cookies von Drittanbietern geladen und es findet kein User-Profiling statt.
Google Fonts und alle Mediendateien werden ausschließlich lokal von unserem eigenen Webserver geladen, sodass keine IP-Adressen an externe Server übertragen werden.

3. Server-Logfiles
Der Hoster World4You erhebt automatisch Daten über Zugriffe auf die Seite (z.B. IP-Adresse, Browsertyp, Uhrzeit). Dies ist technisch notwendig, um die Sicherheit und Stabilität der Website zu gewährleisten.

4. Ihre Rechte
Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Wenden Sie sich hierzu an info@alexkiessling.com.`,
    privacyEn: `Privacy Policy (GDPR)

1. General Information
The protection of your personal data is of great importance to us. We treat your personal data confidentially and in accordance with the statutory data protection regulations (GDPR) and this privacy policy.

2. Data Collection on Our Website
Our website is statically hosted via World4You. No third-party tracking cookies are loaded, and no user profiling takes place.
Google Fonts and all media files are loaded locally from our own webserver, meaning no IP addresses are shared with external servers.

3. Server Log Files
The hosting provider World4You automatically collects access logs (e.g. IP address, browser type, timestamp). This is technically required to maintain website stability and security.

4. Your Rights
You have the right to receive information about your stored personal data, its origin, recipients, and purpose of processing free of charge. You also have the right to request correction, blocking, or deletion of this data by contacting info@alexkiessling.com.`
  };
  await client.createOrReplace(footerDoc);
  console.log('✅ Footer singleton imported.');

  // 4. IMPORT VITA MILESTONES
  console.log('Importing Vita milestones...');
  for (const item of textData.vita) {
    const docId = makeId('vita', `${item.year}-${item.title}`);
    const doc = {
      _id: docId,
      _type: 'vita',
      year: item.year,
      title: item.title,
      descriptionDe: item.description,
      descriptionEn: item.description // Fallback to original
    };
    await client.createOrReplace(doc);
    console.log(`✅ Vita item imported: ${item.year} - ${item.title}`);
  }

  // 4b. IMPORT STATEMENTS & ESSAYS
  console.log('Importing Statements and Essays...');
  const allStatementsPath = '/Users/leoavram/.gemini/antigravity-ide/brain/a16e1ea1-3e9d-47e7-9c2e-c488c65b3291/scratch/all_statements.json';
  if (existsSync(allStatementsPath)) {
    const allStatements = JSON.parse(
        readFileSync(allStatementsPath, 'utf-8')
    );
    for (let i = 0; i < allStatements.length; i++) {
      const stmt = allStatements[i];
      const docId = makeId('statement', `${stmt.author}-${i}`);
      const doc = {
        _id: docId,
        _type: 'statement',
        title: stmt.title,
        author: stmt.author,
        textDe: stmt.textDe,
        textEn: stmt.textEn,
        order: i
      };
      await client.createOrReplace(doc);
      console.log(`✅ Statement item [${i+1}/${allStatements.length}] imported: ${stmt.title}`);
    }
  }

  // 5. IMPORT GALLERY ITEMS
  console.log('Reading gallery_items.json...');
  const galleryItemsPath = '/Users/leoavram/.gemini/antigravity-ide/brain/a16e1ea1-3e9d-47e7-9c2e-c488c65b3291/scratch/gallery_items.json';
  if (!existsSync(galleryItemsPath)) {
    console.error('❌ gallery_items.json not found! Cannot import artworks.');
    process.exit(1);
  }
  
  const artworks = JSON.parse(
      await import('fs').then(fs => fs.readFileSync(galleryItemsPath, 'utf-8'))
  );

  console.log(`Starting upload of ${artworks.length} artworks...`);
  
  for (let i = 0; i < artworks.length; i++) {
    const art = artworks[i];
    const localPath = resolveLocalImagePath(art.image_url);
    
    if (!localPath) {
      console.warn(`⚠️ Skipped artwork image (local file missing): ${art.title} (${art.image_url})`);
      continue;
    }
    
    const docId = makeId('artwork', `${art.title || 'untitled'}-${art.year || '2025'}-${i}`);
    
    try {
      // 1. Upload image asset
      const imageAssetRef = await uploadImage(localPath);
      if (!imageAssetRef) {
        console.error(`❌ Failed to upload asset for artwork: ${art.title}`);
        continue;
      }
      
      // Determine technique
      const technique = art.description || 'Acrylic on Canvas';
      
      // Category fallback
      const cat = (art.categories && art.categories.length > 0) ? art.categories[0] : 'Real';

      // 2. Create Artwork document in Sanity
      const artworkDoc = {
        _id: docId,
        _type: 'artwork',
        title: art.title || 'Untitled',
        year: art.year || '2025',
        dimensions: `${art.width || ''}x${art.height || ''}cm`.replace(/^x|x$/g, '') || 'K.A.',
        techniqueDe: technique,
        techniqueEn: technique,
        image: imageAssetRef,
        category: cat,
        status: 'Available'
      };
      
      await client.createOrReplace(artworkDoc);
      console.log(`🎨 Artwork [${i + 1}/${artworks.length}] imported: ${art.title}`);
    } catch (err) {
      console.error(`❌ Error importing artwork ${art.title}:`, err.message);
    }
  }

  // 6. IMPORT VIDEOS (YouTube documentation videos)
  console.log('Importing video documentations...');
  const videos = [
    { title: "Von Blizzards, Gemälden und Los Angeles", url: "https://youtu.be/fBDq08nM6qo" },
    { title: "Long Distance Art - Performance 1", url: "https://youtu.be/oo6GDi0Pzcc" },
    { title: "Long Distance Art - Performance 2", url: "https://youtu.be/spYc6b-YcGk" }
  ];

  for (const v of videos) {
    const docId = makeId('video', v.title);
    const videoDoc = {
      _id: docId,
      _type: 'video',
      title: v.title,
      youtubeUrl: v.url
    };
    await client.createOrReplace(videoDoc);
    console.log(`🎥 Video imported: ${v.title}`);
  }

  console.log('🎉 Migration completely successful!');
}

importContent().catch(err => {
  console.error('❌ Fatal error during migration:', err);
});
