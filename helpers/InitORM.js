const initorm = async function(){
    // Connection

    const knex = require('knex')({
        client: 'sqlite3',
        connection: {
          filename: "./db.sqlite"
        },
        useNullAsDefault: true
    });

    // Simplified migrations 

    function createDocumentsTable(){
        return knex.schema.createTableIfNotExists('documents', (table) => {
            table.increments();
            table.string('title');
            table.string('filename');
            table.string('filepath');
            table.integer('state');
            table.timestamps();
        })
    }
    function createPagesTable(){
        return knex.schema.createTableIfNotExists('pages', (table) => {
            table.increments();
            table.integer('document_id');
            table.integer('number');
            table.text('svg');
            table.float('top');
            table.float('left');
            table.float('width');
            table.float('height');
        })
    }
    function createItemsTable(){
        return knex.schema.createTableIfNotExists('items', (table) => {
            table.increments();
            table.integer('page_id');
            table.text('json');
        })
    }
    function createStylesTable(){
        return knex.schema.createTableIfNotExists('styles', (table) => {
            table.increments();
            table.integer('page_id');
            table.text('json');
        })
    }
    function createImagesTable(){
        return knex.schema.createTableIfNotExists('images', (table) => {
            table.increments();
        })
    }
    function createIndexes(){
        return true; // Not implemented yet
    }

    // Wait promises to complete

    try{
        await createDocumentsTable();
        await createPagesTable();
        await createItemsTable();
        await createStylesTable();
        await createImagesTable();
        await createIndexes();
    } catch (e) {
        console.log(e);
    }

    // Return ORM instance
    return knex;
}
module.exports = initorm;