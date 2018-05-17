const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const router = require('./router');
const cors = require('cors');
const mongoose = require('mongoose');
const Stock = require('./models/stock');
//DB setup
mongoose.connect('mongodb://'+process.env.username+':'+process.env.password+'@ds127490.mlab.com:27490/stocks');
//app setup

app.use(morgan('combined'));
//type: */* tells bodyParser that it will parse any body request using json
app.use(cors());
app.use(bodyParser.json({type: '*/*'}));
//router(app) allows us to pass app into the file
router(app);
//server setup
const port = process.env.PORT || 3090;
const server = http.createServer(app);


//socket setup
const io = require('socket.io')(server);
io.on('connection', function(socket) {
    Stock.find({})
        .then((stocks) => {
            io.to(socket.id).emit('stock data', {data: stocks});
        })
    
    socket.on('new stock submitted', function(data) {
        Stock.find({})
            .then((stocks) => {
                submittedStock = data['checkResponse'];
                const newStock = new Stock({
                    symbol: submittedStock.symbol,
                    color: submittedStock.color
                });
                newStock.save()
                    .then((stock) => {
                        stocks.push(newStock);
                        io.emit('receive updated stocks', stocks);
                    })
                    .catch((error) => {
                        socket.emit('bad submission', {message: 'Symbol is already being displayed.'});
                    })
                
            })
    })
    socket.on('delete stock', function(data) {
        Stock.findOneAndRemove({symbol: data})
            .then((stock) => {
                io.emit('removed stock', stock);
            })
    })
});


server.listen(port);
console.log('serving listening on: ', port);

