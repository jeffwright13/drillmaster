#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickDeterministic(options, key) {
  if (!options || options.length === 0) return null;
  const h = hashString(String(key || ''));
  return options[h % options.length];
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    dryRun: false,
    writeReport: true,
    reportPath: null,
    corpusDir: path.join(process.cwd(), 'data', 'corpus')
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--no-report') opts.writeReport = false;
    else if (a === '--report' && args[i + 1]) { opts.reportPath = args[++i]; }
    else if (a === '--corpus-dir' && args[i + 1]) { opts.corpusDir = path.resolve(args[++i]); }
    else if (a === '--help' || a === '-h') {
      console.log(`\nUsage: node scripts/normalize-corpus-subjects.js [options]\n\nOptions:\n  --dry-run            Do not write corpus files, only report changes\n  --report <path>      Write JSON report to this path (default: ./output/normalize-corpus-subjects-report.json)\n  --no-report          Do not write report file\n  --corpus-dir <path>  Corpus dir (default: ./data/corpus)\n`);
      process.exit(0);
    }
  }

  if (!opts.reportPath) {
    opts.reportPath = path.join(process.cwd(), 'output', 'normalize-corpus-subjects-report.json');
  }

  return opts;
}

function listCorpusFiles(corpusDir) {
  const all = fs.readdirSync(corpusDir).map(f => path.join(corpusDir, f));
  return all
    .filter(p => /tier[1-5]-complete(\.with-audio)?\.json$/i.test(p))
    .sort();
}

function listExtraFiles(corpusDir) {
  const candidate = path.join(corpusDir, 'spanish-fixes-report.json');
  if (fs.existsSync(candidate)) return [candidate];
  return [];
}

