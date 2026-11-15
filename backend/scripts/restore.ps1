param(
  [Parameter(Mandatory = $true)]
  [string]$BackupPath,
  [switch]$DropExisting
)

$ErrorActionPreference = 'Stop'

if (-not $env:MONGO_URI) {
  throw 'Set MONGO_URI in the environment before restoring a backup.'
}

$mongoRestore = Get-Command mongorestore -ErrorAction SilentlyContinue
if (-not $mongoRestore) {
  throw 'MongoDB Database Tools are required; mongorestore was not found on PATH.'
}

if (-not (Test-Path -LiteralPath $BackupPath -PathType Container)) {
  throw 'BackupPath must point to an existing mongodump directory.'
}

$resolvedBackupPath = (Resolve-Path -LiteralPath $BackupPath).Path
$restoreArguments = @('--uri', $env:MONGO_URI)
if ($DropExisting) {
  if ($env:ALLOW_DATABASE_RESTORE_DROP -ne 'true') {
    throw "Dropping existing collections requires ALLOW_DATABASE_RESTORE_DROP='true'."
  }
  $confirmation = Read-Host "Type 'RESTORE AND DROP EXISTING DATA' to continue"
  if ($confirmation -cne 'RESTORE AND DROP EXISTING DATA') {
    throw 'Restore cancelled; confirmation phrase did not match.'
  }
  $restoreArguments += '--drop'
}
$restoreArguments += $resolvedBackupPath

& $mongoRestore.Source @restoreArguments
if ($LASTEXITCODE -ne 0) {
  throw "mongorestore failed with exit code $LASTEXITCODE."
}

Write-Output "Database restore completed from $resolvedBackupPath"
