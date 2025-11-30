#!/usr/bin/env node

/**
 * Generate complete Anki deck for Spanish verb conjugation
 * Creates TSV file with present, preterite, and future tenses for all 42 verbs
 */

const fs = require('fs');
const path = require('path');

// Load verb data
const verbsPath = path.join(__dirname, '../data/verbs.tsv');
const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
const corpusDir = path.join(__dirname, '../data/corpus');

// Parse verbs TSV
function parseVerbsTSV(tsvContent) {
  const lines = tsvContent.trim().split('\n');
  const headers = lines[0].split('\t');
  
  return lines.slice(1).map((line, index) => {
    const values = line.split('\t');
    const verb = {
      id: index + 1,
      verb: values[0],
      english: values[1],
      tags: {}
    };
    
    // Parse tags
    if (values[2]) {
      values[2].split(';').forEach(tag => {
        const [key, value] = tag.split(':');
        verb.tags[key] = value || true;
      });
    }
    
    return verb;
  });
}

// Load corpus data from files
function loadCorpusData() {
  const corpus = {};
  
  try {
    // Load clean manually curated corpus
    const cleanPath = path.join(corpusDir, 'clean-corpus.json');
    if (fs.existsSync(cleanPath)) {
      const cleanData = JSON.parse(fs.readFileSync(cleanPath, 'utf-8'));
      Object.assign(corpus, cleanData);
      console.log(`📚 Loaded clean corpus data for ${Object.keys(cleanData).length} verbs`);
    } else {
      console.warn('⚠️  Clean corpus not found, falling back to individual files');
      // Fallback to individual files
      const corpusFiles = ['tier1-verbs.json', 'tier2-verbs.json', 'tier3-verbs.json', 'tier4-verbs.json'];
      corpusFiles.forEach(filename => {
        const filePath = path.join(corpusDir, filename);
        if (fs.existsSync(filePath)) {
          try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            Object.assign(corpus, data);
          } catch (error) {
            console.warn(`Warning: Could not parse ${filename}: ${error.message}`);
          }
        }
      });
    }
    
    console.log(`📚 Loaded corpus data for ${Object.keys(corpus).length} verbs`);
    return corpus;
  } catch (error) {
    console.error('Error loading corpus data:', error.message);
    return {};
  }
}

// Get sentence from corpus or fallback
function getSentenceFromCorpus(corpus, verb, tense, subject, conjugatedForm) {
  const verbName = verb.verb;
  
  // Try to get from corpus first
  if (corpus[verbName] && corpus[verbName][tense]) {
    const sentences = corpus[verbName][tense];
    const matchingSentences = sentences.filter(s => s.subject === subject);
    
    if (matchingSentences.length > 0) {
      // Return random matching sentence
      const randomSentence = matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
      return {
        spanish: randomSentence.spanish,
        english: randomSentence.english,
        region: randomSentence.region || 'universal',
        source: randomSentence.source || 'corpus'
      };
    }
  }
  
  // Fallback: generate basic sentence (this should be rare with good corpus)
  console.warn(`⚠️  No corpus data for ${verbName} ${tense} ${subject} - using fallback`);
  
  const isReflexive = verbName.endsWith('SE');
  const subjectPronouns = {
    yo: "Yo",
    tú: "Tú",
    vos: "Vos", 
    "él/ella/usted": "Él",
    nosotros: "Nosotros",
    vosotros: "Vosotros",
    "ellos/ellas/ustedes": "Ellos"
  };
  
  const pronoun = subjectPronouns[subject];
  
  if (isReflexive) {
    const reflexivePronouns = { 
      yo: "me", tú: "te", vos: "te", "él/ella/usted": "se", 
      nosotros: "nos", vosotros: "os", "ellos/ellas/ustedes": "se" 
    };
    const refPronoun = reflexivePronouns[subject];
    
    // Proper English conjugation for reflexive verbs
    const englishSubjects = {
      yo: "I", tú: "You", vos: "You", "él/ella/usted": "He/She",
      nosotros: "We", vosotros: "You all", "ellos/ellas/ustedes": "They"
    };
    
    let englishVerb = verb.english.replace('to ', '').replace(' up', '').replace(' down', '');
    if (tense === 'present' && subject === 'él/ella/usted') {
      englishVerb += 's';
    } else if (tense === 'preterite') {
      englishVerb = englishVerb.endsWith('e') ? englishVerb + 'd' : englishVerb + 'ed';
    } else if (tense === 'future') {
      englishVerb = 'will ' + englishVerb;
    }
    
    return {
      spanish: `${pronoun} ${refPronoun} ${conjugatedForm}.`,
      english: `${englishSubjects[subject]} ${englishVerb}.`,
      region: 'universal',
      source: 'fallback'
    };
  } else if (verbName === 'GUSTAR') {
    const indirectPronouns = { 
      yo: "me", tú: "te", vos: "te", "él/ella/usted": "le", 
      nosotros: "nos", vosotros: "os", "ellos/ellas/ustedes": "les" 
    };
    const indPronoun = indirectPronouns[subject];
    
    const englishSubjects = {
      yo: "I", tú: "You", vos: "You", "él/ella/usted": "He/She",
      nosotros: "We", vosotros: "You all", "ellos/ellas/ustedes": "They"
    };
    
    let englishVerb = "like";
    if (tense === 'preterite') {
      englishVerb = "liked";
    } else if (tense === 'future') {
      englishVerb = "will like";
    } else if (tense === 'present' && subject === 'él/ella/usted') {
      englishVerb = "likes";
    }
    
    return {
      spanish: `${indPronoun.charAt(0).toUpperCase() + indPronoun.slice(1)} ${conjugatedForm} esto.`,
      english: `${englishSubjects[subject]} ${englishVerb} this.`,
      region: 'universal',
      source: 'fallback'
    };
  } else {
    // Regular verbs
    const englishSubjects = {
      yo: "I", tú: "You", vos: "You", "él/ella/usted": "He/She",
      nosotros: "We", vosotros: "You all", "ellos/ellas/ustedes": "They"
    };
    
    let englishVerb = verb.english.replace('to ', '');
    if (tense === 'present' && subject === 'él/ella/usted') {
      englishVerb += 's';
    } else if (tense === 'preterite') {
      englishVerb = englishVerb.endsWith('e') ? englishVerb + 'd' : englishVerb + 'ed';
    } else if (tense === 'future') {
      englishVerb = 'will ' + englishVerb;
    }
    
    return {
      spanish: `${pronoun} ${conjugatedForm}.`,
      english: `${englishSubjects[subject]} ${englishVerb}.`,
      region: 'universal',
      source: 'fallback'
    };
  }
}

