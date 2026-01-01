import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/lib/types";

// POST: 画像をアップロード
// 注意: Notion APIは直接Base64アップロードをサポートしていないため、
// ここではBase64データをData URLとして返します
// 将来的にCloudinaryなどの外部ストレージに移行することを推奨します
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData, fileName } = body;

    if (!imageData || typeof imageData !== "string") {
      const response: ApiResponse<null> = {
        success: false,
        error: "画像データが必要です",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Base64データがData URL形式か確認
    // 形式: data:image/jpeg;base64,/9j/4AAQSkZJRg...
    if (!imageData.startsWith("data:image/")) {
      const response: ApiResponse<null> = {
        success: false,
        error: "無効な画像形式です",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // サイズチェック（10MB制限）
    // Base64エンコードされたデータは元のサイズの約1.33倍になる
    const base64Data = imageData.split(",")[1] || "";
    const sizeInBytes = (base64Data.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 10) {
      const response: ApiResponse<null> = {
        success: false,
        error: "画像サイズが10MBを超えています。リサイズしてください。",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 現在はData URLをそのまま返す
    // NotionのFilesプロパティにData URLを設定することはできないため、
    // 実際のプロダクションではCloudinaryなどの外部ストレージを使用する必要があります
    const response: ApiResponse<{ url: string }> = {
      success: true,
      data: {
        url: imageData, // 実際にはCloudinary URLなどを返す
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    const response: ApiResponse<null> = {
      success: false,
      error: error.message || "画像のアップロードに失敗しました",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

