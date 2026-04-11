import { createCrudService } from "./crud-service-factory"
import type {
  CreateIdeaCategoryRequest,
  IdeaCategory,
  IdeaCategoryListQueryParams,
  IdeaCategoryListResponse,
} from "@/types"

const baseCategoryService = createCrudService<
  IdeaCategory,
  CreateIdeaCategoryRequest,
  CreateIdeaCategoryRequest,
  IdeaCategoryListResponse,
  IdeaCategoryListQueryParams
>("/categories")

export const categoryService = {
  // Main API methods
  getAll: baseCategoryService.getAll,
  getById: baseCategoryService.getById,
  create: baseCategoryService.create,
  update: baseCategoryService.update,
  delete: baseCategoryService.delete,

  // Legacy aliases for backward compatibility
  getIdeaCategories: baseCategoryService.getAll,
  createIdeaCategory: baseCategoryService.create,
  updateIdeaCategory: baseCategoryService.update,
  deleteIdeaCategory: baseCategoryService.delete,
}
