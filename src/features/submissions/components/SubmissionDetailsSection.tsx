import { useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { AppButton } from "@/components/app/AppButton";
import { SectionCard } from "@/components/shared/SectionCard";
import { Link } from "@tanstack/react-router";
import { formatAppDateTime } from "@/utils/date";
import { ActionButton } from "@/components/app/ActionButton";
import { Modal } from "@/components/shared/Modal";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/forms/FormField";
import { FormInput, FormTextarea } from "@/components/forms/FormInput";
import type { Submission } from "@/types";
import { isSubmissionClosed } from "@/features/ideas/helpers/submit-idea";
import { exportService } from "@/api/export";
import { appNotification } from "@/utils/notifications";
import type { SubmissionManagementFormState } from "@/features/submissions/helpers/submission-management";

interface SubmissionDetailsSectionProps {
  selectedSubmission: Submission;
  mode?: "manage" | "submit";
  onEditSubmission?: () => void;
  onDeleteRequest?: () => void;
  isFormModalOpen?: boolean;
  isDeleteModalOpen?: boolean;
  form?: SubmissionManagementFormState;
  onFormChange?: (form: SubmissionManagementFormState) => void;
  onSubmit?: () => void;
  onDeleteConfirm?: () => void;
  onDeleteCancel?: () => void;
  onCloseFormModal?: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function SubmissionDetailsSection({
  selectedSubmission,
  mode = "manage",
  onEditSubmission,
  onDeleteRequest,
  isFormModalOpen = false,
  isDeleteModalOpen = false,
  form,
  onFormChange,
  onSubmit,
  onDeleteConfirm,
  onDeleteCancel,
  onCloseFormModal,
  isUpdating = false,
  isDeleting = false,
}: SubmissionDetailsSectionProps) {
  const closed = isSubmissionClosed(selectedSubmission.closureDate);
  const isSubmitMode = mode === "submit";
  const [isExportingCSV, setIsExportingCSV] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const getExportErrorMessage = (error: Error | undefined, fileType: "CSV" | "ZIP") => {
    const fallbackMessage =
      "Please try again in a moment. If the issue persists, contact an administrator.";

    if (error?.message.trim()) {
      return `Failed to export ${fileType}. ${error.message}`;
    }

    return `Failed to export ${fileType}. ${fallbackMessage}`;
  };

  const handleExportCSV = async () => {
    try {
      setIsExportingCSV(true);
      await exportService.exportSubmissionAsCSV(
        selectedSubmission.id,
        selectedSubmission.name,
      );
      appNotification.success("CSV exported successfully.");
    } catch (error) {
      const exportError = error instanceof Error ? error : undefined;
      appNotification.error(getExportErrorMessage(exportError, "CSV"));
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportZip = async () => {
    try {
      setIsExportingZip(true);
      await exportService.exportSubmissionAsZip(
        selectedSubmission.id,
        selectedSubmission.name,
      );
      appNotification.success("ZIP exported successfully.");
    } catch (error) {
      const exportError = error instanceof Error ? error : undefined;
      appNotification.error(getExportErrorMessage(exportError, "ZIP"));
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSubmitMode ? (
        <AppButton type="button" variant="ghost" onClick={onDeleteRequest}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to submissions
        </AppButton>
      ) : (
        <Link to="/manage/submissions">
          <AppButton type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to submissions
          </AppButton>
        </Link>
      )}

      <SectionCard
        title={selectedSubmission.name}
        description="Review the submission details before opening the submit form."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  closed
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {closed ? "Closed for new ideas" : "Open for submission"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <AppButton
                type="button"
                variant="ghost"
                onClick={handleExportCSV}
                disabled={isExportingCSV || isExportingZip}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </AppButton>
              <AppButton
                type="button"
                variant="ghost"
                onClick={handleExportZip}
                disabled={isExportingZip || isExportingCSV}
              >
                <Download className="mr-2 h-4 w-4" />
                Export ZIP
              </AppButton>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-800">Description</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {selectedSubmission.description?.trim() ||
                "No description has been added for this submission yet."}
            </p>
          </div>

          <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-800">Closure date</p>
              <p className="mt-1 text-sm text-slate-600">
                {formatAppDateTime(selectedSubmission.closureDate)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                Final closure date
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {formatAppDateTime(selectedSubmission.finalClosureDate)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              {isSubmitMode ? (
                <AppButton
                  type="button"
                  variant="secondary"
                  onClick={onEditSubmission}
                  disabled={isUpdating || isDeleting || closed}
                >
                  Submit idea
                </AppButton>
              ) : (
                <>
                  <ActionButton
                    action="edit"
                    onClick={onEditSubmission}
                    disabled={isUpdating || isDeleting}
                  />
                  <ActionButton
                    action="delete"
                    onClick={onDeleteRequest}
                    disabled={isDeleting || isUpdating}
                  />
                  <Link
                    to={"/ideas/$ideaId"}
                    params={{ ideaId: selectedSubmission.id }}
                  >
                    <AppButton type="button" variant="secondary" disabled={closed}>
                      Submit idea
                    </AppButton>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        title="Edit Submission"
        onClose={() => onCloseFormModal?.()}
        footer={
          <>
            <AppButton
              type="button"
              variant="ghost"
              onClick={() => onCloseFormModal?.()}
              disabled={isUpdating}
            >
              Cancel
            </AppButton>
            <AppButton
              type="button"
              variant="secondary"
              onClick={() => onSubmit?.()}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update"}
            </AppButton>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <FormField label="Submission Name" required>
              <FormInput
                value={form.name}
                onChange={(e) =>
                  onFormChange?.({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Enter submission name"
              />
            </FormField>

            <FormField label="Description">
              <FormTextarea
                value={form.description}
                onChange={(e) =>
                  onFormChange?.({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Enter submission description"
                rows={3}
              />
            </FormField>

            <FormField label="Closure Date" required>
              <DatePicker
                showTime
                value={form.closureDate ? dayjs(form.closureDate) : null}
                onChange={(date) =>
                  onFormChange?.({
                    ...form,
                    closureDate: date ? date.toISOString() : "",
                  })
                }
                className="w-full"
              />
            </FormField>

            <FormField label="Final Closure Date" required>
              <DatePicker
                showTime
                value={
                  form.finalClosureDate ? dayjs(form.finalClosureDate) : null
                }
                onChange={(date) =>
                  onFormChange?.({
                    ...form,
                    finalClosureDate: date ? date.toISOString() : "",
                  })
                }
                className="w-full"
              />
            </FormField>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Submission"
        message={`Are you sure you want to delete "${selectedSubmission.name}"? This action cannot be undone.`}
        onConfirm={() => onDeleteConfirm?.()}
        onCancel={() => onDeleteCancel?.()}
        isLoading={isDeleting}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
      />
    </div>
  );
}
