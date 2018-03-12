const ex = function(json, knex){
    return new Promise((resolve) => {
        // json.meta --> page
            //  document_id: 1,
            //  top: 0,
            //  left: 0,
            //  width: 385.51,
            //  height: 629.29,
            //  number: 44,
            //  svg: svg_code
        // json.items --> items
        // json.styles --> styles
        // json.images --> images
        json.meta.svg = json.meta.svg.replace(/\:svg/g,"");
        json.meta.svg = json.meta.svg.replace(/svg\:/g,"");
        knex('pages').insert(json.meta).then(() => {
            resolve(true);
        });
    });
}
module.exports = ex;