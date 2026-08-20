import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password);

        // 1. Fetch user from Supabase
        const { data: user, error: userError } = await supabaseAdmin
          .from("User")
          .select("id, name, email, password, avatar, roleId")
          .eq("email", email)
          .maybeSingle();

        if (userError || !user) {
          console.error("Auth: User not found or DB error:", userError);
          return null;
        }

        // 2. Verify password with bcrypt
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
          console.error("Auth: Invalid password for", email);
          return null;
        }

        // 3. Fetch user role
        let roleName = "Super Admin";
        let permissions: string[] = [];

        if (user.roleId) {
          const { data: role } = await supabaseAdmin
            .from("Role")
            .select("id, name")
            .eq("id", user.roleId)
            .maybeSingle();

          if (role?.name) {
            roleName = role.name;
          }
        }

        // 4. If Super Admin, grant all permissions
        if (roleName === "Super Admin") {
          permissions = [
            "page.create", "page.read", "page.update", "page.delete",
            "article.create", "article.read", "article.update", "article.delete",
            "category.create", "category.read", "category.update", "category.delete",
            "navigation.create", "navigation.read", "navigation.update", "navigation.delete",
            "appearance.create", "appearance.read", "appearance.update", "appearance.delete",
            "user.create", "user.read", "user.update", "user.delete",
            "role.create", "role.read", "role.update", "role.delete",
            "settings.read", "settings.update"
          ];
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: roleName,
          roleId: user.roleId,
          permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.roleId = (user as any).roleId;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        (session.user as any).roleId = token.roleId;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "bias-ristek-super-secret-key-2026",
});

/**
 * Check if the current user has a specific permission
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  const userRole = (session.user as any).role;
  if (userRole === "Super Admin") return true;
  const perms = (session.user as any).permissions as string[];
  return Array.isArray(perms) && perms.includes(permission);
}

/**
 * Get current session or throw unauthorized
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

/**
 * Require a specific permission or throw
 */
export async function requirePermission(permission: string) {
  const session = await requireAuth();
  const allowed = await hasPermission(permission);
  if (!allowed) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return session;
}
