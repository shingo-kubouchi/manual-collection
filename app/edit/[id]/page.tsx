import { notFound } from "next/navigation";
import Link from "next/link";
import ManualForm from "../../components/ManualForm";
import { getManualById } from "@/lib/notion";

// 説明書編集ページ
export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let manual;
  try {
    manual = await getManualById(id);
  } catch (error) {
    console.error("Error fetching manual:", error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* ヘッダー - モダンなガラスモーフィズムデザイン */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4">
            <Link
              href="/"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600 hover:text-gray-800"
              aria-label="戻る"
            >
              <span className="text-xl">←</span>
            </Link>
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              説明書を編集
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <ManualForm
            initialData={{
              製品名: manual.製品名,
              説明書URL: manual.説明書URL,
              購入日: manual.購入日,
              カテゴリ: manual.カテゴリ,
            }}
            manualId={id}
            existingImages={manual.説明書画像}
          />
        </div>
      </main>
    </div>
  );
}

