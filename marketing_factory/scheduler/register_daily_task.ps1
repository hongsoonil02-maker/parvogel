# PowerShell script to register Parvogel Daily Marketing Factory Task

$TaskName = "Parvogel_Daily_Marketing_Factory"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$BatPath = Join-Path $ScriptDir "run_marketing_factory.bat"
$Action = New-ScheduledTaskAction -Execute $BatPath -WorkingDirectory $ScriptDir
$Trigger = New-ScheduledTaskTrigger -Daily -At 07:00

# StartWhenAvailable=$true: If PC was off at 7:00 AM, runs automatically upon power on
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable:$true -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -WakeToRun

# Unregister existing task if present
Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

# Register task — 기본 비활성화(Disabled)로 등록해 GitHub Actions와 이중 실행 방지. 필요 시 Task Scheduler에서 수동 Enable.
Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Daily Parvogel Marketing Content & Video Factory at 07:00 AM. Disabled by default to avoid duplicate with GitHub Actions (enable manually if needed)."
Disable-ScheduledTask -TaskName $TaskName | Out-Null

Write-Host "✅ Scheduled Task '$TaskName' registered successfully!"
Write-Host "📅 Trigger: Daily at 07:00 AM"
Write-Host "💡 If the computer is OFF at 07:00 AM, it will automatically execute as soon as the PC is turned ON."