function capitalizeFirst(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function resolveThirdPersonSingularChoice(sentence) {
  const subject = sentence.subject;
  const english = sentence.english || '';
  const spanish = sentence.spanish || '';
  const normalizedSubject = (subject || '').toLowerCase();
  const spanishTrimmed = spanish.trim();

  // Explicit subject wins
  if (normalizedSubject === 'él') return { choice: 'He', subject: 'él', reason: 'explicit_subject' };
  if (normalizedSubject === 'ella') return { choice: 'She', subject: 'ella', reason: 'explicit_subject' };
  if (normalizedSubject === 'usted') return { choice: 'You', subject: 'usted', reason: 'explicit_subject' };

  // Explicit Spanish pronoun wins
  if (/^Él\b/.test(spanishTrimmed)) return { choice: 'He', subject: 'él', reason: 'explicit_spanish_pronoun' };
  if (/^Ella\b/.test(spanishTrimmed)) return { choice: 'She', subject: 'ella', reason: 'explicit_spanish_pronoun' };
  if (/^Usted\b/.test(spanishTrimmed)) return { choice: 'You', subject: 'usted', reason: 'explicit_spanish_pronoun' };

  // Ambiguous bucket: choose deterministically for variety
  if (normalizedSubject === 'él/ella/usted') {
    const picked = pickDeterministic(['He', 'She', 'You'], `${english}||${spanish}||${subject}`) || 'He';
    const chosenSubject = picked === 'He' ? 'él' : picked === 'She' ? 'ella' : 'usted';
    return { choice: picked, subject: chosenSubject, reason: 'deterministic_randomization' };
  }

  // Backwards verbs often store indirect object pronouns as "subject" (me/te/le/nos/les).
  // If English still uses ambiguous He/She, choose an explicit English pronoun deterministically.
  // We do NOT change the Spanish or the indirect-pronoun subject key.
  if (normalizedSubject === 'le') {
    const picked = pickDeterministic(['He', 'She', 'You'], `${english}||${spanish}||${subject}`) || 'He';
    return { choice: picked, subject: sentence.subject, reason: 'backwards_indirect_pronoun' };
  }

  if (normalizedSubject === 'me' || normalizedSubject === 'te' || normalizedSubject === 'nos' || normalizedSubject === 'les') {
    const picked = pickDeterministic(['He', 'She'], `${english}||${spanish}||${subject}`) || 'He';
    return { choice: picked, subject: sentence.subject, reason: 'backwards_indirect_pronoun' };
  }

  // Not a case we manage
  return null;
}

function resolveThirdPersonPluralChoice(sentence) {
  const subject = sentence.subject;
  const english = sentence.english || '';
  const spanish = sentence.spanish || '';
  const normalizedSubject = (subject || '').toLowerCase();
  const spanishTrimmed = spanish.trim();

  if (normalizedSubject === 'ellos') return { choice: 'They', subject: 'ellos', reason: 'explicit_subject' };
  if (normalizedSubject === 'ellas') return { choice: 'They', subject: 'ellas', reason: 'explicit_subject' };
  if (normalizedSubject === 'ustedes') return { choice: 'You all', subject: 'ustedes', reason: 'explicit_subject' };

  if (/^Ellos\b/.test(spanishTrimmed)) return { choice: 'They', subject: 'ellos', reason: 'explicit_spanish_pronoun' };
  if (/^Ellas\b/.test(spanishTrimmed)) return { choice: 'They', subject: 'ellas', reason: 'explicit_spanish_pronoun' };
  if (/^Ustedes\b/.test(spanishTrimmed)) return { choice: 'You all', subject: 'ustedes', reason: 'explicit_spanish_pronoun' };

  if (normalizedSubject === 'ellos/ellas/ustedes') {
    const picked = pickDeterministic(['They', 'They', 'You all'], `${english}||${spanish}||${subject}`) || 'They';
    const chosenSubject = picked === 'You all'
      ? 'ustedes'
      : (pickDeterministic(['ellos', 'ellas'], `${english}||${spanish}||plural-gender`) || 'ellos');

    // If picked is "They" but gender choice is ellas/ellos, keep They.
    return { choice: picked, subject: chosenSubject, reason: 'deterministic_randomization' };
  }

  return null;
}

function adjustEnglishForYou(english) {
  // Minimal heuristics to avoid ungrammatical 3rd-person singular when converting He/She -> You.
  // This mirrors the existing generator logic; it's intentionally conservative.
  let out = english;
  out = out.replace(/\b(wants)\b/gi, m => (m[0] === 'W' ? 'Want' : 'want'));
  out = out.replace(/\b(goes)\b/gi, m => (m[0] === 'G' ? 'Go' : 'go'));
  out = out.replace(/\b(has)\b/gi, m => (m[0] === 'H' ? 'Have' : 'have'));
  out = out.replace(/\b(does)\b/gi, m => (m[0] === 'D' ? 'Do' : 'do'));
  out = out.replace(/\b(is)\b/gi, m => (m[0] === 'I' ? 'Are' : 'are'));
  return out;
}

function normalizeSubjectTags(sentence) {
  if (!Array.isArray(sentence.tags)) return;
  const subj = sentence.subject;
  sentence.tags = sentence.tags.map(t => {
    if (typeof t !== 'string') return t;
    if (t.startsWith('subject:')) {
      return `subject:${subj}`;
    }
    return t;
  });
}

function normalizeMetadataSubjects(corpusJson) {
  if (!corpusJson || !corpusJson.metadata || !Array.isArray(corpusJson.metadata.subjects)) return;

  const s = corpusJson.metadata.subjects;
  const out = [];
  for (const subj of s) {
    if (subj === 'él/ella/usted') {
      out.push('él', 'ella', 'usted');
    } else if (subj === 'ellos/ellas/ustedes') {
      out.push('ellos', 'ellas', 'ustedes');
    } else {
      out.push(subj);
    }
  }

  // Dedupe while preserving order
  const seen = new Set();
  corpusJson.metadata.subjects = out.filter(x => {
    if (seen.has(x)) return false;
    seen.add(x);
    return true;
  });
}

function applySingularNormalization(sentence) {
  const original = { ...sentence };
  const english = sentence.english || '';

  const relevant =
    /he\s*\/\s*she/i.test(english) ||
    english.includes('his/her') ||
    english.includes('His/Her') ||
    sentence.subject === 'él/ella/usted' ||
    sentence.subject === 'le' ||
    sentence.subject === 'me' ||
    sentence.subject === 'te' ||
    sentence.subject === 'nos' ||
    sentence.subject === 'les';
  if (!relevant) return null;

  const resolved = resolveThirdPersonSingularChoice(sentence);
  if (!resolved) return null;

  let newEnglish = english;
  // Replace he/she variants (He/She, he / she, he's/she's, he/she's)
  newEnglish = newEnglish.replace(/\bhe\s*\/\s*she\b/gi, resolved.choice);
  newEnglish = newEnglish.replace(/\bhe\s*\/\s*she's\b/gi, `${resolved.choice}'s`);
  newEnglish = newEnglish.replace(/\bhe's\s*\/\s*she's\b/gi, `${resolved.choice}'s`);
  newEnglish = newEnglish.replace(/\bHe\/She\b/g, resolved.choice);

  if (resolved.choice === 'He') {
    newEnglish = newEnglish.replace(/his\/her/g, 'his').replace(/His\/Her/g, 'His');
  } else if (resolved.choice === 'She') {
    newEnglish = newEnglish.replace(/his\/her/g, 'her').replace(/His\/Her/g, 'Her');
  } else if (resolved.choice === 'You') {
    newEnglish = newEnglish.replace(/his\/her/g, 'your').replace(/His\/Her/g, 'Your');
    newEnglish = adjustEnglishForYou(newEnglish);
  }

  // If the English does not start with the pronoun, keep as-is.
  // If it starts with one of the ambiguous forms, we still normalize.
  sentence.english = newEnglish;
  sentence.subject = resolved.subject;
  normalizeSubjectTags(sentence);

  const changed = sentence.english !== original.english || sentence.subject !== original.subject;
  if (!changed) return null;

  return {
    kind: 'singular',
    reason: resolved.reason,
    spanish: sentence.spanish,
    englishBefore: original.english,
    englishAfter: sentence.english,
    subjectBefore: original.subject,
    subjectAfter: sentence.subject
  };
}

function applyPluralNormalization(sentence) {
  const original = { ...sentence };
  const subject = sentence.subject;

  const relevant = subject === 'ellos/ellas/ustedes';
  if (!relevant) return null;

  const resolved = resolveThirdPersonPluralChoice(sentence);
  if (!resolved) return null;

  // Swap English subject ONLY if it starts with "They" or contains "They" in a simple way.
  // We keep this conservative to avoid breaking complex sentences.
  let newEnglish = sentence.english || '';
  if (resolved.choice === 'You all') {
    newEnglish = newEnglish
      .replace(/\bThey\b/g, 'You all')
      .replace(/\bthey\b/g, 'you all')
      .replace(/\btheir\b/g, 'your')
      .replace(/\bTheir\b/g, 'Your')
      .replace(/\bthemselves\b/g, 'yourselves')
      .replace(/\bThemselves\b/g, 'Yourselves');
  } else {
    // Ensure it's just They (no labels)
    newEnglish = newEnglish
      .replace(/They \(men\)|They \(women\)|They \(mixed\)/g, 'They');
  }

  sentence.english = newEnglish;
  sentence.subject = resolved.subject;
  normalizeSubjectTags(sentence);

  const changed = sentence.english !== original.english || sentence.subject !== original.subject;
  if (!changed) return null;

  return {
    kind: 'plural',
    reason: resolved.reason,
    spanish: sentence.spanish,
    englishBefore: original.english,
    englishAfter: sentence.english,
    subjectBefore: original.subject,
    subjectAfter: sentence.subject
  };
}

function normalizeSpanishFixesReport(json, filePath) {
  // data/corpus/spanish-fixes-report.json is a report file, not a tier corpus.
  // It contains an `examples` array of entries with an `english` field.
  const examples = Array.isArray(json)
    ? json
    : (Array.isArray(json?.examples) ? json.examples : null);
  if (!examples) return [];

  const changes = [];
  for (let i = 0; i < examples.length; i++) {
    const item = examples[i];
    if (!item || typeof item !== 'object') continue;
    if (typeof item.english !== 'string') continue;
    const before = item.english;
    const sentence = {
      subject: 'él/ella/usted',
      english: item.english,
      spanish: ''
    };
    const c = applySingularNormalization(sentence);
    if (c && sentence.english !== before) {
      item.english = sentence.english;
      changes.push({
        file: filePath,
        kind: 'report',
        reason: c.reason || 'normalize_report_english',
        index: i,
        englishBefore: before,
        englishAfter: item.english
      });
    }
  }

  return changes;
}

function walkAndNormalizeCorpus(corpusJson, filePath) {
  const changes = [];
  const verbs = corpusJson.verbs || {};

  normalizeMetadataSubjects(corpusJson);

  for (const [verbKey, verbData] of Object.entries(verbs)) {
    for (const [tenseKey, tenseData] of Object.entries(verbData)) {
      if (tenseKey === 'metadata') continue;
      if (!Array.isArray(tenseData)) continue;

      for (let i = 0; i < tenseData.length; i++) {
        const sentence = tenseData[i];
        if (!sentence || typeof sentence !== 'object') continue;

        const beforeSpanish = sentence.spanish;
        const beforeAudio = sentence.audio || null;
        const beforeTags = Array.isArray(sentence.tags) ? JSON.stringify(sentence.tags) : null;
        const beforeEnglish = sentence.english;
        const beforeSubject = sentence.subject;

        // Always normalize subject tags to match the final sentence.subject.
        // This removes leftover tags like "subject:ellos/ellas/ustedes" even when subject is already explicit.
        normalizeSubjectTags(sentence);

        const c1 = applySingularNormalization(sentence);
        const c2 = applyPluralNormalization(sentence);

        const afterTags = Array.isArray(sentence.tags) ? JSON.stringify(sentence.tags) : null;
        const tagsChanged = beforeTags !== afterTags;

        if (c1 || c2 || tagsChanged) {
          const c = c2 || c1;
          changes.push({
            file: filePath,
            verbKey,
            tenseKey,
            index: i,
            audio: beforeAudio,
            spanishChanged: sentence.spanish !== beforeSpanish,
            ...(c || {
              kind: 'tags',
              reason: 'normalize_subject_tags',
              spanish: sentence.spanish,
              englishBefore: beforeEnglish,
              englishAfter: sentence.english,
              subjectBefore: beforeSubject,
              subjectAfter: sentence.subject
            })
          });
        }
      }
    }
  }

  return changes;
}

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const opts = parseArgs();

  if (!fs.existsSync(opts.corpusDir)) {
    console.error(`Corpus dir not found: ${opts.corpusDir}`);
    process.exit(1);
  }

  const files = [...listCorpusFiles(opts.corpusDir), ...listExtraFiles(opts.corpusDir)];
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
      changes: 0,
      spanishChanged: 0
    },
    byKind: {},
    byReason: {},
    changes: []
  };

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(raw);

    const fileChanges = path.basename(filePath) === 'spanish-fixes-report.json'
      ? normalizeSpanishFixesReport(json, filePath)
      : walkAndNormalizeCorpus(json, filePath);
    if (fileChanges.length > 0) {
      report.totals.filesTouched++;
      report.totals.changes += fileChanges.length;

      for (const c of fileChanges) {
        report.byKind[c.kind] = (report.byKind[c.kind] || 0) + 1;
        report.byReason[c.reason || 'null'] = (report.byReason[c.reason || 'null'] || 0) + 1;
        if (c.spanishChanged) report.totals.spanishChanged++;
      }

      report.changes.push(...fileChanges.map(c => ({
        ...c,
        file: path.relative(process.cwd(), c.file)
      })));

      if (!opts.dryRun) {
        fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
      }
    }
  }

  report.finishedAt = new Date().toISOString();

  if (opts.writeReport) {
    ensureDir(opts.reportPath);
    fs.writeFileSync(opts.reportPath, JSON.stringify(report, null, 2));
  }

  console.log(`\nNormalize corpus subjects (${opts.dryRun ? 'DRY RUN' : 'WRITE'}):`);
  console.log(`- Files scanned: ${files.length}`);
  console.log(`- Files touched: ${report.totals.filesTouched}`);
  console.log(`- Changes: ${report.totals.changes}`);
  console.log(`- Spanish changed: ${report.totals.spanishChanged}`);
  if (opts.writeReport) {
    console.log(`- Report: ${path.relative(process.cwd(), opts.reportPath)}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
