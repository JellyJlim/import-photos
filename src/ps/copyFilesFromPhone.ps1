param(
  [Parameter(position = 0)]
  # [string]$arrfiles =  '[["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041472.JPG","IMG0.jpg"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041473.JPG","IMG3.heic"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041476.JPG","IMG6.jpg"],["\\Apple iPhone\\Internal storage\\DCIM\\100CLOUD\\17041475.JPG","IMG7.jpg"]]',
  [string]$arrfiles = '[["\\JlimThinQ\\Internal storage\\DCIM\\Camera\\20240201_101941.heic","20240201_101941.heic"],["\\JlimThinQ\\Internal storage\\DCIM\\Camera\\20240201_101940.heic","20240201_101940.heic"],["\\JlimThinQ\\Internal storage\\DCIM\\Camera\\20240201_101938.heic","20240201_101938.heic"]]',
  [Parameter(position = 1)]
  # [string]$phoneName = "Apple iPhone",
  [string]$phoneName = "JlimThinQ",
  [Parameter(position = 2)]
  [string]$strOutputDir = "c:\path\to\copy"
)

function Create-Dir($path) {
  if ((Test-Path -Path $path)) {
    Remove-Item -Path $path -Recurse -Force | Out-Null
    Sleep -Milliseconds 100
  }
  New-Item -Path $path -ItemType Directory   | Out-Null
}

$files = $arrfiles | ConvertFrom-Json
$outputDir = $strOutputDir -replace "\\\\", "\"

Create-Dir($strOutputDir)

$rootComputer = (new-object -com Shell.Application).NameSpace(0x11)

$rootPhone = $rootComputer.Items() | Where-Object { $_.Name -eq $phoneName } | Select-Object -First 1
if ($rootPhone -eq $null) {
  Write-Host "Not found '$phoneName' folder in This computer. Connect your phone."
  Exit 999
}

$tempDirShell = (new-object -com Shell.Application).NameSpace($outputDir)
if ($tempDirShell -eq $null) {
  Write-Host "~Not Found Directroy", $outputDir,
  Exit 999
}

$files | ForEach-Object {
  $sourcePath = $_[0];
  $targetName = $_[1];
  if ($sourcePath -match '^\{[^\}]+\}\\') {
    $sourcePath = $sourcePath -replace '^\{([^\}]+)\}\\', '\\$1\\'
  }
  $newPath = $sourcePath -replace [regex]::Escape("\$phoneName"), ""
  $newPath = $newPath.TrimStart("\\")
  $source = $rootPhone.GetFolder.ParseName($newPath)
  if ($source -eq $null) {
    Write-Host "Not Found Files", $newPath
    return
  } 
  $tempDirShell.CopyHere($source, 20)

  $filename = [System.IO.Path]::GetFileName($newPath)
  $outputPath = Join-Path $outputDir $filename
  Rename-Item -Path $outputPath -NewName $targetName

}



