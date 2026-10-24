import { Database } from '#config/database.config.js';
import { logger } from '#config/logger.config.js';
import { UserSeeder } from './user.seeder.js';

async function runSeeders(): Promise<void> {
  const isReset = process.argv.includes('--reset');

  logger.info({ reset: isReset }, '🌱 Starting database seeding process...');

  try {
    // 1. Connect to MongoDB
    await Database.connect();

    // 2. Execute Seeders
    const reports = [];
    const userReport = await UserSeeder.seed(isReset);
    reports.push(userReport);

    // 3. Print Summary
    logger.info('=============================================');
    logger.info('🎉 Database Seeding Completed Successfully');
    for (const report of reports) {
      logger.info(
        { seeder: report.name, created: report.created, skipped: report.skipped },
        `Seeder: ${report.name} => ${report.created} created, ${report.skipped} skipped`
      );
    }
    logger.info('=============================================');

    // 4. Clean exit
    await Database.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error({ error }, '❌ Database seeding failed with error');
    await Database.disconnect();
    process.exit(1);
  }
}

void runSeeders();
