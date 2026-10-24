import { Request, Response } from 'express';
import { authService, AuthService } from './auth.service.js';
import { ApiResponse } from '#shared/utils/api-response.js';
import { RegisterDto, LoginDto, RefreshTokenDto } from './auth.schema.js';
import { HttpStatus } from '#constants/http-status.js';


export class AuthController {
  private authService: AuthService;

  constructor(service = authService) {
    this.authService = service;
  }

  public register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body as RegisterDto);
    ApiResponse.success(res, 'User registered successfully', result, HttpStatus.CREATED);
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body as LoginDto);
    ApiResponse.success(res, 'Logged in successfully', result, HttpStatus.OK);
  };

  public refreshToken = async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body as RefreshTokenDto;
    const tokens = await this.authService.refreshTokens(refreshToken);
    ApiResponse.success(res, 'Tokens refreshed successfully', tokens, HttpStatus.OK);
  };

  public getMe = async (req: Request, res: Response): Promise<void> => {
    ApiResponse.success(res, 'Current user retrieved', req.user);
  };
}

export const authController = new AuthController();
