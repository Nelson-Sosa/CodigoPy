const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');

// Remove extra whitespace and normalize
content = content.trim();

// Find the pattern for sales table - it's the first <table className="w-full"> in the main content
// after the filter section that has 'Folio' as the first column header
const pattern = /<table className="w-full">\s*<thead className="bg-gray-50">\s*<tr className="text-left text-gray-500 text-sm">\s*<th className="p-4">Folio<\/th>/;

const replacement = '<div className="overflow-x-auto">\n        <table className="w-full">\n          <thead className="bg-gray-50">\n            <tr className="text-left text-gray-500 text-sm">\n              <th className="p-4">Folio</th>';

const newContent = content.replace(pattern, replacement);

if (newContent !== content) {
  fs.writeFileSync('frontend/src/pages/SalesPage.tsx', newContent, 'utf8');
  console.log('Done');
} else {
  console.log('Pattern not found');
}