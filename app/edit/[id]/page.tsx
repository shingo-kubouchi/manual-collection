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
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← 戻る
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              説明書を編集
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
}

