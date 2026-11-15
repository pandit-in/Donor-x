param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '..\backups')
)

$ErrorActionPreference = 'Stop'

if (-not $env:MONGO_URI) {
  throw 'Set MONGO_URI in the environment before running a backup.'
}

$mongoDump = Get-Command mongodump -ErrorAction SilentlyContinue
if (-not $mongoDump) {
  throw 'MongoDB Database Tools are required; mongodump was not found on PATH.'
}

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
$backupPath = Join-Path $resolvedOutput (Get-Date -Format 'yyyyMMdd-HHmmss')
New-Item -ItemType Directory -Path $backupPath -Force | Out-Null

& $mongoDump.Source --uri $env:MONGO_URI --out $backupPath
if ($LASTEXITCODE -ne 0) {
  throw "mongodump failed with exit code $LASTEXITCODE."
}

Write-Output "Database backup created at $backupPath"
