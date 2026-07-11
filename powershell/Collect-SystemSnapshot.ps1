[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion, OsHardwareAbstractionLayer, CsProcessors, CsTotalPhysicalMemory | ConvertTo-Json -Depth 4
