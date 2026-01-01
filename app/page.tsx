"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import ManualList from "./components/ManualList";
import AuthButton from "./components/AuthButton";

// トップページ（一覧ページ）
export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ヘッダー - モダンなガラスモーフィズムデザイン */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📚 説明書管理
            </h1>
            <div className="flex items-center gap-2 sm:gap-3">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ManualList />
      </main>

      {/* フローティングアクションボタン（FAB）- モバイル向け */}
      {session && (
        <Link
          href="/add"
          className="fixed bottom-6 right-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center text-2xl sm:text-3xl font-bold hover:from-blue-600 hover:to-purple-700 active:scale-95"
          aria-label="新規追加"
        >
          <span className="sm:hidden">+</span>
          <span className="hidden sm:inline">+</span>
        </Link>
      )}

      {/* フッター - シンプルに */}
      <footer className="mt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm text-gray-400">
            Powered by Notion API
          </p>
        </div>
      </footer>
    </div>
  );
}

