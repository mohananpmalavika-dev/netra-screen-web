"""
NETRA-SCREEN Web Server
Serves the PWA locally with proper MIME types for WASM and models.
"""
import http.server
import socketserver
import os
import socket

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Allow cross-origin and iframe embedding
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'credentialless')
        super().end_headers()

def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        ip = '127.0.0.1'
    finally:
        s.close()
    return ip

if __name__ == '__main__':
    local_ip = get_ip()
    print("=" * 60)
    print("  NETRA-SCREEN WEB / PWA SERVER RUNNING")
    print(f"  Local URL:    http://localhost:{PORT}")
    print(f"  Local Wi-Fi:  http://{local_ip}:{PORT}")
    print("=" * 60)
    print("  To test on iPhone with Camera:")
    print("  1. In a new terminal, run: npx localtunnel --port 8080")
    print("  2. Open the resulting https://... link in iPhone Safari")
    print("=" * 60)

    server = http.server.ThreadingHTTPServer(("", PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
