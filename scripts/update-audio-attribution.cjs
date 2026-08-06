const fs = require('fs');
const dir = 'src/locales';

const updates = {
  ko: {
    docName: '김동준 원장 (사랑동물병원)',
    sub: '사랑동물병원 김동준 원장님 현장 반응 통화 녹음',
  },
  en: {
    docName: 'Dr. Dong-Jun Kim (Sarang Animal Hospital)',
    sub: 'Field response call recording with Dr. Dong-Jun Kim (Sarang Animal Hospital)',
  },
  ja: {
    docName: 'キム・ドンジュン院長 (サラン動物病院)',
    sub: 'サラン動物病院キム・ドンジュン院長の現場反応の電話録音',
  },
  zh: {
    docName: '金东俊 院长 (思朗动物医院)',
    sub: '思朗动物医院 金东俊 院长的现场反馈通话录音',
  },  es: {
    docName: 'Dr. Dong-Jun Kim (Hospital Veterinario Sarang)',
    sub: 'Grabación de llamada sobre la reacción en campo del Dr. Dong-Jun Kim (Hospital Veterinario Sarang)',
  },
  fr: {
    docName: "Dr Dong-Jun Kim (Hôpital Vétérinaire Sarang)",
    sub: "Enregistrement d'appel sur la réaction de terrain du Dr Dong-Jun Kim (Hôpital Vétérinaire Sarang)",
  },
  de: {
    docName: 'Dr. Dong-Jun Kim (Tierklinik Sarang)',
    sub: 'Telefonaufzeichnung der Feldreaktion von Dr. Dong-Jun Kim (Tierklinik Sarang)',
  },
  th: {
    docName: 'น.สพ. คิม ดงจุน (โรงพยาบาลสัตว์ Sarang)',
    sub: 'บันทึกเสียงโทรศัพท์ปฏิกิริยาภาคสนามของ น.สพ. คิม ดงจุน (โรงพยาบาลสัตว์ Sarang)',
  },
  vi: {
    docName: 'Bác sĩ Dong-Jun Kim (Bệnh viện thú y Sarang)',
    sub: 'Ghi âm cuộc gọi phản hồi thực tế của Bác sĩ Dong-Jun Kim (Bệnh viện thú y Sarang)',
  },
  ru: {
    docName: 'Д-р Дон-Джун Ким (Ветклиника Саран)',
    sub: 'Аудиозапись звонка о реакции на месте от д-ра Дон-Джуна Кима (Ветклиника Саран)',
  },
  pt: {
    docName: 'Dr. Dong-Jun Kim (Hospital Veterinário Sarang)',
    sub: 'Gravação de chamada sobre a reação em campo do Dr. Dong-Jun Kim (Hospital Veterinário Sarang)',
  },
  ar: {
    docName: 'د. دونغ-جون كيم (مستشفى سارانغ البيطري)',
    sub: 'تسجيل مكالمة حول رد فعل ميداني للدكتور دونغ-جون كيم (مستشفى سارانغ البيطري)',
  },
  id: {
    docName: 'Dr. Dong-Jun Kim (RS Hewan Sarang)',
    sub: 'Rekaman panggilan reaksi lapangan Dr. Dong-Jun Kim (RS Hewan Sarang)',
  },
  ms: {
    docName: 'Dr. Dong-Jun Kim (Hospital Veterinar Sarang)',
    sub: 'Rakaman panggilan tindak balas lapangan Dr. Dong-Jun Kim (Hospital Veterinar Sarang)',
  },
  tr: {
    docName: 'Dr. Dong-Jun Kim (Sarang Veteriner Hastanesi)',
    sub: 'Dr. Dong-Jun Kim (Sarang Veteriner Hastanesi) saha tepkisi telefon kaydı',
  },
};

let count = 0;
for (const lang of fs.readdirSync(dir)) {
  if (!updates[lang]) continue;
  const f = dir + '/' + lang + '/translation.json';
  const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!j.audioTestimonial) continue;
  j.audioTestimonial.docName = updates[lang].docName;
  j.audioTestimonial.sub = updates[lang].sub;
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + '\n', 'utf8');
  count++;
}
console.log('updated', count, 'locales');
