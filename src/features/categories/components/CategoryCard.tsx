import { ActionButton } from "@/components/app/ActionButton"
import type { IdeaCategory } from "@/types"
import React from "react"

interface CategoryCardProps {
  category: IdeaCategory
  onEditCategory: (categoryId: string, categoryName: string) => void
  onDeleteRequest: (categoryId: string) => void
  isSaving: boolean
  isDeleting: boolean
}
export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEditCategory,
  onDeleteRequest,
  isSaving,
  isDeleting,
}) => {
  return (
    <div
      key={category.id}
      className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:flex-row md:items-start md:justify-between"
    >
      <div className="min-w-0">
        <p className="text-base font-medium text-slate-900">{category.name}</p>
        <p className="mt-2 text-xs text-slate-400">
          Category ID: {category.id}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton
          action="edit"
          onClick={() => onEditCategory(category.id, category.name)}
          disabled={isSaving}
        />
        <ActionButton
          action="delete"
          onClick={() => onDeleteRequest(category.id)}
          disabled={isDeleting}
        />
      </div>
    </div>
  )
}
