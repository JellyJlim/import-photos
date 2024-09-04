# Prompt the user for the first number
$number1 = Read-Host -Prompt "Plz, input number 1"

# Ensure the input is a number
# while (-not [double]::TryParse($number1, [ref]0)) {
#     Write-Host "Invalid input. Please enter a valid number."
#     $number1 = Read-Host -Prompt "Plz, input number 1"
# }

# Prompt the user for the second number
$number2 = Read-Host -Prompt "Plz, input number 2"

# Ensure the input is a number
# while (-not [double]::TryParse($number2, [ref]0)) {
#     Write-Host "Invalid input. Please enter a valid number."
#     $number2 = Read-Host -Prompt "Plz, input number 2"
# }


Write-Host "number 1 = $number1"
Write-Host "number 2 = $number2"
exit;

# Convert inputs to numbers
$number1 = [double]$number1
$number2 = [double]$number2

# Calculate the sum
$sum = $number1 + $number2

# Display the result
Write-Host "number 1 + number 2 = $sum"
