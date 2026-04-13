# Enables Win32 long paths (fixes React Native Android CMake/Ninja MAX_PATH on deep Windows folders).
# Re-launches elevated once, then sets the registry value. Restart the PC after success.

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host 'Requesting Administrator approval to set LongPathsEnabled...' -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList @(
        '-NoProfile',
        '-ExecutionPolicy', 'Bypass',
        '-File',
        $MyInvocation.MyCommand.Path
    )
    exit 0
}

New-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' `
    -Name 'LongPathsEnabled' `
    -Value 1 `
    -PropertyType DWord `
    -Force | Out-Null

Write-Host ''
Write-Host 'LongPathsEnabled is now set to 1. Restart Windows, then run: npx react-native run-android' -ForegroundColor Green
Write-Host ''
