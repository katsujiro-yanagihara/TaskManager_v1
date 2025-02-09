import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">      {/* enからjaに変更 */}
      <Head>
        <meta name="google" content="notranslate" />  {/* この1行を追加 */}
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}