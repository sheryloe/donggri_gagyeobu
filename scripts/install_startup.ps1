$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$exePath = Join-Path $repoRoot 'dist\donggri-ledger\donggri-ledger.exe'
$startupDir = [Environment]::GetFolderPath('Startup')
$linkPath = Join-Path $startupDir 'donggri-ledger.lnk'

if (-not (Test-Path $exePath)) {
    throw "EXE not found: $exePath`nBuild first: pyinstaller donggri-ledger.spec"
}

$wsh = New-Object -ComObject WScript.Shell
$shortcut = $wsh.CreateShortcut($linkPath)
$shortcut.TargetPath = $exePath
$shortcut.WorkingDirectory = Split-Path -Parent $exePath
$shortcut.WindowStyle = 1
$shortcut.Description = 'Donggri Ledger Web Server (Auto Start)'
$shortcut.Save()

Write-Output "Created startup shortcut: $linkPath"
Write-Output "Target: $exePath"
