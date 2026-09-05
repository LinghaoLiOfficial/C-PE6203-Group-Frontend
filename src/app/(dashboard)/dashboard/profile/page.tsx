"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/auth/AuthProvider";
import { updateMe, updateMeProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProfileEditor
      key={user.id}
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
      onSaved={refreshUser}
    />
  );
}

function ProfileEditor({
  user,
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
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(user);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
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
      toast.success("Profile updated");
      await onSaved();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    }
  };

  const update = (key: keyof typeof form, value: string | number) =>
    setForm((state) => ({ ...state, [key]: value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ["username", "Username", "text"],
            ["display_name", "Display name", "text"],
            ["first_name", "First name", "text"],
            ["last_name", "Last name", "text"],
            ["current_company", "Current company", "text"],
            ["headline", "Headline", "text"],
            ["employment_status", "Employment status", "text"],
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
          <div className="md:col-span-2">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
