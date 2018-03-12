const zlib = require('zlib');

// pako
const decrypt = (json) => {
    let bindata = json.bindata;
    let buf = Buffer.from(bindata, 'base64');
    try {
        let result = zlib.inflateSync(buf).toString('base64');
        return JSON.parse(result);
    } catch (err) {
        console.log(err);
    }
}
const precrypt = (object) => {
    const prebinary = JSON.stringify(object);
    let input = Buffer(prebinary, 'utf8');
    return zlib.deflateSync(input).toString('base64');
}
const extractIds = (raw_data) => {
    const ids = [];
    raw_data.map((res) => {
        ids.push(res.id);
    });
    return ids;
}
const updatePage = (id, svg, knex) => {
    return new Promise((resolve) => {
        knex('pages').where({id: id}).update({ svg: svg }).then((results) => {
            let base64 = precrypt(results);
            resolve({
                state: 'okay',
                bindata: base64
            })
        })
    })
}
const serveDocument = (id, knex) => {
    return new Promise((resolve) => {
        knex('documents').where({id: id}).then((documents) => {
            if(documents.length > 0){
                knex('pages').select('id').where({document_id: id}).then((results) => {
                    let document = documents[0];
                    document.pages = extractIds(results);
                    let base64 = precrypt(document);
                    resolve({
                        state: 'okay',
                        bindata: base64
                    });
                })
            } else {
                resolve({ state: 'error' });
            }
        });
    })
};
const servePage = (id, knex) => {
    return new Promise((resolve) => {
        knex('pages').where({id: id}).then((results) => {
            if(results.length > 0){
                let page = results[0];
                let base64 = precrypt(page);
                resolve({
                    state: 'okay',
                    bindata: base64
                })
            }else{
                resolve({
                    state: 'error'
                })
            }
        });
    })
};
const api_object = {
    document: serveDocument,
    page: servePage,
    updatePage: updatePage
};
module.exports = api_object;