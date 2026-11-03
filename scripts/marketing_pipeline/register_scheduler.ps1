<#
.SYNOPSIS
    Registers the Parvogel Multi-Channel Veterinary Marketing Pipeline in Windows Task Scheduler.
.DESCRIPTION
    Schedules run_pipeline.py to execute automatically every Monday at 09:00 AM KST.
#>

param(
    [switch]$LiveMode = $false,
    [string]$TaskName = "Parvogel_Weekly_Marketing_Pipeline"
)

$WorkspaceRoot = "c:\Users\master\parvogel_landing"
$PythonScript = "scripts\marketing_pipeline\run_pipeline.py"
$ArgsString = if ($LiveMode) { "$PythonScript --live --llm" } else { "$PythonScript" }

$Action = New-ScheduledTaskAction `
    -Execute "python.exe" `
    -Argument $ArgsString `
    -WorkingDirectory $WorkspaceRoot

$Trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 9:00AM
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Description "Parvogel Veterinary Content Auto-Generation & Multi-Channel Social Publishing Pipeline" `
    -Force

Write-Host "[+] Successfully registered Windows Scheduled Task: $TaskName" -ForegroundColor Green

