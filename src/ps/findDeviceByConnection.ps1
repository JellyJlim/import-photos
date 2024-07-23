param(
	[Parameter(position = 0)]
	[string]$Type = "Mobile",
	[Parameter(position = 1)]
	[int]$sec_time_out = 0
)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Import.PhotoImportManager, Windows.Media.Import, ContentType = WindowsRuntime]

Import-Module (".\AwaitOperation.psm1")
Import-Module(".\Write-Json.psm1")

$try_count = 0;
$max_try_count = $sec_time_out;
$found = $false;
$guid_drive = "53f56307-b6bf-11d0-94f2-00a0c91efb8b"
$devices = @()

Do {
	$sources = AwaitOperation (
		[Windows.Media.Import.PhotoImportManager]::FindAllSourcesAsync()
	) (
		[System.Collections.Generic.IReadOnlyList[Windows.Media.Import.PhotoImportSource]]
	)
	$sources | ForEach-Object {
		$drive = "";
		if ($Type -eq "USB" -and ($_.Id -match $guid_drive)) {
			#Write-Output "Found USB Drive"
			$drive = (Get-Volume -FriendlyName $_.DisplayName).DriveLetter	
			$found = $true
			$protocol = "MSC"
		}
		elseif ($Type -eq "Mobile" -and (($_.ConnectionProtocol -match "MTP") -or ($_.ConnectionProtocol -match "PTP"))) {
			#Write-Output "Found Mobile Stroage"
			$protocol = $_.ConnectionProtocol
			$found = $true
		}
		elseif ($Type -eq "") {
			$protocol = "UNKNOWN"
			$found = $true
		}
		if ($found -eq $true) {
			$devices += @{
				deviceId    = $_.Id
				connectType = $Type
				drive       = $drive
				protocol    = $protocol
				name    = $_.DisplayName
			}
			Write-Output (Write-Json $devices)
			"AwaitOperation", "Write-Json" | Remove-Module
			Exit 0
		}
		
	}
	Start-Sleep -Seconds 2
	$try_count++
}
Until ($found -or ($try_count -ge $max_try_count))
"AwaitOperation", "Write-Json" | Remove-Module
Exit 99