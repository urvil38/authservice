'use strict';

const express    = require('express');
const app        = express();
const bodyParser = require('body-parser');
const logger     = require('morgan');
const favicon    = require('serve-favicon');
const path       = require('path');
const router     = express.Router();
const port       = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(favicon(path.join(__dirname,'public','favicon.ico')))

app.use(logger('combined'));

require('./routes')(router);
app.use('/v1', router);

app.get('/', (req,res) => res.end("welcome to service"));

app.get('/_ah/health',(req,res) => {
    res.sendStatus(200)
    res.end()
})

app.listen(port,() => {
    console.log(`app running on port ${port}`);
})
