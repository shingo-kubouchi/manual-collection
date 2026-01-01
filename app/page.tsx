"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ManualList from "./components/ManualList";
import AuthButton from "./components/AuthButton";

// トップページ（一覧ページ）
export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              📚 説明書管理
            </h1>
            <div className="flex items-center gap-4">
              {/* ログイン済みの場合のみ新規追加ボタンを表示 */}
              {session && (
                <Link
                  href="/add"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  + 新規追加
                </Link>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ManualList />
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Powered by Notion API
          </p>
        </div>
      </footer>
    </div>
  );
}

