param(
    [int]$Port = 3000
)

$frontendDir = Join-Path $PSScriptRoot "frontend"
$url = "http://localhost:$Port/"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   HotelBooking - Khởi chạy Website trên cổng Port $Port  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Thư mục web: $frontendDir" -ForegroundColor Gray
Write-Host " Địa chỉ URL: $url" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

# Start native HTTP Listener
$listener = New-Object System.Net.HttpListener
try {
    $listener.Prefixes.Add($url)
    $listener.Start()
} catch {
    Write-Host "[LỖI] Không thể lắng nghe trên cổng $Port (có thể cổng đang được sử dụng)." -ForegroundColor Red
    Write-Host "Hãy thử chạy với cổng khác: .\start-frontend.ps1 -Port 3001" -ForegroundColor Yellow
    exit 1
}

Write-Host ">>> Đang tự động mở trình duyệt web tại $url ..." -ForegroundColor Cyan
Start-Process $url

Write-Host ">>> Máy chủ đang chạy... Nhấn [Ctrl + C] trong cửa sổ này để dừng." -ForegroundColor Green

$mimeTypes = @{
    ".html"  = "text/html; charset=utf-8"
    ".css"   = "text/css; charset=utf-8"
    ".js"    = "application/javascript; charset=utf-8"
    ".json"  = "application/json; charset=utf-8"
    ".png"   = "image/png"
    ".jpg"   = "image/jpeg"
    ".jpeg"  = "image/jpeg"
    ".svg"   = "image/svg+xml"
    ".ico"   = "image/x-icon"
    ".woff2" = "font/woff2"
    ".woff"  = "font/woff"
    ".ttf"   = "font/ttf"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/" -or [string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "/index.html"
        }

        $cleanPath = $localPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $frontendDir $cleanPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            $response.ContentType = $contentType
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.StatusCode = 200
        } else {
            $response.StatusCode = 404
            $notFoundBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $response.OutputStream.Write($notFoundBytes, 0, $notFoundBytes.Length)
        }
        $response.Close()
    }
} catch [System.Net.HttpListenerException] {
    # Normal on abort
} finally {
    if ($listener -and $listener.IsListening) {
        $listener.Stop()
    }
}
