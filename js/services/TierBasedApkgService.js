/**
 * Tier-Based APKG Service - Generate pedagogically structured .apkg files
 * 
 * Creates 5 tier-based .apkg files, each with subdecks following the 
 * pedagogical progression outlined in PEDAGOGICAL_MAP.md
 */

class TierBasedApkgService {
  constructor() {
    this.baseNoteTypeId = 1607392319;
    this.baseClozeNoteTypeId = 1607392321;
    this.baseDeckId = 1607392320;
    
    // Tense mapping from corpus to display names (using TENSE_TERMINOLOGY_AND_VERB_USE.md)
    this.tenseMapping = {
      'present': 'Present',
      'present-progressive': 'Gerund',
      'going-to': 'Going-to Future', 
      'preterite': 'Preterite',
      'present-perfect': 'Present Perfect',
      'future': 'Simple Future'
    };

    // Tier configurations - will be populated dynamically from actual corpus data
    this.tierConfigs = {
      1: {
        name: 'Foundations',
        verbs: [], // Will be populated from actual verbs
        tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect', 'future']
      },
      2: {
        name: 'Daily Routines',
        verbs: [], // Will be populated from actual verbs
        tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite']
      },
      3: {
        name: 'Irregular Essentials',
        verbs: [], // Will be populated from actual verbs
        tenseOrder: ['present', 'present-progressive', 'going-to', 'preterite', 'present-perfect']
      },
      4: {
        name: 'Emotional & Cognitive',
        verbs: [], // Will be populated from actual verbs
        tenseOrder: ['present', 'present-progressive', 'going-to', 'present-perfect']
      },
      5: {
        name: 'Gustar-Type Verbs',
        verbs: [], // Will be populated from actual verbs
        tenseOrder: ['present', 'going-to', 'preterite']
      }
    };
  }

  /**
   * Populate tier configurations with actual verbs from the corpus
   */
  populateTierConfigs(appController) {
    // Group verbs by tier from the actual 
    for (let tierNum = 1; tierNum <= 5; tierNum++) {
      // Get verbs from verb list that match this tier
      const verbListTierVerbs = appController.state.verbs
        .filter(v => v.tags?.tier === tierNum.toString())
        .map(v => v.verb.toLowerCase());
      
      // Get verbs that actually exist in the corpus data for this tier
      const corpusVerbs = appController.data.corpus[tierNum]?.verbs ? 
        Object.keys(appController.data.corpus[tierNum].verbs).map(v => v.toLowerCase()) : [];
      
      // Use intersection of both - only verbs that exist in both places
      const availableVerbs = verbListTierVerbs.filter(verb => 
        corpusVerbs.includes(verb.toUpperCase()) || corpusVerbs.includes(verb)
      );
      
      this.tierConfigs[tierNum].verbs = availableVerbs;
      console.log(`📋 Tier ${tierNum} (${this.tierConfigs[tierNum].name}): ${availableVerbs.length} verbs ${JSON.stringify(availableVerbs)}`);
      
      if (availableVerbs.length !== verbListTierVerbs.length) {
        const missingVerbs = verbListTierVerbs.filter(verb => !availableVerbs.includes(verb));
        console.warn(`⚠️ Tier ${tierNum} missing corpus data for: ${missingVerbs.join(', ')}`);
      }
    }
  }

