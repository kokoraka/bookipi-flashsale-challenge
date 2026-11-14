$processName = "node"

$executionTimestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$output = "performance/monitor-service.$executionTimestamp.csv"

"Timestamp,CPU_Percent,Memory_MB" |
    Out-File $output

while ($true) {
    $processes = Get-Process $processName `
        -ErrorAction SilentlyContinue

    foreach ($process in $processes) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        $memory = [math]::Round(
            $process.WorkingSet64 / 1MB, 2
        )

        $cpu = $process.CPU

        "$timestamp,$cpu,$memory" |
            Out-File $output -Append
    }

    Start-Sleep -Seconds 1
}