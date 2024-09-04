param(
	[Parameter(position = 0)]
	[int]$SecTimeOut = 30
)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Import.PhotoImportManager, Windows.Media.Import, ContentType = WindowsRuntime]

Import-Module (".\AwaitOperation.psm1")
Import-Module(".\Write-Json.psm1")

$TryCount = 0;
$SecInterval = 2;
$MaxTryCount = [int]($SecTimeOut/$SecInterval);
$Found = $false;
$Device = @()
$StartTime = Get-NumericCurrentTime
$PreDeviceCount = 0
Do {
	$FoundAllDevices = AwaitOperation (
		[Windows.Media.Import.PhotoImportManager]::FindAllSourcesAsync()
	) (
		[System.Collections.Generic.IReadOnlyList[Windows.Media.Import.PhotoImportSource]]
	)

  $WaitDevices = @()
  $WaitDevices = $FoundAllDevices | Where-Object {($_.ConnectionProtocol -match "MTP") -or ($_.ConnectionProtocol -match "PTP")}

  # if(($TryCount -ne 0) -and ($WaitDevices.Count -gt $PreDeviceCount))
  #  FOR TEST
  if($WaitDevices.Count -gt $PreDeviceCount){
    # devices added
    $AddedDevice = $WaitDevices | Where-Object {
      $deviceId = $_.Id
      -not ($Device | Where-Object { $_.deviceId -eq $deviceId })
    } | Select-Object -First 1
    $Found = $AddedDevice.Id

    Write-Output "~MOBILE:FOUND"
  }
  elseif($WaitDevices.Count -lt $PreDeviceCount){
    Write-Output "~MOBILE:REMOVED"
  }
  else {
    $Found = $false
  }
  $PreDeviceCount = $WaitDevices.Count

  $Device = @()
  $WaitDevices | ForEach-Object {
    $Drive = @{}
    $Device += @{
      deviceId    = $_.Id
      key         = $_.Id
      connectType = "MOBILE"
      protocol    = $_.ConnectionProtocol
      displayName = $_.DisplayName; 
      name        = $_.DisplayName;
      description = $_.Description
      mountpoints = @($Drive)
    }
  }

	$cur_time = Get-NumericCurrentTime
  Start-Sleep -Seconds $SecInterval

  $TryCount++
}
Until (($TryCount -ge $MaxTryCount) -or (($cur_time - $StartTime) -gt $SecTimeOut))

if($Found -ne $false){
  $Result = @{
    medias = $Device
    selectedMediaKey = $Found
  }
  Write-Output (ConvertTo-ObjJson $Result)
  "AwaitOperation", "Write-Json" | Remove-Module
  Exit 0
}else{
  "AwaitOperation", "Write-Json" | Remove-Module
  Exit 99
}