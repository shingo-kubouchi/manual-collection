import { Client } from "@notionhq/client";
import { Manual, NotionPageResponse } from "./types";

// Notionクライアントの初期化
// 環境変数からAPI KeyとデータベースIDを取得
const NOTION_API_KEY = process.env.NOTION_API_KEY;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// 環境変数の検証
if (!NOTION_API_KEY) {
  throw new Error(
    "NOTION_API_KEYが設定されていません。.env.localファイルにNOTION_API_KEYを設定してください。"
  );
}

if (!DATABASE_ID) {
  throw new Error(
    "NOTION_DATABASE_IDが設定されていません。.env.localファイルにNOTION_DATABASE_IDを設定してください。"
  );
}

const notion = new Client({
  auth: NOTION_API_KEY,
});

// DATABASE_IDは検証済みなので、型アサーションを使用
// 余分なスペースを削除（ハイフンはそのまま保持 - Notion APIはハイフンありの形式も受け付ける）
const DATABASE_ID_STRING = (DATABASE_ID as string).trim();

// データベースIDのキャッシュ（初回取得時に保存）
let cachedDatabaseId: string | null = null;

// Notionのプロパティタイプを型安全に扱うためのヘルパー関数

// Titleプロパティから文字列を取得
function getTitle(property: any): string {
  if (property?.title && Array.isArray(property.title) && property.title.length > 0) {
    return property.title[0].plain_text;
  }
  return "";
}

// URLプロパティから文字列を取得
function getUrl(property: any): string | undefined {
  if (property?.url) {
    return property.url;
  }
  return undefined;
}

// FilesプロパティからURL配列を取得
function getFiles(property: any): string[] {
  if (property?.files && Array.isArray(property.files)) {
    return property.files.map((file: any) => file.file?.url || file.external?.url || "").filter(Boolean);
  }
  return [];
}

// Dateプロパティから日付文字列を取得
function getDate(property: any): string | undefined {
  if (property?.date?.start) {
    return property.date.start;
  }
  return undefined;
}

// Select/Multi-selectプロパティから文字列を取得
function getSelect(property: any): string | undefined {
  // Selectタイプの場合
  if (property?.select?.name) {
    return property.select.name;
  }
  // Multi-selectタイプの場合（最初の選択肢を返す）
  if (property?.multi_select && Array.isArray(property.multi_select) && property.multi_select.length > 0) {
    return property.multi_select[0].name;
  }
  return undefined;
}

// NotionページをManual型に変換
function convertNotionPageToManual(page: NotionPageResponse): Manual {
  const properties = page.properties;

  return {
    id: page.id,
    製品名: getTitle(properties["製品名"] || properties["Name"] || properties["名前"]),
    説明書URL: getUrl(properties["説明書URL"] || properties["URL"] || properties["説明書url"]),
    説明書画像: getFiles(properties["説明書画像"] || properties["画像"] || properties["Image"]),
    購入日: getDate(properties["購入日"] || properties["Purchase Date"] || properties["購入日時"]),
    カテゴリ: getSelect(properties["カテゴリ"] || properties["Category"] || properties["カテゴリー"]),
    作成日: page.created_time,
    更新日: page.last_edited_time,
  };
}

