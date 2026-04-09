Write-Host "Shutting down Flask, Next.js, and Prisma..." -ForegroundColor Yellow

# Define the ports your apps use
$ports = @(3000, 5000, 512772, 51212)

foreach ($port in $ports) {
    # Get all unique PIDs listening on this port
    $pids = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | 
            Select-Object -ExpandProperty OwningProcess -Unique

    if ($pids) {
        foreach ($pi in $pids) {
            try {
                Write-Host "Killing process $pid on port $port..." -ForegroundColor Cyan
                Stop-Process -Id $pi -Force -ErrorAction Stop
            } catch {
                Write-Host "Process $pi already closed." -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "Port $port is already clear." -ForegroundColor Gray
    }
}

Write-Host "Cleanup complete." -ForegroundColor Green