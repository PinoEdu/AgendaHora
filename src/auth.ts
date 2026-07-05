import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { loginSchema } from "@/features/auth/auth.validators"
import { validateUserCredentials } from "@/features/auth/auth.service"
import { UserRole } from "@/generated/prisma/enums"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)

        if (!parsedCredentials.success) {
          return null
        }

        const user = await validateUserCredentials(parsedCredentials.data)

        if (!user) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : ""
        session.user.role =
          token.role === UserRole.BUSINESS_OWNER ? UserRole.BUSINESS_OWNER : UserRole.CUSTOMER
      }

      return session
    },
  },
})
