const fs = require('fs');
const dir = 'src/locales';

const edits = {
  en: ['Excellent therapeutic effects', 'Excellent efficacy'],
  de: ['Hervorragende therapeutische Effekte', 'Hervorragende Wirksamkeit'],
  es: ['Excelentes efectos terapéuticos', 'Excelente eficacia'],
  fr: ['Excellents effets thérapeutiques', 'Excellente efficacité'],
  id: ['Efek terapi unggul', 'Kemanjuran unggul'],
  ms: ['Kesan terapeutik cemerlang', 'Keberkesanan cemerlang'],
  pt: ['Excelentes efeitos terapêuticos', 'Excelente eficácia'],
  ar: ['نتائج علاجية متميزة', 'فعالية متميزة'],
  tr: ['üstün tedavi etkileri', 'üstün etkinlik'],
  vi: ['Hiệu quả điều trị vượt trội', 'Hiệu quả vượt trội'],
};

let changed = 0;
for (const lang of fs.readdirSync(dir)) {
  if (!edits[lang]) continue;
  const f = dir + '/' + lang + '/translation.json';
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const [oldS, newS] = edits[lang];
  if (j.clinical && typeof j.clinical.subtitle === 'string' && j.clinical.subtitle.includes(oldS)) {
    j.clinical.subtitle = j.clinical.subtitle.replace(oldS, newS);
    changed++;
  } else {
    console.warn(`MISS [${lang}] clinical.subtitle: ${oldS}`);
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n', 'utf8');
}
console.log('done,', changed, 'clinical.subtitle edits');
