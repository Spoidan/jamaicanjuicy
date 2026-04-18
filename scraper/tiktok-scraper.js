#!/usr/bin/env node
/**
 * TikTok scraper for Jamaican Juicy
 * Uses Apify's TikTok scraper API (free tier: 5 runs/month)
 *
 * Usage:
 *   APIFY_TOKEN=xxx node scraper/tiktok-scraper.js --username jamaicanjuicy
 *   node scraper/tiktok-scraper.js --manual          (print manual export instructions)
 *   node scraper/tiktok-scraper.js --from-manual     (load from scraper/manual-videos.json)
 */

const fs = require('fs');
const path = require('path');

const APIFY_TOKEN = process.env.APIFY_TOKEN || '';
const args = process.argv.slice(2);
const USERNAME_IDX = args.indexOf('--username');
const TIKTOK_USERNAME = USERNAME_IDX !== -1 ? args[USERNAME_IDX + 1] : 'jamaicanjuicy';

async function scrapeViaApify(username) {
  if (!APIFY_TOKEN) {
    console.error('Set APIFY_TOKEN env var. Get a free key at https://apify.com');
    process.exit(1);
  }

  const url = 'https://api.apify.com/v2/acts/clockworks~tiktok-profile-scraper/run-sync-get-dataset-items';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${APIFY_TOKEN}` },
    body: JSON.stringify({
      profiles: [`https://www.tiktok.com/@${username}`],
      resultsPerPage: 30,
      shouldDownloadVideos: false,
      shouldDownloadCovers: true,
    }),
  });

  if (!res.ok) throw new Error(`Apify error: ${res.status} ${await res.text()}`);
  return transformApify(await res.json());
}

function transformApify(items) {
  return items.map((v) => ({
    id: v.id,
    description: v.text || '',
    thumbnail: v.videoMeta?.coverUrl || v.covers?.[0] || '',
    videoUrl: v.webVideoUrl || `https://www.tiktok.com/@${TIKTOK_USERNAME}/video/${v.id}`,
    likes: v.diggCount || 0,
    comments: v.commentCount || 0,
    shares: v.shareCount || 0,
    views: v.playCount || 0,
    createdAt: v.createTime ? new Date(v.createTime * 1000).toISOString() : new Date().toISOString(),
    hashtags: (v.textExtra || []).filter((t) => t.hashtagName).map((t) => t.hashtagName),
    featured: false,
  }));
}

function manualInstructions() {
  console.log(`
─────────────────────────────────────────────────────
  Manual TikTok Export Instructions (No API needed)
─────────────────────────────────────────────────────

1. Log into TikTok web
2. Go to Settings → Privacy → Personalization and Data
3. Click "Download your data" → choose JSON format
4. Wait for the download link (may take up to 48h)
5. Unzip, find Video_List array in the JSON
6. Create scraper/manual-videos.json with this shape:

[
  {
    "id": "7123456789",
    "description": "Your video caption #jamaicanjuicy",
    "thumbnail": "https://url-to-thumbnail.jpg",
    "videoUrl": "https://www.tiktok.com/@jamaicanjuicy/video/7123456789",
    "likes": 1500,
    "comments": 43,
    "shares": 120,
    "views": 28000,
    "createdAt": "2024-01-15T10:00:00Z",
    "hashtags": ["jamaicanjuicy", "freshfruit"],
    "featured": true
  }
]

7. Run: node scraper/tiktok-scraper.js --from-manual
`);
}

function saveVideos(videos) {
  const outPath = path.join(__dirname, '..', 'src', 'data', 'tiktok-videos.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(videos, null, 2));
  console.log(`✅ Saved ${videos.length} videos to src/data/tiktok-videos.json`);
}

async function main() {
  if (args.includes('--manual')) {
    manualInstructions();
    return;
  }

  if (args.includes('--from-manual')) {
    const src = path.join(__dirname, 'manual-videos.json');
    if (!fs.existsSync(src)) {
      console.error('❌ scraper/manual-videos.json not found. Run --manual for instructions.');
      process.exit(1);
    }
    const videos = JSON.parse(fs.readFileSync(src, 'utf8'));
    saveVideos(videos);
    return;
  }

  console.log(`🔍 Scraping TikTok for @${TIKTOK_USERNAME}...`);
  const videos = await scrapeViaApify(TIKTOK_USERNAME);
  saveVideos(videos);
}

main().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
