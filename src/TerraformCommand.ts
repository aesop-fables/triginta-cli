import { ICommand } from './ICommand';
import { parseManifest } from './TrigintaManifest';
import fs from 'fs';
import path from 'path';
import { getTerraformMiddleware } from './terraform';

const CWD = process.cwd();
const outDir = path.join(CWD, 'terraform');

export class TerraformCommand implements ICommand {
  async execute(): Promise<void> {
    const manifest = parseManifest();
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    const middleware = getTerraformMiddleware(manifest.middleware);
    await middleware.execute(manifest);
  }
}
