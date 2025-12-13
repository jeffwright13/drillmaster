#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    corpusDir: 'data/corpus',
    audioDir: 'data/audio',
    backupDir: null,
    dryRun: false,
    report: 'output/move-orphan-audio-report.json'
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--corpus-dir' && args[i + 1]) opts.corpusDir = args[++i];
    else if (a === '--audio-dir' && args[i + 1]) opts.audioDir = args[++i];
    else if (a === '--backup-dir' && args[i + 1]) opts.backupDir = args[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--report' && args[i + 1]) opts.report = args[++i];
  }

  if (!opts.backupDir) {
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    opts.backupDir = path.join('data', 'audio-backup-orphans', stamp);
  }

  return opts;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  ensureDir(dir);
}

function listWithAudioCorpora(corpusDir) {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
  return all
    .filter(p => /tier[1-5]-complete\.with-audio\.json$/i.test(p))
    .sort();
}

function collectReferencedAudio(corpusPath) {
  const json = JSON.parse(fs.readFileSync(corpusPath, 'utf8'));
  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${corpusPath}`);
  }

  const out = new Set();
  for (const verbData of Object.values(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;
      for (const sentence of tenseData) {
        if (!sentence || typeof sentence !== 'object') continue;
        if (typeof sentence.audio === 'string' && sentence.audio.trim()) {
          out.add(sentence.audio.trim());
        }
      }
    }
  }

  return out;
}

async function main() {
  const opts = parseArgs();
  const corpusDir = path.resolve(opts.corpusDir);
  const audioDir = path.resolve(opts.audioDir);
  const backupDir = path.resolve(opts.backupDir);

  if (!fs.existsSync(corpusDir)) {
    console.error(`Corpus dir not found: ${corpusDir}`);
    process.exit(1);
  }
  if (!fs.existsSync(audioDir)) {
    console.error(`Audio dir not found: ${audioDir}`);
    process.exit(1);
  }

  const corpora = listWithAudioCorpora(corpusDir);
  if (corpora.length === 0) {
    console.error(`No with-audio corpora found in: ${corpusDir}`);
    process.exit(1);
  }

  const referenced = new Set();
  for (const corpusPath of corpora) {
    const set = collectReferencedAudio(corpusPath);
    for (const f of set) referenced.add(f);
  }

  const audioFiles = fs.readdirSync(audioDir).filter(f => f.toLowerCase().endsWith('.mp3'));

  const orphaned = [];
  for (const f of audioFiles) {
    if (!referenced.has(f)) orphaned.push(f);
  }

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: opts.dryRun,
    corpusDir: path.relative(process.cwd(), corpusDir),
    audioDir: path.relative(process.cwd(), audioDir),
    backupDir: path.relative(process.cwd(), backupDir),
    totals: {
      corporaScanned: corpora.length,
      referencedAudio: referenced.size,
      audioFilesOnDisk: audioFiles.length,
      orphaned: orphaned.length,
      moved: 0
    },
    orphaned
  };

  if (!opts.dryRun) {
    ensureDir(backupDir);
  }

  for (const f of orphaned) {
    const src = path.join(audioDir, f);
    const dest = path.join(backupDir, f);

    if (!opts.dryRun) {
      ensureDirForFile(dest);
      fs.renameSync(src, dest);
      report.totals.moved++;
    }
  }

  ensureDirForFile(path.resolve(opts.report));
  fs.writeFileSync(path.resolve(opts.report), JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nMove orphan audio (${opts.dryRun ? 'DRY RUN' : 'WRITE'}):`);
  console.log(`- Corpora scanned: ${report.totals.corporaScanned}`);
  console.log(`- Referenced audio: ${report.totals.referencedAudio}`);
  console.log(`- Audio files on disk: ${report.totals.audioFilesOnDisk}`);
  console.log(`- Orphaned: ${report.totals.orphaned}`);
  console.log(`- Backup dir: ${report.backupDir}`);
  console.log(`- Report: ${opts.report}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
