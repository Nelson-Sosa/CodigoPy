const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');

// Check line endings
console.log('Line ending check:', content.includes('\r\n') ? 'CRLF' : 'LF');

// Normalize line endings to LF only
content = content.replace(/\r\n/g, '\n');

// Now find and add the wrapper - look for the sales table specifically
// The sales table is after "Limpiar filtros" and before "Folio"
const lines = content.split('\n');
let newLines = [];
let salesTableAdded = false;

for (let i = 0; i < lines.length; i++) {
  // Check if this is the line before the sales table
  // It should be "        </div>" followed by "        <table className=\"w-full\">" with "Folio" after
  if (!salesTableAdded && 
      lines[i].includes('</div>') && 
      i + 1 < lines.length && 
      lines[i+1].includes('<table className="w-full">') &&
      i + 2 < lines.length &&
      lines[i+2].includes('Folio')) {
    newLines.push(lines[i]);
    newLines.push('<div className="overflow-x-auto">');
    newLines.push(lines[i+1]);
    salesTableAdded = true;
    i++; // Skip the next line since we already added it
  } else {
    newLines.push(lines[i]);
  }
}

if (salesTableAdded) {
  fs.writeFileSync('frontend/src/pages/SalesPage.tsx', newLines.join('\n'), 'utf8');
  console.log('Done - overflow-x-auto added');
} else {
  console.log('Pattern not found');
}