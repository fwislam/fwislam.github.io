#!/usr/bin/env python3
"""
Simple HTTP server for Strategic Execution Assistant
Run this to serve the app locally with auto-refresh on file changes
"""

import http.server
import socketserver
import os
import sys

PORT = 8000

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Disable caching so changes show immediately
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

    def log_message(self, format, *args):
        # Custom log format
        print(f"[{self.log_date_time_string()}] {format % args}")

def run_server():
    # Change to the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    # Get local IP address
    import socket
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    
    with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
        print("=" * 60)
        print("🎯 Strategic Execution Assistant - Development Server")
        print("=" * 60)
        print(f"\n✅ Server running on port {PORT}")
        print(f"📁 Serving files from: {os.getcwd()}")
        print("\n🌐 Access URLs:")
        print(f"   Local:   http://localhost:{PORT}")
        print(f"   Network: http://{local_ip}:{PORT}")
        print("\n💡 Tips:")
        print("   - Use 'Local' URL on this computer")
        print("   - Share 'Network' URL with others on same WiFi")
        print("   - Press Ctrl+C to stop the server")
        print("   - Refresh browser (Cmd+R / Ctrl+R) to see changes")
        print("\n" + "=" * 60 + "\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    run_server()
