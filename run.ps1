# ─────────────────────────────────────────────
# ThinkCanvas — Start all services (Windows)
# ─────────────────────────────────────────────
# Usage:  .\run.ps1 [-SkipMigrate]
# ─────────────────────────────────────────────

param(
    [switch]$SkipMigrate
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "tc-backend"
$FrontendDir = Join-Path $RootDir "tc-frontend"

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         🧠  ThinkCanvas                  ║" -ForegroundColor Cyan
Write-Host "║    Graph-First Node Editor               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── 1. Check prerequisites ───
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Cyan

$nodeVersion = node -v 2>$null
if (-not $nodeVersion) {
    Write-Host "  ✗ Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Node.js $nodeVersion" -ForegroundColor Green

# ─── 2. Install deps ───
Write-Host "[2/4] Checking dependencies..." -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $BackendDir "node_modules"))) {
    Write-Host "  Installing backend deps..."
    Push-Location $BackendDir
    npm install
    Pop-Location
} else {
    Write-Host "  ✓ Backend deps installed" -ForegroundColor Green
}

if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "  Installing frontend deps..."
    Push-Location $FrontendDir
    npm install
    Pop-Location
} else {
    Write-Host "  ✓ Frontend deps installed" -ForegroundColor Green
}

# ─── 3. Database migration ───
if (-not $SkipMigrate) {
    Write-Host "[3/4] Running Prisma migration..." -ForegroundColor Cyan
    Push-Location $BackendDir
    npx prisma migrate dev --name auto 2>&1 | Select-Object -Last 3
    npx prisma generate 2>&1 | Select-Object -Last 1
    Pop-Location
    Write-Host "  ✓ Database migrated" -ForegroundColor Green
} else {
    Write-Host "[3/4] Skipping migration (-SkipMigrate)" -ForegroundColor Cyan
}

# ─── 4. Start services ───
Write-Host "[4/4] Starting services..." -ForegroundColor Cyan

# Start backend
Write-Host "  Starting backend on :3002..."
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:BackendDir
    npm run dev 2>&1
}

Start-Sleep -Seconds 3

# Start frontend
Write-Host "  Starting frontend on :3000..."
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:FrontendDir
    npm run dev 2>&1
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✓ ThinkCanvas is running!" -ForegroundColor Green
Write-Host "══════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:3002" -ForegroundColor Cyan
Write-Host "  Health:    http://localhost:3002/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Wait and stream output
try {
    while ($true) {
        # Show backend output
        $backendOutput = Receive-Job $backendJob 2>$null
        if ($backendOutput) {
            $backendOutput | ForEach-Object { Write-Host "[backend] $_" -ForegroundColor DarkGray }
        }

        # Show frontend output
        $frontendOutput = Receive-Job $frontendJob 2>$null
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object { Write-Host "[frontend] $_" -ForegroundColor DarkGray }
        }

        Start-Sleep -Milliseconds 500
    }
} finally {
    Write-Host ""
    Write-Host "Shutting down..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✓ All services stopped" -ForegroundColor Green
}
