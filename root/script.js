const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('captureBtn');
const commentDiv = document.getElementById('comment');
const speakBtn = document.getElementById('speakBtn');

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (e) {
    alert('カメラの起動に失敗しました。許可を確認してください。');
  }
}

function captureImage() {
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL('image/jpeg');
}

async function getGeminiComment(imageBase64) {
  commentDiv.textContent = '爆笑コメント生成中…少し待ってね';

  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
    });
    const data = await res.json();
    if (data.comment) {
      commentDiv.textContent = data.comment;
      speakBtn.style.display = 'inline-block';
    } else {
      commentDiv.textContent = 'コメントの取得に失敗しました。';
      speakBtn.style.display = 'none';
    }
  } catch {
    commentDiv.textContent = 'サーバー通信に失敗しました。';
    speakBtn.style.display = 'none';
  }
}

async function speakComment() {
  const comment = commentDiv.textContent;
  if (!comment) return;

  try {
    const res = await fetch('/api/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: comment }),
    });
    if (!res.ok) throw new Error('TTSリクエスト失敗');

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch {
    alert('音声再生に失敗しました。');
  }
}

captureBtn.addEventListener('click', async () => {
  const imageBase64 = captureImage();
  await getGeminiComment(imageBase64);
});

speakBtn.addEventListener('click', speakComment);

startCamera();
