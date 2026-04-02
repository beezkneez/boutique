/**
 * Shared utilities for demo video generation.
 * - TTS generation via edge-tts (Python)
 * - Audio duration detection via ffprobe
 * - Video + audio merge via fluent-ffmpeg
 * - Playwright visual helpers
 */

const { execFile, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegPath);

const AUDIO_DIR = path.join(__dirname, '..', 'videos', 'audio');
const VOICE = 'en-US-AriaNeural';

// Ensure audio temp directory exists
function ensureAudioDir() {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

/**
 * Generate TTS narration using edge-tts (Python).
 * @param {string} text - Text to speak
 * @param {string} outputPath - Output MP3 path
 * @returns {Promise<string>} outputPath
 */
function generateNarration(text, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      '-m', 'edge_tts',
      '--voice', VOICE,
      '--text', text,
      '--write-media', outputPath,
    ];
    execFile('python', args, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) return reject(new Error(`TTS failed: ${err.message}\n${stderr}`));
      resolve(outputPath);
    });
  });
}

/**
 * Get audio duration in seconds using ffprobe.
 * Falls back to a rough estimate if ffprobe is unavailable.
 * @param {string} filePath - Path to audio file
 * @returns {Promise<number>} duration in seconds
 */
function getAudioDuration(filePath) {
  return new Promise((resolve) => {
    // Try ffprobe first (bundled via ffmpeg-static sibling or system)
    const ffprobePath = ffmpegPath.replace(/ffmpeg(\.exe)?$/, 'ffprobe$1');
    const tryFfprobe = fs.existsSync(ffprobePath);

    if (tryFfprobe) {
      try {
        const result = execSync(
          `"${ffprobePath}" -v error -show_entries format=duration -of csv=p=0 "${filePath}"`,
          { encoding: 'utf8', timeout: 10000 }
        );
        const dur = parseFloat(result.trim());
        if (!isNaN(dur) && dur > 0) return resolve(dur);
      } catch (_) { /* fall through */ }
    }

    // Fallback: estimate from file size (MP3 ~16kB/s for edge-tts output)
    try {
      const stat = fs.statSync(filePath);
      const estimated = stat.size / 16000;
      resolve(Math.max(estimated, 1));
    } catch (_) {
      // Last resort: estimate from text length (~150 words/min, ~5 chars/word)
      resolve(3);
    }
  });
}

/**
 * Generate all TTS audio files for a scene list in parallel.
 * @param {Array<{name:string, narration:string}>} scenes
 * @returns {Promise<Array<{path:string, duration:number}>>} audio info per scene
 */
async function generateAllNarrations(scenes) {
  ensureAudioDir();
  console.log(`Generating ${scenes.length} narration clips...`);

  const results = await Promise.all(
    scenes.map(async (scene, i) => {
      const outPath = path.join(AUDIO_DIR, `${String(i).padStart(2, '0')}_${scene.name}.mp3`);
      await generateNarration(scene.narration, outPath);
      const duration = await getAudioDuration(outPath);
      console.log(`  [${i + 1}/${scenes.length}] ${scene.name}: ${duration.toFixed(1)}s`);
      return { path: outPath, duration };
    })
  );

  return results;
}

/**
 * Build a single combined audio track by concatenating clips with silence gaps.
 * Uses ffmpeg concat demuxer with generated silence files.
 * @param {Array<{path:string, startTime:number}>} audioSegments
 * @param {string} combinedPath - Output combined audio path
 * @returns {Promise<string>} combinedPath
 */
