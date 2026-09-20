import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Listen to console logs
        page.on('console', msg => {
            console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
        });

        // Listen for uncaught exceptions inside the page
        page.on('pageerror', error => {
            console.log(`[Browser PageError]: ${error.message}`);
        });

        page.on('response', response => {
            if (!response.ok()) {
                console.log(`HTTP ${response.status()} for ${response.url()}`);
            }
        });

        console.log('Navigating to http://localhost:3200...');
        await page.goto('http://localhost:3200', { waitUntil: 'networkidle2' });

        // Get body content securely
        const content = await page.content();
        console.log('HTML Dump Length:', content.length);
        if (content.indexOf('<div id="root"></div>') > -1) {
            console.log('Root is empty!');
        } else {
            console.log('Root seems to have content!');
        }

        await browser.close();
    } catch (err) {
        console.error('Puppeteer Script Error:', err);
    }
})();
