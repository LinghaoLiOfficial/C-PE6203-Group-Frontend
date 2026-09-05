export type PasswordRule = {
  id: string;
  label: string;
  valid: boolean;
};

export function getPasswordRules(password: string): PasswordRule[] {
  return [
    { id: "length", label: "At least 8 characters", valid: password.length >= 8 },
    { id: "uppercase", label: "Includes an uppercase letter", valid: /[A-Z]/.test(password) },
    { id: "lowercase", label: "Includes a lowercase letter", valid: /[a-z]/.test(password) },
    { id: "number", label: "Includes a number", valid: /\d/.test(password) },
    {
      id: "special",
      label: "Includes a special character",
      valid: /[^A-Za-z0-9\s]/.test(password),
    },
    { id: "space", label: "Does not contain spaces", valid: !/\s/.test(password) },
  ];
}

export function isStrongPassword(password: string) {
  return getPasswordRules(password).every((rule) => rule.valid);
}