// データベースIDを取得する関数（初回のみ実行、以降はキャッシュを使用）
async function getActualDatabaseId(): Promise<string> {
  // キャッシュがあればそれを返す
  if (cachedDatabaseId) {
    return cachedDatabaseId;
  }

  const pageId = DATABASE_ID_STRING;

  try {
    // 1. まずデータベースとして直接取得を試みる（最も効率的）
    const dbResponse = await fetch(`https://api.notion.com/v1/databases/${pageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (dbResponse.ok) {
      const database = await dbResponse.json();
      if (database.object === 'database') {
        cachedDatabaseId = database.id;
        return cachedDatabaseId as string;
      }
    }

    // 2. ページとして取得を試みる（インラインデータベースの場合）
    const pageResponse = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
      },
    });

    if (pageResponse.ok) {
      const page = await pageResponse.json();
      
      // ページがデータベースページの場合
      if (page.parent?.type === 'database_id') {
        cachedDatabaseId = page.parent.database_id;
        return cachedDatabaseId as string;
      }

      // インラインデータベースの場合、子ブロックから取得
      const blocksResponse = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
        },
      });

      if (blocksResponse.ok) {
        const blocks = await blocksResponse.json();
        
        // 子ブロックからデータベースを探す
        for (const block of blocks.results) {
          if (block.type === 'child_database') {
            cachedDatabaseId = block.id;
            return cachedDatabaseId as string;
          }
        }
      }
    }
    
    throw new Error('データベースIDを取得できませんでした。ページIDが正しいか、Integrationがデータベースに接続されているか確認してください。');
  } catch (error: any) {
    console.error('Error getting database ID:', error);
    throw error;
  }
}

// すべての説明書を取得
export async function getAllManuals(): Promise<Manual[]> {
  try {
    // データベースIDを取得（初回のみ、以降はキャッシュを使用）
    const actualDatabaseId = await getActualDatabaseId();
    
    // データベースをクエリ
    const response = await fetch(`https://api.notion.com/v1/databases/${actualDatabaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: "作成日",
            direction: "descending",
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data.results.map((page: any) => convertNotionPageToManual(page));
  } catch (error: any) {
    console.error("Error fetching manuals:", error);
    
    // より詳細なエラーメッセージを提供
    if (error?.code === "unauthorized") {
      throw new Error(
        "Notion API認証エラー: API Keyが無効です。.env.localファイルのNOTION_API_KEYを確認してください。"
      );
    }
    if (error?.code === "object_not_found") {
      throw new Error(
        "Notionデータベースが見つかりません。.env.localファイルのNOTION_DATABASE_IDと、Integrationがデータベースに接続されているか確認してください。"
      );
    }
    
    throw new Error(
      `説明書の取得に失敗しました: ${error?.message || "不明なエラー"}`
    );
  }
}

// IDで説明書を取得
export async function getManualById(id: string): Promise<Manual> {
  try {
    const page = await notion.pages.retrieve({ page_id: id });
    return convertNotionPageToManual(page as NotionPageResponse);
  } catch (error: any) {
    console.error("Error fetching manual:", error);
    
    // より詳細なエラーメッセージを提供
    if (error?.code === "unauthorized") {
      throw new Error(
        "Notion API認証エラー: API Keyが無効です。.env.localファイルのNOTION_API_KEYを確認してください。"
      );
    }
    
    throw new Error(
      `説明書の取得に失敗しました: ${error?.message || "不明なエラー"}`
    );
  }
}

// 説明書を作成
export async function createManual(data: {
  製品名: string;
  説明書URL?: string;
  説明書画像?: string[]; // アップロード済みの画像URL
  購入日?: string;
  カテゴリ?: string;
}): Promise<Manual> {
  try {
    // データベースIDを取得（初回のみ、以降はキャッシュを使用）
    const actualDatabaseId = await getActualDatabaseId();
    
    const properties: any = {
      "製品名": {
        title: [
          {
            text: {
              content: data.製品名,
            },
          },
        ],
      },
    };

    // URLがある場合は追加
    if (data.説明書URL) {
      properties["説明書URL"] = {
        url: data.説明書URL,
      };
    }

    // 画像がある場合は追加
    if (data.説明書画像 && data.説明書画像.length > 0) {
      properties["説明書画像"] = {
        files: data.説明書画像.map((url) => ({
          name: "説明書画像",
          external: {
            url: url,
          },
        })),
      };
    }

    // 購入日がある場合は追加
    if (data.購入日) {
      properties["購入日"] = {
        date: {
          start: data.購入日,
        },
      };
    }

    // カテゴリがある場合は追加
    // Notionのデータベースでmulti_selectとして設定されている場合は、multi_selectを使用
    if (data.カテゴリ) {
      properties["カテゴリ"] = {
        multi_select: [
          {
            name: data.カテゴリ,
          },
        ],
      };
    }

    const page = await notion.pages.create({
      parent: {
        database_id: actualDatabaseId,
      },
      properties,
    });

    return convertNotionPageToManual(page as NotionPageResponse);
  } catch (error: any) {
    console.error("Error creating manual:", error);
    
    // より詳細なエラーメッセージを提供
    if (error?.code === "unauthorized") {
      throw new Error(
        "Notion API認証エラー: API Keyが無効です。.env.localファイルのNOTION_API_KEYを確認してください。"
      );
    }
    if (error?.code === "object_not_found") {
      throw new Error(
        "Notionデータベースが見つかりません。.env.localファイルのNOTION_DATABASE_IDと、Integrationがデータベースに接続されているか確認してください。"
      );
    }
    
    throw new Error(
      `説明書の作成に失敗しました: ${error?.message || "不明なエラー"}`
    );
  }
}

// 説明書を更新
export async function updateManual(
  id: string,
  data: {
    製品名?: string;
    説明書URL?: string;
    説明書画像?: string[];
    購入日?: string;
    カテゴリ?: string;
  }
): Promise<Manual> {
  try {
    const properties: any = {};

    if (data.製品名 !== undefined) {
      properties["製品名"] = {
        title: [
          {
            text: {
              content: data.製品名,
            },
          },
        ],
      };
    }

    if (data.説明書URL !== undefined) {
      properties["説明書URL"] = {
        url: data.説明書URL || null,
      };
    }

    if (data.説明書画像 !== undefined) {
      properties["説明書画像"] = {
        files: data.説明書画像.map((url) => ({
          name: "説明書画像",
          external: {
            url: url,
          },
        })),
      };
    }

    if (data.購入日 !== undefined) {
      properties["購入日"] = {
        date: data.購入日 ? { start: data.購入日 } : null,
      };
    }

    if (data.カテゴリ !== undefined) {
      properties["カテゴリ"] = {
        multi_select: data.カテゴリ ? [{ name: data.カテゴリ }] : [],
      };
    }

    const page = await notion.pages.update({
      page_id: id,
      properties,
    });

    return convertNotionPageToManual(page as NotionPageResponse);
  } catch (error: any) {
    console.error("Error updating manual:", error);
    
    // より詳細なエラーメッセージを提供
    if (error?.code === "unauthorized") {
      throw new Error(
        "Notion API認証エラー: API Keyが無効です。.env.localファイルのNOTION_API_KEYを確認してください。"
      );
    }
    
    throw new Error(
      `説明書の更新に失敗しました: ${error?.message || "不明なエラー"}`
    );
  }
}

// 説明書を削除
export async function deleteManual(id: string): Promise<void> {
  try {
    await notion.pages.update({
      page_id: id,
      archived: true, // Notionでは削除ではなくアーカイブ
    });
  } catch (error: any) {
    console.error("Error deleting manual:", error);
    
    // より詳細なエラーメッセージを提供
    if (error?.code === "unauthorized") {
      throw new Error(
        "Notion API認証エラー: API Keyが無効です。.env.localファイルのNOTION_API_KEYを確認してください。"
      );
    }
    
    throw new Error(
      `説明書の削除に失敗しました: ${error?.message || "不明なエラー"}`
    );
  }
}

// 画像をBase64からNotionにアップロード
// 注意: Notion APIは直接Base64アップロードをサポートしていないため、
// 一時的に外部URLとして保存するか、別のストレージサービスを使用する必要があります
// ここでは、Base64データをData URLとして保存する方法を提供します
export async function uploadImageToNotion(base64Data: string, fileName: string): Promise<string> {
  // Notion APIは直接Base64アップロードをサポートしていないため、
  // 実際の実装では、Cloudinaryなどの外部ストレージを使用することを推奨します
  // ここでは、Data URLとして返します（実際のプロダクションでは変更が必要）
  
  // 将来的にCloudinaryに移行する場合のプレースホルダー
  // const cloudinaryUrl = await uploadToCloudinary(base64Data);
  // return cloudinaryUrl;
  
  // 現在はData URLをそのまま返す（NotionのFilesプロパティに設定可能）
  return base64Data;
}

