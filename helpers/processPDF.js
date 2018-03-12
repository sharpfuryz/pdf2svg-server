const path = require('path');
const puppeteer = require('puppeteer');

function spawnHeadless(file_path, file_object, knex){
    (async () => {
        console.log('Putting PDF Document into database...');
        const pretty_title = file_object.name.split('.pdf')[0]; // unsafe
        const document_attrs = { title: pretty_title, filename: file_object.name, filepath: file_path, state: 0 };
        const ids = await knex('documents').insert(document_attrs);
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto("http://localhost:8080/headless/index.html");
        page.on('console', msg => {
            if(msg.text().indexOf('SIGNAL_CLOSE') > -1){
                browser.close().then(() => {
                    console.log('Puppetter closed');
                })
            }
        });
    })();
}
const ex = function(file_object, knex){
    // Notice: knex is dependecy injection to reuse connection pool
    // Notice: mv is internal function of file_object
    file_object.name = file_object.name.split(' ').join('_'); // TODO: valid escape 
    const file_path = path.resolve(__dirname, '..' ,'public', 'uploads', file_object.name);
    file_object.mv(file_path, (err) => {
        err ? console.log(err) : spawnHeadless(file_path, file_object, knex);
    });
}

module.exports = ex;