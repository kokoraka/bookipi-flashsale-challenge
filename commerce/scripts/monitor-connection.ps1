while ($true) {
    $connections = Get-NetTCPConnection -ErrorAction SilentlyContinue

    $states = $connections |
        Group-Object State |
        ForEach-Object {
            "$($_.Name)=$($_.Count)"
        }

    $listener = $connections |
        Where-Object {
            $_.LocalPort -eq 4001 -and $_.State -eq 'Listen'
        }

    $listenerStatus = if ($listener) {
        "LISTENING"
    } else {
        "NOT LISTENING"
    }

    Write-Host "$(Get-Date -Format 'HH:mm:ss') | $listenerStatus | $($states -join ', ')"

    Start-Sleep -Seconds 2
}