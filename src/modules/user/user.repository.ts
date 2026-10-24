import { BaseRepository } from '#shared/repositories/base.repository.js';
import { IUserDocument, UserModel } from './user.model.js';


export class UserRepository extends BaseRepository<IUserDocument> {
  constructor() {
    super(UserModel);
  }

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    return this.findOne({ email: email.toLowerCase().trim() });
  }

  public async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase().trim() }).select('+password').exec();
  }

  public async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase().trim() });
  }
}

export const userRepository = new UserRepository();
