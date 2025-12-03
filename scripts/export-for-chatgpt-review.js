#!/usr/bin/env node

/**
 * Export All Sentences for ChatGPT Review
 * Create clean, numbered list of all Spanish sentences with English translations
 */

const fs = require('fs');
const path = require('path');

function exportForChatGPTReview() {
  console.log('📤 Exporting all sentences for ChatGPT review...');
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const allSentences = [];
  let totalCount = 0;
  
  corpusFiles.forEach(filename => {
    const tier = filename.match(/tier(\d)/)[1];
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`📚 Processing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              totalCount++;
              allSentences.push({
                id: totalCount,
                tier: tier,
                verb: verb,
                tense: tense,
                spanish: sentence.spanish || '',
                english: sentence.english || '',
                subject: sentence.subject || '',
                source: sentence.source?.type || 'unknown'
              });
            });
          }
        });
      });
    }
  });
  
  // Create different export formats
  createTextExport(allSentences);
  createCSVExport(allSentences);
  createChatGPTPrompt(allSentences);
  
  console.log(`\n✅ Export complete: ${totalCount} sentences ready for review`);
  
  return allSentences;
}

function createTextExport(sentences) {
  console.log('📝 Creating text export...');
  
  let textContent = `DRILLMASTER CORPUS - ALL SENTENCES FOR REVIEW
Total: ${sentences.length} sentences
Generated: ${new Date().toISOString().split('T')[0]}

Instructions for ChatGPT:
Please review these Spanish sentences and their English translations for:
1. Spanish grammar correctness
2. Natural Spanish usage (Mexican Spanish preferred)
3. Accurate English translations
4. Appropriate difficulty level for language learners
5. Any awkward or unnatural constructions

Format: [ID] Spanish → English (Tier X, Verb, Tense)

SENTENCES:
==========

`;
  
  sentences.forEach(sentence => {
    textContent += `[${sentence.id}] ${sentence.spanish} → ${sentence.english}\n`;
    textContent += `    (Tier ${sentence.tier}, ${sentence.verb}, ${sentence.tense}, ${sentence.subject})\n\n`;
  });
  
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-review-export.txt');
  fs.writeFileSync(outputPath, textContent);
  console.log(`   💾 Saved: ${outputPath}`);
}

function createCSVExport(sentences) {
  console.log('📊 Creating CSV export...');
  
  let csvContent = 'ID,Tier,Verb,Tense,Subject,Spanish,English,Source\n';
  
  sentences.forEach(sentence => {
    // Escape quotes and commas for CSV
    const spanish = `"${sentence.spanish.replace(/"/g, '""')}"`;
    const english = `"${sentence.english.replace(/"/g, '""')}"`;
    
    csvContent += `${sentence.id},${sentence.tier},${sentence.verb},${sentence.tense},${sentence.subject},${spanish},${english},${sentence.source}\n`;
  });
  
  const outputPath = path.join(__dirname, '../data/corpus/chatgpt-review-export.csv');
  fs.writeFileSync(outputPath, csvContent);
  console.log(`   💾 Saved: ${outputPath}`);
}

function createChatGPTPrompt(sentences) {
  console.log('🤖 Creating ChatGPT prompt...');
  
  // Split into chunks for manageable review
  const chunkSize = 50;
  const chunks = [];
  
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize));
  }
  
  chunks.forEach((chunk, chunkIndex) => {
    let promptContent = `SPANISH CORPUS REVIEW - CHUNK ${chunkIndex + 1}/${chunks.length}

Please review these ${chunk.length} Spanish sentences for correctness and naturalness:

REVIEW CRITERIA:
1. ✅ Spanish grammar correctness
2. 🗣️ Natural Mexican Spanish usage (no Spain/Argentina forms)
3. 📝 Accurate English translations
4. 🎯 Appropriate for language learners
5. 🚫 Flag any awkward/unnatural constructions

RESPONSE FORMAT:
For each problematic sentence, respond with:
[ID] ISSUE: Brief description
SPANISH: Current Spanish sentence
ENGLISH: Current English translation  
SUGGESTED: Your improved version (if needed)

If a sentence is good, just write: [ID] ✅ Good

SENTENCES TO REVIEW:
==================

`;
    
    chunk.forEach(sentence => {
      promptContent += `[${sentence.id}] ${sentence.spanish}\n`;
      promptContent += `English: ${sentence.english}\n`;
      promptContent += `Context: Tier ${sentence.tier}, ${sentence.verb} (${sentence.tense})\n\n`;
    });
    
    const outputPath = path.join(__dirname, `../data/corpus/chatgpt-prompt-chunk-${chunkIndex + 1}.txt`);
    fs.writeFileSync(outputPath, promptContent);
    console.log(`   💾 Saved: chatgpt-prompt-chunk-${chunkIndex + 1}.txt`);
  });
}

function createSimpleList(sentences) {
  console.log('📋 Creating simple list...');
  
  let listContent = `DRILLMASTER SPANISH SENTENCES (${sentences.length} total)\n\n`;
  
  sentences.forEach(sentence => {
    listContent += `${sentence.id}. ${sentence.spanish}\n`;
    listContent += `   ${sentence.english}\n\n`;
  });
  
  const outputPath = path.join(__dirname, '../data/corpus/simple-sentence-list.txt');
  fs.writeFileSync(outputPath, listContent);
  console.log(`   💾 Saved: ${outputPath}`);
}

if (require.main === module) {
  const sentences = exportForChatGPTReview();
  
  console.log(`\n🎯 EXPORT SUMMARY:`);
  console.log(`   📝 Total sentences: ${sentences.length}`);
  console.log(`   📊 CSV format: Ready for spreadsheet analysis`);
  console.log(`   📤 Text format: Ready for ChatGPT review`);
  console.log(`   🤖 Chunked prompts: ${Math.ceil(sentences.length / 50)} files for manageable review`);
  
  console.log(`\n📋 RECOMMENDED WORKFLOW:`);
  console.log(`   1. Use chatgpt-prompt-chunk-X.txt files with ChatGPT`);
  console.log(`   2. Review 50 sentences at a time`);
  console.log(`   3. Collect ChatGPT's feedback`);
  console.log(`   4. Report back with issues found`);
  
  console.log(`\n✅ FILES READY FOR CHATGPT REVIEW!`);
}

module.exports = { exportForChatGPTReview };
