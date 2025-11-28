/**
 * VerbParserService - Parse TSV verb list and tags
 */

export class VerbParserService {
  /**
   * Parse TSV content into verb objects
   * @param {string} tsvContent - Raw TSV file content
   * @returns {Array} Array of verb objects
   */
  parseTSV(tsvContent) {
    const lines = tsvContent.trim().split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    const verbs = dataLines
      .filter(line => line.trim().length > 0)
      .map((line, index) => {
        const [verb, english, tags, notes] = line.split('\t');
        
        return {
          id: index,
          verb: verb.trim(),
          english: english.trim(),
          tagsRaw: tags.trim(),
          tags: this.parseTags(tags.trim()),
          notes: notes ? notes.trim() : ''
        };
      });
    
    console.log(`Parsed ${verbs.length} verbs`);
    return verbs;
  }

  /**
   * Parse semicolon-separated tags into structured object
   * @param {string} tagString - Tag string like "tier:1;word-type:verb;verb-type:ar"
   * @returns {Object} Parsed tags object
   */
  parseTags(tagString) {
    const tags = {};
    
    tagString.split(';').forEach(tag => {
      const parts = tag.split(':');
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').trim();
      
      if (!key) return;
      
      // Handle multiple values for same key (e.g., verb-tense)
      if (tags[key]) {
        if (!Array.isArray(tags[key])) {
          tags[key] = [tags[key]];
        }
        tags[key].push(value);
      } else {
        tags[key] = value;
      }
    });
    
    return tags;
  }

  /**
   * Check if verb has a specific tag value
   * @param {Object} tags - Parsed tags object
   * @param {string} key - Tag key
   * @param {string} value - Tag value to check (optional)
   * @returns {boolean}
   */
  hasTag(tags, key, value = null) {
    if (!tags[key]) return false;
    if (value === null) return true;
    
    if (Array.isArray(tags[key])) {
      return tags[key].some(v => v.includes(value));
    }
    return tags[key].includes(value);
  }

  /**
   * Get display name for verb (with reflexive marker if applicable)
   * @param {Object} verb - Verb object
   * @returns {string}
   */
  getDisplayName(verb) {
    const isReflexive = this.hasTag(verb.tags, 'reflexive', 'true');
    return isReflexive ? `${verb.verb} (reflexive)` : verb.verb;
  }
}
