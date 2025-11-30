/**
 * Fix conjugations with complete irregular verb data
 * Based on SpanishDict.com verified conjugations
 */

const fs = require('fs');
const path = require('path');

// Complete irregular conjugations (verified against SpanishDict)
const irregularVerbs = {
  // Highly irregular verbs
  SER: {
    present: { yo: 'soy', tú: 'eres', vos: 'sos', 'él/ella/usted': 'es', nosotros: 'somos', vosotros: 'sois', 'ellos/ellas/ustedes': 'son' },
    preterite: { yo: 'fui', tú: 'fuiste', vos: 'fuiste', 'él/ella/usted': 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', 'ellos/ellas/ustedes': 'fueron' },
    future: { yo: 'seré', tú: 'serás', vos: 'serás', 'él/ella/usted': 'será', nosotros: 'seremos', vosotros: 'seréis', 'ellos/ellas/ustedes': 'serán' }
  },
  ESTAR: {
    present: { yo: 'estoy', tú: 'estás', vos: 'estás', 'él/ella/usted': 'está', nosotros: 'estamos', vosotros: 'estáis', 'ellos/ellas/ustedes': 'están' },
    preterite: { yo: 'estuve', tú: 'estuviste', vos: 'estuviste', 'él/ella/usted': 'estuvo', nosotros: 'estuvimos', vosotros: 'estuvisteis', 'ellos/ellas/ustedes': 'estuvieron' },
    future: { yo: 'estaré', tú: 'estarás', vos: 'estarás', 'él/ella/usted': 'estará', nosotros: 'estaremos', vosotros: 'estaréis', 'ellos/ellas/ustedes': 'estarán' }
  },
  IR: {
    present: { yo: 'voy', tú: 'vas', vos: 'vas', 'él/ella/usted': 'va', nosotros: 'vamos', vosotros: 'vais', 'ellos/ellas/ustedes': 'van' },
    preterite: { yo: 'fui', tú: 'fuiste', vos: 'fuiste', 'él/ella/usted': 'fue', nosotros: 'fuimos', vosotros: 'fuisteis', 'ellos/ellas/ustedes': 'fueron' },
    future: { yo: 'iré', tú: 'irás', vos: 'irás', 'él/ella/usted': 'irá', nosotros: 'iremos', vosotros: 'iréis', 'ellos/ellas/ustedes': 'irán' }
  },
  DAR: {
    present: { yo: 'doy', tú: 'das', vos: 'das', 'él/ella/usted': 'da', nosotros: 'damos', vosotros: 'dais', 'ellos/ellas/ustedes': 'dan' },
    preterite: { yo: 'di', tú: 'diste', vos: 'diste', 'él/ella/usted': 'dio', nosotros: 'dimos', vosotros: 'disteis', 'ellos/ellas/ustedes': 'dieron' },
    future: { yo: 'daré', tú: 'darás', vos: 'darás', 'él/ella/usted': 'dará', nosotros: 'daremos', vosotros: 'daréis', 'ellos/ellas/ustedes': 'darán' }
  },
  VER: {
    present: { yo: 'veo', tú: 'ves', vos: 'ves', 'él/ella/usted': 've', nosotros: 'vemos', vosotros: 'veis', 'ellos/ellas/ustedes': 'ven' },
    preterite: { yo: 'vi', tú: 'viste', vos: 'viste', 'él/ella/usted': 'vio', nosotros: 'vimos', vosotros: 'visteis', 'ellos/ellas/ustedes': 'vieron' },
    future: { yo: 'veré', tú: 'verás', vos: 'verás', 'él/ella/usted': 'verá', nosotros: 'veremos', vosotros: 'veréis', 'ellos/ellas/ustedes': 'verán' }
  },
  
  // Stem-changing + irregular
  TENER: {
    present: { yo: 'tengo', tú: 'tienes', vos: 'tenés', 'él/ella/usted': 'tiene', nosotros: 'tenemos', vosotros: 'tenéis', 'ellos/ellas/ustedes': 'tienen' },
    preterite: { yo: 'tuve', tú: 'tuviste', vos: 'tuviste', 'él/ella/usted': 'tuvo', nosotros: 'tuvimos', vosotros: 'tuvisteis', 'ellos/ellas/ustedes': 'tuvieron' },
    future: { yo: 'tendré', tú: 'tendrás', vos: 'tendrás', 'él/ella/usted': 'tendrá', nosotros: 'tendremos', vosotros: 'tendréis', 'ellos/ellas/ustedes': 'tendrán' }
  },
  HACER: {
    present: { yo: 'hago', tú: 'haces', vos: 'hacés', 'él/ella/usted': 'hace', nosotros: 'hacemos', vosotros: 'hacéis', 'ellos/ellas/ustedes': 'hacen' },
    preterite: { yo: 'hice', tú: 'hiciste', vos: 'hiciste', 'él/ella/usted': 'hizo', nosotros: 'hicimos', vosotros: 'hicisteis', 'ellos/ellas/ustedes': 'hicieron' },
    future: { yo: 'haré', tú: 'harás', vos: 'harás', 'él/ella/usted': 'hará', nosotros: 'haremos', vosotros: 'haréis', 'ellos/ellas/ustedes': 'harán' }
  },
  PODER: {
    present: { yo: 'puedo', tú: 'puedes', vos: 'podés', 'él/ella/usted': 'puede', nosotros: 'podemos', vosotros: 'podéis', 'ellos/ellas/ustedes': 'pueden' },
    preterite: { yo: 'pude', tú: 'pudiste', vos: 'pudiste', 'él/ella/usted': 'pudo', nosotros: 'pudimos', vosotros: 'pudisteis', 'ellos/ellas/ustedes': 'pudieron' },
    future: { yo: 'podré', tú: 'podrás', vos: 'podrás', 'él/ella/usted': 'podrá', nosotros: 'podremos', vosotros: 'podréis', 'ellos/ellas/ustedes': 'podrán' }
  },
  QUERER: {
    present: { yo: 'quiero', tú: 'quieres', vos: 'querés', 'él/ella/usted': 'quiere', nosotros: 'queremos', vosotros: 'queréis', 'ellos/ellas/ustedes': 'quieren' },
    preterite: { yo: 'quise', tú: 'quisiste', vos: 'quisiste', 'él/ella/usted': 'quiso', nosotros: 'quisimos', vosotros: 'quisisteis', 'ellos/ellas/ustedes': 'quisieron' },
    future: { yo: 'querré', tú: 'querrás', vos: 'querrás', 'él/ella/usted': 'querrá', nosotros: 'querremos', vosotros: 'querréis', 'ellos/ellas/ustedes': 'querrán' }
  },
  VENIR: {
    present: { yo: 'vengo', tú: 'vienes', vos: 'venís', 'él/ella/usted': 'viene', nosotros: 'venimos', vosotros: 'venís', 'ellos/ellas/ustedes': 'vienen' },
    preterite: { yo: 'vine', tú: 'viniste', vos: 'viniste', 'él/ella/usted': 'vino', nosotros: 'vinimos', vosotros: 'vinisteis', 'ellos/ellas/ustedes': 'vinieron' },
    future: { yo: 'vendré', tú: 'vendrás', vos: 'vendrás', 'él/ella/usted': 'vendrá', nosotros: 'vendremos', vosotros: 'vendréis', 'ellos/ellas/ustedes': 'vendrán' }
  },
  PONER: {
    present: { yo: 'pongo', tú: 'pones', vos: 'ponés', 'él/ella/usted': 'pone', nosotros: 'ponemos', vosotros: 'ponéis', 'ellos/ellas/ustedes': 'ponen' },
    preterite: { yo: 'puse', tú: 'pusiste', vos: 'pusiste', 'él/ella/usted': 'puso', nosotros: 'pusimos', vosotros: 'pusisteis', 'ellos/ellas/ustedes': 'pusieron' },
    future: { yo: 'pondré', tú: 'pondrás', vos: 'pondrás', 'él/ella/usted': 'pondrá', nosotros: 'pondremos', vosotros: 'pondréis', 'ellos/ellas/ustedes': 'pondrán' }
  },
  SALIR: {
    present: { yo: 'salgo', tú: 'sales', vos: 'salís', 'él/ella/usted': 'sale', nosotros: 'salimos', vosotros: 'salís', 'ellos/ellas/ustedes': 'salen' },
    preterite: { yo: 'salí', tú: 'saliste', vos: 'saliste', 'él/ella/usted': 'salió', nosotros: 'salimos', vosotros: 'salisteis', 'ellos/ellas/ustedes': 'salieron' },
    future: { yo: 'saldré', tú: 'saldrás', vos: 'saldrás', 'él/ella/usted': 'saldrá', nosotros: 'saldremos', vosotros: 'saldréis', 'ellos/ellas/ustedes': 'saldrán' }
  },
  DECIR: {
    present: { yo: 'digo', tú: 'dices', vos: 'decís', 'él/ella/usted': 'dice', nosotros: 'decimos', vosotros: 'decís', 'ellos/ellas/ustedes': 'dicen' },
    preterite: { yo: 'dije', tú: 'dijiste', vos: 'dijiste', 'él/ella/usted': 'dijo', nosotros: 'dijimos', vosotros: 'dijisteis', 'ellos/ellas/ustedes': 'dijeron' },
    future: { yo: 'diré', tú: 'dirás', vos: 'dirás', 'él/ella/usted': 'dirá', nosotros: 'diremos', vosotros: 'diréis', 'ellos/ellas/ustedes': 'dirán' }
  },
  SABER: {
    present: { yo: 'sé', tú: 'sabes', vos: 'sabés', 'él/ella/usted': 'sabe', nosotros: 'sabemos', vosotros: 'sabéis', 'ellos/ellas/ustedes': 'saben' },
    preterite: { yo: 'supe', tú: 'supiste', vos: 'supiste', 'él/ella/usted': 'supo', nosotros: 'supimos', vosotros: 'supisteis', 'ellos/ellas/ustedes': 'supieron' },
    future: { yo: 'sabré', tú: 'sabrás', vos: 'sabrás', 'él/ella/usted': 'sabrá', nosotros: 'sabremos', vosotros: 'sabréis', 'ellos/ellas/ustedes': 'sabrán' }
  },
  TRAER: {
    present: { yo: 'traigo', tú: 'traes', vos: 'traés', 'él/ella/usted': 'trae', nosotros: 'traemos', vosotros: 'traéis', 'ellos/ellas/ustedes': 'traen' },
    preterite: { yo: 'traje', tú: 'trajiste', vos: 'trajiste', 'él/ella/usted': 'trajo', nosotros: 'trajimos', vosotros: 'trajisteis', 'ellos/ellas/ustedes': 'trajeron' },
    future: { yo: 'traeré', tú: 'traerás', vos: 'traerás', 'él/ella/usted': 'traerá', nosotros: 'traeremos', vosotros: 'traeréis', 'ellos/ellas/ustedes': 'traerán' }
  },
  CONOCER: {
    present: { yo: 'conozco', tú: 'conoces', vos: 'conocés', 'él/ella/usted': 'conoce', nosotros: 'conocemos', vosotros: 'conocéis', 'ellos/ellas/ustedes': 'conocen' },
    preterite: { yo: 'conocí', tú: 'conociste', vos: 'conociste', 'él/ella/usted': 'conoció', nosotros: 'conocimos', vosotros: 'conocisteis', 'ellos/ellas/ustedes': 'conocieron' },
    future: { yo: 'conoceré', tú: 'conocerás', vos: 'conocerás', 'él/ella/usted': 'conocerá', nosotros: 'conoceremos', vosotros: 'conoceréis', 'ellos/ellas/ustedes': 'conocerán' }
  },
  'OÍR': {
    present: { yo: 'oigo', tú: 'oyes', vos: 'oís', 'él/ella/usted': 'oye', nosotros: 'oímos', vosotros: 'oís', 'ellos/ellas/ustedes': 'oyen' },
    preterite: { yo: 'oí', tú: 'oíste', vos: 'oíste', 'él/ella/usted': 'oyó', nosotros: 'oímos', vosotros: 'oísteis', 'ellos/ellas/ustedes': 'oyeron' },
    future: { yo: 'oiré', tú: 'oirás', vos: 'oirás', 'él/ella/usted': 'oirá', nosotros: 'oiremos', vosotros: 'oiréis', 'ellos/ellas/ustedes': 'oirán' }
  }
};

console.log('🔧 Fixing conjugations with verified irregular verbs...\n');

// Read current conjugations
const conjugationsPath = path.join(__dirname, '../data/conjugations.json');
const conjugations = JSON.parse(fs.readFileSync(conjugationsPath, 'utf-8'));

// Apply fixes
let fixed = 0;
Object.keys(irregularVerbs).forEach(verb => {
  if (conjugations[verb]) {
    conjugations[verb].present = irregularVerbs[verb].present;
    conjugations[verb].preterite = irregularVerbs[verb].preterite;
    conjugations[verb].future = irregularVerbs[verb].future;
    console.log(`✓ Fixed ${verb}`);
    fixed++;
  }
});

// Save
fs.writeFileSync(conjugationsPath, JSON.stringify(conjugations, null, 2));

console.log(`\n✅ Fixed ${fixed} irregular verbs`);
console.log(`📝 Updated: ${conjugationsPath}\n`);
console.log('⚠️  Still need to fix reflexive verbs manually');
console.log('   Reflexive verbs should NOT have "se" in the conjugated forms');
console.log('   Example: LEVANTARSE → "me levanto" not "levantarseo"\n');
