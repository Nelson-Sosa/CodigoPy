const fs = require('fs');
const content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');
const lines = content.split('\n');

let newContent = '';
let inTable = false;
let added = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find the closing </div> of the filters section
  if (!added && line.trim() === '</div>' && i + 1 < lines.length && lines[i + 1].includes('<table className="w-full">')) {
    newContent += line + '\n';
    newContent += '        <div className="overflow-x-auto">\n';
    inTable = true;
    added = true;
    continue;
  }
  
  // Find the closing </table> and </div> for the table section
  if (inTable && line.trim() === '</table>') {
    newContent += line + '\n';
    newContent += '        </div>\n';
    inTable = false;
    continue;
  }
  
  // Skip the old </div> that was closing the filters
  if (inTable && i + 1 < lines.length && lines[i + 1].includes('<table className="w-full">')) {
    continue;
  }
  
  newContent += line + '\n';
}

fs.writeFileSync('frontend/src/pages/SalesPage.tsx', newContent, 'utf8');
console.log('Done');