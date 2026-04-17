const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SalesPage.tsx', 'utf8');

content = content.replace(
  '        </div>\n        <table className="w-full">\n          <thead className="bg-gray-50">',
  '        </div>\n        <div className="overflow-x-auto">\n        <table className="w-full">\n          <thead className="bg-gray-50">'
);

fs.writeFileSync('frontend/src/pages/SalesPage.tsx', content);
console.log('Done');