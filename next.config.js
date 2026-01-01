/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // セキュリティ: 環境変数のクライアント側への露出を防止
  env: {
    // クライアント側に公開する必要がある環境変数のみここに記載
    // NOTION_API_KEY と NOTION_DATABASE_ID はサーバーサイドのみで使用
  },
  // セキュリティ: レスポンスヘッダーの設定
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig

