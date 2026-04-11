import type { UIEvent } from "react"
import { AlertCircle, FileUp } from "lucide-react"
import type { FormInstance } from "antd"
import { Form, Select } from "antd"
import { FormField } from "@/components/forms/FormField"
import { FormInput, FormTextarea } from "@/components/forms/FormInput"
import { SectionCard } from "@/components/shared/SectionCard"
import type { IdeaCategory } from "@/types"

export interface IdeaFormData {
  title: string
  description: string
  categoryId: string
  isAnonymous: boolean
  uploadFiles?: File[]
}

interface IdeaFormFieldsProps<T extends Record<string, any> = IdeaFormData> {
  form?: FormInstance
  editForm?: T
  categories: IdeaCategory[]
  categoriesLoading: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  fileValidationMessage: string
  onFormChange: (form: T) => void
  onFileChange: (files: FileList | null) => void
  onCategoryPopupScroll?: (event: UIEvent<HTMLDivElement>) => void
  mode?: "submit" | "edit"
  submissionName?: string
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function IdeaFormFields<T extends Record<string, any> = IdeaFormData>({
  form: antdForm,
  editForm,
  categories,
  categoriesLoading,
  fileInputRef,
  fileValidationMessage,
  onFormChange,
  onFileChange,
  onCategoryPopupScroll,
  mode = "submit",
  submissionName,
}: IdeaFormFieldsProps<T>) {
  const isSubmitMode = mode === "submit"
  const isEditMode = mode === "edit"
  const formData = (editForm ?? {}) as T

  return (
    <div className="space-y-5">
      {/* Basic Info Section */}
      <SectionCard
        title="Idea information"
        description={
          isSubmitMode && submissionName
            ? `Submitting to ${submissionName}`
            : undefined
        }
      >
        <div className="grid gap-5">
          <FormField label="Idea title" required>
            {isEditMode && antdForm ? (
              <Form.Item
                name="title"
                rules={[
                  { required: true, message: "Please enter an idea title" },
                  { min: 3, message: "Title must be at least 3 characters" },
                ]}
                className="mb-0"
              >
                <FormInput
                  id="idea-title"
                  placeholder="Enter a concise title"
                />
              </Form.Item>
            ) : (
              <FormInput
                id="idea-title"
                name="title"
                value={formData.title}
                onChange={(event) =>
                  onFormChange({ ...formData, title: event.target.value })
                }
                placeholder="Enter a concise title"
              />
            )}
          </FormField>
        </div>

        <div className="mt-5 grid gap-5">
          <FormField
            label="Content"
            required
            hint={
              isSubmitMode
                ? "Useful for card preview, moderation queue, or search result snippet."
                : undefined
            }
          >
            {isEditMode && antdForm ? (
              <Form.Item
                name="description"
                rules={[
                  { required: true, message: "Please enter a description" },
                  { min: 10, message: "Description must be at least 10 characters" },
                ]}
                className="mb-0"
              >
                <FormTextarea
                  id="idea-description"
                  placeholder="Describe the idea clearly"
                />
              </Form.Item>
            ) : (
              <FormTextarea
                id="idea-description"
                name="description"
                value={formData.description}
                onChange={(event) =>
                  onFormChange({ ...formData, description: event.target.value })
                }
                placeholder={
                  isSubmitMode
                    ? "content of the idea"
                    : "Describe the idea clearly"
                }
              />
            )}
          </FormField>
        </div>
      </SectionCard>

      {/* Classification & Privacy Section */}
      <SectionCard
        title="Classification & privacy"
        description={
          isSubmitMode
            ? "Categories are loaded from the live API for the selected submission."
            : undefined
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Category" required>
            {isEditMode && antdForm ? (
              <Form.Item
                name="categoryId"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
                className="mb-0"
              >
                <Select<string>
                  id="idea-category"
                  size="large"
                  onChange={(value) => {
                    const selectedCategory = categories.find(
                      (cat) => cat.id === value,
                    )
                    antdForm.setFieldValue("categoryName", selectedCategory?.name)
                    onFormChange({
                      ...formData,
                      categoryId: value,
                      categoryName: selectedCategory?.name,
                    })
                  }}
                  onClear={() => {
                    antdForm.setFieldValue("categoryName", "")
                    onFormChange({ ...formData, categoryId: "", categoryName: "" })
                  }}
                  disabled={categoriesLoading}
                  loading={categoriesLoading}
                  allowClear
                  showSearch={false}
                  placeholder="Select category"
                  onPopupScroll={onCategoryPopupScroll}
                  options={categories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  className="w-full"
                />
              </Form.Item>
            ) : (
              <Select<string>
                id="idea-category"
                value={formData.categoryId || undefined}
                size="large"
                onChange={(value) => {
                  const selectedCategory = categories.find(
                    (cat) => cat.id === value,
                  )
                  onFormChange({
                    ...formData,
                    categoryId: value,
                    categoryName: selectedCategory?.name,
                  })
                }}
                onClear={() =>
                  onFormChange({ ...formData, categoryId: "", categoryName: "" })
                }
                disabled={categoriesLoading}
                loading={categoriesLoading}
                allowClear
                showSearch={false}
                placeholder="Select category"
                onPopupScroll={onCategoryPopupScroll}
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.name,
                }))}
                className="w-full"
              />
            )}
            {categoriesLoading && (
              <p className="mt-2 text-xs text-slate-500">
                Loading categories...
              </p>
            )}
          </FormField>

