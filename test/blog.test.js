const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
        await page.goto('http://localhost:3000/blogs/new');
    });

    test('can see blog create form', async () => {
        let url = await page.url();
        expect(url).toEqual('http://localhost:3000/blogs/new');
        text = await page.getContentsOf('form label');
        expect(text).toEqual('Blog Title');
    });

    describe('And using valid inputs', () => {
        const title = 'TEST'
        const content = 'TEST'
        beforeEach(async () => {
            await page.type('.title input', title);
            await page.type('.content input', content);
            await page.click('form button');
        });

        test('submitting form takes user to review screen', async () => {
            const review = await page.getContentsOf('h5');
            expect(review).toEqual('Please confirm your entries');
        });

        test('clicking the save button should save the title and content to the DB.', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const titleText = await page.getContentsOf('.card-content .card-title');
            const contentText = await page.getContentsOf('.card-content p');
            expect(titleText).toEqual(title);
            expect(contentText).toEqual(content);
        });
    });

    describe('And using invalid inputs', () => {

        beforeEach(async () => {
            await page.click('form button');
        });
        
        test('the test shows an error message', async () => {
            text = await page.getContentsOf('.title .red-text');
            expect(text).toEqual('You must provide a value');
        });

        test('the test shows an error message', async () => {
            text = await page.getContentsOf('.content .red-text');
            expect(text).toEqual('You must provide a value');
        });

    });
    
});

describe('When a user is not logged in', () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },

        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'T',
                content: 'c'
            }
        }
    ];

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for(let result of results)
            expect(result).toEqual({ error: 'You must log in!' });
    });
});
