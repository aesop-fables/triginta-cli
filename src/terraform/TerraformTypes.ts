/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';

function indent(level: number) {
  let value = '';
  for (let i = 0; i < level; i++) {
    value += ' ';
  }

  return value;
}

export declare type TerraformFile = { path: string; document: TerraformDocument };

export enum TerraformDataTypes {
  string = 'string',
}

export class Terraform {
  static stringify(statement: ITerraformStatement, prefixScope: boolean, level = 0) {
    const base = indent(level);
    let output = statement.type ? `${base}${statement.type}` : '';

    if (statement.labels?.length !== 0) {
      output += ` ${statement.labels?.map((x) => `"${x}"`).join(' ')}`;
    }

    output += `${prefixScope ? ' ' : ''}{\n`;

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

    output += `${base}}${prefixScope ? '\n' : ''}`;
    return output;
  }

  static writeFiles(files: TerraformFile[]) {
    for (let i = 0; i < files.length; i++) {
      const { path, document } = files[i];
      fs.writeFileSync(path, document.stringify(), 'utf-8');
    }
  }
}

export interface ITerraformStatement {
  readonly type?: string;
  readonly children?: ITerraformStatement[];
  readonly expressions?: TerraformExpression[];
  readonly labels?: string[];

  stringify(level: number): string;
}

export class TerraformBlock implements ITerraformStatement {
  readonly children: ITerraformStatement[] = [];
  readonly expressions: TerraformExpression[] = [];
  readonly labels: string[] = [];

  constructor(readonly type?: string, readonly prefix = true) {}

  addExpression(left: string, right: ITerraformStatement) {
    this.expressions.push(new TerraformExpression(left, right));
    return this;
  }

  append(statement: ITerraformStatement) {
    this.children.push(statement);
    return this;
  }

  appendLabel(label: string) {
    this.labels.push(label);
    return this;
  }

  stringify(level: number): string {
    return Terraform.stringify(this, this.prefix, level);
  }
}

export class TerraformObject extends TerraformBlock {
  constructor() {
    super(undefined, false);
  }
}

export class TerraformVariable extends TerraformBlock {
  constructor(name: string, type?: TerraformDataTypes, description?: string) {
    super('variable');
    this.labels.push(name);

    if (type) {
      this.addExpression('type', new TerraformValue(type));
    }

    if (description) {
      this.addExpression('description', new TerraformValue(JSON.stringify(description)));
    }
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

export class TerraformStringValue implements ITerraformStatement {
  constructor(private readonly value: string) {}
  get type(): string {
    return '';
  }

  stringify(): string {
    return JSON.stringify(this.value);
  }
}

export class TerraformFunction implements ITerraformStatement {
  constructor(private readonly name: any, private readonly args?: ITerraformStatement[]) {}

  get type(): string {
    return '';
  }

  stringify(level: number): string {
    const args = !this.args ? '' : this.args.map((x) => x.stringify(level)).join(', ');
    return `${this.name}(${args})`;
  }
}

export class TerraformArray implements ITerraformStatement {
  constructor(private readonly items: ITerraformStatement[]) {}

  get type(): string {
    return '';
  }

  stringify(level: number): string {
    const items = this.items.length === 0 ? '' : this.items.map((x) => x.stringify(level)).join(', ');
    return `[${items}]`;
  }
}

export class TerraformExpression {
  constructor(readonly left: string, readonly right: ITerraformStatement) {}

  stringify(level: number): string {
    return `${indent(level)}${this.left} = ${this.right.stringify(level)}`;
  }
}

export class TerraformDocument {
  private readonly statements: ITerraformStatement[] = [];

  appendStatement(statement: ITerraformStatement) {
    this.statements.push(statement);
    return this;
  }

  stringify(): string {
    return this.statements.map((x) => Terraform.stringify(x, true)).join('\n\n');
  }
}
