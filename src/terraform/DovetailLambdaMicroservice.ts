import { TrigintaManifest } from '../TrigintaManifest';
import { ITerraformMiddleware } from './ITerraformMiddleware';
import path from 'path';
import fs from 'fs';
import { Terraform, TerraformBlock, TerraformExpression, TerraformValue } from './TerraformTypes';

const CWD = process.cwd();
const outDir = path.join(CWD, 'terraform');
const moduleDir = path.join(outDir, 'z_module');

export class DovetailLambdaMicroservice implements ITerraformMiddleware {
  async execute(manifest: TrigintaManifest): Promise<void> {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    if (!fs.existsSync(moduleDir)) {
      fs.mkdirSync(moduleDir);
    }

    const httpLambdas = this.generateHttpLambdas(manifest);
    this.writeBlocks(httpLambdas, path.join(moduleDir, 'lambdas-http.tf'));

    console.log(JSON.stringify(manifest, null, 2));
    // Now, watch this ;)
  }

  generateHttpLambdas(manifest: TrigintaManifest): TerraformBlock[] {
    return manifest.functions.map((func) => {
      const httpLambda = new TerraformBlock('resource', 'aws_lambda_function');
      httpLambda.tags.push(`${manifest.name}_${func.name}_lambda`);
      httpLambda.expressions.push(
        new TerraformExpression(
          's3_bucket',
          new TerraformValue('"jenkins-artifacts.${module.env.region}.dovetailnow.com"'),
        ),
      );
      httpLambda.expressions.push(
        new TerraformExpression(
          's3_key',
          new TerraformValue('"jobs/settings-api/${local.resolved_build}/query-settings-lambda.zip"'),
        ),
      );
      httpLambda.expressions.push(
        new TerraformExpression('handler', new TerraformValue('"QuerySettingsEndpoint.handler"')),
      );
      httpLambda.expressions.push(
        new TerraformExpression(
          'function_name',
          new TerraformValue('"settings-api-query-settings-lambda-${module.env.name}-${module.env.region}"'),
        ),
      );
      httpLambda.expressions.push(
        new TerraformExpression('role', new TerraformValue('data.aws_iam_role.settings_api_lambda_exec_role.arn')),
      );

      const environment = new TerraformBlock('environment');
      const variables = new TerraformBlock();
      variables.expressions.push(
        new TerraformExpression('AWS_NODEJS_CONNECTION_REUSE_ENABLED', new TerraformValue('1')),
      );
      variables.expressions.push(
        new TerraformExpression(
          'SETTINGS_TABLE',
          new TerraformValue('data.aws_dynamodb_table.dovetail_settings_api_table.name'),
        ),
      );
      variables.expressions.push(
        new TerraformExpression(
          'LOG_QUEUE_URL',
          new TerraformValue(
            '"https://sqs.${module.env.region}.amazonaws.com/${module.env.account_id}/dovetail-app-logs"',
          ),
        ),
      );
      environment.expressions.push(new TerraformExpression('variables', variables));

      httpLambda.children.push(environment);

      return httpLambda;
    });
  }

  writeBlocks(blocks: TerraformBlock[], file: string): void {
    fs.writeFileSync(file, blocks.map((x) => Terraform.stringify(x)).join('\n'), 'utf-8');
  }
}
