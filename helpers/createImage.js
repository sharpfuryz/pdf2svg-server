const fs = require('fs');
const path = require('path');
const host = "http://localhost:8080";

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

const ex = function(json, knex){
    return new Promise((resolve) => {
        // Usually I store this into db, but thing is: it is environment with 1 thread, so UUID is enough
        // TODO: database/ORM support should be added here to clean up images properly
        // TODO: png support should be added here
        const base64Data = json.base64.replace(/^data:image\/jpeg;base64,/, "");
        const filename = `${uuidv4()}.jpg`;
        const filepath = path.resolve(__dirname, '..' ,'public', 'uploads', 'images', `${filename}`);
        const remote_filepath = `${host}/uploads/images/${filename}`;
        fs.writeFile(filepath, base64Data, 'base64', (err) => {
            resolve(remote_filepath);
        })
    });
}
module.exports = ex;