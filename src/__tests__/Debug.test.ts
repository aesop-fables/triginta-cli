import { TerraformBlock, TerraformExpression, TerraformValue, Terraform } from '../terraform';
import fs from 'fs';

describe('debug', () => {
  test('debug', () => {
    // need any example, let's look at ops code
    const lambda = new TerraformBlock('resource', 'aws_lambda_function');
    lambda.tags.push('settings_api_query_settings_lambda');
    lambda.expressions.push(
      new TerraformExpression(
        's3_bucket',
        new TerraformValue('"jenkins-artifacts.${module.env.region}.dovetailnow.com"'),
      ),
    );
    lambda.expressions.push(
      new TerraformExpression(
        's3_key',
        new TerraformValue('"jobs/settings-api/${local.resolved_build}/query-settings-lambda.zip"'),
      ),
    );
    lambda.expressions.push(new TerraformExpression('handler', new TerraformValue('"QuerySettingsEndpoint.handler"')));
    lambda.expressions.push(
      new TerraformExpression(
        'function_name',
        new TerraformValue('"settings-api-query-settings-lambda-${module.env.name}-${module.env.region}"'),
      ),
    );
    lambda.expressions.push(
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

    lambda.children.push(environment);

    const certificate = new TerraformBlock('resource', '"aws_acm_certificate"');
    certificate.tags.push('settings_api_cert');
    certificate.expressions.push(
      new TerraformExpression(
        'domain_name',
        new TerraformValue('"settings.${data.aws_route53_zone.ambient_base_domain.name}"'),
      ),
    );
    certificate.expressions.push(new TerraformExpression('validation_method', new TerraformValue('"DNS"')));

    const lifecycle = new TerraformBlock('lifecycle');
    lifecycle.expressions.push(new TerraformExpression('create_before_destroy', new TerraformValue('true')));
    certificate.children.push(lifecycle);

    const route53_record = new TerraformBlock('resource', '"aws_route53_record"');
    route53_record.tags.push('settings_api_validation');

    const for_each = new TerraformBlock();
    const for_loop = new TerraformBlock(
      'for dvo in aws_acm_certificate.settings_api_cert.domain_validation_options : dvo.domain_name =>',
    );
    for_loop.expressions.push(new TerraformExpression('name', new TerraformValue('dvo.resource_record_name')));
    for_loop.expressions.push(new TerraformExpression('record', new TerraformValue('dvo.resource_record_value')));
    for_loop.expressions.push(new TerraformExpression('type', new TerraformValue('dvo.resource_record_type')));
    for_each.children.push(for_loop);
    route53_record.expressions.push(new TerraformExpression('for_each', for_each));

    const blocks = [certificate, route53_record];
    const dump = blocks.map((x) => Terraform.stringify(x)).join('\n');
    fs.writeFileSync('dump.tf', dump, 'utf-8');
  });
});
