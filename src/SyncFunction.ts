import { IConfiguredRoute } from '@aesop-fables/triginta';
import { compileTrigintaConfig } from './compileTrigintaConfig';
import { TrigintaFunctionManifest, TrigintaManifest } from './TrigintaManifest';
import chalk from 'chalk';
import fs from 'fs';
import glob from 'glob';
import path from 'path';

const CWD = process.cwd();
const log = console.log;

async function findFile(classDeclaration: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    glob(path.join(CWD, '**/*point.ts'), (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      for (let i = 0; i < files.length; i++) {
        const content = fs.readFileSync(files[i], 'utf-8');
        if (content && content.indexOf(classDeclaration) !== -1) {
          resolve(files[i]);
          return;
        }
      }

      resolve(undefined);
    });
  });
}

function hashFunctionName(endpointName: string) {
  let name = '';
  for (let i = 0; i < endpointName.length; i++) {
    const current = endpointName[i];
    if (i !== 0 && current === current.toUpperCase()) {
      name += '-';
    }

    name += current.toLowerCase();
  }

  return name;
}

export class SyncFunction {
  public static async execute(): Promise<TrigintaManifest> {
    // Retrieve config from triginta config
    const { routes: routeRegistry } = await compileTrigintaConfig();
    const routes = routeRegistry.allRoutes();
    return await this.generateModel(routes);
  }

  static async generateModel(routes: IConfiguredRoute[]): Promise<TrigintaManifest> {
    const functions: TrigintaFunctionManifest[] = [];
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const match = /class\s*([a-zA-Z0-9_\-]*)([E|e]ndpoint)\s*\{/gm.exec(route.constructor.toString());
      if (!match) {
        log(chalk.red(`Error `, chalk.white(`${route.constructor} did not contain the string 'endpoint'.`)));
        continue;
      }
      const endpointLiteral = match[2];
      if (!endpointLiteral || endpointLiteral.toLowerCase() !== 'endpoint') {
        log(chalk.red(`Error `, chalk.white(`${endpointLiteral} did not contain the string 'endpoint'.`)));
        continue;
      }

      const file = await findFile(`class ${match[1]}`);
      if (!file) {
        log(chalk.red(`Error `, chalk.white(`Could not resolve handler path for ${match[1]}.`)));
        continue;
      }

      const ext = path.extname(file);
      const handler = `${path.basename(file).replace(ext, '')}.handler`;
      functions.push({
        handler,
        name: hashFunctionName(match[1]),
        http: {
          method: route.method.toUpperCase(),
          route: route.route,
        },
      } as TrigintaFunctionManifest);
    }

    const name = 'placeholder';

    const config: TrigintaManifest = {
      name,
      middleware: 'httpv2',
      functions,
    };

    return config;
  }
}
