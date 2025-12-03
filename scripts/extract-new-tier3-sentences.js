#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 3 corpus
const tier3Path = path.join(__dirname, '../data/corpus/tier3-complete.json');
const tier3Data = JSON.parse(fs.readFileSync(tier3Path, 'utf8'));

console.log('=== NEW TIER 3 IRREGULAR ESSENTIALS SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'early_departure', 'city_departure', 'train_departure', 'departure_action', 'quick_departure',
  'departure_plan', 'solo_departure', 'past_departure', 'sudden_departure', 'home_departure',
  'vacation_departure', 'clothing_action', 'emotional_state', 'happiness_change', 'shoe_wearing',
  'sadness_onset', 'coat_plan', 'happiness_prediction', 'hat_wearing', 'illness_onset',
  'comfort_achievement', 'improvement', 'wellness_feeling', 'fatigue_feeling', 'happiness_feeling',
  'improvement_feeling', 'illness_feeling', 'pride_prediction', 'relief_prediction', 'past_sadness',
  'past_confusion', 'loneliness_experience', 'support_experience', 'romantic_thought', 'deep_thinking',
  'future_planning', 'problem_consideration', 'travel_consideration', 'proposal_consideration',
  'perspective_change', 'call_consideration', 'family_thought', 'career_consideration',
  'relocation_consideration', 'language_comprehension', 'lesson_comprehension', 'problem_comprehension',
  'improving_comprehension', 'situation_comprehension', 'complete_understanding', 'quick_understanding',
  'explanation_comprehension', 'message_comprehension', 'point_comprehension', 'importance_comprehension',
  'cold_sensation', 'pain_sensation', 'music_sensation', 'heat_sensation', 'emotional_intensity',
  'nostalgia_prediction', 'relief_prediction', 'vibration_sensation', 'fear_sensation',
  'presence_sensation', 'love_sensation', 'origin_statement', 'accompaniment', 'transportation_method',
  'approach_action', 'quick_approach', 'future_visit', 'party_attendance', 'taxi_arrival',
  'surprise_arrival', 'help_arrival', 'distant_arrival', 'table_setting', 'music_playing',
  'attention_giving', 'organizing_action', 'tv_activation', 'photo_placement', 'rule_setting',
  'book_placement', 'smile_display', 'trust_placement', 'effort_investment', 'home_departure',
  'social_outing', 'work_departure', 'building_exit', 'positive_outcome', 'early_departure_plan',
  'photo_appearance', 'running_departure', 'excellent_outcome', 'doubt_resolution', 'progress_achievement'
];

let sentenceCount = 0;
const targetVerbs = ['IRSE', 'PONERSE', 'SENTIRSE', 'PENSAR', 'ENTENDER', 'SENTIR', 'VENIR', 'PONER', 'SALIR'];
const tenses = ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect'];

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');
console.log('TENSES COVERED: Present, Present-Progressive, Going-To Future, Preterite, Present-Perfect');
console.log('(Following PEDAGOGICAL_MAP.md - Simple Future optional for Tier 3)\n');

targetVerbs.forEach((verbName) => {
  const verbData = tier3Data.verbs[verbName];
  if (!verbData) return;
  
  let verbHasNewSentences = false;
  let verbSentences = [];
  
  tenses.forEach(tense => {
    const sentences = verbData[tense] || [];
    const newSentences = sentences.filter(sentence => 
      newSentenceSources.includes(sentence.source)
    );
    
    if (newSentences.length > 0) {
      verbHasNewSentences = true;
      verbSentences.push({ tense, sentences: newSentences });
    }
  });
  
  if (verbHasNewSentences) {
    console.log(`--- ${verbName} ---`);
    
    verbSentences.forEach(({ tense, sentences }) => {
      console.log(`\n${tense.toUpperCase()}:`);
      
      sentences.forEach((sentence) => {
        sentenceCount++;
        
        // Format as they appear on cards (with pronouns added if needed)
        const spanishPronouns = {
          'yo': 'Yo',
          'tú': 'Tú', 
          'él': 'Él',
          'ella': 'Ella',
          'usted': 'Usted',
          'nosotros': 'Nosotros',
          'ellos': 'Ellos',
          'ustedes': 'Ustedes',
          'vos': 'Vos',
          'vosotros': 'Vosotros',
          'ello': 'Ello'
        };
        
        const pronoun = spanishPronouns[sentence.subject] || sentence.subject;
        
        // Only add pronoun if sentence doesn't already start with it
        let spanishWithPronoun;
        if (sentence.spanish.toLowerCase().startsWith(pronoun.toLowerCase())) {
          spanishWithPronoun = sentence.spanish;
        } else {
          const firstChar = sentence.spanish.charAt(0).toLowerCase();
          const restOfSentence = sentence.spanish.slice(1);
          spanishWithPronoun = `${pronoun} ${firstChar}${restOfSentence}`;
        }
        
        // Clean English (remove disambiguation hints for ES→EN cards)
        const cleanEnglish = sentence.english
          .replace(/\s*\(informal\)/gi, '')
          .replace(/\s*\(formal\)/gi, '')
          .replace(/\s*\(vos\)/gi, '')
          .replace(/You all/g, 'You')
          .replace(/you all/g, 'you')
          .trim();
        
        console.log(`${sentenceCount}. ES→EN: "${spanishWithPronoun}" → "${cleanEnglish}"`);
        console.log(`    EN→ES: "${sentence.english}" → "${spanishWithPronoun}"`);
      });
    });
    
    console.log('\n');
  }
});

console.log(`TOTAL NEW TIER 3 SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish Tier 3 (Irregular Essentials) sentences for:');
console.log('1. Grammar accuracy (especially irregular conjugations and reflexive verbs)');
console.log('2. Natural Spanish usage (appropriate contexts for irregular verbs)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper conjugations for each tense');
console.log('\nKey irregular verbs to check:');
console.log('REFLEXIVE IRREGULARS:');
console.log('- IRSE: me voy, te vas, se va (irregular like IR)');
console.log('- PONERSE: me pongo, te pones, se pone (irregular yo form)');
console.log('- SENTIRSE: me siento, te sientes, se siente (stem change e→ie)');
console.log('\nSTEM-CHANGING VERBS:');
console.log('- PENSAR: pienso, piensas, piensa (stem change e→ie)');
console.log('- ENTENDER: entiendo, entiendes, entiende (stem change e→ie)');
console.log('- SENTIR: siento, sientes, siente (stem change e→ie)');
console.log('\nIRREGULAR VERBS:');
console.log('- VENIR: vengo, vienes, viene (irregular yo form + stem change e→ie)');
console.log('- PONER: pongo, pones, pone (irregular yo form)');
console.log('- SALIR: salgo, sales, sale (irregular yo form)');
console.log('\nPRETERITE IRREGULARS:');
console.log('- VENIR: vine, viniste, vino, vinimos, vinisteis, vinieron');
console.log('- PONER: puse, pusiste, puso, pusimos, pusisteis, pusieron');
console.log('- SENTIR: sintió, sintieron (stem change e→i in 3rd person)');
console.log('\nPRESENT PERFECT:');
console.log('- PONER: he puesto (irregular past participle)');
console.log('\nFlag any sentences that need correction or improvement.');
