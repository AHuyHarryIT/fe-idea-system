import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
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
import { IdeaSubmissionFormSection } from '@/features/ideas/components/IdeaSubmissionFormSection'
import { SubmissionDetailsSection } from '@/features/submissions/components/SubmissionDetailsSection'
import { SubmissionListSection } from '@/features/submissions/components/SubmissionListSection'

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
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_SUBMISSION_PAGE_SIZE)
  const [searchValue, setSearchValue] = useState('')
  const deferredSearch = useDeferredValue(searchValue.trim())
  const { data: categoryData, isLoading: categoriesLoading } =
    useIdeaCategories({ pageNumber: 1, pageSize: CATEGORY_SELECT_PAGE_SIZE })
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
  const categories = useMemo(
    () => categoryData?.categories ?? [],
    [categoryData],
  )
  const submissions = useMemo(
    () => submissionData?.submissions ?? [],
    [submissionData],
  )
  const totalSubmissions =
    submissionData?.pagination?.totalCount ?? submissions.length
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize))

  const selectedSubmission = useMemo(
    () =>
      submissions.find((submission) => submission.id === selectedSubmissionId),
    [selectedSubmissionId, submissions],
  )

  useEffect(() => {
    if (!submissionsLoading && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, submissionsLoading, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

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
    navigate({ to: '/ideas' })
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Submit Idea"
        description="Browse available submissions, review the details, then open the idea form when you are ready to submit."
      />

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
          categoriesLoading={categoriesLoading}
          fileInputRef={fileInputRef}
          fileNames={fileNames}
          fileValidationMessage={fileValidationMessage}
          agreedToTerms={agreedToTerms}
          isPending={isPending}
          onBackToDetails={handleBackToDetails}
          onFormChange={setForm}
          onAgreedToTermsChange={setAgreedToTerms}
          onFileChange={handleFileChange}
          onSubmit={() => void handleSubmit()}
        />
      )}
    </div>
  )
}
