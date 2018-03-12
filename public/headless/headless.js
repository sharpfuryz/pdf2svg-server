const axios = require('axios');
const PDFJS = require('pdfjs-dist');
// IPC
// GET /api/v1/pdf/latest
//  returns id, contents
// POST /api/v1/pdf/:id/page ... items, images, styles, meta
// PUT /api/v1/pdf/:id { state: 1..2 }
const host = "http://localhost:8080";
const updateState = (id, state) => {
    return axios({
        method: 'put',
        url: `${host}/api/v1/pdf/${id}/${state}`
    });
}
const getBlobFromURL = (url) => {
    return new Promise((resolve) => {
        axios({
            method: 'get',
            url: url, // blob:http://127.0.0.1:8000/e89c5d87-a634-4540-974c-30dc476825cc
            responseType: 'blob'
        }).then((response) =>{
            const reader = new FileReader();
            reader.readAsDataURL(response.data); 
            reader.onloadend = function() {
                const base64data = reader.result;
                resolve(base64data);
            }
        })
    })
}
const uploadImage = (base64) => {
    console.log('Push image');
    return axios({
        method: 'post',
        url: `${host}/api/v1/image`,
        data: {
            base64: base64
        }
    });
}
const addPage = (id, object) => {
    return axios({
        method: 'POST',
        url: `${host}/api/v1/pages`,
        data: object
    })
}
const processLastDocument = async () => {
    try{
        const res = await axios.get(`${host}/api/v1/pdf_latest`)
        const id = res.data.id;
        const filename = res.data.filename;
        const pdf = await PDFJS.getDocument(`${host}${filename}`);
        const pages_array = fillPagesArray(pdf.numPages);
        const s1 = await updateState(id, 1);
        const s2 = await pagesPromiseFactory(id, pdf, pages_array);
    } catch (e) {
        console.log(e);
        console.log('SIGNAL_CLOSE');
    }
}
// returns 1..numPages as [1],[2],[3]...[numPages]
function fillPagesArray(num){
    let array = [];
    for (let i = 1; i <= num; i++) {
        array.push(i)
    };
    return array;
}
// function writeItem(page_object, item){
//     // TODO: put transformations here
//     page_object.items.push({ json: JSON.stringify(item) });
//     return page_object;
// }
// function writeStyle(page_object, item){
//     // TODO: put transformations here
//     page_object.styles.push({ json: JSON.stringify(item) });
//     return page_object;
// }
// async function parseItems(page_object, items){
//     const item = items.shift();
//     if(item){
//         page_object = writeItem(page_object, item);
//         parseItems(page_object, items);
//     } else {
//         return page_object;
//     }
// }
// async function parseStyles(page_object, styles, isKeys){
//     if(!isKeys){
//         styles = Object.keys(styles);
//     }
//     const style = styles.shift();
//     if(style){
//         page_object = writeStyle(page_object, styles[style]);
//         parseStyles(page_object, styles, true);
//     } else {
//         return page_object;
//     }
// }
// Option 1: just return empty object data and crawl data from SVg
async function parseObjects(page_object, page_instance) {
    return page_object;
}
// Options 2: fill object from PDF.js raw data
// async function parseObjects(page_object, page_instance){
//     // Parse text blocks
//     const content = await page_instance.getTextContent();
//     page_object.items = content.items;
//     page_object.styles = content.styles;
//     // if(content.items.length > 0){ page_object = await parseItems(page_object, content.items); }
//     // if(content.styles){  page_object = await parseStyles(page_object, content.styles, false); }
//     const opList = await page_instance.getOperatorList();
//     // In opList image could be stored as jpeg, png, svg, bmp or any other kind
//     // My implementation will support only jpeg to be simple (all other formats should be paid additionaly)
//     // TODO: Parse graphic blocks
//     const objs = [];
//     for (var i=0; i < opList.fnArray; i++) {
//         console.log(PDFJS.OPS);
//         if (opList.fnArray[i] == PDFJS.OPS.paintJpegXObject) {
//             objs.push(opList.argsArray[i][0])
//         }
//     }
//     objs.map((obj) => {
//         page_object.images.push(page_instance.objs.get(obj));
//     })
//     return page_object;
// }
// 
function parsePage(id, pdf, page_number){
    return new Promise((resolve) => {
        pdf.getPage(page_number).then((page) => {
            console.log(`Parsing page: ${page_number}`);
            const view = page.pageInfo.view;
            const page_object = { 
                meta: { document_id: id, 
                    top: view[0], 
                    left: view[1], 
                    width: view[2], 
                    height: view[3], 
                    number: page_number
                },
                items: [],
                styles: [],
                images: []
            };
            parseObjects(page_object, page).then((page_object) => {
                renderPage(page);
                renderPageSVG(page, page_object).then(() => {
                    addPage(id, page_object).then(() => {
                        resolve();
                    });
                });
            })
        });
    });
}
// requirements
function renderPage(page) {
    const scale = 1.0;
    const viewport = page.getViewport(scale);
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    page.render(renderContext);
}
function processImage(svg_image){
    return new Promise((resolve) => {
        const url = svg_image.getAttribute("xlink:href");
        getBlobFromURL(url).then((base64) => {
            uploadImage(base64).then((response) => {
                svg_image.setAttribute("xlink:href", response.data.url);
                resolve();
            });
        });
    });
}
function putImages(page_object, svg_images){
    return new Promise((resolve) => {
        const svg_image_promises = [];
        const array = [];
        var i;
        for (i = 0; i < svg_images.length; i++) { array.push(svg_images[i]); }

        let pf = (array) => {
            return new Promise((res) => {
                let elem = array.shift();
                if(elem) {
                    processImage(elem).then(() => {
                        return pf(array)
                    })
                }else{
                    resolve();
                }
            })
        }
        pf(array);
    })
    
}
// Parsing from SVG is much obvious than raw data from PDF.js
// No parsing yet in this function
// Just pass raw svg; stub
function parsePageFromSVG(page_object, svg){
    return new Promise((resolve) => {
        // TODO: get images
        const svg_images = document.getElementsByTagName('svg:image');
        putImages(page_object, svg_images).then(() => {
            page_object.meta.svg = svg.innerHTML;
            resolve();
        })
    })
}
function renderPageSVG(page, page_object){
    return new Promise((resolve) => {
        const scale = 1.0;
        const viewport = page.getViewport(scale);
        const container = document.getElementById('svg');
        container.style.width = viewport.width + 'px';
        container.style.height = viewport.height + 'px';
        page.getOperatorList()
            .then((opList) => {
                const svgGfx = new PDFJS.SVGGraphics(page.commonObjs, page.objs);
                return svgGfx.getSVG(opList, viewport);
            })
            .then((svg) => {
                // Remove other pages from svg
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }
                //
                container.appendChild(svg);
                parsePageFromSVG(page_object, container).then(() => {
                    resolve();
                });
            });
    });
}
function pagesPromiseFactory(document_id, pdf, pages_array){
    return new Promise((resolve) => {
        if(pages_array.length < 1) { 
            resolve(); 
        }
        let page_number = pages_array.shift();
        if(page_number){
            parsePage(document_id, pdf, page_number).then( () => {
                return pagesPromiseFactory(document_id, pdf, pages_array);
            })
        }else{
            updateState(id, 2).then(() => {
                console.log('SIGNAL_CLOSE'); // close chromium
            });
        }
    });
}

module.exports = {processLastDocument: processLastDocument};
