import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarRange, ListChecks, Tags, Users } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  categoryService,
  ideaService,
  submissionService,
  userService,
} from '@/api'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatCard } from '@/components/shared/StatCard'
import { ManageButton } from '@/components/app/ManageButton'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useQuery({
    queryKey: ['adminOverview'],
    queryFn: async () => {
      const [
        usersResponse,
        categoriesResponse,
        submissionsResponse,
        ideasResponse,
      ] = await Promise.all([
        userService.getUsers(),
        categoryService.getIdeaCategories(),
        submissionService.getAdminSubmissions(),
        ideaService.getAllIdeas(),
      ])

      if (
        !usersResponse.success ||
        !categoriesResponse.success ||
        !submissionsResponse.success ||
        !ideasResponse.success
      ) {
        throw new Error(
          usersResponse.error ??
            categoriesResponse.error ??
            submissionsResponse.error ??
            ideasResponse.error ??
            'Unable to load admin overview.',
        )
      }

      // Handle API response formats
      // API returns direct array: [{id, title, ...}]
      // But code expects: {ideas: [...]} or {items: [...]}
      const ideaData = ideasResponse.data
      let ideas: Array<any> = []
      if (Array.isArray(ideaData)) {
        ideas = ideaData
      } else if (ideaData?.ideas) {
        ideas = ideaData.ideas
      } else if (ideaData?.items) {
        ideas = ideaData.items
      }

      // Map title to text for compatibility with frontend
      const mappedIdeas = ideas.map((idea: any) => ({
        ...idea,
        text: idea.text || idea.title,
      }))

      return {
        users: usersResponse.data?.users ?? [],
        categories: categoriesResponse.data ?? [],
        submissions: submissionsResponse.data ?? [],
        ideas: mappedIdeas,
      }
    },
  })

  const recentSubmissions = useMemo(
    () => data?.submissions.slice(0, 4) ?? [],
    [data],
  )

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Administration"
        description="Live admin control center for users, categories, submissions, and university ideas."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          title="Users"
          value={isLoading ? '...' : `${data?.users.length ?? 0}`}
          description="Total users returned by the admin user directory."
        />
        <StatCard
          icon={Tags}
          title="Categories"
          value={isLoading ? '...' : `${data?.categories.length ?? 0}`}
          description="Currently configured idea categories."
        />
        <StatCard
          icon={CalendarRange}
          title="Submission windows"
          value={isLoading ? '...' : `${data?.submissions.length ?? 0}`}
          description="Open and historical submission periods."
        />
        <StatCard
          icon={ListChecks}
          title="Ideas"
          value={isLoading ? '...' : `${data?.ideas.length ?? 0}`}
          description="University-wide idea count from the admin API."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Management modules"
          description="Live summaries you can use as entry points for dedicated CRUD screens."
        >
          {error ? (
            <EmptyState
              icon={Users}
              title="Unable to load admin data"
              description={error.message}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <ManageButton
                variant="blue"
                onClick={() => navigate({ to: '/manage/users' })}
              >
                Manage users · {data?.users.length ?? 0}
              </ManageButton>

              <ManageButton
                variant="blue"
                onClick={() => navigate({ to: '/manage/categories' })}
              >
                Manage categories · {data?.categories.length ?? 0}
              </ManageButton>

              <ManageButton
                variant="blue"
                onClick={() => navigate({ to: '/manage/submissions' })}
              >
                Manage submissions · {data?.submissions.length ?? 0}
              </ManageButton>
              <ManageButton
                variant="blue"
                onClick={() => navigate({ to: '/ideas' })}
              >
                Review ideas · {data?.ideas.length ?? 0}
              </ManageButton>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Recent submissions"
          description="Most recent campaign windows loaded from the admin submission API."
        >
          {error ? (
            <EmptyState
              icon={CalendarRange}
              title="Submission data unavailable"
              description={error.message}
            />
          ) : recentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600"
                >
                  <p className="font-medium text-slate-900">
                    {submission.name}
                  </p>
                  <p className="mt-2">
                    Closure:{' '}
                    {new Date(submission.closureDate).toLocaleDateString()}
                  </p>
                  <p>
                    Final closure:{' '}
                    {new Date(submission.finalClosureDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarRange}
              title="No submissions configured"
              description="Create a submission window to start accepting ideas."
            />
          )}
        </SectionCard>
      </div>
    </div>
  )
}
