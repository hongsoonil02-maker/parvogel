# PowerShell script to register Parvogel Daily Marketing Factory Task

$TaskName = "Parvogel_Daily_Marketing_Factory"
$ScriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { "C:\Users\master\parvogel_landing\marketing_factory\scheduler" }
$BatPath = Join-Path $ScriptDir "run_marketing_factory.bat"
$Action = New-ScheduledTaskAction -Execute $BatPath -WorkingDirectory $ScriptDir
$Trigger = New-ScheduledTaskTrigger -Daily -At 08:30

# StartWhenAvailable=$true: If PC was off at 8:30 AM, runs automatically upon power on
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

# Unregister existing task if present
Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

# Register task — 매일 아침 08:30 자동 실행 활성화
Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Daily Parvogel Marketing Content & Video Factory & Naver Blog Auto-Publisher"


Write-Host "Scheduled Task '$TaskName' registered and enabled successfully!"
Write-Host "Trigger: Daily at 08:30 AM"
Write-Host "If the computer is OFF at 08:30 AM, it will automatically execute as soon as the PC is turned ON."
