import { apiRequest } from "@/lib/api/client";
import type {
  Application,
  AuthTokens,
  CurrentUser,
  DashboardSummary,
  Job,
  NotificationSummary,
  PaginatedJobsResponse,
  Resume,
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

export const listJobs = (params?: string) =>
  apiRequest<PaginatedJobsResponse>(`/jobs${params ? `?${params}` : ""}`);

export const getJob = (jobId: string) => apiRequest<Job>(`/jobs/${jobId}`);

export const rewriteJobResume = (jobId: string) =>
  apiRequest<{ rewritten_text: string; cached: boolean }>(`/jobs/${jobId}/rewrite`, { method: "POST" });

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

export const listResumes = () => apiRequest<Resume[]>("/resumes");

export const uploadResume = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<{ resume_id: string; status: "processing" | "ready" }>("/resumes", {
    method: "POST",
    body: formData,
  });
};

export const getResume = (resumeId: string) => apiRequest<Resume>(`/resumes/${resumeId}/parsed`);

export const deleteResume = (resumeId: string) =>
  apiRequest<void>(`/resumes/${resumeId}`, { method: "DELETE" });

export const listNotifications = () => apiRequest<NotificationSummary>("/notifications");

export const markNotificationRead = (notificationId: string) =>
  apiRequest(`/notifications/${notificationId}/read`, { method: "PATCH" });

export const listAdminUsers = () => apiRequest<CurrentUser[]>("/admin/users");

export const runIngest = () => apiRequest<{ inserted: number }>("/admin/ingest/run", { method: "POST" });
