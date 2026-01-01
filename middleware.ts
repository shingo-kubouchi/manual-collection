import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// 認証が必要なページを指定
export default withAuth(
  function middleware(req) {
    // 認証が必要なページへのアクセス時の処理
    return NextResponse.next();
  },
  {
    callbacks: {
      // 認証が成功している場合のみアクセスを許可
      authorized: ({ token }) => !!token,
    },
  }
);

// 保護するパスの設定
export const config = {
  matcher: [
    // 以下のパスは認証が必要
    "/add/:path*",
    "/edit/:path*",
    // API Routesは個別に保護（必要に応じて）
    // "/api/manuals/:path*",
  ],
};

