import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

type KakaoProfile = {
  kakao_account?: {
    email?: string;
  };
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "profile_nickname account_email",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        // 사용자의 크레딧 정보를 세션에 추가
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { credits: true },
        });
        session.user.credits = dbUser?.credits ?? 0;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (!account) {
        return false;
      }

      if (!user.email && account.provider === "kakao") {
        const kakaoProfile = profile as KakaoProfile | undefined;
        user.email = kakaoProfile?.kakao_account?.email;
      }

      if (!user.email) {
        return false;
      }

      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "database",
  },
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          credits: user.credits ?? 3,
        },
      });
    },
  },
};

export default NextAuth(authOptions);
