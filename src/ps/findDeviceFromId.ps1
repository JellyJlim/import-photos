param(
	[Parameter(position = 0)]
	# [string]$deviceId = "\\?\usb#vid_1004&pid_631e#lmg710eaw8d635371#{6ac27878-a6fa-4155-ba85-f98f491d4f33}"
	[string]$deviceId = "\\?\swd#wpdbusenum#_??_usbstor#disk&ven_&prod_usb_disk_pro&rev_pmap#07000778146201cf&0#{53f56307-b6bf-11d0-94f2-00a0c91efb8b}#{6ac27878-a6fa-4155-ba85-f98f491d4f33}"
)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
[void][Windows.Media.Import.PhotoImportSource, Windows.Media.Import, ContentType = WindowsRuntime]

Import-Module (".\AwaitOperation.psm1")
Import-Module(".\Write-Json.psm1")

$DeviceAllDevices = AwaitOperation (
  [Windows.Media.Import.PhotoImportManager]::FindAllSourcesAsync()
) (
  [System.Collections.Generic.IReadOnlyList[Windows.Media.Import.PhotoImportSource]]
)
$Device = @{}
$Found = ""
$DeviceAllDevices | ForEach-Object{
    if($_.Id -eq $deviceId){
    $Found = $_.Id
    $Device.add("deviceId",  $_.Id)
    $Device.add("protocol", $_.ConnectionProtocol)
    $Device.add("displayName", $_.DisplayName)
    $Device.add("name", $_.DisplayName)
    $Device.add("description", $_.Description)
    return;
  }
}
$Result = @{
  medias = @($Device)
  selectedMediaKey = $Found
}
Write-Output (ConvertTo-ObjJson $Result)
"AwaitOperation", "Write-Json" | Remove-Module