import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
    roleId?: string;
    permissions?: string[];
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      role: string;
      roleId: string;
      permissions: string[];
    };
  }
}

// Generic action response type
export type ActionResponse<T = void> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

// Pagination
export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

// Navigation tree node
export type NavTreeNode = {
  id: string;
  label: string;
  type: string;
  url: string | null;
  pageId: string | null;
  categoryId: string | null;
  sortOrder: number;
  location: string;
  isActive: boolean;
  openInNewTab: boolean;
  page?: { title: string; slug: string } | null;
  category?: { name: string; slug: string } | null;
  children: NavTreeNode[];
};
