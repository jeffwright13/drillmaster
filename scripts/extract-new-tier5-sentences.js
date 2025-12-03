#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load Tier 5 corpus
const tier5Path = path.join(__dirname, '../data/corpus/tier5-complete.json');
const tier5Data = JSON.parse(fs.readFileSync(tier5Path, 'utf8'));

console.log('=== NEW TIER 5 GUSTAR-TYPE SENTENCES FOR CHATGPT REVIEW ===\n');

// These are the new sentences we added (excluding the original ones)
const newSentenceSources = [
  'chocolate_preference', 'sports_preference', 'travel_preference', 'movie_prediction', 'friend_prediction',
  'book_enjoyment', 'class_enjoyment', 'headache', 'foot_pain', 'stomach_pain',
  'back_pain_prediction', 'leg_pain_prediction', 'all_day_pain', 'eye_pain', 'music_love',
  'flower_love', 'cooking_love', 'paris_love_prediction', 'parent_love_prediction', 'meeting_joy',
  'gift_love', 'noise_annoyance', 'interruption_annoyance', 'waiting_annoyance', 'heat_annoyance_prediction',
  'mosquito_annoyance', 'attitude_annoyance', 'comment_annoyance', 'opinion_importance', 'result_importance',
  'family_importance', 'price_importance', 'consequence_importance', 'truth_importance', 'detail_importance',
  'money_lack', 'time_shortage', 'experience_lack', 'time_shortage_prediction', 'ingredient_shortage',
  'courage_lack', 'opportunity_lack', 'interesting_opinion', 'difficulty_opinion', 'good_idea_opinion',
  'strangeness_prediction', 'expense_prediction', 'kindness_impression', 'correctness_impression'
];

let sentenceCount = 0;
const targetVerbs = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
const tenses = ['present', 'going-to', 'present-perfect'];

console.log('FORMAT: Each sentence as it will appear on Anki cards\n');
console.log('ES→EN Cards (Spanish front, English back):');
console.log('EN→ES Cards (English front, Spanish back):\n');
console.log('TENSES COVERED: Present, Going-To Future, Present-Perfect');
console.log('(Conservative expansion due to special gustar-type grammar)\n');

targetVerbs.forEach((verbName) => {
  const verbData = tier5Data.verbs[verbName];
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
        
        // For gustar-type verbs, the "subject" is actually the indirect object pronoun
        // The sentence structure is already correct as stored
        const spanishSentence = sentence.spanish;
        
        // Clean English (remove disambiguation hints for ES→EN cards)
        const cleanEnglish = sentence.english
          .replace(/\s*\(informal\)/gi, '')
          .replace(/\s*\(formal\)/gi, '')
          .replace(/\s*\(vos\)/gi, '')
          .replace(/You all/g, 'You')
          .replace(/you all/g, 'you')
          .trim();
        
        console.log(`${sentenceCount}. ES→EN: "${spanishSentence}" → "${cleanEnglish}"`);
        console.log(`    EN→ES: "${sentence.english}" → "${spanishSentence}"`);
      });
    });
    
    console.log('\n');
  }
});

console.log(`TOTAL NEW TIER 5 SENTENCES: ${sentenceCount}`);
console.log('\n=== CHATGPT REVIEW PROMPT ===');
console.log('Please review these Spanish Tier 5 (Gustar-Type Verbs) sentences for:');
console.log('1. Grammar accuracy (especially indirect object pronouns and verb agreement)');
console.log('2. Natural Spanish usage (appropriate gustar-type contexts)');
console.log('3. Beginner-appropriate vocabulary');
console.log('4. Accurate English translations');
console.log('5. Proper use of gustar-type verb structures');
console.log('\nKey areas to check:');
console.log('GUSTAR-TYPE VERB STRUCTURE:');
console.log('- Indirect object pronouns: me, te, le, nos, os, les');
console.log('- Verb agrees with the THING being liked/bothered/etc., not the person');
console.log('- Examples: "Me gusta" (I like), "Me gustan" (I like - plural)');
console.log('\nVERB-SPECIFIC PATTERNS:');
console.log('- GUSTAR: me gusta/gustan (I like)');
console.log('- DOLER: me duele/duelen (it hurts me)');
console.log('- ENCANTAR: me encanta/encantan (I love)');
console.log('- MOLESTAR: me molesta/molestan (it bothers me)');
console.log('- IMPORTAR: me importa/importan (it matters to me)');
console.log('- FALTAR: me falta/faltan (I lack/need)');
console.log('- PARECER: me parece/parecen (it seems to me)');
console.log('\nCOMMON ERRORS TO CHECK:');
console.log('- Incorrect pronoun usage');
console.log('- Wrong verb agreement (singular vs plural)');
console.log('- Unnatural English translations');
console.log('\nFlag any sentences that need correction or improvement.');
