#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 2 corpus
const tier2Path = path.join(__dirname, '../data/corpus/tier2-complete.json');
const tier2Data = JSON.parse(fs.readFileSync(tier2Path, 'utf8'));

console.log('=== NEW TIER 2 DAILY ROUTINES SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'furniture_use', 'seating_preference', 'group_seating', 'sitting_action', 'slow_sitting',
  'seating_plan', 'companion_seating', 'past_seating', 'close_seating', 'bedtime_routine',
  'late_bedtime', 'specific_bedtime', 'bedtime_action', 'current_bedtime', 'bedtime_plan',
  'early_bedtime_plan', 'late_bedtime_past', 'tired_bedtime', 'morning_routine', 'natural_waking',
  'early_waking', 'waking_process', 'gradual_waking', 'early_wake_plan', 'late_wake_plan',
  'past_waking', 'noise_waking', 'quick_dressing', 'good_dressing', 'color_preference',
  'dressing_action', 'party_preparation', 'elegant_dressing_plan', 'comfortable_dressing',
  'rushed_dressing', 'elegant_past_dressing', 'early_rising', 'bed_rising', 'energetic_rising',
  'rising_action', 'slow_rising', 'rising_plan', 'late_rising_plan', 'very_early_rising',
  'painful_rising', 'tv_watching', 'movie_watching', 'friend_meeting', 'news_watching',
  'program_watching', 'movie_plan', 'family_visit_plan', 'documentary_viewing', 'game_watching',
  'gift_giving', 'advice_giving', 'gratitude_expression', 'teaching_action', 'walking_action',
  'gift_plan', 'party_plan', 'opinion_sharing', 'surprise_giving', 'truth_telling',
  'interesting_speech', 'joke_telling', 'important_speech', 'truth_speaking', 'name_introduction',
  'affirmative_response', 'greeting', 'farewell', 'language_knowledge', 'cooking_skill',
  'answer_knowledge', 'learning_process', 'truth_discovery', 'driving_skill_plan', 'swimming_skill_plan',
  'news_discovery', 'truth_discovery_past', 'key_finding', 'deal_finding', 'time_finding',
  'problem_discovery', 'solution_discovery', 'job_search_plan', 'love_finding_plan', 'money_discovery',
  'solution_discovery_past'
];

let sentenceCount = 0;
const targetVerbs = ['SENTARSE', 'ACOSTARSE', 'DESPERTARSE', 'VESTIRSE', 'LEVANTARSE', 'VER', 'DAR', 'DECIR', 'SABER', 'ENCONTRAR'];
const tenses = ['present', 'present-progressive', 'going-to', 'preterite'];

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');
console.log('TENSES COVERED: Present, Present-Progressive, Going-To Future, Preterite');
console.log('(Following PEDAGOGICAL_MAP.md - no Present Perfect or Simple Future for Tier 2)\n');

targetVerbs.forEach((verbName) => {
  const verbData = tier2Data.verbs[verbName];
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
          'vosotros': 'Vosotros'
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

console.log(`TOTAL NEW TIER 2 SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish Tier 2 (Daily Routines) sentences for:');
console.log('1. Grammar accuracy (especially reflexive pronouns and irregular verbs)');
console.log('2. Natural Spanish usage (appropriate daily routine contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper conjugations for each tense');
console.log('\nKey areas to check:');
console.log('REFLEXIVE VERBS:');
console.log('- SENTARSE: me siento, te sientas, se sienta, nos sentamos, os sentáis, se sientan');
console.log('- ACOSTARSE: me acuesto, te acuestas, se acuesta (stem change o→ue)');
console.log('- DESPERTARSE: me despierto, te despiertas, se despierta (stem change e→ie)');
console.log('- VESTIRSE: me visto, te vistes, se viste (stem change e→i)');
console.log('- LEVANTARSE: me levanto, te levantas, se levanta (regular)');
console.log('\nIRREGULAR VERBS:');
console.log('- VER: veo, ves, ve (irregular yo form)');
console.log('- DAR: doy, das, da (irregular yo form)');
console.log('- DECIR: digo, dices, dice (irregular yo form + stem change e→i)');
console.log('- SABER: sé, sabes, sabe (irregular yo form)');
console.log('- ENCONTRAR: encuentro, encuentras, encuentra (stem change o→ue)');
console.log('\nPRETERITE IRREGULARS:');
console.log('- DAR: di, diste, dio, dimos, disteis, dieron');
console.log('- DECIR: dije, dijiste, dijo, dijimos, dijisteis, dijeron');
console.log('- SABER: supe, supiste, supo, supimos, supisteis, supieron');
console.log('\nFlag any sentences that need correction or improvement.');
