$src = $PSScriptRoot
$desktopPath = [Environment]::GetFolderPath('Desktop')
$desktop = Join-Path $desktopPath "nj-business-budget-v1"
$zipScratch = Join-Path (Split-Path $src -Parent) "NJ_Business_Budget_v1.2.4.zip"
$zipDesktop = Join-Path $desktopPath "NJ_Business_Budget_v1.2.4.zip"

if (-not (Test-Path $desktop)) {
    New-Item -ItemType Directory -Path $desktop -Force | Out-Null
}

# Copy files to Desktop
Copy-Item -Path (Join-Path $src "*") -Destination $desktop -Recurse -Force

# Create ZIP archive in scratch
if (Test-Path $zipScratch) {
    Remove-Item $zipScratch -Force
}
Compress-Archive -Path (Join-Path $src "*") -DestinationPath $zipScratch -Force

# Copy ZIP to Desktop
Copy-Item -Path $zipScratch -Destination $zipDesktop -Force

Write-Host "SYNC_AND_ZIP_COMPLETED_SUCCESSFULLY"
Write-Host "Scratch ZIP: $zipScratch"
Write-Host "Desktop ZIP: $zipDesktop"
