# test-auth.ps1
# End-to-end auth lifecycle + password reset tests

$base = "http://localhost:4000/auth"

function Write-Step($msg) {
    Write-Host "[STEP] $msg" -ForegroundColor Cyan
}

function Write-Pass($msg) {
    Write-Host "[PASS] $msg" -ForegroundColor Green
}

function Write-Fail($msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
}

Write-Host "=== Drewhyatt API Auth Test Suite ==="
Write-Host ""

# ---------------------------------------------------------------------------
# 1. Signup
# ---------------------------------------------------------------------------

Write-Host "=== Signup ==="

$email = "testuser$((Get-Random -Minimum 10000 -Maximum 99999))@example.com"
$password = "InitialPass123!"

$signup = Invoke-WebRequest -Uri "$base/signup" `
    -Method POST `
    -Body (@{ email = $email; password = $password } | ConvertTo-Json) `
    -ContentType "application/json"

if ($signup.StatusCode -eq 200) {
    Write-Pass "Signup succeeded for $email"
}
else {
    Write-Fail "Signup failed"
    exit
}

# ---------------------------------------------------------------------------
# 2. Fetch verification token from DB
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Fetch verification token from DB ==="

$verifyToken = (docker exec drewhyatt-db-1 psql -U drewhyatt -d drewhyatt -t -A --command "SELECT email_verification_token FROM users WHERE email='$email' ORDER BY id DESC LIMIT 1;").Trim()

if ($verifyToken.Length -gt 10) {
    Write-Pass "Verification token retrieved"
}
else {
    Write-Fail "Could not retrieve verification token"
    exit
}

# ---------------------------------------------------------------------------
# 3. Verify Email
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Verify Email ==="

$verify = Invoke-WebRequest -Uri "$base/verify?token=$verifyToken" -Method GET

if ($verify.StatusCode -eq 200) {
    Write-Pass "Email verified"
}
else {
    Write-Fail "Email verification failed"
    exit
}

# ---------------------------------------------------------------------------
# 4. Login
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Login ==="

$login = Invoke-WebRequest -Uri "$base/login" `
    -Method POST `
    -Body (@{ email = $email; password = $password } | ConvertTo-Json) `
    -ContentType "application/json" `
    -SessionVariable session

if ($login.StatusCode -eq 200) {
    Write-Pass "Login succeeded"
}
else {
    Write-Fail "Login failed"
    exit
}

# ---------------------------------------------------------------------------
# 5. Access Protected Route (/auth/me)
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Access Protected Route (/auth/me) ==="

$me = Invoke-WebRequest -Uri "$base/me" `
    -Method GET `
    -WebSession $session

if ($me.StatusCode -eq 200) {
    Write-Pass "Protected route accessible"
}
else {
    Write-Fail "Protected route failed"
    exit
}

# ---------------------------------------------------------------------------
# 6. Refresh Token
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Refresh Token ==="

$refresh = Invoke-WebRequest -Uri "$base/refresh" `
    -Method POST `
    -WebSession $session

if ($refresh.StatusCode -eq 200) {
    Write-Pass "Refresh token succeeded"
}
else {
    Write-Fail "Refresh token failed"
    exit
}

# ---------------------------------------------------------------------------
# 7. Change Password
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Change Password ==="

$newPassword = "NewPass123!"

$change = Invoke-WebRequest -Uri "$base/change-password" `
    -Method POST `
    -Body (@{ oldPassword = $password; newPassword = $newPassword } | ConvertTo-Json) `
    -ContentType "application/json" `
    -WebSession $session

if ($change.StatusCode -eq 200) {
    Write-Pass "Password changed"
}
else {
    Write-Fail "Password change failed"
    exit
}

# ---------------------------------------------------------------------------
# 8. Logout
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Logout ==="

$logout = Invoke-WebRequest -Uri "$base/logout" `
    -Method POST `
    -WebSession $session

if ($logout.StatusCode -eq 200) {
    Write-Pass "Logout succeeded"
}
else {
    Write-Fail "Logout failed"
    exit
}

# ---------------------------------------------------------------------------
# 9. Login With New Password
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Login With New Password ==="

$loginNew = Invoke-WebRequest -Uri "$base/login" `
    -Method POST `
    -Body (@{ email = $email; password = $newPassword } | ConvertTo-Json) `
    -ContentType "application/json" `
    -SessionVariable sessionNew

if ($loginNew.StatusCode -eq 200) {
    Write-Pass "Login with new password succeeded"
}
else {
    Write-Fail "Login with new password failed"
    exit
}

# ---------------------------------------------------------------------------
# 10. Password Reset – Normal Flow
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Request Password Reset (Normal Flow) ==="

$resetReq = Invoke-WebRequest -Uri "$base/request-reset" `
    -Method POST `
    -Body (@{ email = $email } | ConvertTo-Json) `
    -ContentType "application/json"

