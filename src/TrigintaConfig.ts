import path from 'path';

const CWD = process.cwd();
const TRIGINTA_CONFIG = 'triginta.config';
const TRIGINTA_CONFIG_FILE = `./src/${TRIGINTA_CONFIG}.ts`;
export const TRIGINTA_CONFIG_PATH = path.join(CWD, TRIGINTA_CONFIG_FILE);
