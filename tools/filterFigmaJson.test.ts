import { filterNode } from './filterFigmaUtil';
import * as fs from 'fs';

describe('filterNode', () => {
  it('remove propriedades irrelevantes e mantém apenas as essenciais', () => {
    const input = JSON.parse(fs.readFileSync(__dirname + '/input-figma.json', 'utf8'));
    const output = filterNode(input);
    expect(output).toHaveProperty('id');
    expect(output).toHaveProperty('type');
    expect(output).not.toHaveProperty('sharedPluginData');
    expect(output).not.toHaveProperty('pluginData');
    // Adicione outros asserts conforme necessário
  });
});
