const { debug } = require('console');
const express = require('express'),
	socket = require('socket.io'),
	mysql = require('mysql');


const app = express();
const http = require('http');

var https = require('https');

var fs = require('fs');





const server = http.createServer(app);
const { Server } = require("socket.io");






const io = new Server(server);


//Arreglo de usuarios activos
var  users = [];
 var connectedUsers = new Object();

const expansionRoomLevel2 = 20;
const expansionRoomLevel3 = 30;



//Arreglo de mascotas Activas
const petsConnected = [];


//This funciton is needed to let some time pass by between conversation and closing. This is only for demo purpose.
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}




function getObjKey(obj, value) {
  return Object.keys(obj).find(key => obj[key] === value);
}


function GetSortOrder(prop) {
	return function (a, b) {
		if (a[prop] > b[prop]) {
			return 1;
		} else if (a[prop] < b[prop]) {
			return -1;
		}
		return 0;
	}
}

function makeid(length) {
	var result = '';
	var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() *
			charactersLength));
	}
	return result;
}


function countProperties(obj) {
	var count = 0;

	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			++count;
	}

	return count;
}

/*
db.connect(function (error) {
	if (!!error)
		throw error;

	console.log('mysql connected to ' + config.host + ", user " + config.user + ", database " + config.base);
});
*/




server.listen(3005, () => {
	console.log('listening on *:3005');
});


