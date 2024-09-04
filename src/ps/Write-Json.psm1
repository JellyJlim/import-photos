function Write-Json {
  param (
    [Parameter()]
    [psobject]
    $obj
  )
  $outputString = (ConvertTo-Json -Depth 5 @($obj))
  return $outputString
}

function ConvertTo-ObjJson {
  param (
    [Parameter()]
    [psobject]
    $obj
  )
  $outputString = (ConvertTo-Json -Depth 5 $obj)
  return $outputString
}

function Get-NumericCurrentTime {
  return [int](Get-Date -UFormat %s)
}