import React from "react"
import { getReviewStatusLabel } from "../helpers/review-queue"
import type { Idea } from "@/types"
import { formatAppDateTime } from "@/utils/date"
import { AppButton } from "@/components/app/AppButton"
import { Link } from "@tanstack/react-router"

interface ReviewCardProps {
  idea: Idea
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ idea }) => {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.96)_0%,rgba(255,255,255,1)_100%)] p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              {getReviewStatusLabel(idea.status)}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {idea.categoryName || "Uncategorized"}
            </span>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {idea.text || idea.title || "Untitled idea"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {idea.description || "No description available."}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>Author: {idea.authorName || "Anonymous"}</span>
            <span>Department: {idea.departmentName || "Unknown"}</span>
            <span>
              Created: {formatAppDateTime(idea.createdAt || idea.createdDate)}
            </span>
            <span>Comments: {idea.commentCount ?? 0}</span>
          </div>
        </div>

        <Link to="/ideas/$ideaId" params={{ ideaId: idea.id }}>
          <AppButton type="button" variant="secondary">
            Open detail
          </AppButton>
        </Link>
      </div>
    </article>
  )
}
