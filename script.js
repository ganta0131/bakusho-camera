const apiKey = AIzaSyB1UWnMTj-tbBzHYO6iaKtWOW2ZZ-lsgMM;

// モバイルデバイスのチェック
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const comment = document.getElementById("comment");
const shootBtn = document.getElementById("shootBtn");

// カメラ起動
async function startCamera() {
  try {
    if (window.location.protocol !== 'https:') {
      alert('このアプリケーションはHTTPS（https://）でアクセスする必要があります。');
      return;
    }

    // モバイルデバイス用の設定
    const constraints = {
      video: {
        facingMode: 'user',
        width: isMobile ? { ideal: 640 } : { ideal: 1280 },
        height: isMobile ? { ideal: 480 } : { ideal: 720 }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    
    // モバイルデバイスの場合は、カメラの向きを自動調整
    if (isMobile) {
      video.style.transform = 'rotate(90deg)';
      video.style.width = '100vh';
      video.style.height = '100vw';
      video.style.marginTop = 'calc(-50vh + 50vw)';
    }

    shootBtn.disabled = false;
    shootBtn.textContent = '📸 撮影してAIコメント';
    
  } catch (err) {
    console.error('カメラ起動エラー:', err);
    alert('カメラにアクセスできません。以下のことを確認してください：\n\n1. HTTPSでアクセスしていますか？\n2. ブラウザの設定でカメラのアクセスを許可していますか？\n3. ブラウザのバージョンは最新ですか？');
  }
}

// ボタンのクリックイベント
shootBtn.addEventListener('click', async () => {
  try {
    shootBtn.disabled = true;
    shootBtn.textContent = '📸 撮影中...';

    // カメラが起動していない場合は起動
    if (!video.srcObject) {
      await startCamera();
    }

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg");

    const prompt = `あなたは、どんな画像を見ても爆笑しながら、その魅力を全力でほめまくる面白AIです。

以下の画像を見て、子供が聞いて嬉しくなるような面白くてポジティブなコメントを1つ作ってください。

・テンションは高め！
・口調はフレンドリーで、元気いっぱい。
・10秒くらいしゃべる長さでOK。
・被写体が顔とは限らないので、ポーズ・アイテム・雰囲気・想像からでも自由に褒めてOK。
・たとえば「ぎゃはは！なんてすごい構図！まるで冒険映画のワンシーンだよ！君の発想力、マジで天才的！」みたいに、爆笑しながら褒めてください。

↓この画像です：`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: imageDataUrl.split(",")[1] } }
          ]
        }]
      })
    });

    const data = await res.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "うわあ！なんてすごいんだ！爆笑したよ！";

    comment.textContent = aiText;

    const msg = new SpeechSynthesisUtterance(aiText);
    msg.lang = "ja-JP";
    msg.pitch = 2.0;
    msg.rate = 1.0;
    speechSynthesis.speak(msg);

    photo.src = imageDataUrl;
    shootBtn.textContent = '📸 撮影してAIコメント';
    shootBtn.disabled = false;

  } catch (error) {
    console.error('撮影エラー:', error);
    alert('撮影中にエラーが発生しました。もう一度お試しください。');
    shootBtn.textContent = '📸 撮影してAIコメント';
    shootBtn.disabled = false;
  }
});

// ページ読み込み時にカメラを起動
window.addEventListener('load', startCamera);
