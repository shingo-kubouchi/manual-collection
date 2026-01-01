import { NextRequest, NextResponse } from "next/server";
import { getAllManuals, createManual } from "@/lib/notion";
import { ApiResponse } from "@/lib/types";

// GET: すべての説明書を取得
export async function GET() {
  try {
    const manuals = await getAllManuals();
    const response: ApiResponse<typeof manuals> = {
      success: true,
      data: manuals,
    };
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("API Error:", error);
    
    // セキュリティ: エラーメッセージから機密情報を除外
    let errorMessage = "説明書の取得に失敗しました";
    if (error.message && !error.message.includes("NOTION_API_KEY") && !error.message.includes("DATABASE_ID")) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST: 新しい説明書を作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 製品名, 説明書URL, 説明書画像, 購入日, カテゴリ } = body;

    // バリデーション: 製品名は必須
    if (!製品名 || typeof 製品名 !== "string" || 製品名.trim() === "") {
      const response: ApiResponse<null> = {
        success: false,
        error: "製品名は必須です",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // バリデーション: 製品名の長さ制限（100文字）
    if (製品名.trim().length > 100) {
      const response: ApiResponse<null> = {
        success: false,
        error: "製品名は100文字以内で入力してください",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // バリデーション: URL形式の検証
    if (説明書URL && typeof 説明書URL === "string") {
      try {
        new URL(説明書URL);
      } catch {
        const response: ApiResponse<null> = {
          success: false,
          error: "説明書URLの形式が正しくありません",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // バリデーション: 日付形式の検証（YYYY-MM-DD）
    if (購入日 && typeof 購入日 === "string") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(購入日)) {
        const response: ApiResponse<null> = {
          success: false,
          error: "購入日の形式が正しくありません（YYYY-MM-DD形式で入力してください）",
        };
        return NextResponse.json(response, { status: 400 });
      }
    }

    // バリデーション: 画像数の制限（10枚まで）
    if (説明書画像 && Array.isArray(説明書画像) && 説明書画像.length > 10) {
      const response: ApiResponse<null> = {
        success: false,
        error: "説明書画像は10枚までアップロードできます",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // 説明書を作成
    const manual = await createManual({
      製品名: 製品名.trim(),
      説明書URL,
      説明書画像,
      購入日,
      カテゴリ,
    });

    const response: ApiResponse<typeof manual> = {
      success: true,
      data: manual,
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: any) {
    console.error("API Error:", error);
    
    // セキュリティ: エラーメッセージから機密情報を除外
    let errorMessage = "説明書の作成に失敗しました";
    if (error.message && !error.message.includes("NOTION_API_KEY") && !error.message.includes("DATABASE_ID")) {
      errorMessage = error.message;
    }
    
    const response: ApiResponse<null> = {
      success: false,
      error: errorMessage,
    };
    return NextResponse.json(response, { status: 500 });
  }
}

