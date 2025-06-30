# 爆笑ほめカメラアプリ

- カメラで撮影し、AIが爆笑コメントを生成して音声で読み上げるアプリです。
- Gemini APIで画像解析し、Google Text-to-Speechで音声合成しています。

---

# デプロイ方法（Vercel）

1. 環境変数 `GOOGLE_APPLICATION_CREDENTIALS_JSON` にGoogleサービスアカウントのJSONを設定
2. `vercel` コマンドでデプロイ
3. Webアプリで動作確認

---

# 注意点

- Gemini API連携部分は擬似コードなので実装が必要です。
- Google Cloud Text-to-SpeechのAPIキーは秘密にしてください。
