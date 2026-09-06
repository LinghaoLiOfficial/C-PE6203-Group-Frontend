export type AuthProfile = {
  first_name: string;
  last_name: string;
  years_experience: number;
  current_company: string | null;
  headline: string | null;
  employment_status: string;
  notice_period: string | null;
};

export type CandidateProfile = {
  user_id: string;
  profile: AuthProfile;
  preferences: Record<string, unknown>;
  constraints: Record<string, unknown>;
  confirmed: boolean;
};

export type EvidenceSpan = {
  source: string;
  text: string;
  start?: number | null;
  end?: number | null;
};

export type ResumeGraph = {
  candidate_graph: {
    id?: string;
    user_id: string;
    resume_id: string;
    summary: string;
    skills: Array<Record<string, unknown>>;
    experience_highlights?: string[];
    experiences: Array<Record<string, unknown>>;
    education: Array<Record<string, unknown>>;
    projects: Array<Record<string, unknown>>;
    achievements: Array<Record<string, unknown>>;
    publications?: Array<Record<string, unknown>>;
    constraints: Record<string, unknown>;
    preferences: Record<string, unknown>;
    source_spans: Array<Record<string, unknown>>;
    user_confirmed: boolean;
    created_at?: string;
    updated_at?: string;
  };
  resume: Resume;
  resume_variant?: {
    id?: string;
    user_id?: string;
    resume_id?: string;
    job_id?: string;
    job_title?: string | null;
    company_name?: string | null;
    plan?: {
      section_order?: string[];
      emphasized_skills?: string[];
      selected_evidence?: Array<Record<string, unknown>>;
      notes?: string[];
    } | null;
    claims?: Array<Record<string, unknown>> | null;
    validation_results?: Array<Record<string, unknown>> | null;
    rewritten_text?: string;
    target_job_profile?: JobDetail["canonical_job_profile"] | null;
    created_at?: string;
  } | null;
};

export type ResumeVariantListItem = {
  id: string;
  user_id: string;
  resume_id: string | null;
  job_id: string;
  job_title: string | null;
  company_name: string | null;
  source_file_name?: string | null;
  rewritten_text: string;
  resume_sections?: Record<string, unknown>;
  change_summary?: Array<Record<string, unknown>>;
  evidence_used?: Array<Record<string, unknown>>;
  target_requirements?: Array<Record<string, unknown>>;
  cached: boolean;
  plan?: {
    section_order?: string[];
    emphasized_skills?: string[];
    selected_evidence?: Array<Record<string, unknown>>;
    notes?: string[];
  } | null;
  claims?: Array<Record<string, unknown>> | null;
  validation_results?: Array<Record<string, unknown>> | null;
  target_job_profile?: JobDetail["canonical_job_profile"] | null;
  created_at: string;
};

export type ResumeTailoringTask = {
  id: string;
  user_id: string;
  resume_id: string;
  job_id: string;
  job_title: string | null;
  company_name: string | null;
  source_file_name: string | null;
  status: "queued" | "running" | "completed" | "failed";
  stage: string;
  progress: number;
  error_message: string | null;
  attempts: number;
  created_at: string;
  updated_at: string;
  finished_at: string | null;
  variant: ResumeVariantListItem | null;
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

export type UserRole = CurrentUser["role"];

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
  opportunity_score?: number | null;
  opportunity_category?: string | null;
  fit_breakdown?: Record<string, number> | null;
  rationale?: string[] | null;
  transition_difficulty?: string | null;
  data_confidence?: number | null;
};

export type JobDetail = Job & {
  canonical_job_profile?: {
    required_skills?: string[];
    preferred_skills?: string[];
    education_requirements?: string[];
    experience_requirements?: string[];
    licenses?: string[];
    occupation_family?: string | null;
    seniority?: string | null;
    salary_confidence?: string;
    freshness_score?: number;
    trust_score?: number;
    raw_requirements?: Record<string, unknown>;
  } | null;
  requirement_summary?: {
    required_skills?: string[];
    preferred_skills?: string[];
    education_requirements?: string[];
    experience_requirements?: string[];
    licenses?: string[];
    occupation_family?: string | null;
    seniority?: string | null;
    salary_confidence?: string;
    freshness_score?: number;
    trust_score?: number;
    raw_requirements?: Record<string, unknown>;
  } | null;
  opportunity_explanation?: {
    what_fits?: string[];
    what_transfers?: string[];
    what_is_missing?: string[];
    salary_context?: {
      annual_salary_sgd?: number | null;
      salary_confidence?: string;
    };
    confidence?: number;
    transition_cost?: string;
  } | null;
};

export type Resume = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  parsed_text: string | null;
  extracted_skills: string[] | null;
  candidate_graph?: ResumeGraph["candidate_graph"] | null;
  embedding_ready: boolean;
  parse_status: "uploaded" | "queued" | "running" | "completed" | "failed";
  parse_progress: number;
  parse_stage: string;
  parse_error: string | null;
  parse_task_id: string | null;
  parse_mode?: string;
  parse_diagnostics?: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ResumeParseTask = {
  id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  stage: string;
  progress: number;
  error_message: string | null;
  diagnostics?: Record<string, unknown> | null;
  attempts: number;
  worker_id: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ResumeParseStatus = {
  resume_id: string;
  task: ResumeParseTask | null;
};

export type OpportunitySection = {
  title: string;
  jobs: Job[];
};

export type OpportunityMap = {
  overview: DashboardSummary | null;
  sections: OpportunitySection[];
  score_vector: Record<string, number> | null;
};

export type OpportunityVector = {
  salary_advantage: number;
  attainability: number;
  demand: number;
  entry_barrier: number;
  career_option: number;
  preference_fit: number;
  data_confidence: number;
  fit: number;
};

export type FeedbackEvent = {
  id: string;
  user_id: string;
  job_id: string | null;
  event_type: string;
  payload: Record<string, unknown> | null;
  created_at: string;
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

export type JobImportRow = {
  row_number: number;
  status: string;
  dedupe_key?: string | null;
  error_message?: string | null;
  raw_payload?: Record<string, unknown> | null;
  normalized_payload?: Record<string, unknown> | null;
  canonical_job_profile?: JobDetail["canonical_job_profile"] | null;
  job_id?: string | null;
};

export type JobImportBatch = {
  id: string;
  admin_user_id: string;
  file_name: string;
  status: string;
  total_rows: number;
  pending_insert_rows: number;
  pending_update_rows: number;
  duplicate_rows: number;
  error_rows: number;
  inserted_rows: number;
  updated_rows: number;
  skipped_rows: number;
  source: string;
  created_at: string;
  imported_at: string | null;
  rows: JobImportRow[];
};

export type JobImportPreviewResponse = {
  batch: JobImportBatch;
};

export type JobImportConfirmResponse = {
  batch: JobImportBatch;
};

export type JobImportHistoryItem = {
  id: string;
  file_name: string;
  status: string;
  total_rows: number;
  inserted_rows: number;
  updated_rows: number;
  skipped_rows: number;
  error_rows: number;
  created_at: string;
  imported_at: string | null;
};

export type JobImportHistoryResponse = {
  items: JobImportHistoryItem[];
};

export type ResumeVariant = {
  rewritten_text: string;
  cached: boolean;
  plan?: {
    section_order?: string[];
    emphasized_skills?: string[];
    selected_evidence?: Array<Record<string, unknown>>;
    notes?: string[];
  } | null;
  claims?: Array<Record<string, unknown>> | null;
  validation_results?: Array<Record<string, unknown>> | null;
  target_job_profile?: JobDetail["canonical_job_profile"] | null;
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
