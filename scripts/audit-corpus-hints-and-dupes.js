#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    corpusDir: 'data/corpus',
    report: 'output/audit-corpus-hints-and-dupes.json',
    variant: 'with-audio' // with-audio | complete | both
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--corpus-dir' && args[i + 1]) opts.corpusDir = args[++i];
    else if (a === '--report' && args[i + 1]) opts.report = args[++i];
    else if (a === '--variant' && args[i + 1]) opts.variant = args[++i];
  }

  return opts;
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listTierCorpusFiles(corpusDir, variant = 'with-audio') {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
  if (variant !== 'with-audio' && variant !== 'complete' && variant !== 'both') {
    throw new Error(`Invalid --variant '${variant}'. Use: with-audio | complete | both`);
  }

  return all
    .filter(p => {
      const base = /tier[1-5]-complete\.json$/i.test(p);
      const withAudio = /tier[1-5]-complete\.with-audio\.json$/i.test(p);
      if (variant === 'both') return base || withAudio;
      if (variant === 'complete') return base;
      return withAudio;
    })
    .sort();
}

function englishContainsYou(english) {
  return typeof english === 'string' && /\bYou\b|\byou\b/.test(english);
}

function englishContainsThey(english) {
  return typeof english === 'string' && /\bThey\b|\bthey\b/.test(english);
}

function englishHasHint(english, hint) {
  if (typeof english !== 'string') return false;
  switch (hint) {
    case 'informal':
      return /\(informal\)/i.test(english);
    case 'formal':
      return /\(formal\)/i.test(english);
    case 'vos':
      return /\(vos\)/i.test(english);
    case 'vosotros':
      return /\(vosotros\)/i.test(english);
    case 'you_all':
      return /\bYou all\b/i.test(english);
    default:
      return false;
  }
}

function expectedHintsForSubject(subject, english) {
  // Only enforce hinting when English uses You/you.
  // For ustedes/vosotros, English might legitimately be "They".
  const usesYou = englishContainsYou(english);
  if (!usesYou) return [];

  switch (subject) {
    case 'tú':
      return ['informal'];
    case 'usted':
      return ['formal'];
    case 'ustedes':
      return ['you_all'];
    case 'vosotros':
      // Policy: express both plurality and region
      return ['you_all', 'vosotros'];
    case 'vos':
      return ['vos'];
    default:
      return [];
  }
}

function findHintMismatches(subject, english) {
  const mismatches = [];
  if (englishHasHint(english, 'informal') && subject !== 'tú') mismatches.push('informal');
  if (englishHasHint(english, 'formal') && subject !== 'usted') mismatches.push('formal');
  if (englishHasHint(english, 'vos') && subject !== 'vos') mismatches.push('vos');
  if (englishHasHint(english, 'vosotros') && subject !== 'vosotros') mismatches.push('vosotros');

  // "You all" should only appear for ustedes/vosotros.
  if (englishHasHint(english, 'you_all') && subject !== 'ustedes' && subject !== 'vosotros') mismatches.push('you_all');

  return mismatches;
}

function makeDupeKey({ verbKey, tenseKey, sentence }) {
  const subject = sentence.subject || '';
  const region = sentence.region || '';
  const spanish = sentence.spanish || '';
  const english = sentence.english || '';
  // Core identity only: ignore tags/source/quality/audio to detect true duplicates.
  return `${verbKey}||${tenseKey}||${subject}||${region}||${spanish}||${english}`;
}

function auditFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const json = JSON.parse(raw);
  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${filePath}`);
  }

  const relFile = path.relative(process.cwd(), filePath);

  const missingHints = [];
  const mismatchedHints = [];
  const dupeMap = new Map();

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];
        if (!sentence || typeof sentence !== 'object') continue;

        const subject = sentence.subject;
        const english = sentence.english;
        const spanish = sentence.spanish;

        // Missing hints
        const expected = expectedHintsForSubject(subject, english);
        if (expected.length > 0) {
          const missing = expected.filter(h => !englishHasHint(english, h));
          if (missing.length > 0) {
            missingHints.push({
              file: relFile,
              verbKey,
              tenseKey,
              index: i,
              subject,
              english,
              spanish,
              missing
            });
          }
        }

        // Mismatched hints
        const mismatches = findHintMismatches(subject, english);
        if (mismatches.length > 0) {
          mismatchedHints.push({
            file: relFile,
            verbKey,
            tenseKey,
            index: i,
            subject,
            english,
            spanish,
            mismatches
          });
        }

        // Dupes
        const key = makeDupeKey({ verbKey, tenseKey, sentence });
        const loc = {
          file: relFile,
          verbKey,
          tenseKey,
          index: i,
          subject,
          region: sentence.region || null,
          audio: sentence.audio || null
        };
        if (!dupeMap.has(key)) dupeMap.set(key, [loc]);
        else dupeMap.get(key).push(loc);
      }
    }
  }

  const duplicates = [];
  for (const [key, locs] of dupeMap.entries()) {
    if (locs.length > 1) {
      duplicates.push({ count: locs.length, locations: locs });
    }
  }

  return { missingHints, mismatchedHints, duplicates };
}

function summarizeHints(list, fieldName) {
  const counts = {};
  for (const item of list) {
    const arr = item[fieldName] || [];
    for (const x of arr) {
      counts[x] = (counts[x] || 0) + 1;
    }
  }
  return counts;
}

async function main() {
  const opts = parseArgs();
  const corpusDir = path.resolve(opts.corpusDir);

  if (!fs.existsSync(corpusDir)) {
    console.error(`Corpus dir not found: ${corpusDir}`);
    process.exit(1);
  }

  const files = listTierCorpusFiles(corpusDir, opts.variant);
  if (files.length === 0) {
    console.error(`No tier corpus files found in: ${corpusDir}`);
    process.exit(1);
  }

  const report = {
    startedAt: new Date().toISOString(),
    corpusDir: path.relative(process.cwd(), corpusDir),
    files: files.map(f => path.relative(process.cwd(), f)),
    totals: {
      filesScanned: files.length,
      missingHints: 0,
      mismatchedHints: 0,
      duplicateGroups: 0
    },
    summary: {
      missingByType: {},
      mismatchedByType: {}
    },
    findings: {
      missingHints: [],
      mismatchedHints: [],
      // Duplicates are reported per-file (within-file only).
      duplicates: []
    }
  };

  for (const f of files) {
    const { missingHints, mismatchedHints, duplicates } = auditFile(f);
    report.findings.missingHints.push(...missingHints);
    report.findings.mismatchedHints.push(...mismatchedHints);
    if (duplicates.length > 0) {
      report.findings.duplicates.push({
        file: path.relative(process.cwd(), f),
        groups: duplicates
      });
    }
  }

  report.totals.missingHints = report.findings.missingHints.length;
  report.totals.mismatchedHints = report.findings.mismatchedHints.length;
  report.totals.duplicateGroups = report.findings.duplicates.reduce((sum, x) => sum + (x.groups?.length || 0), 0);

  report.summary.missingByType = summarizeHints(report.findings.missingHints, 'missing');
  report.summary.mismatchedByType = summarizeHints(report.findings.mismatchedHints, 'mismatches');

  ensureDir(opts.report);
  fs.writeFileSync(opts.report, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nAudit corpus hints + dupes:`);
  console.log(`- Files scanned: ${report.totals.filesScanned}`);
  console.log(`- Missing hint findings: ${report.totals.missingHints}`);
  console.log(`- Mismatched hint findings: ${report.totals.mismatchedHints}`);
  console.log(`- Duplicate groups: ${report.totals.duplicateGroups}`);
  console.log(`- Report: ${opts.report}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
