const fs = require('fs');
const dir = 'src/locales';

// Each entry: [lang, keyPath, oldExact, newExact]
const edits = [
  // ---- Korean ----
  ['ko', 'about.desc1', '소화기 1차 상비·처방 보조제', '소화기 1차 상비·급여 보조제'],
  ['ko', 'features.subtitle', '차세대 어린 동물 설사 치료 보조제', '차세대 어린 동물 설사 관리 보조제'],
  ['ko', 'clinical.card4_quote3', '1차 상비·처방 보조제로 필수적', '1차 상비·급여 보조제로 필수적'],
  ['ko', 'clinical.card4_note', '임상 데이터와 처방 기준을 철저히 검증', '임상 데이터와 급여 기준을 철저히 검증'],
  ['ko', 'target.other', '수의사 처방 하에 적용 가능', '수의사 상담·지도 하에 적용 가능'],
  ['ko', 'testimonials.t1Content', '파보겔을 처방하는데', '파보겔을 급여하는데'],
  ['ko', 'footer.desc', '신생아 설사 치료의 새로운 기준', '신생아 설사 관리의 새로운 기준'],
  ['ko', 'tech.t3Note', '입원 기간 단축 및 치료 효율', '입원 기간 단축 및 회복 효율'],
  ['ko', 'stickyCta.title', '신생아 지사 보조제', '신생아 설사 관리 보조제'],
  ['ko', 'animalSelector.animals.goat.effects.0', '급성 소화불량 치료', '급성 소화불량 완화'],

  // ---- English (also used as EN fallback in ar/de/es/fr/id/ms/pt/ru/th/tr/vi/zh e2Quote) ----
  ['en', 'experts.e2Quote', 'Beyond simple diarrhea treatment, it provides', 'Beyond simple diarrhea care, it provides'],
  ['en', 'target.other', 'under veterinary prescription', 'under veterinary guidance'],
  ['en', 'testimonials.t1Content', 'I prescribe Parvogel', 'I administer Parvogel'],
  ['en', 'footer.desc', 'diarrhea treatment', 'diarrhea care'],
  ['en', 'stickyCta.title', 'Antidiarrheal Supplement', 'Diarrhea Care Supplement'],
  ['en', 'animalSelector.animals.goat.effects.0', 'Treats acute indigestion', 'Helps relieve acute indigestion'],

  // ---- Japanese ----
  ['ja', 'features.subtitle', '次世代新生児下痢治療補助剤', '次世代新生児下痢管理補助剤'],
  ['ja', 'clinical.card4_quote3', '1次常備・処方補助剤として不可欠', '1次常備・給与補助剤として不可欠'],
  ['ja', 'clinical.card4_note', '臨床データと処方基準を厳格に検証', '臨床データと給与基準を厳格に検証'],
  ['ja', 'target.other', '獣医師処方の下で適用可能', '獣医師の指導の下で適用可能'],
  ['ja', 'testimonials.t1Content', 'パルボゲル処方するが', 'パルボゲルを給与するが'],
  ['ja', 'footer.desc', '新生児下痢治療の新基準', '新生児下痢管理の新基準'],
  ['ja', 'stickyCta.title', '新生児下痢止剤', '新生児下痢ケア補助剤'],

  // ---- Chinese ----
  ['zh', 'features.subtitle', '新生仔腹泻治疗辅助剂', '新生仔腹泻管理辅助剂'],
  ['zh', 'clinical.card4_quote3', '首选常备处方辅剂', '首选常备辅助剂'],
  ['zh', 'clinical.card4_note', '临床数据及处方标准', '临床数据及使用标准'],
  ['zh', 'target.other', '在兽医处方下也可适用', '在兽医指导下也可适用'],
  ['zh', 'testimonials.t1Content', '每次处方帕博格尔', '每次给与帕博格尔'],
  ['zh', 'footer.desc', '腹泻治疗的新标准', '腹泻管理的新标准'],
  ['zh', 'stickyCta.title', '止泻辅剂', '腹泻管理辅剂'],
  ['zh', 'animalSelector.animals.goat.effects.0', '治疗初乳不足幼羔羊肠粘膜细胞急性消化不良', '改善初乳不足幼羔羊肠粘膜细胞急性消化不良'],

  // ---- Thai ----
  ['th', 'features.subtitle', 'รักษาท้องเสียลูกสัตว์', 'ดูแลอาการท้องเสียลูกสัตว์'],
  ['th', 'clinical.card4_quote3', 'ไม่เพียงแต่รักษาอาการท้องเสีย', 'ไม่เพียงแต่ดูแลอาการท้องเสีย'],
  ['th', 'target.other', 'ภายใต้ใบสั่งสัตวแพทย์', 'ภายใต้คำแนะนำของสัตวแพทย์'],
  ['th', 'testimonials.t1Content', 'ฉันสั่ง Parvogel', 'ฉันให้ Parvogel'],
  ['th', 'footer.desc', 'การรักษาท้องเสียลูกสัตว์', 'การดูแลท้องเสียลูกสัตว์'],
  ['th', 'stickyCta.title', 'อาหารเสริมแก้ท้องเสีย', 'อาหารเสริมดูแลท้องเสีย'],
  ['th', 'animalSelector.animals.goat.effects.0', 'รักษาอาการอาหารไม่ย่อยเฉียบพลัน', 'บรรเทาอาการอาหารไม่ย่อยเฉียบพลัน'],

  // ---- Vietnamese ----
  ['vi', 'features.subtitle', 'trị tiêu chảy sơ sinh', 'hỗ trợ tiêu chảy sơ sinh'],
  ['vi', 'target.other', 'theo đơn bác sĩ thú y', 'theo hướng dẫn bác sĩ thú y'],
  ['vi', 'testimonials.t1Content', 'tôi kê Parvogel', 'tôi cho dùng Parvogel'],
  ['vi', 'footer.desc', 'điều trị tiêu chảy sơ sinh', 'chăm sóc tiêu chảy sơ sinh'],
  ['vi', 'stickyCta.title', 'Bổ Sung Trị Tiêu Chảy', 'Bổ Sung Hỗ Trợ Tiêu Chảy'],
  ['vi', 'animalSelector.animals.goat.effects.0', 'Điều trị chứng khó tiêu cấp tính', 'Hỗ trợ giảm chứng khó tiêu cấp tính'],

  // ---- Indonesian ----
  ['id', 'features.subtitle', 'Suplemen generasi baru diare neonatal', 'Suplemen generasi baru perawatan diare neonatal'],
  ['id', 'target.other', 'dengan resep dokter hewan', 'dengan bimbingan dokter hewan'],
  ['id', 'testimonials.t1Content', 'saya resep Parvogel', 'saya berikan Parvogel'],
  ['id', 'footer.desc', 'penanganan diare neonatal', 'perawatan diare neonatal'],
  ['id', 'stickyCta.title', 'Suplemen Anti Diare', 'Suplemen Perawatan Diare'],
  ['id', 'animalSelector.animals.goat.effects.0', 'Mengobati gangguan pencernaan akut', 'Membantu mengatasi gangguan pencernaan akut'],

  // ---- Malay ----
  ['ms', 'features.subtitle', 'Suplemen generasi baharu cirit-birit neonatal', 'Suplemen generasi baharu penjagaan cirit-birit neonatal'],
  ['ms', 'target.other', 'dengan resepi veterinar', 'dengan bimbingan veterinar'],
  ['ms', 'testimonials.t1Content', 'saya resep Parvogel', 'saya berikan Parvogel'],
  ['ms', 'footer.desc', 'rawatan cirit-birit neonatal', 'penjagaan cirit-birit neonatal'],
  ['ms', 'stickyCta.title', 'Suplemen Anti Cirit-Birit', 'Suplemen Penjagaan Cirit-Birit'],
  ['ms', 'animalSelector.animals.goat.effects.0', 'Merawat gangguan pencernaan akut', 'Membantu melegakan gangguan pencernaan akut'],

  // ---- Arabic ----
  ['ar', 'features.subtitle', 'مكمل جيل جديد لإسهال المواليد', 'مكمل جيل جديد للعناية بإسهال المواليد'],
  ['ar', 'target.other', 'بوصفة بيطرية', 'بتوجيه من طبيب بيطري'],
  ['ar', 'testimonials.t1Content', 'أصف Parvogel', 'أعطي Parvogel'],
  ['ar', 'footer.desc', 'لعلاج إسهال المواليد', 'للعناية بإسهال المواليد'],
  ['ar', 'stickyCta.title', 'لمكافحة إسهال المواليد', 'للعناية بإسهال المواليد'],
  ['ar', 'animalSelector.animals.goat.effects.0', 'يعالج عسر الهضم الحاد', 'يساعد في تخفيف عسر الهضم الحاد'],

  // ---- Spanish ----
  ['es', 'features.subtitle', 'Suplemento de próxima generación para diarrea neonatal', 'Suplemento de próxima generación para el cuidado de la diarrea neonatal'],
  ['es', 'target.other', 'bajo receta veterinaria', 'bajo orientación veterinaria'],
  ['es', 'testimonials.t1Content', 'Receto Parvogel', 'Administro Parvogel'],
  ['es', 'footer.desc', 'para el tratamiento de diarrea neonatal', 'para el cuidado de la diarrea neonatal'],
  ['es', 'stickyCta.title', 'Suplemento Antidiarreico Neonatal', 'Suplemento para el Cuidado de la Diarrea Neonatal'],
  ['es', 'animalSelector.animals.goat.effects.0', 'Trata la indigestión aguda', 'Ayuda a aliviar la indigestión aguda'],

  // ---- French ----
  ['fr', 'features.subtitle', 'contre la diarrhée néonatale', 'pour la prise en charge de la diarrhée néonatale'],
  ['fr', 'target.other', 'sous ordonnance vétérinaire', 'sous supervision vétérinaire'],
  ['fr', 'testimonials.t1Content', 'Je prescris Parvogel', "J'administre Parvogel"],
  ['fr', 'footer.desc', 'pour le traitement de la diarrhée néonatale', 'pour la prise en charge de la diarrhée néonatale'],
  ['fr', 'stickyCta.title', 'Supplément Antidiarrhéique Néonatal', 'Supplément de Prise en Charge de la Diarrhée Néonatale'],
  ['fr', 'animalSelector.animals.goat.effects.0', "Traite l'indigestion aiguë", "Aide à soulager l'indigestion aiguë"],

  // ---- German ----
  ['de', 'features.subtitle', 'neonataler Durchfall-Hilfe', 'neonataler Durchfallpflege'],
  ['de', 'target.other', 'unter tierärztlichem Rezept', 'unter tierärztlicher Anleitung'],
  ['de', 'testimonials.t1Content', 'Ich verschreibe jede', 'Ich verabreiche jede'],
  ['de', 'footer.desc', 'neonatale Durchfallbehandlung', 'neonatale Durchfallpflege'],
  ['de', 'stickyCta.title', 'Antidiarrhoikum Ergänzungsmittel', 'Durchfallpflege-Ergänzungsmittel'],
  ['de', 'animalSelector.animals.goat.effects.0', 'Behandelt akute Verdauungsstörungen', 'Hilft bei akuten Verdauungsstörungen'],

  // ---- Russian ----
  ['ru', 'features.subtitle', 'Добавка нового поколения при неонатальной диарее', 'Добавка нового поколения для ухода при неонатальной диарее'],
  ['ru', 'target.other', 'по рецепту ветврача', 'под руководством ветврача'],
  ['ru', 'testimonials.t1Content', 'назначаю Parvogel', 'применяю Parvogel'],
  ['ru', 'footer.desc', 'лечения неонатальной диареи', 'ухода при неонатальной диарее'],
  ['ru', 'stickyCta.title', 'Неонатальная кормовая добавка', 'Кормовая добавка для ухода при диарее'],
  ['ru', 'animalSelector.animals.goat.effects.0', 'Лечит острое несварение', 'Помогает при остром несварении'],

  // ---- Portuguese ----
  ['pt', 'features.subtitle', 'para diarreia neonatal', 'para o cuidado da diarreia neonatal'],
  ['pt', 'target.other', 'sob receita veterinária', 'sob orientação veterinária'],
  ['pt', 'testimonials.t1Content', 'Receito Parvogel', 'Administro Parvogel'],
  ['pt', 'footer.desc', 'para tratamento de diarreia neonatal', 'para o cuidado da diarreia neonatal'],
  ['pt', 'stickyCta.title', 'Suplemento Antidiarreico Neonatal', 'Suplemento para o Cuidado da Diarreia Neonatal'],
  ['pt', 'animalSelector.animals.goat.effects.0', 'Trata a indigestão aguda', 'Ajuda a aliviar a indigestão aguda'],

  // ---- Turkish ----
  ['tr', 'features.subtitle', 'neonatal ishal takviyesi', 'neonatal ishal bakım takviyesi'],
  ['tr', 'target.other', 'veteriner reçetesiyle', 'veteriner gözetiminde'],
  ['tr', 'testimonials.t1Content', 'Parvogel reçete ediyorum', 'Parvogel uyguluyorum'],
  ['tr', 'footer.desc', 'neonatal ishal tedavisinde yeni standart', 'neonatal ishal bakımında yeni standart'],
  ['tr', 'stickyCta.title', 'İshali Önleyici Takviye', 'İshal Bakım Takviyesi'],
  ['tr', 'animalSelector.animals.goat.effects.0', 'tedavi eder', 'hafifletmeye yardımcı olur'],
];

