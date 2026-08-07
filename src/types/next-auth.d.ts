import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "BUYER" | "FREELANCER" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "BUYER" | "FREELANCER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "BUYER" | "FREELANCER" | "ADMIN";
  }
}
