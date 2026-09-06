import { apiRequest } from "@/lib/api/client";
import type {
  Application,
  AuthTokens,
  CandidateProfile,
  CurrentUser,
  DashboardSummary,
  FeedbackEvent,
  JobDetail,
  JobImportConfirmResponse,
  JobImportHistoryResponse,
  JobImportPreviewResponse,
  OpportunityMap,
  NotificationSummary,
  PaginatedJobsResponse,
  ResumeGraph,
  ResumeParseStatus,
  ResumeParseTask,
  Resume,
  ResumeVariantListItem,
  ResumeTailoringTask,
} from "@/lib/types";

export const login = (email: string, password: string) =>
  apiRequest<AuthTokens>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const register = (payload: Record<string, unknown>) =>
  apiRequest<AuthTokens>("/auth/register", { method: "POST", body: JSON.stringify(payload) });

export const sendVerificationCode = (email: string) =>
  apiRequest<{ message: string; delivery_channel: "email" | "dev_log" }>("/auth/email-verification-codes", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const getCurrentUser = () => apiRequest<CurrentUser>("/auth/me");

export const updateMeProfile = (payload: Record<string, unknown>) =>
  apiRequest<CurrentUser>("/me/profile", { method: "PATCH", body: JSON.stringify(payload) });

export const updateMe = (payload: Record<string, unknown>) =>
  apiRequest<CurrentUser>("/me", { method: "PATCH", body: JSON.stringify(payload) });

export const logout = () => apiRequest<void>("/auth/logout", { method: "POST" });

export const getDashboardSummary = () => apiRequest<DashboardSummary>("/dashboard/summary");

export const getCandidateProfile = () => apiRequest<CandidateProfile>("/candidate/profile");

export const updateCandidateProfile = (payload: Record<string, unknown>) =>
  apiRequest<CandidateProfile>("/candidate/profile", { method: "PATCH", body: JSON.stringify(payload) });

export const listJobs = (params?: string) =>
  apiRequest<PaginatedJobsResponse>(`/jobs${params ? `?${params}` : ""}`);

export const getJob = (jobId: string) => apiRequest<JobDetail>(`/jobs/${jobId}`);

export const listOpportunities = () => apiRequest<OpportunityMap>("/opportunities");

export const rewriteJobResume = (jobId: string) =>
  apiRequest<{
    id: string;
    status: ResumeTailoringTask["status"];
    progress: number;
  }>(`/jobs/${jobId}/rewrite`, { method: "POST" });

export const sendFeedback = (payload: { job_id?: string | null; event_type: string; payload?: Record<string, unknown> | null }) =>
  apiRequest<FeedbackEvent>("/feedback", { method: "POST", body: JSON.stringify(payload) });

export const createApplication = (jobId: string) =>
  apiRequest<{ application: Application; apply_url: string; created: boolean }>("/applications", {
    method: "POST",
    body: JSON.stringify({ job_id: jobId }),
  });

export const listApplications = () => apiRequest<Application[]>("/applications");

export const updateApplication = (applicationId: string, status: string) =>
  apiRequest<Application>(`/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

export const deleteApplication = (applicationId: string) =>
  apiRequest<void>(`/applications/${applicationId}`, { method: "DELETE" });

export const listResumes = () => apiRequest<Resume[]>("/resumes");

export const listResumeVariants = () => apiRequest<ResumeVariantListItem[]>("/resumes/variants");
export const listTailoredResumes = () => apiRequest<ResumeTailoringTask[]>("/resumes/tailored");
export const getResumeTailoringTask = (taskId: string) => apiRequest<ResumeTailoringTask>(`/resumes/tailored/${taskId}`);
export const retryResumeTailoringTask = (taskId: string) =>
  apiRequest<ResumeTailoringTask>(`/resumes/tailored/${taskId}/retry`, { method: "POST" });

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<{ resume_id: string; status: "uploaded" }>("/resumes", {
    method: "POST",
    body: formData,
  });
};

export const parseResume = (resumeId: string) =>
  apiRequest<ResumeParseTask>(`/resumes/${resumeId}/parse`, { method: "POST" });

export const getResumeParseStatus = (resumeId: string) =>
  apiRequest<ResumeParseStatus>(`/resumes/${resumeId}/parse-status`);

export const getResume = (resumeId: string) => apiRequest<Resume>(`/resumes/${resumeId}/parsed`);

export const getResumeGraph = (resumeId: string) => apiRequest<ResumeGraph>(`/resumes/${resumeId}/graph`);

export const deleteResume = (resumeId: string) =>
  apiRequest<void>(`/resumes/${resumeId}`, { method: "DELETE" });

export const listNotifications = () => apiRequest<NotificationSummary>("/notifications");

export const markNotificationRead = (notificationId: string) =>
  apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH" });

export const listAdminUsers = () => apiRequest<CurrentUser[]>("/admin/users");

export const runIngest = () => apiRequest<{ inserted: number }>("/admin/ingest/run", { method: "POST" });

export const previewJobImport = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<JobImportPreviewResponse>("/admin/job-imports/preview", {
    method: "POST",
    body: formData,
  });
};

export const confirmJobImport = (batchId: string) =>
  apiRequest<JobImportConfirmResponse>("/admin/job-imports/confirm", {
    method: "POST",
    body: JSON.stringify({ batch_id: batchId }),
  });

export const listJobImports = () => apiRequest<JobImportHistoryResponse>("/admin/job-imports");
