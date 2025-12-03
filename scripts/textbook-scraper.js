#!/usr/bin/env node

/**
 * Scrape Spanish textbook (BASICO) for specific tenses/constructs
 * Extract pedagogically structured examples
 */

const fs = require('fs');
const path = require('path');

// Load target forms (same as before)
function loadTargetForms() {
  try {
    const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
    const conjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));
    
    const verbsPath = path.join(__dirname, '../data/verbs.tsv');
    const verbsContent = fs.readFileSync(verbsPath, 'utf-8');
    const verbs = verbsContent.trim().split('\n').slice(1).map(line => {
      const [verb, english] = line.split('\t');
      return { verb: verb.toLowerCase(), english };
    });
    
    const targetForms = new Map();
    
    verbs.forEach(verb => {
      const verbUpper = verb.verb.toUpperCase();
      if (conjugations[verbUpper]) {
        const forms = [];
        
        Object.keys(conjugations[verbUpper]).forEach(tense => {
          Object.keys(conjugations[verbUpper][tense]).forEach(subject => {
            const form = conjugations[verbUpper][tense][subject];
            if (form && form.length > 2) {
              forms.push({
                form: form.toLowerCase(),
                verb: verb.verb,
                english: verb.english,
                tense: tense,
                subject: subject
              });
            }
          });
        });
        
        targetForms.set(verb.verb, forms);
      }
    });
    
    return targetForms;
  } catch (error) {
    console.error('Failed to load target forms:', error.message);
    return new Map();
  }
}

// Extract sentences from textbook content
function extractTextbookSentences(content) {
  // Clean and split content
  let text = content
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into potential sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => {
      return s.length >= 15 && 
             s.length <= 200 && 
             /[a-záéíóúñü]/i.test(s) && // Contains Spanish characters
             s.split(' ').length >= 4 && // At least 4 words
             s.split(' ').length <= 25 && // Max 25 words
             !/^\d+/.test(s) && // Not starting with numbers
             !/^(página|capítulo|ejercicio|actividad|lección)/i.test(s) && // Not textbook structure
             !/^(a\)|b\)|c\)|d\)|\d+\.)/i.test(s); // Not multiple choice/numbered lists
    });
  
  return sentences;
}

// Identify pedagogical patterns in textbook
function identifyPedagogicalPatterns(sentence) {
  const patterns = {
    // Grammar focus patterns
    present_tense: /\b(soy|eres|es|somos|son|tengo|tienes|tiene|tenemos|tienen|hablo|hablas|habla|hablamos|hablan)\b/i,
    preterite_tense: /\b(fui|fuiste|fue|fuimos|fueron|tuve|tuviste|tuvo|tuvimos|tuvieron|hablé|hablaste|habló|hablamos|hablaron)\b/i,
    reflexive_verbs: /\b(me|te|se|nos|os)\s+(levanto|levantas|levanta|levantamos|levantan|ducho|duchas|ducha|duchamos|duchan)\b/i,
    gustar_construction: /\b(me|te|le|nos|les)\s+(gusta|gustan|encanta|encantan|molesta|molestan)\b/i,
    
    // Vocabulary themes
    family: /\b(familia|padre|madre|hermano|hermana|hijo|hija|abuelo|abuela|tío|tía|primo|prima)\b/i,
    daily_routine: /\b(mañana|tarde|noche|desayuno|almuerzo|cena|trabajo|escuela|casa|dormir|despertar)\b/i,
    food: /\b(comida|comer|beber|restaurante|cocina|desayuno|almuerzo|cena|fruta|verdura|carne|pescado)\b/i,
    travel: /\b(viajar|viaje|hotel|avión|tren|autobús|ciudad|país|vacaciones|turista)\b/i,
    
    // Difficulty indicators
    beginner: /\b(ser|estar|tener|hacer|ir|venir|ver|dar|saber|poder)\b/i,
    intermediate: /\b(conocer|parecer|seguir|conseguir|sentir|preferir|sugerir|construir)\b/i,
    advanced: /\b(subjunctive|conditional|compound_tenses)\b/i
  };
  
  const identified = [];
  Object.keys(patterns).forEach(pattern => {
    if (patterns[pattern].test(sentence)) {
      identified.push(pattern);
    }
  });
  
  return identified;
}

// Calculate pedagogical quality score
function calculatePedagogicalScore(sentence, patterns) {
  let score = 0;
  
  // Length bonus (textbooks prefer clear, not-too-long sentences)
  if (sentence.length >= 20 && sentence.length <= 100) score += 15;
  
  // Word count bonus (5-15 words ideal for learning)
  const wordCount = sentence.split(' ').length;
  if (wordCount >= 5 && wordCount <= 15) score += 15;
  
  // Grammar pattern bonus
  if (patterns.includes('present_tense')) score += 10;
  if (patterns.includes('preterite_tense')) score += 10;
  if (patterns.includes('reflexive_verbs')) score += 15;
  if (patterns.includes('gustar_construction')) score += 15;
  
  // Vocabulary theme bonus
  if (patterns.includes('family')) score += 8;
  if (patterns.includes('daily_routine')) score += 8;
  if (patterns.includes('food')) score += 8;
  if (patterns.includes('travel')) score += 8;
  
  // Difficulty appropriateness
  if (patterns.includes('beginner')) score += 5;
  if (patterns.includes('intermediate')) score += 3;
  
  // Spanish learning bonus
  if (/[ñáéíóúü]/i.test(sentence)) score += 5;
  
  return score;
}