function buildCombinedAudio(audioSegments, combinedPath) {
  return new Promise((resolve, reject) => {
    // Build a concat list: silence gap, then clip, for each segment
    const listPath = path.join(AUDIO_DIR, 'concat_list.txt');
    const silenceDir = path.join(AUDIO_DIR, 'silence');
    fs.mkdirSync(silenceDir, { recursive: true });

    // We need to generate silence files for gaps, then write the concat list.
    // First, figure out all the gaps and generate silence files synchronously.
    const entries = [];
    let cursor = 0; // current position in seconds

    const silencePromises = [];

    for (let i = 0; i < audioSegments.length; i++) {
      const seg = audioSegments[i];
      const gap = seg.startTime - cursor;

      if (gap > 0.05) {
        // Need a silence file for this gap
        const silPath = path.join(silenceDir, `silence_${i}.mp3`);
        silencePromises.push({ gap, silPath, index: i });
        entries.push({ type: 'silence', path: silPath, gap, index: i });
      }

      entries.push({ type: 'clip', path: seg.path });

      // Estimate clip duration from the timing (next startTime - this startTime - buffer)
      // We already know durations from the narration step, but we need to read them
      // For cursor tracking, use the gap between this start and next start
      if (i + 1 < audioSegments.length) {
        cursor = audioSegments[i + 1].startTime;
      }
    }

    // Generate silence files using ffmpeg
    const genSilence = (gap, outPath) => {
      return new Promise((res, rej) => {
        ffmpeg()
          .input('anullsrc=r=24000:cl=mono')
          .inputOptions(['-f', 'lavfi'])
          .duration(gap)
          .outputOptions(['-c:a', 'libmp3lame', '-b:a', '64k'])
          .output(outPath)
          .on('end', () => res())
          .on('error', (err) => rej(err))
          .run();
      });
    };

    // Generate all silence files sequentially (they're tiny)
    (async () => {
      for (const sp of silencePromises) {
        await genSilence(sp.gap, sp.silPath);
      }

      // Write concat list file
      const listContent = entries
        .map((e) => `file '${e.path.replace(/\\/g, '/')}'`)
        .join('\n');
      fs.writeFileSync(listPath, listContent, 'utf8');

      // Concatenate all into one audio file
      ffmpeg()
        .input(listPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .outputOptions(['-c:a', 'libmp3lame', '-b:a', '128k'])
        .output(combinedPath)
        .on('end', () => resolve(combinedPath))
        .on('error', (err) => reject(new Error(`Concat failed: ${err.message}`)))
        .run();
    })().catch(reject);
  });
}

/**
 * Merge Playwright video with narration audio segments.
 * Step 1: Build a single audio track (clips + silence gaps in sequence).
 * Step 2: Mux that audio onto the video.
 * @param {string} videoPath - Raw Playwright video
 * @param {Array<{path:string, startTime:number}>} audioSegments - Audio files with start offsets
 * @param {string} outputPath - Final MP4 output
 * @returns {Promise<string>} outputPath
 */
async function mergeVideoAudio(videoPath, audioSegments, outputPath) {
  if (audioSegments.length === 0) {
    throw new Error('No audio segments to merge');
  }

  // Step 1: Build combined audio track
  const combinedAudio = path.join(AUDIO_DIR, 'combined.mp3');
  console.log('  Building combined audio track...');
  await buildCombinedAudio(audioSegments, combinedAudio);
  console.log('  Combined audio ready.');

  // Step 2: Mux video + combined audio
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(videoPath)
      .input(combinedAudio)
      .outputOptions([
        '-map', '0:v',
        '-map', '1:a',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-shortest',
        '-movflags', '+faststart',
      ])
      .output(outputPath)
      .on('start', () => {
        console.log('  Muxing video + audio...');
      })
      .on('progress', (progress) => {
        if (progress.percent) {
          process.stdout.write(`\r  Merging: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('\n  Merge complete!');
        resolve(outputPath);
      })
      .on('error', (err) => {
        reject(new Error(`FFmpeg merge failed: ${err.message}`));
      })
      .run();
  });
}

/**
 * Clean up temp audio files.
 */
function cleanupAudio() {
  if (fs.existsSync(AUDIO_DIR)) {
    fs.rmSync(AUDIO_DIR, { recursive: true, force: true });
    console.log('Cleaned up temp audio files.');
  }
}

// ─── Playwright Helpers ───

/**
 * Highlight an element with a red border for visual emphasis.
 * @param {import('playwright').Page} page
 * @param {string} selector
 * @param {number} durationMs - How long to keep highlight (default 2000ms)
 */
async function highlightElement(page, selector, durationMs = 2000) {
  try {
    await page.evaluate(
      ({ sel, dur }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const orig = el.style.cssText;
        el.style.outline = '3px solid red';
        el.style.outlineOffset = '2px';
        el.style.transition = 'outline 0.3s ease';
        setTimeout(() => { el.style.cssText = orig; }, dur);
      },
      { sel: selector, dur: durationMs }
    );
  } catch (_) { /* element may not exist */ }
}

/**
 * Type text with human-like delay.
 * @param {import('playwright').Page} page
 * @param {string} selector
 * @param {string} text
 * @param {number} delayMs - Delay between keystrokes (default 80ms)
 */
async function typeSlowly(page, selector, text, delayMs = 80) {
  await page.click(selector);
  await page.fill(selector, '');
  await page.type(selector, text, { delay: delayMs });
}

/**
 * Navigate to a tab using the app's go() function directly.
 * More reliable than clicking nav links which may be hidden.
 * @param {import('playwright').Page} page
 * @param {'home'|'reports'|'profile'|'support'|'admin'} tab
 */
async function goToTab(page, tab) {
  await page.evaluate((t) => {
    if (typeof go === 'function') go(t);
  }, tab);
  await page.waitForTimeout(800);
}

/**
 * Click an admin sub-tab.
 * @param {import('playwright').Page} page
 * @param {string} tabName - e.g. 'payroll', 'staff', 'settings', 'flagged', 'export', 'pending'
 */
async function goToAdminTab(page, tabName) {
  // Admin sub-tabs are buttons within the admin page
  // They use onclick="showAdminTab('tabName')" or similar
  await page.evaluate((name) => {
    if (typeof showAdminTab === 'function') showAdminTab(name);
  }, tabName);
  await page.waitForTimeout(600);
}

/**
 * Scroll an element into view smoothly.
 * @param {import('playwright').Page} page
 * @param {string} selector
 */
async function scrollTo(page, selector) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, selector);
  await page.waitForTimeout(500);
}

/**
 * Wait for narration duration + buffer.
 * @param {number} durationSec - Narration duration in seconds
 * @param {number} bufferSec - Extra buffer (default 1.5s)
 */
async function waitForNarration(page, durationSec, bufferSec = 1.5) {
  await page.waitForTimeout((durationSec + bufferSec) * 1000);
}

module.exports = {
  generateNarration,
  getAudioDuration,
  generateAllNarrations,
  mergeVideoAudio,
  cleanupAudio,
  highlightElement,
  typeSlowly,
  goToTab,
  goToAdminTab,
  scrollTo,
  waitForNarration,
  AUDIO_DIR,
};
