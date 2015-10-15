var app     =     require("express")();
var mysql   =     require("mysql");
var http    =     require('http').Server(app);
var io      =     require("socket.io")(http);

/* Creating POOL MySQL connection.*/



var pool    =    mysql.createPool({
      connectionLimit   :   100,
      host              :   'localhost',
      user              :   'root',
      password          :   '',
      database          :   'notificationsnode',
      debug             :   false
});



app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

// io.on('connection',function(socket){
//     console.log("A user is connected");
//     socket.on('status added',function(status){
//       add_status(status,function(res){
//         if(res){
//             io.emit('refresh feed',status);
//         } else {
//             io.emit('error');
//         }
//       });
//     });
// });
// io.configure(function () {
//   io.set("transports", ["xhr-polling"]);
//   io.set("polling duration", 10);
// });

io.on('connection',function(socket){
  //io.set('origins', '*');
  //io.set('origins', 'http://kibriaali.co.uk:3306');
  //io.set("transports", ["polling"]);
  //io.set("polling duration", 10);
    console.log("A user is connected");
    socket.on('notification added',function(text,img,sound){
      add_notification(text, img, sound,function(res){
        if(res){
            io.emit('refresh feed',text,img,sound);
        } else {
            io.emit('error');
        }
      });
    });
});


var add_notification = function (text,img,sound,callback) {
    pool.getConnection(function(err,connection){
        if (err) {
          connection.release();
          callback(false);
          return;
        }
        console.log("INSERT INTO `notification` (`text`, `image`, `sound`) VALUES ('"+text+"', '"+img+"', '"+sound+"')");
    connection.query("INSERT INTO `notification` (`text`, `image`, `sound`) VALUES ('"+text+"', '"+img+"', '"+sound+"')",function(err,rows){
            //connection.release();
            if(!err) {
              callback(true);
            }
        });
     connection.on('error', function(err) {
              callback(false);
              console.log(err);
              return;
        });
    });
}

http.listen(process.env.PORT || 3000,function(){
    // console.log("Listening on 3000");
});
