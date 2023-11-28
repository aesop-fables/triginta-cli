import {
  TerraformBlock,
  TerraformExpression,
  TerraformValue,
  TerraformDocument,
  TerraformVariable,
  TerraformDataTypes,
  TerraformFunction,
  TerraformObject,
  TerraformFile,
} from '../terraform';
import fs from 'fs';

// ✅
function generateData(): TerraformFile {
  const document = new TerraformDocument()
    .appendStatement(new TerraformBlock('data').appendLabel('aws_caller_identity').appendLabel('current'))
    .appendStatement(new TerraformBlock('data').appendLabel('aws_region').appendLabel('current'));

  return { path: './output/data.tf', document };
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

  return { path: './output/versions.tf', document };
}

function generateVariables(): TerraformFile {
  const document = new TerraformDocument().appendStatement(
    new TerraformVariable('app_name', TerraformDataTypes.string),
  );

  const objectSchema = new TerraformObject().addExpression('method', new TerraformValue(TerraformDataTypes.string));

  const routes = new TerraformVariable('routes');
  const list = new TerraformFunction('list', [new TerraformFunction('map', [objectSchema])]);

  routes.addExpression('type', list);

  document.appendStatement(routes);

  return { path: './output/variables.tf', document };
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

describe('debug', () => {
  test('debug', () => {
    if (fs.existsSync('./output')) {
      fs.rmSync('./output', { force: true, recursive: true });
    }

    fs.mkdirSync('./output');

    const sampleFiles = generateFiles();
    writeFiles(sampleFiles);
  });
});
