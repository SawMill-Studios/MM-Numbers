const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  
  // Catch JS errors
  page.on('pageerror', err => errors.push(`JS ERROR: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE ERROR: ${msg.text()}`);
  });

  console.log('🧪 Loading page...');
  await page.goto('http://localhost:3002/index.html', { waitUntil: 'networkidle' });

  // Test 1: Grid renders with 100 squares
  const squares = await page.$$('.cell-name');
  console.log(`✅ Grid squares: ${squares.length} (expected 100)`);
  if (squares.length !== 100) errors.push(`Grid has ${squares.length} squares, expected 100`);

  // Test 2: My square (#39) is highlighted
  const mySquare = await page.$('.cell-name.my-square');
  const mySquareText = mySquare ? await mySquare.textContent() : null;
  console.log(`✅ My square highlighted: ${mySquareText ? 'YES — ' + mySquareText.trim() : 'NO'}`);
  if (!mySquareText || !mySquareText.includes('Darren')) errors.push('My square #39 not highlighted');

  // Test 3: Friend square (#78) is highlighted
  const friendSquare = await page.$('.cell-name.friend-square');
  const friendText = friendSquare ? await friendSquare.textContent() : null;
  console.log(`✅ Friend square highlighted: ${friendText ? 'YES — ' + friendText.trim() : 'NO'}`);
  if (!friendText || !friendText.includes('J&M')) errors.push('Friend square #78 not highlighted');

  // Test 4: Schedule section exists
  const schedSection = await page.$('#schedule');
  console.log(`✅ Schedule section: ${schedSection ? 'EXISTS' : 'MISSING'}`);
  if (!schedSection) errors.push('Schedule section missing');

  // Wait for games to load (up to 15 seconds for API)
  console.log('🧪 Waiting for live scores to load...');
  try {
    await page.waitForTimeout(10000);
  } catch (e) {
    console.log(`⚠️ Page closed during wait: ${e.message}`);
  }

  // Test 5: Check if games loaded or error message
  const gameCards = await page.$$('.sched-game');
  const errorMsg = await page.$('.sched-loading');
  const errorText = errorMsg ? await errorMsg.textContent() : '';
  
  if (gameCards.length > 0) {
    console.log(`✅ Games loaded: ${gameCards.length} games rendered`);
    
    // Test 6: Check game states render properly
    const finalGames = await page.$$('.sched-game.final');
    const liveGames = await page.$$('.sched-game.live');
    const preGames = await page.$$('.sched-game.pre');
    console.log(`   Finals: ${finalGames.length} | Live: ${liveGames.length} | Upcoming: ${preGames.length}`);
  } else {
    console.log(`❌ No games rendered. Message: "${errorText.trim()}"`);
    errors.push(`Games failed to load: ${errorText.trim()}`);
  }

  // Test 7: No JS errors
  if (errors.length === 0) {
    console.log('\n🎉 ALL TESTS PASSED');
  } else {
    console.log(`\n❌ ${errors.length} ISSUE(S):`);
    errors.forEach(e => console.log(`   • ${e}`));
  }

  // Screenshot for visual review
  await page.screenshot({ path: 'test-screenshot.png', fullPage: true });
  console.log('\n📸 Screenshot saved: test-screenshot.png');

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
