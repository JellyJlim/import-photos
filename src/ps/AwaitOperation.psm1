Function AwaitOperation($WinRtTask, $ResultType) {
  
  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | 
    Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and 
      $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]

  $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
  $netTask = $asTask.Invoke($null, @($WinRtTask))
  $netTask.Wait(-1) | Out-Null
  if ($netTask.Exception) { Write-Output "*** netTask ERROR ($($netTask.Status), $($netTask.Exception))" }
  $netTask.Result
}

Function AwaitOperationWithProgress($WinRtTask, $ResultType1, $ResultType2) {
  $asTaskGeneric2 = ([System.WindowsRuntimeSystemExtensions].GetMethods() | 
    Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and 
      $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperationWithProgress`2' })[0]

  $asTask = $asTaskGeneric2.MakeGenericMethod($ResultType1, $ResultType2)
  $netTask = $asTask.Invoke($null, @($WinRtTask))
  $netTask.Wait(-1) | Out-Null
  $netTask.Result
}