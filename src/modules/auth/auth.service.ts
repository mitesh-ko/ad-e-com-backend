import bcrypt from 'bcryptjs';
import { userRepository, UserRepository } from '#modules/user/user.repository.js';
import { RegisterDto, LoginDto } from './auth.schema.js';
import { ConflictError, UnauthorizedError } from '#errors/index.js';
import { TokenService, TokenPair } from '#shared/services/token.service.js';
import { env } from '#config/env.config.js';
import { IUserDocument } from '#modules/user/user.model.js';
import { JobDispatcher } from '#shared/jobs/index.js';



export interface AuthResponse {
  user: Omit<IUserDocument, 'password'>;
  tokens: TokenPair;
}

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo = userRepository) {
    this.userRepo = userRepo;
  }

  public async register(dto: RegisterDto): Promise<AuthResponse> {
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictError('An account with this email address already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, env.BCRYPT_SALT_ROUNDS);

    const user = await this.userRepo.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role,
      status: 'active',
      profile: [],
    });

    const tokens = TokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Dispatch background welcome email (non-blocking)
    void JobDispatcher.dispatch('email:send-welcome', {
      to: user.email,
      name: user.name || 'Valued Customer',
      userId: user._id.toString(),
    });

    return {
      user: user.toSafeObject(),
      tokens,
    };

  }

  public async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findByEmailWithPassword(dto.email);

    if (!user || !user.password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('This account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = TokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: user.toSafeObject(),
      tokens,
    };
  }

  public async refreshTokens(refreshTokenString: string): Promise<TokenPair> {
    const payload = TokenService.verifyRefreshToken(refreshTokenString);
    const user = await this.userRepo.findById(payload.userId);

    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    // Token rotation
    return TokenService.generateTokens({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
  }
}

export const authService = new AuthService();
