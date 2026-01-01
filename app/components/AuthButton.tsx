"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// 認証ボタンコンポーネント
export default function AuthButton() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ローディング中
  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600 hidden sm:inline">読み込み中...</span>
      </div>
    );
  }

  // ログイン済みの場合
  if (session?.user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {/* ユーザー情報 */}
        <div className="flex items-center gap-2">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white shadow-md"
            />
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-md">
              {session.user.name?.[0] || session.user.email?.[0] || "U"}
            </div>
          )}
          <span className="text-xs sm:text-sm text-gray-700 font-medium hidden sm:inline max-w-[120px] truncate">
            {session.user.name || session.user.email}
          </span>
        </div>
        {/* ログアウトボタン */}
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:bg-gray-300 transition-colors text-xs sm:text-sm font-medium shadow-sm"
        >
          ログアウト
        </button>
      </div>
    );
  }

  // 未ログインの場合
  return (
    <button
      onClick={() => {
        // メール/パスワード認証をデフォルトに（Google OAuthも利用可能）
        signIn(undefined, { callbackUrl: "/" });
      }}
      className="px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm font-semibold"
    >
      ログイン
    </button>
  );
}

