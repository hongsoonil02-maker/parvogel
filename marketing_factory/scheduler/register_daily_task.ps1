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

# Register task
Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Daily Parvogel Marketing Content & Video Factory at 07:00 AM. Runs immediately if PC was off."

Write-Host "✅ Scheduled Task '$TaskName' registered successfully!"
Write-Host "📅 Trigger: Daily at 07:00 AM"
Write-Host "💡 If the computer is OFF at 07:00 AM, it will automatically execute as soon as the PC is turned ON."
