describe('general tests', () => {
    const {
        Builder,
        By,
        Key,
        until
    } = require('selenium-webdriver');
    var driver;
    var server = require("../server.js")
 
    beforeEach(async () => {
        await driver.findElement(By.id('deal')).click();
    });

    beforeAll(async () => {
        await server.start();
        driver = new Builder()
            .forBrowser('chrome')
            .build();
        await driver.get('http://localhost:3000');
        //await driver.findElement(By.id('deal')).click();
    });
 
    afterEach(async () => {
        await driver.navigate().refresh();
    });

    afterAll(() => {
        driver.quit();
    });

    /*-----GENERAL TESTS-----*/
 
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

    /*-----HUMAN PLAYER TESTS-----*/

    test('test bust and lose', async () => {
        await server.rigHands([10,11], [1,2], [4,5]); //start with 21
        await driver.findElement(By.id('hit')).click(); //will go over 21
        
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("You Busted");
        });
    });

    test('test hit without bust', async () => {
        await server.rigHands([2,3], [6,5], [9,10]); //start with 5
        await driver.findElement(By.id('hit')).click(); //will never go over 21
        
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual(""); //Nothing if game is ongoing
        });
    });

    test('test stand and beat dealer', async () => {
        await server.rigHands([10,11], [5,6], [8,9]);
        
        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("You Win");
        });
    });

    test('test stand and lose to dealer', async () => {
        await server.rigHands([8,9], [5,6], [10,11]);
        
        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("You Lose");
        });
    });

    test('test stand and beat dealer when points both 21', async () => {
        await server.rigHands([1,10], [5,6], [6,6,9]);
        
        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("You Win");
        });
    });

    test('test stand and lose to dealer when points both 21', async () => {
        await server.rigHands([3,4,5,5], [5,6], [0,9]);
        
        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("You Lose");
        });
    });

    test('test player and dealer push', async () => {
        await server.rigHands([0,7], [5,6], [0,7]);
        
        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('result')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("Push");
        });
    });

    /*-----AI PLAYER TESTS-----*/

    test('AI bust and lose', async () => {
        await server.rigHands([1,2], [10,11,4], [4,5]);

        await driver.findElement(By.id('hit')).click();
        let res = await driver.wait(until.elementLocated(By.id('aiStatus')),10000);
        res.getText().then(async (text) => {
            expect(text).toEqual("Busted");
        });
    });

    /*-----DEALER BEHAVIOUR TESTS-----*/

    test('dealer hand < 18', async () => {
        await server.rigHands([3,2], [6,7], [4,5]);

        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('dealerCards')),10000);
        res.getText().then(async (text) => {
            expect(text.split(" ").length).toBeGreaterThan(2);
        });
    });

    test('dealer hand >= 18', async () => {
        await server.rigHands([3,2], [6,7], [10,10]);

        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('dealerCards')),10000);
        res.getText().then(async (text) => {
            expect(text.split(" ").length).toEqual(2);
        });
    });

    test('dealer hand == 18 with ace', async () => {
        await server.rigHands([3,2], [6,7], [1,5,2]);

        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('dealerCards')),10000);
        res.getText().then(async (text) => {
            expect(text.split(" ").length).toBeGreaterThan(2);
        });
    });

    test('dealer hand == 18 without ace', async () => {
        await server.rigHands([3,2], [6,7], [9,9]);

        await driver.findElement(By.id('stand')).click();
        let res = await driver.wait(until.elementLocated(By.id('dealerCards')),10000);
        res.getText().then(async (text) => {
            expect(text.split(" ").length).toEqual(2);
        });
    });

});