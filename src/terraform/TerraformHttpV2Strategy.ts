import { ITerraformStrategy } from './ITerraformStrategy';
import { TerraformContext } from './TerraformTypes';
import fs from 'fs';
import StringBuilder from 'string-builder';

export class TerraformHttpV2Strategy implements ITerraformStrategy {
  async execute(context: TerraformContext): Promise<void> {
    const { manifest, lambdasPath } = context;
    const output = new StringBuilder();
    manifest.functions.forEach(({ name: rawName, handler }) => {
      const name = `${manifest.name}-${rawName}`;
      output.appendLine(`resource "aws_lambda_function" "${name}-lambda" {`);
      output.appendLine('  s3_bucket     = "jenkins-artifacts.${data.aws_region.current.name}.dovetailnow.com"');
      output.appendLine(`  s3_key        = "jobs/status-alerts/\${var.${manifest.name}_build}/${name}-lambda.zip"`);
      output.appendLine(`  function_name = "${name}-lambda-\${var.environment}-\${data.aws_region.current.name}"`);
      output.appendLine(`  role          = aws_iam_role.lambda_exec_role.arn`);
      output.appendLine(`  runtime       = "nodejs16.x"`);
      output.appendLine(`  handler       = "${handler}"`);
      output.appendLine(`  memory_size   = 2048`);
      output.appendLine(`  timeout       = 600`);
      output.appendLine(`}`);
      output.appendLine();
    });

    fs.writeFileSync(lambdasPath, output.toString(), 'utf-8');
  }
}
