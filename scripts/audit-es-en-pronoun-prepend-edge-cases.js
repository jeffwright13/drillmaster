#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function loadVerbTags(baseDir) {
  const tsvPath = path.join(baseDir, 'data', 'verbs.tsv');
  if (!fs.existsSync(tsvPath)) return new Map();
  const lines = fs.readFileSync(tsvPath, 'utf8').split('\n');
  const map = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const [verb, _english, tagsRaw] = line.split('\t');
    if (!verb) continue;
    const tags = {};
    if (tagsRaw) {
      tagsRaw.split(';').forEach(t => {
        const [k, v] = t.split(':');
        if (k && v) tags[k.trim()] = v.trim();
      });
    }
    map.set(verb.toUpperCase(), tags);
  }
  return map;
}

function isReflexiveVerb(verbKey, verbTags) {
  const tags = verbTags.get(String(verbKey || '').toUpperCase());
  return tags?.reflexive === 'true' || tags?.reflexive === true;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    corpusDir: 'data/corpus',
    variant: 'with-audio', // with-audio | complete | both
    report: 'output/reports/audit-es-en-pronoun-prepend-edge-cases.json'
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--corpus-dir' && args[i + 1]) opts.corpusDir = args[++i];
    else if (a === '--variant' && args[i + 1]) opts.variant = args[++i];
    else if (a === '--report' && args[i + 1]) opts.report = args[++i];
  }
  if (!['with-audio', 'complete', 'both'].includes(opts.variant)) {
    throw new Error(`Invalid --variant '${opts.variant}'. Use: with-audio | complete | both`);
  }

  return opts;
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function listTierCorpusFiles(corpusDir, variant) {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
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

function subjectNeedsPrepend(subject) {
  const s = (subject || '').toLowerCase();
  return s === 'él' || s === 'ella' || s === 'usted' || s === 'ellos' || s === 'ellas' || s === 'ustedes';
}

function startsWithQuestionOrBang(spanish) {
  return typeof spanish === 'string' && (/^¿/.test(spanish.trim()) || /^¡/.test(spanish.trim()));
}

function startsWithSe(spanish) {
  return typeof spanish === 'string' && /^Se\b/i.test(spanish.trim());
}

function startsWithSeCliticCluster(spanish) {
  return typeof spanish === 'string' && /^(¿\s*)?Se\s+(me|te|se|lo|la|le|nos|os|les)\b/i.test(spanish.trim());
}

function startsWithImpersonalStarters(spanish) {
  // Not exhaustive, but common impersonal/existential/weather starters.
  // (These are candidates for skipPronounPrepend.)
  return typeof spanish === 'string' && /^(Hay|Hace|Hubo|Hab\u00eda|Hab\u00edan|Es|Son)\b/i.test(spanish.trim());
}

function hasUstedEarly(spanish) {
  if (typeof spanish !== 'string') return false;
  const normalized = spanish.replace(/^[¿¡]/, '').trim().toLowerCase();
  const firstWords = normalized.split(/\s+/).slice(0, 3);
  return firstWords.includes('usted') || firstWords.includes('ustedes') || firstWords.includes('\u00e9l') || firstWords.includes('ella') || firstWords.includes('ellos') || firstWords.includes('ellas');
}

function makeFinding({ type, file, verbKey, tenseKey, index, sentence, note }) {
  return {
    type,
    file,
    verbKey,
    tenseKey,
    index,
    subject: sentence.subject,
    region: sentence.region || null,
    spanish: sentence.spanish,
    english: sentence.english,
    audio: sentence.audio || null,
    skipPronounPrepend: !!sentence.skipPronounPrepend,
    note: note || null,
    action: type === 'high_confidence_impersonal_se' || type === 'se_clitic_cluster' || type === 'impersonal_starter'
      ? 'set skipPronounPrepend=true'
      : 'review'
  };
}

function auditFile(filePath, verbTags) {
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const verbs = json?.verbs;
  if (!verbs || typeof verbs !== 'object') {
    throw new Error(`Unexpected corpus shape (missing verbs) in ${filePath}`);
  }

  const relFile = path.relative(process.cwd(), filePath);
  const findings = [];

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData || {})) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];
        if (!sentence || typeof sentence !== 'object') continue;
        if (!subjectNeedsPrepend(sentence.subject)) continue;
        const spanish = sentence.spanish || '';
        const reflexive = isReflexiveVerb(verbKey, verbTags);

        // Candidates that are likely to be wrong/awkward when we prepend.
        if (!sentence.skipPronounPrepend && startsWithSeCliticCluster(spanish)) {
          findings.push(makeFinding({
            type: 'se_clitic_cluster',
            file: relFile,
            verbKey,
            tenseKey,
            index: i,
            sentence,
            note: 'Starts with "Se" + clitic (often impersonal/passive or complex clitic cluster). Consider skipPronounPrepend.'
          }));
        }

        if (!sentence.skipPronounPrepend && startsWithSe(spanish) && !startsWithSeCliticCluster(spanish)) {
          if (!reflexive) {
            findings.push(makeFinding({
              type: 'high_confidence_impersonal_se',
              file: relFile,
              verbKey,
              tenseKey,
              index: i,
              sentence,
              note: 'Starts with "Se" for a NON-reflexive verb; high-confidence impersonal/passive candidate.'
            }));
          }
          // For reflexive verbs, plain "Se ..." is common and usually OK; too noisy to report by default.
        }

        if (!sentence.skipPronounPrepend && startsWithImpersonalStarters(spanish)) {
          findings.push(makeFinding({
            type: 'impersonal_starter',
            file: relFile,
            verbKey,
            tenseKey,
            index: i,
            sentence,
            note: 'Starts with common impersonal/existential/weather pattern. Likely should not get a pronoun prepended.'
          }));
        }

        // Intentionally not reporting leading punctuation / explicit pronoun presence by default:
        // - These are very common and mostly informational.
        // - The generator already avoids double-pronouns by checking early tokens.
      }
    }
  }

  return findings;
}

function summarize(findings) {
  const byType = {};
  for (const f of findings) {
    byType[f.type] = (byType[f.type] || 0) + 1;
  }
  return byType;
}

async function main() {
  const opts = parseArgs();
  const corpusDir = path.resolve(opts.corpusDir);
  const baseDir = path.resolve(__dirname, '..');
  const verbTags = loadVerbTags(baseDir);

  const files = listTierCorpusFiles(corpusDir, opts.variant);
  if (files.length === 0) {
    console.error(`No tier corpus files found in: ${corpusDir}`);
    process.exit(1);
  }

  const allFindings = [];
  for (const f of files) {
    allFindings.push(...auditFile(f, verbTags));
  }

  const report = {
    startedAt: new Date().toISOString(),
    corpusDir: path.relative(process.cwd(), corpusDir),
    variant: opts.variant,
    files: files.map(f => path.relative(process.cwd(), f)),
    totals: {
      filesScanned: files.length,
      findings: allFindings.length
    },
    summary: {
      byType: summarize(allFindings)
    },
    findings: allFindings
  };

  const reportPath = path.resolve(opts.report);
  ensureDirForFile(reportPath);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

  console.log(`\nAudit ES→EN pronoun-prepend edge cases:`);
  console.log(`- Files scanned: ${report.totals.filesScanned}`);
  console.log(`- Findings: ${report.totals.findings}`);
  console.log(`- Report: ${opts.report}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
