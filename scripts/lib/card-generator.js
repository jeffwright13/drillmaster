/**
 * Card generation module for DrillMaster CLI
 * Extracted from AppController.js for Node.js usage
 */

class CardGenerator {
  constructor(conjugations, regionConfig, tierConfigs, tenseMapping) {
    this.conjugations = conjugations;
    this.regionConfig = regionConfig;
    this.tierConfigs = tierConfigs;
    this.tenseMapping = tenseMapping;
  }

  // Get conjugation for a verb
  getConjugation(verbName) {
    const normalized = verbName.toLowerCase().replace('(se)', 'se');
    const upper = verbName.toUpperCase();
    return this.conjugations[upper] || this.conjugations[normalized] || this.conjugations[verbName.toLowerCase()];
  }

  // Add subject hints for disambiguation
  addSubjectHints(english, subject) {
    if (english.includes('(informal)') || english.includes('(formal)') || 
        english.includes('You all') || english.includes('you all')) {
      return english;
    }
    
    switch (subject) {
      case 'tú':
        return english.replace(/\bYou\b/g, 'You (informal)').replace(/\byou\b/g, 'you (informal)');
      case 'él/ella/usted':
        if (english.includes('You') || english.includes('you')) {
          return english.replace(/\bYou\b/g, 'You (formal)').replace(/\byou\b/g, 'you (formal)');
        }
        return english;
      case 'usted':
        return english.replace(/\bYou\b/g, 'You (formal)').replace(/\byou\b/g, 'you (formal)');
      case 'él':
        return english.replace(/\bYou\b/g, 'You (formal)').replace(/\byou\b/g, 'you (formal)');
      case 'ella':
        return english.replace(/\bYou\b/g, 'You (formal)').replace(/\byou\b/g, 'you (formal)');
      case 'ellos/ellas/ustedes':
        if (english.includes('You') || english.includes('you')) {
          return english.replace(/\bYou\b/g, 'You all').replace(/\byou\b/g, 'you all');
        }
        return english;
      case 'ustedes':
        return english.replace(/\bYou\b/g, 'You all').replace(/\byou\b/g, 'you all');
      case 'vos':
        return english.replace(/\bYou\b/g, 'You (vos)').replace(/\byou\b/g, 'you (vos)');
      case 'vosotros':
        return english.replace(/\bYou\b/g, 'You all (Spain)').replace(/\byou\b/g, 'you all (Spain)');
      default:
        return english;
    }
  }

  // Randomization no longer needed - subjects are pre-expanded in corpus

  // Create flexible regex for matching conjugated forms
  createFlexibleRegex(conjugatedForm) {
    const escaped = conjugatedForm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = escaped.normalize('NFD').replace(/[\u0300-\u036f]/g, '[\\u0300-\\u036f]?');
    return new RegExp(`(^|\\s|¡|¿)(${normalized})($|\\s|[.,!?;:])`, 'i');
  }

  // Generate card tags
  generateCardTags(verb, sentence, tense, corpusVerb) {
    const tags = [
      `verb::${verb.verb}`,
      `tense::${tense}`,
      `subject::${sentence.subject.replace(/\//g, '-')}`,
      `tier::${verb.tier || 'unknown'}`
    ];
    
    if (sentence.region && sentence.region !== 'universal') {
      tags.push(`region::${sentence.region}`);
    }
    
    if (corpusVerb?.metadata?.tags) {
      corpusVerb.metadata.tags.forEach(tag => tags.push(`type::${tag}`));
    }
    
    return tags;
  }