// Generate English translation
function generateEnglishTranslation(verb, tense, subject, spanishSentence) {
  const englishVerb = verb.english.replace('to ', '');
  const subjectPronouns = {
    yo: "I",
    tú: "You", 
    "él/ella/usted": spanishSentence.startsWith("Él") ? "He" : spanishSentence.startsWith("Ella") ? "She" : "You",
    nosotros: "We",
    "ellos/ellas/ustedes": spanishSentence.startsWith("Ellos") ? "They" : "They"
  };
  
  // Simple English conjugation
  let englishConjugated = englishVerb;
  if (tense === 'present' && (subject === 'él/ella/usted')) {
    englishConjugated += 's';
  } else if (tense === 'preterite') {
    englishConjugated = englishVerb.endsWith('e') ? englishVerb + 'd' : englishVerb + 'ed';
  } else if (tense === 'future') {
    englishConjugated = 'will ' + englishVerb;
  }
  
  return `${subjectPronouns[subject]} ${englishConjugated}.`;
}

// Create cloze deletion
function createCloze(sentence, conjugatedForm, verb) {
  if (verb.verb.endsWith('SE')) {
    // Handle reflexive verbs - look for pronoun + verb combinations
    const reflexivePronouns = { 
      yo: 'me', tú: 'te', vos: 'te', 'él/ella/usted': 'se', 
      nosotros: 'nos', vosotros: 'os', 'ellos/ellas/ustedes': 'se' 
    };
    
    // Try all possible reflexive patterns
    for (const pronoun of Object.values(reflexivePronouns)) {
      const pattern = `${pronoun} ${conjugatedForm}`;
      if (sentence.includes(pattern)) {
        return sentence.replace(pattern, `{{c1::${pattern}}}`);
      }
    }
  } else if (verb.verb === 'GUSTAR') {
    // Handle GUSTAR construction - look for pronoun + gusta/gustan
    const patterns = [
      'me gusta', 'te gusta', 'le gusta', 'nos gusta', 'les gusta', 
      'me gustan', 'te gustan', 'le gustan', 'nos gustan', 'les gustan'
    ];
    for (const pattern of patterns) {
      if (sentence.toLowerCase().includes(pattern)) {
        const regex = new RegExp(pattern, 'gi');
        return sentence.replace(regex, `{{c1::${pattern}}}`);
      }
    }
  }
  
  // Regular verbs - find the conjugated form anywhere in the sentence
  if (sentence.includes(conjugatedForm)) {
    return sentence.replace(conjugatedForm, `{{c1::${conjugatedForm}}}`);
  }
  
  // Fallback: if exact form not found, try case-insensitive
  const regex = new RegExp(conjugatedForm, 'gi');
  if (regex.test(sentence)) {
    return sentence.replace(regex, `{{c1::${conjugatedForm}}}`);
  }
  
  // Last resort: just wrap the whole sentence (shouldn't happen with good corpus)
  console.warn(`⚠️  Could not find "${conjugatedForm}" in "${sentence}"`);
  return `{{c1::${sentence}}}`;
}

