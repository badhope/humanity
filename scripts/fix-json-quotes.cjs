const fs = require('fs');
const path = require('path');

function fixJsonContent(content) {
  let result = content;

  result = result.replace(/\u201c/g, "'");
  result = result.replace(/\u201d/g, "'");
  result = result.replace(/\u2018/g, "'");
  result = result.replace(/\u2019/g, "'");

  result = result.replace(/"([^"]*)"/g, (match, p1) => {
    if (p1.includes('"')) {
      return '"' + p1.replace(/"/g, '\\"') + '"';
    }
    return match;
  });

  return result;
}

function validateAndFixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    content = fixJsonContent(content);

    JSON.parse(content);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to fix ${filePath}: ${error.message}`);
    return false;
  }
}

const jsonFiles = [
  'public/assessments/personality/mbti/expert.json',
  'public/assessments/personality/mbti/lite.json',
  'public/assessments/personality/mbti/standard.json',
  'public/assessments/cognition/focus/expert.json',
  'public/assessments/cognition/focus/standard.json',
  'public/assessments/cognition/focus-style.json',
  'public/assessments/ideology/values/expert.json',
  'public/assessments/ideology/values/lite.json',
  'public/assessments/ideology/values/standard.json',
  'public/assessments/psychology/resilience/lite.json',
];

console.log('Fixing JSON files...');
let fixedCount = 0;
let failedCount = 0;

for (const file of jsonFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (validateAndFixFile(fullPath)) {
      fixedCount++;
    } else {
      failedCount++;
    }
  } else {
    console.log(`File not found: ${file}`);
  }
}

console.log(`\nDone! Fixed: ${fixedCount}, Failed: ${failedCount}`);