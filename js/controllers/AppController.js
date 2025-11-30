/**
 * AppController - Main application orchestrator
 * Manages application state and coordinates services
 */

import { VerbParserService } from '../services/VerbParserService.js';
import { FilterService } from '../services/FilterService.js';

export class AppController {
  constructor() {
    this.state = {
      verbs: [],
      filteredVerbs: [],
      selectedVerbs: new Set(),
      sortBy: 'alpha',
      filters: {
        tiers: [1],
        regularity: ['regular', 'irregular', 'highly-irregular'],
        verbTypes: ['ar', 'er', 'ir'],
        reflexive: 'all'
      },
      cardSettings: {
        cardTypes: ['cloze'],
        tenses: ['present'],
        subjects: ['yo', 'tú', 'vos', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ellas/ustedes'],
        corpusTiers: [1], // Which corpus tiers to include - start with Foundation only
        regions: ['universal', 'argentina', 'spain'] // Which regions to include
      },
      generatedCards: [],
      currentPreviewIndex: 0
    };

    this.services = {
      // Services will be initialized here
    };

    this.elements = {
      // DOM elements will be cached here
    };
  }

  /**
   * Initialize the application
   */
  async initialize() {
    console.log('AppController initializing...');
    
    try {
      // Load data files
      await this.loadData();
      
      // Initialize services
      this.initializeServices();
      
      // Cache DOM elements
      this.cacheElements();
      
      // Attach event listeners
      this.attachEventListeners();
      
      // Load saved settings from localStorage
      this.loadSavedSettings();
      
      // Initialize theme
      this.initializeTheme();
      
      // Initialize filters and card settings based on UI state
      this.handleFilterChange();        // Apply verb list filtering
      this.handleCardSettingsChange();  // Set card generation tiers
      
      // Render initial state (after filters are applied)
      this.render();
      
      console.log('AppController initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load data files (verbs, conjugations, corpus)
   */
  async loadData() {
    console.log('Loading data files...');
    
    try {
      // Load verbs TSV
      const verbsResponse = await fetch('data/verbs.tsv');
      const verbsText = await verbsResponse.text();
      
      // Load conjugations JSON
      const conjugationsResponse = await fetch('data/conjugations.json');
      const conjugations = await conjugationsResponse.json();
      
      // Load corpus data for all tiers
      const corpusData = {};
      for (let tier = 1; tier <= 5; tier++) {
        try {
          const corpusResponse = await fetch(`data/corpus/tier${tier}-complete.json`);
          const tierData = await corpusResponse.json();
          corpusData[tier] = tierData;
          console.log(`Loaded Tier ${tier}: ${tierData.metadata.verb_count} verbs, ${tierData.metadata.sentence_count} sentences`);
        } catch (error) {
          console.warn(`Failed to load Tier ${tier} corpus:`, error);
          corpusData[tier] = { metadata: { verb_count: 0, sentence_count: 0 }, verbs: {} };
        }
      }
      
      this.data = {
        verbsText,
        conjugations,
        corpus: corpusData
      };
      
      console.log('Data files loaded successfully');
    } catch (error) {
      console.error('Failed to load data files:', error);
      throw new Error('Failed to load required data files');
    }
  }

  /**
   * Initialize service instances
   */
  initializeServices() {
    console.log('Initializing services...');
    
    this.services.parser = new VerbParserService();
    this.services.filter = new FilterService();
    
    // Parse verbs from loaded data
    this.state.verbs = this.services.parser.parseTSV(this.data.verbsText);
    this.state.filteredVerbs = [...this.state.verbs];
  }

  /**
   * Cache frequently accessed DOM elements
   */
  cacheElements() {
    this.elements = {
      // Filters
      tierCheckboxes: document.querySelectorAll('input[name="tier"]'),
      regularityCheckboxes: document.querySelectorAll('input[name="regularity"]'),
      verbTypeCheckboxes: document.querySelectorAll('input[name="verb-type"]'),
      reflexiveCheckboxes: document.querySelectorAll('input[name="reflexive"]'),
      
      // Verb list
      verbList: document.getElementById('verb-list'),
      verbCount: document.getElementById('verb-count'),
      sortSelect: document.getElementById('sort-select'),
      selectAllBtn: document.getElementById('select-all-btn'),
      clearAllBtn: document.getElementById('clear-all-btn'),
      
      // Card settings
      cardTypeCheckboxes: document.querySelectorAll('input[name="card-type"]'),
      tenseCheckboxes: document.querySelectorAll('input[name="tense"]'),
      subjectCheckboxes: document.querySelectorAll('input[name="subject"]'),
      tierCheckboxes: document.querySelectorAll('input[name="tier"]'),
      
      // Preview & Export
      generatePreviewBtn: document.getElementById('generate-preview-btn'),
      previewDetails: document.getElementById('preview-details'),
      previewContent: document.getElementById('preview-content'),
      previewNav: document.getElementById('preview-nav'),
      cardCount: document.getElementById('card-count'),
      cardPosition: document.getElementById('card-position'),
      prevCardBtn: document.getElementById('prev-card-btn'),
      nextCardBtn: document.getElementById('next-card-btn'),
      
      // Export buttons
      exportTsvBtn: document.getElementById('export-tsv-btn'),
      exportApkgBtn: document.getElementById('export-apkg-btn'),
      exportTableTxtBtn: document.getElementById('export-table-txt-btn'),
      exportTableHtmlBtn: document.getElementById('export-table-html-btn'),
      
      // Statistics
      statistics: document.getElementById('statistics'),
      statVerbs: document.getElementById('stat-verbs'),
      statCards: document.getElementById('stat-cards'),
      statCloze: document.getElementById('stat-cloze'),
      statTranslation: document.getElementById('stat-translation'),
      statConjugation: document.getElementById('stat-conjugation'),
      
      // Messages
      errorMessage: document.getElementById('error-message'),
      statusMessage: document.getElementById('status-message'),
      
      // Theme
      themeSelect: document.getElementById('theme-select')
    };
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Filter changes
    this.elements.tierCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleFilterChange());
    });
    
    this.elements.regularityCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleFilterChange());
    });
    
    this.elements.verbTypeCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleFilterChange());
    });
    
    this.elements.reflexiveCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleFilterChange());
    });
    
    // Verb selection
    this.elements.sortSelect.addEventListener('change', (e) => this.handleSortChange(e));
    this.elements.selectAllBtn.addEventListener('click', () => this.selectAllVerbs());
    this.elements.clearAllBtn.addEventListener('click', () => this.clearAllVerbs());
    
    // Card settings changes
    this.elements.cardTypeCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleCardSettingsChange());
    });
    
    this.elements.tenseCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleCardSettingsChange());
    });
    
    this.elements.subjectCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleCardSettingsChange());
    });
    
    this.elements.tierCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => this.handleCardSettingsChange());
    });
    
    // Preview & Export
    this.elements.generatePreviewBtn.addEventListener('click', () => this.generatePreview());
    this.elements.prevCardBtn.addEventListener('click', () => this.showPreviousCard());
    this.elements.nextCardBtn.addEventListener('click', () => this.showNextCard());
    
    // Export buttons
    this.elements.exportTsvBtn.addEventListener('click', () => this.exportTSV());
    this.elements.exportApkgBtn.addEventListener('click', () => this.exportAPKG());
    this.elements.exportTableTxtBtn.addEventListener('click', () => this.exportTableText());
    this.elements.exportTableHtmlBtn.addEventListener('click', () => this.exportTableHTML());
    
    // Theme switcher
    this.elements.themeSelect.addEventListener('change', (e) => this.handleThemeChange(e));
  }

  /**
   * Load saved settings from localStorage
   */
  loadSavedSettings() {
    const saved = localStorage.getItem('drillmaster_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        console.log('Loaded saved settings:', settings);
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  initializeTheme() {
    const savedTheme = localStorage.getItem('drillmaster_theme') || 'auto';
    this.elements.themeSelect.value = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /**
   * Render the application UI
   */
  render() {
    this.renderVerbList();
    this.updateVerbCount();
    this.updateCardCount();
  }

  /**
   * Sort verbs based on current sort setting
   */
  sortVerbs(verbs) {
    const sorted = [...verbs];
    
    switch (this.state.sortBy) {
      case 'alpha':
        sorted.sort((a, b) => a.verb.localeCompare(b.verb));
        break;
      
      case 'tier':
        sorted.sort((a, b) => {
          const tierDiff = parseInt(a.tags.tier) - parseInt(b.tags.tier);
          if (tierDiff !== 0) return tierDiff;
          return a.verb.localeCompare(b.verb);
        });
        break;
      
      case 'regularity':
        const regularityOrder = { 'regular': 1, 'irregular': 2, 'highly-irregular': 3 };
        sorted.sort((a, b) => {
          const regDiff = regularityOrder[a.tags.regularity] - regularityOrder[b.tags.regularity];
          if (regDiff !== 0) return regDiff;
          return a.verb.localeCompare(b.verb);
        });
        break;
      
      case 'type':
        sorted.sort((a, b) => {
          const typeDiff = a.tags['verb-type'].localeCompare(b.tags['verb-type']);
          if (typeDiff !== 0) return typeDiff;
          return a.verb.localeCompare(b.verb);
        });
        break;
    }
    
    return sorted;
  }

  /**
   * Render the verb list
   */
  renderVerbList() {
    if (this.state.filteredVerbs.length === 0) {
      this.elements.verbList.innerHTML = '<p style="text-align: center; opacity: 0.7;">No verbs match current filters</p>';
      return;
    }

    const sortedVerbs = this.sortVerbs(this.state.filteredVerbs);
    const html = sortedVerbs.map(verb => {
      const isSelected = this.state.selectedVerbs.has(verb.id);
      const isReflexive = verb.tags.reflexive === 'true';
      
      return `
        <div class="verb-item" data-verb-id="${verb.id}">
          <input 
            type="checkbox" 
            id="verb-${verb.id}" 
            ${isSelected ? 'checked' : ''}
            data-verb-id="${verb.id}"
          />
          <span class="verb-name">${verb.verb}</span>
          <span class="verb-english">${verb.english}</span>
          <span class="verb-tier">Tier ${verb.tags.tier}</span>
          <span class="verb-tags">${verb.tags.regularity}${isReflexive ? ', reflexive' : ''}</span>
        </div>
      `;
    }).join('');

    this.elements.verbList.innerHTML = html;
    
    // Attach click handlers to verb items
    this.elements.verbList.querySelectorAll('.verb-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Don't toggle if clicking the checkbox itself
        if (e.target.type === 'checkbox') return;
        
        const verbId = parseInt(item.dataset.verbId);
        const checkbox = item.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        this.toggleVerbSelection(verbId);
      });
    });
    
    // Attach change handlers to checkboxes
    this.elements.verbList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const verbId = parseInt(e.target.dataset.verbId);
        this.toggleVerbSelection(verbId);
      });
    });
  }

  /**
   * Toggle verb selection
   */
  toggleVerbSelection(verbId) {
    if (this.state.selectedVerbs.has(verbId)) {
      this.state.selectedVerbs.delete(verbId);
    } else {
      this.state.selectedVerbs.add(verbId);
    }
    this.updateVerbCount();
  }

  /**
   * Update verb count display
   */
  updateVerbCount() {
    const count = this.state.selectedVerbs.size;
    this.elements.verbCount.textContent = `(${count} selected)`;
  }

  /**
   * Update card count display
   */
  updateCardCount() {
    const count = this.state.generatedCards.length;
    this.elements.cardCount.textContent = `(${count} cards)`;
    this.updateStatistics();
  }

  /**
   * Update detailed statistics display
   */
  updateStatistics() {
    if (this.state.generatedCards.length === 0) {
      this.elements.statistics.style.display = 'none';
      return;
    }

    const stats = {
      verbs: new Set(this.state.generatedCards.map(card => card.verb)).size,
      total: this.state.generatedCards.length,
      cloze: this.state.generatedCards.filter(card => card.type === 'cloze').length,
      translation: this.state.generatedCards.filter(card => card.type === 'trans-es-en' || card.type === 'trans-en-es').length,
      conjugation: this.state.generatedCards.filter(card => card.type === 'conjugation').length
    };

    this.elements.statVerbs.textContent = `Verbs: ${stats.verbs}`;
    this.elements.statCards.textContent = `Total Cards: ${stats.total}`;
    this.elements.statCloze.textContent = `Cloze: ${stats.cloze}`;
    this.elements.statTranslation.textContent = `Translation: ${stats.translation}`;
    this.elements.statConjugation.textContent = `Conjugation: ${stats.conjugation}`;

    this.elements.statistics.style.display = 'block';
  }

  /**
   * Handle filter changes
   */
  handleFilterChange() {
    // Update filter state from checkboxes
    this.state.filters.tiers = Array.from(this.elements.tierCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
    
    this.state.filters.regularity = Array.from(this.elements.regularityCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    this.state.filters.verbTypes = Array.from(this.elements.verbTypeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    // Handle reflexive filter (radio-like behavior)
    const reflexiveOnly = document.getElementById('reflexive-only').checked;
    const nonReflexiveOnly = document.getElementById('non-reflexive-only').checked;
    
    if (reflexiveOnly) {
      this.state.filters.reflexive = 'only';
    } else if (nonReflexiveOnly) {
      this.state.filters.reflexive = 'none';
    } else {
      this.state.filters.reflexive = 'all';
    }
    
    // Apply filters
    this.state.filteredVerbs = this.services.filter.filterVerbs(
      this.state.verbs,
      this.state.filters
    );
    
    // Re-render verb list
    this.render();
  }

  /**
   * Handle sort change
   */
  handleSortChange(event) {
    this.state.sortBy = event.target.value;
    this.render();
  }

  /**
   * Handle card settings changes
   */
  handleCardSettingsChange() {
    // Update corpusTiers based on checked tier checkboxes
    const selectedTiers = Array.from(this.elements.tierCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => parseInt(cb.value));
    
    this.state.cardSettings.corpusTiers = selectedTiers;
    
    console.log('Card settings changed - corpusTiers:', selectedTiers);
  }

  /**
   * Select all filtered verbs
   */
  selectAllVerbs() {
    this.state.filteredVerbs.forEach(verb => {
      this.state.selectedVerbs.add(verb.id);
    });
    this.updateVerbCount();
    this.render();
  }

  /**
   * Clear all verb selections
   */
  clearAllVerbs() {
    this.state.selectedVerbs.clear();
    this.updateVerbCount();
    this.render();
  }

  /**
   * Generate card preview
   */
  async generatePreview() {
    if (this.state.selectedVerbs.size === 0) {
      this.showError('Please select at least one verb');
      return;
    }
    
    const cardTypes = Array.from(this.elements.cardTypeCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    const tenses = Array.from(this.elements.tenseCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    const subjects = Array.from(this.elements.subjectCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    
    if (cardTypes.length === 0) {
      this.showError('Please select at least one card type');
      return;
    }
    
    if (tenses.length === 0) {
      this.showError('Please select at least one tense');
      return;
    }
    
    if (subjects.length === 0) {
      this.showError('Please select at least one subject');
      return;
    }
    
    const conjugations = this.data.conjugations;
    
    const selectedVerbObjects = this.state.verbs.filter(v => this.state.selectedVerbs.has(v.id));
    this.state.generatedCards = this.generateCorpusCards(selectedVerbObjects, cardTypes, tenses, subjects, conjugations);
    
    this.state.currentPreviewIndex = 0;
    
    this.updateCardCount();
    this.renderCurrentCard();
    this.elements.previewDetails.open = true;
    this.elements.previewNav.style.display = 'block';
    
    this.elements.exportTsvBtn.disabled = false;
    this.elements.exportApkgBtn.disabled = false;
    this.elements.exportTableTxtBtn.disabled = false;
    this.elements.exportTableHtmlBtn.disabled = false;
    
    this.showStatus(`Generated ${this.state.generatedCards.length} cards from ${selectedVerbObjects.length} verbs`);
  }

  /**
   * Render current card in preview
   */
  renderCurrentCard() {
    if (this.state.generatedCards.length === 0) {
      this.elements.previewContent.innerHTML = '<p>No cards generated</p>';
      return;
    }

    const card = this.state.generatedCards[this.state.currentPreviewIndex];
    const html = `
      <div class="card-preview">
        <div class="card-preview-front">
          <strong>Front:</strong><br>
          ${card.front}
        </div>
        <div class="card-preview-back">
          <strong>Back:</strong><br>
          ${card.back}
        </div>
        <div class="card-preview-meta">
          <strong>Type:</strong> ${card.type}<br>
          <strong>Verb:</strong> ${card.verb} (${card.english})<br>
          <strong>Tense:</strong> ${card.tense}<br>
          <strong>Subject:</strong> ${card.subject}<br>
          <strong>Tags:</strong> ${card.tags}
        </div>
      </div>
    `;
    
    this.elements.previewContent.innerHTML = html;
    this.elements.cardPosition.textContent = `Card ${this.state.currentPreviewIndex + 1} of ${this.state.generatedCards.length}`;
    
    this.elements.prevCardBtn.disabled = this.state.currentPreviewIndex === 0;
    this.elements.nextCardBtn.disabled = this.state.currentPreviewIndex === this.state.generatedCards.length - 1;
  }

  /**
   * Show previous card
   */
  showPreviousCard() {
    if (this.state.currentPreviewIndex > 0) {
      this.state.currentPreviewIndex--;
      this.renderCurrentCard();
    }
  }

  /**
   * Show next card
   */
  showNextCard() {
    if (this.state.currentPreviewIndex < this.state.generatedCards.length - 1) {
      this.state.currentPreviewIndex++;
      this.renderCurrentCard();
    }
  }

  /**
   * Handle theme change
   */
  handleThemeChange(event) {
    const theme = event.target.value;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('drillmaster_theme', theme);
  }

  /**
   * Generate cards using corpus-based approach with new consolidated format
   */
  generateCorpusCards(verbs, cardTypes, tenses, subjects, conjugations) {
    const cards = [];
    const { corpusTiers, regions = ['universal'] } = this.state.cardSettings;
    
    console.log(`Generating corpus cards for ${verbs.length} verbs, tenses: ${tenses.join(', ')}, subjects: ${subjects.join(', ')}`);
    
    // Build consolidated corpus from selected tiers
    const consolidatedCorpus = {};
    
    corpusTiers.forEach(tier => {
      if (this.data.corpus[tier] && this.data.corpus[tier].verbs) {
        Object.keys(this.data.corpus[tier].verbs).forEach(verbName => {
          if (!consolidatedCorpus[verbName]) {
            consolidatedCorpus[verbName] = this.data.corpus[tier].verbs[verbName];
          }
        });
      }
    });
    
    console.log(`Consolidated corpus contains ${Object.keys(consolidatedCorpus).length} verbs from tiers ${corpusTiers.join(', ')}`);
    
    verbs.forEach(verb => {
      const verbName = verb.verb;
      const corpusVerb = consolidatedCorpus[verbName];
      
      if (!corpusVerb) {
        console.warn(`No corpus data found for verb: ${verbName}`);
        return;
      }
      
      tenses.forEach(tense => {
        if (!corpusVerb[tense]) {
          console.warn(`No ${tense} tense data for verb: ${verbName}`);
          return;
        }
        
        const sentences = corpusVerb[tense];
        
        sentences.forEach(sentence => {
          // Filter by selected subjects and regions
          if (!subjects.includes(sentence.subject)) return;
          if (!regions.includes(sentence.region) && !regions.includes('all')) return;
          
          const { spanish, english } = sentence;
          
          // Generate cards for each selected card type
          cardTypes.forEach(cardType => {
            if (cardType === 'cloze') {
              this.generateClozeCard(cards, verb, sentence, tense, conjugations, corpusVerb);
            } else if (cardType === 'trans-es-en') {
              this.generateTranslationEStoEN(cards, verb, sentence, tense, conjugations, corpusVerb);
            } else if (cardType === 'trans-en-es') {
              this.generateTranslationENtoES(cards, verb, sentence, tense, conjugations, corpusVerb);
            } else if (cardType === 'conjugation') {
              this.generateConjugationPractice(cards, verb, sentence, tense, conjugations, corpusVerb);
            }
          });
        });
      });
    });
    
    console.log(`Generated ${cards.length} corpus-based cards`);
    return cards;
  }

  /**
   * Normalize text for better matching (remove accents, normalize case)
   */
  normalizeForMatching(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  /**
   * Create a flexible regex that matches text with or without accents
   */
  createFlexibleRegex(text) {
    // Escape special regex characters first
    const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create pattern that matches with or without accents
    const pattern = escaped
      .replace(/[aáàâä]/gi, '[aáàâä]')
      .replace(/[eéèêë]/gi, '[eéèêë]')
      .replace(/[iíìîï]/gi, '[iíìîï]')
      .replace(/[oóòôö]/gi, '[oóòôö]')
      .replace(/[uúùûü]/gi, '[uúùûü]')
      .replace(/[nñ]/gi, '[nñ]');
    
    // Use explicit word boundaries that work with accented characters
    return new RegExp(`(^|\\s|[^a-záéíóúñü])(${pattern})($|\\s|[^a-záéíóúñü])`, 'i');
  }

  /**
   * Get conjugation data with fallback for reflexive/non-reflexive variants
   */
  getConjugation(verbName, conjugations) {
    let conjugation = conjugations[verbName];
    
    // If not found, try reflexive/non-reflexive variants
    if (!conjugation) {
      if (verbName.endsWith('SE')) {
        // Try without SE suffix
        const baseVerb = verbName.slice(0, -2);
        conjugation = conjugations[baseVerb];
      } else {
        // Try with SE suffix
        const reflexiveVerb = verbName + 'SE';
        conjugation = conjugations[reflexiveVerb];
      }
    }
    
    return conjugation;
  }

  /**
   * Generate a cloze deletion card
   */
  generateClozeCard(cards, verb, sentence, tense, conjugations, corpusVerb) {
    const verbName = verb.verb;
    const { spanish, english } = sentence;
    let sentenceWithCloze = spanish;
    
    // Find the conjugated verb in the sentence and wrap it in cloze
    const conjugation = this.getConjugation(verbName, conjugations);
    
    if (!conjugation || !conjugation[tense] || !conjugation[tense][sentence.subject]) {
      console.warn(`No conjugation found for ${verbName} ${tense} ${sentence.subject}`);
      return;
    }
    
    const conjugatedForm = conjugation[tense][sentence.subject];
    
    // Handle backwards verbs - construction with indirect object pronouns
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (BACKWARDS_VERBS.includes(verbName)) {
      // Create flexible pattern for any backwards verb
      const verbStems = {
        'GUSTAR': 'gust',
        'DOLER': 'duel|dol',  // duele/duelen, dolió/dolieron
        'ENCANTAR': 'encant',
        'MOLESTAR': 'molest',
        'IMPORTAR': 'import',
        'FALTAR': 'falt',
        'PARECER': 'parec|parezc'  // parece/parecen, parezco
      };
      
      const stem = verbStems[verbName];
      const backwardsPattern = new RegExp(`(me|te|le|nos|os|les)\\s+(${stem}[aáéíóúeion]+n?)`, 'i');
      const match = spanish.match(backwardsPattern);
      
      if (match) {
        // Test the full construction (pronoun + verb)
        sentenceWithCloze = spanish.replace(backwardsPattern, `{{c1::${match[0]}}}`);
      } else {
        console.warn(`Could not find ${verbName} backwards pattern in sentence: "${spanish}"`);
        sentenceWithCloze = spanish; // No cloze if we can't find the pattern
      }
    }
    // Handle reflexive verbs - look for pronoun + verb pattern
    else if (corpusVerb.metadata && corpusVerb.metadata.tags.includes('reflexive')) {
      const pronouns = {
        'yo': 'me',
        'tú': 'te', 
        'vos': 'te',
        'él/ella/usted': 'se',
        'nosotros': 'nos',
        'vosotros': 'os',
        'ellos/ellas/ustedes': 'se'
      };
      
      const pronoun = pronouns[sentence.subject];
      const reflexivePattern = `${pronoun} ${conjugatedForm}`;
      
      // Try flexible reflexive pattern matching
      const reflexiveRegex = this.createFlexibleRegex(`${pronoun} ${conjugatedForm}`);
      const reflexiveMatch = spanish.match(reflexiveRegex);
      
      if (reflexiveMatch) {
        sentenceWithCloze = spanish.replace(reflexiveRegex, `$1{{c1::$2}}$3`);
      } else {
        // Fallback: try to find just the verb with flexible matching
        const verbRegex = this.createFlexibleRegex(conjugatedForm);
        const verbMatch = spanish.match(verbRegex);
        if (verbMatch) {
          sentenceWithCloze = spanish.replace(verbRegex, `$1{{c1::$2}}$3`);
        } else {
          console.warn(`Could not find reflexive pattern "${reflexivePattern}" or verb "${conjugatedForm}" in: "${spanish}"`);
          sentenceWithCloze = spanish; // No cloze if we can't find it
        }
      }
    } else {
      // Non-reflexive verbs - use flexible matching for accents and case
      const regex = this.createFlexibleRegex(conjugatedForm);
      const match = spanish.match(regex);
      if (match) {
        // match[2] is the verb part, match[1] and match[3] are the boundaries
        sentenceWithCloze = spanish.replace(regex, `$1{{c1::$2}}$3`);
      } else {
        console.warn(`Could not find conjugated form "${conjugatedForm}" in sentence: "${spanish}"`);
        sentenceWithCloze = spanish.replace(conjugatedForm, `{{c1::${conjugatedForm}}}`);
      }
    }
    
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    // Create the front with verb info and cloze sentence
    const verbInfo = `${verbName} (${verb.english}) - ${tense}`;
    const frontWithVerbInfo = `<div style="text-align: center; margin-bottom: 1em; font-size: 0.9em; color: #666; font-weight: bold;">${verbInfo}</div>${sentenceWithCloze}`;
    
    cards.push({
      type: 'cloze',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: sentence.subject,
      region: sentence.region,
      front: frontWithVerbInfo,
      back: `<div style="margin-top: 1em; font-size: 0.85em; color: #999;"><em>${english}</em></div>`,
      extra: '',
      tags: tags.join(';'),
      source: 'corpus',
      sourceContext: sentence.source || 'unknown'
    });
  }

  /**
   * Generate a Spanish to English translation card
   */
  generateTranslationEStoEN(cards, verb, sentence, tense, conjugations, corpusVerb) {
    const verbName = verb.verb;
    const { spanish, english } = sentence;
    
    // Get conjugated form for context
    const conjugation = this.getConjugation(verbName, conjugations);
    if (!conjugation || !conjugation[tense] || !conjugation[tense][sentence.subject]) {
      console.warn(`No conjugation found for ${verbName} ${tense} ${sentence.subject}`);
      return;
    }
    
    const conjugatedForm = conjugation[tense][sentence.subject];
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    // Highlight the conjugated verb in the Spanish sentence
    let highlightedSpanish = spanish;
    
    // Handle backwards verbs - don't highlight (students need to recognize pattern)
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (BACKWARDS_VERBS.includes(verbName)) {
      // No highlighting for backwards verbs - students should recognize the pattern without help
      highlightedSpanish = spanish;
    } else {
      const regex = this.createFlexibleRegex(conjugatedForm);
      const match = spanish.match(regex);
      if (match) {
        highlightedSpanish = spanish.replace(regex, `$1<strong>$2</strong>$3`);
      }
    }
    
    cards.push({
      type: 'trans-es-en',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: sentence.subject,
      region: sentence.region,
      front: highlightedSpanish,
      back: `<div style="font-size: 1.1em; margin-bottom: 0.5em;">${english}</div><div style="font-size: 0.85em; color: #666; margin-top: 0.5em;"><em>${verbName} (${verb.english}) - ${tense}</em></div>`,
      extra: '',
      tags: tags.join(';'),
      source: 'corpus',
      sourceContext: sentence.source || 'unknown'
    });
  }

  /**
   * Generate an English to Spanish translation card
   */
  /**
   * Randomize subject pronouns for natural English sentences
   */
  randomizeSubject(originalSubject, english, spanish) {
    if (originalSubject === 'él/ella/usted') {
      const options = [
        { english: 'He', spanish: 'Él' },
        { english: 'She', spanish: 'Ella' },
        { english: 'You', spanish: 'Usted' }
      ];
      const choice = options[Math.floor(Math.random() * options.length)];
      
      // Replace "He/She" with chosen pronoun in English
      let newEnglish = english.replace(/He\/She/g, choice.english);
      
      // Fix verb conjugation when "You" is selected
      if (choice.english === 'You') {
        // Convert third-person singular verbs to second-person
        newEnglish = newEnglish.replace(/\bwants\b/g, 'want');
        newEnglish = newEnglish.replace(/\bgoes\b/g, 'go');
        newEnglish = newEnglish.replace(/\bhas\b/g, 'have');
        newEnglish = newEnglish.replace(/\bdoes\b/g, 'do');
        newEnglish = newEnglish.replace(/\bsays\b/g, 'say');
        newEnglish = newEnglish.replace(/\bcomes\b/g, 'come');
        newEnglish = newEnglish.replace(/\bneeds\b/g, 'need');
        newEnglish = newEnglish.replace(/\btakes\b/g, 'take');
        newEnglish = newEnglish.replace(/\bmakes\b/g, 'make');
        newEnglish = newEnglish.replace(/\bgets\b/g, 'get');
        newEnglish = newEnglish.replace(/\bworks\b/g, 'work');
        newEnglish = newEnglish.replace(/\blives\b/g, 'live');
        newEnglish = newEnglish.replace(/\bstudies\b/g, 'study');
        newEnglish = newEnglish.replace(/\btries\b/g, 'try');
        newEnglish = newEnglish.replace(/\bcarries\b/g, 'carry');
        newEnglish = newEnglish.replace(/\bwears\b/g, 'wear');
        newEnglish = newEnglish.replace(/\bfeels\b/g, 'feel');
        newEnglish = newEnglish.replace(/\bthinks\b/g, 'think');
        newEnglish = newEnglish.replace(/\bknows\b/g, 'know');
        newEnglish = newEnglish.replace(/\blikes\b/g, 'like');
        newEnglish = newEnglish.replace(/\bloves\b/g, 'love');
        newEnglish = newEnglish.replace(/\bfinds\b/g, 'find');
        newEnglish = newEnglish.replace(/\bbrings\b/g, 'bring');
        newEnglish = newEnglish.replace(/\bputs\b/g, 'put');
        newEnglish = newEnglish.replace(/\bsees\b/g, 'see');
        newEnglish = newEnglish.replace(/\bhears\b/g, 'hear');
        newEnglish = newEnglish.replace(/\bbelieves\b/g, 'believe');
        newEnglish = newEnglish.replace(/\bunderstands\b/g, 'understand');
        newEnglish = newEnglish.replace(/\bseems\b/g, 'seem');
        newEnglish = newEnglish.replace(/\bmatters\b/g, 'matter');
        newEnglish = newEnglish.replace(/\bbothers\b/g, 'bother');
        newEnglish = newEnglish.replace(/\bhurts\b/g, 'hurt');
        // Handle "is" -> "are" for "You"
        newEnglish = newEnglish.replace(/\bis\b/g, 'are');
      }
      // Add explicit pronoun to Spanish if not already present
      const newSpanish = spanish.startsWith('Es ') ? `${choice.spanish} es ${spanish.substring(3)}` : spanish;
      
      return { english: newEnglish, spanish: newSpanish, subject: choice.spanish.toLowerCase() };
    }
    
    if (originalSubject === 'ellos/ellas/ustedes') {
      const options = [
        { english: 'They (men)', spanish: 'Ellos', possessive: 'their' },
        { english: 'They (women)', spanish: 'Ellas', possessive: 'their' },
        { english: 'They (mixed)', spanish: 'Ellos', possessive: 'their' },
        { english: 'You all', spanish: 'Ustedes', possessive: 'your' }
      ];
      const choice = options[Math.floor(Math.random() * options.length)];
      
      // Replace "They" with chosen form in English
      let newEnglish = english.replace(/They/g, choice.english);
      
      // Handle possessive pronoun replacement and additional pronoun instances
      if (choice.possessive === 'your') {
        // Replace "their" with "your" when "You all" is selected
        newEnglish = newEnglish.replace(/their/g, 'your');
        // Replace additional instances of "they" with "you all" for consistency
        newEnglish = newEnglish.replace(/\bthey\b/g, 'you all');
        // Replace reflexive pronouns that refer back to the same subject
        newEnglish = newEnglish.replace(/themselves/g, 'yourselves');
        // Replace "them" with "you" when it refers to the same group
        newEnglish = newEnglish.replace(/\bthem\b/g, 'you');
      }
      
      // Add explicit pronoun to Spanish if not already present
      const newSpanish = spanish.startsWith('Son ') ? `${choice.spanish} son ${spanish.substring(4)}` : spanish;
      
      return { english: newEnglish, spanish: newSpanish, subject: choice.spanish.toLowerCase() };
    }
    
    // Return unchanged for other subjects (yo, tú, nosotros, etc.)
    return { english, spanish, subject: originalSubject };
  }

  generateTranslationENtoES(cards, verb, sentence, tense, conjugations, corpusVerb) {
    const verbName = verb.verb;
    let { spanish, english } = sentence;
    
    // Randomize subject for natural English sentences
    const randomizedSubject = this.randomizeSubject(sentence.subject, english, spanish);
    english = randomizedSubject.english;
    spanish = randomizedSubject.spanish;
    
    // Get conjugated form
    const conjugation = this.getConjugation(verbName, conjugations);
    if (!conjugation || !conjugation[tense] || !conjugation[tense][sentence.subject]) {
      console.warn(`No conjugation found for ${verbName} ${tense} ${sentence.subject}`);
      return;
    }
    
    const conjugatedForm = conjugation[tense][sentence.subject];
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    // Highlight the conjugated verb in the Spanish answer
    let highlightedSpanish = spanish;
    
    // Handle backwards verbs - don't highlight (students need to recognize pattern)
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (BACKWARDS_VERBS.includes(verbName)) {
      // No highlighting for backwards verbs - students should recognize the pattern without help
      highlightedSpanish = spanish;
    } else {
      const regex = this.createFlexibleRegex(conjugatedForm);
      const match = spanish.match(regex);
      if (match) {
        highlightedSpanish = spanish.replace(regex, `$1<strong>$2</strong>$3`);
      }
    }
    
    cards.push({
      type: 'trans-en-es',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: sentence.subject,
      region: sentence.region,
      front: english,
      back: `<div style="font-size: 1.1em;">${highlightedSpanish}</div>`,
      extra: '',
      tags: tags.join(';'),
      source: 'corpus',
      sourceContext: sentence.source || 'unknown'
    });
  }

  /**
   * Generate a conjugation practice card
   */
  generateConjugationPractice(cards, verb, sentence, tense, conjugations, corpusVerb) {
    const verbName = verb.verb;
    const { spanish, english } = sentence;
    
    // Skip conjugation practice for backwards verbs - doesn't make pedagogical sense
    const BACKWARDS_VERBS = ['GUSTAR', 'DOLER', 'ENCANTAR', 'MOLESTAR', 'IMPORTAR', 'FALTAR', 'PARECER'];
    if (BACKWARDS_VERBS.includes(verbName)) {
      return;
    }
    
    // Get conjugated form
    const conjugation = this.getConjugation(verbName, conjugations);
    if (!conjugation || !conjugation[tense] || !conjugation[tense][sentence.subject]) {
      console.warn(`No conjugation found for ${verbName} ${tense} ${sentence.subject}`);
      return;
    }
    
    const conjugatedForm = conjugation[tense][sentence.subject];
    const tags = this.generateCardTags(verb, sentence, tense, corpusVerb);
    
    cards.push({
      type: 'conjugation',
      verb: verbName,
      english: verb.english,
      tense: tense,
      subject: sentence.subject,
      region: sentence.region,
      front: `<div style="text-align: center; padding: 1em;"><div style="font-size: 1.2em; margin-bottom: 0.5em;"><strong>${verbName}</strong></div><div style="font-size: 1em; color: #666; margin-bottom: 0.5em;">${verb.english}</div><div style="font-size: 0.9em; color: #999;">${tense} • ${sentence.subject}</div></div>`,
      back: `<div style="text-align: center; padding: 1em;"><div style="font-size: 1.2em; margin-bottom: 1em;"><strong>${conjugatedForm}</strong></div><div style="font-size: 0.9em; margin-bottom: 0.5em; font-style: italic;">${spanish}</div><div style="font-size: 0.85em; color: #666;">${english}</div></div>`,
      extra: '',
      tags: tags.join(';'),
      source: 'corpus',
      sourceContext: sentence.source || 'unknown'
    });
  }

  /**
   * Generate tags for a card
   */
  generateCardTags(verb, sentence, tense, corpusVerb) {
    const tags = [
      `tier:${verb.tags.tier}`,
      verb.tags.regularity || 'unknown',
      tense,
      `subject:${sentence.subject}`,
      'corpus'
    ];
    
    // Add region tags (both prefixed and standalone for better filtering)
    if (sentence.region !== 'universal') {
      tags.push(`region:${sentence.region}`);
      tags.push(sentence.region); // Add standalone region tag
    }
    
    // Add verb-specific tags
    if (corpusVerb.metadata) {
      corpusVerb.metadata.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    }
    
    return tags;
  }

  // Essential methods only - removing all template/curated sentence code
  exportTSV() {
    if (this.state.generatedCards.length === 0) {
      this.showError('No cards to export. Please generate cards first.');
      return;
    }

    // Separate cards by type
    const cardsByType = {
      'cloze': this.state.generatedCards.filter(card => card.type === 'cloze'),
      'trans-es-en': this.state.generatedCards.filter(card => card.type === 'trans-es-en'),
      'trans-en-es': this.state.generatedCards.filter(card => card.type === 'trans-en-es'),
      'conjugation': this.state.generatedCards.filter(card => card.type === 'conjugation')
    };
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let exportedFiles = [];

    // Export each card type separately
    Object.entries(cardsByType).forEach(([cardType, cards]) => {
      if (cards.length > 0) {
        const filename = this.exportCardType(cards, cardType, timestamp);
        exportedFiles.push(`${cards.length} ${cardType} cards → ${filename}`);
      }
    });

    if (exportedFiles.length === 0) {
      this.showError('No cards to export.');
      return;
    }

    this.showStatus(`Exported: ${exportedFiles.join(', ')}`);
  }

  /**
   * Export cards as .apkg file with custom note types
   */
  async exportAPKG() {
    if (this.state.generatedCards.length === 0) {
      this.showError('No cards to export. Please generate cards first.');
      return;
    }

    try {
      this.showStatus('Generating .apkg file...');
      
      // For now, show a message about the feature being in development
      // TODO: Implement full .apkg generation
      this.showStatus('⚠️ .apkg export is in development. For now, please use TSV export with the setup instructions below.');
      
      // Show setup instructions
      this.showAPKGSetupInstructions();
      
    } catch (error) {
      console.error('APKG export error:', error);
      this.showError('Failed to generate .apkg file. Please try TSV export instead.');
    }
  }

  /**
   * Show setup instructions for manual note type creation
   */
  showAPKGSetupInstructions() {
    const instructions = `
📋 SETUP INSTRUCTIONS FOR CUSTOM NOTE TYPES:

1. In Anki, go to Tools → Manage Note Types
2. Create these 4 note types:

🔸 DrillMaster Cloze
   - Fields: Text, Extra, Tags
   - Card Type: Cloze

🔸 DrillMaster Translation ES→EN  
   - Fields: Spanish, English, Extra, Tags
   - Front: {{Spanish}}
   - Back: {{English}}<br>{{Extra}}

🔸 DrillMaster Translation EN→ES
   - Fields: English, Spanish, Extra, Tags  
   - Front: {{English}}
   - Back: {{Spanish}}<br>{{Extra}}

🔸 DrillMaster Conjugation Practice
   - Fields: Prompt, Answer, Extra, Tags
   - Front: {{Prompt}}
   - Back: {{Answer}}<br>{{Extra}}

3. Import your TSV files and select the matching note type for each.

💡 Tip: Add CSS styling to make cards look professional:
   - Dark mode support: @media (prefers-color-scheme: dark)
   - Custom fonts and spacing
   - Highlight important text
`;

    // Create a modal or alert with instructions
    alert(instructions);
  }

  /**
   * Export a specific card type to TSV
   */
  exportCardType(cards, cardType, timestamp) {
    const tsvLines = cards.map(card => {
      return [
        card.front,
        card.back,
        card.extra || `${card.verb} (${card.english})`,
        card.tags
      ].join('\t');
    });

    const tsvContent = tsvLines.join('\n');
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    
    const filename = `drillmaster-${cardType}-cards-${timestamp}.tsv`;
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return filename;
  }


  /**
   * Export conjugation table as text
   */
  exportTableText() {
    if (this.state.selectedVerbs.size === 0) {
      this.showError('No verbs selected. Please select verbs first.');
      return;
    }

    const selectedVerbObjects = this.state.verbs.filter(verb => 
      this.state.selectedVerbs.has(verb.id)
    );

    let textContent = 'SPANISH VERB CONJUGATION TABLE\n';
    textContent += '=' .repeat(50) + '\n\n';

    selectedVerbObjects.forEach(verb => {
      const conjugation = this.getConjugation(verb.verb, this.data.conjugations);
      if (!conjugation) return;

      textContent += `${verb.verb.toUpperCase()} (${verb.english})\n`;
      textContent += '-'.repeat(30) + '\n';

      // Present tense
      if (conjugation.present) {
        textContent += 'PRESENT:\n';
        textContent += `  yo: ${conjugation.present.yo || 'N/A'}\n`;
        textContent += `  tú: ${conjugation.present.tú || 'N/A'}\n`;
        textContent += `  él/ella/usted: ${conjugation.present['él/ella/usted'] || 'N/A'}\n`;
        textContent += `  nosotros: ${conjugation.present.nosotros || 'N/A'}\n`;
        textContent += `  vosotros: ${conjugation.present.vosotros || 'N/A'}\n`;
        textContent += `  ellos/ellas/ustedes: ${conjugation.present['ellos/ellas/ustedes'] || 'N/A'}\n\n`;
      }

      // Preterite tense
      if (conjugation.preterite) {
        textContent += 'PRETERITE:\n';
        textContent += `  yo: ${conjugation.preterite.yo || 'N/A'}\n`;
        textContent += `  tú: ${conjugation.preterite.tú || 'N/A'}\n`;
        textContent += `  él/ella/usted: ${conjugation.preterite['él/ella/usted'] || 'N/A'}\n`;
        textContent += `  nosotros: ${conjugation.preterite.nosotros || 'N/A'}\n`;
        textContent += `  vosotros: ${conjugation.preterite.vosotros || 'N/A'}\n`;
        textContent += `  ellos/ellas/ustedes: ${conjugation.preterite['ellos/ellas/ustedes'] || 'N/A'}\n\n`;
      }

      // Future tense
      if (conjugation.future) {
        textContent += 'FUTURE:\n';
        textContent += `  yo: ${conjugation.future.yo || 'N/A'}\n`;
        textContent += `  tú: ${conjugation.future.tú || 'N/A'}\n`;
        textContent += `  él/ella/usted: ${conjugation.future['él/ella/usted'] || 'N/A'}\n`;
        textContent += `  nosotros: ${conjugation.future.nosotros || 'N/A'}\n`;
        textContent += `  vosotros: ${conjugation.future.vosotros || 'N/A'}\n`;
        textContent += `  ellos/ellas/ustedes: ${conjugation.future['ellos/ellas/ustedes'] || 'N/A'}\n\n`;
      }

      textContent += '\n';
    });

    // Download as text file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `drillmaster-conjugation-table-${timestamp}.txt`;
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showStatus(`Downloaded conjugation table: ${filename}`);
  }

  /**
   * Export conjugation table as HTML
   */
  exportTableHTML() {
    if (this.state.selectedVerbs.size === 0) {
      this.showError('No verbs selected. Please select verbs first.');
      return;
    }

    const selectedVerbObjects = this.state.verbs.filter(verb => 
      this.state.selectedVerbs.has(verb.id)
    );

    let htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spanish Verb Conjugation Table</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
            margin: 2rem; 
            line-height: 1.6; 
        }
        h1 { color: #2563eb; text-align: center; }
        h2 { color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 2rem; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td { 
            padding: 0.75rem; 
            text-align: left; 
            border: 1px solid #d1d5db; 
        }
        th { 
            background-color: #f3f4f6; 
            font-weight: 600; 
            color: #374151;
        }
        tr:nth-child(even) { background-color: #f9fafb; }
        .verb-title { 
            font-size: 1.25rem; 
            font-weight: bold; 
            color: #1f2937; 
            margin-top: 2rem;
        }
        .english { color: #6b7280; font-style: italic; }
        @media (prefers-color-scheme: dark) {
            body { background: #1f2937; color: #f9fafb; }
            th { background-color: #374151; color: #f9fafb; }
            tr:nth-child(even) { background-color: #374151; }
            td { border-color: #4b5563; }
        }
    </style>
</head>
<body>
    <h1>Spanish Verb Conjugation Table</h1>
    <p style="text-align: center; color: #6b7280;">Generated by DrillMaster</p>
`;

    selectedVerbObjects.forEach(verb => {
      const conjugation = this.getConjugation(verb.verb, this.data.conjugations);
      if (!conjugation) return;

      htmlContent += `
    <div class="verb-title">${verb.verb.toUpperCase()} <span class="english">(${verb.english})</span></div>
    <table>
        <thead>
            <tr>
                <th>Subject</th>
                <th>Present</th>
                <th>Preterite</th>
                <th>Future</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>yo</strong></td>
                <td>${conjugation.present?.yo || 'N/A'}</td>
                <td>${conjugation.preterite?.yo || 'N/A'}</td>
                <td>${conjugation.future?.yo || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>tú</strong></td>
                <td>${conjugation.present?.tú || 'N/A'}</td>
                <td>${conjugation.preterite?.tú || 'N/A'}</td>
                <td>${conjugation.future?.tú || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>él/ella/usted</strong></td>
                <td>${conjugation.present?.['él/ella/usted'] || 'N/A'}</td>
                <td>${conjugation.preterite?.['él/ella/usted'] || 'N/A'}</td>
                <td>${conjugation.future?.['él/ella/usted'] || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>nosotros</strong></td>
                <td>${conjugation.present?.nosotros || 'N/A'}</td>
                <td>${conjugation.preterite?.nosotros || 'N/A'}</td>
                <td>${conjugation.future?.nosotros || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>vosotros</strong></td>
                <td>${conjugation.present?.vosotros || 'N/A'}</td>
                <td>${conjugation.preterite?.vosotros || 'N/A'}</td>
                <td>${conjugation.future?.vosotros || 'N/A'}</td>
            </tr>
            <tr>
                <td><strong>ellos/ellas/ustedes</strong></td>
                <td>${conjugation.present?.['ellos/ellas/ustedes'] || 'N/A'}</td>
                <td>${conjugation.preterite?.['ellos/ellas/ustedes'] || 'N/A'}</td>
                <td>${conjugation.future?.['ellos/ellas/ustedes'] || 'N/A'}</td>
            </tr>
        </tbody>
    </table>
`;
    });

    htmlContent += `
</body>
</html>`;

    // Download as HTML file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `drillmaster-conjugation-table-${timestamp}.html`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showStatus(`Downloaded conjugation table: ${filename}`);
  }

  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.errorMessage.style.display = 'none';
    }, 5000);
  }

  showStatus(message) {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.statusMessage.style.display = 'none';
    }, 3000);
  }
}
