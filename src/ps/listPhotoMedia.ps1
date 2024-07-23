Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Import.PhotoImportManager, Windows.Media.Import, ContentType = WindowsRuntime]

Import-Module (".\AwaitOperation.psm1")
Import-Module(".\Write-Json.psm1")

$guid_drive = "53f56307-b6bf-11d0-94f2-00a0c91efb8b"
$devices = @()

$sources = AwaitOperation (
	[Windows.Media.Import.PhotoImportManager]::FindAllSourcesAsync()
) (
	[System.Collections.Generic.IReadOnlyList[Windows.Media.Import.PhotoImportSource]]
)
$sources | ForEach-Object {
	$drive = "";
	if (($_.Id -match $guid_drive)) {
		#Write-Output "Found USB Drive"
		$drive = (Get-Volume -FriendlyName $_.DisplayName).DriveLetter	
	}
	$devices += @{
		deviceId    = $_.Id
		name    = $_.Model
		protocol = $_.ConnectionProtocol
		drive       = $drive
	}
}
Write-Host (Write-Json $devices)
"AwaitOperation", "Write-Json" | Remove-Module