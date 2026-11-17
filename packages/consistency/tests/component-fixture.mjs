import { readFile } from 'node:fs/promises';
export async function componentFixture(file) {
 const bytes=await readFile(file);
 return String(file).endsWith('/editor/index.html') ? Buffer.from(bytes.toString().replace('<div id="consistency-workspace"></div>','<consistency-editor></consistency-editor>')) : bytes;
}
