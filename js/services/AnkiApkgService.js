/**
 * Anki APKG Service - Browser-only .apkg file generation
 * 
 * Generates proper Anki .apkg files that respect UI selections:
 * - Custom note types with templates and CSS
 * - Filtered by selected subjects, tenses, tiers
 * - SQLite database structure compatible with Anki
 * - ZIP packaging for .apkg format
 */

class AnkiApkgService {
  constructor() {
    this.noteTypeId = 1607392319; // Unique ID for Drillmaster Translation note type
    this.deckId = 1607392320;     // Unique ID for deck
  }

  /**
   * Generate and download .apkg file based on user selections
   */
  async generateApkg(generatedCards, selections) {
    try {
      console.log('🚀 Generating custom .apkg file...');
      
      // Create Anki database structure
      const db = await this.createAnkiDatabase(generatedCards, selections);
      
      // Create .apkg ZIP file
      const apkgBlob = await this.createApkgFile(db);
      
      // Trigger download
      this.downloadFile(apkgBlob, this.generateFilename(selections));
      
      console.log('✅ .apkg file generated and downloaded!');
      return true;
      
    } catch (error) {
      console.error('❌ APKG generation failed:', error);
      throw error;
    }
  }

  /**
   * Create Anki SQLite database with cards and note types
   */
  async createAnkiDatabase(cards, selections) {
    // Initialize SQL.js (we'll need to load this library)
    const SQL = await this.loadSqlJs();
    const db = new SQL.Database();

    // Create Anki database schema
    this.createAnkiSchema(db);
    
    // Insert collection data
    this.insertCollection(db);
    
    // Insert note type (model)
    this.insertNoteType(db);
    
    // Insert deck
    this.insertDeck(db, selections);
    
    // Insert notes and cards
    this.insertNotesAndCards(db, cards, selections);
    
    return db;
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
      );
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
      );
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
      );
    `);

    // Graves table (for sync/deletion tracking)
    db.exec(`
      CREATE TABLE graves (
        usn INTEGER NOT NULL,
        oid INTEGER NOT NULL,
        type INTEGER NOT NULL
      );
    `);

    // Reviews table (for review history)
    db.exec(`
      CREATE TABLE revlog (
        id INTEGER PRIMARY KEY,
        cid INTEGER NOT NULL,
        usn INTEGER NOT NULL,
        ease INTEGER NOT NULL,
        ivl INTEGER NOT NULL,
        lastIvl INTEGER NOT NULL,
        factor INTEGER NOT NULL,
        time INTEGER NOT NULL,
        type INTEGER NOT NULL
      );
    `);

    // Create indexes
    db.exec(`
      CREATE INDEX ix_notes_usn ON notes (usn);
      CREATE INDEX ix_cards_usn ON cards (usn);
      CREATE INDEX ix_cards_nid ON cards (nid);
      CREATE INDEX ix_cards_sched ON cards (did, queue, due);
      CREATE UNIQUE INDEX ix_notes_csum ON notes (csum);
      CREATE INDEX ix_revlog_usn ON revlog (usn);
      CREATE INDEX ix_revlog_cid ON revlog (cid);
    `);
  }

  /**
   * Insert collection configuration
   */
  insertCollection(db) {
    const now = Date.now();
    const config = {
      nextPos: 1,
      estTimes: true,
      activeDecks: [1],
      sortType: "noteFld",
      timeLim: 0,
      sortBackwards: false,
      addToCur: true,
      curDeck: 1,
      newBury: true,
      newSpread: 0,
      dueCounts: true,
      curModel: this.noteTypeId,
      collapseTime: 1200
    };

    const models = {};
    models[this.noteTypeId] = this.createNoteTypeDefinition();

    const decks = {};
    decks[1] = {
      id: 1,
      name: "Default",
      extendRev: 50,
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      conf: 1,
      revToday: [0, 0],
      lrnToday: [0, 0],
      mod: Math.floor(now / 1000),
      desc: ""
    };
    decks[this.deckId] = {
      id: this.deckId,
      name: "Drillmaster Spanish",
      extendRev: 50,
      usn: 0,
      collapsed: false,
      newToday: [0, 0],
      timeToday: [0, 0],
      dyn: 0,
      extendNew: 10,
      conf: 1,
      revToday: [0, 0],
      lrnToday: [0, 0],
      mod: Math.floor(now / 1000),
      desc: "Spanish verb conjugation cards generated by Drillmaster"
    };

    const deckConfig = {
      1: {
        id: 1,
        name: "Default",
        replayq: true,
        lapse: {
          delays: [10],
          mult: 0,
          minInt: 1,
          leechFails: 8,
          leechAction: 0
        },
        rev: {
          perDay: 200,
          ease4: 1.3,
          fuzz: 0.05,
          minSpace: 1,
          ivlFct: 1,
          maxIvl: 36500,
          ease2: 1.2,
          bury: true,
          hardFactor: 1.2
        },
        timer: 0,
        maxTaken: 60,
        usn: 0,
        new: {
          delays: [1, 10],
          separate: true,
          perDay: 20,
          bury: true,
          ints: [1, 4, 7]
        },
        mod: 0,
        autoplay: true
      }
    };

    // Properly escape JSON strings for SQL
    const configJson = JSON.stringify(config).replace(/'/g, "''");
    const modelsJson = JSON.stringify(models).replace(/'/g, "''");
    const decksJson = JSON.stringify(decks).replace(/'/g, "''");
    const deckConfigJson = JSON.stringify(deckConfig).replace(/'/g, "''");

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
   * Create note type definition with templates and CSS
   */
  createNoteTypeDefinition() {
    return {
      id: this.noteTypeId,
      name: "Drillmaster Translation",
      type: 0,
      mod: Math.floor(Date.now() / 1000),
      usn: 0,
      sortf: 0,
      did: this.deckId,
      tmpls: [{
        name: "Translation Card",
        ord: 0,
        qfmt: `
          <div class="card">
            <div class="spanish">{{Front}}</div>
            <div class="verb-info">{{Tense}} - {{Subject}}</div>
          </div>
        `,
        afmt: `
          <div class="card">
            <div class="spanish">{{Front}}</div>
            <hr>
            <div class="english">{{Back}}</div>
            <div class="verb-info">{{Verb}} - {{Tense}} - {{Subject}}</div>
          </div>
        `,
        bqfmt: "",
        bafmt: "",
        did: null,
        bfont: "",
        bsize: 0
      }],
      flds: [
        { name: "Front", ord: 0, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "Back", ord: 1, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "Verb", ord: 2, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "Tense", ord: 3, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "Subject", ord: 4, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "Tags", ord: 5, sticky: false, rtl: false, font: "Arial", size: 20 },
        { name: "DeckLevel", ord: 6, sticky: false, rtl: false, font: "Arial", size: 20 }
      ],
      css: `
        .card {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 18px;
          line-height: 1.6;
          text-align: center;
          padding: 20px;
          background: var(--canvas-default, #ffffff);
          color: var(--fg-default, #1f2328);
        }

        .spanish {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 15px;
          color: var(--accent-fg, #0969da);
        }

        .english {
          font-size: 20px;
          margin-top: 15px;
          color: var(--fg-muted, #656d76);
        }

        .verb-info {
          font-size: 14px;
          color: var(--fg-subtle, #8c959f);
          margin-top: 10px;
          font-style: italic;
        }

        hr {
          border: none;
          border-top: 1px solid var(--border-default, #d1d9e0);
          margin: 20px 0;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .card {
            background: var(--canvas-default, #0d1117);
            color: var(--fg-default, #e6edf3);
          }
          
          .spanish {
            color: var(--accent-fg, #4493f8);
          }
          
          .english {
            color: var(--fg-muted, #8b949e);
          }
          
          .verb-info {
            color: var(--fg-subtle, #6e7681);
          }
          
          hr {
            border-top-color: var(--border-default, #30363d);
          }
        }
      `,
      latexPre: "\\documentclass[12pt]{article}\\special{papersize=3in,5in}\\usepackage[utf8]{inputenc}\\usepackage{amssymb,amsmath}\\pagestyle{empty}\\setlength{\\parindent}{0in}\\begin{document}",
      latexPost: "\\end{document}",
      latexsvg: false,
      req: [[0, "any", [0]]]
    };
  }

  /**
   * Insert note type into database
   */
  insertNoteType(db) {
    // Note type is already included in the collection models
    // No separate insertion needed for modern Anki format
  }

  /**
   * Insert deck into database
   */
  insertDeck(db, selections) {
    // Deck is already included in the collection decks
    // No separate insertion needed for modern Anki format
  }

  /**
   * Insert notes and cards into database
   */
  insertNotesAndCards(db, cards, selections) {
    const now = Date.now();
    
    // Deduplicate cards based on front content to avoid UNIQUE constraint errors
    const uniqueCards = [];
    const seenFronts = new Set();
    
    cards.forEach(card => {
      const frontKey = `${card.front}_${card.verb}_${card.tense}_${card.subject}`;
      if (!seenFronts.has(frontKey)) {
        seenFronts.add(frontKey);
        uniqueCards.push(card);
      }
    });
    
    console.log(`📝 Deduplicated ${cards.length} cards to ${uniqueCards.length} unique cards`);
    
    uniqueCards.forEach((card, index) => {
      const noteId = index + 1;
      const cardId = index + 1;
      
      // Create fields array
      const fields = [
        card.front || '',
        card.back || '',
        card.verb || '',
        card.tense || '',
        card.subject || '',
        this.formatTags(card.tags),
        selections.name || 'Custom Selection'
      ];
      
      const fieldsText = fields.join('\x1f'); // Anki field separator
      const guid = this.generateGuid(fieldsText + noteId); // Include noteId for uniqueness
      const checksum = this.calculateChecksum(fieldsText); // Use all fields for checksum, not just first
      
      // Escape strings for SQL
      const escapedGuid = guid.replace(/'/g, "''");
      const escapedTags = this.formatTags(card.tags).replace(/'/g, "''");
      const escapedFields = fieldsText.replace(/'/g, "''");
      const escapedFirstField = fields[0].replace(/'/g, "''");
      
      // Insert note
      db.exec(`
        INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data)
        VALUES (${noteId}, '${escapedGuid}', ${this.noteTypeId}, ${Math.floor(now / 1000)}, 0, 
                '${escapedTags}', '${escapedFields}', '${escapedFirstField}', 
                ${checksum}, 0, '')
      `);
      
      // Insert card
      db.exec(`
        INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data)
        VALUES (${cardId}, ${noteId}, ${this.deckId}, 0, ${Math.floor(now / 1000)}, 0, 0, 0, ${cardId}, 0, 2500, 0, 0, 0, 0, 0, 0, '')
      `);
    });
  }

  /**
   * Format tags to string, handling both array and string inputs
   */
  formatTags(tags) {
    if (!tags) return '';
    if (Array.isArray(tags)) return tags.join(' ');
    if (typeof tags === 'string') return tags;
    return String(tags);
  }

  /**
   * Generate GUID for note
   */
  generateGuid(content) {
    // Simple hash-based GUID generation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Calculate checksum for first field
   */
  calculateChecksum(field) {
    let sum = 0;
    for (let i = 0; i < field.length; i++) {
      sum += field.charCodeAt(i);
    }
    return sum;
  }

  /**
   * Create .apkg ZIP file
   */
  async createApkgFile(db) {
    const JSZip = await this.loadJSZip();
    const zip = new JSZip();
    
    // Export database to binary
    const dbData = db.export();
    
    // Add collection.anki2 to ZIP
    zip.file("collection.anki2", dbData);
    
    // Add media file (empty for now)
    zip.file("media", "{}");
    
    // Generate ZIP blob
    return await zip.generateAsync({ type: "blob" });
  }

  /**
   * Generate filename based on selections
   */
  generateFilename(selections) {
    const timestamp = new Date().toISOString().slice(0, 10);
    const tiers = selections.tiers ? selections.tiers.join('_') : 'custom';
    const tenses = selections.tenses ? selections.tenses.slice(0, 2).join('_') : 'custom';
    return `Drillmaster_T${tiers}_${tenses}_${timestamp}.apkg`;
  }

  /**
   * Download file to user's computer
   */
  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Load SQL.js library dynamically
   */
  async loadSqlJs() {
    if (window.SQL) return window.SQL;
    
    // Load SQL.js from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
      script.onload = async () => {
        const SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        resolve(SQL);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load JSZip library dynamically
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
}

export default AnkiApkgService;
