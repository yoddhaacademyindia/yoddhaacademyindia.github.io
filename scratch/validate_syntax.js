const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
const scriptMatches = [...html.matchAll(/<script[\s\S]*?>([\s\S]*?)<\/script>/gi)];

let errors = 0;
scriptMatches.forEach((m, idx) => {
  const code = m[1];
  if (!code.trim()) return;
  try {
    new Function(code);
  } catch (err) {
    console.error('Syntax error in script ' + idx + ':', err.message);
    errors++;
  }
});

if (errors === 0) {
  console.log('✅ ALL SCRIPTS SYNTAX VALID!');
  process.exit(0);
} else {
  console.error('❌ Found ' + errors + ' syntax errors');
  process.exit(1);
}