function get(o, path) {
  return path.split('.').reduce((a, p) => (a ? a[p] : undefined), o);
}
function set(o, path, v) {
  const parts = path.split('.');
  let cur = o;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = v;
}

let changed = 0;
const byLang = {};
for (const [lang, key, oldS, newS] of edits) {
  if (!byLang[lang]) byLang[lang] = [];
  byLang[lang].push([key, oldS, newS]);
}

// Apply EN-fallback e2Quote softening to all locales that carry the English string
for (const lang of fs.readdirSync(dir)) {
  const f = dir + '/' + lang + '/translation.json';
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  const e2 = get(j, 'experts.e2Quote');
  if (e2 && e2.includes('Beyond simple diarrhea treatment')) {
    set(j, 'experts.e2Quote', e2.replace('Beyond simple diarrhea treatment', 'Beyond simple diarrhea care'));
    changed++;
  }
  // also clinical.card4_quote3 if English
  const c4 = get(j, 'clinical.card4_quote3');
  if (c4 && c4.includes('Beyond simple diarrhea treatment')) {
    set(j, 'clinical.card4_quote3', c4.replace('Beyond simple diarrhea treatment', 'Beyond simple diarrhea care'));
    changed++;
  }
  for (const [key, oldS, newS] of byLang[lang] || []) {
    const v = get(j, key);
    if (typeof v === 'string' && v.includes(oldS)) {
      set(j, key, v.replace(oldS, newS));
      changed++;
    } else {
      console.warn(`MISS [${lang}] ${key} not found: ${oldS}`);
    }
  }
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n', 'utf8');
}
console.log('done,', changed, 'edits applied');
