const fs = require('fs');
const path = require('path');

// Mapping of incorrect present-perfect forms to correct ones
const presentPerfectFixes = {
  // SER fixes
  'have beened': 'have been',
  'has beened': 'has been',
  
  // ESTAR fixes  
  'have beened working': 'have been working',
  'has beened working': 'has been working',
  'have beened very': 'have been very',
  'has beened very': 'has been very',
  'have beened preparing': 'have been preparing',
  'has beened preparing': 'has been preparing',
  'have beened studying': 'have been studying',
  'has beened studying': 'has been studying',
  
  // PODER fixes
  'have abled': 'have been able to',
  'has abled': 'has been able to',
  'have been abled': 'have been able to',
  'has been abled': 'has been able to',
  
  // HACER fixes
  'have maded': 'have made',
  'has maded': 'has made',
  'have doned': 'have done',
  'has doned': 'has done',
  
  // DECIR fixes
  'have sayed': 'have said',
  'has sayed': 'has said',
  'have telled': 'have told',
  'has telled': 'has told',
  
  // VER fixes
  'have seed': 'have seen',
  'has seed': 'has seen',
  
  // PONER fixes
  'have putted': 'have put',
  'has putted': 'has put',
  
  // VENIR fixes
  'have comed': 'have come',
  'has comed': 'has come',
  
  // TRAER fixes
  'have bringed': 'have brought',
  'has bringed': 'has brought',
  
  // OÍR fixes
  'have heared': 'have heard',
  'has heared': 'has heard',
  
  // LLEVAR fixes
  'have carrieded': 'have carried',
  'has carrieded': 'has carried',
  'have been carrieded': 'have carried',
  'has been carrieded': 'has carried',
  
  // LLAMARSE fixes
  'have been calleded': 'have called',
  'has been calleded': 'has called',
  'have calleded': 'have called',
  'has calleded': 'has called',
  
  // IRSE fixes
  'have goned': 'have gone',
  'has goned': 'has gone',
  'have lefted': 'have left',
  'has lefted': 'has left',
  
  // VESTIRSE fixes
  'have getted dressed': 'have gotten dressed',
  'has getted dressed': 'has gotten dressed',
  'have dressed': 'have gotten dressed',
  'has dressed': 'has gotten dressed',
  
  // SENTIRSE fixes
  'have feeled': 'have felt',
  'has feeled': 'has felt',
  
  // PONERSE fixes
  'have putted on': 'have put on',
  'has putted on': 'has put on',
  
  // LEVANTARSE fixes
  'have getted up': 'have gotten up',
  'has getted up': 'has gotten up',
  
  // ACOSTARSE fixes
  'have goned to bed': 'have gone to bed',
  'has goned to bed': 'has gone to bed',
  
  // DESPERTARSE fixes
  'have waked up': 'have woken up',
  'has waked up': 'has woken up',
  
  // DUCHARSE fixes
  'have showered': 'have showered', // This one is actually correct
  'has showered': 'has showered',
  
  // LAVARSE fixes
  'have washed': 'have washed', // This one is correct
  'has washed': 'has washed',
  
  // QUEDARSE fixes
  'have stayed': 'have stayed', // This one is correct
  'has stayed': 'has stayed',
  
  // SENTARSE fixes
  'have sitted down': 'have sat down',
  'has sitted down': 'has sat down',
  
  // CONOCER fixes
  'have knowed': 'have known',
  'has knowed': 'has known',
  
  // SABER fixes
  'have knowed': 'have known',
  'has knowed': 'has known',
  
  // CREER fixes
  'have believed': 'have believed', // This one is correct
  'has believed': 'has believed',
  
  // PENSAR fixes
  'have thinked': 'have thought',
  'has thinked': 'has thought',
  
  // ENTENDER fixes
  'have understood': 'have understood', // This one is correct
  'has understood': 'has understood',
  
  // SENTIR fixes
  'have feeled': 'have felt',
  'has feeled': 'has felt',
  
  // ENCONTRAR fixes
  'have finded': 'have found',
  'has finded': 'has found',
  
  // ENCONTRARSE fixes
  'have meeted': 'have met',
  'has meeted': 'has met',
  
  // PREOCUPARSE fixes
  'have worried': 'have worried', // This one is correct
  'has worried': 'has worried',
  
  // DIVERTIRSE fixes
  'have had fun': 'have had fun', // This one is correct
  'has had fun': 'has had fun',
  'have enjoyed': 'have enjoyed', // This one is correct
  'has enjoyed': 'has enjoyed',
  
  // GUSTAR fixes (backwards verbs)
  'have liked': 'have liked', // This one is correct
  'has liked': 'has liked',
  
  // DOLER fixes
  'have hurted': 'have hurt',
  'has hurted': 'has hurt',
  
  // ENCANTAR fixes
  'have loved': 'have loved', // This one is correct
  'has loved': 'has loved',
  
  // MOLESTAR fixes
  'have bothered': 'have bothered', // This one is correct
  'has bothered': 'has bothered',
  
  // IMPORTAR fixes
  'have mattered': 'have mattered', // This one is correct
  'has mattered': 'has mattered',
  
  // FALTAR fixes
  'have lacked': 'have lacked', // This one is correct
  'has lacked': 'has lacked',
  
  // PARECER fixes
  'have seemed': 'have seemed', // This one is correct
  'has seemed': 'has seemed',
  
  // Common double fixes
  'have been beened': 'have been',
  'has been beened': 'has been',
  'have been abled': 'have been able to',
  'has been abled': 'has been able to'
};

