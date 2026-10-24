import bcrypt from 'bcryptjs';
import { UserModel } from '#modules/user/user.model.js';
import { logger } from '#config/logger.config.js';

export interface SeedReport {
  name: string;
  created: number;
  skipped: number;
}

export class UserSeeder {
  public static async seed(reset = false): Promise<SeedReport> {
    if (reset) {
      const deleteResult = await UserModel.deleteMany({});
      logger.info({ deletedCount: deleteResult.deletedCount }, 'Purged existing users for reset');
    }

    const defaultUsers = [
      {
        name: 'Super Administrator',
        email: 'admin@example.com',
        password: 'Admin@Password123',
        role: 'admin' as const,
        status: 'active' as const,
        profile: [{ type: 'avatar', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' }],
      },
      {
        name: 'Demo Merchant',
        email: 'merchant@example.com',
        password: 'User@Password123',
        role: 'user' as const,
        status: 'active' as const,
        profile: [{ type: 'avatar', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' }],
      },
      {
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'User@Password123',
        role: 'user' as const,
        status: 'active' as const,
        profile: [{ type: 'avatar', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' }],
      },
    ];

    let created = 0;
    let skipped = 0;

    for (const user of defaultUsers) {
      const existing = await UserModel.findOne({ email: user.email });
      if (existing) {
        skipped++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);
      await UserModel.create({
        ...user,
        password: hashedPassword,
      });
      created++;
    }

    return {
      name: 'UserSeeder',
      created,
      skipped,
    };
  }
}
