describe('test google.com', () => {
    const {
        Builder,
        By,
        Key,
        until
    } = require('selenium-webdriver');
    var driver;
 
    beforeEach(() => {
        driver = new Builder()
            .forBrowser('chrome')
            .build();
    });
 
    afterEach(() => {
        driver.quit();
    });
 
    it('should open blackjack game', async () => {
        await driver.get('http://localhost:3000');
        driver
            .getTitle()
            .then(title => {
                expect(title).toEqual('Blackjack');
            });
    }); 
});