const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');

// First, let's check the exact content around the sales table
const lines = content.split('\n');
console.log('Line 506:', JSON.stringify(lines[505]));
console.log('Line 507:', JSON.stringify(lines[506]));

// Find the line with '<table className="w-full">' that comes after the filter section
let found = false;
let newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i === 506 && lines[i].includes('<table className="w-full">')) {
    // Add overflow-x-auto wrapper before this table
    newLines.push('<div className="overflow-x-auto">');
    found = true;
  }
  newLines.push(lines[i]);
}

if (found) {
  fs.writeFileSync('frontend/src/pages/SalesPage.tsx', newLines.join('\n'));
  console.log('Done - added overflow-x-auto wrapper');
} else {
  console.log('Pattern not found');
}