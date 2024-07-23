param(
	[Parameter(position = 0)]
	[string]$arrfiles =  '[["\\PhoneName\\Internal storage\\Pictures\\Messenger\\1702124892919.jpg.jpg","IMG0.jpg"],["\\PhoneName\\Internal storage\\DCIM\\Camera\\crowd_1440x960.heic","IMG3.heic"],["\\PhoneName\\Internal storage\\DCIM\\Camera\\20240209_171654.jpg","IMG6.jpg"],["\\PhoneName\\Internal storage\\DCIM\\Camera\\20240209_171648.jpg","IMG7.jpg"]]',
  [Parameter(position = 1)]
	[string]$phoneName = "PhoneName",
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

$files| ForEach-Parallel -ScriptBlock {  Param ($p1, $p2)
  $sourcePath = $_[0];
  $targetName = $_[1];

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
    Write-Output "Not Found Files", $newPath
    return
  } 

  $tempDirShell = (new-object -com Shell.Application).NameSpace($p1)
  if($tempDirShell -eq $null){
    Write-Output "~Not Found Directroy", $p1,
     Exit 999
  }
  $startTime = Get-Date
  $timeout = 2*60*1000;
  $tempDirShell.CopyHere($source, 20)
  Do {
    $CopiedFileName = Join-Path $p1 $source.Name
    $CopiedFile = $tempDirShell.ParseName($source.Name)
    $elapsedTime = (Get-Date) - $startTime
    if ($elapsedTime.TotalMilliseconds -ge $timeout) {
      Write-Output "~Timeout reached. Exiting loop."
      break
    }
  }While( ($CopiedFile -eq $null) -and ($null -eq (Sleep -Milliseconds 1000)) )
} -ArgumentList $outputDir, $phoneName # -WaitTimeout (20*60*1000)

Remove-Module ("ForEach-Parallel")