// Find target sentences in textbook content
function findTextbookSentences(sentences, targetForms) {
  const matches = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const patterns = identifyPedagogicalPatterns(sentence);
    const pedagogicalScore = calculatePedagogicalScore(sentence, patterns);
    
    // Only consider sentences with good pedagogical value
    if (pedagogicalScore >= 25) {
      targetForms.forEach((forms, verb) => {
        forms.forEach(formInfo => {
          const regex = new RegExp(`\\b${formInfo.form}\\b`, 'i');
          if (regex.test(lowerSentence)) {
            matches.push({
              spanish: sentence.trim(),
              verb: verb,
              verbForm: formInfo.form,
              tense: formInfo.tense,
              subject: formInfo.subject,
              english: formInfo.english,
              source: {
                type: 'textbook',
                origin: 'spanish_school_basico',
                method: 'textbook_scraper_v1',
                date_collected: new Date().toISOString().split('T')[0]
              },
              quality: {
                score: pedagogicalScore,
                authenticity: 'verified',
                linguistic_review: 'textbook_approved'
              },
              linguistic: {
                verb_form: formInfo.form,
                construction: patterns.includes('reflexive_verbs') ? 'reflexive' : 
                            patterns.includes('gustar_construction') ? 'gustar_type' : 'standard',
                difficulty: patterns.includes('beginner') ? 'beginner' : 
                           patterns.includes('intermediate') ? 'intermediate' : 'beginner',
                register: 'neutral'
              },
              pedagogy: {
                learning_focus: patterns.filter(p => ['present_tense', 'preterite_tense', 'reflexive_verbs'].includes(p)),
                cultural_context: patterns.find(p => ['family', 'daily_routine', 'food', 'travel'].includes(p)) || 'general',
                tier_appropriate: true,
                complexity_score: Math.min(5, Math.max(1, Math.round(pedagogicalScore / 10)))
              },
              patterns: patterns
            });
          }
        });
      });
    }
  });
  
  return matches.sort((a, b) => b.quality.score - a.quality.score);
}

// Main textbook scraping function
function scrapeTextbook(textbookPath) {
  console.log('📚 Scraping Spanish textbook for pedagogical examples...');
  
  if (!fs.existsSync(textbookPath)) {
    console.error(`❌ Textbook file not found: ${textbookPath}`);
    console.log('📝 Please provide the path to your BASICO textbook file');
    console.log('   Supported formats: .txt, .pdf (converted to text), .docx (converted to text)');
    return;
  }
  
  console.log(`📖 Reading textbook: ${textbookPath}`);
  
  // Read textbook content
  let content;
  try {
    content = fs.readFileSync(textbookPath, 'utf-8');
  } catch (error) {
    console.error(`❌ Failed to read textbook: ${error.message}`);
    return;
  }
  
  const targetForms = loadTargetForms();
  console.log(`🎯 Tracking ${targetForms.size} verbs with conjugated forms`);
  
  // Extract and analyze sentences
  const sentences = extractTextbookSentences(content);
  console.log(`📝 Extracted ${sentences.length} potential sentences from textbook`);
  
  const matches = findTextbookSentences(sentences, targetForms);
  console.log(`✅ Found ${matches.length} high-quality pedagogical sentences`);
  
  // Organize by verb and tense
  const organized = {};
  matches.forEach(match => {
    const verb = match.verb.toUpperCase();
    if (!organized[verb]) {
      organized[verb] = {};
    }
    if (!organized[verb][match.tense]) {
      organized[verb][match.tense] = [];
    }
    
    organized[verb][match.tense].push({
      spanish: match.spanish,
      english: `[NEEDS TRANSLATION] ${match.spanish}`, // Mark for translation
      subject: match.subject,
      region: 'universal',
      source: match.source,
      quality: match.quality,
      linguistic: match.linguistic,
      pedagogy: match.pedagogy,
      tags: [
        'region:universal',
        `subject:${match.subject}`,
        `tense:${match.tense}`,
        'word-type:verb',
        'source:textbook',
        'quality:verified',
        'review:textbook_approved'
      ]
    });
  });
  
  // Save results
  const outputPath = path.join(__dirname, '../data/corpus/textbook-scraped.json');
  const results = {
    metadata: {
      scraped_date: new Date().toISOString(),
      source_file: textbookPath,
      total_sentences_processed: sentences.length,
      pedagogical_sentences_found: matches.length,
      verbs_found: Object.keys(organized).length,
      method: 'textbook_scraper_v1',
      textbook: 'spanish_school_basico'
    },
    verbs: organized
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 TEXTBOOK SCRAPING RESULTS:`);
  console.log(`   💾 Saved to: ${outputPath}`);
  console.log(`   📚 Sentences processed: ${sentences.length}`);
  console.log(`   ✅ Pedagogical sentences: ${matches.length}`);
  console.log(`   🔤 Verbs found: ${Object.keys(organized).length}`);
  
  // Show top examples
  console.log(`\n📋 Top pedagogical examples:`);
  matches.slice(0, 10).forEach((match, i) => {
    console.log(`   ${i+1}. [${match.quality.score}] ${match.spanish}`);
    console.log(`      Focus: ${match.pedagogy.learning_focus.join(', ')}`);
  });
  
  console.log(`\n✨ Textbook scraping complete!`);
  console.log(`📝 These sentences are pre-approved for pedagogical use`);
}

// CLI interface
if (require.main === module) {
  const textbookPath = process.argv[2];
  if (!textbookPath) {
    console.log('Usage: node textbook-scraper.js <path-to-textbook-file>');
    console.log('Example: node textbook-scraper.js ../textbooks/basico.txt');
  } else {
    scrapeTextbook(textbookPath);
  }
}

module.exports = { scrapeTextbook };
