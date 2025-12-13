#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    corpusDir: 'data/corpus',
    report: 'output/fix-spanish-capitalization-report.json'
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--corpus-dir') opts.corpusDir = args[++i];
    else if (a === '--report') opts.report = args[++i];
  }

  return opts;
}

function listCorpusFiles(corpusDir) {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
  return all
    .filter(p => /tier[1-5]-complete(\.with-audio)?\.json$/i.test(p))
    .sort();
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function capitalizeFirstSpanishLetter(s) {
  if (typeof s !== 'string' || s.length === 0) return { changed: false, value: s };

  // Find first Unicode letter, skipping punctuation/whitespace like ¿ ¡ " ' ( ) etc.
  const match = s.match(/\p{L}/u);
  if (!match || match.index == null) return { changed: false, value: s };

  const idx = match.index;
  const ch = s[idx];
  const upper = ch.toLocaleUpperCase('es-ES');
  if (ch === upper) return { changed: false, value: s };

  return { changed: true, value: s.slice(0, idx) + upper + s.slice(idx + 1) };
}

function walkAndFixCorpus(json, filePath) {
  const changes = [];

  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${filePath}`);
  }

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];
        if (!sentence || typeof sentence !== 'object') continue;
        if (typeof sentence.spanish !== 'string') continue;

        const before = sentence.spanish;
        const { changed, value } = capitalizeFirstSpanishLetter(before);
        if (!changed) continue;

        sentence.spanish = value;
        changes.push({
          file: filePath,
          verbKey,
          tenseKey,
          index: i,
          audio: sentence.audio || null,
          spanishBefore: before,
          spanishAfter: value
        });
      }
    }
  }

  return changes;
}

async function main() {
  const opts = parseArgs();

  if (!fs.existsSync(opts.corpusDir)) {
    console.error(`Corpus dir not found: ${opts.corpusDir}`);
    process.exit(1);
  }

  const files = listCorpusFiles(opts.corpusDir);
  if (files.length === 0) {
    console.error(`No tier corpus files found in: ${opts.corpusDir}`);
    process.exit(1);
  }

  const report = {
    startedAt: new Date().toISOString(),
    dryRun: opts.dryRun,
    files: files.map(f => path.relative(process.cwd(), f)),
    totals: {
      filesTouched: 0,
      changes: 0
    },
    changes: []
  };

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);

    const fileChanges = walkAndFixCorpus(json, filePath);
    if (fileChanges.length > 0) {
      report.totals.filesTouched++;
      report.totals.changes += fileChanges.length;
      report.changes.push(...fileChanges.map(c => ({
        ...c,
        file: path.relative(process.cwd(), c.file)
      })));

      if (!opts.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    }
  }

  ensureDir(opts.report);
  fs.writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nFix Spanish capitalization (${opts.dryRun ? 'DRY RUN' : 'WRITE'}):`);
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Files touched: ${report.totals.filesTouched}`);
  console.log(`- Changes: ${report.totals.changes}`);
  console.log(`- Report: ${opts.report}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
