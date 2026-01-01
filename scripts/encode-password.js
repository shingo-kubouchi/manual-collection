#!/usr/bin/env node

/**
 * ハッシュ化されたパスワードをBase64エンコードするヘルパースクリプト
 * Next.jsで$で始まる環境変数が読み込まれない問題を回避するため
 * 使用方法: node scripts/encode-password.js <ハッシュ化されたパスワード>
 */

const passwordHash = process.argv[2];

if (!passwordHash) {
  console.error("使用方法: node scripts/encode-password.js <ハッシュ化されたパスワード>");
  console.error("\n例:");
  console.error('  node scripts/encode-password.js "$2b$10$oBvkUaxYyYrn1f8EJAQ6Kub1Qa1SqPW54q08MvdVyshwCD1af6RtK"');
  process.exit(1);
}

// Base64エンコード
const encoded = Buffer.from(passwordHash, 'utf-8').toString('base64');

console.log("\n✅ Base64エンコードが完了しました\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📝 .env.local に以下を追加または更新:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\nHASHED_PASSWORD_B64=" + encoded);
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚠️  注意:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("• 既存の HASHED_PASSWORD の行は削除またはコメントアウトしてください");
console.log("• 環境変数を変更した後は、開発サーバーを再起動してください");
console.log("\n");

