#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    corpusDir: 'data/corpus',
    dryRun: false,
    report: 'output/fix-corpus-english-hints-report.json'
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

function stripHints(english) {
  if (typeof english !== 'string') return english;
  // Remove known hint tokens; keep spacing tidy.
  return english
    .replace(/\s*\(informal\)/gi, '')
    .replace(/\s*\(formal\)/gi, '')
    .replace(/\s*\(vos\)/gi, '')
    .replace(/\s*\(Spain\)/gi, '')
    .replace(/\s*\(vosotros\)/gi, '')
    .replace(/\bYou all\b/gi, 'You')
    .replace(/\byou all\b/gi, 'you')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function applyYouReplacement(baseEnglish, replacement) {
  if (typeof baseEnglish !== 'string') return baseEnglish;
  // Replace whole-word You/you with the replacement (preserve capitalization by choosing replacement casing).
  // For now, replacement strings are capitalized ("You (informal)", "You all" etc) so replace both variants.
  return baseEnglish
    .replace(/\bYou\b/g, replacement)
    .replace(/\byou\b/g, replacement[0].toLowerCase() + replacement.slice(1));
}

function normalizeEnglishForSubject(subject, english) {
  if (typeof english !== 'string') return { changed: false, english };

  // If english doesn't contain You/you, we generally avoid forcing hints (e.g. subject=ustedes might be "They...").
  const hasYou = /\bYou\b|\byou\b/.test(english);
  if (!hasYou) {
    // Still remove contradictory hints if present.
    const cleaned = stripHints(english);
    return cleaned !== english ? { changed: true, english: cleaned } : { changed: false, english };
  }

  const cleaned = stripHints(english);

  let desired = null;
  switch (subject) {
    case 'tú':
      desired = 'You (informal)';
      break;
    case 'usted':
      desired = 'You (formal)';
      break;
    case 'ustedes':
      desired = 'You all';
      break;
    case 'vosotros':
      desired = 'You all (vosotros)';
      break;
    case 'vos':
      desired = 'You (vos)';
      break;
    default:
      desired = null;
  }

  if (!desired) {
    // For non-you subjects, just ensure no stray hints remain.
    return cleaned !== english ? { changed: true, english: cleaned } : { changed: false, english };
  }

  const normalized = applyYouReplacement(cleaned, desired);
  return normalized !== english ? { changed: true, english: normalized } : { changed: false, english };
}

function walkAndFixFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${filePath}`);
  }

  const relFile = path.relative(process.cwd(), filePath);
  const changes = [];

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];
        if (!sentence || typeof sentence !== 'object') continue;
        if (typeof sentence.english !== 'string') continue;

        const before = sentence.english;
        const { changed, english } = normalizeEnglishForSubject(sentence.subject, before);
        if (!changed) continue;

        sentence.english = english;
        changes.push({
          file: relFile,
          verbKey,
          tenseKey,
          index: i,
          subject: sentence.subject,
          englishBefore: before,
          englishAfter: english,
          spanish: sentence.spanish,
          audio: sentence.audio || null
        });
      }
    }
  }

  return { json, changes };
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
      changes: 0
    },
    changes: []
  };

  for (const filePath of files) {
    const { json, changes } = walkAndFixFile(filePath);
    if (changes.length > 0) {
      report.totals.filesTouched++;
      report.totals.changes += changes.length;
      report.changes.push(...changes);

      if (!opts.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    }
  }

  ensureDir(opts.report);
  fs.writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nFix corpus English hints (${opts.dryRun ? 'DRY RUN' : 'WRITE'}):`);
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Files touched: ${report.totals.filesTouched}`);
  console.log(`- Changes: ${report.totals.changes}`);
  console.log(`- Report: ${opts.report}`);
  if (!opts.dryRun) {
    console.log(`\nNOTE: Spanish text unchanged. If your audio was generated with different English hints, no audio regen needed.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
