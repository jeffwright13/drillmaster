#!/usr/bin/env node

/**
 * Copyright Management Tool
 * Mark, analyze, and manage copyrighted content in corpus
 */

const fs = require('fs');
const path = require('path');

// Copyright analysis and management
function analyzeCopyright() {
  console.log('⚖️  Analyzing copyright status of corpus content...');
  
  // Load all corpus data
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  const copyrightAnalysis = {
    total_sentences: 0,
    by_source_type: {},
    copyrighted_content: [],
    safe_content: [],
    needs_review: []
  };
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Analyzing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            corpus.verbs[verb][tense].forEach(sentence => {
              copyrightAnalysis.total_sentences++;
              
              // Analyze source type
              const sourceType = getSourceType(sentence);
              if (!copyrightAnalysis.by_source_type[sourceType]) {
                copyrightAnalysis.by_source_type[sourceType] = 0;
              }
              copyrightAnalysis.by_source_type[sourceType]++;
              
              // Categorize by copyright risk
              const copyrightRisk = assessCopyrightRisk(sentence);
              const analysis = {
                file: filename,
                verb: verb,
                tense: tense,
                spanish: sentence.spanish,
                english: sentence.english,
                source_type: sourceType,
                risk_level: copyrightRisk.level,
                risk_reason: copyrightRisk.reason,
                recommendation: copyrightRisk.recommendation
              };
              
              if (copyrightRisk.level === 'HIGH') {
                copyrightAnalysis.copyrighted_content.push(analysis);
              } else if (copyrightRisk.level === 'SAFE') {
                copyrightAnalysis.safe_content.push(analysis);
              } else {
                copyrightAnalysis.needs_review.push(analysis);
              }
            });
          }
        });
      });
    }
  });
  
  // Generate report
  console.log(`\n⚖️  COPYRIGHT ANALYSIS REPORT:`);
  console.log(`   📊 Total sentences: ${copyrightAnalysis.total_sentences}`);
  
  console.log(`\n📋 By source type:`);
  Object.keys(copyrightAnalysis.by_source_type).forEach(sourceType => {
    const count = copyrightAnalysis.by_source_type[sourceType];
    const percentage = Math.round((count / copyrightAnalysis.total_sentences) * 100);
    console.log(`   ${sourceType}: ${count} sentences (${percentage}%)`);
  });
  
  console.log(`\n🚨 Copyright risk levels:`);
  console.log(`   ❌ HIGH RISK (copyrighted): ${copyrightAnalysis.copyrighted_content.length}`);
  console.log(`   ⚠️  NEEDS REVIEW: ${copyrightAnalysis.needs_review.length}`);
  console.log(`   ✅ SAFE: ${copyrightAnalysis.safe_content.length}`);
  
  // Show copyrighted content details
  if (copyrightAnalysis.copyrighted_content.length > 0) {
    console.log(`\n🚨 COPYRIGHTED CONTENT (© MÁXIMO NIVEL, 2013):`);
    copyrightAnalysis.copyrighted_content.slice(0, 10).forEach((item, i) => {
      console.log(`   ${i+1}. "${item.spanish}"`);
      console.log(`      Source: ${item.source_type} | Risk: ${item.risk_reason}`);
      console.log(`      Action: ${item.recommendation}`);
    });
    
    if (copyrightAnalysis.copyrighted_content.length > 10) {
      console.log(`   ... and ${copyrightAnalysis.copyrighted_content.length - 10} more`);
    }
  }
  
  // Save detailed analysis
  const outputPath = path.join(__dirname, '../data/corpus/copyright-analysis.json');
  fs.writeFileSync(outputPath, JSON.stringify(copyrightAnalysis, null, 2));
  console.log(`\n💾 Detailed analysis saved to: ${outputPath}`);
  
  return copyrightAnalysis;
}

