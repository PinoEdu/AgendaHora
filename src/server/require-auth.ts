import { AppError } from "./errors"

export function requireAuth<TUser>(user: TUser | null | undefined): TUser {
  if (!user) {
    throw new AppError("Authentication is required.", "UNAUTHORIZED")
  }

  return user
}
