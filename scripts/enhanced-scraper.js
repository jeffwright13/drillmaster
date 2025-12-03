#!/usr/bin/env node

/**
 * Enhanced scraper for REAL Mexican Spanish sentences
 * Targets more sources and better content extraction
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

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

// Expanded Mexican sources - focus on content-rich sites
const ENHANCED_SOURCES = [
  // Mexican news with rich content
  'https://www.animalpolitico.com/',
  'https://www.proceso.com.mx/',
  'https://www.sinembargo.mx/',
  'https://www.elfinanciero.com.mx/',
  
  // Mexican culture and lifestyle
  'https://www.mexicodesconocido.com.mx/articulos/',
  'https://www.chilango.com/noticias/',
  'https://www.timeout.com/mexico-city/es',
  
  // Mexican blogs and forums
  'https://www.debate.com.mx/',
  'https://www.sdpnoticias.com/',
  'https://www.infobae.com/america/mexico/',
  
  // Mexican government and official sources
  'https://www.gob.mx/presidencia',
  'https://www.gob.mx/salud',
  
  // Mexican sports (rich in action verbs)
  'https://www.mediotiempo.com/',
  'https://www.record.com.mx/',
  
  // Mexican entertainment
  'https://www.televisa.com/noticias/',
  'https://www.univision.com/noticias/mexico'
];

// Enhanced content fetching with better error handling
async function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };
    
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const newUrl = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, url).href;
        return fetchContent(newUrl).then(resolve).catch(reject);
      }
      
      // Handle compression
      let stream = res;
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        stream = res.pipe(zlib.createGunzip());
      }
      
      stream.on('data', chunk => data += chunk);
      stream.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Enhanced sentence extraction focusing on article content
function extractSentences(htmlContent) {
  // Try to extract main content areas first
  let text = htmlContent;
  
  // Look for common content containers
  const contentPatterns = [
    /<article[^>]*>(.*?)<\/article>/gis,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<main[^>]*>(.*?)<\/main>/gis,
    /<section[^>]*class="[^"]*story[^"]*"[^>]*>(.*?)<\/section>/gis
  ];
  
  let contentText = '';
  contentPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      contentText += matches.join(' ');
    }
  });
  
  // If no specific content found, use full text but clean it better
  if (!contentText.trim()) {
    contentText = text;
  }
  
  // Clean HTML and extract text
  let cleanText = contentText
    .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<nav[^>]*>.*?<\/nav>/gis, ' ')
    .replace(/<header[^>]*>.*?<\/header>/gis, ' ')
    .replace(/<footer[^>]*>.*?<\/footer>/gis, ' ')
    .replace(/<aside[^>]*>.*?<\/aside>/gis, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split into sentences with better logic
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => {
      return s.length >= 15 && 
             s.length <= 200 && 
             /[a-záéíóúñü]/i.test(s) && // Contains Spanish characters
             !/^\d+$/.test(s) && // Not just numbers
             !/^[A-Z\s]+$/.test(s) && // Not all caps
             !/^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d+/i.test(s) && // Not just dates
             s.split(' ').length >= 4 && // At least 4 words
             !/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i.test(s) && // Not starting with day names
             !/^(copyright|derechos|reservados|política|privacidad|términos|condiciones)/i.test(s); // Not legal text
    });
  
  return sentences;
}

// Enhanced sentence matching with context
function findTargetSentences(sentences, targetForms) {
  const matches = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    targetForms.forEach((forms, verb) => {
      forms.forEach(formInfo => {
        // Look for the exact verb form with word boundaries
        const regex = new RegExp(`\\b${formInfo.form}\\b`, 'i');
        if (regex.test(lowerSentence)) {
          // Additional quality checks
          if (sentence.length >= 20 && // Meaningful length
              !sentence.includes('JavaScript') && // Not technical errors
              !sentence.includes('cookies') &&
              !sentence.includes('navegador') &&
              !/^\s*\d+/.test(sentence) && // Not starting with numbers
              !/\b(error|404|500|página no encontrada)\b/i.test(sentence)) {
            
            matches.push({
              spanish: sentence.trim(),
              verb: verb,
              verbForm: formInfo.form,
              tense: formInfo.tense,
              subject: formInfo.subject,
              english: formInfo.english,
              source: 'enhanced_scraping',
              quality_score: calculateQualityScore(sentence)
            });
          }
        }
      });
    });
  });
  
  // Sort by quality score and return best matches
  return matches.sort((a, b) => b.quality_score - a.quality_score);
}

// Calculate quality score for sentences
function calculateQualityScore(sentence) {
  let score = 0;
  
  // Length bonus (sweet spot 30-100 chars)
  if (sentence.length >= 30 && sentence.length <= 100) score += 10;
  
  // Word count bonus (5-15 words ideal)
  const wordCount = sentence.split(' ').length;
  if (wordCount >= 5 && wordCount <= 15) score += 10;
  
  // Spanish character bonus
  if (/[ñáéíóúü]/i.test(sentence)) score += 5;
  
  // Common Mexican words bonus
  const mexicanWords = ['méxico', 'ciudad', 'país', 'gobierno', 'presidente', 'estado', 'nacional', 'mexicano', 'mexicana'];
  mexicanWords.forEach(word => {
    if (sentence.toLowerCase().includes(word)) score += 3;
  });
  
  // Penalty for technical terms
  const technicalTerms = ['javascript', 'html', 'css', 'error', 'código', 'navegador', 'browser'];
  technicalTerms.forEach(term => {
    if (sentence.toLowerCase().includes(term)) score -= 10;
  });
  
  return score;
}

// Enhanced scraping with better error handling and retry logic
async function scrapeEnhanced() {
  console.log('🚀 Enhanced REAL Mexican Spanish scraping...');
  console.log(`📡 Enhanced sources: ${ENHANCED_SOURCES.length} Mexican websites`);
  
  const targetForms = loadTargetForms();
  console.log(`🎯 Tracking ${targetForms.size} verbs with conjugated forms`);
  
  const allMatches = [];
  let successCount = 0;
  
  for (const url of ENHANCED_SOURCES) {
    console.log(`🌐 Scraping: ${url}`);
    
    try {
      const content = await fetchContent(url);
      const sentences = extractSentences(content);
      const matches = findTargetSentences(sentences, targetForms);
      
      if (matches.length > 0) {
        allMatches.push(...matches.slice(0, 10)); // Take top 10 quality matches per site
        successCount++;
        console.log(`  ✅ Found ${sentences.length} sentences, ${matches.length} quality matches`);
      } else {
        console.log(`  📝 Found ${sentences.length} sentences, 0 matches`);
      }
      
    } catch (error) {
      console.warn(`  ❌ Failed: ${error.message}`);
    }
    
    // Be respectful - wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Organize and deduplicate
  const organized = {};
  const seen = new Set();
  
  allMatches.forEach(match => {
    // Deduplicate by sentence content
    if (seen.has(match.spanish)) return;
    seen.add(match.spanish);
    
    const verb = match.verb.toUpperCase();
    if (!organized[verb]) {
      organized[verb] = {};
    }
    if (!organized[verb][match.tense]) {
      organized[verb][match.tense] = [];
    }
    
    organized[verb][match.tense].push({
      spanish: match.spanish,
      english: `[NEEDS TRANSLATION] ${match.spanish}`,
      subject: match.subject,
      region: 'universal',
      source: 'enhanced_mexican_scraping',
      scraped_from: 'real_sources',
      verb_form_found: match.verbForm,
      quality_score: match.quality_score,
      tags: [
        'region:universal',
        `subject:${match.subject}`,
        `tense:${match.tense}`,
        'word-type:verb',
        'source:enhanced_scraping'
      ]
    });
  });
  
  // Save results
  const outputPath = path.join(__dirname, '../data/corpus/enhanced-scraped-spanish.json');
  const results = {
    metadata: {
      scraped_date: new Date().toISOString(),
      sources_attempted: ENHANCED_SOURCES.length,
      sources_successful: successCount,
      total_sentences: allMatches.length,
      unique_sentences: seen.size,
      verbs_found: Object.keys(organized).length,
      method: 'enhanced_web_scraping'
    },
    verbs: organized
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 ENHANCED SCRAPING RESULTS:`);
  console.log(`   💾 Saved to: ${outputPath}`);
  console.log(`   📝 Total sentences: ${allMatches.length}`);
  console.log(`   🔤 Unique sentences: ${seen.size}`);
  console.log(`   🔤 Verbs found: ${Object.keys(organized).length}`);
  console.log(`   ✅ Successful sources: ${successCount}/${ENHANCED_SOURCES.length}`);
  
  // Show breakdown
  console.log(`\n📋 Best sentences by verb:`);
  Object.keys(organized).slice(0, 10).forEach(verb => {
    const sentenceCount = Object.values(organized[verb])
      .reduce((sum, tense) => sum + tense.length, 0);
    console.log(`   ${verb}: ${sentenceCount} sentences`);
  });
  
  console.log(`\n✨ Enhanced scraping complete!`);
}

if (require.main === module) {
  scrapeEnhanced().catch(console.error);
}

module.exports = { scrapeEnhanced };
