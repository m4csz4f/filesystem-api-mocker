import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = (request, response) => {
  const staticFileName = request.params.from_file;
  const targetFileName = `${staticFileName}.json`;
  const filePath = path.join(__dirname, targetFileName);

  if (fs.existsSync(filePath)) {
    return response.sendFile(filePath);
  } else {
    console.error(`File not found: ${filePath}`);
    return response.status(404).json({ error: 'File not found' });
  }
};
