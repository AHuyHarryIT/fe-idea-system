import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { UIEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { PageHeader } from '@/components/shared/PageHeader'
import { useIdeaCategories } from '@/hooks/useCategories'
import { useSubmitIdea } from '@/hooks/useIdeas'
import { useSubmissions } from '@/hooks/useSubmissions'
import { CATEGORY_SELECT_PAGE_SIZE } from '@/constants/category'
import { auth } from '@/utils/auth'
import { appNotification } from '@/utils/notifications'
import type { IdeaSubmitPayload } from '@/types/idea'
import {
  DEFAULT_SUBMISSION_PAGE_SIZE,
  isPdfFile,
  isSubmissionClosed,
} from '@/features/ideas/helpers/submit-idea'
import { IDEA_OPTION_SCROLL_THRESHOLD } from '@/features/ideas/helpers/idea-catalogue'
import { IdeaSubmissionFormSection } from '@/features/ideas/components/IdeaSubmissionFormSection'
import { SubmissionDetailsSection } from '@/features/submissions/components/SubmissionDetailsSection'
import { SubmissionListSection } from '@/features/submissions/components/SubmissionListSection'
import type { IdeaCategory } from '@/types'

const initialForm: IdeaSubmitPayload = {
  title: '',
  description: '',
  hasAcceptedTerms: false,
  categoryId: '',
  submissionId: '',
  isAnonymous: false,
  uploadFiles: [],
}

export default function SubmitIdeaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const categoryLoadLockRef = useRef(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_SUBMISSION_PAGE_SIZE)
  const [categoryOptionPage, setCategoryOptionPage] = useState(1)
  const [categoryOptions, setCategoryOptions] = useState<IdeaCategory[]>([])
  const [searchValue, setSearchValue] = useState('')
  const deferredSearch = useDeferredValue(searchValue.trim())
  const {
    data: categoryData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useIdeaCategories({
    pageNumber: categoryOptionPage,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
  })
  const {
    data: submissionData,
    isLoading: submissionsLoading,
    error,
  } = useSubmissions({
    pageNumber: currentPage,
    pageSize,
    searchTerm: deferredSearch || undefined,
  })
  const { mutateAsync: submitIdea, isPending } = useSubmitIdea()
  const [form, setForm] = useState<IdeaSubmitPayload>(initialForm)
  const [fileValidationMessage, setFileValidationMessage] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<
    string | null
  >(null)
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  const fileNames = useMemo(
    () => form.uploadFiles?.map((file) => file.name).join(', ') ?? '',
    [form.uploadFiles],
  )
  const categories = useMemo(() => categoryOptions, [categoryOptions])
  const submissions = useMemo(
    () => submissionData?.submissions ?? [],
    [submissionData],
  )
  const totalSubmissions =
    submissionData?.pagination?.totalCount ?? submissions.length
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize))
  const hasMoreCategories =
    (categoryData?.pagination?.totalPages ?? 1) > categoryOptionPage

  const selectedSubmission = useMemo(
    () =>
      submissions.find((submission) => submission.id === selectedSubmissionId),
    [selectedSubmissionId, submissions],
  )
  const currentStep = !selectedSubmission ? 1 : !showSubmitForm ? 2 : 3

  useEffect(() => {
    if (!submissionsLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, submissionsLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  useEffect(() => {
    if (!categoriesFetching) {
      categoryLoadLockRef.current = false
    }
  }, [categoriesFetching])

  useEffect(() => {
    const nextCategories = categoryData?.categories ?? []

    if (!nextCategories.length) {
      return
    }

    setCategoryOptions((currentCategories) => {
      const seenIds = new Set(currentCategories.map((category) => category.id))
      const appended = nextCategories.filter((category) => !seenIds.has(category.id))

      if (!appended.length) {
        return currentCategories
      }

      return [...currentCategories, ...appended]
    })
  }, [categoryData])

  const handleCategoryPopupScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const isNearBottom =
      target.scrollTop + target.clientHeight >=
      target.scrollHeight - IDEA_OPTION_SCROLL_THRESHOLD

    if (
      isNearBottom &&
      hasMoreCategories &&
      !categoriesFetching &&
      !categoryLoadLockRef.current
    ) {
      categoryLoadLockRef.current = true
      setCategoryOptionPage((currentValue) => currentValue + 1)
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setAgreedToTerms(false)
    setFileValidationMessage('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openSubmissionDetails = (submissionId: string) => {
    setSelectedSubmissionId(submissionId)
    setShowSubmitForm(false)
    setFileValidationMessage('')
    setForm((prev) => ({ ...prev, submissionId }))
  }

  const handleOpenSubmitForm = () => {
    if (!selectedSubmission) return
    setForm((prev) => ({ ...prev, submissionId: selectedSubmission.id }))
    setFileValidationMessage('')
    setShowSubmitForm(true)
  }

  const handleBackToList = () => {
    setSelectedSubmissionId(null)
    setShowSubmitForm(false)
    handleReset()
  }

  const handleBackToDetails = () => {
    setShowSubmitForm(false)
    setFileValidationMessage('')
  }

  const handleFileChange = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? [])

    if (!selectedFiles.length) {
      setForm((prev) => ({ ...prev, uploadFiles: [] }))
      setFileValidationMessage('')
      return
    }

    const invalidFile = selectedFiles.find((file) => !isPdfFile(file))

    if (invalidFile) {
      setForm((prev) => ({ ...prev, uploadFiles: [] }))
      setFileValidationMessage(
        `File '${invalidFile.name}' is invalid. Only PDF files are allowed.`,
      )

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      return
    }

    setForm((prev) => ({ ...prev, uploadFiles: selectedFiles }))
    setFileValidationMessage('')
  }

  const handleSubmit = async () => {
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.categoryId ||
      !selectedSubmission
    ) {
      appNotification.warning(
        'Please complete all required fields before submitting.',
      )
      return
    }

    if (isSubmissionClosed(selectedSubmission.closureDate)) {
      appNotification.warning(
        'This submission is already closed. Please choose another available submission.',
      )
      return
    }

    if (!agreedToTerms) {
      appNotification.warning('You must agree to the Terms and Conditions.')
      return
    }

    if (fileValidationMessage) {
      appNotification.warning(fileValidationMessage)
      return
    }

    const formData = new FormData()
    formData.append('Title', form.title.trim())
    formData.append('Description', form.description.trim())
    formData.append('HasAcceptedTerms', String(agreedToTerms))
    formData.append('CategoryId', form.categoryId)
    formData.append('SubmissionId', selectedSubmission.id)
    formData.append('IsAnonymous', String(form.isAnonymous))
    const departmentId = auth.getDepartmentId()

    if (departmentId) {
      formData.append('DepartmentId', departmentId)
    }

    form.uploadFiles?.forEach((file) => {
      formData.append('UploadedFiles', file)
    })

    const response = await submitIdea(formData)

    if (!response.success) {
      appNotification.error(response.error ?? 'Unable to submit your idea.')
      return
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['myIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['allIdeas'] }),
      queryClient.invalidateQueries({ queryKey: ['pagedIdeas'] }),
    ])

    handleReset()
    appNotification.success('Idea submitted successfully.')
    navigate({ to: '/my-ideas' })
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Idea Submission"
        description="Browse available submissions, review the details, then open the idea form when you are ready to submit."
      />

      <div className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Submission flow
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">
              Step {currentStep} of 3
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {currentStep === 1
                ? 'Choose an active submission campaign that fits your idea.'
                : currentStep === 2
                  ? 'Review the campaign timeline before starting the form.'
                  : 'Complete the form and confirm the submission terms.'}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-136">
            {[
              {
                step: 1,
                title: 'Choose submission',
                description: 'Select a campaign',
              },
              {
                step: 2,
                title: 'Review details',
                description: 'Check dates and scope',
              },
              {
                step: 3,
                title: 'Submit idea',
                description: 'Complete the form',
              },
            ].map((item) => {
              const isActive = currentStep === item.step
              const isCompleted = currentStep > item.step

              return (
                <div
                  key={item.step}
                  className={`rounded-[22px] border px-4 py-4 ${
                    isActive
                      ? 'border-blue-200 bg-blue-50'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold uppercase tracking-[0.16em] ${
                      isActive
                        ? 'text-blue-700'
                        : isCompleted
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                    }`}
                  >
                    Step {item.step}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {!selectedSubmission ? (
        <SubmissionListSection
          error={error}
          submissionsLoading={submissionsLoading}
          submissions={submissions}
          deferredSearch={deferredSearch}
          searchValue={searchValue}
          currentPage={currentPage}
          totalSubmissions={totalSubmissions}
          pageSize={pageSize}
          onSearchChange={setSearchValue}
          onResetSearch={() => setSearchValue('')}
          onOpenSubmissionDetails={openSubmissionDetails}
          onPageChange={(page, nextPageSize) => {
            if (nextPageSize !== pageSize) {
              setPageSize(nextPageSize)
              setCurrentPage(1)
              return
            }

            setCurrentPage(page)
          }}
        />
      ) : !showSubmitForm ? (
        <SubmissionDetailsSection
          selectedSubmission={selectedSubmission}
          onBackToList={handleBackToList}
          onOpenSubmitForm={handleOpenSubmitForm}
        />
      ) : (
        <IdeaSubmissionFormSection
          selectedSubmission={selectedSubmission}
          form={form}
          categories={categories}
          categoriesLoading={categoriesLoading || categoriesFetching}
          fileInputRef={fileInputRef}
          fileNames={fileNames}
          fileValidationMessage={fileValidationMessage}
          agreedToTerms={agreedToTerms}
          isPending={isPending}
          onBackToDetails={handleBackToDetails}
          onCategoryPopupScroll={handleCategoryPopupScroll}
          onFormChange={setForm}
          onAgreedToTermsChange={setAgreedToTerms}
          onFileChange={handleFileChange}
          onSubmit={() => void handleSubmit()}
        />
      )}
    </div>
  )
}
