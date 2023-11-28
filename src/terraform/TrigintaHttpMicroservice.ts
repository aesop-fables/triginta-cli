import { TrigintaManifest } from '../TrigintaManifest';
import { ITerraformMiddleware } from './ITerraformMiddleware';
import path from 'path';
import fs from 'fs';
import {
  Terraform,
  TerraformArray,
  TerraformBlock,
  TerraformDocument,
  TerraformObject,
  TerraformStringValue,
  TerraformValue,
} from './TerraformTypes';

const CWD = process.cwd();
const outDir = path.join(CWD, 'terraform');

export class TrigintaHttpMicroservice implements ITerraformMiddleware {
  async execute(manifest: TrigintaManifest): Promise<void> {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    const routes = manifest.functions.map((lambda) => {
      return new TerraformObject()
        .addExpression('method', new TerraformStringValue(lambda.http.method))
        .addExpression('path', new TerraformStringValue(lambda.http.route))
        .addExpression(
          'function',
          new TerraformObject()
            .addExpression('name', new TerraformStringValue(lambda.name))
            .addExpression('filename', new TerraformStringValue(`${lambda.name}.zip`))
            .addExpression('handler', new TerraformStringValue(lambda.handler)),
        );
    });

    const routesBlock = new TerraformArray(routes);
    const trigintaModule = new TerraformBlock('module')
      .appendLabel('triginta-api')
      .addExpression('source', new TerraformStringValue('aesop-fables/triginta-api/aws'))
      .addExpression('version', new TerraformStringValue('0.1.0'))
      .addExpression('app_name', new TerraformStringValue(manifest.name))
      .addExpression('runtime', new TerraformStringValue('nodejs18.x'))
      .addExpression('local', new TerraformValue('true'))
      .addExpression('routes', routesBlock);

    const document = new TerraformDocument().appendStatement(trigintaModule);
    Terraform.writeFiles([{ document, path: path.join(outDir, './main.tf') }]);
  }
}
