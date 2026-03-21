import { Link } from '@tanstack/react-router'
import {
  CalendarDays,
  Eye,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { Idea } from '@/api'

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link
      to="/ideas/$ideaId"
      params={{ ideaId: idea.id }}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {idea.categoryName}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {idea.text || 'Untitled idea'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {idea.departmentName ??
                'Department information will come from API.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span>
              Author:{' '}
              {idea.isAnonymous ? 'Anonymous' : (idea.authorName ?? 'Pending')}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {idea.createdAt ?? 'Waiting for API date'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {idea.viewCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            {idea.thumbsUpCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="h-4 w-4" />
            {idea.thumbsDownCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            {idea.commentCount ?? 0}
          </span>
        </div>
      </div>
    </Link>
  )
}
