# PowerShell script to register Parvogel Daily Marketing Factory Task

$TaskName = "Parvogel_Daily_Marketing_Factory"
$BatPath = "C:\Users\master\parvogel_landing\marketing_factory\scheduler\run_marketing_factory.bat"
$WorkingDir = "C:\Users\master\parvogel_landing\marketing_factory\scheduler"

$Action = New-ScheduledTaskAction -Execute $BatPath -WorkingDirectory $WorkingDir
$Trigger = New-ScheduledTaskTrigger -Daily -At 08:30

# StartWhenAvailable=$true: 08:30에 PC가 꺼져 있었더라도 부팅 즉시 1회 자동 실행
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Unregister-ScheduledTask -Confirm:$false

Register-ScheduledTask -Action $Action -Trigger $Trigger -Settings $Settings -TaskName $TaskName -Description "Parvogel Full Marketing Automation: Blog/DocuShorts/NomadRankingShorts"

Write-Host "SUCCESS: Task '$TaskName' registered!"