          {isSubmitMode && (
            <FormField label="Anonymous submission">
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  id="idea-is-anonymous"
                  name="isAnonymous"
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(event) =>
                    onFormChange({ ...formData, isAnonymous: event.target.checked })
                  }
                />
                Hide author identity from public idea views.
              </label>
            </FormField>
          )}

          {isEditMode && (
            <FormField label="Anonymous submission">
              {antdForm ? (
                <Form.Item
                  name="isAnonymous"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <input
                      id="idea-is-anonymous"
                      name="isAnonymous"
                      type="checkbox"
                      onChange={(event) => {
                        antdForm.setFieldValue("isAnonymous", event.target.checked)
                        onFormChange({ ...formData, isAnonymous: event.target.checked })
                      }}
                    />
                    <label htmlFor="idea-is-anonymous">
                      Hide author identity from public idea views.
                    </label>
                  </div>
                </Form.Item>
              ) : (
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <input
                    id="idea-is-anonymous"
                    name="isAnonymous"
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(event) =>
                      onFormChange({ ...formData, isAnonymous: event.target.checked })
                    }
                  />
                  Hide author identity from public idea views.
                </label>
              )}
            </FormField>
          )}
        </div>
      </SectionCard>

      {/* Attachments Section */}
      <SectionCard title="Attachments">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <FileUp className="h-6 w-6 text-slate-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {isEditMode
                  ? "Upload replacement files"
                  : "Choose supporting files"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                PDF files only, max 5MB each.
                {isEditMode && " Leave empty to keep current documents."}
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="idea-uploaded-files"
              name="uploadedFiles"
              multiple
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(event) => onFileChange(event.target.files)}
            />
          </label>

          {formData.uploadFiles && formData.uploadFiles.length > 0 && (
            <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="mb-3 text-sm font-medium text-emerald-900">
                {isEditMode ? "New files selected" : "Selected files"} (
                {formData.uploadFiles.length}):
              </p>
              <div className="space-y-2">
                {Array.from((formData.uploadFiles ?? []) as File[]).map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded bg-white p-3 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <FileUp className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="font-medium text-slate-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {fileValidationMessage && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Upload Error
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    {fileValidationMessage}
                  </p>
                  <p className="mt-2 text-xs text-red-600">
                    Please ensure your file is a PDF and does not exceed 5MB.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!fileValidationMessage &&
            (!formData.uploadFiles || formData.uploadFiles.length === 0) && (
              <p className="mt-4 text-sm text-slate-600">
                {isEditMode
                  ? "No new files selected."
                  : "No files selected yet."}
              </p>
            )}
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="mb-3 font-medium text-slate-900">
            Upload requirements:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>File format: PDF only (e.g., document.pdf)</li>
            <li>Maximum file size: 5MB per file</li>
            <li>Multiple files can be uploaded</li>
            <li>
              Files with wrong extensions or non-PDF content will be rejected
            </li>
            {isEditMode && (
              <li>Leave empty to keep your current supporting documents</li>
            )}
          </ul>
        </div>
      </SectionCard>
    </div>
  )
}