// Main generation function
async function generateAnkiDeck(options = {}) {
  console.log('🎯 Generating complete Anki deck for Spanish verb conjugation...\n');
  
  const {
    includeRegions = ['universal', 'argentina', 'spain'], // Filter by regions
    includeTenses = ['present', 'preterite', 'future'],
    includeSubjects = ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes']
  } = options;
  
  // Load data
  const verbsContent = fs.readFileSync(verbsPath, 'utf-8');
  const verbs = parseVerbsTSV(verbsContent);
  
  const conjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));
  const corpus = loadCorpusData();
  
  const cards = [];
  let corpusHits = 0;
  let fallbackUsed = 0;
  
  // Generate cards for each verb
  verbs.forEach(verb => {
    console.log(`Generating cards for ${verb.verb}...`);
    
    includeTenses.forEach(tense => {
      includeSubjects.forEach(subject => {
        const verbConjugations = conjugations[verb.verb];
        if (verbConjugations && verbConjugations[tense] && verbConjugations[tense][subject]) {
          const conjugatedForm = verbConjugations[tense][subject];
          
          // Get sentence from corpus
          const sentenceData = getSentenceFromCorpus(corpus, verb, tense, subject, conjugatedForm);
          
          // Track corpus usage
          if (sentenceData.source === 'corpus') {
            corpusHits++;
          } else {
            fallbackUsed++;
          }
          
          // Filter by region
          if (!includeRegions.includes(sentenceData.region)) {
            return; // Skip this card
          }
          
          // Create cloze deletion
          const clozeCard = createCloze(sentenceData.spanish, conjugatedForm, verb);
          
          // Create card with regional info
          const regionTag = sentenceData.region !== 'universal' ? ` (${sentenceData.region})` : '';
          const prompt = `<div style="margin-bottom: 0.5em; font-size: 0.9em; color: #999;"><strong>${verb.verb}</strong> - ${tense}${regionTag}</div>`;
          const front = `${prompt}${clozeCard}`;
          const back = `<div style="margin-top: 1em; font-size: 0.85em; color: #999;"><em>${sentenceData.english}</em></div>`;
          const extra = `${verb.verb} (${verb.english})`;
          
          // Enhanced tags with regional info
          let tags = `tier:${verb.tags.tier};${verb.tags.regularity};${tense};region:${sentenceData.region}`;
          if (subject === 'vos') tags += ';vos';
          if (subject === 'vosotros') tags += ';vosotros';
          
          cards.push([front, back, extra, tags].join('\t'));
        }
      });
    });
  });
  
  // Write TSV file
  const tsvContent = cards.join('\n');
  const outputPath = path.join(__dirname, '../output/spanish-verb-conjugation-deck.tsv');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, tsvContent);
  
  // Statistics
  console.log(`\n✅ Generated ${cards.length} cards`);
  console.log(`📚 Corpus sentences used: ${corpusHits}`);
  console.log(`⚠️  Fallback sentences: ${fallbackUsed}`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  // Regional breakdown
  const regionCounts = {};
  cards.forEach(card => {
    const tags = card.split('\t')[3];
    const regionMatch = tags.match(/region:(\w+)/);
    if (regionMatch) {
      const region = regionMatch[1];
      regionCounts[region] = (regionCounts[region] || 0) + 1;
    }
  });
  
  console.log('\n🌍 Regional distribution:');
  Object.entries(regionCounts).forEach(([region, count]) => {
    console.log(`   ${region}: ${count} cards`);
  });
  
  console.log('\n🎯 Ready to import into Anki!');
  console.log('   1. Open Anki');
  console.log('   2. File → Import');
  console.log('   3. Select the TSV file');
  console.log('   4. Choose "DrillMaster Spanish Verb Cloze" note type');
  console.log('   5. Import!');
  
  console.log('\n🏷️  Filter by tags in Anki:');
  console.log('   • Universal Spanish: tag:region:universal');
  console.log('   • Argentine Spanish: tag:region:argentina tag:vos');
  console.log('   • Spain Spanish: tag:region:spain tag:vosotros');
  console.log('   • Present tense only: tag:present');
  console.log('   • Tier 1 verbs: tag:tier:1');
}

// Run if called directly
if (require.main === module) {
  generateAnkiDeck().catch(console.error);
}

module.exports = { generateAnkiDeck };
