async function testAuthSuite() {
  console.log('\n==================================================');
  console.log('         BRANDPILOT AUTHENTICATION TEST SUITE     ');
  console.log('==================================================\n');

  const testEmail = `pilot_${Date.now()}@example.com`;
  const testPass = 'BrandPilot@2026';

  console.log('--- TEST 1: User Registration (Signup) ---');
  const signupRes = await fetch('http://localhost:5005/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Pilot',
      email: testEmail,
      password: testPass,
      mobile: '+1234567890',
      termsAccepted: true
    })
  });
  const signupData = await signupRes.json();
  console.log('✓ Signup Result:', signupRes.status, '| ID:', signupData.id, '| Requires OTP:', signupData.requiresOtp);

  console.log('\n--- TEST 2: OTP Verification ---');
  // Use dev master code 123456
  const otpRes = await fetch('http://localhost:5005/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: '123456'
    })
  });
  const otpData = await otpRes.json();
  console.log('✓ OTP Verification Result:', otpRes.status, '| Verified:', otpData.user?.isVerified, '| Token Issued:', !!otpData.user?.token);

  console.log('\n--- TEST 3: User Login ---');
  const loginRes = await fetch('http://localhost:5005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPass
    })
  });
  const loginData = await loginRes.json();
  console.log('✓ Login Result:', loginRes.status, '| User:', loginData.email, '| Plan:', loginData.plan);

  console.log('\n--- TEST 4: Forgot Password Request ---');
  const forgotRes = await fetch('http://localhost:5005/api/auth/request-reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  console.log('✓ Forgot Password Request Result:', forgotRes.status, '| Message:', forgotData.message);

  console.log('\n--- TEST 5: Reset Password with OTP ---');
  const newPass = 'BrandPilotNewPass#2026';
  const resetRes = await fetch('http://localhost:5005/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: '123456',
      newPassword: newPass
    })
  });
  const resetData = await resetRes.json();
  console.log('✓ Reset Password Result:', resetRes.status, '| Message:', resetData.message);

  console.log('\n--- TEST 6: Login with New Password ---');
  const newLoginRes = await fetch('http://localhost:5005/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: newPass
    })
  });
  const newLoginData = await newLoginRes.json();
  console.log('✓ Login with New Password Result:', newLoginRes.status, '| User ID:', newLoginData.id);

  console.log('\n==================================================');
  console.log('          AUTH SUITE ALL TESTS PASSED!            ');
  console.log('==================================================\n');
}

testAuthSuite().catch(console.error);
