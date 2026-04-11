import { Edit2, Ghost, Plus, Trash2 } from "lucide-react"
import type { ButtonHTMLAttributes, ReactNode } from "react"
import { AppButton } from "@/components/app/AppButton"
import type { AppButtonVariant } from "@/types"

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  action?: "edit" | "delete" | "add" | "ghost"
  label?: string
  variant?: AppButtonVariant
  icon?: ReactNode
}

const variant: Record<
  NonNullable<ActionButtonProps["action"]>,
  AppButtonVariant
> = {
  edit: "ghost",
  ghost: "ghost",
  delete: "red",
  add: "primary",
}

const icon: Record<NonNullable<ActionButtonProps["action"]>, ReactNode> = {
  edit: <Edit2 className="h-4 w-4" />,
  ghost: <Ghost className="h-4 w-4" />,
  add: <Plus className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
}

const content: Record<NonNullable<ActionButtonProps["action"]>, string> = {
  edit: "Edit",
  ghost: "Reset",
  add: "Add",
  delete: "Delete",
}

export function ActionButton({
  action = "ghost",
  className,
  label,
  variant: customVariant,
  icon: customIcon,
  ...props
}: ActionButtonProps) {
  return (
    <AppButton
      {...props}
      variant={customVariant ?? variant[action]}
      className={`gap-2 ${className ?? ""}`.trim()}
    >
      {customIcon ?? icon[action]}
      {label ?? content[action]}
    </AppButton>
  )
}
