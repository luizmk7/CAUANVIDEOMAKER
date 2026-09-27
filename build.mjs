import { mkdir, cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const files = ['index.html', 'style.css', 'cinema.css', 'app.js', 'cinema.js', 'favicon.svg', 'assets', 'data', 'metadata.json'];
await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
for (const file of files) {
  if (existsSync(file)) {
    await cp(file, `dist/${file}`, {recursive: true});
  }
}
console.log('Site pronto em dist/');
