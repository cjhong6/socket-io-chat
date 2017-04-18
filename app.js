var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socket_io  = require( "socket.io" );
var username = [];

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Socket.io
var io = socket_io();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//socket.io connection events
io.on( "connection", function( socket )
{
    console.log('connected');
    socket.on('send message',function(data){
      //brocast the message(data) back to the all the clients side
      console.log('Message: ' + data);
      io.sockets.emit('new message', {message: data, username: socket.username});
    });

    socket.on('new user', function(data, callback){
        console.log('User: ' + data);
        if(username.indexOf(data) != -1){
          //user exist
          callback(false);
        }
        else{
          callback(true);
          socket.username = data; //add the username to the socket
          username.push(socket.username);//add username to the arry
          io.sockets.emit('username', username);
        }
    });
});

module.exports = app;
