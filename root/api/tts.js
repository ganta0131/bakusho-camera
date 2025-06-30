import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const textToSpeech = google.texttospeech({
      version: 'v1',
      auth: client,
    });

    const { text } = req.body;

    const [response] = await textToSpeech.text.synthesize({
      requestBody: {
        input: { text },
        voice: { languageCode: 'ja-JP', name: 'ja-JP-Wavenet-D' },
        audioConfig: {
          audioEncoding: 'MP3',
          pitch: 15,
          speakingRate: 1.4,
          volumeGainDb: 5,
        },
      },
    });

    const audioContent = response.audioContent;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioContent, 'base64'));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'TTS error' });
  }
}
