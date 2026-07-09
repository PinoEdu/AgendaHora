export type PasswordRule = {
  errorMessage: string
  id: string
  label: string
  validate: (password: string) => boolean
}

export const passwordRules: PasswordRule[] = [
  {
    errorMessage: "La contraseña debe tener al menos 8 caracteres.",
    id: "length",
    label: "Al menos 8 caracteres",
    validate: (password) => password.length >= 8,
  },
  {
    errorMessage: "La contraseña debe incluir al menos una mayúscula.",
    id: "uppercase",
    label: "Una letra mayúscula",
    validate: (password) => /[A-Z]/.test(password),
  },
  {
    errorMessage: "La contraseña debe incluir al menos un número.",
    id: "number",
    label: "Un número",
    validate: (password) => /[0-9]/.test(password),
  },
  {
    errorMessage: "La contraseña debe incluir al menos un carácter especial.",
    id: "special",
    label: "Un carácter especial",
    validate: (password) => /[^A-Za-z0-9]/.test(password),
  },
]

export function getPasswordRuleStates(password: string) {
  return passwordRules.map((rule) => ({
    ...rule,
    isMet: rule.validate(password),
  }))
}
