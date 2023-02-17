import chalk from 'chalk';
import fs from 'fs';
import { log } from '.';
import { ICommand } from './ICommand';
import { TRIGINTA_CONFIG_PATH } from './TrigintaConfig';

export const TRIGINTA_CONFIG_TEMPLATE = `export { RouteRegistry as routes } from '@aesop-fables/triginta';\nexport { container } from './Bootstrap';\n\n// Add all of your endpoints here for local development\nexport { MyEndpoint } from './MyEndpoint';\n`;
export const BOOTSTRAP_TEMPLATE = `import { HttpLambda } from '@aesop-fables/triginta';\n\nconst { createHttpLambda } = HttpLambda.initialize([]);\nconst container = HttpLambda.getContainer();\n\nexport { container, createHttpLambda };\n`;

export class InitCommand implements ICommand {
  async execute(): Promise<void> {
    const BOOTSTRAP_PATH = `./src/Bootstrap.ts`;

    if (!fs.existsSync(TRIGINTA_CONFIG_PATH)) {
      log(chalk.cyan(`info `, chalk.grey(`Generating triginta config file at ${TRIGINTA_CONFIG_PATH}.`)));
      fs.writeFileSync(TRIGINTA_CONFIG_PATH, TRIGINTA_CONFIG_TEMPLATE, 'utf-8');
    }

    if (!fs.existsSync(BOOTSTRAP_PATH)) {
      log(chalk.cyan(`info `, chalk.grey(`Generating bootstrap file at ${BOOTSTRAP_PATH}.`)));
      fs.writeFileSync(BOOTSTRAP_PATH, BOOTSTRAP_TEMPLATE, 'utf-8');
    }
  }
}