function fixPresentPerfectInFile(filePath) {
  console.log(`\n🔧 Processing: ${path.basename(filePath)}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let fixCount = 0;
  
  // Apply all fixes
  Object.keys(presentPerfectFixes).forEach(incorrect => {
    const correct = presentPerfectFixes[incorrect];
    const regex = new RegExp(incorrect.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      content = content.replace(regex, correct);
      fixCount += matches.length;
      console.log(`  ✅ Fixed "${incorrect}" → "${correct}" (${matches.length} times)`);
    }
  });
  
  // Write back to file
  if (fixCount > 0) {
    fs.writeFileSync(filePath, content);
    console.log(`  📝 Applied ${fixCount} fixes to ${path.basename(filePath)}`);
  } else {
    console.log(`  ✨ No fixes needed in ${path.basename(filePath)}`);
  }
  
  return fixCount;
}

function fixAllCorpusFiles() {
  const corpusDir = path.join(__dirname, '..', 'data', 'corpus');
  const files = [
    'tier1-complete.json',
    'tier2-complete.json', 
    'tier3-complete.json',
    'tier4-complete.json',
    'tier5-complete.json'
  ];
  
  let totalFixes = 0;
  
  console.log('🚀 Starting Present Perfect Tense Fix...\n');
  
  files.forEach(filename => {
    const filePath = path.join(corpusDir, filename);
    if (fs.existsSync(filePath)) {
      totalFixes += fixPresentPerfectInFile(filePath);
    } else {
      console.log(`⚠️  File not found: ${filename}`);
    }
  });
  
  console.log(`\n🎉 COMPLETED! Applied ${totalFixes} total fixes across all corpus files.`);
  console.log('\n📋 Summary of fixes applied:');
  console.log('  • "have beened" → "have been"');
  console.log('  • "have abled" → "have been able to"');
  console.log('  • "have carrieded" → "have carried"');
  console.log('  • "have calleded" → "have called"');
  console.log('  • "have maded" → "have made"');
  console.log('  • "have sayed" → "have said"');
  console.log('  • "have seed" → "have seen"');
  console.log('  • "have putted" → "have put"');
  console.log('  • "have comed" → "have come"');
  console.log('  • "have bringed" → "have brought"');
  console.log('  • "have heared" → "have heard"');
  console.log('  • "have goned" → "have gone"');
  console.log('  • "have feeled" → "have felt"');
  console.log('  • "have thinked" → "have thought"');
  console.log('  • "have finded" → "have found"');
  console.log('  • "have knowed" → "have known"');
  console.log('  • And many more irregular past participle corrections!');
  
  if (totalFixes > 0) {
    console.log('\n🔄 Refresh your browser to see the corrected sentences!');
  }
}

if (require.main === module) {
  fixAllCorpusFiles();
}

module.exports = { fixAllCorpusFiles, fixPresentPerfectInFile };
