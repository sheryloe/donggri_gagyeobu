$ErrorActionPreference = 'Stop'

$startupDir = [Environment]::GetFolderPath('Startup')
$linkPath = Join-Path $startupDir 'donggri-ledger.lnk'

if (Test-Path $linkPath) {
    Remove-Item $linkPath -Force
    Write-Output "Removed startup shortcut: $linkPath"
} else {
    Write-Output "Startup shortcut not found: $linkPath"
}
