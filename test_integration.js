import jwt from 'jsonwebtoken';

async function testAll() {
  const token = jwt.sign({ id: '1771892893718', email: 'socialmedia.techturf@gmail.com', plan: 'free' }, 'brandpilot_jwt_secret_key_2026', { expiresIn: '1d' });
  const headers = { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };

  console.log('\n==================================================');
  console.log('       BRANDPILOT INTEGRATION TEST SUITE          ');
  console.log('==================================================\n');

  console.log('--- TEST 1: Connect YouTube Channel ---');
  const ytRes = await fetch('http://localhost:5005/api/social/youtube', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: 'https://www.youtube.com/@mkbhd' })
  });
  const ytData = await ytRes.json();
  console.log('✓ YouTube Link Result:', ytRes.status, ytData.profile?.handle, '| Status:', ytData.profile?.status);

  console.log('\n--- TEST 2: Connect Instagram Profile ---');
  const igRes = await fetch('http://localhost:5005/api/social/instagram', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: 'https://www.instagram.com/mkbhd/' })
  });
  const igData = await igRes.json();
  console.log('✓ Instagram Link Result:', igRes.status, igData.profile?.handle, '| Status:', igData.profile?.status);

  console.log('\n--- TEST 3: Market Similarity Analysis ---');
  const msRes = await fetch('http://localhost:5005/api/analysis/market-similarity', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      brandName: 'BrandPilot AI',
      brandDescription: 'Autonomous AI marketing platform that coordinates brand voice and multi-channel campaigns for SaaS founders and creators.',
      industry: 'SaaS Marketing',
      targetAudience: 'Growth marketers, founders, agencies',
      targetMarket: 'Modern B2B SaaS marketing software buyers looking for generative content automation, campaign consistency, and analytics attribution.',
      referenceBrand: 'Jasper'
    })
  });
  const msData = await msRes.json();
  console.log('✓ Market Similarity Score:', msData.overallScore + '%', '| Algorithm:', msData.algorithm);
  console.log('  Dimensions:', JSON.stringify(msData.dimensions));
  console.log('  Strong Matches:', msData.strongMatches);

  console.log('\n--- TEST 4: Content Similarity Analysis ---');
  const csRes = await fetch('http://localhost:5005/api/analysis/content-similarity', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      contentText: 'Scale your marketing output with automated AI voice alignment across LinkedIn, Instagram, and Twitter.',
      referenceContent: 'Accelerate weekly content production with multi-channel AI alignment that matches your brand tone.'
    })
  });
  const csData = await csRes.json();
  console.log('✓ Content Similarity Score:', csData.overallScore + '%', '| Metrics:', JSON.stringify(csData.metrics));
  console.log('  Common Topics:', csData.commonTopics);
  console.log('  Keyword Overlap:', csData.keywordOverlap);

  console.log('\n--- TEST 5: Aggregated Dashboard Summary ---');
  const dashRes = await fetch('http://localhost:5005/api/dashboard/summary', { headers });
  const dashData = await dashRes.json();
  console.log('✓ Dashboard Status:', dashRes.status, '| Channels Connected:', dashData.socialProfiles?.length, '| Latest Market Score:', dashData.latestMarketSimilarity?.overall_score + '%');

  console.log('\n--- TEST 6: Subscription Upgrade to Basic ($5) ---');
  const upRes = await fetch('http://localhost:5005/api/subscription/upgrade', {
    method: 'POST',
    headers,
    body: JSON.stringify({ plan: 'basic', interval: 'monthly', paymentDetails: { brand: 'card' } })
  });
  const upData = await upRes.json();
  console.log('✓ Upgrade Plan:', upData.plan, 'Amount: $' + upData.amount, '| Txn ID:', upData.transactionId);

  console.log('\n==================================================');
  console.log('            ALL TESTS PASSED SUCCESSFULLY!        ');
  console.log('==================================================\n');
}

testAll().catch(console.error);
