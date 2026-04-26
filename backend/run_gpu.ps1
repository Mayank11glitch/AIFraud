$action = $args[0]
$scriptDir = $PSScriptRoot
$venvPath = Join-Path $scriptDir "venv_gpu\Scripts\Activate.ps1"

# Anchoring execution to the backend directory
Push-Location $scriptDir

# Check if venv_gpu exists
if (!(Test-Path $venvPath)) {
    Write-Host "Critical Error: GPU Virtual Environment Not Found at $venvPath" -ForegroundColor Red
    Write-Host "Please ensure you are running this from the backend folder or project root." -ForegroundColor Yellow
    Pop-Location
    exit
}

if ($action -eq "bench") {
    Write-Host "Running GPU Speed Test..." -ForegroundColor Cyan
    & $venvPath
    $start = Get-Date
    python -c "from services.scam_detection import process_text; res = process_text('URGENT: Your HDFC kyc is pending. Click bit.ly/fake-link to update.')"
    $end = Get-Date
    $diff = $end - $start
    Write-Host "GPU Text Scan Time: $($diff.TotalSeconds) seconds" -ForegroundColor Green
}
elseif ($action -eq "train") {
    Write-Host "Starting Full-Scale Text Model Retraining (GPU Accelerated)..." -ForegroundColor Yellow
    & $venvPath
    python train_scam_classifier.py
}
elseif ($action -eq "url-train") {
    Write-Host "Starting Full-Scale URL Model Training (GPU Accelerated)..." -ForegroundColor Magenta
    & $venvPath
    python train_url_classifier.py
}
elseif ($action -eq "global-test") {
    Write-Host "Running Global System Verification (GPU Active)..." -ForegroundColor Green
    & $venvPath
    $text = "URGENT: Your SBI netbanking account is suspended. Click http://sbi-verify-kyc.xyz to reactivate."
    Write-Host "`nTest Case: Phishing Content + Phishing URL" -ForegroundColor Yellow
    python -c "from services.scam_detection import process_text, process_url; t_res = process_text('$text'); u_res = process_url('http://sbi-verify-kyc.xyz'); print(f'Text Risk: {t_res.risk_score}%'); print(f'URL Risk: {u_res.risk_score}%')"
}
else {
    Write-Host "Starting ScamDetect Backend (GPU Mode)..." -ForegroundColor Cyan
    & $venvPath
    # Using uvicorn directly for better reload and host management
    uvicorn main:app --host 0.0.0.0 --port 8000
}

Pop-Location
