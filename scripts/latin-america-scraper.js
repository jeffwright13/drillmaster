#!/usr/bin/env node

/**
 * Comprehensive Latin American Spanish scraper
 * Target: Countries that use TÚ (not vos/vosotros)
 * Mexico, Central America, Caribbean, Northern South America
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

// Comprehensive Latin American sources (TÚ regions only)
const LATIN_AMERICAN_SOURCES = {
  // MEXICO
  mexico: [
    'https://www.milenio.com/',
    'https://www.eluniversal.com.mx/',
    'https://www.excelsior.com.mx/',
    'https://www.jornada.com.mx/',
    'https://www.animalpolitico.com/',
    'https://www.proceso.com.mx/',
    'https://www.elfinanciero.com.mx/',
    'https://www.chilango.com/',
    'https://www.mediotiempo.com/',
    'https://www.debate.com.mx/'
  ],
  
  // GUATEMALA
  guatemala: [
    'https://www.prensalibre.com/',
    'https://www.soy502.com/',
    'https://www.guatemala.com/',
    'https://www.publinews.gt/'
  ],
  
  // EL SALVADOR
  el_salvador: [
    'https://www.elsalvador.com/',
    'https://www.laprensagrafica.com/',
    'https://www.diariocolatino.com/'
  ],
  
  // HONDURAS
  honduras: [
    'https://www.laprensa.hn/',
    'https://www.elheraldo.hn/',
    'https://www.proceso.hn/'
  ],
  
  // NICARAGUA
  nicaragua: [
    'https://www.laprensa.com.ni/',
    'https://www.elnuevodiario.com.ni/',
    'https://confidencial.com.ni/'
  ],
  
  // COSTA RICA
  costa_rica: [
    'https://www.nacion.com/',
    'https://www.crhoy.com/',
    'https://www.teletica.com/',
    'https://www.amprensa.com/'
  ],
  
  // PANAMA
  panama: [
    'https://www.laestrella.com.pa/',
    'https://www.prensa.com/',
    'https://www.telemetro.com/'
  ],
  
  // VENEZUELA
  venezuela: [
    'https://www.eluniversal.com/',
    'https://www.elnacional.com/',
    'https://www.noticiasrcn.com/venezuela'
  ],
  
  // COLOMBIA
  colombia: [
    'https://www.eltiempo.com/',
    'https://www.elespectador.com/',
    'https://www.semana.com/',
    'https://www.caracoltv.com/',
    'https://www.rcnradio.com/'
  ],
  
  // ECUADOR
  ecuador: [
    'https://www.elcomercio.com/',
    'https://www.eluniverso.com/',
    'https://www.expreso.ec/'
  ],
  
  // PERU
  peru: [
    'https://www.elcomercio.pe/',
    'https://www.larepublica.pe/',
    'https://www.peru21.pe/',
    'https://www.rpp.pe/'
  ],
  
  // DOMINICAN REPUBLIC
  dominican_republic: [
    'https://www.diariolibre.com/',
    'https://www.listindiario.com/',
    'https://www.elnacional.com.do/'
  ],
  
  // PUERTO RICO
  puerto_rico: [
    'https://www.elnuevodia.com/',
    'https://www.primerahora.com/',
    'https://www.metro.pr/'
  ],
  
  // CUBA
  cuba: [
    'https://www.granma.cu/',
    'https://www.cubadebate.cu/',
    'https://www.juventudrebelde.cu/'
  ]
};

// Flatten all sources
const ALL_SOURCES = Object.values(LATIN_AMERICAN_SOURCES).flat();

// Enhanced content fetching
async function fetchContent(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-419,es;q=0.9,en;q=0.8', // Latin American Spanish preference
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Connection': 'keep-alive'
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
    req.setTimeout(20000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Enhanced sentence extraction
function extractSentences(htmlContent) {
  let text = htmlContent;
  
  // Target content areas with better patterns
  const contentPatterns = [
    /<article[^>]*>(.*?)<\/article>/gis,
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<div[^>]*class="[^"]*article[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<div[^>]*class="[^"]*story[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<div[^>]*class="[^"]*news[^"]*"[^>]*>(.*?)<\/div>/gis,
    /<main[^>]*>(.*?)<\/main>/gis,
    /<section[^>]*class="[^"]*story[^"]*"[^>]*>(.*?)<\/section>/gis,
    /<p[^>]*>(.*?)<\/p>/gis
  ];
  
  let contentText = '';
  contentPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      contentText += matches.join(' ');
    }
  });
  
  if (!contentText.trim()) {
    contentText = text;
  }
  
  // Enhanced cleaning
  let cleanText = contentText
    .replace(/<script[^>]*>.*?<\/script>/gis, ' ')
    .replace(/<style[^>]*>.*?<\/style>/gis, ' ')
    .replace(/<nav[^>]*>.*?<\/nav>/gis, ' ')
    .replace(/<header[^>]*>.*?<\/header>/gis, ' ')
    .replace(/<footer[^>]*>.*?<\/footer>/gis, ' ')
    .replace(/<aside[^>]*>.*?<\/aside>/gis, ' ')
    .replace(/<form[^>]*>.*?<\/form>/gis, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Better sentence splitting and filtering
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => {
      return s.length >= 20 && 
             s.length <= 180 && 
             /[a-záéíóúñü]/i.test(s) && // Spanish characters
             !/^\d+$/.test(s) && // Not just numbers
             !/^[A-Z\s]+$/.test(s) && // Not all caps
             !/^(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d+/i.test(s) && // Not dates
             s.split(' ').length >= 5 && // At least 5 words
             s.split(' ').length <= 25 && // Max 25 words
             !/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo)/i.test(s) && // Not day names
             !/^(copyright|derechos|reservados|política|privacidad|términos|condiciones|cookies|javascript|html|css|error|404|500)/i.test(s) && // Not technical
             !/^\s*\d+\s*$/.test(s) && // Not just numbers with spaces
             !/^(ver más|leer más|continuar leyendo|siguiente|anterior|inicio|fin|página)/i.test(s); // Not navigation
    });
  
  return sentences;
}

// Enhanced quality scoring
function calculateQualityScore(sentence, country) {
  let score = 0;
  
  // Length bonus (sweet spot 25-120 chars)
  if (sentence.length >= 25 && sentence.length <= 120) score += 15;
  
  // Word count bonus (5-20 words ideal)
  const wordCount = sentence.split(' ').length;
  if (wordCount >= 5 && wordCount <= 20) score += 15;
  
  // Spanish character bonus
  if (/[ñáéíóúü]/i.test(sentence)) score += 10;
  
  // Latin American vocabulary bonus
  const latinWords = [
    'país', 'gobierno', 'presidente', 'nacional', 'estado', 'ciudad', 'pueblo',
    'familia', 'casa', 'trabajo', 'escuela', 'universidad', 'hospital',
    'comida', 'agua', 'tiempo', 'año', 'día', 'noche', 'mañana',
    'gente', 'persona', 'niño', 'mujer', 'hombre', 'vida', 'mundo'
  ];
  
  latinWords.forEach(word => {
    if (sentence.toLowerCase().includes(word)) score += 2;
  });
  
  // Country-specific bonus
  const countryWords = {
    mexico: ['méxico', 'mexicano', 'mexicana', 'cdmx', 'guadalajara', 'monterrey'],
    colombia: ['colombia', 'colombiano', 'bogotá', 'medellín', 'cali'],
    venezuela: ['venezuela', 'venezolano', 'caracas', 'maracaibo'],
    peru: ['perú', 'peruano', 'lima', 'cusco'],
    ecuador: ['ecuador', 'ecuatoriano', 'quito', 'guayaquil'],
    costa_rica: ['costa rica', 'costarricense', 'san josé'],
    panama: ['panamá', 'panameño', 'ciudad de panamá'],
    guatemala: ['guatemala', 'guatemalteco', 'ciudad de guatemala'],
    honduras: ['honduras', 'hondureño', 'tegucigalpa'],
    nicaragua: ['nicaragua', 'nicaragüense', 'managua'],
    el_salvador: ['salvador', 'salvadoreño', 'san salvador'],
    dominican_republic: ['dominicana', 'dominicano', 'santo domingo'],
    puerto_rico: ['puerto rico', 'puertorriqueño', 'san juan'],
    cuba: ['cuba', 'cubano', 'habana']
  };
  
  if (countryWords[country]) {
    countryWords[country].forEach(word => {
      if (sentence.toLowerCase().includes(word)) score += 5;
    });
  }
  
  // Penalty for technical/unwanted terms
  const badTerms = [
    'javascript', 'html', 'css', 'error', 'código', 'navegador', 'browser',
    'cookies', 'política de privacidad', 'términos y condiciones',
    'facebook', 'twitter', 'instagram', 'whatsapp', 'email',
    'click', 'link', 'url', 'http', 'www', '.com', '.mx'
  ];
  
  badTerms.forEach(term => {
    if (sentence.toLowerCase().includes(term)) score -= 15;
  });
  
  return Math.max(0, score); // Don't go negative
}

// Enhanced sentence matching
function findTargetSentences(sentences, targetForms, country) {
  const matches = [];
  
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    
    targetForms.forEach((forms, verb) => {
      forms.forEach(formInfo => {
        const regex = new RegExp(`\\b${formInfo.form}\\b`, 'i');
        if (regex.test(lowerSentence)) {
          const qualityScore = calculateQualityScore(sentence, country);
          
          // Only keep high-quality sentences
          if (qualityScore >= 20) {
            matches.push({
              spanish: sentence.trim(),
              verb: verb,
              verbForm: formInfo.form,
              tense: formInfo.tense,
              subject: formInfo.subject,
              english: formInfo.english,
              country: country,
              quality_score: qualityScore,
              source: 'latin_american_scraping'
            });
          }
        }
      });
    });
  });
  
  return matches.sort((a, b) => b.quality_score - a.quality_score);
}

// Main scraping function
async function scrapeLatinAmerica() {
  console.log('🌎 Starting comprehensive Latin American Spanish scraping...');
  console.log(`📡 Sources: ${ALL_SOURCES.length} websites across 13 countries`);
  console.log('🎯 Target: Countries using TÚ (no vos/vosotros)');
  
  const targetForms = loadTargetForms();
  console.log(`🔤 Tracking ${targetForms.size} verbs with conjugated forms`);
  
  // Load existing scraped data
  let existingData = { verbs: {} };
  const existingPaths = [
    '../data/corpus/scraped-real-spanish.json',
    '../data/corpus/enhanced-scraped-spanish.json'
  ];
  
  existingPaths.forEach(relativePath => {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        console.log(`📂 Loaded existing data from ${relativePath}`);
        
        // Merge existing verbs
        Object.keys(data.verbs).forEach(verb => {
          if (!existingData.verbs[verb]) {
            existingData.verbs[verb] = {};
          }
          Object.keys(data.verbs[verb]).forEach(tense => {
            if (!existingData.verbs[verb][tense]) {
              existingData.verbs[verb][tense] = [];
            }
            existingData.verbs[verb][tense].push(...data.verbs[verb][tense]);
          });
        });
      } catch (error) {
        console.warn(`⚠️  Could not load ${relativePath}: ${error.message}`);
      }
    }
  });
  
  const allMatches = [];
  let successCount = 0;
  let totalSentences = 0;
  
  // Scrape by country
  for (const [country, sources] of Object.entries(LATIN_AMERICAN_SOURCES)) {
    console.log(`\n🏳️  Scraping ${country.toUpperCase()} (${sources.length} sources):`);
    
    for (const url of sources) {
      console.log(`  🌐 ${url}`);
      
      try {
        const content = await fetchContent(url);
        const sentences = extractSentences(content);
        totalSentences += sentences.length;
        
        const matches = findTargetSentences(sentences, targetForms, country);
        
        if (matches.length > 0) {
          allMatches.push(...matches.slice(0, 15)); // Top 15 per source
          successCount++;
          console.log(`    ✅ ${sentences.length} sentences → ${matches.length} quality matches`);
        } else {
          console.log(`    📝 ${sentences.length} sentences → 0 matches`);
        }
        
      } catch (error) {
        console.log(`    ❌ Failed: ${error.message}`);
      }
      
      // Be respectful - wait between requests
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
  }
  
  // Organize and deduplicate
  const organized = JSON.parse(JSON.stringify(existingData.verbs)); // Start with existing
  const seen = new Set();
  
  // Add existing sentences to seen set
  Object.values(organized).forEach(verb => {
    Object.values(verb).forEach(tense => {
      tense.forEach(sentence => {
        seen.add(sentence.spanish);
      });
    });
  });
  
  let newSentences = 0;
  allMatches.forEach(match => {
    if (seen.has(match.spanish)) return; // Skip duplicates
    seen.add(match.spanish);
    newSentences++;
    
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
      source: 'latin_american_scraping',
      country: match.country,
      scraped_from: 'real_sources',
      verb_form_found: match.verbForm,
      quality_score: match.quality_score,
      tags: [
        'region:universal',
        `subject:${match.subject}`,
        `tense:${match.tense}`,
        'word-type:verb',
        'source:latin_american_scraping',
        `country:${match.country}`
      ]
    });
  });
  
  // Save comprehensive results
  const outputPath = path.join(__dirname, '../data/corpus/latin-american-scraped.json');
  const results = {
    metadata: {
      scraped_date: new Date().toISOString(),
      countries: Object.keys(LATIN_AMERICAN_SOURCES),
      sources_attempted: ALL_SOURCES.length,
      sources_successful: successCount,
      total_sentences_processed: totalSentences,
      new_sentences_found: newSentences,
      total_unique_sentences: seen.size,
      verbs_found: Object.keys(organized).length,
      method: 'comprehensive_latin_american_scraping'
    },
    verbs: organized
  };
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  console.log(`\n📊 COMPREHENSIVE SCRAPING RESULTS:`);
  console.log(`   💾 Saved to: ${outputPath}`);
  console.log(`   🆕 New sentences: ${newSentences}`);
  console.log(`   📝 Total unique sentences: ${seen.size}`);
  console.log(`   🔤 Verbs found: ${Object.keys(organized).length}`);
  console.log(`   ✅ Successful sources: ${successCount}/${ALL_SOURCES.length}`);
  console.log(`   🌎 Countries: ${Object.keys(LATIN_AMERICAN_SOURCES).length}`);
  
  // Show top verbs
  console.log(`\n📋 Top verbs by sentence count:`);
  const verbCounts = Object.keys(organized).map(verb => ({
    verb,
    count: Object.values(organized[verb]).reduce((sum, tense) => sum + tense.length, 0)
  })).sort((a, b) => b.count - a.count);
  
  verbCounts.slice(0, 15).forEach(({ verb, count }) => {
    console.log(`   ${verb}: ${count} sentences`);
  });
  
  console.log(`\n✨ Latin American scraping complete!`);
  console.log(`🎯 Ready for comparison with existing corpus`);
}

if (require.main === module) {
  scrapeLatinAmerica().catch(console.error);
}

module.exports = { scrapeLatinAmerica };