  // Generate ES→EN translation card
  generateTranslationEStoEN(cards, verb, sentence, tense, corpusVerb) {
    const verbName = verb.verb;
    const { spanish, english } = sentence;
    const currentSubject = sentence.subject;
    
    const conjugation = this.getConjugation(verbName);
    
    // Map subject to conjugation key
    const getConjugationKey = (subject) => {
      if (subject === 'él' || subject === 'ella' || subject === 'usted') return 'él/ella/usted';
      if (subject === 'ellos' || subject === 'ellas' || subject === 'ustedes') return 'ellos/ellas/ustedes';
      return subject;
    };
    
    const conjugationKey = getConjugationKey(currentSubject);
    if (!conjugation || !conjugation[tense] || !conjugation[tense][conjugationKey]) {
      return;
    }
    
    const conjugatedForm = conjugation[tense][conjugationKey];
    let highlightedSpanish = spanish;
    
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (!BACKWARDS_VERBS.includes(verbName)) {
      const regex = this.createFlexibleRegex(conjugatedForm);
      const match = spanish.match(regex);
      if (match) {
        highlightedSpanish = spanish.replace(regex, `$1<strong>$2</strong>$3`);
      }
    }
    
    // Add Spanish pronoun to eliminate ambiguity naturally
    const spanishPronouns = {
      'yo': 'Yo',
      'tú': 'Tú',
      'él': 'Él',
      'ella': 'Ella', 
      'usted': 'Usted',
      'nosotros': 'Nosotros',
      'ellos': 'Ellos',
      'ellas': 'Ellas',
      'ustedes': 'Ustedes',
      'vos': 'Vos',
      'vosotros': 'Vosotros'
    };
    
    const pronoun = spanishPronouns[currentSubject] || currentSubject;
    
    // Handle questions correctly - pronoun goes after ¿, not before
    let spanishWithPronoun;
    if (highlightedSpanish.startsWith('¿')) {
      spanishWithPronoun = highlightedSpanish.replace(/^¿/, `¿${pronoun} `).toLowerCase();
      // Capitalize the first letter after ¿
      spanishWithPronoun = spanishWithPronoun.replace(/^¿([a-z])/, (match, letter) => `¿${letter.toUpperCase()}`);
    } else {
      spanishWithPronoun = `${pronoun} ${highlightedSpanish.toLowerCase()}`;
    }
    
    const englishWithHints = english;
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    cards.push({
      type: 'trans-es-en',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: currentSubject,
      region: sentence.region,
      front: spanishWithPronoun,
      back: `<div style="font-size: 1.1em; margin-bottom: 0.5em;">${englishWithHints}</div><div style="font-size: 0.85em; color: #666; margin-top: 0.5em;"><em>${verbName.toLowerCase()} (${verb.english}) - ${tense}</em></div>`,
      tags: tags.join(';')
    });
  }

  // Generate EN→ES translation card
  generateTranslationENtoES(cards, verb, sentence, tense, corpusVerb) {
    const verbName = verb.verb;
    const { spanish, english } = sentence;
    const currentSubject = sentence.subject;
    
    const conjugation = this.getConjugation(verbName);
    
    // Map subject to conjugation key
    const getConjugationKey = (subject) => {
      if (subject === 'él' || subject === 'ella' || subject === 'usted') return 'él/ella/usted';
      if (subject === 'ellos' || subject === 'ellas' || subject === 'ustedes') return 'ellos/ellas/ustedes';
      return subject;
    };
    
    const conjugationKey = getConjugationKey(currentSubject);
    if (!conjugation || !conjugation[tense] || !conjugation[tense][conjugationKey]) {
      return;
    }
    
    const conjugatedForm = conjugation[tense][conjugationKey];
    let highlightedSpanish = spanish;
    
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (!BACKWARDS_VERBS.includes(verbName)) {
      const regex = this.createFlexibleRegex(conjugatedForm);
      const match = spanish.match(regex);
      if (match) {
        highlightedSpanish = spanish.replace(regex, `$1<strong>$2</strong>$3`);
      }
    }
    
    // English already has disambiguation hints in the corpus (e.g., "You (informal)")
    // No need to add headers - keep the existing English sentence as-is
    
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    cards.push({
      type: 'trans-en-es',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: currentSubject,
      region: sentence.region,
      front: english,
      back: `<div style="font-size: 1.1em;">${highlightedSpanish}</div>`,
      tags: tags.join(';')
    });
  }


  // Generate cards for a tier
  generateTierCards(tierNum, verbs, corpus) {
    const cards = [];
    const tierConfig = this.tierConfigs[tierNum];
    const cardTypes = ['trans-en-es', 'trans-es-en'];
    
    // Get verbs for this tier
    const tierVerbs = verbs.filter(v => v.tier === tierNum);
    
    // Get corpus verbs for this tier
    const corpusVerbs = corpus[tierNum]?.verbs || {};
    
    tierVerbs.forEach(verb => {
      const corpusVerb = corpusVerbs[verb.verb] || corpusVerbs[verb.verb.toUpperCase()];
      if (!corpusVerb) return;
      
      tierConfig.tenseOrder.forEach(tense => {
        const sentences = corpusVerb[tense];
        if (!sentences) return;
        
        sentences.forEach(sentence => {
          // Filter by region config
          if (!this.regionConfig.subjects.includes(sentence.subject)) return;
          if (!this.regionConfig.regions.includes(sentence.region) && sentence.region !== 'universal') return;
          
          cardTypes.forEach(cardType => {
            if (cardType === 'trans-es-en') {
              this.generateTranslationEStoEN(cards, verb, sentence, tense, corpusVerb);
            } else if (cardType === 'trans-en-es') {
              this.generateTranslationENtoES(cards, verb, sentence, tense, corpusVerb);
            }
          });
        });
      });
    });
    
    return cards;
  }