  /**
   * Generate all 5 tier-based .apkg files
   */
  async generateAllTierApkgs(appController) {
    // First, populate tier configs with actual verb data
    this.populateTierConfigs(appController);
    
    const results = [];
    
    for (let tierNum = 1; tierNum <= 5; tierNum++) {
      try {
        console.log(`🚀 Generating Tier ${tierNum} .apkg...`);
        const result = await this.generateTierApkg(tierNum, appController);
        results.push(result);
        console.log(`✅ Tier ${tierNum} complete: ${result.filename}`);
      } catch (error) {
        console.error(`❌ Failed to generate Tier ${tierNum}:`, error);
        results.push({ tier: tierNum, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Generate a single tier .apkg with subdecks
   */
  async generateTierApkg(tierNum, appController) {
    const config = this.tierConfigs[tierNum];
    if (!config) {
      throw new Error(`Invalid tier number: ${tierNum}`);
    }

    // Generate cards for this tier
    const tierCards = await this.generateTierCards(tierNum, appController);
    
    // Group cards by tense for subdecks
    const cardsByTense = this.groupCardsByTense(tierCards, config.tenseOrder);
    
    // Create .apkg with subdecks
    const apkgBlob = await this.createTierApkg(tierNum, config, cardsByTense);
    
    // Generate filename and download
    const filename = this.generateTierFilename(tierNum, config);
    this.downloadFile(apkgBlob, filename);
    
    return {
      tier: tierNum,
      filename: filename,
      totalCards: tierCards.length,
      subdecks: Object.keys(cardsByTense).length
    };
  }

  /**
   * Generate cards for a specific tier
   */
  async generateTierCards(tierNum, appController) {
    try {
      // Store original state to restore later
      const originalState = {
        selectedVerbs: appController.state.selectedVerbs,
        generatedCards: appController.state.generatedCards,
        cardSettings: { ...appController.state.cardSettings }
      };
      
      // Get verbs for this tier
      const tierVerbs = this.tierConfigs[tierNum].verbs;
      
      // Find verb objects that match this tier
      console.log(`🔍 Looking for tier ${tierNum} verbs: (${tierVerbs.length}) ${tierVerbs.join(', ')}`);
      console.log(`🔍 Total verbs available:`, appController.state.verbs.length);
      const sampleVerbs = appController.state.verbs.slice(0, 3);
      sampleVerbs.forEach((v, i) => {
        console.log(`🔍 Verb ${i}:`, {
          id: v.id,
          verb: v.verb,
          english: v.english,
          tagsRaw: v.tagsRaw,
          tags: v.tags,
          tier: v.tags?.tier,
          tierType: typeof v.tags?.tier
        });
      });
      
      const tierVerbObjects = appController.state.verbs.filter(v => 
        tierVerbs.includes(v.verb.toLowerCase()) && v.tags?.tier === tierNum.toString()
      );
      
      console.log(`🔍 Found ${tierVerbObjects.length} matching verb objects for tier ${tierNum}`);
      
      // Set selected verbs for this tier and configure corpus tiers
      appController.state.selectedVerbs = new Set(tierVerbObjects.map(v => v.id));
      appController.state.cardSettings.corpusTiers = [tierNum];
      appController.state.cardSettings.regions = ['universal']; // Mexico/LA only - exclude argentina/spain
      
      // Generate cards using the existing method (Mexico-focused: no vos/vosotros)
      const cardTypes = ['trans-en-es', 'trans-es-en', 'cloze', 'conjugation'];
      const tenses = this.tierConfigs[tierNum].tenseOrder;
      const subjects = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes']; // Mexico only
      const conjugations = appController.data.conjugations;
      
      // Call the actual card generation method directly
      const generatedCards = appController.generateCorpusCards(tierVerbObjects, cardTypes, tenses, subjects, conjugations);
      
      console.log(`🔍 Tier ${tierNum} debug:`, {
        tierVerbs: tierVerbs.length,
        foundVerbObjects: tierVerbObjects.length,
        generatedCards: generatedCards.length,
        verbObjects: tierVerbObjects.map(v => `${v.verb} (id:${v.id}, tier:${v.tier})`)
      });
      
      return generatedCards;
      
    } catch (error) {
      console.error(`Error generating tier ${tierNum} cards:`, error);
      throw error;
    } finally {
      // Restore original state - use try/catch to handle any scope issues
      console.log('🔧 Restoring state for tier', tierNum);
      try {
        if (typeof originalState !== 'undefined' && originalState) {
          appController.state.selectedVerbs = originalState.selectedVerbs;
          appController.state.generatedCards = originalState.generatedCards;
          appController.state.cardSettings = originalState.cardSettings;
          console.log('✅ State restored successfully');
        } else {
          console.warn('⚠️ originalState not available, skipping state restoration');
        }
      } catch (restoreError) {
        console.warn('⚠️ Error during state restoration:', restoreError.message);
      }
    }
  }

  /**
   * Group cards by tense and skill level for pedagogical progression
   */
  groupCardsByTense(cards) {
    const cardsByTenseAndSkill = {};
    
    cards.forEach(card => {
      const tense = card.tense;
      if (!cardsByTenseAndSkill[tense]) {
        cardsByTenseAndSkill[tense] = {
          recognition: [], // ES→EN (easier)
          production: [],  // EN→ES (harder)
          grammar: []      // Cloze & Conjugation (mastery)
        };
      }
      
      // Categorize by card type for skill progression
      if (card.type === 'trans-es-en') {
        cardsByTenseAndSkill[tense].recognition.push(card);
      } else if (card.type === 'trans-en-es') {
        cardsByTenseAndSkill[tense].production.push(card);
      } else if (card.type === 'cloze' || card.type === 'conjugation') {
        cardsByTenseAndSkill[tense].grammar.push(card);
      }
    });
    
    return cardsByTenseAndSkill;
  }

  /**
   * Create .apkg file with subdecks
   */
  async createTierApkg(tierNum, config, cardsByTense) {
    // Load required libraries
    const SQL = await this.loadSqlJs();
    const JSZip = await this.loadJSZip();
    
    const db = new SQL.Database();
    
    // Create Anki database schema
    this.createAnkiSchema(db);
    
    // Insert collection data
    this.insertCollection(db, tierNum, config);
    
    // Create main deck and subdecks
    const deckStructure = this.createDeckStructure(tierNum, config, cardsByTense);
    this.insertDecks(db, deckStructure);
    
    // Insert note type
    this.insertNoteType(db);
    
    // Insert notes and cards for each subdeck
    let noteId = 1;
    let cardId = 1;
    let totalInserted = 0;
    
    // Calculate total cards across all skill levels
    const totalCards = Object.values(deckStructure.subdecks).reduce((sum, subdeck) => sum + subdeck.cards.length, 0);
    
    console.log(`🔍 Creating .apkg for Tier ${tierNum}:`, {
      totalCards: totalCards,
      subdecks: Object.keys(deckStructure.subdecks),
      subdeckDetails: Object.fromEntries(Object.entries(deckStructure.subdecks).map(([k,v]) => [k, v.cards.length]))
    });
    
    // Insert cards for each skill-based subdeck
    Object.entries(deckStructure.subdecks).forEach(([subdeckKey, subdeck]) => {
      subdeck.cards.forEach(card => {
        this.insertNote(db, noteId, card);
        this.insertCard(db, cardId, noteId, subdeck.id, card);
        noteId++;
        cardId++;
        totalInserted++;
      });
    });
    
    console.log(`📝 Inserted ${totalInserted} notes into Tier ${tierNum} database`);
    
    // Create .apkg ZIP
    const zip = new JSZip();
    const dbData = db.export();
    zip.file('collection.anki2', dbData);
    zip.file('media', '{}'); // Empty media file
    
    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Create deck structure with main deck and skill-based subdecks
   */
  createDeckStructure(tierNum, config, cardsByTenseAndSkill) {
    const mainDeckId = this.baseDeckId + (tierNum * 1000);
    const structure = {
      main: {
        id: mainDeckId,
        name: `Tier ${tierNum}: ${config.name}`
      },
      subdecks: {}
    };
    
    // Create ordered list based on pedagogical tense order
    const tenseOrder = config.tenseOrder;
    const orderedTenses = tenseOrder.filter(tense => cardsByTenseAndSkill[tense]);
    
    let subdeckCounter = 1;
    orderedTenses.forEach((tenseName, tenseIndex) => {
      const tenseOrderPrefix = String(tenseIndex + 1).padStart(2, '0');
      const displayName = this.tenseMapping[tenseName] || tenseName;
      
      // Create skill-based subdecks for each tense
      const skillLevels = [
        { key: 'recognition', name: 'A Recognition (ES→EN)', description: 'Spanish to English - easier' },
        { key: 'production', name: 'B Production (EN→ES)', description: 'English to Spanish - harder' },
        { key: 'grammar', name: 'C Grammar (Cloze & Conjugation)', description: 'Grammar mastery' }
      ];
      
      skillLevels.forEach(skill => {
        const skillCards = cardsByTenseAndSkill[tenseName]?.[skill.key];
        if (skillCards && skillCards.length > 0) {
          const subdeckId = mainDeckId + subdeckCounter;
          const subdeckKey = `${tenseName}_${skill.key}`;
          
          structure.subdecks[subdeckKey] = {
            id: subdeckId,
            name: `Tier ${tierNum}: ${config.name}::${tenseOrderPrefix} ${displayName}::${skill.name}`,
            parentId: mainDeckId,
            cards: skillCards
          };
          subdeckCounter++;
        }
      });
    });
    
    return structure;
  }

  /**
   * Generate filename for tier .apkg
   */
  generateTierFilename(tierNum, config) {
    const sanitizedName = config.name.replace(/[^a-zA-Z0-9]/g, '');
    return `DrillMaster-Tier${tierNum}-${sanitizedName}.apkg`;
  }

  /**
   * Create Anki database schema
   */
  createAnkiSchema(db) {
    // Collection table
    db.exec(`
      CREATE TABLE col (
        id INTEGER PRIMARY KEY,
        crt INTEGER NOT NULL,
        mod INTEGER NOT NULL,
        scm INTEGER NOT NULL,
        ver INTEGER NOT NULL,
        dty INTEGER NOT NULL,
        usn INTEGER NOT NULL,
        ls INTEGER NOT NULL,
        conf TEXT NOT NULL,
        models TEXT NOT NULL,
        decks TEXT NOT NULL,
        dconf TEXT NOT NULL,
        tags TEXT NOT NULL
      )
    `);

    // Notes table
    db.exec(`
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        guid TEXT NOT NULL,
        mid INTEGER NOT NULL,
        mod INTEGER NOT NULL,
        usn INTEGER NOT NULL,
        tags TEXT NOT NULL,
        flds TEXT NOT NULL,
        sfld TEXT NOT NULL,
        csum INTEGER NOT NULL,
        flags INTEGER NOT NULL,
        data TEXT NOT NULL
      )
    `);

    // Cards table
    db.exec(`
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY,
        nid INTEGER NOT NULL,
        did INTEGER NOT NULL,
        ord INTEGER NOT NULL,
        mod INTEGER NOT NULL,
        usn INTEGER NOT NULL,
        type INTEGER NOT NULL,
        queue INTEGER NOT NULL,
        due INTEGER NOT NULL,
        ivl INTEGER NOT NULL,
        factor INTEGER NOT NULL,
        reps INTEGER NOT NULL,
        lapses INTEGER NOT NULL,
        left INTEGER NOT NULL,
        odue INTEGER NOT NULL,
        odid INTEGER NOT NULL,
        flags INTEGER NOT NULL,
        data TEXT NOT NULL
      )
    `);

    // Required empty tables
    db.exec(`CREATE TABLE graves (usn INTEGER NOT NULL, oid INTEGER NOT NULL, type INTEGER NOT NULL)`);
    db.exec(`CREATE TABLE revlog (id INTEGER PRIMARY KEY, cid INTEGER NOT NULL, usn INTEGER NOT NULL, ease INTEGER NOT NULL, ivl INTEGER NOT NULL, lastIvl INTEGER NOT NULL, factor INTEGER NOT NULL, time INTEGER NOT NULL, type INTEGER NOT NULL)`);
  }

  /**
   * Insert collection configuration
   */
  insertCollection(db, tierNum, config) {
    const now = Date.now();
    const configJson = JSON.stringify({
      activeDecks: [1],
      addToCur: true,
      collapseTime: 1200,
      curDeck: 1,
      curModel: this.baseNoteTypeId,
      dueCounts: true,
      estTimes: true,
      newBury: true,
      newSpread: 0,
      nextPos: 1,
      sortBackwards: false,
      sortType: "noteFld",
      timeLim: 0
    }).replace(/'/g, "''");

    const modelsJson = JSON.stringify({
      [this.baseNoteTypeId]: {
        id: this.baseNoteTypeId,
        name: "Drillmaster Translation",
        type: 0,
        mod: Math.floor(now / 1000),
        usn: 0,
        sortf: 0,
        did: null,
        tmpls: [
          {
            name: "Card 1",
            ord: 0,
            qfmt: "{{Front}}",
            afmt: "{{Front}}<hr id=answer>{{Back}}",
            bqfmt: "",
            bafmt: "",
            did: null,
            bfont: "",
            bsize: 0
          }
        ],
        flds: [
          { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 },
          { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 }
        ],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; }",
        latexPre: "\\documentclass[12pt]{article}\\special{papersize=3in,5in}\\usepackage[utf8]{inputenc}\\usepackage{amssymb,amsmath}\\pagestyle{empty}\\setlength{\\parindent}{0in}\\begin{document}",
        latexPost: "\\end{document}",
        latexsvg: false,
        req: [[0, "any", [0]]]
      },
      [this.baseClozeNoteTypeId]: {
        id: this.baseClozeNoteTypeId,
        name: "Drillmaster Cloze",
        type: 1,
        mod: Math.floor(now / 1000),
        usn: 0,
        sortf: 0,
        did: null,
        tmpls: [
          {
            name: "Cloze",
            ord: 0,
            qfmt: "{{cloze:Text}}",
            afmt: "{{cloze:Text}}<br>{{Extra}}",
            bqfmt: "",
            bafmt: "",
            did: null,
            bfont: "",
            bsize: 0
          }
        ],
        flds: [
          { name: "Text", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 },
          { name: "Extra", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 }
        ],
        css: ".card { font-family: arial; font-size: 20px; text-align: center; color: black; background-color: white; } .cloze { font-weight: bold; color: blue; }",
        latexPre: "\\documentclass[12pt]{article}\\special{papersize=3in,5in}\\usepackage[utf8]{inputenc}\\usepackage{amssymb,amsmath}\\pagestyle{empty}\\setlength{\\parindent}{0in}\\begin{document}",
        latexPost: "\\end{document}",
        latexsvg: false,
        req: [[0, "any", [0]]]
      }
    }).replace(/'/g, "''");

    const decksJson = JSON.stringify({
      1: {
        id: 1,
        name: "Default",
        extendRev: 50,
        usn: 0,
        collapsed: false,
        usn: 0,
        new: { delays: [1, 10], ints: [1, 4, 7], initialFactor: 2500, separate: true, order: 1, perDay: 20 },
        mod: 0,
        autoplay: true
      }
    }).replace(/'/g, "''");

    const deckConfigJson = JSON.stringify({
      1: {
        id: 1,
        name: "Default",
        new: { delays: [1, 10], ints: [1, 4, 7], initialFactor: 2500, separate: true, order: 1, perDay: 20 },
        rev: { perDay: 200, ease4: 1.3, fuzz: 0.05, minSpace: 1, ivlFct: 1.0, maxIvl: 36500 },
        lapse: { delays: [10], mult: 0.0, minInt: 1, leechFails: 8, leechAction: 0 },
        dyn: false,
        autoplay: true,
        timer: 0,
        maxTaken: 60,
        usn: 0,
        mod: Math.floor(now / 1000)
      }
    }).replace(/'/g, "''");

    db.exec(`
      INSERT INTO col (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
      VALUES (1, ${Math.floor(now / 1000)}, ${now}, ${now}, 11, 0, 0, 0, 
              '${configJson}', 
              '${modelsJson}', 
              '${decksJson}', 
              '${deckConfigJson}', 
              '{}')
    `);
  }

  /**
   * Insert deck structure
   */
  insertDecks(db, deckStructure) {
    // Update the collection.decks JSON to include our deck structure
    const now = Math.floor(Date.now() / 1000);
    
    // Build decks JSON object
    const decksJson = {
      1: {
        id: 1,
        name: "Default",
        extendRev: 50,
        usn: 0,
        collapsed: false,
        newToday: [0, 0],
        revToday: [0, 0],
        lrnToday: [0, 0],
        timeToday: [0, 0],
        dyn: 0,
        desc: "",
        conf: 1,
        mod: now
      }
    };
    
    // Add main deck
    decksJson[deckStructure.main.id] = {
      id: deckStructure.main.id,
      name: deckStructure.main.name,
      extendRev: 50,
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      revToday: [0, 0],
      lrnToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      desc: "",
      conf: 1,
      mod: now
    };
    
    // Add subdecks
    Object.values(deckStructure.subdecks).forEach(subdeck => {
      decksJson[subdeck.id] = {
        id: subdeck.id,
        name: subdeck.name,
        extendRev: 50,
        usn: 0,
        collapsed: false,
        newToday: [0, 0],
        revToday: [0, 0],
        lrnToday: [0, 0],
        timeToday: [0, 0],
        dyn: 0,
        desc: "",
        conf: 1,
        mod: now
      };
    });
    
    // Update the collection record with the new decks JSON
    const decksJsonString = JSON.stringify(decksJson).replace(/'/g, "''");
    db.exec(`UPDATE col SET decks = '${decksJsonString}' WHERE id = 1`);
  }

  /**
   * Insert note type
   */
  insertNoteType(db) {
    // Note type is handled in collection.models JSON
    // This is a placeholder for any additional note type setup
  }

  /**
   * Insert a note
   */
  insertNote(db, noteId, card) {
    const guid = this.generateGuid();
    const now = Date.now();
    
    // Use different note type and field structure for cloze cards
    let noteTypeId, fields, fieldsText, sortField;
    
    if (card.type === 'cloze') {
      // Cloze note type with Text and Extra fields
      noteTypeId = this.baseClozeNoteTypeId;
      fields = [card.front || '', card.back || ''];
      fieldsText = fields.join('\x1f');
      sortField = fields[0] || '';
    } else {
      // Basic note type with Front and Back fields
      noteTypeId = this.baseNoteTypeId;
      fields = [card.front || '', card.back || ''];
      fieldsText = fields.join('\x1f');
      sortField = fields[0] || '';
    }
    
    const checksum = this.generateChecksum(fieldsText);

    db.exec(`
      INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
      VALUES (${noteId}, '${guid}', ${noteTypeId}, ${Math.floor(now / 1000)}, 0, '', 
              '${fieldsText.replace(/'/g, "''")}', '${sortField.replace(/'/g, "''")}', ${checksum}, 0, '')
    `);
  }

  /**
   * Insert a card
   */
  insertCard(db, cardId, noteId, deckId, card) {
    const now = Date.now();
    
    db.exec(`
      INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
      VALUES (${cardId}, ${noteId}, ${deckId}, 0, ${Math.floor(now / 1000)}, 0, 0, 0, ${cardId}, 0, 2500, 0, 0, 0, 0, 0, 0, '')
    `);
  }

  /**
   * Generate GUID for note
   */
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generate checksum for note
   */
  generateChecksum(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Load SQL.js library
   */
  async loadSqlJs() {
    if (window.SQL) return window.SQL;
    
    // Load SQL.js from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
      script.onload = () => {
        window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        }).then(resolve).catch(reject);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load JSZip library
   */
  async loadJSZip() {
    if (window.JSZip) return window.JSZip;
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve(window.JSZip);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Download file
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export default TierBasedApkgService;
