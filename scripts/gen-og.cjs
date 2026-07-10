const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '..', 'public', 'og-image.svg');
const output = path.join(__dirname, '..', 'public', 'og-image.png');

sharp(input)
    .resize(1200, 630)
    .png()
    .toFile(output)
    .then(() => console.log('OG PNG generated:', output))
    .catch(err => { console.error('OG PNG error:', err); process.exit(1); });
