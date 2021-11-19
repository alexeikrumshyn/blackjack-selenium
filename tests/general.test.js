describe('general tests', () => {
    const {
        Builder,
        By,
        Key,
        until
    } = require('selenium-webdriver');
    var driver;
 
    beforeEach(async () => {
        await driver.findElement(By.id('deal')).click();
    });

    beforeAll(async () => {
        driver = new Builder()
            .forBrowser('chrome')
            .build();
        await driver.get('http://localhost:3000');
        await driver.findElement(By.id('deal')).click();
    });
 
    afterEach(() => {
        driver.navigate().refresh();
    });

    afterAll(() => {
        driver.quit();
    });
 
    test('initial deal', async () => {
        let dealer = await driver.wait(until.elementLocated(By.id('dealerCards')),10000);
        dealer.getText().then(text => {
            expect(text).toContain("??");
            expect(text.split(" ")).toHaveLength(2); //?? indicates one hidden card
        })
        let cpu = await driver.wait(until.elementLocated(By.id('aiPlayerCards')),10000);
        cpu.getText().then(text => {
            expect(text).toContain("??");
            expect(text.split(" ")).toHaveLength(2); //?? indicates one hidden card
        })
        let p1 = await driver.wait(until.elementLocated(By.id('playerCards')),10000);
        p1.getText().then(text => {
            expect(text.split(" ")).toHaveLength(2); //2 visible cards
        })
    });

    test('test player choosing to hit', async () => {
        let initialScore = await driver.wait(until.elementLocated(By.id('playerScore')),10000);
        await driver.findElement(By.id('hit')).click();
        let cards = await driver.wait(until.elementLocated(By.id('playerCards')),10000);
        cards.getText().then(async (text) => {
            expect(text.split(" ")).toHaveLength(3); //should now have 3 cards
            let score = await driver.wait(until.elementLocated(By.id('playerScore')),10000);
            let cards = text.split(" ");
            let latestNum = cards[cards.length-1].match(/\d+/);
            expect(parseInt(score)).toEqual(parseInt(initialScore)+parseInt(latestNum));
        })
    });

    test('test player choosing to stand', async () => {
        await driver.findElement(By.id('stand')).click();
        let btn = await driver.wait(until.elementLocated(By.id('hit')),10000);
        btn.isEnabled().then(async (isEnabled) => {
            expect(isEnabled).toEqual(false); //hit button disabled means end of game
        })
    });

    test('test ability to start new game', async () => {
        await driver.findElement(By.id('stand')).click(); //end game
        let btn = await driver.wait(until.elementLocated(By.id('deal')),10000);
        btn.isEnabled().then(async (isEnabled) => {
            expect(isEnabled).toEqual(true); //deal button must be enabled to start new game
        })
    });
});