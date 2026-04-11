import { useEffect, useMemo, useRef, useState } from "react"
import type { UIEvent } from "react"
import { Form } from "antd"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { PageHeader } from "@/components/shared/PageHeader"
import { useIdeaCategories } from "@/hooks/useCategories"
import { useIdeaById, useUpdateIdea } from "@/hooks/useIdeas"
import { CATEGORY_SELECT_PAGE_SIZE } from "@/constants/category"
import { appNotification } from "@/utils/notifications"
import type { IdeaCategory } from "@/types"
import { validateFileWithDetails } from "@/features/ideas/helpers/submit-idea"
import { IDEA_OPTION_SCROLL_THRESHOLD } from "@/features/ideas/helpers/idea-catalogue"
import { EditIdeaFormSection } from "@/features/ideas/components/EditIdeaFormSection"

export interface EditIdeaFormState {
  title: string
  description: string
  categoryId: string
  categoryName?: string
  isAnonymous: boolean
  uploadFiles: File[]
}

const initialForm: EditIdeaFormState = {
  title: "",
  description: "",
  categoryId: "",
  categoryName: "",
  isAnonymous: false,
  uploadFiles: [],
}

interface EditIdeaPageProps {
  ideaId: string
}

export default function EditIdeaPage({ ideaId }: EditIdeaPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [antdForm] = Form.useForm()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const categoryLoadLockRef = useRef(false)
  const [editForm, setEditForm] = useState<EditIdeaFormState>(initialForm)
  const [fileValidationMessage, setFileValidationMessage] = useState("")
  const [categoryOptionPage, setCategoryOptionPage] = useState(1)
  const [categoryOptions, setCategoryOptions] = useState<IdeaCategory[]>([])
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const { data: idea, isLoading: isIdeaLoading, error: ideaError } = useIdeaById(ideaId)
  const {
    data: categoryData,
    isLoading: categoriesLoading,
    isFetching: categoriesFetching,
  } = useIdeaCategories({
    pageNumber: categoryOptionPage,
    pageSize: CATEGORY_SELECT_PAGE_SIZE,
  })
  const { mutateAsync: updateIdea, isPending: isUpdatingIdea } = useUpdateIdea()

  const hasMoreCategories =
    (categoryData?.pagination?.totalPages ?? 1) > categoryOptionPage

  // Ensure current category is always at the top of options
  const categoryOptionsWithCurrent = useMemo(() => {
    if (!editForm.categoryId || !editForm.categoryName) {
      return categoryOptions
    }
    
    // Check if current category is already in the list
    const hasCurrent = categoryOptions.some((cat) => cat.id === editForm.categoryId)
    if (hasCurrent) {
      return categoryOptions
    }
    
    // Add current category to the top
    return [
      { id: editForm.categoryId, name: editForm.categoryName },
      ...categoryOptions,
    ]
  }, [categoryOptions, editForm.categoryId, editForm.categoryName])

  // Initialize form when idea loads
  useEffect(() => {
    if (idea) {
      const formData: EditIdeaFormState = {
        title: idea.title ?? "",
        description: idea.description ?? "",
        categoryId: idea.categoryId ?? "",
        categoryName: idea.categoryName,
        isAnonymous: idea.isAnonymous,
        uploadFiles: [],
      }
      setEditForm(formData)
      antdForm.setFieldsValue({
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        isAnonymous: formData.isAnonymous,
      })
    }
  }, [idea, antdForm])

  // Unlock category loading when fetching completes
  useEffect(() => {
    if (!categoriesFetching) {
      categoryLoadLockRef.current = false
    }
  }, [categoriesFetching])

  // Accumulate categories with pagination
  useEffect(() => {
    const nextCategories = categoryData?.categories ?? []

    if (!nextCategories.length) {
      return
    }

    setCategoryOptions((currentCategories) => {
      const seenIds = new Set(currentCategories.map((category) => category.id))
      const appended = nextCategories.filter(
        (category) => !seenIds.has(category.id),
      )

      if (!appended.length) {
        return currentCategories
      }

      return [...currentCategories, ...appended]
    })
  }, [categoryData])

  const handleEditFileChange = (files: FileList | null) => {
    const selectedFiles = Array.from(files ?? [])

    if (!selectedFiles.length) {
      setEditForm((prev) => ({ ...prev, uploadFiles: [] }))
      setFileValidationMessage("")
      return
    }

    // Validate each file with detailed error reporting
    for (const file of selectedFiles) {
      const validation = validateFileWithDetails(file)
      if (!validation.valid && validation.error) {
        setEditForm((prev) => ({ ...prev, uploadFiles: [] }))
        const errorMsg = validation.error.details
          ? `${validation.error.message} ${validation.error.details}`
          : validation.error.message
        setFileValidationMessage(errorMsg)

        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        return
      }
    }

    setEditForm((prev) => ({ ...prev, uploadFiles: selectedFiles }))
    setFileValidationMessage("")
  }

  const handleUpdateIdea = async () => {
    if (!idea) {
      return
    }

    if (!agreedToTerms) {
      appNotification.warning(
        "Please accept the Terms and Conditions before saving.",
      )
      return
    }

    if (fileValidationMessage) {
      appNotification.warning(fileValidationMessage)
      return
    }

    try {
      await antdForm.validateFields()
    } catch (error) {
      appNotification.warning(
        "Please complete all required fields before saving.",
      )
      return
    }

    const formData = new FormData()
    formData.append("Title", editForm.title.trim())
    formData.append("Description", editForm.description.trim())
    formData.append("CategoryId", editForm.categoryId)
    formData.append("IsAnonymous", String(editForm.isAnonymous))
    editForm.uploadFiles.forEach((file) => {
      formData.append("UploadedFiles", file)
    })

    const response = await updateIdea({ ideaId, formData })

    if (!response.success) {
      appNotification.error(response.error ?? "Unable to update this idea.")
      return
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ["idea", ideaId], exact: true })
    queryClient.invalidateQueries({ queryKey: ["myIdeas"] })
    queryClient.invalidateQueries({ queryKey: ["allIdeas"] })
    queryClient.invalidateQueries({ queryKey: ["pagedIdeas"] })

    appNotification.success("Idea updated successfully.")
    navigate({ to: `/ideas/${ideaId}` })
  }

  const handleCancel = () => {
    navigate({ to: `/ideas/${ideaId}` })
  }

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

  if (ideaError) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">Could not load idea</p>
          <p className="mt-1 text-sm text-red-700">
            {ideaError instanceof Error ? ideaError.message : "An error occurred"}
          </p>
        </div>
      </div>
    )
  }

  if (isIdeaLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-8">
        <p className="text-center text-slate-600">Loading idea...</p>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-6 lg:px-8">
        <p className="text-center text-slate-600">Idea not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full px-6 py-6 lg:px-8">
      <PageHeader
        title="Edit Idea"
        description={`Editing: ${idea.title}`}
      />

      <EditIdeaFormSection
        form={antdForm}
        idea={idea}
        editForm={editForm}
        categories={categoryOptionsWithCurrent}
        categoriesLoading={categoriesLoading}
        fileInputRef={fileInputRef}
        fileValidationMessage={fileValidationMessage}
        agreedToTerms={agreedToTerms}
        isPending={isUpdatingIdea}
        onBackToIdea={handleCancel}
        onFormChange={setEditForm}
        onFileChange={handleEditFileChange}
        onAgreedToTermsChange={setAgreedToTerms}
        onCategoryPopupScroll={handleCategoryPopupScroll}
        onSave={() => void handleUpdateIdea()}
      />
    </div>
  )
}
