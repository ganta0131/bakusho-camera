export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  const { imageBase64 } = req.body;

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=' + GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'この画像に爆笑コメントをつけてください。ツッコミっぽく、親しみやすく、笑えるようにして！'
                },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/jpeg;base64,/, '')
                  }
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔍 ここが追加されたログ出力（Vercelログで見られる）
    console.log('💬 Gemini full response:', JSON.stringify(data));

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'コメントを生成できませんでした。';
    res.status(200).json({ comment: result });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to fetch comment from Gemini' });
  }
}
