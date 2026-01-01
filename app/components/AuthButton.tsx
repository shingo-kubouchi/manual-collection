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
      <div className="px-4 py-2 text-gray-600">
        読み込み中...
      </div>
    );
  }

  // ログイン済みの場合
  if (session?.user) {
    return (
      <div className="flex items-center gap-4">
        {/* ユーザー情報 */}
        <div className="flex items-center gap-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-gray-700 hidden sm:inline">
            {session.user.name || session.user.email}
          </span>
        </div>
        {/* ログアウトボタン */}
        <button
          onClick={() => {
            signOut({ callbackUrl: "/" });
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
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
        signIn("google", { callbackUrl: "/" });
      }}
      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
    >
      Googleでログイン
    </button>
  );
}