io.on('connection', (socket) => {
	console.log('a user connected');



	//Se desconecta y se elimina de la lista
	socket.on('disconnect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);


		if(users.length > 0)
        if(connectedUsers[socket.id] != null)
			if (connectedUsers[socket.id].clientId == socket.id) 
            {
				console.log("Usuario: " + connectedUsers[socket.id].username + " desconectado");
     // to all clients in the current namespace except the sender
  			//	socket.broadcast.emit("seDesconecto", connectedUsers[socket.id].username);

				delete  connectedUsers[socket.id];
            
            
            			for (var i = 0, len = users.length; i < len; ++i) {
									var c = users[i];

									if (c.clientId == socket.id) {

									users.splice(i, 1);
									break;
											}
							}
            
			}


		console.log("El numero de usuarios ahora es: " + users.length);

	});


	//Se desconecta y se elimina de la lista
	socket.on('disconnectLogout', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);


		if(users.length > 0)
        if(connectedUsers[socket.id] != null)
			if (connectedUsers[socket.id].clientId == socket.id) 
            {
				console.log("Usuario: " + connectedUsers[socket.id].username + " desconectado");
     // to all clients in the current namespace except the sender
  			//	socket.broadcast.emit("seDesconecto", connectedUsers[socket.id].username);

				delete  connectedUsers[socket.id];
            
            
            			for (var i = 0, len = users.length; i < len; ++i) {
									var c = users[i];

									if (c.clientId == socket.id) {

									users.splice(i, 1);
									break;
											}
							}
            
			}


		console.log("El numero de usuarios ahora es: " + users.length);

	});





	socket.on("UsuariosActivos", function (data) {

		console.log("El numero de usuarios es: " + users.length);




	});


	socket.on("conectado", function (data) {

		console.log("Se conecto el usuario: " + data);
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.username = data.toLowerCase();
    	
    
    
    
    					var clientInfoToEmit = new Object();
						clientInfoToEmit.username = data.toLowerCase();
    						clientInfoToEmit.socketid = socket.id;
    
    
                    			for (var i = 0, len = users.length; i < len; ++i) {
									var c = users[i];

									if (c.username == data.toLowerCase()) 
                                    
                                    {
											socket.broadcast.to(c.clientId).emit("disconnectFromSession", data.toLowerCase()); //sending to individual socketi
                                    		
                                    				if(users.length > 0)
        												if(connectedUsers[c.clientId] != null)
																if (connectedUsers[c.clientId].clientId == c.clientId) 
            														{
																		console.log("Usuario: " + connectedUsers[c.clientId].username + " desconectado");
    																	 // to all clients in the current namespace except the sender
  																	//	socket.broadcast.emit("seDesconecto", connectedUsers[c.clientId].username);

																		delete  connectedUsers[c.clientId];
																	}

													users.splice(i, 1);
													break;
                                		
									}
							}
    
    			

                        connectedUsers[socket.id] = clientInfo;
    					
    					users.push(clientInfo);

						socket.emit("connectedToServer");
    
    				 	// to all clients in the current namespace except the sender
  					//	socket.broadcast.emit("seConecto", clientInfoToEmit);

	

	});


	socket.on("conectadoSilenciosoParaSolicitud", function (data) {

		console.log("Aceptando solicitud a: " + data);
    
    
                			for (var i = 0, len = users.length; i < len; ++i) {
									var c = users[i];

									if (c.username == data) 
                                    
                                    {
											var clientInfo = new Object();
											clientInfo.username = data.toLowerCase();
											clientInfo.socketid = c.clientId;
	
    					

											socket.emit("seConectoSilencioso", clientInfo);
											break;
									}
							}
    
    



	

	});


	socket.on("conectedFromFriendL", function (datas) {

 
    	var data = datas.usernameToNotify;
    	var myUsername = datas.myUsername;
    
    	var myInfo = new Object();
    	myInfo.username = myUsername;
    	myInfo.socketid = socket.id;
    
		console.log("Aceptando solicitud a: " + data);
    
    
                			for (var i = 0, len = users.length; i < len; ++i) {
									var c = users[i];

									if (c.username.toLowerCase() == data.toLowerCase()) 
                                    
                                    {
											var clientInfo = new Object();
											clientInfo.username = data.toLowerCase();
											clientInfo.socketid = c.clientId;
	
    					
    										socket.emit("seConectoSilencioso", clientInfo); //LE MANDO LOS DATOS DEL AMIGO CONECTADO A MI JUEGO 
											socket.broadcast.to(c.clientId).emit("seConectoSilencioso", myInfo); //LE DIGO A MI AMIGO QUE ME CONEC

											break;
									}
							}
    
    



	

	});


	socket.on("conectadoSilencioso", function (data) {

		console.log("Se conecto el usuario: " + data);
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.username = data.toLowerCase();

                        connectedUsers[socket.id] = clientInfo;
    					
    					users.push(clientInfo);

				socket.emit("connectedToServer");
				socket.emit("updateChats");


	

	});



	socket.on("checaConexion", function (data) {

				for (var k = 0, len = users.length; k < len; ++k) {

					var use = users[k];
					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (use.username == data) {
						console.log("Se emition conexion del usuario: " + data);
                    
                            
    							var clientInfoToEmit = new Object();
								clientInfoToEmit.username = use.username.toLowerCase();
    						clientInfoToEmit.socketid = use.clientId;

						socket.emit("seConectoSilencioso", clientInfoToEmit);
                    	break;

					}

				}


	

	});



	socket.on("regalo", function (data) {

    const userFrom = data.userFrom.toLowerCase();;
    const userTo = data.userTo.toLowerCase();;
    		console.log("Regalo recibido de: " + data);

    				for (var k = 0, len = users.length; k < len; ++k) {

					var use = users[k];
					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (use.username == userTo) 
                    {

						socket.broadcast.to(use.clientId).emit("teEnviaronUnRegalo", userFrom.toLowerCase()); //sending to individual socketi
                    	break;

					}

				}
    
    	

	});


	socket.on("messageTo", function (data) {

    const messageFrom = data.from.toLowerCase();;
    const message = data.message;
        const toSocket = data.toSocket;
    const pp = data.pp;

    		console.log("Mensaje recibido de: " + messageFrom.toLowerCase()+ " mensaje " + message);
    
    var msjInfo = new Object();
    msjInfo.userFrom = messageFrom.toLowerCase();;
    msjInfo.message = message;
    msjInfo.imgID = data.pp;


		socket.broadcast.to(toSocket).emit("teEnviaronUnMensaje", msjInfo); //sending to individual socketi

	});


	socket.on("newProfilePic", function (data) {

    const messageFrom = data.from.toLowerCase();
    const message = data.message;
    const toSocket = data.toSocket;
    const pp = data.pp;

    
    var msjInfo = new Object();
    msjInfo.user = messageFrom.toLowerCase();
    msjInfo.id = data.pp;


		socket.broadcast.to(toSocket).emit("ppUpdated", msjInfo); //sending to individual socketi

	});

	socket.on("gameActivity", function (data) {

    const messageFrom = data.from.toLowerCase();
    const message = data.message;
    const toSocket = data.toSocket;

    console.log("ACTIVIDAD RECIBIDA DE : " + messageFrom  + " ACTIVIDAD: " + message);
    var msjInfo = new Object();
    msjInfo.user = messageFrom.toLowerCase();
    msjInfo.activity = data.message;


		socket.broadcast.to(toSocket).emit("activityPet", msjInfo); //sending to individual socketi

	});


	socket.on("messageFailed", function (data) {

    const messageFrom = data.userFrom.toLowerCase();;
    const messageTo = data.userTo;

    				for (var k = 0, len = users.length; k < len; ++k) {

					var use = users[k];
					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (use.username == messageTo) 
                    {

						socket.broadcast.to(use.clientId).emit("mensajeFallido", messageFrom); //sending to individual socketi
                    	break;

					}

				}


	});






	

});