  // Group cards by tense and skill level
  groupCardsByTense(cards) {
    const grouped = {};
    
    cards.forEach(card => {
      const tense = card.tense;
      if (!grouped[tense]) {
        grouped[tense] = { recognition: [], production: [] };
      }
      
      if (card.type === 'trans-es-en') {
        grouped[tense].recognition.push(card);
      } else if (card.type === 'trans-en-es') {
        grouped[tense].production.push(card);
      }
    });
    
    return grouped;
  }

  // Create deck structure
  createDeckStructure(tierNum, cardsByTense) {
    const config = this.tierConfigs[tierNum];
    const baseDeckId = 1607392320 + (tierNum * 1000);
    
    const structure = {
      main: {
        id: baseDeckId,
        name: `Tier ${tierNum}: ${config.name}`
      },
      subdecks: {}
    };
    
    let subdeckCounter = 1;
    const orderedTenses = config.tenseOrder.filter(t => cardsByTense[t]);
    
    orderedTenses.forEach((tenseName, tenseIndex) => {
      const tenseOrderPrefix = String(tenseIndex + 1).padStart(2, '0');
      const displayName = this.tenseMapping[tenseName] || tenseName;
      
      const skillLevels = [
        { key: 'recognition', name: 'A Recognition (ES→EN)' },
        { key: 'production', name: 'B Production (EN→ES)' }
      ];
      
      skillLevels.forEach(skill => {
        const skillCards = cardsByTense[tenseName]?.[skill.key];
        if (skillCards && skillCards.length > 0) {
          const subdeckId = baseDeckId + subdeckCounter;
          const subdeckKey = `${tenseName}_${skill.key}`;
          
          structure.subdecks[subdeckKey] = {
            id: subdeckId,
            name: `Tier ${tierNum}: ${config.name}::${tenseOrderPrefix} ${displayName}::${skill.name}`,
            cards: skillCards
          };
          subdeckCounter++;
        }
      });
    });
    
    return structure;
  }

