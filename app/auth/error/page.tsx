"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

// エラーメッセージを表示するコンポーネント
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "認証設定に問題があります。管理者にお問い合わせください。";
      case "AccessDenied":
        return "アクセスが拒否されました。";
      case "Verification":
        return "認証トークンの検証に失敗しました。";
      default:
        return "認証中にエラーが発生しました。もう一度お試しください。";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          認証エラー
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          {getErrorMessage(error)}
        </p>
        <div className="flex gap-4">
          <Link
            href="/auth/signin"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
          >
            再度ログイン
          </Link>
          <Link
            href="/"
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

// 認証エラーページ
export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            認証エラー
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            読み込み中...
          </p>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

