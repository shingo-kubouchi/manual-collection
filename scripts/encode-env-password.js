#!/usr/bin/env node

/**
 * .env.localファイルからHASHED_PASSWORDを読み込んでBase64エンコードする
 * 使用方法: node scripts/encode-env-password.js
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('.env.localファイルが見つかりません');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const hashMatch = envContent.match(/HASHED_PASSWORD=["']?([^"'\n]+)["']?/);

if (!hashMatch) {
  console.error('HASHED_PASSWORDが見つかりません');
  process.exit(1);
}

const hashedPassword = hashMatch[1];
const encoded = Buffer.from(hashedPassword, 'utf-8').toString('base64');

console.log("\n✅ Base64エンコードが完了しました\n");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📝 .env.local を以下のように更新してください:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("\n# 既存の HASHED_PASSWORD の行をコメントアウトまたは削除");
console.log("# HASHED_PASSWORD=\"$2b$10$...\"");
console.log("\n# 以下の行を追加");
console.log("HASHED_PASSWORD_B64=" + encoded);
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚠️  注意:");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("• 環境変数を変更した後は、開発サーバーを再起動してください");
console.log("• .next フォルダを削除してから再起動することを推奨します");
console.log("\n");

