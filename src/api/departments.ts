import { createCrudService } from "./crud-service-factory"
import type {
  CreateDepartmentPayload,
  Department,
  DepartmentListQueryParams,
  DepartmentListResponse,
  UpdateDepartmentPayload,
} from "@/types"

const baseDepartmentService = createCrudService<
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  DepartmentListResponse,
  DepartmentListQueryParams
>("/departments")

export const departmentService = {
  // Main API methods
  getAll: baseDepartmentService.getAll,
  getById: baseDepartmentService.getById,
  create: baseDepartmentService.create,
  update: baseDepartmentService.update,
  delete: baseDepartmentService.delete,

  // Legacy aliases for backward compatibility
  getDepartments: baseDepartmentService.getAll,
  createDepartment: baseDepartmentService.create,
  updateDepartment: baseDepartmentService.update,
  deleteDepartment: baseDepartmentService.delete,
}
