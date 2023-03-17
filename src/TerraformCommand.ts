import { ICommand } from './ICommand';
import { parseManifest, TrigintaStrategyEnum } from './TrigintaManifest';
import fs from 'fs';
import path from 'path';
import { ITerraformStrategy, TerraformContext, TerraformHttpV2Strategy } from './terraform';

const CWD = process.cwd();
const outDir = path.join(CWD, 'terraform');
const zModuleDir = path.join(outDir, 'z_module');
const lambdasPath = path.join(zModuleDir, 'lambdas.tf');

function getStrategy(strategy: TrigintaStrategyEnum): ITerraformStrategy {
  if (strategy === 'rest') {
    throw new Error('Not supported');
  }

  return new TerraformHttpV2Strategy();
}

export class TerraformCommand implements ICommand {
  async execute(): Promise<void> {
    const manifest = parseManifest();
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    if (!fs.existsSync(zModuleDir)) {
      fs.mkdirSync(zModuleDir);
    }

    const context: TerraformContext = {
      manifest,
      outDir,
      zModuleDir,
      lambdasPath,
    };

    const strategy = getStrategy(manifest.strategy);
    await strategy.execute(context);
  }
}
