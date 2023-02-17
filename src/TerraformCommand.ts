import { ICommand } from './ICommand';
import { parseManifest } from './TrigintaManifest';
import fs from 'fs';
import path from 'path';
import StringBuilder from 'string-builder';

const CWD = process.cwd();
const outDir = path.join(CWD, 'terraform');
const zModuleDir = path.join(outDir, 'z_module');
const lambdasPath = path.join(zModuleDir, 'lambdas.tf');

export class TerraformCommand implements ICommand {
  async execute(): Promise<void> {
    const manifest = parseManifest();
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir);
    }

    if (!fs.existsSync(zModuleDir)) {
      fs.mkdirSync(zModuleDir);
    }

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