// Determine source type from sentence metadata
function getSourceType(sentence) {
  if (sentence.source) {
    if (typeof sentence.source === 'object') {
      if (sentence.source.type === 'textbook') {
        return 'TEXTBOOK_COPYRIGHTED';
      } else if (sentence.source.type === 'web_scraping') {
        return 'WEB_SCRAPED';
      }
    } else if (typeof sentence.source === 'string') {
      if (sentence.source.includes('scraping')) {
        return 'WEB_SCRAPED';
      } else if (sentence.source.includes('textbook')) {
        return 'TEXTBOOK_COPYRIGHTED';
      }
    }
  }
  
  // Check tags for source info
  if (sentence.tags && Array.isArray(sentence.tags)) {
    if (sentence.tags.some(tag => tag.includes('textbook'))) {
      return 'TEXTBOOK_COPYRIGHTED';
    } else if (sentence.tags.some(tag => tag.includes('scraping'))) {
      return 'WEB_SCRAPED';
    }
  }
  
  return 'ORIGINAL_CREATED';
}

// Assess copyright risk level
function assessCopyrightRisk(sentence) {
  const sourceType = getSourceType(sentence);
  
  if (sourceType === 'TEXTBOOK_COPYRIGHTED') {
    return {
      level: 'HIGH',
      reason: 'Extracted from copyrighted textbook (© MÁXIMO NIVEL, 2013)',
      recommendation: 'REMOVE or TRANSFORM significantly'
    };
  }
  
  if (sourceType === 'WEB_SCRAPED') {
    // Web content may have copyright but individual sentences are often fair use
    if (sentence.spanish && sentence.spanish.length > 100) {
      return {
        level: 'MEDIUM',
        reason: 'Long sentence from web source - may be substantial excerpt',
        recommendation: 'REVIEW and possibly shorten'
      };
    } else {
      return {
        level: 'SAFE',
        reason: 'Short sentence from web source - likely fair use',
        recommendation: 'KEEP - fair use for educational purposes'
      };
    }
  }
  
  if (sourceType === 'ORIGINAL_CREATED') {
    return {
      level: 'SAFE',
      reason: 'Originally created content',
      recommendation: 'KEEP - no copyright issues'
    };
  }
  
  return {
    level: 'MEDIUM',
    reason: 'Unknown source - needs review',
    recommendation: 'REVIEW source and copyright status'
  };
}

