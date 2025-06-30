import qrcode
import socket
import webbrowser

# ローカルIPアドレスを取得
hostname = socket.gethostname()
local_ip = socket.gethostbyname(hostname)

# サーバーを起動
print("サーバーを起動します...")
import http.server
import socketserver

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"サーバーが起動しました: http://{local_ip}:{PORT}")
    
    # QRコードを生成
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(f'http://{local_ip}:{PORT}')
    qr.make(fit=True)
    
    # QRコードをPNGファイルとして保存
    img = qr.make_image(fill_color="black", back_color="white")
    img.save('qr_code.png')
    
    print("QRコードが生成されました: qr_code.png")
    print("QRコードをスマートフォンで読み取ってください")
    
    # ブラウザで開く
    webbrowser.open(f'http://{local_ip}:{PORT}')
    
    # サーバーを実行
    httpd.serve_forever()
