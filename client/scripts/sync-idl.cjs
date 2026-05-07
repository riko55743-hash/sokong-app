const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../src/idl/sokong.json');
const tsPath = path.join(__dirname, '../src/idl/sokong.ts');

const jsonStr = fs.readFileSync(jsonPath, 'utf8');

// For the TypeScript type, we replace string keys with non-string keys, and "pubkey" with "publicKey" for TS type checking
const tsTypeStr = jsonStr
    .replace(/"([^"]+)":/g, '$1:')
    .replace(/"pubkey"/g, '"publicKey"');

const finalTsFile = `export type Sokong = ${tsTypeStr};\n\nexport const IDL: Sokong = ${jsonStr};\n`;

fs.writeFileSync(tsPath, finalTsFile);
console.log("Successfully synced sokong.ts from sokong.json");
