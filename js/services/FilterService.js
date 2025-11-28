/**
 * FilterService - Handle verb filtering logic
 */

export class FilterService {
  /**
   * Filter verbs based on current filter settings
   * @param {Array} verbs - All verbs
   * @param {Object} filters - Filter settings
   * @returns {Array} Filtered verbs
   */
  filterVerbs(verbs, filters) {
    return verbs.filter(verb => {
      return this.matchesTierFilter(verb, filters.tiers) &&
             this.matchesRegularityFilter(verb, filters.regularity) &&
             this.matchesVerbTypeFilter(verb, filters.verbTypes) &&
             this.matchesReflexiveFilter(verb, filters.reflexive);
    });
  }

  /**
   * Check if verb matches tier filter
   */
  matchesTierFilter(verb, selectedTiers) {
    if (selectedTiers.length === 0) return true;
    const verbTier = parseInt(verb.tags.tier);
    return selectedTiers.includes(verbTier);
  }

  /**
   * Check if verb matches regularity filter
   */
  matchesRegularityFilter(verb, selectedRegularity) {
    if (selectedRegularity.length === 0) return true;
    return selectedRegularity.includes(verb.tags.regularity);
  }

  /**
   * Check if verb matches verb type filter
   */
  matchesVerbTypeFilter(verb, selectedTypes) {
    if (selectedTypes.length === 0) return true;
    return selectedTypes.includes(verb.tags['verb-type']);
  }

  /**
   * Check if verb matches reflexive filter
   */
  matchesReflexiveFilter(verb, reflexiveFilter) {
    if (reflexiveFilter === 'all') return true;
    
    const isReflexive = verb.tags.reflexive === 'true';
    
    if (reflexiveFilter === 'only') {
      return isReflexive;
    } else if (reflexiveFilter === 'none') {
      return !isReflexive;
    }
    
    return true;
  }
}