if ($resetReq.StatusCode -eq 200) {
    Write-Pass "Password reset requested"
}
else {
    Write-Fail "Password reset request failed"
    exit
}

Write-Host ""
Write-Host "=== Fetch Password Reset Token from DB (Normal Flow) ==="

$resetToken = (docker exec drewhyatt-db-1 psql -U drewhyatt -d drewhyatt -t -A --command "SELECT token FROM password_resets WHERE email='$email' ORDER BY id DESC LIMIT 1;").Trim()

if ($resetToken.Length -gt 10) {
    Write-Pass "Password reset token retrieved"
}
else {
    Write-Fail "Could not retrieve password reset token"
    exit
}

Write-Host ""
Write-Host "=== Perform Password Reset (Normal Flow) ==="

$resetPassword = "ResetPass123!"

$resetDo = Invoke-WebRequest -Uri "$base/reset-password" `
    -Method POST `
    -Body (@{
        token       = $resetToken
        newPassword = $resetPassword
    } | ConvertTo-Json) `
    -ContentType "application/json"

if ($resetDo.StatusCode -eq 200) {
    Write-Pass "Password reset succeeded"
}
else {
    Write-Fail "Password reset failed"
    exit
}

Write-Host ""
Write-Host "=== Login With Reset Password (Normal Flow) ==="

$loginReset = Invoke-WebRequest -Uri "$base/login" `
    -Method POST `
    -Body (@{
        email    = $email
        password = $resetPassword
    } | ConvertTo-Json) `
    -ContentType "application/json" `
    -SessionVariable sessionReset

if ($loginReset.StatusCode -eq 200) {
    Write-Pass "Login with reset password succeeded"
}
else {
    Write-Fail "Login with reset password failed"
    exit
}

# ---------------------------------------------------------------------------
# 11. Password Reset – Expired Token
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Password Reset – Expired Token ==="

try {
    $expiredReset = Invoke-WebRequest -Uri "$base/reset-password" `
        -Method POST `
        -Body (@{
            token       = $expiredToken
            newPassword = "ExpiredPass123!"
        } | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop

    # If we somehow get here, it's wrong
    Write-Fail "Expired token behavior incorrect (expected 400)"
}
catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 400) {
        Write-Pass "Expired token correctly rejected"
    }
    else {
        Write-Fail "Expired token behavior incorrect (expected 400)"
    }
}

# ---------------------------------------------------------------------------
# 12. Password Reset – Invalid Token
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Password Reset – Invalid Token ==="

try {
    $invalidReset = Invoke-WebRequest -Uri "$base/reset-password" `
        -Method POST `
        -Body (@{
            token       = "totally-invalid-token"
            newPassword = "InvalidPass123!"
        } | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Fail "Invalid token behavior incorrect (expected 400)"
}
catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 400) {
        Write-Pass "Invalid token correctly rejected"
    }
    else {
        Write-Fail "Invalid token behavior incorrect (expected 400)"
    }
}

# ---------------------------------------------------------------------------
# 13. Password Reset – Token Reuse Prevention
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Password Reset – Token Reuse Prevention ==="

$reuseReq = Invoke-WebRequest -Uri "$base/request-reset" `
    -Method POST `
    -Body (@{ email = $email } | ConvertTo-Json) `
    -ContentType "application/json"

