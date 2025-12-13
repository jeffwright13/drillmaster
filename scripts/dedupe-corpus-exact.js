#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    corpusDir: 'data/corpus',
    dryRun: false,
    report: 'output/dedupe-corpus-exact-report.json'
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--corpus-dir' && args[i + 1]) opts.corpusDir = args[++i];
    else if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--report' && args[i + 1]) opts.report = args[++i];
  }

  return opts;
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listTierCorpusFiles(corpusDir) {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
  return all
    .filter(p => /tier[1-5]-complete(\.with-audio)?\.json$/i.test(p))
    .sort();
}

function sentenceIdentityKey(sentence) {
  const subject = sentence.subject || '';
  const region = sentence.region || '';
  const spanish = sentence.spanish || '';
  const english = sentence.english || '';
  return `${subject}||${region}||${spanish}||${english}`;
}

function dedupeArray(arr, context) {
  const seen = new Set();
  const kept = [];
  const removed = [];

  for (let i = 0; i < arr.length; i++) {
    const s = arr[i];
    if (!s || typeof s !== 'object') {
      kept.push(s);
      continue;
    }
    const key = sentenceIdentityKey(s);
    if (seen.has(key)) {
      removed.push({
        ...context,
        index: i,
        subject: s.subject,
        region: s.region || null,
        spanish: s.spanish,
        english: s.english,
        audio: s.audio || null
      });
    } else {
      seen.add(key);
      kept.push(s);
    }
  }

  return { kept, removed };
}

function dedupeFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${filePath}`);
  }

  const relFile = path.relative(process.cwd(), filePath);
  const removals = [];
  let arraysTouched = 0;

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      const { kept, removed } = dedupeArray(tenseData, { file: relFile, verbKey, tenseKey });
      if (removed.length > 0) {
        verbs[verbKey][tenseKey] = kept;
        arraysTouched++;
        removals.push(...removed);
      }
    }
  }

  return { json, arraysTouched, removals };
}

async function main() {
  const opts = parseArgs();
  const corpusDir = path.resolve(opts.corpusDir);

  if (!fs.existsSync(corpusDir)) {
    console.error(`Corpus dir not found: ${corpusDir}`);
    process.exit(1);
  }

  const files = listTierCorpusFiles(corpusDir);
  if (files.length === 0) {
    console.error(`No tier corpus files found in: ${corpusDir}`);
    process.exit(1);
  }

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: opts.dryRun,
    corpusDir: path.relative(process.cwd(), corpusDir),
    files: files.map(f => path.relative(process.cwd(), f)),
    totals: {
      filesTouched: 0,
      arraysTouched: 0,
      removedSentences: 0
    },
    removed: []
  };

  for (const filePath of files) {
    const { json, arraysTouched, removals } = dedupeFile(filePath);
    if (removals.length > 0) {
      report.totals.filesTouched++;
      report.totals.arraysTouched += arraysTouched;
      report.totals.removedSentences += removals.length;
      report.removed.push(...removals);

      if (!opts.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    }
  }

  ensureDir(opts.report);
  fs.writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nDedupe corpus exact (${opts.dryRun ? 'DRY RUN' : 'WRITE'}):`);
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Files touched: ${report.totals.filesTouched}`);
  console.log(`- Arrays touched: ${report.totals.arraysTouched}`);
  console.log(`- Removed sentences: ${report.totals.removedSentences}`);
  console.log(`- Report: ${opts.report}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
