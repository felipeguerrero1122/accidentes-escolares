$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\Felipe\Desktop\accidentes escolares"
$serverPort = 3001
$serverUrl = "http://localhost:$serverPort/login"
$serverScript = Join-Path $projectRoot "scripts\start-server.cmd"
$cloudflaredExe = Join-Path $projectRoot "tools\cloudflared.exe"
$cloudflaredOut = Join-Path $projectRoot "cloudflared.log"
$cloudflaredErr = Join-Path $projectRoot "cloudflared.err.log"
$publicLinkFile = Join-Path $projectRoot "public-link.txt"

function Test-ServerUp {
  try {
    $response = Invoke-WebRequest -UseBasicParsing $serverUrl -TimeoutSec 8
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

if (-not (Test-Path $cloudflaredExe)) {
  throw "No se encontro cloudflared en $cloudflaredExe"
}

if (-not (Test-ServerUp)) {
  Start-Process -FilePath $serverScript -WindowStyle Hidden | Out-Null

  $serverReady = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    if (Test-ServerUp) {
      $serverReady = $true
      break
    }
  }

  if (-not $serverReady) {
    throw "La app no respondio en localhost:$serverPort despues de iniciarla."
  }
}

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item $cloudflaredOut -ErrorAction SilentlyContinue
Remove-Item $cloudflaredErr -ErrorAction SilentlyContinue
Remove-Item $publicLinkFile -ErrorAction SilentlyContinue

Start-Process `
  -FilePath $cloudflaredExe `
  -ArgumentList "tunnel --url http://localhost:$serverPort --no-autoupdate" `
  -RedirectStandardOutput $cloudflaredOut `
  -RedirectStandardError $cloudflaredErr `
  -WindowStyle Hidden | Out-Null

$publicUrl = $null
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 2
  if (Test-Path $cloudflaredErr) {
    $content = Get-Content $cloudflaredErr -Raw -ErrorAction SilentlyContinue
    if ($content) {
      $match = [regex]::Match($content, "https://[-a-z0-9]+\.trycloudflare\.com")
      if ($match.Success) {
        $publicUrl = $match.Value
        break
      }
    }
  }
}

if (-not $publicUrl) {
  throw "No se pudo obtener la URL publica del tunel. Revisa cloudflared.err.log"
}

$publicUrl | Set-Content -Path $publicLinkFile -Encoding utf8
Write-Output ""
Write-Output "Link publico listo:"
Write-Output $publicUrl
Write-Output ""
Write-Output "Tambien quedo guardado en:"
Write-Output $publicLinkFile
