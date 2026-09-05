export type AuthProfile = {
  first_name: string;
  last_name: string;
  years_experience: number;
  current_company: string | null;
  headline: string | null;
  employment_status: string;
  notice_period: string | null;
};

export type CurrentUser = {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  role: "user" | "admin";
  is_active: boolean;
  is_email_verified: boolean;
  avatar_seed: string;
  avatar_bg_color: string;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: AuthProfile | null;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_at: string;
  refresh_expires_at: string;
  user: CurrentUser;
};

export type DashboardSummary = {
  resumes_total: number;
  active_resume_exists: boolean;
  jobs_total: number;
  jobs_matched: number;
  applications_total: number;
  unread_notifications: number;
};

export type Job = {
  id: string;
  job_title: string;
  job_description: string;
  source_id?: number | null;
  company_name: string | null;
  location: string | null;
  city_location?: string | null;
  country_location?: string | null;
  pay_period?: string | null;
  mid_salary_sgd?: number | null;
  source: string;
  external_id: string;
  external_apply_url: string;
  skill_tags?: string[] | null;
  is_active: boolean;
  ingested_at: string;
  match_score?: number | null;
};

export type Resume = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_text: string | null;
  extracted_skills: string[] | null;
  embedding_ready: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Application = {
  id: string;
  user_id: string;
  job_id: string | null;
  job_name_snapshot: string;
  company_name_snapshot: string | null;
  location_snapshot: string | null;
  external_apply_url_snapshot: string;
  status: string;
  match_score: number;
  applied_at: string;
  updated_at: string;
  job?: Job | null;
};

export type NotificationItem = {
  id: string;
  user_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type NotificationSummary = {
  unread_count: number;
  items: NotificationItem[];
};

export type PaginatedJobsResponse = {
  items: Job[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
  summary?: {
    jobs_total: number;
    salary_range: {
      min: number | null;
      max: number | null;
    };
  };
};

export type PaginationMeta = PaginatedJobsResponse["pagination"];
