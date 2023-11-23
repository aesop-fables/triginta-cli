/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
// Ok, so we need to create the in memory object model of terraform again.
function indent(level: number) {
  let value = '';
  for (let i = 0; i < level; i++) {
    value += ' ';
  }

  return value;
}

export class Terraform {
  static stringify(statement: ITerraformStatement, level = 0) {
    const base = indent(level);
    let output = statement.type ? `${base}${statement.type}` : '';
    if (statement.name) {
      output += ` ${statement.name}`;
    }

    if (statement.tags?.length !== 0) {
      output += ` ${statement.tags?.map((x) => `"${x}"`).join(' ')}`;
    }

    output += ` {\n`;

    if (statement.expressions?.length !== 0) {
      statement.expressions?.forEach((x) => {
        output += `${base}${x.stringify(level + 1)}\n`;
      });

      if (statement.children?.length !== 0) {
        output += '\n';
      }
    }

    if (statement.children?.length !== 0) {
      statement.children?.forEach((x) => {
        output += `${base}${x.stringify(level + 1)}`;
      });
    }

    output += `${base}}\n`;
    return output;
  }
}

export interface ITerraformStatement {
  readonly type?: string;
  readonly name?: string;
  readonly children?: ITerraformStatement[];
  readonly expressions?: TerraformExpression[]
  readonly tags?: string[];

  stringify(level: number): string;
}

export class TerraformBlock implements ITerraformStatement {
  readonly children: ITerraformStatement[] = [];
  readonly expressions: TerraformExpression[] = [];
  readonly tags: string[] = [];

  constructor(readonly type?: string, readonly name?: string) {}

  stringify(level: number): string {
    return Terraform.stringify(this, level);
  }
}

export class TerraformValue implements ITerraformStatement {
  constructor(private readonly value: any) {}
  get type(): string {
    return '';
  }

  stringify(): string {
    return this.value as string;
  }
}

export class TerraformExpression {
  constructor(readonly left: string, readonly right: ITerraformStatement) {}

  stringify(level: number): string {
    return `${indent(level)}${this.left} = ${this.right.stringify(level)}`;
  }
}
