# pdf2svg node
## What and why?
This project consists of nodejs server (this repo) and [react+redux frontend](https://github.com/sharpfuryz/pdf2svg-server), this is server side with bundled precompiled react+redux app. User uploads PDF, service create subprocess with [puppetter](https://github.com/GoogleChrome/puppeteer)  (Chrome) where you can see how it works page-by-page, pages put to sqlite database as SVG: images extracted seperately to folder public/images, this part of app is based on [PDF.js](https://mozilla.github.io/pdf.js/). After pdf is processed - you can check it and preview online. There are few example features: deleting selected image, changing text block's color to random value and send back to server.
### Dependecies
- [Nodejs 8.x](https://nodejs.org/en/)
- [Expressjs](http://expressjs.com/ru/)
- [PDF.js](https://mozilla.github.io/pdf.js/)
- [puppetter](https://github.com/GoogleChrome/puppeteer)
- [SemanticUI](https://semantic-ui.com/)
### Why it is parsed to SVG, not HTML?
It is possible to parse it to HTML, but in order to make this proof-of-concept faster - I've chosen SVG, because in this case I don't need to do Math on render for text blocks. In fact you can spent 5+ hours to convert this svg to html. Also SVG has advantages if you need to make it is as simple as possible to view it on mobile devices.
### What should I do to make it production ready?
- Use message queue to process PDF
- Switch from sqlite3 to something like postgres
- Add real encryption to client-server page api
- Add caching for pages
- Store images properly
- Add png support
- Check all the TODOs
- Add tests for key APIs
### Why pages send encrypted/deflated? 
One of the concepts: make page loading faster and impossible to deconvert for scriptkiddies.
## How can I use it?
```
git clone https://github.com/sharpfuryz/pdf2svg-server
yarn install   ( or npm install )
yarn serve ( or npm run serve )
```
