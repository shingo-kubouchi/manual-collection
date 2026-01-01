import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 認証が必要なページを保護するミドルウェア
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 認証関連のパスは除外（ログインページや認証API）
  if (
    pathname.startsWith("/auth/") ||
    pathname.startsWith("/api/auth/")
  ) {
    return NextResponse.next();
  }

  // 認証状態を確認
  const session = await auth();

  // 認証されていない場合、ログインページにリダイレクト
  if (!session) {
    const signInUrl = new URL("/auth/signin", req.url);
    // 元のURLをcallbackUrlとして保存（ログイン後に戻れるように）
    signInUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 認証されている場合、そのまま進む
  return NextResponse.next();
}

// 保護するパスの設定
export const config = {
  matcher: [
    /*
     * 以下のパスは認証が必要です
     * - トップページ（一覧画面）
     * - 追加・編集ページ
     * - API Routes（手動で保護する場合はコメントアウトを解除）
     */
    "/",
    "/add/:path*",
    "/edit/:path*",
    // API Routesは個別に保護（必要に応じて）
    // "/api/manuals/:path*",
    /*
     * 以下のパスは認証不要（除外）
     * - /auth/* (ログインページなど)
     * - /api/auth/* (NextAuth.jsの認証エンドポイント)
     */
  ],
};