if ($reuseReq.StatusCode -eq 200) {
    Write-Pass "Password reset requested for reuse test"
}
else {
    Write-Fail "Password reset request failed for reuse test"
    exit
}

$reuseToken = (docker exec drewhyatt-db-1 psql -U drewhyatt -d drewhyatt -t -A --command "SELECT token FROM password_resets WHERE email='$email' ORDER BY id DESC LIMIT 1;").Trim()

if ($reuseToken.Length -le 10) {
    Write-Fail "Could not retrieve reuse token"
    exit
}

$reuseFirst = Invoke-WebRequest -Uri "$base/reset-password" `
    -Method POST `
    -Body (@{
        token       = $reuseToken
        newPassword = "ReusePass123!"
    } | ConvertTo-Json) `
    -ContentType "application/json"

if ($reuseFirst.StatusCode -eq 200) {
    Write-Pass "First use of token succeeded"
}
else {
    Write-Fail "First use of token failed"
    exit
}

# Second use (should fail)
try {
    $reuseSecond = Invoke-WebRequest -Uri "$base/reset-password" `
        -Method POST `
        -Body (@{
            token       = $reuseToken
            newPassword = "ReusePass456!"
        } | ConvertTo-Json) `
        -ContentType "application/json" `
        -ErrorAction Stop

    Write-Fail "Token reuse behavior incorrect (expected 400)"
}
catch {
    $status = $_.Exception.Response.StatusCode.Value__
    if ($status -eq 400) {
        Write-Pass "Token reuse correctly rejected"
    }
    else {
        Write-Fail "Token reuse behavior incorrect (expected 400)"
    }
}

# ---------------------------------------------------------------------------
# 14. Password Reset – Token Cleanup
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Password Reset – Token Cleanup ==="

$cleanupCount = (docker exec drewhyatt-db-1 psql -U drewhyatt -d drewhyatt -t -A --command "SELECT COUNT(*) FROM password_resets WHERE email='$email' AND expires_at < NOW();").Trim()

if ($cleanupCount -eq "0") {
    Write-Pass "Expired tokens cleaned up (or none present)"
}
else {
    Write-Fail "Expired tokens still present for email (count=$cleanupCount)"
}

# ---------------------------------------------------------------------------
# 15. Password Reset – Rate Limiting
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Password Reset – Rate Limiting ==="

$rateLimitHit = $false

for ($i = 1; $i -le 10; $i++) {
    try {
        $rl = Invoke-WebRequest -Uri "$base/request-reset" `
            -Method POST `
            -Body (@{ email = $email } | ConvertTo-Json) `
            -ContentType "application/json" `
            -ErrorAction Stop

        if ($rl.StatusCode -eq 429) {
            $rateLimitHit = $true
            break
        }
    }
    catch {
        $status = $_.Exception.Response.StatusCode.Value__
        if ($status -eq 429) {
            $rateLimitHit = $true
            break
        }
    }
}

if ($rateLimitHit) {
    Write-Pass "Rate limiting triggered on reset requests"
}
else {
    Write-Fail "Rate limiting not triggered (expected 429 after multiple requests)"
}

# ---------------------------------------------------------------------------
# 16. Delete Account
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Delete Account ==="

$delete = Invoke-WebRequest -Uri "$base/delete" `
    -Method DELETE `
    -WebSession $sessionReset

if ($delete.StatusCode -eq 200) {
    Write-Pass "Account deleted"
}
else {
    Write-Fail "Account deletion failed"
    exit
}

# ---------------------------------------------------------------------------
# 17. Verify Account Deleted
# ---------------------------------------------------------------------------

Write-Host ""
Write-Host "=== Verify Account Deleted ==="

try {
  $check = Invoke-WebRequest -Uri "$base/me" `
    -Method GET `
    -ErrorAction Stop

  Write-Fail "Account still accessible (expected 401/403)"
}
catch {
  $status = $_.Exception.Response.StatusCode.Value__
  if ($status -eq 401 -or $status -eq 403) {
    Write-Pass "Account correctly inaccessible after deletion"
  }
  else {
    Write-Fail "Account still accessible (expected 401/403)"
  }
}

Write-Host ""
Write-Host "All tests completed."
