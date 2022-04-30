// Core Modules:
const fs = require('fs');
const http = require('http');
const url = require('url');

const slugify = require('slugify');

// Own Modules:
const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////////////////////////////////////////////////
//Filesystem
// Blocking synchronous way
// const textIn = fs.readFileSync('./txt/input.txt', 'utf8');
// console.log(textIn);
// const textOut = `This is what we know about avocado: ${textIn}.\nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log('File written successfully.');
// Non-blocking asynchronous way
fs.readFile('./txt/start.txt', 'utf8', (err, data1) => {
  if (err) return console.log('Error: ', err);
  fs.readFile(`./txt/${data1}.txt`, 'utf8', (err, data2) => {
    fs.readFile('./txt/append.txt', 'utf8', (err, data3) => {
      console.log(data3);
      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf8', (err) => {});
    });
  });
});

///////////////////////////////////////////////////////////////////////////////
// Server

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf8');
const dataObj = JSON.parse(data);

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf8');

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);
  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);
  }
  // Product page
  else if (pathname === '/product') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  }
  // API
  else if (pathname === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
  }
  // Not found
  else {
    res.writeHead(404, {
      'Content-type': 'text/html',
    });
    res.end('<h1>Page not found!</h1>');
  }
});
// Server listening on server (project.probirsarkar.in/node-farm)
server.listen(process.env.PORT || 3000, () => {
  console.log('Server is running...');
});
// Server listening on localhost:3000
// server.listen(3000, () => {
//   console.log('Server is running...');
// }
// Server listening on localhost:3000
