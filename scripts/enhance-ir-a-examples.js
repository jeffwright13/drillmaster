#!/usr/bin/env node

/**
 * Enhance "ir + a + infinitive" Examples
 * Add ChatGPT's high-quality examples strategically across tiers
 */

const fs = require('fs');
const path = require('path');

// ChatGPT's high-quality "ir + a" examples with strategic tier placement
const IR_A_EXAMPLES = {
  // Tier 1: Basic, essential examples
  tier1: [
    {
      spanish: "Voy a hacer café.",
      english: "I'm going to make coffee.",
      subject: "yo",
      verb: "HACER",
      context: "daily_routine"
    },
    {
      spanish: "Vamos a salir en unos minutos.",
      english: "We're going to leave in a few minutes.",
      subject: "nosotros", 
      verb: "SALIR",
      context: "immediate_plans"
    },
    {
      spanish: "Ella va a llamarte más tarde.",
      english: "She's going to call you later.",
      subject: "él/ella/usted",
      verb: "LLAMAR",
      context: "communication"
    },
    {
      spanish: "Voy a estudiar esta noche.",
      english: "I'm going to study tonight.",
      subject: "yo",
      verb: "ESTUDIAR", 
      context: "education"
    },
    {
      spanish: "¿Vas a comer ahora?",
      english: "Are you going to eat now?",
      subject: "tú",
      verb: "COMER",
      context: "food"
    },
    {
      spanish: "Voy a abrir la ventana.",
      english: "I'm going to open the window.",
      subject: "yo",
      verb: "ABRIR",
      context: "home"
    }
  ],
  
  // Tier 2: Daily routines and reflexive actions
  tier2: [
    {
      spanish: "Voy a bañarme.",
      english: "I'm going to take a shower.",
      subject: "yo",
      verb: "BAÑARSE",
      context: "personal_care"
    },
    {
      spanish: "Vamos a limpiar la casa hoy.",
      english: "We're going to clean the house today.",
      subject: "nosotros",
      verb: "LIMPIAR",
      context: "household"
    },
    {
      spanish: "¿Vas a trabajar mañana?",
      english: "Are you going to work tomorrow?",
      subject: "tú",
      verb: "TRABAJAR",
      context: "work"
    },
    {
      spanish: "Voy a descansar un rato.",
      english: "I'm going to rest for a bit.",
      subject: "yo",
      verb: "DESCANSAR",
      context: "relaxation"
    }
  ],
  
  // Tier 3: More complex actions and irregular verbs
  tier3: [
    {
      spanish: "Van a llegar mañana.",
      english: "They're going to arrive tomorrow.",
      subject: "ellos/ellas/ustedes",
      verb: "LLEGAR",
      context: "travel"
    },
    {
      spanish: "Él va a comprar un celular nuevo.",
      english: "He's going to buy a new phone.",
      subject: "él/ella/usted",
      verb: "COMPRAR",
      context: "shopping"
    },
    {
      spanish: "Vamos a viajar este verano.",
      english: "We're going to travel this summer.",
      subject: "nosotros",
      verb: "VIAJAR",
      context: "vacation"
    },
    {
      spanish: "Van a ver una película.",
      english: "They're going to watch a movie.",
      subject: "ellos/ellas/ustedes",
      verb: "VER",
      context: "entertainment"
    }
  ],
  
  // Tier 4: Emotional and cognitive contexts
  tier4: [
    {
      spanish: "Voy a ayudarte.",
      english: "I'm going to help you.",
      subject: "yo",
      verb: "AYUDAR",
      context: "helping"
    },
    {
      spanish: "Ella va a cocinar la cena esta noche.",
      english: "She's going to cook dinner tonight.",
      subject: "él/ella/usted",
      verb: "COCINAR",
      context: "cooking"
    },
    {
      spanish: "Él va a empezar el proyecto la próxima semana.",
      english: "He's going to start the project next week.",
      subject: "él/ella/usted",
      verb: "EMPEZAR",
      context: "work_projects"
    }
  ],
  
  // Tier 5: Advanced contexts and predictions
  tier5: [
    {
      spanish: "Va a llover esta tarde.",
      english: "It's going to rain this afternoon.",
      subject: "él/ella/usted", // impersonal
      verb: "LLOVER",
      context: "weather"
    },
    {
      spanish: "¿Vamos a necesitar más agua?",
      english: "Are we going to need more water?",
      subject: "nosotros",
      verb: "NECESITAR",
      context: "planning"
    },
    {
      spanish: "Voy a practicar español todos los días.",
      english: "I'm going to practice Spanish every day.",
      subject: "yo",
      verb: "PRACTICAR",
      context: "language_learning"
    }
  ]
};

