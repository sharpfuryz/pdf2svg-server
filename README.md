# pdf2svg server and client
## What and why?
This project is nodejs server with react+redux frontend, this is server side with bundled precompiled react+redux app. User uploads PDF, service create subprocess with [puppetter](https://github.com/GoogleChrome/puppeteer)  (Chrome) where you can see how it works page-by-page, pages put to sqlite database as SVG: images extracted seperately to folder public/images, this part of app is based on [PDF.js](https://mozilla.github.io/pdf.js/). After pdf is processed - you can check it and preview online. There are few example features: deleting selected image, changing text block's color to random value and send back to server.
### Why it is parsed to SVG, not HTML?
It is possible to parse it to HTML, but in order to make this proof-of-concept faster - I've chosen SVG, because in this case I don't need to do Math on render for text blocks. In fact you can spent 5+ hours to convert this svg to html.
### Why pages send encrypted/deflated? 
One of the concepts: make page loading faster and impossible to deconvert for scriptkiddies.
## How can I use it?
```
git clone https://github.com/sharpfuryz/pdf2svg-server
yarn install   ( or npm install)
yarn serve ( or npm run serve)
```
