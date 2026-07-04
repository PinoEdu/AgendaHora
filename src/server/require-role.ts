import { AppError } from "./errors"

type UserWithRole = {
  role: string
}

export function requireRole<TUser extends UserWithRole>(
  user: TUser,
  allowedRoles: string[],
): TUser {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError("You do not have permission to perform this action.", "FORBIDDEN")
  }

  return user
}
