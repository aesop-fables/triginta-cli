import path from 'path';
import fs from 'fs';
import yaml from 'yaml';

export declare type TrigintaFunctionHttpManifest = {
  method: 'GET' | 'POST' | 'DELETE' | 'OPTIONS' | 'PUT';
  route: string;
};

export declare type TrigintaFunctionManifest = {
  name: string;
  handler: string;
  http: TrigintaFunctionHttpManifest;
};

export declare type TrigintaStrategyEnum = 'httpv2' | 'rest';

// TODO -- Maybe we should allow resources to be specified?
export declare type TrigintaManifest = {
  name: string;
  strategy: TrigintaStrategyEnum;
  functions: TrigintaFunctionManifest[];
};

const CWD = process.cwd();
const TRIGINTA_MANIFEST_FILE = `.triginta`;
export const TRIGINTA_MANIFEST_PATH = path.join(CWD, TRIGINTA_MANIFEST_FILE);

export function parseManifest() {
  return yaml.parse(fs.readFileSync(TRIGINTA_MANIFEST_PATH, 'utf-8')) as TrigintaManifest;
}

export function writeManifest(manifest: TrigintaManifest) {
  return fs.writeFileSync(TRIGINTA_MANIFEST_FILE, yaml.stringify(manifest), 'utf-8');
}
