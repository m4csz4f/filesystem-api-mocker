import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to permanent test mocks directory
export const TEST_MOCKS_PATH = path.join(__dirname, 'test-mocks');
