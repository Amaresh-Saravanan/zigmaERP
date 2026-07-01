param(
    [string]$Branch = "main",
    [int]$Threshold = 5
)

$repoPath = "C:\Users\DELL\House work\Internship\erp\erp"

Set-Location $repoPath

$changedFiles = (git status --porcelain | Measure-Object -Line).Lines

if ($changedFiles -ge $Threshold) {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $changedFiles files changed (>= $Threshold). Auto-committing and pushing to '$Branch'..." -ForegroundColor Yellow

    git add -A
    git commit -m "Auto-push: $changedFiles files changed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin $Branch

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Pushed successfully to '$Branch'." -ForegroundColor Green
} else {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $changedFiles files changed (< $Threshold). Skipping push." -ForegroundColor Cyan
}
