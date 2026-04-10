"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const seeding_module_1 = require("../src/seeding/seeding.module");
const seeding_service_1 = require("../src/seeding/seeding.service");
function readProfileArgument() {
    const profileWithEquals = process.argv.find((argument) => argument.startsWith('--profile='));
    if (profileWithEquals) {
        return profileWithEquals.split('=')[1];
    }
    const profileIndex = process.argv.findIndex((argument) => argument === '--profile');
    if (profileIndex >= 0) {
        return process.argv[profileIndex + 1];
    }
    return undefined;
}
async function bootstrap() {
    const logger = new common_1.Logger('SeedCLI');
    const profile = readProfileArgument() ?? 'demo';
    if (process.argv.includes('--allow-production')) {
        process.env.ALLOW_SEED_IN_PRODUCTION = 'true';
    }
    const app = await core_1.NestFactory.createApplicationContext(seeding_module_1.SeedingModule, {
        logger: ['log', 'warn', 'error'],
    });
    try {
        const summary = await app.get(seeding_service_1.SeedingService).seed(profile);
        logger.log(`Seeded profile \`${summary.profile}\` successfully.`);
        logger.log(JSON.stringify(summary, null, 2));
    }
    catch (error) {
        logger.error(error instanceof Error ? error.message : 'Unknown seed failure.');
        process.exitCode = 1;
    }
    finally {
        await app.close();
    }
}
void bootstrap();
//# sourceMappingURL=seed.js.map