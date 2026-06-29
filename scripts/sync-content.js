import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'vlyuixi5';
const dataset = process.env.SANITY_STUDIO_DATASET || 'production';

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-06-18',
  useCdn: false
});

// Helper to format block texts / newlines into HTML paragraphs
function formatTextToHtml(text) {
  if (!text) return '';
  return text
      .split(/\n\s*\n/)
      .map(p => {
        const trimmed = p.trim();
        if (!trimmed) return '';
        return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
}

// Helper to compile Sanity CDN image URLs
function getImageUrl(imageObj, maxWidth = 1600) {
  if (!imageObj || !imageObj.asset || !imageObj.asset._ref) return '';
  const ref = imageObj.asset._ref;
  const parts = ref.split('-');
  if (parts.length < 4) return '';
  const id = parts[1];
  const dimensions = parts[2];
  const ext = parts[3];
  
  const [origWidth] = dimensions.split('x').map(Number);
  const targetWidth = Math.min(maxWidth, origWidth || 1600);
  
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${ext}?w=${targetWidth}&auto=format&q=80`;
}

// Helper to parse image dimensions from reference ID (for PageSpeed explicit width/height)
function getImageDimensions(imageObj) {
  if (!imageObj || !imageObj.asset || !imageObj.asset._ref) return { width: 800, height: 600 };
  const ref = imageObj.asset._ref;
  const parts = ref.split('-');
  if (parts.length < 4) return { width: 800, height: 600 };
  const dimensions = parts[2];
  const [width, height] = dimensions.split('x').map(Number);
  return { width: width || 800, height: height || 600 };
}

// Helper to render artwork card (used by both Gallery and Projects to prevent code duplication, and add keyboard focus)
function renderArtworkCard(art, catSlug, isEn, prefix) {
  const imgUrl = getImageUrl(art.image, 800);
  const fullUrl = getImageUrl(art.image, 2000);
  const title = art.title || 'Untitled';
  const year = art.year || '2025';
  const dim = art.dimensions || '';
  const technique = isEn ? (art.techniqueEn || art.techniqueDe) : (art.techniqueDe || art.techniqueEn);
  const inSituUrls = (art.inSituImages || []).map(img => getImageUrl(img, 1600)).join(',');
  const { width, height } = getImageDimensions(art.image);

  return `
  <div class="gallery-item-card reveal-on-scroll" data-category="${catSlug}" data-year="${year}" data-dimensions="${dim}" data-technique="${technique}" data-insitu="${inSituUrls}" data-full="${fullUrl}" role="button" tabindex="0" aria-label="${title} — Detailansicht / Detail view">
    <div class="gallery-image-wrapper">
      <div class="shift-layer shift-red" style="background-image: url('${imgUrl}');"></div>
      <div class="shift-layer shift-green" style="background-image: url('${imgUrl}');"></div>
      <div class="shift-layer shift-blue" style="background-image: url('${imgUrl}');"></div>
      <img class="gallery-image" src="${imgUrl}" alt="${title}" width="${width}" height="${height}" loading="lazy" decoding="async">
      <div class="mobile-lens-indicator"></div>
    </div>
    <div class="gallery-item-label">
      <div class="label-title">${title}</div>
      <div class="label-meta">${year} — ${technique} — ${dim}</div>
    </div>
  </div>`;
}

async function sync() {
  console.log('🔄 Syncing content from Sanity CMS...');
  
  let data = {};
  const cachePath = resolve('src/sanity-cache.json');

  try {
    console.log('📡 Fetching from Sanity API...');
    const result = await client.fetch(`{
      "homepage": *[_type == "homepage" && _id == "homepage"][0]{
        ...,
        "videoFileUrl": videoFile.asset->url
      },
      "footer": *[_type == "footer" && _id == "footer"][0],
      "artworks": *[_type == "artwork"] | order(year desc, _createdAt desc),
      "categories": *[_type == "category"] | order(order asc) {
        _id,
        title,
        "slug": slug.current,
        order,
        "artworks": *[_type == "artwork" && (category == ^._id || category._ref == ^._id || category == ^.slug.current || category == ^.title)] | order(year desc, _createdAt desc) {
          title,
          year,
          dimensions,
          techniqueDe,
          techniqueEn,
          image,
          inSituImages,
          descriptionDe,
          descriptionEn
        }
      },
      "vitaHighlights": *[_type == "vitaHighlight"] | order(order asc),
      "vitaEntries": *[_type == "vitaEntry"] | order(order asc),
      "videos": *[_type == "video"],
      "statements": *[_type == "statement"] | order(order asc)
    }`);

    if (result.homepage && result.footer) {
      data = result;
      const cacheDir = dirname(cachePath);
      if (!existsSync(cacheDir)) {
        mkdirSync(cacheDir, { recursive: true });
      }
      writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('💾 Cached content locally.');
    } else {
      throw new Error('Missing homepage or footer documents in CMS.');
    }
  } catch (error) {
    console.warn('⚠️ API fetch failed, loading from cache...', error.message);
    if (existsSync(cachePath)) {
      data = JSON.parse(readFileSync(cachePath, 'utf-8'));
    } else {
      console.error('❌ No cache found! Build failed.');
      process.exit(1);
    }
  }

  // --- COMPILE PAGES ---
  const pages = [
    { file: 'index.html', template: 'homepage', titleDe: 'Startseite', titleEn: 'Home' },
    { file: 'gallery/index.html', template: 'gallery', titleDe: 'Galerie', titleEn: 'Gallery' },
    { file: 'projects/index.html', template: 'projects', titleDe: 'Projekte', titleEn: 'Projects' },
    { file: 'vita/index.html', template: 'vita', titleDe: 'Vita', titleEn: 'Vita' },
    { file: 'statement/index.html', template: 'statement', titleDe: 'Statement', titleEn: 'Statement' },
    { file: 'alexkiesslingxgt/index.html', template: 'gt', titleDe: 'alexkiesslingxGT', titleEn: 'alexkiesslingxGT' },
    { file: 'privacy/index.html', template: 'privacy', titleDe: 'Datenschutz & Impressum', titleEn: 'Privacy & Imprint' }
  ];

  pages.forEach(page => {
    // 1. Compile German (de)
    compilePage(page, data, 'de');
    // 2. Compile English (en)
    compilePage(page, data, 'en');
  });

  console.log('🎉 All pages compiled successfully in DE and EN!');
}

function compilePage(page, data, lang) {
  const isEn = lang === 'en';
  const relativePrefix = page.file.includes('/') ? '../' : './';
  const enRelativePrefix = page.file.includes('/') ? '../../' : '../';
  const prefix = isEn ? enRelativePrefix : relativePrefix;
  
  const destDir = isEn ? resolve(`en/${dirname(page.file)}`) : resolve(dirname(page.file));
  const destPath = isEn ? resolve(`en/${page.file}`) : resolve(page.file);
  
  if (!existsSync(destDir)) {
    mkdirSync(destDir, { recursive: true });
  }

  console.log(`Compiling [${lang.toUpperCase()}] ${page.file}...`);
  
  // Load layout and page content
  const layout = readFileSync(resolve('src/templates/layout.html'), 'utf-8');
  const contentTemplatePath = resolve(`src/templates/${page.template}.html`);
  let content = existsSync(contentTemplatePath) ? readFileSync(contentTemplatePath, 'utf-8') : '';

  // 1. Process Page-Specific Replacements
  if (page.template === 'homepage') {
    const title = isEn ? data.homepage.titleEn : data.homepage.titleDe;
    const subtitle = isEn ? data.homepage.subtitleEn : data.homepage.subtitleDe;
    const stmt = isEn ? data.homepage.statementEn : data.homepage.statementDe;
    
    // Fallback image url
    const fallbackUrl = getImageUrl(data.homepage.fallbackImage, 1200) || `${prefix}assets/images/05_SHIFTs28_Neon_Acryliconcanvas_190x250cm_2019-scaled.jpg`;
    
    // Video Src Url
    let videoSrc = data.homepage.videoFileUrl || data.homepage.videoPath || '';
    if (videoSrc.startsWith('/assets/')) {
      videoSrc = prefix + videoSrc.substring(1);
    }
    
    content = content
        .replace('{{TITLE}}', title || 'Alex Kiessling')
        .replace('{{SUBTITLE}}', subtitle || '')
        .replace('{{FALLBACK_IMAGE}}', fallbackUrl)
        .replace('{{VIDEO_PATH}}', videoSrc)
        .replace('{{STATEMENT}}', formatTextToHtml(stmt));
  }
  
  else if (page.template === 'gallery') {
    // Generate categories list from Sanity categories query, or fallback if none exist
    let categoriesList = data.categories || [];
    if (categoriesList.length === 0) {
      const fallbackNames = ['Real', 'shifts1', 'shifts2', 'Headspins', 'Heads', 'water', 'print editions', 'Drawings', 'sculptures', 'long Distance Art'];
      categoriesList = fallbackNames.map(name => {
        return {
          title: name,
          slug: name,
          artworks: (data.artworks || []).filter(art => art.category === name)
        };
      });
    }

    // Generate category tabs
    const tabsHtml = categoriesList.map((cat, idx) => {
      const activeClass = idx === 0 ? 'class="active"' : '';
      return `<button ${activeClass} data-filter="${cat.slug}">${cat.title}</button>`;
    }).join('\n');

    // Generate artwork items grid
    const itemsHtml = categoriesList.flatMap(cat => {
      return (cat.artworks || []).map(art => renderArtworkCard(art, cat.slug, isEn, prefix));
    }).join('\n');

    content = content
        .replace('{{TABS}}', tabsHtml)
        .replace('{{ARTWORKS_GRID}}', itemsHtml);
  }
  
  else if (page.template === 'vita') {
    // A. Highlights (Top Slider)
    const highlightsHtml = (data.vitaHighlights || []).map(item => {
      const imgUrl = getImageUrl(item.image, 800);
      const desc = isEn ? (item.descriptionEn || item.descriptionDe) : (item.descriptionDe || item.descriptionEn);
      const imageBlock = imgUrl ? `
        <div class="slider-image-wrapper">
          <img src="${imgUrl}" alt="${item.title}" loading="lazy" decoding="async">
        </div>
      ` : '';
      return `
      <div class="vita-slider-card">
        <div class="slider-year-badge">${item.year}</div>
        ${imageBlock}
        <div class="slider-card-body">
          <h3 class="slider-title">${item.title}</h3>
          <p class="slider-desc">${desc || ''}</p>
        </div>
      </div>`;
    }).join('\n');

    // B. Entries (Chronological list grouped by year)
    const entriesHtml = (data.vitaEntries || []).map(item => {
      const eventsList = (isEn ? item.eventsEn : item.eventsDe) || [];
      const eventsLi = eventsList.map(ev => `<li>${ev}</li>`).join('\n');
      return `
      <div class="timeline-row reveal-on-scroll" data-year="${item.year}">
        <div class="timeline-year">${item.year}</div>
        <div class="timeline-body">
          <ul class="timeline-events-list">
            ${eventsLi}
          </ul>
        </div>
      </div>`;
    }).join('\n');

    content = content
        .replace('{{VITA_HIGHLIGHTS}}', highlightsHtml)
        .replace('{{VITA_ENTRIES}}', entriesHtml);
  }
  
  else if (page.template === 'statement') {
    const statementsHtml = (data.statements || []).map(stmt => {
      const text = isEn ? stmt.textEn : stmt.textDe;
      const isLong = text.length > 500;
      const imgUrl = getImageUrl(stmt.image, 600);
      
      const metaHtml = `
        <div class="statement-meta-row">
          <span class="statement-author">${stmt.author || ''}</span>
          <h2 class="statement-item-title">${stmt.title || ''}</h2>
        </div>
      `;

      let bodyHtml = '';
      if (isLong) {
        bodyHtml = `
          <div class="statement-body-wrapper">
            <div class="statement-body-text collapsible-content">
              ${formatTextToHtml(text)}
            </div>
            <div class="fade-overlay"></div>
            <button class="btn-read-more" aria-label="Mehr lesen / Read more" aria-expanded="false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        `;
      } else {
        bodyHtml = `
          <div class="statement-body-text">
            ${formatTextToHtml(text)}
          </div>
        `;
      }

      if (imgUrl) {
        return `
        <div class="statement-item reveal-on-scroll has-image ${isLong ? 'collapsable' : ''}">
          <div class="statement-image-col">
            <div class="statement-image-wrapper">
              <img src="${imgUrl}" alt="${stmt.title || ''}" class="statement-card-img" loading="lazy" decoding="async">
            </div>
          </div>
          <div class="statement-content-col">
            ${metaHtml}
            ${bodyHtml}
          </div>
        </div>`;
      } else {
        return `
        <div class="statement-item reveal-on-scroll ${isLong ? 'collapsable' : ''}">
          ${metaHtml}
          ${bodyHtml}
        </div>`;
      }
    }).join('\n');
    content = content.replace('{{STATEMENTS}}', statementsHtml);
  }
  
  else if (page.template === 'projects') {
    // Try to get Long Distance Art artworks from dynamic category first
    const ldaCat = (data.categories || []).find(cat => 
      cat.slug === 'long-distance-art' || cat.slug === 'long-Distance-Art' || cat.title.toLowerCase() === 'long distance art'
    );
    const ldaArtworks = ldaCat ? (ldaCat.artworks || []) : (data.artworks || []).filter(art => 
      art.category && art.category.toLowerCase() === 'long distance art'
    );

    const itemsHtml = ldaArtworks.map(art => {
      const catSlug = art.category || 'long-distance-art';
      return renderArtworkCard(art, catSlug, isEn, prefix);
    }).join('\n');

    content = content.replace('{{LONG_DISTANCE_ART_GRID}}', itemsHtml);
  }
  
  else if (page.template === 'gt') {
    const descText = isEn ? (data.footer.gtCooperationTextEn || data.footer.gtCooperationTextDe) : data.footer.gtCooperationTextDe;
    const verificationText = data.footer.gtVerification || '';
    content = content
        .replace('{{GT_COOPERATION_TEXT}}', formatTextToHtml(descText))
        .replace('{{NFT_VERIFICATION}}', formatTextToHtml(verificationText));
  }
  
  else if (page.template === 'privacy') {
    const impressum = isEn ? data.footer.impressumEn : data.footer.impressumDe;
    const privacy = isEn ? data.footer.privacyEn : data.footer.privacyDe;
    content = content
        .replace('{{IMPRESSUM}}', formatTextToHtml(impressum))
        .replace('{{PRIVACY}}', formatTextToHtml(privacy));
  }

  // Background watermarks from Sanity with local fallbacks
  const bgArt1Url = getImageUrl(data.homepage.bgArt1, 1600) || `${prefix}assets/images/05_SHIFTs28_Neon_Acryliconcanvas_190x250cm_2019-scaled.jpg`;
  const bgArt2Url = getImageUrl(data.homepage.bgArt2, 1600) || `${prefix}assets/images/04_REALzoon_politicon_Acryliconcanvas_200x200cm_2016-scaled.jpg`;
  const bgArt3Url = getImageUrl(data.homepage.bgArt3, 1600) || `${prefix}assets/images/07_WATERShift_paul_watercolor_on_paper_framed_50x60cm_2014-scaled.jpg`;

  // 2. Compile LCP preloads (Google PageSpeed mobile LCP discovery optimization)
  let lcpPreloadHtml = '';
  if (page.template === 'homepage') {
    const fallbackUrl = getImageUrl(data.homepage.fallbackImage, 1200) || `${prefix}assets/images/05_SHIFTs28_Neon_Acryliconcanvas_190x250cm_2019-scaled.jpg`;
    lcpPreloadHtml = `<link rel="preload" as="image" href="${fallbackUrl}" fetchpriority="high">`;
  } else if (page.template === 'gallery') {
    const firstCat = data.categories && data.categories[0];
    const firstArt = firstCat && firstCat.artworks && firstCat.artworks[0];
    if (firstArt) {
      const firstImgUrl = getImageUrl(firstArt.image, 800);
      lcpPreloadHtml = `<link rel="preload" as="image" href="${firstImgUrl}" fetchpriority="high">`;
    }
  } else if (page.template === 'projects') {
    const ldaCat = (data.categories || []).find(cat => 
      cat.slug === 'long-distance-art' || cat.slug === 'long-Distance-Art' || cat.title.toLowerCase() === 'long distance art'
    );
    const ldaArtworks = ldaCat ? (ldaCat.artworks || []) : (data.artworks || []).filter(art => 
      art.category && art.category.toLowerCase() === 'long distance art'
    );
    if (ldaArtworks && ldaArtworks[0]) {
      const firstImgUrl = getImageUrl(ldaArtworks[0].image, 800);
      lcpPreloadHtml = `<link rel="preload" as="image" href="${firstImgUrl}" fetchpriority="high">`;
    }
  } else if (page.template === 'vita') {
    const firstHighlight = data.vitaHighlights && data.vitaHighlights[0];
    if (firstHighlight && firstHighlight.image) {
      const firstImgUrl = getImageUrl(firstHighlight.image, 800);
      lcpPreloadHtml = `<link rel="preload" as="image" href="${firstImgUrl}" fetchpriority="high">`;
    }
  }

  // 3. Assemble Layout
  let htmlResult = layout
      .replace('<!-- CONTENT -->', content)
      .replace('<body>', `<body class="${page.template === 'homepage' ? 'page-homepage' : 'page-subpage'}">`)
      .replace('<html lang="de">', `<html lang="${lang}">`)
      .replace('{{PAGE_TITLE}}', isEn ? `${page.titleEn} — Alex Kiessling` : `${page.titleDe} — Alex Kiessling`)
      .replace(/\{\{PREFIX\}\}/g, prefix)
      .replace(/\{\{LANG_PATH\}\}/g, isEn ? 'en/' : '')
      .replace('{{LCP_PRELOAD}}', lcpPreloadHtml)
      .replace('{{BG_ART_1}}', bgArt1Url)
      .replace('{{BG_ART_2}}', bgArt2Url)
      .replace('{{BG_ART_3}}', bgArt3Url);

  // 3. Process Header Toggles (Active states and DE/EN redirects)
  const menuLinks = [
    { key: 'home', path: 'index.html' },
    { key: 'gallery', path: 'gallery/' },
    { key: 'projects', path: 'projects/' },
    { key: 'vita', path: 'vita/' },
    { key: 'statement', path: 'statement/' },
    { key: 'alexkiesslingxgt', path: 'alexkiesslingxgt/' }
  ];
  
  // Set language toggle link target
  const deTarget = isEn ? `${enRelativePrefix}${page.file === 'index.html' ? '' : page.file.replace('index.html', '')}` : `./`;
  const enTarget = isEn ? `./` : `${relativePrefix}en/${page.file === 'index.html' ? '' : page.file.replace('index.html', '')}`;
  
  htmlResult = htmlResult
      .replace('{{LANG_DE_LINK}}', deTarget)
      .replace('{{LANG_EN_LINK}}', enTarget)
      .replace('{{LANG_DE_ACTIVE}}', isEn ? '' : 'class="active"')
      .replace('{{LANG_EN_ACTIVE}}', isEn ? 'class="active"' : '');

  // Add active classes to menu items
  menuLinks.forEach(link => {
    const isActive = page.file.startsWith(link.path);
    htmlResult = htmlResult.replace(`{{ACTIVE_${link.key.toUpperCase()}}}`, isActive ? 'class="active"' : '');
  });

  htmlResult = htmlResult
      .replace(/{{CONTACT_EMAIL}}/g, data.footer.email || 'info@alexkiessling.com')
      .replace(/{{INSTAGRAM_LINK}}/g, data.footer.instagramUrl || 'https://www.instagram.com/alexkiessling/')
      .replace(/{{FACEBOOK_LINK}}/g, data.footer.facebookUrl || 'https://de-de.facebook.com/pages/category/Artist/ALEX-KIESSLING-236103737238/')
      .replace(/{{YOUTUBE_LINK}}/g, data.footer.youtubeChannelUrl || 'https://www.youtube.com/user/alexkieszling')
      .replace(/{{RARIBLE_LINK}}/g, data.footer.raribleUrl || 'https://rarible.com/alexkiessling');

  writeFileSync(destPath, htmlResult, 'utf-8');
  console.log(`✅ File written: ${destPath}`);
}

sync().catch(err => {
  console.error('❌ Sync script failure:', err);
  process.exit(1);
});
