"use client";

import { ChevronDown, ChevronUp, CircleAlert, Layers3, MapPin, ShieldCheck, WandSparkles } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { getCandidateProfile, updateCandidateProfile, updateMe, updateMeProfile } from "@/lib/api";
import type { CandidateProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);

  useEffect(() => {
    void getCandidateProfile().then(setCandidateProfile).catch(() => setCandidateProfile(null));
  }, []);

  if (!user) return null;

  return (
    <ProfileEditor
      key={`${user.id}-${JSON.stringify(candidateProfile?.preferences ?? {})}-${JSON.stringify(candidateProfile?.constraints ?? {})}`}
      user={{
        username: user.username,
        display_name: user.display_name || "",
        first_name: user.profile?.first_name || "",
        last_name: user.profile?.last_name || "",
        years_experience: user.profile?.years_experience || 0,
        current_company: user.profile?.current_company || "",
        headline: user.profile?.headline || "",
        employment_status: user.profile?.employment_status || "unemployed",
        notice_period: user.profile?.notice_period || "",
      }}
      candidateProfile={candidateProfile}
      onSaved={refreshUser}
    />
  );
}

function ProfileEditor({
  user,
  candidateProfile,
  onSaved,
}: {
  user: {
    username: string;
    display_name: string;
    first_name: string;
    last_name: string;
    years_experience: number;
    current_company: string;
    headline: string;
    employment_status: string;
    notice_period: string;
  };
  candidateProfile: CandidateProfile | null;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(user);
  const [structured, setStructured] = useState(() => buildStructuredProfile(candidateProfile));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedPreferences, setAdvancedPreferences] = useState(() =>
    JSON.stringify(candidateProfile?.preferences ?? {}, null, 2)
  );
  const [advancedConstraints, setAdvancedConstraints] = useState(() =>
    JSON.stringify(candidateProfile?.constraints ?? {}, null, 2)
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const preferences = advancedOpen
        ? mergeStructuredAndRawPreferences(structured, parseJsonOrFallback(advancedPreferences))
        : mergeStructuredAndRawPreferences(structured, candidateProfile?.preferences ?? {});
      const constraints = advancedOpen
        ? mergeStructuredAndRawConstraints(structured, parseJsonOrFallback(advancedConstraints))
        : mergeStructuredAndRawConstraints(structured, candidateProfile?.constraints ?? {});

      await updateMe({
        username: form.username,
        display_name: form.display_name || undefined,
      });
      await updateMeProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        years_experience: form.years_experience,
        current_company: form.current_company || undefined,
        headline: form.headline || undefined,
        employment_status: form.employment_status,
        notice_period: form.notice_period || undefined,
      });
      await updateCandidateProfile({
        profile: {
          first_name: form.first_name,
          last_name: form.last_name,
          years_experience: form.years_experience,
          current_company: form.current_company || undefined,
          headline: form.headline || undefined,
          employment_status: form.employment_status,
          notice_period: form.notice_period || undefined,
        },
        preferences,
        constraints,
        confirmed: true,
      });
      toast.success("Profile updated");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const update = (key: keyof typeof form, value: string | number) =>
    setForm((state) => ({ ...state, [key]: value }));

  const preferenceSummary = summarizeProfilePreferences(structured, candidateProfile?.preferences ?? {});
  const constraintSummary = summarizeProfileConstraints(structured, candidateProfile?.constraints ?? {});

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Candidate profile confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <section className="grid gap-4 md:grid-cols-2">
              {[
                ["username", "Username", "text"],
                ["display_name", "Display name", "text"],
                ["first_name", "First name", "text"],
                ["last_name", "Last name", "text"],
                ["current_company", "Current company", "text"],
                ["headline", "Headline", "text"],
                ["notice_period", "Notice period", "text"],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type={type}
                    value={String(form[key as keyof typeof form])}
                    onChange={(event) => update(key as keyof typeof form, event.target.value)}
                  />
                </div>
              ))}
              <div>
                <Label htmlFor="years_experience">Years experience</Label>
                <Input
                  id="years_experience"
                  type="number"
                  value={form.years_experience}
                  onChange={(event) => update("years_experience", Number(event.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="employment_status">Employment status</Label>
                <Select
                  value={form.employment_status}
                  onValueChange={(value) => update("employment_status", value)}
                >
                  <SelectTrigger id="employment_status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["employed", "unemployed", "open_to_work", "student", "freelance"].map((value) => (
                      <SelectItem key={value} value={value}>
                        {formatOptionLabel(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <Separator />

            <section className="grid gap-6 xl:grid-cols-2">
              <PreferencePanel
                title="Preferences"
                icon={<WandSparkles className="size-4" />}
                summary={preferenceSummary}
              >
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="pref-location">Preferred location</Label>
                    <Input
                      id="pref-location"
                      value={structured.location}
                      onChange={(event) =>
                        setStructured((state) => ({ ...state, location: event.target.value }))
                      }
                      placeholder="Singapore, Remote, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="pref-remote">Remote preference</Label>
                    <Select
                      value={structured.remote_preference}
                      onValueChange={(value) =>
                        setStructured((state) => ({ ...state, remote_preference: value }))
                      }
                    >
                      <SelectTrigger id="pref-remote">
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        {REMOTE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pref-auth">Work authorization</Label>
                    <Select
                      value={structured.work_authorization}
                      onValueChange={(value) =>
                        setStructured((state) => ({ ...state, work_authorization: value }))
                      }
                    >
                      <SelectTrigger id="pref-auth">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {AUTH_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pref-roles">Target role families</Label>
                    <Textarea
                      id="pref-roles"
                      value={structured.role_families}
                      onChange={(event) =>
                        setStructured((state) => ({ ...state, role_families: event.target.value }))
                      }
                      placeholder="Engineering, Product, Data"
                      className="min-h-24"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Separate entries with commas.
                    </p>
                  </div>
                </div>
              </PreferencePanel>

              <PreferencePanel
                title="Constraints"
                icon={<ShieldCheck className="size-4" />}
                summary={constraintSummary}
                tone="warning"
              >
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="con-location">Location constraints</Label>
                    <Input
                      id="con-location"
                      value={structured.constraints.location}
                      onChange={(event) =>
                        setStructured((state) => ({
                          ...state,
                          constraints: { ...state.constraints, location: event.target.value },
                        }))
                      }
                      placeholder="Must be in Singapore"
                    />
                  </div>
                  <div>
                    <Label htmlFor="con-relocation">Relocation</Label>
                    <Select
                      value={structured.constraints.relocation}
                      onValueChange={(value) =>
                        setStructured((state) => ({
                          ...state,
                          constraints: { ...state.constraints, relocation: value },
                        }))
                      }
                    >
                      <SelectTrigger id="con-relocation">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONSTRAINT_BOOL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="con-salary">Minimum salary expectation</Label>
                    <Input
                      id="con-salary"
                      value={structured.constraints.salary_floor}
                      onChange={(event) =>
                        setStructured((state) => ({
                          ...state,
                          constraints: { ...state.constraints, salary_floor: event.target.value },
                        }))
                      }
                      placeholder="6500 SGD"
                    />
                  </div>
                  <div>
                    <Label htmlFor="con-notice">Notice-period constraint</Label>
                    <Input
                      id="con-notice"
                      value={structured.constraints.notice_period}
                      onChange={(event) =>
                        setStructured((state) => ({
                          ...state,
                          constraints: { ...state.constraints, notice_period: event.target.value },
                        }))
                      }
                      placeholder="Immediate, 1 month, 2 weeks"
                    />
                  </div>
                </div>
              </PreferencePanel>
            </section>

            <section className="rounded-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Advanced JSON</p>
                  <p className="text-xs text-muted-foreground">
                    Use this only when you need to edit fields not covered by the structured form.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setAdvancedOpen((value) => !value)}>
                  {advancedOpen ? (
                    <>
                      <ChevronUp className="size-4" />
                      Hide raw data
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" />
                      Edit raw data
                    </>
                  )}
                </Button>
              </div>
              {advancedOpen ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="preferences">Preferences JSON</Label>
                    <Textarea
                      id="preferences"
                      value={advancedPreferences}
                      onChange={(event) => setAdvancedPreferences(event.target.value)}
                      className="min-h-40 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="constraints">Constraints JSON</Label>
                    <Textarea
                      id="constraints"
                      value={advancedConstraints}
                      onChange={(event) => setAdvancedConstraints(event.target.value)}
                      className="min-h-40 font-mono text-xs"
                    />
                  </div>
                </div>
              ) : null}
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Profile confirmation updates your candidate graph and ranking inputs.
              </p>
              <Button type="submit">Save profile</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Readable summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5">
          <SummaryBlock title="Preferences" icon={<MapPin className="size-4" />} items={preferenceSummary} />
          <SummaryBlock title="Constraints" icon={<CircleAlert className="size-4" />} items={constraintSummary} />
          <SummaryBlock
            title="Coverage"
            icon={<Layers3 className="size-4" />}
            items={[
              `Structured preferences: ${countFilledStructuredPreferences(structured)}`,
              `Structured constraints: ${countFilledStructuredConstraints(structured)}`,
              `Advanced JSON: ${advancedOpen ? "visible" : "collapsed"}`,
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function parseJsonOrFallback(value: string) {
  try {
    return JSON.parse(value || "{}");
  } catch {
    return {};
  }
}

type StructuredProfile = {
  location: string;
  work_authorization: string;
  remote_preference: string;
  role_families: string;
  constraints: {
    location: string;
    relocation: string;
    salary_floor: string;
    notice_period: string;
  };
};

const REMOTE_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "onsite", label: "On-site" },
  { value: "hybrid", label: "Hybrid" },
  { value: "remote", label: "Remote" },
  { value: "flexible", label: "Flexible" },
];

const AUTH_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "citizen", label: "Citizen" },
  { value: "permanent_resident", label: "Permanent resident" },
  { value: "work_pass", label: "Work pass" },
  { value: "needs_sponsorship", label: "Needs sponsorship" },
];

const CONSTRAINT_BOOL_OPTIONS = [
  { value: "", label: "Not specified" },
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
];

function buildStructuredProfile(candidateProfile: CandidateProfile | null): StructuredProfile {
  const preferences = candidateProfile?.preferences ?? {};
  const constraints = candidateProfile?.constraints ?? {};

  return {
    location: asString(preferences.location ?? ""),
    work_authorization: asString(preferences.work_authorization ?? ""),
    remote_preference: asString(preferences.remote_preference ?? ""),
    role_families: asStringArray(preferences.role_families),
    constraints: {
      location: asString(constraints.location ?? ""),
      relocation: asString(constraints.relocation ?? ""),
      salary_floor: asString(constraints.salary_floor ?? ""),
      notice_period: asString(constraints.notice_period ?? ""),
    },
  };
}

function mergeStructuredAndRawPreferences(structured: StructuredProfile, raw: Record<string, unknown>) {
  return {
    ...raw,
    location: structured.location || undefined,
    work_authorization: structured.work_authorization || undefined,
    remote_preference: structured.remote_preference || undefined,
    role_families: parseCommaList(structured.role_families),
  };
}

function mergeStructuredAndRawConstraints(structured: StructuredProfile, raw: Record<string, unknown>) {
  return {
    ...raw,
    location: structured.constraints.location || undefined,
    relocation: structured.constraints.relocation || undefined,
    salary_floor: structured.constraints.salary_floor || undefined,
    notice_period: structured.constraints.notice_period || undefined,
  };
}

function summarizeProfilePreferences(structured: StructuredProfile, raw: Record<string, unknown>) {
  const items = [
    structured.location && `Location: ${structured.location}`,
    structured.remote_preference && `Remote: ${formatOptionLabel(structured.remote_preference)}`,
    structured.work_authorization && `Authorization: ${formatOptionLabel(structured.work_authorization)}`,
    structured.role_families && `Role families: ${structured.role_families}`,
  ].filter(Boolean) as string[];

  const extras = Object.entries(raw)
    .filter(([key]) => !["location", "work_authorization", "remote_preference", "role_families"].includes(key))
    .slice(0, 3)
    .map(([key, value]) => `${formatKeyLabel(key)}: ${formatValue(value)}`);

  return [...items, ...extras];
}

function summarizeProfileConstraints(structured: StructuredProfile, raw: Record<string, unknown>) {
  const items = [
    structured.constraints.location && `Location: ${structured.constraints.location}`,
    structured.constraints.relocation && `Relocation: ${formatOptionLabel(structured.constraints.relocation)}`,
    structured.constraints.salary_floor && `Minimum salary: ${structured.constraints.salary_floor}`,
    structured.constraints.notice_period && `Notice period: ${structured.constraints.notice_period}`,
  ].filter(Boolean) as string[];

  const extras = Object.entries(raw)
    .filter(([key]) => !["location", "relocation", "salary_floor", "notice_period"].includes(key))
    .slice(0, 3)
    .map(([key, value]) => `${formatKeyLabel(key)}: ${formatValue(value)}`);

  return [...items, ...extras];
}

function countFilledStructuredPreferences(structured: StructuredProfile) {
  return [structured.location, structured.remote_preference, structured.work_authorization, structured.role_families].filter(Boolean)
    .length;
}

function countFilledStructuredConstraints(structured: StructuredProfile) {
  return [
    structured.constraints.location,
    structured.constraints.relocation,
    structured.constraints.salary_floor,
    structured.constraints.notice_period,
  ].filter(Boolean).length;
}

function parseCommaList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function asString(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  return "";
}

function asStringArray(value: unknown) {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join(", ");
  return "";
}

function formatOptionLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatKeyLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "");
}

function PreferencePanel({
  title,
  icon,
  summary,
  children,
  tone = "default",
}: {
  title: string;
  icon: React.ReactNode;
  summary: string[];
  children: React.ReactNode;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-card/50 p-4">
      <div className="flex items-start gap-3">
        <div
          className={
            tone === "warning"
              ? "mt-0.5 rounded-md border border-amber-400/25 bg-amber-400/10 p-2 text-amber-200"
              : "mt-0.5 rounded-md border border-border/70 bg-muted/50 p-2 text-cyan-200"
          }
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">
                {tone === "warning"
                  ? "Hard limits that should stay explicit."
                  : "Soft signals that help ranking and filtering."}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.length ? summary.map((item) => <Badge key={item} variant="outline">{item}</Badge>) : <Badge variant="outline">No structured values yet</Badge>}
          </div>
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SummaryBlock({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
}) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.map((item) => (
            <div key={item} className="text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Nothing structured yet.</div>
        )}
      </div>
    </div>
  );
}
