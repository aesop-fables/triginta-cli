import fs from 'fs';
import {
  TerraformBlock,
  TerraformDataTypes,
  TerraformDocument,
  TerraformExpression,
  TerraformValue,
  TerraformVariable,
} from './TerraformTypes';

declare type TerraformFile = { path: string; document: TerraformDocument };

// ✅
function generateData(): TerraformFile {
  const document = new TerraformDocument()
    .appendStatement(new TerraformBlock('data').appendLabel('aws_caller_identity').appendLabel('current'))
    .appendStatement(new TerraformBlock('data').appendLabel('aws_region').appendLabel('current'));

  return { path: './data.tf', document };
}

// ✅
function generateVersions(): TerraformFile {
  const document = new TerraformDocument().appendStatement(
    new TerraformBlock('terraform')
      .addExpression('required_version', new TerraformValue('">= 0.14.0"'))
      .append(
        new TerraformBlock('required_providers').append(
          new TerraformExpression(
            'aws',
            new TerraformBlock()
              .addExpression('source', new TerraformValue('"hashicorp/aws"'))
              .addExpression('version', new TerraformValue('">= 2"')),
          ),
        ),
      ),
  );

  return { path: './versions.tf', document };
}

function generateVariables(): TerraformFile {
  const document = new TerraformDocument().appendStatement(
    new TerraformVariable('app_name', TerraformDataTypes.string),
  );

  return { path: './variables.tf', document };
}

function generateFiles(): TerraformFile[] {
  return [generateData(), generateVersions(), generateVariables()];
}

function writeFiles(files: TerraformFile[]) {
  for (let i = 0; i < files.length; i++) {
    const { path, document } = files[i];
    fs.writeFileSync(path, document.stringify(), 'utf-8');
  }
}

const sampleFiles = generateFiles();
writeFiles(sampleFiles);
