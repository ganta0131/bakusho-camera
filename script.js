const apiKey = AIzaSyB1UWnMTj-tbBzHYO6iaKtWOW2ZZ-lsgMM;

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const photo = document.getElementById("photo");
const comment = document.getElementById("comment");

// カメラ起動
if (window.location.protocol !== 'https:') {
  alert('このアプリケーションはHTTPS（https://）でアクセスする必要があります。');
  return;
}

// モバイルデバイスのカメラ設定
const constraints = {
  video: {
    facingMode: 'user',  // フロントカメラを使用
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: { ideal: 1.3333333333333333 }
  }
};

navigator.mediaDevices.getUserMedia(constraints).then(stream => {
  video.srcObject = stream;
  video.play();
  
  // ビデオの向きを自動調整
  const handleOrientation = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = width < height;
    
    video.style.transform = isPortrait ? 'rotate(90deg)' : 'rotate(0deg)';
    video.style.width = isPortrait ? '100vh' : '100vw';
    video.style.height = isPortrait ? '100vw' : '100vh';
    video.style.marginTop = isPortrait ? 'calc(-50vh + 50vw)' : '0';
    video.style.marginLeft = isPortrait ? '0' : 'calc(-50vw + 50vh)';
  };
  
  // オリエンテーションの変更を監視
  window.addEventListener('orientationchange', handleOrientation);
  handleOrientation();  // 初期設定
  
  document.getElementById('shootBtn').disabled = false;
}).catch(err => {
  const errorMessage = err.message || 'カメラにアクセスできません。';
  alert(`エラーが発生しました: ${errorMessage}`);
  console.error('カメラエラー:', err);
});

document.getElementById("shootBtn").onclick = async () => {
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
};
