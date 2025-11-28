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
        subjects: ['yo', 'tú', 'él/ella/usted', 'nosotros', 'ellos/ellas/ustedes']
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
      
      // Render initial state
      this.render();
      
      console.log('AppController initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  /**
   * Load data files (verbs, conjugations, templates)
   */
  async loadData() {
    console.log('Loading data files...');
    
    try {
      // Load verbs TSV
      const verbsResponse = await fetch('data/verbs.tsv');
      const verbsText = await verbsResponse.text();
      
      // TODO: Load conjugations.json when available
      // const conjugationsResponse = await fetch('data/conjugations.json');
      // const conjugations = await conjugationsResponse.json();
      
      // TODO: Load templates.json when available
      // const templatesResponse = await fetch('data/templates.json');
      // const templates = await templatesResponse.json();
      
      this.data = {
        verbsText,
        // conjugations,
        // templates
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
    
    // TODO: Initialize remaining services as they are created
    // this.services.conjugator = new ConjugationService();
    // this.services.templates = new TemplateService();
    // this.services.generator = new CardGeneratorService();
    // this.services.exporter = new ExportService();
    // this.services.settings = new SettingsService();
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
      copyTsvBtn: document.getElementById('copy-tsv-btn'),
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
    
    // Preview & Export
    this.elements.generatePreviewBtn.addEventListener('click', () => this.generatePreview());
    this.elements.prevCardBtn.addEventListener('click', () => this.showPreviousCard());
    this.elements.nextCardBtn.addEventListener('click', () => this.showNextCard());
    
    // Export buttons
    this.elements.exportTsvBtn.addEventListener('click', () => this.exportTSV());
    this.elements.copyTsvBtn.addEventListener('click', () => this.copyTSV());
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
        // TODO: Apply saved settings to state and UI
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
    // TODO: Implement card settings logic
    console.log('Card settings changed');
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
  generatePreview() {
    // Validate selections
    if (this.state.selectedVerbs.size === 0) {
      this.showError('Please select at least one verb');
      return;
    }
    
    // Get selected card settings
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
    
    // Calculate expected card count
    const selectedVerbObjects = this.state.verbs.filter(v => this.state.selectedVerbs.has(v.id));
    const templatesPerVerb = 2; // Default from our design
    
    let totalCards = 0;
    cardTypes.forEach(cardType => {
      if (cardType === 'conjugation') {
        // Conjugation cards: 1 per verb/tense/subject
        totalCards += selectedVerbObjects.length * tenses.length * subjects.length;
      } else {
        // Other card types: templatesPerVerb per verb/tense/subject
        totalCards += selectedVerbObjects.length * tenses.length * subjects.length * templatesPerVerb;
      }
    });
    
    // Generate mock preview cards
    this.state.generatedCards = this.generateMockCards(
      selectedVerbObjects,
      cardTypes,
      tenses,
      subjects
    );
    
    this.state.currentPreviewIndex = 0;
    
    // Update UI
    this.updateCardCount();
    this.updateStatistics(selectedVerbObjects, cardTypes, totalCards);
    this.renderCurrentCard();
    this.elements.previewDetails.open = true;
    this.elements.previewNav.style.display = 'block';
    
    // Enable export buttons
    this.elements.exportTsvBtn.disabled = false;
    this.elements.copyTsvBtn.disabled = false;
    this.elements.exportTableTxtBtn.disabled = false;
    this.elements.exportTableHtmlBtn.disabled = false;
    
    this.showStatus(`Generated ${totalCards} cards from ${selectedVerbObjects.length} verbs`);
  }
  
  /**
   * Generate mock cards for preview (until we have real templates/conjugations)
   */
  generateMockCards(verbs, cardTypes, tenses, subjects) {
    const cards = [];
    
    verbs.forEach(verb => {
      tenses.forEach(tense => {
        subjects.forEach(subject => {
          cardTypes.forEach(cardType => {
            if (cardType === 'cloze') {
              cards.push({
                type: 'cloze',
                verb: verb.verb,
                english: verb.english,
                tense: tense,
                subject: subject,
                front: `${subject} {{c1::[${verb.verb}]}} ... (${tense})`,
                back: `${subject} [conjugated form] ... (${tense})`,
                extra: `${verb.english} - ${tense} tense`,
                tags: `tier:${verb.tags.tier};${verb.tags.regularity}`
              });
            } else if (cardType === 'trans-es-en') {
              cards.push({
                type: 'translation-es-en',
                verb: verb.verb,
                english: verb.english,
                tense: tense,
                subject: subject,
                front: `${subject} [conjugated ${verb.verb}] ... (${tense})`,
                back: `${subject} [English translation] ... (${tense})`,
                tags: `tier:${verb.tags.tier};${verb.tags.regularity}`
              });
            } else if (cardType === 'trans-en-es') {
              cards.push({
                type: 'translation-en-es',
                verb: verb.verb,
                english: verb.english,
                tense: tense,
                subject: subject,
                front: `${subject} [English sentence] ... (${tense})`,
                back: `${subject} [conjugated ${verb.verb}] ... (${tense})`,
                tags: `tier:${verb.tags.tier};${verb.tags.regularity}`
              });
            } else if (cardType === 'conjugation') {
              cards.push({
                type: 'conjugation',
                verb: verb.verb,
                english: verb.english,
                tense: tense,
                subject: subject,
                front: `${verb.verb} - ${tense} - ${subject}`,
                back: `[conjugated form]`,
                tags: `tier:${verb.tags.tier};${verb.tags.regularity}`
              });
            }
          });
        });
      });
    });
    
    return cards;
  }
  
  /**
   * Update statistics display
   */
  updateStatistics(verbs, cardTypes, totalCards) {
    this.elements.statVerbs.textContent = `Verbs: ${verbs.length}`;
    this.elements.statCards.textContent = `Total Cards: ${totalCards}`;
    
    const clozeCount = this.state.generatedCards.filter(c => c.type === 'cloze').length;
    const transCount = this.state.generatedCards.filter(c => c.type.startsWith('translation')).length;
    const conjCount = this.state.generatedCards.filter(c => c.type === 'conjugation').length;
    
    this.elements.statCloze.textContent = `Cloze: ${clozeCount}`;
    this.elements.statTranslation.textContent = `Translation: ${transCount}`;
    this.elements.statConjugation.textContent = `Conjugation: ${conjCount}`;
    
    this.elements.statistics.style.display = 'block';
  }

  /**
   * Show previous card in preview
   */
  showPreviousCard() {
    if (this.state.currentPreviewIndex > 0) {
      this.state.currentPreviewIndex--;
      this.renderCurrentCard();
    }
  }

  /**
   * Show next card in preview
   */
  showNextCard() {
    if (this.state.currentPreviewIndex < this.state.generatedCards.length - 1) {
      this.state.currentPreviewIndex++;
      this.renderCurrentCard();
    }
  }

  /**
   * Render current preview card
   */
  renderCurrentCard() {
    if (this.state.generatedCards.length === 0) {
      this.elements.previewContent.innerHTML = '<p style="text-align: center; opacity: 0.7;">No cards generated yet</p>';
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
          ${card.extra ? `<br><br><em>${card.extra}</em>` : ''}
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
    
    // Update button states
    this.elements.prevCardBtn.disabled = this.state.currentPreviewIndex === 0;
    this.elements.nextCardBtn.disabled = this.state.currentPreviewIndex === this.state.generatedCards.length - 1;
  }

  /**
   * Export cards as TSV
   */
  exportTSV() {
    if (this.state.generatedCards.length === 0) {
      this.showError('No cards to export. Please generate cards first.');
      return;
    }

    // Format cards as TSV
    const tsvLines = this.state.generatedCards.map(card => {
      // Format depends on card type
      if (card.type === 'cloze') {
        // Cloze format: Text\tExtra\tVerb\tTags
        return [
          card.front,
          card.back,
          `${card.verb} (${card.english})`,
          card.tags
        ].join('\t');
      } else if (card.type.startsWith('translation')) {
        // Translation format: Front\tBack\tVerb\tTags
        return [
          card.front,
          card.back,
          `${card.verb} (${card.english})`,
          card.tags
        ].join('\t');
      } else if (card.type === 'conjugation') {
        // Conjugation format: Prompt\tAnswer\tExample\tTags
        return [
          card.front,
          card.back,
          card.extra || '',
          card.tags
        ].join('\t');
      }
    });

    const tsvContent = tsvLines.join('\n');
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `drillmaster-cards-${timestamp}.tsv`;
    
    // Create blob and download
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    
    this.showStatus(`Exported ${this.state.generatedCards.length} cards to ${filename}`);
  }

  /**
   * Copy TSV to clipboard
   */
  async copyTSV() {
    if (this.state.generatedCards.length === 0) {
      this.showError('No cards to copy. Please generate cards first.');
      return;
    }

    // Format cards as TSV (same as export)
    const tsvLines = this.state.generatedCards.map(card => {
      if (card.type === 'cloze') {
        return [
          card.front,
          card.back,
          `${card.verb} (${card.english})`,
          card.tags
        ].join('\t');
      } else if (card.type.startsWith('translation')) {
        return [
          card.front,
          card.back,
          `${card.verb} (${card.english})`,
          card.tags
        ].join('\t');
      } else if (card.type === 'conjugation') {
        return [
          card.front,
          card.back,
          card.extra || '',
          card.tags
        ].join('\t');
      }
    });

    const tsvContent = tsvLines.join('\n');
    
    try {
      await navigator.clipboard.writeText(tsvContent);
      this.showStatus(`Copied ${this.state.generatedCards.length} cards to clipboard`);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showError('Failed to copy to clipboard. Please try downloading instead.');
    }
  }

  /**
   * Export conjugation table as text
   */
  exportTableText() {
    // TODO: Implement text table export
    console.log('Export text table');
    this.showStatus('Text table export not yet implemented');
  }

  /**
   * Export conjugation table as HTML
   */
  exportTableHTML() {
    // TODO: Implement HTML table export
    console.log('Export HTML table');
    this.showStatus('HTML table export not yet implemented');
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
   * Show error message
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.errorMessage.style.display = 'none';
    }, 5000);
  }

  /**
   * Show status message
   */
  showStatus(message) {
    this.elements.statusMessage.textContent = message;
    this.elements.statusMessage.style.display = 'block';
    
    setTimeout(() => {
      this.elements.statusMessage.style.display = 'none';
    }, 3000);
  }
}
