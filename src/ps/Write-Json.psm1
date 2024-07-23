function Write-Json {
  param (
    [Parameter()]
    [psobject]
    $obj
  )
  $outputString = (ConvertTo-Json -Depth 3 @($obj))
  return $outputString
}