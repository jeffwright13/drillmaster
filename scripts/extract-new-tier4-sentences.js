#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 4 corpus
const tier4Path = path.join(__dirname, '../data/corpus/tier4-complete.json');
const tier4Data = JSON.parse(fs.readFileSync(tier4Path, 'utf8'));

console.log('=== NEW TIER 4 EMOTIONAL & COGNITIVE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'personal_worry', 'excessive_worry', 'future_anxiety', 'worry_onset', 'intense_worry',
  'worry_prediction', 'unnecessary_worry', 'night_worry', 'baseless_worry', 'party_enjoyment',
  'friend_enjoyment', 'play_enjoyment', 'current_fun', 'park_fun', 'tonight_fun',
  'beach_fun', 'today_fun', 'trip_fun', 'wellness_state', 'fatigue_state',
  'location_state', 'improvement_feeling', 'illness_feeling', 'meeting_plan', 'surprise_discovery',
  'problem_encounter', 'happiness_discovery', 'personal_belief', 'truth_belief', 'religious_belief',
  'self_confidence', 'story_acceptance', 'project_faith', 'visual_proof', 'justice_belief',
  'dream_belief', 'person_acquaintance', 'city_familiarity', 'language_knowledge', 'social_networking',
  'cultural_learning', 'paris_exploration', 'parent_introduction', 'travel_experience', 'love_experience',
  'music_hearing', 'voice_hearing', 'phone_hearing', 'noise_hearing', 'news_hearing',
  'opinion_listening', 'interesting_hearing', 'song_recognition', 'positive_feedback', 'book_bringing',
  'news_delivery', 'problem_causing', 'food_delivery', 'family_bringing', 'money_bringing',
  'joy_bringing', 'gift_bringing', 'luck_bringing', 'clothing_wearing', 'hairstyle_choice',
  'glasses_wearing', 'happy_lifestyle', 'project_leadership', 'flower_bringing', 'time_requirement',
  'life_assessment', 'responsibility_burden', 'help_need', 'rest_need', 'time_need',
  'support_need', 'attention_need', 'money_need', 'patience_need', 'advice_need', 'love_need'
];

let sentenceCount = 0;
const targetVerbs = ['PREOCUPARSE', 'DIVERTIRSE', 'ENCONTRARSE', 'CREER', 'CONOCER', 'OÍR', 'TRAER', 'LLEVAR', 'NECESITAR'];
const tenses = ['present', 'present-progressive', 'going-to', 'present-perfect'];

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');
console.log('TENSES COVERED: Present, Present-Progressive, Going-To Future, Present-Perfect');
console.log('(Following PEDAGOGICAL_MAP.md - avoiding Preterite and Simple Future for Tier 4)\n');

targetVerbs.forEach((verbName) => {
  const verbData = tier4Data.verbs[verbName];
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

console.log(`TOTAL NEW TIER 4 SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish Tier 4 (Emotional & Cognitive) sentences for:');
console.log('1. Grammar accuracy (especially stem-changing and reflexive verbs)');
console.log('2. Natural Spanish usage (appropriate emotional/cognitive contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper conjugations for each tense');
console.log('\nKey areas to check:');
console.log('EMOTIONAL REFLEXIVE VERBS:');
console.log('- PREOCUPARSE: me preocupo, te preocupas, se preocupa (regular reflexive)');
console.log('- DIVERTIRSE: me divierto, te diviertes, se divierte (stem change e→ie)');
console.log('- ENCONTRARSE: me encuentro, te encuentras, se encuentra (stem change o→ue)');
console.log('\nCOGNITIVE VERBS:');
console.log('- CREER: creo, crees, cree (regular)');
console.log('- CONOCER: conozco, conoces, conoce (irregular yo form)');
console.log('\nIRREGULAR VERBS:');
console.log('- OÍR: oigo, oyes, oye (irregular yo form + stem change)');
console.log('- TRAER: traigo, traes, trae (irregular yo form)');
console.log('- LLEVAR: llevo, llevas, lleva (regular)');
console.log('- NECESITAR: necesito, necesitas, necesita (regular)');
console.log('\nEMOTIONAL/COGNITIVE CONTEXTS:');
console.log('- Worry, fun, belief, knowledge, hearing, bringing, wearing, needing');
console.log('- Appropriate for intermediate emotional expression');
console.log('\nFlag any sentences that need correction or improvement.');
