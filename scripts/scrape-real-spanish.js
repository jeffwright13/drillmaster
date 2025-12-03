#!/usr/bin/env node

/**
 * Scrape REAL Mexican Spanish sentences from authentic sources
 * NO templates, NO generation - only actual text from real websites
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Load our target verbs and their conjugated forms
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
    
    // Build target forms to search for
    const targetForms = new Map();
    
    verbs.forEach(verb => {
      const verbUpper = verb.verb.toUpperCase();
      if (conjugations[verbUpper]) {
        const forms = [];
        
        // Collect all conjugated forms
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

// Real Mexican Spanish sources
const REAL_SOURCES = [
  // Mexican news sites
  'https://www.milenio.com/',
  'https://www.eluniversal.com.mx/',
  'https://www.excelsior.com.mx/',
  'https://www.jornada.com.mx/',
  'https://www.reforma.com/',
  
  // Mexican blogs and culture
  'https://www.mexicodesconocido.com.mx/',
  'https://www.chilango.com/',
  
  // RSS feeds for fresh content
  'https://feeds.feedburner.com/milenio-mexico',
  'https://www.eluniversal.com.mx/rss.xml'
];

// Fetch content from URL with proper headers
function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate'
      }
    };
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchContent(res.headers.location).then(resolve).catch(reject);
      }
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Clean and extract sentences from HTML content
function extractSentences(htmlContent) {
  // Remove HTML tags but preserve sentence structure
  let text = htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => {
      return s.length >= 10 && 
             s.length <= 150 && 
             /[a-záéíóúñü]/i.test(s) && // Contains Spanish characters
             !s.match(/^\d+$/) && // Not just numbers
             !s.match(/^[A-Z\s]+$/) && // Not all caps
             s.split(' ').length >= 3; // At least 3 words
    });
  
  return sentences;
}

// Find sentences containing our target verb forms
function findTargetSentences(sentences, targetForms) {
  const matches = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    targetForms.forEach((forms, verb) => {
      forms.forEach(formInfo => {
        // Look for the exact verb form in the sentence
        const regex = new RegExp(`\\b${formInfo.form}\\b`, 'i');
        if (regex.test(lowerSentence)) {
          matches.push({
            spanish: sentence.trim(),
            verb: verb,
            verbForm: formInfo.form,
            tense: formInfo.tense,
            subject: formInfo.subject,
            english: formInfo.english,
            source: 'real_scraping'
          });
        }
      });
    });
  });
  
  return matches;
}

// Scrape a single source
async function scrapeSingleSource(url, targetForms) {
  console.log(`🌐 Scraping: ${url}`);
  
  try {
    const content = await fetchContent(url);
    const sentences = extractSentences(content);
    const matches = findTargetSentences(sentences, targetForms);
    
    console.log(`  📝 Found ${sentences.length} sentences, ${matches.length} matches`);
    return matches;
    
  } catch (error) {
    console.warn(`  ❌ Failed: ${error.message}`);
    return [];
  }
}

// Main scraping function
async function scrapeRealSpanish() {
  console.log('🕷️  Starting REAL Mexican Spanish scraping...');
  console.log('📡 Sources: Mexican news sites, blogs, RSS feeds');
  
  const targetForms = loadTargetForms();
  console.log(`🎯 Tracking ${targetForms.size} verbs with their conjugated forms`);
  
  const allMatches = [];
  
  for (const url of REAL_SOURCES) {
    const matches = await scrapeSingleSource(url, targetForms);
    allMatches.push(...matches);
    
    // Be respectful - wait between requests
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Organize by verb and tense
  const organized = {};
  
  allMatches.forEach(match => {
    const verb = match.verb.toUpperCase();
    if (!organized[verb]) {
      organized[verb] = {};
    }
    if (!organized[verb][match.tense]) {
      organized[verb][match.tense] = [];
    }
    
    // Add metadata
    organized[verb][match.tense].push({
      spanish: match.spanish,
      english: `[NEEDS TRANSLATION] ${match.spanish}`, // Mark for manual translation
      subject: match.subject,
      region: 'universal',
      source: 'mexican_web_scraping',
      scraped_from: 'real_sources',
      verb_form_found: match.verbForm,
      tags: [
        'region:universal',
        `subject:${match.subject}`,
        `tense:${match.tense}`,
        'word-type:verb',
        'source:real_scraping'
      ]
    });
  });
  
  // Save results
  const outputPath = path.join(__dirname, '../data/corpus/scraped-real-spanish.json');
  const results = {
    metadata: {
      scraped_date: new Date().toISOString(),
      sources: REAL_SOURCES,
      total_sentences: allMatches.length,
      verbs_found: Object.keys(organized).length,
      method: 'real_web_scraping'
    },
    verbs: organized
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 SCRAPING RESULTS:`);
  console.log(`   💾 Saved to: ${outputPath}`);
  console.log(`   📝 Total sentences: ${allMatches.length}`);
  console.log(`   🔤 Verbs found: ${Object.keys(organized).length}`);
  console.log(`   🌐 Sources scraped: ${REAL_SOURCES.length}`);
  
  // Show breakdown by verb
  console.log(`\n📋 Breakdown by verb:`);
  Object.keys(organized).forEach(verb => {
    const tenseCount = Object.keys(organized[verb]).length;
    const sentenceCount = Object.values(organized[verb])
      .reduce((sum, tense) => sum + tense.length, 0);
    console.log(`   ${verb}: ${sentenceCount} sentences across ${tenseCount} tenses`);
  });
  
  console.log(`\n⚠️  NOTE: English translations marked as [NEEDS TRANSLATION]`);
  console.log(`   These are REAL Spanish sentences that need manual translation.`);
  console.log(`✨ Real scraping complete!`);
}

if (require.main === module) {
  scrapeRealSpanish().catch(console.error);
}

module.exports = { scrapeRealSpanish };
