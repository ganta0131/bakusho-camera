import { google } from '@google-cloud/text-to-speech';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const { text } = req.body;
  if (!text) return res.status(400).send('Missing text');

  try {
    const client = new google.texttospeech.v1.TextToSpeechClient({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON),
    });

    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-D',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 10,
        speakingRate: 1.4,
        volumeGainDb: 4.0,
      },
    });

    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(response.audioContent, 'base64'));
  } catch (err) {
    console.error('TTSエラー:', err);
    res.status(500).send('TTS error');
  }
}
