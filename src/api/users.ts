import { createCrudService } from "./crud-service-factory"
import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserListQueryParams,
  UserListResponse,
} from "@/types"

const baseUserService = createCrudService<
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserListQueryParams
>("/users")

export const userService = {
  // Main API methods
  getAll: baseUserService.getAll,
  getById: baseUserService.getById,
  create: baseUserService.create,
  update: baseUserService.update,
  delete: baseUserService.delete,

  // Legacy aliases for backward compatibility
  getUsers: baseUserService.getAll,
  createUser: baseUserService.create,
  updateUser: baseUserService.update,
  updateUserRole: baseUserService.update,
  deleteUser: baseUserService.delete,
}
