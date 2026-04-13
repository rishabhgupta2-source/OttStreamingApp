# Verifies Win32 long-path support (required for RN New Architecture + CMake/Ninja on Windows).
# Run once before Android builds if you see: "Filename longer than 260 characters".
$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Error 'PowerShell 5+ required.'
    exit 1
}

$key = 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem'
$name = 'LongPathsEnabled'

try {
    $prop = Get-ItemProperty -Path $key -Name $name -ErrorAction Stop
    if ($prop.LongPathsEnabled -eq 1) {
        Write-Host 'LongPathsEnabled is ON. Android native builds should not hit MAX_PATH for deep paths.'
        exit 0
    }
} catch {
    # Property missing or inaccessible
}

Write-Host ''
Write-Host 'LongPathsEnabled is OFF or not set. React Native Android (CMake/Ninja + New Architecture) needs paths longer than 260 characters on typical Windows setups.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Enable it (requires Administrator PowerShell), then restart the PC:' -ForegroundColor Yellow
Write-Host '  New-ItemProperty -Path HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem -Name LongPathsEnabled -Value 1 -PropertyType DWORD -Force' -ForegroundColor Cyan
Write-Host ''
Write-Host 'Or: Group Policy > Computer Configuration > Administrative Templates > System > Filesystem > Enable Win32 long paths.' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Fix (pick one):' -ForegroundColor Yellow
Write-Host '  1) npm run enable-long-paths   (UAC prompt, then restart PC)' -ForegroundColor Cyan
Write-Host '  2) Move the project to a short folder, e.g. C:\dev\StreamList' -ForegroundColor Cyan
exit 1
