import chalk from 'chalk';
import { IConfiguredRoute } from '@aesop-fables/triginta/lib/IConfiguredRoute';
import { Request, Response } from 'express';
import { TestUtils } from '@aesop-fables/triginta';
import { IServiceContainer } from '@aesop-fables/containr';
import { log } from './index';

export async function invokeAndAdaptHandler(
  req: Request,
  res: Response,
  configuredRoute: IConfiguredRoute,
  container: IServiceContainer,
): Promise<void> {
  try {
    const response = await TestUtils.invokeHttpHandler({
      configuredRoute,
      container,
      rawPath: req.originalUrl,
      body: req.body,
    });

    if (!response.body) {
      res.sendStatus(response.statusCode);
      return;
    }

    res.status(response.statusCode);
    res.send(response.body);
  } catch (e) {
    log(chalk.red(`Error`, e));
    res.status(500);
    res.send(JSON.stringify(e));
  }
}
