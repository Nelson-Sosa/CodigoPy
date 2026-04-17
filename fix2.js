const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');

// Find the first <table className="w-full"> after the filters section (sales table)
// We need to add <div className="overflow-x-auto"> before it

// More specific search - find the pattern around line 507
const searchPattern = '</div>\n        <table className="w-full">\n          <thead className="bg-gray-50">';
const replacePattern = '</div>\n        <div className="overflow-x-auto">\n        <table className="w-full">\n          <thead className="bg-gray-50">';

const idx = content.indexOf(searchPattern);
if (idx !== -1) {
  content = content.substring(0, idx) + replacePattern + content.substring(idx + searchPattern.length);
}

fs.writeFileSync('frontend/src/pages/SalesPage.tsx', content);
console.log('Done - added overflow-x-auto at position:', idx);