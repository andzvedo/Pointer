import { filterNode } from './filterFigmaUtil';
import * as fs from 'fs';

if (require.main === module) {
  const [,, inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) {
    console.error('Uso: ts-node tools/filterFigmaJson.ts <input.json> <output.json>');
    process.exit(1);
  }
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const filtered = filterNode(input);
  fs.writeFileSync(outputPath, JSON.stringify(filtered, null, 2), 'utf8');
  console.log(`Exportação enxuta salva em: ${outputPath}`);
}
