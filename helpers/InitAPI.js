const processPDF  = require('./processPDF');
const createPage  = require('./createPage');
const createImage = require('./createImage');
const binaryAPI   = require('./binaryAPI');
const fs          = require('fs');

const ex = async function(app, knex){
    // Some constatns, which usually placed into ORM abstraction
    const documents_table = "documents";
    // APIs for react
    // ordinary json
    app.get('/api/v1/pdf.json', async function(req, res) {
        const documents = await knex(documents_table).select();
        res.jsonp(documents);
    });
    // binary format here
    app.get('/api/v1/pdf/:id', (req, res) => {
        let id = req.params.id;
        binaryAPI.document(id, knex).then((data) => {
            res.jsonp(data);
        })
    });
    app.get('/api/v1/page/:id', (req, res) => {
        let id = req.params.id;
        binaryAPI.page(id, knex).then((data) => {
            res.jsonp(data);
        })
    });
    app.put('/api/v1/page/:id', (req, res) => {
        let id = req.params.id;
        binaryAPI.updatePage(id, req.body.svg, knex).then((data) => {
            res.jsonp(data);
        })
    });
    //
    // Headless API
    //
    // Latest
    app.get('/api/v1/pdf_latest', (req, res) => {
        knex(documents_table).where({state: 0}).then((latest_pdf) => {
            const latest = latest_pdf[0];
            if(latest){
                res.jsonp({
                    id: latest.id,
                    filename: `/uploads/${latest.filename}`
                });
            }else{
                res.jsonp({error: 'Empty PDF list'});
            }
        })
    });
    // Let's change state of our pdf
    app.put('/api/v1/pdf/:id/:state', (req, res) => {
        let state = req.params.state;
        knex(documents_table).where({id: req.params.id}).update({state: state}).then((state) => {
            res.jsonp({state: state});
        });
    });
    app.post('/api/v1/pages', (req, res) => {
        createPage(req.body, knex).then((state) => {
            res.jsonp({state: state});
        })
    });
    app.post('/api/v1/image', (req, res) => {
        createImage(req.body, knex).then((filepath) => {
            res.jsonp({ url: filepath });
        });
    });
    // Upload part
    // reference: express-fileupload
    // URL-sugar
    app.get('/upload', (req, res) => {
        res.redirect('/upload.html');
    });
    app.post('/upload', (req, res) => {
        if (!req.files){
            return res.status(400).send('No files were uploaded.')
        } else {
            const file = req.files.pdf_file;
            processPDF(file, knex); // creates a fiber and release event queue
            res.redirect('/');
        }
    });
    return true;
}
module.exports = ex;