import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SeedingModule } from '../src/seeding/seeding.module';
import { SeedingService } from '../src/seeding/seeding.service';

function readProfileArgument(): string | undefined {
  const profileWithEquals = process.argv.find((argument) =>
    argument.startsWith('--profile='),
  );

  if (profileWithEquals) {
    return profileWithEquals.split('=')[1];
  }

  const profileIndex = process.argv.findIndex((argument) => argument === '--profile');
  if (profileIndex >= 0) {
    return process.argv[profileIndex + 1];
  }

  return undefined;
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('SeedCLI');
  const profile = readProfileArgument() ?? 'demo';

  if (process.argv.includes('--allow-production')) {
    process.env.ALLOW_SEED_IN_PRODUCTION = 'true';
  }

  const app = await NestFactory.createApplicationContext(SeedingModule, {
    logger: ['log', 'warn', 'error'],
  });

  try {
    const summary = await app.get(SeedingService).seed(profile);
    logger.log(`Seeded profile \`${summary.profile}\` successfully.`);
    logger.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    logger.error(
      error instanceof Error ? error.message : 'Unknown seed failure.',
    );
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
