# ============================
# Auth System Full Test Script
# ============================

$base = "http://localhost:4000/auth"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

function Write-Step($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Pass($msg) {
    Write-Host "[PASS] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
}

# Random email for repeatable tests
$rand = Get-Random -Minimum 10000 -Maximum 99999
$email = "testuser$rand@example.com"
$password = "TestPass123!"

Write-Step "Signup"
$signup = Invoke-WebRequest -Uri "$base/signup" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{ email=$email; password=$password } | ConvertTo-Json) `
    -WebSession $session

if ($signup.StatusCode -eq 200) {
    Write-Pass "Signup succeeded for $email"
} else {
    Write-Fail "Signup failed"
    exit
}

# Extract verification token from DB (requires psql installed)
Write-Step "Fetch verification token from DB"

$verifyToken = (docker exec drewhyatt-db-1 psql -U drewhyatt -d drewhyatt -t -A --command "SELECT email_verification_token FROM users WHERE email='$email';").Trim()

if ($verifyToken.Length -gt 10) {
    Write-Pass "Verification token retrieved"
} else {
    Write-Fail "Could not retrieve verification token"
    exit
}

Write-Step "Verify Email"
$verify = Invoke-WebRequest -Uri "$base/verify?token=$verifyToken" `
    -Method GET `
    -WebSession $session

if ($verify.StatusCode -eq 200) {
    Write-Pass "Email verified"
} else {
    Write-Fail "Email verification failed"
    exit
}

Write-Step "Login"
$login = Invoke-WebRequest -Uri "$base/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{ email=$email; password=$password } | ConvertTo-Json) `
    -WebSession $session

if ($login.StatusCode -eq 200) {
    Write-Pass "Login succeeded"
} else {
    Write-Fail "Login failed"
    exit
}

Write-Step "Access Protected Route (/auth/me)"
$me = Invoke-WebRequest -Uri "$base/me" `
    -Method GET `
    -WebSession $session

if ($me.StatusCode -eq 200) {
    Write-Pass "Protected route accessible"
} else {
    Write-Fail "Protected route failed"
    exit
}

Write-Step "Refresh Token"
$refresh = Invoke-WebRequest -Uri "$base/refresh" `
    -Method POST `
    -WebSession $session

if ($refresh.StatusCode -eq 200) {
    Write-Pass "Refresh token succeeded"
} else {
    Write-Fail "Refresh token failed"
    exit
}

Write-Step "Change Password"
$newPassword = "NewPass123!"
$change = Invoke-WebRequest -Uri "$base/change-password" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{ oldPassword=$password; newPassword=$newPassword } | ConvertTo-Json) `
    -WebSession $session

if ($change.StatusCode -eq 200) {
    Write-Pass "Password changed"
} else {
    Write-Fail "Password change failed"
    exit
}

Write-Step "Logout"
$logout = Invoke-WebRequest -Uri "$base/logout" `
    -Method POST `
    -WebSession $session

if ($logout.StatusCode -eq 200) {
    Write-Pass "Logout succeeded"
} else {
    Write-Fail "Logout failed"
    exit
}

Write-Step "Login With New Password"
$login2 = Invoke-WebRequest -Uri "$base/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body (@{ email=$email; password=$newPassword } | ConvertTo-Json) `
    -WebSession $session

if ($login2.StatusCode -eq 200) {
    Write-Pass "Login with new password succeeded"
} else {
    Write-Fail "Login with new password failed"
    exit
}

Write-Step "Delete Account"
$delete = Invoke-WebRequest -Uri "$base/delete" `
    -Method DELETE `
    -WebSession $session

if ($delete.StatusCode -eq 200) {
    Write-Pass "Account deleted"
} else {
    Write-Fail "Account deletion failed"
    exit
}

Write-Step "Verify Account Deleted"
$check = Invoke-WebRequest -Uri "$base/me" `
    -Method GET `
    -WebSession $session `
    -ErrorAction SilentlyContinue

if ($check.StatusCode -ne 200) {
    Write-Pass "Account no longer accessible"
} else {
    Write-Fail "Account still exists"
}

Write-Host "`nAll tests completed.`n" -ForegroundColor Yellow