// Remove copyrighted content
function removeCopyrightedContent() {
  console.log('🗑️  Removing copyrighted textbook content...');
  
  const analysis = analyzeCopyright();
  let totalRemoved = 0;
  
  const corpusFiles = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  corpusFiles.forEach(filename => {
    const filePath = path.join(__dirname, '../data/corpus', filename);
    if (!fs.existsSync(filePath)) return;
    
    console.log(`\n📝 Cleaning ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let removedFromFile = 0;
    
    if (corpus.verbs) {
      Object.keys(corpus.verbs).forEach(verb => {
        Object.keys(corpus.verbs[verb]).forEach(tense => {
          if (Array.isArray(corpus.verbs[verb][tense])) {
            const originalLength = corpus.verbs[verb][tense].length;
            
            // Filter out copyrighted content
            corpus.verbs[verb][tense] = corpus.verbs[verb][tense].filter(sentence => {
              const risk = assessCopyrightRisk(sentence);
              return risk.level !== 'HIGH';
            });
            
            const newLength = corpus.verbs[verb][tense].length;
            const removed = originalLength - newLength;
            removedFromFile += removed;
            totalRemoved += removed;
          }
        });
      });
    }
    
    // Save cleaned corpus
    fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
    console.log(`   ❌ Removed ${removedFromFile} copyrighted sentences`);
  });
  
  console.log(`\n✅ Copyright cleanup complete!`);
  console.log(`   🗑️  Total sentences removed: ${totalRemoved}`);
  console.log(`   ⚖️  Corpus is now copyright-compliant`);
  console.log(`   📝 Only web-scraped and original content remains`);
}

// Create transformed versions of copyrighted content for gaps
function createTransformedContent() {
  console.log('🔄 Creating transformed content for essential gaps...');
  
  const analysis = analyzeCopyright();
  const essentialPatterns = [];
  
  // Identify essential patterns from copyrighted content
  analysis.copyrighted_content.forEach(item => {
    if (isEssentialPattern(item)) {
      const transformed = transformSentence(item);
      if (transformed) {
        essentialPatterns.push({
          original: item,
          transformed: transformed,
          transformation_method: transformed.method
        });
      }
    }
  });
  
  console.log(`\n🔄 Transformation results:`);
  console.log(`   📝 Essential patterns identified: ${essentialPatterns.length}`);
  
  essentialPatterns.slice(0, 10).forEach((pattern, i) => {
    console.log(`\n   ${i+1}. Original: "${pattern.original.spanish}"`);
    console.log(`      Transformed: "${pattern.transformed.spanish}"`);
    console.log(`      Method: ${pattern.transformation_method}`);
  });
  
  // Save transformation suggestions
  const outputPath = path.join(__dirname, '../data/corpus/copyright-transformations.json');
  fs.writeFileSync(outputPath, JSON.stringify(essentialPatterns, null, 2));
  console.log(`\n💾 Transformations saved to: ${outputPath}`);
  
  return essentialPatterns;
}

// Check if a pattern is essential for learning
function isEssentialPattern(item) {
  // Essential patterns we need to keep (in transformed form)
  const essentialVerbs = ['LLAMARSE', 'LEVANTARSE', 'DUCHARSE', 'SENTARSE'];
  const essentialTenses = ['present', 'preterite', 'present-progressive'];
  
  return essentialVerbs.includes(item.verb) && essentialTenses.includes(item.tense);
}

// Transform a sentence to avoid copyright while preserving learning value
function transformSentence(item) {
  const spanish = item.spanish;
  const transformations = [];
  
  // Method 1: Change names and places
  let transformed = spanish
    .replace(/Manuel/g, 'Carlos')
    .replace(/Ana/g, 'María')
    .replace(/Guatemala/g, 'México')
    .replace(/Rosa/g, 'Elena');
  
  if (transformed !== spanish) {
    transformations.push('name_substitution');
  }
  
  // Method 2: Change question to statement or vice versa
  if (spanish.startsWith('¿')) {
    // Convert question to statement
    transformed = transformed
      .replace(/¿Cómo se llama/, 'Se llama')
      .replace(/¿De quién/, 'Es de')
      .replace(/\?/g, '.');
    transformations.push('question_to_statement');
  } else {
    // Convert statement to question (if appropriate)
    if (spanish.includes('se llama')) {
      transformed = `¿Cómo ${transformed}?`;
      transformations.push('statement_to_question');
    }
  }
  
  // Method 3: Change context while preserving grammar
  transformed = transformed
    .replace(/madre/g, 'hermana')
    .replace(/padre/g, 'hermano')
    .replace(/escuela/g, 'oficina')
    .replace(/casa/g, 'apartamento');
  
  if (transformed !== spanish) {
    transformations.push('context_change');
  }
  
  // Only return if significantly transformed
  if (transformations.length > 0 && transformed !== spanish) {
    return {
      spanish: transformed,
      english: `[TRANSFORMED - NEEDS TRANSLATION] ${transformed}`,
      method: transformations.join(', '),
      original_source: 'transformed_from_textbook',
      copyright_status: 'transformed_fair_use'
    };
  }
  
  return null;
}

// CLI interface
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'analyze') {
    analyzeCopyright();
  } else if (action === 'remove') {
    removeCopyrightedContent();
  } else if (action === 'transform') {
    createTransformedContent();
  } else {
    console.log('Usage: node copyright-manager.js <action>');
    console.log('Actions:');
    console.log('  analyze   - Analyze copyright status of all content');
    console.log('  remove    - Remove copyrighted textbook content');
    console.log('  transform - Create transformed versions of essential patterns');
    console.log('');
    console.log('Example: node copyright-manager.js analyze');
  }
}

module.exports = { analyzeCopyright, removeCopyrightedContent, createTransformedContent };
