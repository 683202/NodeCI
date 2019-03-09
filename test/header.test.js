// const puppeteer = require('puppeteer');
// const sessionFactory = require('./factories/sessionFactory');
// const userFactory = require('./factories/userFactory');
const Page = require('./helpers/page');
// const mongoose = require('mongoose');
let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    // await browser.close();
    await page.close();
});

test('The header of the page has the correct text', async () => {

    const text = await page.$eval('a.brand-logo', el => el.innerHTML);

    expect(text).toEqual('Blogster');
});

test('clicking login starts oAuth flow', async () => {

    await page.click('.right a');
    const url = await page.url();
    console.log(url);
    expect(url).toMatch(/accounts.google.com/);

});

test('should show logOut button for already logged in users', async () => {
    await page.login();
    // const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    const text = await page.getContentsOf('a[href="/auth/logout"]');
    expect(text).toEqual('Logout');
});
