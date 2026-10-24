import { Request, Response } from 'express';
import { userService, UserService } from './user.service.js';
import { ApiResponse } from '#shared/utils/api-response.js';
import { ListUsersQuery, UpdateUserDto } from './user.schema.js';
import { AuthenticatedUserPayload } from '#types/express.js';


export class UserController {
  private userService: UserService;

  constructor(service = userService) {
    this.userService = service;
  }

  public listAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListUsersQuery;
    const result = await this.userService.listUsers(query);
    ApiResponse.success(res, 'Users retrieved successfully', result.data, 200, result.meta);
  };

  public getById = async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.getUserById(req.params.id);
    ApiResponse.success(res, 'User fetched successfully', user);
  };

  public update = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.userService.updateUser(
      req.params.id,
      req.body as UpdateUserDto,
      req.user as AuthenticatedUserPayload
    );
    ApiResponse.success(res, 'User profile updated successfully', updated);
  };

  public delete = async (req: Request, res: Response): Promise<void> => {
    await this.userService.deleteUser(req.params.id, req.user as AuthenticatedUserPayload);
    ApiResponse.success(res, 'User deleted successfully');
  };
}

export const userController = new UserController();
