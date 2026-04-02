#!/usr/bin/env node

/**
 * Demo Video Generator for Test Studio
 *
 * Usage:
 *   node scripts/generate-demo.js [staff|admin|both]
 *
 * Pipeline:
 *   1. Generate TTS narration audio (edge-tts via Python)
 *   2. Launch Playwright, record browser video while running scenes
 *   3. Merge video + audio into final MP4 (ffmpeg)
 */

const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const {
  generateAllNarrations,
  mergeVideoAudio,
  cleanupAudio,
  waitForNarration,
} = require('./demo-helpers');

const VIDEOS_DIR = path.join(__dirname, '..', 'videos');
const RAW_DIR = path.join(VIDEOS_DIR, 'raw');

async function generateVideo(type) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Generating ${type} demo video...`);
  console.log(`${'='.repeat(50)}\n`);

  // Load scenes
  const scenesPath = path.join(__dirname, `scenes-${type}.js`);
  if (!fs.existsSync(scenesPath)) {
    throw new Error(`Scene file not found: ${scenesPath}`);
  }
  const scenes = require(scenesPath);
  console.log(`Loaded ${scenes.length} scenes for ${type} video.\n`);

  // ─── Step 1: Generate TTS audio ───
  console.log('Step 1: Generating TTS narration...');
  const audioSegments = await generateAllNarrations(scenes);
  const totalNarrationTime = audioSegments.reduce((sum, a) => sum + a.duration, 0);
  console.log(`Total narration: ${totalNarrationTime.toFixed(1)}s\n`);

  // Calculate scene start times (cumulative with 1.5s buffer between scenes)
  const BUFFER = 1.5;
  const sceneTiming = [];
  let currentTime = 0;
  for (let i = 0; i < scenes.length; i++) {
    sceneTiming.push({
      startTime: currentTime,
      duration: audioSegments[i].duration,
      waitTime: audioSegments[i].duration + BUFFER,
    });
    currentTime += audioSegments[i].duration + BUFFER;
  }
  const estimatedTotal = currentTime;
  console.log(`Estimated video length: ${estimatedTotal.toFixed(1)}s (${(estimatedTotal / 60).toFixed(1)} min)\n`);

  // ─── Step 2: Record browser video ───
  console.log('Step 2: Recording browser walkthrough...');
  fs.mkdirSync(RAW_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox'],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  // Run each scene
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i];
    const timing = sceneTiming[i];
    console.log(`  [${i + 1}/${scenes.length}] ${scene.name} (${timing.duration.toFixed(1)}s narration)`);

    try {
      await scene.action(page);
    } catch (err) {
      console.warn(`    Warning: Scene action error: ${err.message}`);
    }

    // Wait for narration duration + buffer
    await waitForNarration(page, timing.duration, BUFFER);
  }

  // Close and save video
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`\nRaw video saved: ${videoPath}\n`);

  // ─── Step 3: Merge video + audio ───
  console.log('Step 3: Merging video with narration audio...');
  const outputPath = path.join(VIDEOS_DIR, `${type}-demo.mp4`);

  const audioWithTiming = audioSegments.map((seg, i) => ({
    path: seg.path,
    startTime: sceneTiming[i].startTime,
  }));

  try {
    await mergeVideoAudio(videoPath, audioWithTiming, outputPath);
    console.log(`\nFinal video: ${outputPath}`);
  } catch (err) {
    console.error(`\nMerge failed: ${err.message}`);
    console.log('Raw video (without audio) is available at:', videoPath);
    // Copy raw video as fallback
    const fallbackPath = path.join(VIDEOS_DIR, `${type}-demo-no-audio.mp4`);
    fs.copyFileSync(videoPath, fallbackPath);
    console.log(`Fallback (no audio): ${fallbackPath}`);
  }

  return outputPath;
}

async function main() {
  const arg = process.argv[2] || 'both';
  const validArgs = ['staff', 'admin', 'guide', 'both', 'all'];

  if (!validArgs.includes(arg)) {
    console.log('Usage: node scripts/generate-demo.js [staff|admin|guide|both|all]');
    process.exit(1);
  }

  fs.mkdirSync(VIDEOS_DIR, { recursive: true });

  const types = arg === 'both' ? ['staff', 'admin'] : arg === 'all' ? ['staff', 'admin', 'guide'] : [arg];
  const results = [];

  for (const type of types) {
    try {
      const output = await generateVideo(type);
      results.push({ type, output, success: true });
    } catch (err) {
      console.error(`\nFailed to generate ${type} video: ${err.message}`);
      results.push({ type, error: err.message, success: false });
    }
  }

  // Cleanup temp audio
  cleanupAudio();

  // Summary
  console.log(`\n${'='.repeat(50)}`);
  console.log('Summary:');
  console.log(`${'='.repeat(50)}`);
  for (const r of results) {
    if (r.success) {
      console.log(`  ${r.type}: ${r.output}`);
    } else {
      console.log(`  ${r.type}: FAILED - ${r.error}`);
    }
  }
  console.log();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
