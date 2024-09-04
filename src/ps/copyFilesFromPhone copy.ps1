param(
	[Parameter(position = 0)]
	# [string]$arrfiles =  '[["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041472.JPG","IMG0.jpg"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041473.JPG","IMG3.heic"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041476.JPG","IMG6.jpg"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041475.JPG","IMG7.jpg"]]',
  [string]$arrfiles =  '[["\\Galaxy A54 5G\\Internal storage\\DCIM\\Camera\\20240201_101941.heic","20240201_101941.heic"],["\\Galaxy A54 5G\\Internal storage\\DCIM\\Camera\\20240201_101940.heic","20240201_101940.heic"],["\\Galaxy A54 5G\\Internal storage\\DCIM\\Camera\\20240201_101938.heic","20240201_101938.heic"]]',
  [Parameter(position = 1)]
  # [string]$phoneName = "Apple iPhone",
  [string]$phoneName = "Galaxy A54 5G",
	[Parameter(position = 2)]
	[string]$strOutputDir = "c:\path\to\copy"
)

Import-Module ".\ForEach-Parallel.ps1"

function Create-Dir($path)
{
  if((Test-Path -Path $path))
  {
    Remove-Item -Path $path -Recurse -Force | Out-Null
    Sleep -Milliseconds 100
  }
  New-Item -Path $path -ItemType Directory   | Out-Null
}

$files = $arrfiles | ConvertFrom-Json
$outputDir = $strOutputDir -replace "\\\\","\"

Create-Dir($strOutputDir)
Write-Host "HERE?"
# $files| ForEach-Parallel -ScriptBlock {  Param ($p1, $p2)
  $p1 = $outputDir
  $p2 = $phoneName

  # $sourcePath = $_[0];
  # $targetName = $_[1];
  $sourcePath = $files[3][0];
  $targetName = $files[3][1];
Write-Host "HERE?", $sourcePath,  $targetName
  $rootComputer = (new-object -com Shell.Application).NameSpace(0x11)
  $rootPhone = $rootComputer.Items() | Where-Object {$_.Name -eq $p2} | Select-Object -First 1
  if($rootPhone -eq $null)
  {
    throw "Not found '$p2' folder in This computer. Connect your phone."
  }

  $newPath = $sourcePath -replace [regex]::Escape("\$p2"), ""
  $newPath = $newPath.TrimStart("\\")
  $source = $rootPhone.GetFolder.ParseName($newPath)
  if($source -eq $null){
    Write-Host "Not Found Files", $newPath
    return
  } 
Write-Output $source
  $tempDirShell = (new-object -com Shell.Application).NameSpace($p1)
  if($tempDirShell -eq $null){
    Write-Host "~Not Found Directroy", $p1,
     Exit 999
  }
  $startTime = Get-Date
  $timeout = 2*60*1000;
  $tempDirShell.CopyHere($source, 20)
  # Do {
  #   $CopiedFileName = Join-Path $p1 $source.Name
  #   $CopiedFile = $tempDirShell.ParseName($source.Name)
  #   $elapsedTime = (Get-Date) - $startTime
  #   if ($elapsedTime.TotalMilliseconds -ge $timeout) {
  #     Write-Output "~Timeout reached. Exiting loop."
  #     break
  #   }
  # }While( ($CopiedFile -eq $null) -and ($null -eq (Sleep -Milliseconds 1000)) )
# } -ArgumentList $outputDir, $phoneName # -WaitTimeout (20*60*1000)

Remove-Module ("ForEach-Parallel")