  // Generate GUID
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Generate checksum
  generateChecksum(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  // Create APKG file
  async createApkg(tierNum, cards) {
    // Dynamic imports for ESM modules
    const initSqlJs = require('sql.js');
    const JSZip = require('jszip');
    
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    const baseNoteTypeId = 1607392319;
    const baseClozeNoteTypeId = 1607392321;
    const now = Date.now();
    
    // Create schema
    db.exec(`
      CREATE TABLE col (id INTEGER PRIMARY KEY, crt INTEGER NOT NULL, mod INTEGER NOT NULL, scm INTEGER NOT NULL, ver INTEGER NOT NULL, dty INTEGER NOT NULL, usn INTEGER NOT NULL, ls INTEGER NOT NULL, conf TEXT NOT NULL, models TEXT NOT NULL, decks TEXT NOT NULL, dconf TEXT NOT NULL, tags TEXT NOT NULL);
      CREATE TABLE notes (id INTEGER PRIMARY KEY, guid TEXT NOT NULL, mid INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL, tags TEXT NOT NULL, flds TEXT NOT NULL, sfld TEXT NOT NULL, csum INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE TABLE cards (id INTEGER PRIMARY KEY, nid INTEGER NOT NULL, did INTEGER NOT NULL, ord INTEGER NOT NULL, mod INTEGER NOT NULL, usn INTEGER NOT NULL, type INTEGER NOT NULL, queue INTEGER NOT NULL, due INTEGER NOT NULL, ivl INTEGER NOT NULL, factor INTEGER NOT NULL, reps INTEGER NOT NULL, lapses INTEGER NOT NULL, left INTEGER NOT NULL, odue INTEGER NOT NULL, odid INTEGER NOT NULL, flags INTEGER NOT NULL, data TEXT NOT NULL);
      CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL);
      CREATE TABLE revlog (id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL, ease INTEGER NOT NULL, ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL, factor INTEGER NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL);
    `);
    
    // Group cards by tense
    const cardsByTense = this.groupCardsByTense(cards);
    const deckStructure = this.createDeckStructure(tierNum, cardsByTense);
    
    // Build models JSON
    const modelsJson = {
      [baseNoteTypeId]: {
        id: baseNoteTypeId, name: "Drillmaster Translation", type: 0, mod: Math.floor(now / 1000), usn: 0, sortf: 0, did: null,
        tmpls: [{ name: "Card 1", ord: 0, qfmt: "{{Front}}", afmt: "{{Front}}<hr id=answer>{{Back}}", bqfmt: "", bafmt: "", did: null, bfont: "", bsize: 0 }],
        flds: [{ name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 }, { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 }],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }",
        latexPre: "", latexPost: "", latexsvg: false, req: [[0, "any", [0]]]
      },
      [baseClozeNoteTypeId]: {
        id: baseClozeNoteTypeId, name: "Drillmaster Cloze", type: 1, mod: Math.floor(now / 1000), usn: 0, sortf: 0, did: null,
        tmpls: [{ name: "Cloze", ord: 0, qfmt: "{{cloze:Text}}", afmt: "{{cloze:Text}}<br>{{Extra}}", bqfmt: "", bafmt: "", did: null, bfont: "", bsize: 0 }],
        flds: [{ name: "Text", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 }, { name: "Extra", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 }],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } .cloze { font-weight: bold; color: #0066cc; }",
        latexPre: "", latexPost: "", latexsvg: false, req: [[0, "any", [0]]]
      }
    };
    
    // Build decks JSON
    const decksJson = {
      1: { id: 1, name: "Default", extendRev: 50, usn: 0, collapsed: false, newToday: [0, 0], revToday: [0, 0], lrnToday: [0, 0], timeToday: [0, 0], dyn: 0, desc: "", conf: 1, mod: Math.floor(now / 1000) },
      [deckStructure.main.id]: { id: deckStructure.main.id, name: deckStructure.main.name, extendRev: 50, usn: 0, collapsed: false, newToday: [0, 0], revToday: [0, 0], lrnToday: [0, 0], timeToday: [0, 0], dyn: 0, desc: "", conf: 1, mod: Math.floor(now / 1000) }
    };
    
    Object.values(deckStructure.subdecks).forEach(subdeck => {
      decksJson[subdeck.id] = { id: subdeck.id, name: subdeck.name, extendRev: 50, usn: 0, collapsed: false, newToday: [0, 0], revToday: [0, 0], lrnToday: [0, 0], timeToday: [0, 0], dyn: 0, desc: "", conf: 1, mod: Math.floor(now / 1000) };
    });
    
    const configJson = JSON.stringify({ activeDecks: [1], addToCur: true, collapseTime: 1200, curDeck: 1, curModel: baseNoteTypeId, dueCounts: true, estTimes: true, newBury: true, newSpread: 0, nextPos: 1, sortBackwards: false, sortType: "noteFld", timeLim: 0 });
    const deckConfigJson = JSON.stringify({ 1: { id: 1, name: "Default", new: { delays: [1, 10], ints: [1, 4, 7], initialFactor: 2500, separate: true, order: 1, perDay: 20 }, rev: { perDay: 200, ease4: 1.3, fuzz: 0.05, minSpace: 1, ivlFct: 1.0, maxIvl: 36500 }, lapse: { delays: [10], mult: 0.0, minInt: 1, leechFails: 8, leechAction: 0 }, dyn: false, autoplay: true, timer: 0, maxTaken: 60, usn: 0, mod: Math.floor(now / 1000) } });
    
    db.exec(`INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags) VALUES (1, ${Math.floor(now / 1000)}, ${now}, ${now}, 11, 0, 0, 0, '${configJson.replace(/'/g, "''")}', '${JSON.stringify(modelsJson).replace(/'/g, "''")}', '${JSON.stringify(decksJson).replace(/'/g, "''")}', '${deckConfigJson.replace(/'/g, "''")}', '{}')`);
    
    // Insert notes and cards
    let noteId = 1;
    let cardId = 1;
    
    Object.values(deckStructure.subdecks).forEach(subdeck => {
      subdeck.cards.forEach(card => {
        const guid = this.generateGuid();
        const noteTypeId = card.type === 'cloze' ? baseClozeNoteTypeId : baseNoteTypeId;
        const fields = [card.front || '', card.back || ''];
        const fieldsText = fields.join('\x1f');
        const checksum = this.generateChecksum(fieldsText);
        
        db.exec(`INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) VALUES (${noteId}, '${guid}', ${noteTypeId}, ${Math.floor(now / 1000)}, 0, '', '${fieldsText.replace(/'/g, "''")}', '${(fields[0] || '').replace(/'/g, "''")}', ${checksum}, 0, '')`);
        db.exec(`INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) VALUES (${cardId}, ${noteId}, ${subdeck.id}, 0, ${Math.floor(now / 1000)}, 0, 0, 0, ${cardId}, 0, 2500, 0, 0, 0, 0, 0, 0, '')`);
        
        noteId++;
        cardId++;
      });
    });
    
    // Create ZIP
    const zip = new JSZip();
    const dbData = db.export();
    zip.file('collection.anki2', Buffer.from(dbData));
    zip.file('media', '{}');
    
    return await zip.generateAsync({ type: 'nodebuffer' });
  }
}

module.exports = CardGenerator;