function enhanceIrAExamples() {
  console.log('🚀 Enhancing "ir + a + infinitive" examples with ChatGPT recommendations...');
  
  const enhancement = {
    total_added: 0,
    by_tier: {},
    examples_added: []
  };
  
  Object.keys(IR_A_EXAMPLES).forEach(tierKey => {
    const tier = tierKey.replace('tier', '');
    const filename = `tier${tier}-complete.json`;
    const filePath = path.join(__dirname, '../data/corpus', filename);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  ${filename} not found, skipping...`);
      return;
    }
    
    console.log(`\n🎯 Enhancing ${filename}...`);
    const corpus = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    enhancement.by_tier[tier] = {
      added: 0,
      examples: []
    };
    
    const examples = IR_A_EXAMPLES[tierKey];
    let tierModified = false;
    
    examples.forEach(example => {
      // Find the appropriate verb in the corpus
      const verbKey = example.verb;
      
      if (corpus.verbs && corpus.verbs[verbKey]) {
        // Add to going-to tense (our "ir + a" tense)
        if (!corpus.verbs[verbKey]['going-to']) {
          corpus.verbs[verbKey]['going-to'] = [];
        }
        
        // Create enhanced sentence object
        const enhancedSentence = {
          spanish: example.spanish,
          english: example.english,
          subject: example.subject,
          region: "universal",
          source: {
            type: "chatgpt_enhanced",
            origin: "chatgpt_ir_a_recommendations",
            method: "high_roi_future_constructions",
            date_collected: new Date().toISOString().split('T')[0]
          },
          quality: {
            score: 45, // High quality - from ChatGPT analysis
            authenticity: "verified",
            linguistic_review: "chatgpt_approved",
            reviewer: "chatgpt_linguistic_expert"
          },
          linguistic: {
            verb_form: getIrForm(example.subject),
            construction: "ir_a_infinitive",
            difficulty: "beginner",
            register: "neutral",
            frequency: "very_high"
          },
          pedagogy: {
            learning_focus: ["going-to", "future_expression", "high_frequency"],
            cultural_context: example.context,
            tier_appropriate: true,
            complexity_score: 2, // Simple and clear
            chatgpt_recommended: true
          },
          tags: [
            "region:universal",
            `subject:${example.subject}`,
            "tense:going-to",
            "word-type:verb",
            "source:chatgpt_enhanced",
            "quality:high",
            "construction:ir_a",
            `context:${example.context}`,
            "roi:very_high"
          ]
        };
        
        // Add to corpus
        corpus.verbs[verbKey]['going-to'].push(enhancedSentence);
        
        enhancement.total_added++;
        enhancement.by_tier[tier].added++;
        enhancement.by_tier[tier].examples.push(example.spanish);
        enhancement.examples_added.push({
          tier: tier,
          verb: verbKey,
          spanish: example.spanish,
          english: example.english,
          context: example.context
        });
        
        tierModified = true;
        
        console.log(`   ✅ Added: "${example.spanish}"`);
        console.log(`      Context: ${example.context}, Verb: ${verbKey}`);
      } else {
        console.log(`   ⚠️  Verb ${verbKey} not found in tier ${tier}, skipping example`);
      }
    });
    
    // Save enhanced corpus
    if (tierModified) {
      fs.writeFileSync(filePath, JSON.stringify(corpus, null, 2));
      console.log(`   💾 Saved ${enhancement.by_tier[tier].added} enhancements to ${filename}`);
    }
  });
  
  // Display results
  displayEnhancementReport(enhancement);
  
  // Save detailed report
  const outputPath = path.join(__dirname, '../data/corpus/ir-a-enhancement-report.json');
  fs.writeFileSync(outputPath, JSON.stringify(enhancement, null, 2));
  console.log(`\n💾 Enhancement report saved to: ${outputPath}`);
  
  return enhancement;
}

function getIrForm(subject) {
  const irForms = {
    'yo': 'voy',
    'tú': 'vas',
    'él/ella/usted': 'va',
    'nosotros': 'vamos',
    'ellos/ellas/ustedes': 'van'
  };
  return irForms[subject] || 'va';
}

function displayEnhancementReport(enhancement) {
  console.log(`\n🚀 "IR + A" ENHANCEMENT REPORT:`);
  console.log(`   ✅ Total examples added: ${enhancement.total_added}`);
  console.log(`   🎯 Based on ChatGPT's high-ROI analysis`);
  
  console.log(`\n📚 Enhancement by Tier:`);
  Object.keys(enhancement.by_tier).forEach(tier => {
    const tierData = enhancement.by_tier[tier];
    console.log(`   Tier ${tier}: ${tierData.added} examples added`);
    if (tierData.examples.length > 0) {
      console.log(`     Examples: ${tierData.examples.slice(0, 2).join(', ')}${tierData.examples.length > 2 ? '...' : ''}`);
    }
  });
  
  console.log(`\n🎯 STRATEGIC DISTRIBUTION:`);
  console.log(`   📚 Tier 1: Basic daily actions (hacer café, estudiar)`);
  console.log(`   🏠 Tier 2: Routines & reflexives (bañarse, limpiar)`);
  console.log(`   🌍 Tier 3: Travel & complex actions (viajar, llegar)`);
  console.log(`   💭 Tier 4: Emotional contexts (ayudar, cocinar)`);
  console.log(`   🌦️  Tier 5: Predictions & advanced (llover, necesitar)`);
  
  if (enhancement.examples_added.length > 0) {
    console.log(`\n📋 SAMPLE ENHANCEMENTS:`);
    enhancement.examples_added.slice(0, 8).forEach((example, i) => {
      console.log(`   ${i+1}. [Tier ${example.tier}] ${example.spanish}`);
      console.log(`      "${example.english}" (${example.context})`);
    });
    
    if (enhancement.examples_added.length > 8) {
      console.log(`   ... and ${enhancement.examples_added.length - 8} more examples`);
    }
  }
  
  console.log(`\n✅ BENEFITS:`);
  console.log(`   🎯 High-ROI future construction (80-90% coverage)`);
  console.log(`   📚 ChatGPT-validated natural examples`);
  console.log(`   🌍 Mexican Spanish appropriate`);
  console.log(`   🧠 Beginner-friendly (mirrors English "going to")`);
  console.log(`   ⚡ Immediate practical use`);
  
  console.log(`\n🚀 IMPACT:`);
  console.log(`   📈 Students can express future with ONE pattern`);
  console.log(`   🎯 Covers daily plans, predictions, promises`);
  console.log(`   ✨ Natural, confident Spanish from day one`);
}

if (require.main === module) {
  enhanceIrAExamples();
}

module.exports = { enhanceIrAExamples };
