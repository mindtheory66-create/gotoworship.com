import * as XLSX from 'xlsx';
import fs from 'fs';

const buf = fs.readFileSync('public/Church.xlsx');
const wb = XLSX.read(buf, { type: 'buffer' });
const sheet = wb.Sheets[wb.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as any[];
console.log('rows', json.length);
console.log('columns:', Object.keys(json[0]));
console.log('first row keys sample:');
for (const k of Object.keys(json[0]).slice(0, 30)) {
  console.log(k, ':', json[0][k]);
}
