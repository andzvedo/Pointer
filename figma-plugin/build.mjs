import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';

const outdir = 'dist';
const isWatchMode = process.argv.includes('--watch');

// Função para copiar ui.html
async function copyHtml() {
  try {
    await fs.copyFile('ui.html', path.join(outdir, 'ui.html'));
    console.log('ui.html copiado.');
  } catch (err) {
    console.error('Erro ao copiar ui.html:', err);
  }
}

async function build() {
  try {
    // Garante que o diretório de saída exista
    await fs.mkdir(outdir, { recursive: true });

    // Configuração base do esbuild
    const buildOptions = {
      entryPoints: ['code.ts'],
      bundle: true,
      outfile: path.join(outdir, 'code.js'),
      format: 'cjs',
      target: 'es2017',
      platform: 'node',
      logLevel: 'info',
    };

    // Copia inicial do HTML
    await copyHtml();

    if (isWatchMode) {
      console.log('Iniciando build em modo watch...');
      // Configura esbuild para watch
      const context = await esbuild.context({
        ...buildOptions,
        logLevel: 'debug', // Mais logs no modo watch
      });
      await context.watch();

      // Observa ui.html para cópia
      fs.watch('ui.html').on('change', () => {
        console.log('ui.html modificado, copiando...');
        copyHtml();
      });

    } else {
      // Build único
      await esbuild.build(buildOptions);
      console.log('Build concluído com sucesso!');
    }

  } catch (err) {
    console.error('Erro durante o build:', err);
    process.exit(1);
  }
}

build(); 