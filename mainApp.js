const { debug } = require('console');
const express = require('express'),
	socket = require('socket.io'),
	mysql = require('mysql');


const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

var iap = require('in-app-purchase');

//const io = new Server(server);

const io = require('socket.io')(server, {
  reconnection: true,           // Habilitar reconexión
  reconnectionAttempts: 1,      // Número máximo de intentos de reconexión
  reconnectionDelay: 1000,      // Retardo inicial de reconexión en milisegundos
  reconnectionDelayMax: 5000,   // Retardo máximo de reconexión en milisegundos
});

const fs = require('fs');


var itemDB = new Object();
fs.readFile('Database.json', function (error, content) {
	itemDB = JSON.parse(content);
});

//Arreglo de usuarios activos
var  users = [];
 var connectedUsers = new Object();

 var disconnectedUsers = new Object();

//COSTS DE EXPANSION
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

function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
  {
      rv[i] = arr[i];

  }
  return rv;
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

const config = {
	"host": "localhost",
	"user": "root",
	"password": "danielito001",
	"base": "temporal_pet"
};

var db = mysql.createConnection({
        host: '93.127.197.124',
        user: 'Admin',
        password: 'danielito001',
        database: 'temporal_pet'
       });

db.connect(function (error) {
	if (!!error)
		throw error;

	console.log('mysql connected to ' + config.host + ", user " + config.user + ", database " + config.base);
});


function onConnect(socket) {
	console.log('Connected');
}


server.listen(3000, () => {
	console.log('listening on *:3000 prueba');
});

io.on('connection', onConnect);



io.on('connection', (socket) => {
	console.log('a user connected');
	
	socket.on("Reconectando", function (data) {
		
    
    	
		console.log("Hay un usuario queriendo reconectar y es xx: --------------------------------------------------------------------------------------------------------------");

    	console.log(socket.id);
    
		console.log(data);
    	
    	if(disconnectedUsers[data] != null && disconnectedUsers[data] != undefined)
                {

                	connectedUsers[socket.id] = disconnectedUsers[data];
                	connectedUsers[socket.id].clientId = socket.id;
                	console.log("---------------Mi nuevo SOCKET ID ES    " + socket.id);
                	
                
      	 			let ts3 = Date.now(); 
        
                   console.log('La hora ahorita que me desconecte es 1 ---------------' + ts3);
            		
                  let ts4 = connectedUsers[socket.id].time;
       
            
                 var difference2 = ( ts3 - ts4) / 1000;
                
                var difference3 = ( ts3 - ts4);

                 console.log("You waited: " + difference2 + " seconds");
                
                console.log("You waited real : " + difference3 + " seconds????????????????????????");
                	
                    delete  disconnectedUsers[data];
                
                	for (var i = 0, len = petsConnected.length; i < len; ++i) {
                     var c = petsConnected[i];

                    if (c.userid == data) {
                     console.log("----------- Mascota: " + c.petName + " con el usuario: " + c.userid + " RE desconectado ----------------");
					 c.socket = socket.id;
                     
                     break;
                    }
                    }
                
                
                
                	db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1)", [data, data], function (errX, rowsX, fieldsX) {


											var amigosConectados = [];

											console.log("Amigos encontrados: " + rowsX.length);

											//Hago el arreglo de amigos con este for
											for (let i = 0; i < rowsX.length; i++) {

												var petFriend = new Object();

												if (rowsX[i].userTwo == data)
													petFriend.userOne = rowsX[i].userOne;

												if (rowsX[i].userOne == data)
													petFriend.userOne = rowsX[i].userTwo;

												for (var j = 0, len = users.length; j < len; ++j) {

													console.log("Checando al amigo para emitir, ID: " + petFriend.userOne);
													var c = users[j];
													// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
													if (c.userID == petFriend.userOne) {
														socket.broadcast.to(c.clientId).emit("seConecto", user); //sending to individual socketi


														amigosConectados.push(c.username); // agrego al usuario que se le hizo emit para enviarselo luego al que inicio sesion y saber quienes estan conectados para en el juego jalar el status
													}

												}




											}
											console.log("Enviando amigos conectados: " + JSON.stringify(amigosConectados));
											socket.emit("jugadoresConectados", amigosConectados);





										});
                	//console.log("Los connectedUsers son");
                
                	//console.log(connectedUsers)
                }
    socket.emit("ReconectadoResponse" , socket.id);
    

});

	//Se desconecta y se elimina de la lista
	socket.on('disconnect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);
		
    
    
		console.log('ME DESCONECTE --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------');
    
		//primero elimino a la mascota del arreglo de mascotas conectadas
		for (var i = 0, len = petsConnected.length; i < len; ++i) {
			var c = petsConnected[i];

			if (c.socket == socket.id) {
				console.log("Mascota: " + c.petName + " con el usuario: " + c.userid + " desconectado");

				petsConnected.splice(i, 1);
				break;
			}
		}

		var idToDisconnect;
		var usernameToDisconnect;
		var userInventory = new Object();
		var userInventoryExt = new Object();
		var userInventoryClothes = new Object();
		var petClothes = new Object();
    	var fishInventory;
    	var songInventory;
    	var craftingInventory;
    	var gesturesInventory;
		var room1 = new Object();
		var room2 = new Object();
		var room3 = new Object();
		var room4 = new Object();
		var room5 = new Object();
		var room6 = new Object();
		var room7 = new Object();
		var room8 = new Object();
		var room9 = new Object();
		var room10 = new Object();
		var room11 = new Object();
		var room12 = new Object();
		var room13 = new Object();
		var room14 = new Object();
		var room15 = new Object();
		var room16 = new Object();
		var room17 = new Object();
		var room18 = new Object();
    	var room19 = new Object();
		var room20 = new Object();
		var room21 = new Object();
		var room22 = new Object();
    	var room1000001 = new Object();

    	var room99 = new Object();
    	var dataInit = false;

    	var timesLogged ;
    	var harvests;
    	var recyclepoints;
    	var timeplayed;
    	var giftsS;
    	var giftsR;
    	var visitsDone;
    	var level;
    	var points;
    	var ballGame;
        var favRoom;

    if(connectedUsers[socket.id] != null)
    {
    			if (connectedUsers[socket.id].clientId == socket.id) 
            {
				//console.log("Usuario: " + c.username + " desconectado"); ESTE SE DEBE VOLVER A PONER YSANCHEZG
				idToDisconnect = connectedUsers[socket.id].userID;
				usernameToDisconnect = connectedUsers[socket.id].username;
				userInventory = connectedUsers[socket.id].inventory;
            	
            	if(connectedUsers[socket.id].fishBook != null)
                {
                	fishInventory = new Object();
                            	fishInventory = connectedUsers[socket.id].fishBook;

                }
            
                if(connectedUsers[socket.id].songsBook != null)
                {
                	songInventory = new Object();
                            	songInventory = connectedUsers[socket.id].songsBook;

                }

                            if(connectedUsers[socket.id].craftingBook != null)
                {
                	craftingInventory = new Object();
                            	craftingInventory = connectedUsers[socket.id].craftingBook;

                }

                                        if(connectedUsers[socket.id].gesturesInv != null)
                {
                	gesturesInventory = new Object();
                            	gesturesInventory = connectedUsers[socket.id].gesturesInv;

                }

				userInventoryExt = connectedUsers[socket.id].inventoryExt;
				userInventoryClothes = connectedUsers[socket.id].inventoryClothes;
				petClothes = connectedUsers[socket.id].petclothes;
				room1 = connectedUsers[socket.id].room1;
				room2 = connectedUsers[socket.id].room2;
				room3 = connectedUsers[socket.id].room3;
				room4 = connectedUsers[socket.id].room4;
				room5 = connectedUsers[socket.id].room5;
				room6 = connectedUsers[socket.id].room6;
				room7 = connectedUsers[socket.id].room7;
				room8 = connectedUsers[socket.id].room8;
				room9 = connectedUsers[socket.id].room9;
				room10 = connectedUsers[socket.id].room10;
				room11 = connectedUsers[socket.id].room11;
				room12 = connectedUsers[socket.id].room12;
				room13 = connectedUsers[socket.id].room13;
				room14 = connectedUsers[socket.id].room14;
				room15 = connectedUsers[socket.id].room15;
				room16 = connectedUsers[socket.id].room16;
				room17 = connectedUsers[socket.id].room17;
				room18 = connectedUsers[socket.id].room18;
            	room19 = connectedUsers[socket.id].room19;
				room20 = connectedUsers[socket.id].room20;
				room21 = connectedUsers[socket.id].room21;
				room22 = connectedUsers[socket.id].room22;
            	room1000001 = connectedUsers[socket.id].room1000001;

                room99 = connectedUsers[socket.id].room99;
            	
				dataInit = connectedUsers[socket.id].dataInit;
                timesLogged = connectedUsers[socket.id].timesLogged;
    	 		harvests = connectedUsers[socket.id].harvests;
    	 		recyclepoints= connectedUsers[socket.id].recyclePoints;
    	 		timeplayed= connectedUsers[socket.id].timePlayed;
    	 		giftsS= connectedUsers[socket.id].giftsSent;
    	 		giftsR= connectedUsers[socket.id].giftsReceived;
    	 		visitsDone= connectedUsers[socket.id].visitsDone;
    	 		level= connectedUsers[socket.id].level;
    	 		points= connectedUsers[socket.id].xp;
                ballGame= connectedUsers[socket.id].ballGame;
                favRoom= connectedUsers[socket.id].favRoom;

		
		//Añadir en array temporal 								
        disconnectedUsers[idToDisconnect] = connectedUsers[socket.id];
        
        disconnectedUsers[idToDisconnect].time = Date.now();
           
            
		delete  connectedUsers[socket.id];
            
            	//SI LOS DATOS DE EL USUARIO ESTAN INICIALIZADOS (QUE YA LE CARGO LA ROOM BIEN, ENTONCES YA SE PUEDE GUARDAR SUS DATOS EN EL SERVER
    				if(dataInit == true)
                    {
                    db.query("UPDATE inventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(userInventory), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo el inventario de la mascota cuando se desconecto del juego");
		});
           
                    if(fishInventory != null)
                    {
                         		db.query("UPDATE fishInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(fishInventory), idToDisconnect], function (err4, rows4, fields4) {
										console.log("Se actualizo el libro de peces de la mascota cuando se desconecto del juego");
							});
                    }
                    
                    
                   if(songInventory != null)
                    {
                         		db.query("UPDATE songInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(songInventory), idToDisconnect], function (err4, rows4, fields4) {
										console.log("Se actualizo el libro de melodias de la mascota cuando se desconecto del juego");
							});
                    }
                                 
                    if(craftingInventory != null)
                    {
                         		db.query("UPDATE craftingInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(craftingInventory), idToDisconnect], function (err4, rows4, fields4) {
										console.log("Se actualizo el libro de recetas de la mascota cuando se desconecto del juego");
							});
                    }
                      if(gesturesInventory != null)
                    {
                         		db.query("UPDATE gesturesInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(gesturesInventory), idToDisconnect], function (err4, rows4, fields4) {
										console.log("Se actualizo el libro de gestos de la mascota cuando se desconecto del juego");
							});
                    }
                                        
                    
                    
		db.query("UPDATE inventoryExt SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(userInventoryExt), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo el inventario exterior de la mascota cuando se desconecto del juego");
		});
		db.query("UPDATE clothesInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(userInventoryClothes), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo el inventario de la mascota cuando se desconecto del juego");
		});
		
		db.query("UPDATE petclothes SET userid=?, top=?, topC=?, pants=?, pantsC=?, shoes=?, shoesC=?, mask=?, maskC=?, wig=?, wigC=?, hat=?, hatC=?, handAccR=?, handAccRC=?, handAccL=?, handAccLC=?, wings=?, wingsC=?, glasses=?, glassesC=?, tail=?, tailC=? WHERE userid=? LIMIT 1", [idToDisconnect, petClothes.top, petClothes.topC, petClothes.pants, petClothes.pantsC, petClothes.shoes, petClothes.shoesC, petClothes.mask, petClothes.maskC, petClothes.wig, petClothes.wigC, petClothes.hat, petClothes.hatC, petClothes.handAccR, petClothes.handAccRC, petClothes.handAccL, petClothes.handAccLC, petClothes.wings, petClothes.wingsC, petClothes.glasses, petClothes.glassesC, petClothes.tail, petClothes.tailC, idToDisconnect], function (err4, rows4, fields4) {

			console.log("Se actualizaron las prendas de la mascota cuando se desconectó del juego");


		});
		db.query("UPDATE room1 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room1), idToDisconnect], function (err4, rows4, fields4) {

			console.log("Se actualizo la room 1 cuando se desconectó del juego");


		});

		db.query("UPDATE room2 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room2), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 2 cuando se desconectó del juego");
		});
    		db.query("UPDATE room3 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room3), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 3 cuando se desconectó del juego");
		});
		db.query("UPDATE room4 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room4), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 4 cuando se desconectó del juego");
		});
		db.query("UPDATE room5 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room5), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 5 cuando se desconectó del juego");
		});
		db.query("UPDATE room6 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room6), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 6 cuando se desconectó del juego");
		});
		db.query("UPDATE room7 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room7), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 7 cuando se desconectó del juego");
		});
		db.query("UPDATE room8 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room8), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 8 cuando se desconectó del juego");
		});
		db.query("UPDATE room9 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room9), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 9 cuando se desconectó del juego");
		});
		db.query("UPDATE room10 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room10), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 10 cuando se desconectó del juego");
		});
		db.query("UPDATE room11 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room11), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 11 cuando se desconectó del juego");
		});
		db.query("UPDATE room12 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room12), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 12 cuando se desconectó del juego");
		});
		db.query("UPDATE room13 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room13), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 13 cuando se desconectó del juego");
		});
		db.query("UPDATE room14 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room14), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 14 cuando se desconectó del juego");
		});
		db.query("UPDATE room15 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room15), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 15 cuando se desconectó del juego");
		});
		db.query("UPDATE room16 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room16), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 16 cuando se desconectó del juego");
		});
		db.query("UPDATE room17 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room17), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 17 cuando se desconectó del juego");
		});
		db.query("UPDATE room18 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room18), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 18 cuando se desconectó del juego");
		});
            		db.query("UPDATE room19 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room19), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 19 cuando se desconectó del juego");
		});
            		db.query("UPDATE room20 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room20), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 20 cuando se desconectó del juego");
		});
            		db.query("UPDATE room21 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room21), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 21 cuando se desconectó del juego");
		});
            		db.query("UPDATE room22 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room22), idToDisconnect], function (err4, rows4, fields4) {
			console.log("Se actualizo la room 22 cuando se desconectó del juego");
		});
                    

          db.query("UPDATE room1000001 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room1000001), idToDisconnect], function (err4, rows4, fields4) {
										console.log("Se actualizo la room 1000001 cuando se desconectó del juego");
                                         	});
                  

	
        			
    	db.query("UPDATE balances SET timeslogged = ?, harvests = ?, recyclepoints= ?, timeplayed = ?, giftsS = ?, giftsR = ?, visitsDone = ?, level = ?, exp = ? WHERE userid=? LIMIT 1", [timesLogged, harvests, recyclepoints, timeplayed, giftsS, giftsR, visitsDone, level, points, idToDisconnect], function (err4, rows4, fields4) {

		});
    	db.query("UPDATE balances SET level = ?, exp = ?, ballGame = ?, favRoom = ? WHERE userid=? LIMIT 1", [level, points, ballGame, favRoom, idToDisconnect], function (err4, rows4, fields4) {

        	console.log("Se actualizo en desconexion el nivel: " + level + " y experiencia " + points + " y ballGame: "+ ballGame+ " al usuario: " + idToDisconnect);
		});
                    
                    
                    }
            else
            {
                        	console.log("NO SE GUARDARON LOS DATOS DEL USUARIO PORQUE NO FUERON INICIALIZADOS");

            }
            
            		

		db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1)", [idToDisconnect, idToDisconnect], function (errX, rowsX, fieldsX) {


			console.log("Amigos encontrados: " + rowsX.length);

			//Hago el arreglo de amigos con este for
			for (let j = 0; j < rowsX.length; j++) {

				var petFriend = new Object();

				if (rowsX[j].userTwo == idToDisconnect)
					petFriend.userOne = rowsX[j].userOne;

				if (rowsX[j].userOne == idToDisconnect)
					petFriend.userOne = rowsX[j].userTwo;

				



                for (var k = 0, len = users.length; k < len; ++k) {

                    var use = users[k];
                    // EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
                    if (use.userID == petFriend.userOne) {
                        console.log("Se emitio la desconexion al usuario con el ID: " + petFriend.userOne);

                        socket.broadcast.to(use.clientId).emit("seDesconecto", usernameToDisconnect); //sending to individual socketi

                    }

                }
			}






		});




            
			}

    }






		console.log("El numero de usuarios ahora es: " + users.length);

		console.log("El numero de mascotas ahora es: " + petsConnected.length);

	});


// Manejar intentos fallidos de reconexión
  socket.on('reconnect_failed', () => {
  
  console.log('Cliente reconectado');
  
    console.log(`Intentos de reconexión fallidos para el cliente. ID: ${socket.id}`);
    // Puedes realizar acciones adicionales o notificar al cliente sobre el fallo de la reconexión si es necesario.
  });

  socket.on('reconnect', () => {
    console.log('Cliente reconectado');
  });

  socket.on('reconnecting', () => {
  console.log('calando');
    
  });

  socket.on('reconnect_failed', () => {
    console.log('Fallo al reconectar. ¡Revisa tu conexión!');
  });

});

io.on('disconnect', (socket) => {
  console.log(`Cliente desconectado. ID: ${socket.id}`);
  // Resto del código de desconexión...
});

io.on('reconnect_failed', () => {
  console.log('Intentos de reconexión fallidos en el servidor');
  // Puedes realizar acciones adicionales o notificar al cliente sobre el fallo de la reconexión si es necesario.
});

io.on('reconnect', () => {
  console.log('Cliente reconectado en el servidor -------------------------------------------------------------------------------------------------------------');
  // Puedes realizar acciones adicionales cuando el cliente se reconecte con éxito.
});


io.on('connection', (socket) => {


socket.on('connect', function() {
  connected = true;
  
});

	socket.on("KnockKnock", function (data) {

			socket.emit("connectedToServer" , socket.id);

	});

	

	
	socket.on("UsuariosActivos", function (data) {

		console.log("El numero de usuarios es: " + users.length);

		console.log("El numero de mascotas es: " + petsConnected.length);


		//Para despues eliminar al usuario activo del arreglo de usuarios
		for (var i = 0, len = users.length; i < len; ++i) {
			var c = users[i];

			console.log("Usuario: " + c.username);
			console.log("ID: " + c.userID);
			console.log("Socket: " + c.clientId);


		}


	});


	socket.on("upCamVel", function (data) {

		var cVel = data.cVel;
		const uid =  data.uid;

    	
    	db.query("SELECT id FROM userSettings WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO userSettings(`userid`, `cameraVel`) VALUES(?,?)", [uid, cVel], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
						console.log("Se insertaron las configuraciones de camara ");


					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando parametro de camara existente");
				db.query("UPDATE userSettings SET cameraVel=? WHERE userid=? LIMIT 1", [cVel, uid], function (err4, rows4, fields4) {

					console.log("Se actualizo la velocidad de camara");


				});
            }
		
		});	
		

	}); 


	socket.on("upLights", function (data) {

		var nc = data.nc;
		const uid =  data.uid;

    	
    	db.query("SELECT id FROM userSettings WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO userSettings(`userid`, `lights`) VALUES(?,?)", [uid, nc], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
						console.log("Se insertaron las configuraciones de luces ");


					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando parametro de camara existente");
				db.query("UPDATE userSettings SET lights=? WHERE userid=? LIMIT 1", [nc, uid], function (err4, rows4, fields4) {

					console.log("Se actualizaron las preferencias de luces");


				});
            }
		
		});	
		

	}); 
        
        	socket.on("upCamDrag", function (data) {

		var nc = data.nc;
		const uid =  data.uid;

    	
    	db.query("SELECT id FROM userSettings WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO userSettings(`userid`, `cameraMov`) VALUES(?,?)", [uid, nc], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
						console.log("Se insertaron las configuraciones de camara ");


					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando parametro de camara existente");
				db.query("UPDATE userSettings SET cameraMov=? WHERE userid=? LIMIT 1", [nc, uid], function (err4, rows4, fields4) {

					console.log("Se actualizaron las preferencias de camara");


				});
            }
		
		});	
		

	}); 

      socket.on("upPrivacy", function (data) {

		var nc = data.nc;
		const uid =  data.uid;

    	
    	db.query("SELECT id FROM userSettings WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO userSettings(`userid`, `profilePrivacy`) VALUES(?,?)", [uid, nc], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
						console.log("Se insertaron las configuraciones de privacidad ");


					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando parametro de camara existente");
				db.query("UPDATE userSettings SET profilePrivacy=? WHERE userid=? LIMIT 1", [nc, uid], function (err4, rows4, fields4) {

					console.log("Se actualizaron las preferencias de privacidad");


				});
            }
		
		});	
		

	}); 


      socket.on("getSettings", function (data) {

      	const uid = data; 
      
		var settings = new Object();

    	
    	db.query("SELECT * FROM userSettings WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO userSettings(`userid`) VALUES(?)", [uid], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
                
						console.log("Enviando configuraciones de juego nuevas");
						settings.li = 0;
                		settings.priv = 1;
              			settings.cam = 1;
                		settings.camv = 0.5;
					socket.emit("userSettings", settings);

					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Enviando configuraciones de usuario existentes");
						settings.li = rows[0].lights;
                		settings.priv = rows[0].profilePrivacy;
              			settings.cam = rows[0].cameraMov;
                		settings.camv = rows[0].cameraVel;
            					socket.emit("userSettings", settings);

            }
		
		});	
		

	}); 


	socket.on("SaveExterior", function () {

		var room99 = new Object();
		var idToSave;
    
		room99 = connectedUsers[socket.id].room99;
		if(connectedUsers[socket.id] != null)
    	{
    			if (connectedUsers[socket.id].clientId == socket.id) 
            {
				
				idToSave = connectedUsers[socket.id].userID;
				db.query("UPDATE room99 SET room=? WHERE userid=? LIMIT 1", [JSON.stringify(room99), idToSave], function (err4, rows4, fields4) {
					console.log("Se actualizo la room 99 cuando le di al boton");
				});
			}
		}

		

		

	}); // TERMINA GET FRIEND


	

	//INICIA LOGIN
	socket.on("getFriendClothes", function (data) {


		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {
				var petInfoReady = new Object();

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				console.log("estoy enviando el ID amigo: " + petInfoReady.userid);



				socket.emit("petDataInfoAmigoClothes", petInfoReady);
			}




		});

	}); // TERMINA GET FRIEND



	//INICIA LOGIN
	socket.on("getMyClothes", function (data) {


		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {
				var petInfoReady = new Object();

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
 				petInfoReady.init = true;
           
				console.log("estoy enviando el ID mio ropa: " + petInfoReady.userid);



					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null) 
                    {
						connectedUsers[socket.id].petclothes = petInfoReady;
						console.log("Se ha inicializado la ropa en el servidor");
                    	socket.emit("myClothesData", petInfoReady);

					}
				


			}
			else {

				var petInfoReady = new Object();

				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            	petInfoReady.init = true;
				console.log("estoy enviando el ID mio ropa: " + petInfoReady.userid);


					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null) {
						connectedUsers[socket.id].petclothes = petInfoReady;
						console.log("Se ha inicializado la ropa en el servidor");
				socket.emit("myClothesData", petInfoReady);

					}



			}




		});

	}); // TERMINA GET FRIEND



	//INICIA LOGIN
	socket.on("updateMyClothes", function (data) {
		const userid = data.userid,
			top = data.top,
			topC = data.topC,
			pants = data.pants,
			pantsC = data.pantsC,
			shoes = data.shoes,
			shoesC = data.shoesC,
			mask = data.mask,
			maskC = data.maskC,
			wig = data.wig,
			wigC = data.wigC,
			hat = data.hat,
			hatC = data.hatC,
			handAccR = data.handAccR,
			handAccRC = data.handAccRC,
			handAccL = data.handAccL,
			handAccLC = data.handAccLC,
			wings = data.wings,
			wingsC = data.wingsC,
			glasses = data.glasses,
			glassesC = data.glassesC,
			tail = data.tail,
			tailC = data.tailC;

		console.log("Reicibi el accesorio izq: " + handAccL);

		db.query("SELECT * FROM petclothes WHERE userid=? LIMIT 1", [userid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO petclothes(`userid`, `top`,  `topC`, `pants`, `pantsC`, `shoes`, `shoesC`, `mask`, `maskC`, `wig`, `wigC`, `hat`, `hatC`, `handAccR`, `handAccRC`, `handAccL`, `handAccLC`, `wings`, `wingsC`, `glasses`, `glassesC`, `tail`, `tailC`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ? ,?,? ,?,?,?,?,?,?, ?,?)", [userid, top, topC, pants, pantsC, shoes, shoesC, mask, maskC, wig, wigC, hat, hatC, handAccR, handAccRC, handAccL, handAccLC, wings, wingsC, glasses, glassesC, tail, tailC], function (err3, result3) {
					if (!!err3)
						throw err3;

					console.log("Se inserto la ropa de una mascota nueva");


				});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando ropa, prendas ya existen");
				db.query("UPDATE petclothes SET userid=?, top=?, topC=?, pants=?, pantsC=?, shoes=?, shoesC=?, mask=?, maskC=?, wig=?, wigC=?, hat=?, hatC=?, handAccR=?, handAccRC=?, handAccL=?, handAccLC=?, wings=?, wingsC=?, glasses=?, glassesC=?, tail=?, tailC=? WHERE userid=? LIMIT 1", [userid, top, topC, pants, pantsC, shoes, shoesC, mask, maskC, wig, wigC, hat, hatC, handAccR, handAccRC, handAccL, handAccLC, wings, wingsC, glasses, glassesC, tail, tailC, userid], function (err4, rows4, fields4) {

					console.log("Se actualizaron las prendas de la mascota");


				});

			}
		});
	}); // TERMINA UPDATE CLOTHES



	//INICIA LOGIN
	socket.on("updateCloth", function (data) {
		const userid = data.uid,
			cloth = data.oid,
			type = data.cl,
			ctned = data.ctned;

		console.log("Recibi la prenda a actualizar: " + cloth + " del tipo: " + type + " al usuario: " + userid);
		console.log("Recibido de contenido: " + ctned);


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				if (type == "top") {
					connectedUsers[socket.id].petclothes.top = cloth;
					connectedUsers[socket.id].petclothes.topC = ctned;
				}
				if (type == "pants") {
					connectedUsers[socket.id].petclothes.pants = cloth;
					connectedUsers[socket.id].petclothes.pantsC = ctned;
				}
				if (type == "shoes") {
					connectedUsers[socket.id].petclothes.shoes = cloth;
					connectedUsers[socket.id].petclothes.shoesC = ctned;
				}
				if (type == "wig") {
					connectedUsers[socket.id].petclothes.wig = cloth;
					connectedUsers[socket.id].petclothes.wigC = ctned;
				}
				if (type == "glasses") {
					connectedUsers[socket.id].petclothes.glasses = cloth;
					connectedUsers[socket.id].petclothes.glassesC = ctned;
				}
				if (type == "hat") {
					connectedUsers[socket.id].petclothes.hat = cloth;
					connectedUsers[socket.id].petclothes.hatC = ctned;
				}
				if (type == "mask") {
					connectedUsers[socket.id].petclothes.mask = cloth;
					connectedUsers[socket.id].petclothes.maskC = ctned;
				}
				if (type == "har") {
					connectedUsers[socket.id].petclothes.handAccR = cloth;
					connectedUsers[socket.id].petclothes.handAccRC = ctned;
				}
				if (type == "hal") {
					connectedUsers[socket.id].petclothes.handAccL = cloth;
					connectedUsers[socket.id].petclothes.handAccLC = ctned;
				}

				if (type == "wings") {
					connectedUsers[socket.id].petclothes.wings = cloth;
					connectedUsers[socket.id].petclothes.wingsC = ctned;
				}

				if (type == "tail") {
					connectedUsers[socket.id].petclothes.tail = cloth;
					connectedUsers[socket.id].petclothes.tailC = ctned;
				}
				if (type == "mount") {
					connectedUsers[socket.id].petclothes.mount = cloth;
					connectedUsers[socket.id].petclothes.mountC = ctned;
				}
				console.log("Se ha actualizado la prenda en el servidor");

			}




	}); // TERMINA UPDATE CLOTHES


	//SetDatesShop
	socket.on("SetDatesShop", function (data) {

    	const uid = data.usid;
    	const date = data.timeDate;
   		const typeProc = data.typeProc;
    
		console.log("Usuario recibido para el set date shop: " + data.timeDate);
    
    console.log("Usuario recibido para el set date shop: " + data.usid);

		console.log("Usuario recibido para el set date shop: " + data.typeProc);
    
    	db.query("CALL PrizeShopDate(?,?,?)", [data.usid, data.timeDate,data.typeProc], function(err, result){
        
        
        	var prizeDates = new Object();	
        	prizeDates.date = result[0][0].prizeShopTime

        
        	socket.emit("PrizeShopDateReturn", result[0][0].prizeShopTime);
        
        });

	});

	socket.on("getMyBalance", function (data) {


		console.log("Usuario recibido para balances: " + data);
 		
    
		db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			console.log("Columnas encontradas de balances: " + rows.length);
			if (rows.length > 0) {
				var balancesReady = new Object();
				balancesReady.bells = rows[0].bells;
				balancesReady.cash = rows[0].cash;
				balancesReady.level = rows[0].level;
				balancesReady.xp = rows[0].exp;
				balancesReady.pethealth = rows[0].pethealth;
				balancesReady.pethygiene = rows[0].pethygiene;
				balancesReady.pethunger = rows[0].pethunger;
				balancesReady.timesLogged = rows[0].timeslogged + 1;
            	balancesReady.harvests = rows[0].harvests;
            	balancesReady.recyclePoints = rows[0].recyclepoints;
            	balancesReady.timePlayed = rows[0].timeplayed;
            	balancesReady.giftsSent = rows[0].giftsS;
            	balancesReady.giftsReceived = rows[0].giftsR;
            	balancesReady.visitsDone = rows[0].visitsDone;
                        	balancesReady.ballGame = rows[0].ballGame;
                        	balancesReady.favRoom = rows[0].favRoom;
            				balancesReady.prizeDay = rows[0].prizeDay;
            				balancesReady.prizeShopTime = rows[0].prizeShopTime;


					// EL USUARIO TIENE SUS DATOS YA INICIALIZADOS?
					if (connectedUsers[socket.id] != null) 
                    {
						connectedUsers[socket.id].bells = rows[0].bells;
						connectedUsers[socket.id].cash = rows[0].cash;
						connectedUsers[socket.id].level = rows[0].level;
						connectedUsers[socket.id].xp = rows[0].exp;
						connectedUsers[socket.id].pethealth = rows[0].pethealth;
						connectedUsers[socket.id].pethygiene = rows[0].pethygiene;
						connectedUsers[socket.id].pethunger = rows[0].pethunger;
                    	connectedUsers[socket.id].timesLogged = rows[0].timeslogged + 1;
            			connectedUsers[socket.id].harvests = rows[0].harvests;
            			connectedUsers[socket.id].recyclePoints = rows[0].recyclepoints;
            			connectedUsers[socket.id].timePlayed = rows[0].timeplayed;
            			connectedUsers[socket.id].giftsSent = rows[0].giftsS;
            			connectedUsers[socket.id].giftsReceived = rows[0].giftsR;
            			connectedUsers[socket.id].visitsDone = rows[0].visitsDone;
            			connectedUsers[socket.id].ballGame = rows[0].ballGame;
            			connectedUsers[socket.id].favRoom = rows[0].favRoom;
                    	connectedUsers[socket.id].prizeShopTime = rows[0].prizeShopTime;

						console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);

						console.log("El usuario tiene un nivel de:  " + connectedUsers[socket.id].level + " y experiencia de : " + connectedUsers[socket.id].xp);

					}

				




				socket.emit("myBalance", balancesReady);
				console.log("Enviando balances");

			}
			else {

				db.query("INSERT INTO balances(`userid`, `bells`, `cash`,  `level`, `exp`, `pethealth`, `pethygiene`, `pethunger`) VALUES(?, ?, ?, ?, ?, ? ,? ,?)", [data, "6500", "5", "1", "0", "50", "50", "50"], function (err3, result3) {

					var balancesReady = new Object();
					balancesReady.bells = 6500;
					balancesReady.cash = 5;
					balancesReady.level = 1;
					balancesReady.xp = 0;
					balancesReady.pethealth = 50;
					balancesReady.pethygiene = 50;
					balancesReady.pethunger = 50;
                     balancesReady.timesLogged = 1;
            		balancesReady.harvests = 0;
            		balancesReady.recyclePoints = 0;
            		balancesReady.timePlayed = 0;
            		balancesReady.giftsSent = 0;
            		balancesReady.giftsReceived = 0;
            		balancesReady.visitsDone = 0;
            		balancesReady.ballGame = 0;
            		balancesReady.favRoom = 1;


						// EL JUGADOR YA TIENE SUS DATOS INICIALIZADOS?
						if (connectedUsers[socket.id] != null) {
							connectedUsers[socket.id].bells = 6500;
							connectedUsers[socket.id].cash = 5;
							connectedUsers[socket.id].level = 1;
							connectedUsers[socket.id].xp = 0;
							connectedUsers[socket.id].pethealth = 50;
							connectedUsers[socket.id].pethygiene = 50;
							connectedUsers[socket.id].pethunger = 50;
                           connectedUsers[socket.id].timesLogged =  1;
            			connectedUsers[socket.id].harvests = 0;
            			connectedUsers[socket.id].recyclePoints = 0;
            			connectedUsers[socket.id].timePlayed = 0;
            			connectedUsers[socket.id].giftsSent = 0;
            			connectedUsers[socket.id].giftsReceived = 0;
            			connectedUsers[socket.id].visitsDone = 0;
                        connectedUsers[socket.id].ballGame = 0;
                        connectedUsers[socket.id].favRoom = 1;

						}

					


					socket.emit("myBalance", balancesReady);
					console.log("Enviando balances por primera vez");

				});

			}



		});


	});




	socket.on("updatePanelRooms", function (data) {

    const pd = data.panelData;
    const uid = data.uid;
    
    	db.query("SELECT * FROM roominfo WHERE uid=? LIMIT 1", [uid], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO roominfo(`uid`, `paneldata`) VALUES(?, ?)", [uid, pd], function (err3, rows, result3) {
					if (!!err3)
						throw err3;
						console.log("Creado room panel data");


					});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("Actualizando roominfo existente");
				db.query("UPDATE roominfo SET paneldata=? WHERE uid=? LIMIT 1", [pd, uid], function (err4, rows4, fields4) {

					console.log("Se actualizo el roompanel");


				});
            }
		
		});			

	});
	
	socket.on("SaveDigging", function (data) {

    const json = data.panelData;
    const uid = data.uid;
    
    	console.log("Actualizando la excavacion");
    
    console.log(data);
    
    db.query("SELECT * FROM exteriorRoom WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    	  db.query("UPDATE exteriorRoom SET roomJson=? WHERE userId=? LIMIT 1", [json, uid], function (err4, rows4, fields4) {

                                             console.log("Se actualizo el DiggingSaved");

                                             socket.emit("DiggingSaved");

                                         });	
                                    }
                        			else
                                    {
                                    		db.query("INSERT INTO exteriorRoom(`userid`, `roomJson`) VALUES(?, ?)", [uid, json], function (err3, rows, result3) {
														if (!!err3)
															throw err3;
																
                                            	console.log("Se inserto el DiggingSaved");
                                            
                                            	socket.emit("DiggingSaved");
											});
                                    
                                    		

                                    }
					});
    
				

	});
	
	socket.on("GetDiggingSave", function (data) {

    const uid = data.uid;
    
    	console.log("Actualizando la excavacion");
    
    console.log(data);
    
    db.query("SELECT roomJson FROM exteriorRoom WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

    								if (rows4.length > 0) 
                                    {
                                    		//preparo los datos del mount encontrado y los envio
                                    	       var dataToSend = new Object();
													dataToSend.roomJson = rows4[0].roomJson;
                                    			
                                    				socket.emit("SendDiggingSave", rows4[0].roomJson);

                                    }
                                    else
                                    {
													socket.emit("SendDiggingSave", '');		
                                    }
					});
    
				

	});


	socket.on("updateBaitItem", function (data) {

    	const index = data.index;
    	const q = data.q;
    
		console.log("Recibido index: " + data.index ); 
		console.log("Actualizando carnada");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            		if(connectedUsers[socket.id].inventory != null)
                    {
                    	if(connectedUsers[socket.id].inventory[data.index] != null)
                    	connectedUsers[socket.id].inventory[data.index].q -= 1;

						console.log("Se actualizo la carnada");
                    }


			}

	});





	socket.on("removeBaitItem", function (data) {

    	const index = data.index;
    	const q = data.q;
    
		console.log("Recibido index: " + data.index ); 
		console.log("Eliminando carnada");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            		if(connectedUsers[socket.id].inventory != null)
                    {
                    	if(connectedUsers[socket.id].inventory[data.index] != null)
						connectedUsers[socket.id].inventory.splice(data.index, 1);

						console.log("Se elimino la carnada");
                    }


			}

	});


	socket.on("updateEquipableItem", function (data) {

    	const uid = data.uid;
    	const contained = data.c;
    
		console.log("Recibido index: " + data.index ); 
		console.log("Actualizando item equipable" + contained)

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            		if(connectedUsers[socket.id].inventory != null)
                    {
                    	if(connectedUsers[socket.id].inventory[data.index] != null)
                    	connectedUsers[socket.id].inventory[data.index].c = contained;

						console.log("Se actualizo el item equipable");
                    }


			}






	});

	socket.on("removeEquipableItem", function (data) {

    	const uid = data.uid;
    	const contained = data.c;
    
		console.log("Recibido index: " + data.index ); 
		console.log("Actualizando item equipable" + contained)

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            		if(connectedUsers[socket.id].inventory != null)
                    {
                    	if(connectedUsers[socket.id].inventory[data.index] != null)
						connectedUsers[socket.id].inventory.splice(data.index, 1);


						console.log("Se elimino el item equipable");
                    }


			}






	});


	socket.on("updateGWallpaper", function (data) {

	const index=data.index;
    const qty = data.q;


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

					//Si su cantidad es menor a 0 lo quito del inventario
					if (qty <= 0)
                    {
                    	connectedUsers[socket.id].inventory.splice(data.index, 1);
                    }
					else
                    {
                                        	connectedUsers[socket.id].inventory[data.index].q = qty;
                    }
					

			}






	});


	socket.on("buyItem", function (data) {



		console.log("Comprando un item al usuario: " + data);

		var objID = data.oid;
		var quantity = data.q;
    
    	var sellingPrice = 0;
    var substractionCoin = false;
    
		for (let i = 0; i < itemDB.length; i++) {
			if (itemDB[i].id == data.oid) {
				if (itemDB[i].ctype == 1) 
                {
					sellingPrice = itemDB[i].cost * quantity;
                		substractionCoin = true; //Significa que el item es de cash

				}
				else {
					sellingPrice = itemDB[i].cost * quantity;
                		substractionCoin = false; //Significa que el item es de coin
				}

				break;
			}
		}

		sellingPrice = sellingPrice.toFixed(0);
		console.log("El selling price de este item es: " + sellingPrice);



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

					//Se resta en caso de ser de coin
					if(substractionCoin == false)
                    {
                    	if(connectedUsers[socket.id].bells>=sellingPrice)
                        {
                           connectedUsers[socket.id].bells = connectedUsers[socket.id].bells - sellingPrice;
						db.query("UPDATE balances SET bells = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].bells.toFixed(0), connectedUsers[socket.id].userID], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de comprar un item");

						socket.emit("itemBoughtCoin", connectedUsers[socket.id].bells.toFixed(0));

					});
                        }
                    	else
                        {
                        	socket.emit("errorBuyingCoin");
                        }
                    }

            
            					//Se resta en caso de ser de cash
					if(substractionCoin == true)
                    {
                    	if(connectedUsers[socket.id].cash>=sellingPrice)
                        {
                           connectedUsers[socket.id].cash = connectedUsers[socket.id].cash - sellingPrice;
						db.query("UPDATE balances SET cash = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].cash.toFixed(0), data.userID], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de comprar un item");

						socket.emit("itemBoughtCash", connectedUsers[socket.id].cash.toFixed(0));

					});
                        }
                    	else
                        {
                        	socket.emit("errorBuyingCash");
                        	socket.emit("errorBuyingCash");
                        }
                    }
            


						console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);






			}

	});
	
socket.on("GetPrizes", function (data) {


		var dataToSend = new Object();
		fs.readFile('prizesList.json', function (error, content) {
			dataToSend = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendPrizes", dataToSend);
		});
			

	});

socket.on("GetPrizesShop", function (data) {


		var dataToSend = new Object();
		fs.readFile('prizeShop.json', function (error, content) {
			dataToSend = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendPrizesShop", dataToSend);
		});
			

	});


	
	socket.on("updatePrizeDay", function (data) {


		console.log("intentando en el updatePrizeDay: " + data);
		console.log("updatePrizeDay: " + data.prizeDay);
		console.log("updatePrizeDay2: " + data.uid);
		
		
    	db.query("CALL Get_differenceDay(?)", [data.uid], function(err, result){
 		console.log("Regresando del store un" + result[0][0].showPanel);
        
        var dataToSend = new Object();
			dataToSend.showPanel = result[0][0].showPanel;
            dataToSend.prizeDay = result[0][0].prizeDay;
        	 dataToSend.lastLogin = result[0][0].lastLogin;
        dataToSend.currentDay = result[0][0].currentDay;
        
    	if(result[0][0].showPanel == 1 )
    	{
        	// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
						
                        connectedUsers[socket.id].prizeDay = result[0][0].prizeDay;
           				socket.emit("updatedPrizeDay", dataToSend);
                        

			}
    	}
        else
        {
        	
        	socket.emit("updatedPrizeDay", dataToSend);
        }


        });

			
			

	});

socket.on("PremioReclamado", function (data) {

        
						console.log("EN premio reclamado el dia: " + data.prizeDay);
		               console.log("EN premio reclamado en uid es : " + data.uid);
                        connectedUsers[socket.id].prizeDay = data.prizeDay;
            
						db.query("UPDATE balances SET prizeClaimed = 0 WHERE userid=? LIMIT 1", [data.uid], function (err4, rows4, fields4) {
							   //socket.emit("updatedPrizeDay", result[0][0].showPanel);

							});
                        


			
			

	});


	socket.on("discountItemCrafting", function (data) {



		console.log("Crafteando un item al usuario: " + data);

		var craftMaterials = new Object();
    
    		craftMaterials = data;
		var mats = countProperties(craftMaterials);
			console.log("El numero de materiales recibidos es: " + countProperties(craftMaterials));

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            	for(let i = 0; i < mats; i++)
                {
               		connectedUsers[socket.id].inventory[craftMaterials[i].index].q = connectedUsers[socket.id].inventory[craftMaterials[i].index].q - craftMaterials[i].qty;
					
                	    var craftItemObject = new Object();
                		
                		craftItemObject = craftMaterials[i];
                		craftItemObject.qty = connectedUsers[socket.id].inventory[craftMaterials[i].index].q; //modifico ahora su nueva cantidad que se actualizara en el juego local

                		//.REM = 0 REMOVIDO ES FALSO
                		//.REM = 1 REMOVIDO ES TRUE, SIGNIFICA QUE DESTRUIREMOS SU SLOT EN EL JUEGO Local
                
                		if (connectedUsers[socket.id].inventory[craftMaterials[i].index].q <= 0)
                		{
                        						connectedUsers[socket.id].inventory.splice(craftMaterials[i].index, 1);

                                        		craftItemObject.rem = 1;
                        }
                		else
                        {
                                                craftItemObject.rem = 0;

                        }
                		                        console.log("Actual material descontado: " + (i+1));

                	//SI ES EL ULTIMO ELEMENTO DEL CRAFTEO, LE DIGO QUE YA TERMINE
               			if(mats == (i+1))
                        {
                        	craftItemObject.fin = 1;
                        }


                								socket.emit("craftID", craftItemObject);

                }
/*



					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);

					db.query("UPDATE balances SET bells = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].bells.toFixed(0), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de vender un item");

						socket.emit("itemSold", connectedUsers[socket.id].bells.toFixed(0));

					});

*/


			}






	});

socket.on("RevisarCompras", function (data) {

    	const uid = data.uid;

		console.log("Buscando compras");
		
		console.log(uid);
			
			db.query("SELECT idPurch FROM purchases WHERE userid = ? LIMIT 1", [uid], function (err4, rows, fields4) {

									if (rows.length > 0) 
                                    {
                                    	  socket.emit("ComprasRevisadas", "1");
                                    }
                        			else
                                    {
                                    		socket.emit("ComprasRevisadas", "0");

                                    }
			});

	});

//aCTUALIZA O INSERTA UN ANIMAL DE COMPAÑIA
	socket.on("upPetling", function (data) {

    	const uid = data.uid;
    	const mid = data.mid;
    	const cted = data.cted;
    
    					db.query("SELECT userid FROM companionAnimals WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    	   db.query("UPDATE companionAnimals SET petlingid = ?, contained = ? WHERE userid = ? LIMIT 1", [mid, cted, uid], function (err3, rows3, fields3) 
                                           {
                                           		
                                                console.log("Petling actualizado");                               

                                           });
                                    }
                        			else
                                    {
                                    		db.query("INSERT INTO companionAnimals(`userid`, `petlingid`, `contained`) VALUES(?, ?, ?)", [uid, mid, cted], function (err3, rows, result3) {
														if (!!err3)
															throw err3;
																
                                            	console.log("Petling insertado, se actualizo el petling");
											});

                                    }
					});
    
	});


//ACTUALIZA O INSERTA UN MONTABLE
	socket.on("upMount", function (data) {

    	const uid = data.uid;
    	const mid = data.mid;
    	const cted = data.cted;
    
    					db.query("SELECT userid FROM mounts WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    	   db.query("UPDATE mounts SET mountid = ?, contained = ? WHERE userid = ? LIMIT 1", [mid, cted, uid], function (err3, rows3, fields3) 
                                           {
                                           		
                                                console.log("Montable actualizado");                               

                                           });
                                    }
                        			else
                                    {
                                    		db.query("INSERT INTO mounts(`userid`, `mountid`, `contained`) VALUES(?, ?, ?)", [uid, mid, cted], function (err3, rows, result3) {
														if (!!err3)
															throw err3;
																
                                            	console.log("Montable insertado, se actualizo el montable");
											});

                                    }
					});
    
	});

//OBTIENE EL ANIMAL DE COMPAÑIA
	socket.on("getPetling", function (data) {

    	const uid = data;
    
    					db.query("SELECT petlingid, contained FROM companionAnimals WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    		//preparo los datos del mount encontrado y los envio
                                    	       var dataToSend = new Object();
													dataToSend.mid = rows4[0].petlingid;
                                    				dataToSend.cted = rows4[0].contained;
                                    				
                                    				socket.emit("yourPetling", dataToSend);

                                    }
                        			else
                                    {
                                    		    //Como no se encontro mountable, entonces creo uno ficticio y lo envio
                                    	       var dataToSend = new Object();
													dataToSend.mid = -1;
                                    				dataToSend.cted = "";
                                    				
                                    				socket.emit("yourPetling", dataToSend);

                                    }
					});
    
	});


//OBTIENE EL MONTABLE
	socket.on("getMount", function (data) {

    	const uid = data;
    
    					db.query("SELECT mountid, contained FROM mounts WHERE userid = ? LIMIT 1", [uid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    		//preparo los datos del mount encontrado y los envio
                                    	       var dataToSend = new Object();
													dataToSend.mid = rows4[0].mountid;
                                    				dataToSend.cted = rows4[0].contained;
                                    				
                                    				socket.emit("yourMount", dataToSend);

                                    }
                        			else
                                    {
                                    		    //Como no se encontro mountable, entonces creo uno ficticio y lo envio
                                    	       var dataToSend = new Object();
													dataToSend.mid = -1;
                                    				dataToSend.cted = "";
                                    				
                                    				socket.emit("yourMount", dataToSend);

                                    }
					});
    
	});


//ELIMINA EL MONTABLE
	socket.on("rPetling", function (data) {

    	const uid = data;
    	const mid = -1;
    	const cted = "";
    
    					db.query("UPDATE companionAnimals SET petlingid = ?, contained = ? WHERE userid = ? LIMIT 1", [mid, cted, uid], function (err4, rows4, fields4) {

								console.log("Soltando petling");
					});
    
	});




//ELIMINA EL MONTABLE
	socket.on("rMount", function (data) {

    	const uid = data;
    	const mid = -1;
    	const cted = "";
    
    					db.query("UPDATE mounts SET mountid = ?, contained = ? WHERE userid = ? LIMIT 1", [mid, cted, uid], function (err4, rows4, fields4) {

								console.log("Bajado del montable");
					});
    
	});








	socket.on("updtf", function (data) {

    	const fbid = data.fbid;
    	const un = data.nun;
    
        					db.query("SELECT username FROM users WHERE username = ? LIMIT 1", [un], function (err11, rows11, fields11)
                                     {
                            
                            		if(rows11.length > 0)
                                    {
                                    	console.log("Ya existe este usuario, elige otro");
                                       socket.emit("alreadyexistun");

                                    }
                            		else
                                    {
                                        db.query("SELECT username FROM users WHERE fbid = ? LIMIT 1", [fbid], function (err4, rows4, fields4) {

									if (rows4.length > 0) 
                                    {
                                    	   db.query("UPDATE users SET username = ? WHERE fbid = ? LIMIT 1", [un, fbid], function (err3, rows3, fields3) {
                                                              socket.emit("succsupdf");

                                           });
                                    }
                        			else
                                    {
                                    							socket.emit("errorupdf");

                                    }
                                    

					});
                                    }
                            });
    

    


	});



	socket.on("joinMe", function (data) {

    	const room = data.roomID;
    	const uTo = data.soID;
    	const un = data.myUn;
    
    	var dat = new Object();
    			 dat.r = room;
    			dat.un = un;
    
    		console.log("Enviando invitacion de grupo a : " + uTo);
    
				db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [uTo], function (err3, rows3, fields3) {

					if (rows3.length > 0)
						socket.broadcast.to(rows3[0].socket).emit("partyInvitation", dat); //sending to individual socketi


				});

	});


//para invitaciones a minijuego
	socket.on("joinMeMG", function (data) {

    	const room = data.roomID;
    	const uTo = data.soID;
    	const un = data.myUn;
    
    	var dat = new Object();
    			 dat.r = room;
    			dat.un = un;
    
    		console.log("Enviando invitacion de grupo minijuego a : " + uTo);
    
				db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [uTo], function (err3, rows3, fields3) {

					if (rows3.length > 0)
						socket.broadcast.to(rows3[0].socket).emit("partyInvitationMG", dat); //sending to individual socketi


				});

	});


	socket.on("joinMeSharedRoom", function (data) {

    	const room = data.roomID;
    	const uTo = data.soID;
    	const un = data.myUn;
        	const rtm = data.roomTM;

    	var dat = new Object();
    			 dat.r = room;
    			dat.un = un;
    			dat.rm = rtm;
    
    		console.log("Enviando invitacion de habitacion compartida a : " + uTo);
    
				db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [uTo], function (err3, rows3, fields3) {

					if (rows3.length > 0)
						socket.broadcast.to(rows3[0].socket).emit("sharedRoomInvitation", dat); //sending to individual socketi


				});

	});


	socket.on("trashRew", function (data) {



		console.log("Ajustando monedas, eliminando basura de room");




			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {



					connectedUsers[socket.id].bells = connectedUsers[socket.id].bells + 30;




					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells);

					db.query("UPDATE balances SET bells = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].bells.toFixed(0), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de vender un item");

						socket.emit("trashRem", connectedUsers[socket.id].bells.toFixed(0));

					});




			}






	});

	socket.on("sellItemInventory", function (data) {



		console.log("Vendiendole un item al usuario: " + data);

		var sellingPrice = 0;
		var cointype = 0;
		for (let i = 0; i < itemDB.length; i++) {
			if (itemDB[i].id == data.oid) {
				if (itemDB[i].ctype == 2) {
					sellingPrice = itemDB[i].cost / 3;

				}
				else {
					sellingPrice = itemDB[i].cost * 80;

				}

				break;
			}
		}

		sellingPrice = sellingPrice.toFixed(0);
		console.log("El selling price de este item es: " + sellingPrice);



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {



					connectedUsers[socket.id].bells = connectedUsers[socket.id].bells + (sellingPrice * data.q);

					connectedUsers[socket.id].inventory[data.index].q = connectedUsers[socket.id].inventory[data.index].q - data.q;

					if (connectedUsers[socket.id].inventory[data.index].q <= 0)
						connectedUsers[socket.id].inventory.splice(data.index, 1);


					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);

					db.query("UPDATE balances SET bells = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].bells.toFixed(0), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de vender un item");

						socket.emit("itemSold", connectedUsers[socket.id].bells.toFixed(0));

					});




			}






	});


	socket.on("dropItemInventory", function (data) {



		console.log("Descontandole un item al usuario: " + data);

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) 
            {
            		if(connectedUsers[socket.id].inventory != null)
                    {
                    
                    		if(connectedUsers[socket.id].inventory[data.index] != null)
                            {
                                           connectedUsers[socket.id].inventory[data.index].q = connectedUsers[socket.id].inventory[data.index].q - data.q;

										if (connectedUsers[socket.id].inventory[data.index].q <= 0)
											connectedUsers[socket.id].inventory.splice(data.index, 1);

											socket.emit("itemDropped","");
                            }

                    
                    }

			}
	});


	socket.on("dropItemCloset", function (data) {



		console.log("Descontandole un item al usuario: " + data);

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) 
            {
            		if(connectedUsers[socket.id].inventoryClothes != null)
                    {
                    
                    		if(connectedUsers[socket.id].inventoryClothes[data.index] != null)
                            {
                                           connectedUsers[socket.id].inventoryClothes[data.index].q = connectedUsers[socket.id].inventoryClothes[data.index].q - data.q;

										if (connectedUsers[socket.id].inventoryClothes[data.index].q <= 0)
											connectedUsers[socket.id].inventoryClothes.splice(data.index, 1);

											socket.emit("itemDropped","");
                            }

                    
                    }

			}
	});




	socket.on("sellItemClothes", function (data) {



		console.log("Vendiendole un item al usuario: " + data);

		var sellingPrice = 0;
		var cointype = 0;
		for (let i = 0; i < itemDB.length; i++) {
			if (itemDB[i].id == data.oid) {
				if (itemDB[i].ctype == 2) {
					sellingPrice = itemDB[i].cost / 3;

				}
				else {
					sellingPrice = itemDB[i].cost * 80;

				}

				break;
			}
		}

		sellingPrice = sellingPrice.toFixed(0);
		console.log("El selling price de este item es: " + sellingPrice);


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id]!= null) {

				if (connectedUsers[socket.id].inventoryClothes[data.index] == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");

				}
				else {

					connectedUsers[socket.id].bells = connectedUsers[socket.id].bells + (sellingPrice * data.q);

					connectedUsers[socket.id].inventoryClothes[data.index].q = connectedUsers[socket.id].inventoryClothes[data.index].q - data.q;

					if (connectedUsers[socket.id].inventoryClothes[data.index].q <= 0)
						connectedUsers[socket.id].inventoryClothes.splice(data.index, 1);


					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);

					db.query("UPDATE balances SET bells = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].bells.toFixed(0), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de vender un item");

						socket.emit("itemSold", connectedUsers[socket.id].bells.toFixed(0));

					});



				}

			}





	});


	socket.on("openInvItem", function (data) {



		console.log("Actualizando un item al usuario que abrio desde inventario");



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null ) {


				if (connectedUsers[socket.id].inventory == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");

				}
				else {

					connectedUsers[socket.id].inventory[data.index].q -= data.q;

					if (connectedUsers[socket.id].inventory[data.index].q <= 0)
						connectedUsers[socket.id].inventory.splice(data.index, 1);

					db.query("UPDATE inventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(connectedUsers[socket.id].inventory), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el inventario despues de abrir un item");
                    	
                    //SI LO QUE ABRI ES UNA RECETA DE CRAFTEO O HORNO
                    if(data.t == "RCP")
                    {
                     	socket.emit("recipeOpened", data.oid);

                    }
                    
                    //SI LO QUE ABRI ES UNA RECETA DE CRAFTEO O HORNO
                    if(data.t == "MA")
                    {
                     	socket.emit("albumOpened", data.oid);

                    }
                    
                 


					});

				}

			}






	});






	socket.on("updateInventoryWhenGift", function (data) {



		console.log("Actualizando un item al usuario que envio");



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null ) {


				if (connectedUsers[socket.id].inventory == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");

				}
				else {

					connectedUsers[socket.id].inventory[data.index].q -= data.q;

					if (connectedUsers[socket.id].inventory[data.index].q <= 0)
						connectedUsers[socket.id].inventory.splice(data.index, 1);

					db.query("UPDATE inventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(connectedUsers[socket.id].inventory), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el inventario despues de regalar un item");


					});

				}

			}






	});



	socket.on("updateInventoryClothesWhenGift", function (data) {



		console.log("Actualizando un item al usuario que envio");



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {


				if (connectedUsers[socket.id].inventoryClothes == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");

				}
				else {

					connectedUsers[socket.id].inventoryClothes[data.index].q -= data.q;

					if (connectedUsers[socket.id].inventoryClothes[data.index].q <= 0)
						connectedUsers[socket.id].inventoryClothes.splice(data.index, 1);

					db.query("UPDATE clothesInventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(connectedUsers[socket.id].inventoryClothes), data.uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el inventario de ropa despues de regalar un item");


					});

				}

			}






	});

//ACTUALIZA EL XP Y EL NIVEL
	socket.on("updxp", function (data) {



		const xp = data.xp;
		const level  = data.lvl;
		console.log("Actualizando experiencia y nivel");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            	//PRIMERO CHECO SI EL NIVEL Y EL XP SE HAN INICIALIZADO
				if (connectedUsers[socket.id].level == null || connectedUsers[socket.id].xp == null) {
					console.log("NO SE PUDO ACTUALIZAR EL NIVEL EN EL SERVIDOR, NO SE HA INICIALIZADO LA VARIABLE EN EL SERVIDOR");

                				socket.emit("expUpdated", "");

				}
				else {

                connectedUsers[socket.id].level = level; 
                connectedUsers[socket.id].xp = xp;
                				socket.emit("expUpdated", "");
                

                


                
				}

			}






	});


//ACTUALIZA EL XP Y EL NIVEL
	socket.on("ballGame", function (data) {

		const qty = data;
		console.log("Actualizando ball game");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            	//PRIMERO CHECO SI EL NIVEL Y EL XP SE HAN INICIALIZADO
				if (connectedUsers[socket.id].ballGame == null) {
					console.log("NO SE PUDO ACTUALIZAR BALLGAME EN EL SERVIDOR, NO SE HA INICIALIZADO LA VARIABLE EN EL SERVIDOR");

				}
				else {

                					connectedUsers[socket.id].ballGame = qty; 
                					console.log("Ahora el usuario tiene en ball game: " +connectedUsers[socket.id].ballGame );
				}

			}
	});


//ACTUALIZA EL XP Y EL NIVEL
	socket.on("upFavRoom", function (data) {

		const qty = data;
		console.log("Actualizando habitacion favorita");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

            	//PRIMERO CHECO SI EL NIVEL Y EL XP SE HAN INICIALIZADO
				if (connectedUsers[socket.id].favRoom == null) {
					console.log("NO SE PUDO ACTUALIZAR HABITACION FAVORITA, NO SE HA INICIALIZADO LA VARIABLE EN EL SERVIDOR");

				}
				else {

                					connectedUsers[socket.id].favRoom = qty; 
                					console.log("Ahora el usuario tiene habitacion favorita: " +connectedUsers[socket.id].favRoom );
				}

			}
	});




//VERIFICA SI EL USUARIO A VISITAR ESTA CONECTADO O NO
	socket.on("friendJoined", function (datas) {
    
    const data = datas.uid;
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();
		console.log("Enviando datos de union de sala");


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                        	dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                        	dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                        	dataToSend.lvl = rows6[0].level;
                	  										socket.emit("friendJoined", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                        	dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = 1;

                	  										socket.emit("friendJoined", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                            dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = rows6[0].level;

                	  										socket.emit("friendJoined", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                            dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = 1;

                	  										socket.emit("friendJoined", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    

		
	});

//VERIFICA SI EL USUARIO A VISITAR ESTA CONECTADO O NO
	socket.on("friendJoinedMG", function (datas) {
    
    const data = datas.uid;
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();
		console.log("Enviando datos de union de sala");


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                        	dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                        	dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                        	dataToSend.lvl = rows6[0].level;
                                                            dataToSend.sid = datas.sid;

                	  										socket.emit("friendJoinedMG", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                        	dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = 1;
                                                            dataToSend.sid = datas.sid;

                	  										socket.emit("friendJoinedMG", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                            dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = rows6[0].level;
                                                            dataToSend.sid = datas.sid;

                	  										socket.emit("friendJoinedMG", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                            dataToSend.act = datas.activity;
                                                        	dataToSend.vis= datas.visiting;
                                                        	dataToSend.uVis = datas.uVisiting;
                                                        	dataToSend.rVis = datas.roomVisit;
                                                            dataToSend.x = datas.x;
                                                        	dataToSend.y = datas.y;
                                                            dataToSend.lvl = 1;
                                                            dataToSend.sid = datas.sid;

                	  										socket.emit("friendJoinedMG", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    

		
	});




//LA MISMA FUNCION QUE ARRIBA PERO PARA JALAR DATOS DEL HOST
	socket.on("IJoinedTo", function (data) {
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();
		console.log("Enviando datos de union de sala");


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                	  										socket.emit("friendHostIs", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                	  										socket.emit("friendHostIs", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                	  										socket.emit("friendHostIs", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                	  										socket.emit("friendHostIs", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    

		
	});
//LA MISMA FUNCION QUE ARRIBA PERO PARA JALAR DATOS DEL HOST
	socket.on("IJoinedToMG", function (data) {
    
    /*
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();
		console.log("Enviando datos de union de sala");


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                	  										socket.emit("friendHostIsMG", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                	  										socket.emit("friendHostIsMG", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                	  										socket.emit("friendHostIsMG", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                	  										socket.emit("friendHostIsMG", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    */

		
	});

//LA MISMA FUNCION QUE ARRIBA PERO PARA JALAR DATOS DEL HOST
	socket.on("IJoinedToShared", function (data) {
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();
		console.log("Enviando datos de union de sala");


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data.roomHost], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data.roomHost;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data.roomHost], function (err3, rows3, fields3) {


								petInfoReady2.userid = data.roomHost;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data.roomHost], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.roomHost;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("friendHostSharedIs", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.roomHost;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("friendHostSharedIs", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data.roomHost;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data.roomHost], function (err3, rows3, fields3) {


								petInfoReady2.userid = data.roomHost;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data.roomHost], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.roomHost;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("friendHostSharedIs", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.roomHost;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("friendHostSharedIs", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    

		
	});



//VERIFICA SI EL USUARIO A VISITAR ESTA CONECTADO O NO
	socket.on("isFriendActive", function (data) {
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();


    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                            dataToSend.lvl = rows6[0].level;

                	  										socket.emit("fVisitStatus", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                            dataToSend.lvl = 1;
                	  										socket.emit("fVisitStatus", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data], function (err3, rows3, fields3) {


								petInfoReady2.userid = data;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = rows6[0].favRoom;
                                                            dataToSend.lvl = rows6[0].level;
                	  										socket.emit("fVisitStatus", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data;
                     										dataToSend.on = true;
                                            				dataToSend.rid = 1;
                                                            dataToSend.lvl = 1;
                	  										socket.emit("fVisitStatus", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    
		console.log("Verificando si usuario esta conectado");

		
	});



//VERIFICA SI EL USUARIO A VISITAR ESTA CONECTADO O NO PARA HABITACION COMPARTIDA
	socket.on("isFriendActiveShared", function (data) {
    
    var dataToSend = new Object();
    var petInfoReady = new Object();
    var petInfoReady2 = new Object();

	console.log("Datos de amigo ID: " + data.fid);
    console.log("Datos de room a visitar: " + data.rtM);
    		db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [data.fid], function (err2, rows2, fields2) {

			console.log("Columnas encontradas de amigo: " + rows2.length);

			if (rows2.length > 0) {

				petInfoReady.userid = data.fid;
				petInfoReady.top = rows2[0].top;
				petInfoReady.topC = rows2[0].topC;
				petInfoReady.pants = rows2[0].pants;
				petInfoReady.pantsC = rows2[0].pantsC;
				petInfoReady.shoes = rows2[0].shoes;
				petInfoReady.shoesC = rows2[0].shoesC;
				petInfoReady.mask = rows2[0].mask;
				petInfoReady.maskC = rows2[0].maskC;
				petInfoReady.wig = rows2[0].wig;
				petInfoReady.wigC = rows2[0].wigC;
				petInfoReady.hat = rows2[0].hat;
				petInfoReady.hatC = rows2[0].hatC;
				petInfoReady.handAccR = rows2[0].handAccR;
				petInfoReady.handAccRC = rows2[0].handAccRC;
				petInfoReady.handAccL = rows2[0].handAccL;
				petInfoReady.handAccLC = rows2[0].handAccLC;
				petInfoReady.wings = rows2[0].wings;
				petInfoReady.wingsC = rows2[0].wingsC;
				petInfoReady.glasses = rows2[0].glasses;
				petInfoReady.glassesC = rows2[0].glassesC;
				petInfoReady.tail = rows2[0].tail;
				petInfoReady.tailC = rows2[0].tailC;
				
                dataToSend.visitingFriendClothes = petInfoReady;

            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data.fid], function (err3, rows3, fields3) {


								petInfoReady2.userid = data.fid;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
            
                			            	db.query("SELECT * FROM balances WHERE userid=? LIMIT 1", [data.fid], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.fid;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("fVisitStatusShared", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.fid;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("fVisitStatusShared", dataToSend);
                                                        }
                                            

                                            
                                             });



                });

			}
			else {


				petInfoReady.userid = data.fid;
				petInfoReady.top = -1;
				petInfoReady.topC = "";
				petInfoReady.pants = -1;
				petInfoReady.pantsC = "";
				petInfoReady.shoes = -1;
				petInfoReady.shoesC = "";
				petInfoReady.mask = -1;
				petInfoReady.maskC = "";
				petInfoReady.wig = -1;
				petInfoReady.wigC = "";
				petInfoReady.hat = -1;
				petInfoReady.hatC = "";
				petInfoReady.handAccR = -1;
				petInfoReady.handAccRC = "";
				petInfoReady.handAccL = -1;
				petInfoReady.handAccLC = "";
				petInfoReady.wings = -1;
				petInfoReady.wingsC = "";
				petInfoReady.glasses = -1;
				petInfoReady.glassesC = "";
				petInfoReady.tail = -1;
				petInfoReady.tailC = "";
            
                dataToSend.visitingFriendClothes = petInfoReady;


				
            	db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [data.fid], function (err3, rows3, fields3) {


								petInfoReady2.userid = data.fid;

								petInfoReady2.head = rows3[0].head;
								petInfoReady2.ears = rows3[0].ears;
								petInfoReady2.eyes = rows3[0].eyes;
								petInfoReady2.eyebrow = rows3[0].eyebrow;
								petInfoReady2.mouth = rows3[0].mouth;
								petInfoReady2.nose = rows3[0].nose;
								petInfoReady2.facefill = rows3[0].facefill;
								petInfoReady2.r = rows3[0].r;
								petInfoReady2.g = rows3[0].g;
								petInfoReady2.b = rows3[0].b;
								petInfoReady2.eyeLashColor = rows3[0].eyeLashColor;
								petInfoReady2.eyeMakeUpColor = rows3[0].eyeMakeUpColor;
								petInfoReady2.eyePupilStyle = rows3[0].eyePupilStyle;
								petInfoReady2.eyebrowColor = rows3[0].eyebrowColor;
								petInfoReady2.mouthColor = rows3[0].mouthColor;
								petInfoReady2.lipsColor = rows3[0].lipsColor;
								petInfoReady2.noseColor = rows3[0].noseColor;
								petInfoReady2.facefillColor = rows3[0].facefillColor;
								petInfoReady2.facefillHColor = rows3[0].facefillHColor;
								petInfoReady2.petName = rows3[0].petname;
								petInfoReady2.socket = "";
								petInfoReady2.username = "";
								petInfoReady2.phoneColor = rows3[0].phoneColor;
			
          			            	db.query("SELECT *  FROM balances WHERE userid=? LIMIT 1", [data.fid], function (err6, rows6, fields6) 
                                             {
                                            			if (rows6.length > 0)
                                                        {
                                                        	dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.fid;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("fVisitStatusShared", dataToSend);
                                                        }
                                            			else
                                                        {
                                                            dataToSend.petData = petInfoReady2;
                           			 						dataToSend.id = data.fid;
                     										dataToSend.on = true;
                                            				dataToSend.rid = data.rtM;
                	  										socket.emit("fVisitStatusShared", dataToSend);
                                                        }
                                            

                                            
                                             });

                
                });
			}




		});
    
    
    
    
    
		console.log("Verificando si usuario esta conectado");

		
	});




	socket.on("updateItemInventory", function (data) {



		console.log("Actualizando item en inventario");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				if (connectedUsers[socket.id].inventory[data.index] == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");


				}
				else {
					connectedUsers[socket.id].inventory[data.index].q += data.qty;

					if (connectedUsers[socket.id].inventory[data.index].q <= 0)
						connectedUsers[socket.id].inventory.splice(data.index, 1);
				}

			}






	});

	socket.on("updateItemInventoryExt", function (data) {



		console.log("Actualizando item en inventario");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				if (connectedUsers[socket.id].inventoryExt[data.index] == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");


				}
				else {
					connectedUsers[socket.id].inventoryExt[data.index].q += data.qty;

					if (connectedUsers[socket.id].inventoryExt[data.index].q <= 0)
						connectedUsers[socket.id].inventoryExt.splice(data.index, 1);
				}

			}






	});


	socket.on("updateItemInventoryClothes", function (data) {



		console.log("Actualizando item en inventario de ropa");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				console.log("RECIBI INDICE A ACTUALIZAR" + data.index);

				if (connectedUsers[socket.id].inventoryClothes[data.index] == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");


				}
				else {
					connectedUsers[socket.id].inventoryClothes[data.index].q += data.qty;

					if (connectedUsers[socket.id].inventoryClothes[data.index].q <= 0)
						connectedUsers[socket.id].inventoryClothes.splice(data.index, 1);
				}

				console.log("Size del inventario de ropa " + connectedUsers[socket.id].inventoryClothes.lenght);

			}





	});


	socket.on("updateItemCustomClothes", function (data) {



		console.log("Actualizando item custom en inventario de ropa");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				console.log("RECIBI INDICE A ACTUALIZAR" + data.index);

				if (connectedUsers[socket.id].inventoryClothes[data.index] == null) {
					console.log("NO SE PUDO ACTUALIZAR EL ITEM EN EL SERVIDOR, INDICE NULO?");


				}
				else {
					connectedUsers[socket.id].inventoryClothes[data.index].q += data.qty;

					if (connectedUsers[socket.id].inventoryClothes[data.index].q <= 0)
						connectedUsers[socket.id].inventoryClothes.splice(data.index, 1);
				}

				console.log("Size del inventario de ropa " + connectedUsers[socket.id].inventoryClothes.lenght);
			}





	});
	socket.on("addItemFishbook", function (data) {

		console.log("Agregando item a coleccion de peces");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.s = data.s;
            
            if(connectedUsers[socket.id].fishBook != null)
            {
            	if( connectedUsers[socket.id].fishBook.length >0)
                {
                for(var i = 0;i < connectedUsers[socket.id].fishBook.length; i++)
                {
                    if(connectedUsers[socket.id].fishBook[i].id == objeto.id)
                    {
                                            console.log("Este pez ya existe, no se agrego");

                        break;
                    }
                    else
                    {
                        connectedUsers[socket.id].fishBook.splice(0, 0, objeto);
                        console.log("Se agrego un pez al descubrimiento de peces que no fue encontrado");
                        break;

                    }

                }
                }
            else
            {
            
                                    connectedUsers[socket.id].fishBook.splice(0, 0, objeto);
                        console.log("Se agrego un pez al descubrimiento de peces desde if desconocido");
            }
    			
                

            }
            else
            {
            	console.log("Fishbook no esta inicializado en el servidor");
            }
            


			}






	});



socket.on("addItemCraftingBook", function (data) {

		console.log("Agregando item a coleccion de recetas");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.s = data.s;
            
            if(connectedUsers[socket.id].craftingBook != null)
            {
            	if( connectedUsers[socket.id].craftingBook.length >0)
                {
                for(var i = 0;i < connectedUsers[socket.id].craftingBook.length; i++)
                {
                    if(connectedUsers[socket.id].craftingBook[i].id == objeto.id)
                    {
                        console.log("Esta receta ya existe, no se agrego");
                	  	socket.emit("recipeExists", "");

                        break;
                    }
                    else
                    {
                        connectedUsers[socket.id].craftingBook.splice(0, 0, objeto);
                        socket.emit("recipeAdded", "");

                        console.log("Se agrego una receta al registro");
                        break;

                    }

                }
                }
            else
            {
            
                                    connectedUsers[socket.id].craftingBook.splice(0, 0, objeto);
                                    socket.emit("recipeAdded", "");

            }
    			
                

            }
            else
            {
            	console.log("Crafting no esta inicializado en el servidor");
                 socket.emit("recipeError", "");

            }
            


			}






	});



	socket.on("addItemSongsBook", function (data) {

		console.log("Agregando item a coleccion de melodias");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.s = data.s;
            
            if(connectedUsers[socket.id].songsBook != null)
            {
            	if( connectedUsers[socket.id].songsBook.length >0)
                {
                for(var i = 0;i < connectedUsers[socket.id].songsBook.length; i++)
                {
                    if(connectedUsers[socket.id].songsBook[i].id == objeto.id)
                    {
                                            console.log("Esta melodia ya existe, no se agrego");
                	  	socket.emit("songExists", "");

                        break;
                    }
                    else
                    {
                        connectedUsers[socket.id].songsBook.splice(0, 0, objeto);
                        console.log("Se agrego una melodia al registro");
                                    	  	socket.emit("songAdded", "");

                        break;

                    }

                }
                }
            else
            {
            
                                    connectedUsers[socket.id].songsBook.splice(0, 0, objeto);
                                                	  	socket.emit("songAdded", "");

            }
    			
                

            }
            else
            {
            	console.log("SongsBook no esta inicializado en el servidor");
                                                	  	socket.emit("songError", "");

            }
            


			}






	});


socket.on("addItemGesturesBook", function (data) {

		console.log("Agregando item a coleccion de gestos");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.s = data.s;
            
            if(connectedUsers[socket.id].gesturesInv != null)
            {
            	if( connectedUsers[socket.id].gesturesInv.length >0)
                {
                for(var i = 0;i < connectedUsers[socket.id].gesturesInv.length; i++)
                {
                    if(connectedUsers[socket.id].gesturesInv[i].id == objeto.id)
                    {
                                            console.log("Este gesto ya existe, no se agrego");
                	  	socket.emit("gestureExists", "");

                        break;
                    }
                    else
                    {
                        connectedUsers[socket.id].gesturesInv.splice(0, 0, objeto);
                        console.log("Se agrego un gesto al registro");
                                    	  	socket.emit("gestureAdded", "");

                        break;

                    }

                }
                }
            else
            {
            
                                    connectedUsers[socket.id].gesturesInv.splice(0, 0, objeto);
                                                	  	socket.emit("gestureAdded", "");

            }
    			
                

            }
            else
            {
            	console.log("Gestures book no esta inicializado en el servidor");
                                                	  	socket.emit("gesturesError", "");

            }
            


			}






	});

	socket.on("addItemInventory", function (data) {

		console.log("Agregando item a inventario");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.q = data.q;
				objeto.c = data.c;
				objeto.n = data.n;
				objeto.ct = data.ct;
				
            if(connectedUsers[socket.id].inventory != null)
				connectedUsers[socket.id].inventory.splice(0, 0, objeto);
            else
            				socket.emit("accountIssue");


			}






	});

	socket.on("addItemInventoryExt", function (data) {

		console.log("Agregando item a inventario");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.q = data.q;
				objeto.c = data.c;
				objeto.n = data.n;
				objeto.ct = data.ct;

				connectedUsers[socket.id].inventoryExt.splice(0, 0, objeto);

			}






	});


	socket.on("addItemInventoryClothes", function (data) {



		console.log("Agregando item a inventario de ropa");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.q = data.q;
				objeto.c = data.c;
				objeto.n = data.n;
				objeto.ct = data.ct;

				connectedUsers[socket.id].inventoryClothes.splice(0, 0, objeto);

			}





	});


	socket.on("addItemCustomClothes", function (data) {



		console.log("Agregando item custom a inventario de ropa");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				var objeto = new Object();

				objeto.id = data.id;
				objeto.q = data.q;
				objeto.c = data.c;
				objeto.n = data.n;
				objeto.ct = data.ct;

				connectedUsers[socket.id].inventoryClothes.splice(0, 0, objeto);

			}




	});




	socket.on("updateBells", function (data) {


		console.log("Actualizando bells");



			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				connectedUsers[socket.id].bells = data.b;

				console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de bells: " + connectedUsers[socket.id].bells + " y cash: " + connectedUsers[socket.id].cash);
				socket.emit("bellsUpdated", connectedUsers[socket.id].bells.toFixed(0));

			}





	});

	socket.on("orderAzInventory", function (data) {


		console.log("Ordenando Alfabeticamente");



			if (connectedUsers[socket.id] != null) {
				connectedUsers[socket.id].inventory.sort(GetSortOrder("n"));

				socket.emit("inventarioOrdenado");

			}



	});


	socket.on("orderAzInventoryClothes", function (data) {


		console.log("Ordenando Alfabeticamente Ropa");


			if (connectedUsers[socket.id] != null) {
				connectedUsers[socket.id].inventoryClothes.sort(GetSortOrder("n"));

				socket.emit("inventarioClothesOrdenado");
			}




	});




	socket.on("savegame", function (data) {


		console.log("Guardando juego");


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				if (connectedUsers[socket.id].inventory != null) {
					db.query("UPDATE inventory SET inventory = ? WHERE userid=? LIMIT 1", [JSON.stringify(connectedUsers[socket.id].inventory), data], function (err4, rows4, fields4) {

						console.log("Se actualizo el inventario de la mascota desde la funcion de guardado");


					});
				}

			}




	});




//INICIA LOGIN
	socket.on("getInventoryFish", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM fishInventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario no existe, insertando");
				db.query("INSERT INTO fishInventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].fishBook = inventory;

							console.log("El usuario ha cargado su libro de peces en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventoryFish", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su libro de peces en el servidor");

						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].fishBook = inventory;


							console.log("El libro de peces es nulo, no puedo enviarte el inventario, enviando libro de peces nuevo");
							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventoryFish", inv);
						}
						else {
							connectedUsers[socket.id].fishBook = JSON.parse(rows[0].inventory);
                        
                        	console.log("Libro de peces: " + JSON.stringify(connectedUsers[socket.id].fishBook));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el libro de peces correctamente");

							socket.emit("inventoryFish", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN


//INICIA LOGIN
	socket.on("getInventoryCrafting", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM craftingInventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario de crafteo no existe, insertando");
				db.query("INSERT INTO craftingInventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].craftingBook = inventory;

							console.log("El usuario ha cargado su libro de crafteo en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventoryCrafting", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su libro de crafteo en el servidor");

						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].craftingBook = inventory;


							console.log("El libro de crafteo es nulo, no puedo enviarte el inventario, enviando libro de crafteo nuevo");
							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventoryCrafting", inv);
						}
						else {
							connectedUsers[socket.id].craftingBook = JSON.parse(rows[0].inventory);
                        
                        	console.log("Libro de crafteo: " + JSON.stringify(connectedUsers[socket.id].craftingBook));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el libro de crafteo correctamente");

							socket.emit("inventoryCrafting", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN




//INICIA LOGIN
	socket.on("getInventorySongs", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM songInventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario de melodias no existe, insertando");
				db.query("INSERT INTO songInventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].songsBook = inventory;

							console.log("El usuario ha cargado su libro de melodias en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventorySongs", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su libro de melodias en el servidor");

						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].songsBook = inventory;


							console.log("El libro de melodias es nulo, no puedo enviarte el inventario, enviando libro de melodias nuevo");
							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventorySongs", inv);
						}
						else {
							connectedUsers[socket.id].songsBook = JSON.parse(rows[0].inventory);
                        
                        	console.log("Libro de melodias: " + JSON.stringify(connectedUsers[socket.id].songsBook));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el libro de melodias correctamente");

							socket.emit("inventorySongs", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN


socket.on("getInventoryGestures", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM gesturesInventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario de gestos no existe, insertando");
				db.query("INSERT INTO gesturesInventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].gesturesInv = inventory;

							console.log("El usuario ha cargado su libro de gestos en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventoryGestures", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su libro de gestos en el servidor");

						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].gesturesInv = inventory;


							console.log("El libro de gestos es nulo, no puedo enviarte el inventario, enviando libro de gestos nuevo");
							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventoryGestures", inv);
						}
						else {
							connectedUsers[socket.id].gesturesInv = JSON.parse(rows[0].inventory);
                        
                        	console.log("Libro de gestos: " + JSON.stringify(connectedUsers[socket.id].craftgesturesInvingBook));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el libro de gestos correctamente");

							socket.emit("inventoryGestures", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN




	//INICIA LOGIN
	socket.on("getInventory", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM inventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario no existe, isnertando");
				db.query("INSERT INTO inventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].inventory = inventory;

							console.log("El usuario ha cargado su inventario en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventory", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su inventario en el servidor");

						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].inventory = inventory;


							console.log("El inventario es nulo, no puedo enviarte el inventario, enviando inventario nuevo");
							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventory", inv);
						}
						else {
							connectedUsers[socket.id].inventory = JSON.parse(rows[0].inventory);
                        
                        console.log("Inventario: " + JSON.stringify(connectedUsers[socket.id].inventory));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el inventario correctamente");

							socket.emit("inventory", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN




	socket.on("getInventoryExt", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM inventoryExt WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario no existe, insertando");
				db.query("INSERT INTO inventoryExt(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
                        
							connectedUsers[socket.id].inventoryExt = inventory;

							console.log("El usuario ha cargado su inventario exterior en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventoryExt", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);

            		
            console.log("El inventario exterior esssss" + inventory);
            console.log(Object.entries(inventory).length);
					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null ) {

						console.log("El usuario ha cargado su inventario exterior en el servidor");

						if (Object.entries(inventory).length < 1) {
							var inventory = new Object();
							inventory = JSON.parse("[]");

							connectedUsers[socket.id].inventoryExt = inventory;

							
							console.log("El inventario exterior es nulo, no puedo enviarte el inventario, enviando inventario nuevo");
							var inv = new Object();
							inv.inventory = "[]";
                        	connectedUsers[socket.id].inventoryExt =  JSON.parse("[]");
							inv.succ = false;

							socket.emit("inventoryExt", inv);
						}
						else {
							connectedUsers[socket.id].inventoryExt = JSON.parse(rows[0].inventory);
                        
                        	console.log("Inventario: " + JSON.stringify(connectedUsers[socket.id].inventoryExt));

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("Se envio el inventario exterior correctamente");

							socket.emit("inventoryExt", inv);
						}

					}



			}

		});
	}); // TERMINA LOGIN

	

	//INICIA LOGIN
	socket.on("getInventoryClothes", function (data) {

		const uid = data;

		db.query("SELECT inventory FROM clothesInventory WHERE userid=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Inventario de ropa no existe, insertando");
				db.query("INSERT INTO clothesInventory(`userid`, `inventory`) VALUES(?, ?)", [data, "[]"], function (err3, result3) {



					var inventory = new Object();
					inventory = JSON.parse("[]");


						// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
						if (connectedUsers[socket.id] != null) {
							connectedUsers[socket.id].inventoryClothes = inventory;

							console.log("El usuario ha cargado su inventario de ropa en el servidor por primera vez");


							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = true;

							socket.emit("inventoryClothes", inv);

						}

					


				});


			}
			else {
				var inventory = new Object();
				inventory = JSON.parse(rows[0].inventory);


					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null) {


						if (inventory == null) {
							var inventory = new Object();
							inventory = JSON.parse("[]");
							connectedUsers[socket.id].inventoryClothes = inventory;

							console.log("Inventario de ropa nulo, no es posible cargar inventario. Enviando inventario nulo");

							var inv = new Object();
							inv.inventory = "[]";
							inv.succ = false;

							socket.emit("inventoryClothes", inv);
						}
						else {
							connectedUsers[socket.id].inventoryClothes = inventory;

							console.log("El usuario ha cargado su inventario en el servidor");

							var inv = new Object();
							inv.inventory = rows[0].inventory;
							inv.succ = true;

							console.log("ENVIANDO INVENTARIO DE ROPA CORRECTAMENTE");

							socket.emit("inventoryClothes", inv);

						}


					}

	


			}

		});
	}); // TERMINA LOGIN





//Update password

socket.on("updatePassword", function (data) {

		const user = data.user,
			pass = data.pass,
		email = data.email
        
        db.query("UPDATE users SET password = ? WHERE email = ?  and username = ? LIMIT 1", [pass, email, user], function (err11, rows1, fields11) {

							if (!!err11)
								throw err11;
							else {
								socket.emit("UpdatedPassword", "true");

								console.log("Se actualizo la contrasena");

							}



						});



	}); // TERMINA 


socket.on("getMail", function (data) {




		console.log("Recibi usuario a checar" + data.user);


		db.query("SELECT email FROM users WHERE username = ?", [data.user], function (err1, rows1, fields1) {

			if (rows1.length > 0) {

            			console.log("El correo es" + rows1[0].email);
						
						
						socket.emit("sendEmail", rows1[0].email);


					}
        else{
        	console.log("No se encontro Email con el usuario" + data);
        
        	socket.emit("sendEmail", "error");
        }

		});








	});



	//REGITRO


	socket.on("signup", function (data) {

		const user = data.user,
			pass = data.pass,
		email = data.email
		db.query("SELECT * FROM users WHERE username=? LIMIT 1", [user], function (err, rows, fields) {
			if (rows.length == 0) {

				db.query("SELECT * FROM users WHERE email=? LIMIT 1", [email], function (err2, rows2, fields2) {

					if (rows2.length == 0) {


						db.query("INSERT INTO users(`username`, `password`,  `email`, `socket`) VALUES(?, ?, ?, ?)", [user, pass, email, socket.id], function (err3, result3) 
                                 {
							if (!!err3)
								throw err3;

							console.log("Registrando usuario");
					var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = result3.insertId;
						clientInfo.username = user;
                    clientInfo.petclothes = new Object();
                    clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
                    clientInfo.inventoryClothes = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();


                    connectedUsers[socket.id] = clientInfo;
                    
                    	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = result3.insertId;
                    	users.push(clientInfo2);


							console.log(result3);
                        
                        const inv = "[]";
                        						db.query("INSERT INTO inventory(`userid`, `inventory`) VALUES(?, ?)", [clientInfo.userID, inv], function (err32, result32)
                                                {
                                                                        						
                                               
                                                	db.query("INSERT INTO clothesInventory(`userid`, `inventory`) VALUES(?, ?)", [clientInfo.userID, inv], function (err32, result32)
                                                		{
                                                
                                                							socket.emit("registered", result3.insertId);

                                                
                                               			 });

                                                
                                                });



						});
					}
					else {
						console.log("YA EXISTE ESE CORREO");
						socket.emit("correoexiste", { user: user });
					}


				});


			}
			else {
				console.log("YA EXISTE ESE USUARIO");
				socket.emit("usuarioexiste", { user: user });
			}



		});




	}); // TERMINA REGISTRO


//INICIA LOGIN
	socket.on("fblogin", function (data) {
		const user = makeid(10),
			fbid = data.fbid,
              email = data.email,
			pass = makeid(13);
		db.query("SELECT * FROM users WHERE fbid=? LIMIT 1", [fbid], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist", { user: user });
            
            	
            
            
            						db.query("INSERT INTO users(`username`, `password`,  `email`, `fbid`, `socket`) VALUES(?, ?, ?, ?, ?)", [user, pass, email, fbid, socket.id], function (err3, result3) {
							if (!!err3)
								throw err3;

							console.log("Registrando usuario");
					var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = result3.insertId;
						clientInfo.username = user;
                    clientInfo.petclothes = new Object();
                    clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.inventoryClothes = new Object();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();


                    connectedUsers[socket.id] = clientInfo;
                    
                    	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = result3.insertId;
                    	users.push(clientInfo2);


							console.log(result3);


							socket.emit("registered", result3.insertId);
						});
            
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE fbid=? LIMIT 1", [fbid], function (err1, rows1, fields1) {
					if (rows1.length == 0) {
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = rows[0].id;
						clientInfo.username = rows[0].username;
                        clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
                    clientInfo.inventoryClothes = new Object();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();


                    connectedUsers[socket.id] = clientInfo;
                    
                    	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);

                    


						db.query("UPDATE users SET socket = ? WHERE fbid = ? LIMIT 1", [socket.id, fbid], function (err11, rows11, fields11) {

							if (!!err11)
								throw err11;
							else {
								socket.emit("adelanteAlCreador", rows1[0].id);
                            
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);

								console.log("Esta mascota no existe pero adelante al creador para registro");

							}



						});


					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							var clientInfo = new Object();
							clientInfo.clientId = socket.id;
							clientInfo.userID = rows[0].id;
							clientInfo.username = rows[0].username;
                            clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
                    clientInfo.inventoryClothes = new Object ();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();

                    connectedUsers[socket.id] = clientInfo;
                        
                                            	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);


							db.query("UPDATE users SET socket = ? WHERE fbid = ? LIMIT 1", [socket.id, fbid], function (err12, rows12, fields12) {

								if (!!err12)
									throw err12;
								else {
									console.log("Esta mascota no se ha creado pero adelante al creador para registro");

									socket.emit("adelanteAlCreador", rows1[0].id);
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


								}



							});




						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota ya existe, enviando datos al usuario");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows1[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO: " + rows1[0].id);
								console.log("Columnas encontradas: " + rows2.length);

								var petInfoReady = new Object();
								petInfoReady.userid = rows1[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = rows[0].username;


								db.query("UPDATE users SET socket = ? WHERE fbid = ? LIMIT 1", [socket.id, fbid], function (err13, rows13, fields13) {

									if (!!err13)
										throw err13;
									else {
										var dat = new Object();
										dat.clientId = socket.id;
										dat.userID = rows[0].id;
										dat.username = rows[0].username;
                                        dat.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    					dat.petclothes = new Object();
                    					dat.bells = 0;
                    					dat.cash = 0;
                    					dat.level = 1;
                   						dat.xp = 0;
                    					dat.pethealth = 10;
                    					dat.pethygiene = 10;
                   						dat.pethunger = 10;
                    					dat.inventory = new Object();
                    					dat.inventoryClothes = new Object();
                    					dat.room1 = new Object();
                    					dat.room2 = new Object();
                    					dat.room3 = new Object();
                    					dat.room4 = new Object();
                    					dat.room5 = new Object();
                    					dat.room6 = new Object();
                    					dat.room7 = new Object();
                    					dat.room8 = new Object();
                   		 				dat.room9 = new Object();
                    					dat.room10 = new Object();
                    					dat.room11 = new Object();
                    					dat.room12 = new Object();
                    					dat.room13 = new Object();
                    					dat.room14 = new Object();
                    					dat.room15 = new Object();
                    					dat.room16 = new Object();
                    					dat.room17 = new Object();
                    					dat.room18 = new Object();
                    					dat.room19 = new Object();
                    					dat.room20 = new Object();
                    					dat.room21 = new Object();
                    					dat.room22 = new Object();
                    					dat.room1000001 = new Object();


                    					connectedUsers[socket.id] = dat;
                                    
                                        var clientInfo2 = new Object();
										clientInfo2.clientId = socket.id;
										clientInfo2.userID = rows[0].id;
                    					users.push(clientInfo2);



										petsConnected.push(petInfoReady);

										console.log("estoy enviando el ID: " + petInfoReady.userid);
										socket.emit("petDataInfo", petInfoReady);
                                    
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


										db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1)", [rows[0].id, rows[0].id], function (errX, rowsX, fieldsX) {


											var amigosConectados = [];

											console.log("Amigos encontrados: " + rowsX.length);

											//Hago el arreglo de amigos con este for
											for (let i = 0; i < rowsX.length; i++) {

												var petFriend = new Object();

												if (rowsX[i].userTwo == rows[0].id)
													petFriend.userOne = rowsX[i].userOne;

												if (rowsX[i].userOne == rows[0].id)
													petFriend.userOne = rowsX[i].userTwo;

												for (var j = 0, len = users.length; j < len; ++j) {

													console.log("Checando al amigo para emitir, ID: " + petFriend.userOne);
													var c = users[j];
													// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
													if (c.userID == petFriend.userOne) {
														socket.broadcast.to(c.clientId).emit("seConecto", user); //sending to individual socketi


														amigosConectados.push(c.username); // agrego al usuario que se le hizo emit para enviarselo luego al que inicio sesion y saber quienes estan conectados para en el juego jalar el status
													}

												}




											}
											console.log("Enviando amigos conectados: " + JSON.stringify(amigosConectados));
											socket.emit("jugadoresConectados", amigosConectados);





										});



									}



								});




							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN



	//INICIA LOGIN
	socket.on("login", function (data) {


		const user = data.user,
			pass = data.pass;
console.log("La password recibida es ", data.pass)
		db.query("SELECT * FROM users WHERE username=? AND password =? LIMIT 1", [user, pass], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist", user);
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE username=? LIMIT 1", [user], function (err1, rows1, fields1) {
                
                //A buscar si existe en el array de desconectados
					if (rows1.length == 0) {
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = rows[0].id;
						clientInfo.username = user;
                        clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.inventoryClothes = new Object();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();


                    connectedUsers[socket.id] = clientInfo;
                    
                    	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);

                    


						db.query("UPDATE users SET socket = ? WHERE username = ? LIMIT 1", [socket.id, user], function (err11, rows11, fields11) {

							if (!!err11)
								throw err11;
							else {
								socket.emit("adelanteAlCreador", rows1[0].id);
                            
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);

								console.log("Esta mascota no existe pero adelante al creador para registro");

							}



						});


					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							var clientInfo = new Object();
							clientInfo.clientId = socket.id;
							clientInfo.userID = rows[0].id;
							clientInfo.username = user;
                            clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.inventoryClothes = new Object ();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();

                    connectedUsers[socket.id] = clientInfo;
                        
                                            	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);


							db.query("UPDATE users SET socket = ? WHERE username = ? LIMIT 1", [socket.id, user], function (err12, rows12, fields12) {

								if (!!err12)
									throw err12;
								else {
									console.log("Esta mascota no se ha creado pero adelante al creador para registro");

									socket.emit("adelanteAlCreador", rows1[0].id);
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


								}



							});




						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota ya existe, enviando datos al usuario");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows1[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO: " + rows1[0].id);
								console.log("Columnas encontradas: " + rows2.length);

								var petInfoReady = new Object();
								petInfoReady.userid = rows1[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = user;


								db.query("UPDATE users SET socket = ? WHERE username = ? LIMIT 1", [socket.id, user], function (err13, rows13, fields13) {

									if (!!err13)
										throw err13;
									else {
										var dat = new Object();
										dat.clientId = socket.id;
										dat.userID = rows[0].id;
										dat.username = user;
                                        dat.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    					dat.petclothes = new Object();
                    					dat.bells = 0;
                    					dat.cash = 0;
                    					dat.level = 1;
                   						dat.xp = 0;
                    					dat.pethealth = 10;
                    					dat.pethygiene = 10;
                   						dat.pethunger = 10;
                    					dat.inventory = new Object();
										dat.inventoryExt = new Object();
                    					dat.inventoryClothes = new Object();
                    					dat.room1 = new Object();
                    					dat.room2 = new Object();
                    					dat.room3 = new Object();
                    					dat.room4 = new Object();
                    					dat.room5 = new Object();
                    					dat.room6 = new Object();
                    					dat.room7 = new Object();
                    					dat.room8 = new Object();
                   		 				dat.room9 = new Object();
                    					dat.room10 = new Object();
                    					dat.room11 = new Object();
                    					dat.room12 = new Object();
                    					dat.room13 = new Object();
                    					dat.room14 = new Object();
                    					dat.room15 = new Object();
                    					dat.room16 = new Object();
                    					dat.room17 = new Object();
                    					dat.room18 = new Object();
                    					dat.room19 = new Object();
                    					dat.room20 = new Object();
                    					dat.room21 = new Object();
                    					dat.room22 = new Object();
                    					dat.room1000001 = new Object();


                    					connectedUsers[socket.id] = dat;
                                    
                                        var clientInfo2 = new Object();
										clientInfo2.clientId = socket.id;
										clientInfo2.userID = rows[0].id;
                    					users.push(clientInfo2);



										petsConnected.push(petInfoReady);

										console.log("estoy enviando el ID: " + petInfoReady.userid);
										socket.emit("petDataInfo", petInfoReady);
                                    
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


										db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1)", [rows[0].id, rows[0].id], function (errX, rowsX, fieldsX) {


											var amigosConectados = [];

											console.log("Amigos encontrados: " + rowsX.length);

											//Hago el arreglo de amigos con este for
											for (let i = 0; i < rowsX.length; i++) {

												var petFriend = new Object();

												if (rowsX[i].userTwo == rows[0].id)
													petFriend.userOne = rowsX[i].userOne;

												if (rowsX[i].userOne == rows[0].id)
													petFriend.userOne = rowsX[i].userTwo;

												for (var j = 0, len = users.length; j < len; ++j) {

													console.log("Checando al amigo para emitir, ID: " + petFriend.userOne);
													var c = users[j];
													// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
													if (c.userID == petFriend.userOne) {
														socket.broadcast.to(c.clientId).emit("seConecto", user); //sending to individual socketi


														amigosConectados.push(c.username); // agrego al usuario que se le hizo emit para enviarselo luego al que inicio sesion y saber quienes estan conectados para en el juego jalar el status
													}

												}




											}
											console.log("Enviando amigos conectados: " + JSON.stringify(amigosConectados));
											socket.emit("jugadoresConectados", amigosConectados);





										});



									}



								});




							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN

//INICIA LOGIN
	socket.on("getMyInfoFirstTime", function (data) {


		const user = data;
    console.log("USERID RECIBIDO " + user);
		db.query("SELECT * FROM users WHERE id=? LIMIT 1", [user], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist", user);
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE username=? LIMIT 1", [rows[0].username], function (err1, rows1, fields1) {
                
                //A buscar si existe en el array de desconectados
					if (rows1.length == 0) {
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = rows[0].id;
						clientInfo.username = user;
                        clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.inventoryClothes = new Object();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();


                    connectedUsers[socket.id] = clientInfo;
                    
                    	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);

                    


						db.query("UPDATE users SET socket = ? WHERE id = ? LIMIT 1", [socket.id, rows[0].id], function (err11, rows11, fields11) {

							if (!!err11)
								throw err11;
							else {
								socket.emit("adelanteAlCreador", rows1[0].id);
                            
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);

								console.log("Esta mascota no existe pero adelante al creador para registro");

							}



						});


					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							var clientInfo = new Object();
							clientInfo.clientId = socket.id;
							clientInfo.userID = rows[0].id;
							clientInfo.username = user;
                            clientInfo.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    clientInfo.petclothes = new Object();
                    clientInfo.bells = 0;
                    clientInfo.cash = 0;
                    clientInfo.level = 1;
                    clientInfo.xp = 0;
                    clientInfo.pethealth = 10;
                    clientInfo.pethygiene = 10;
                    clientInfo.pethunger = 10;
                    clientInfo.inventory = new Object();
					clientInfo.inventoryExt = new Object();
                    clientInfo.inventoryClothes = new Object ();
                    clientInfo.room1 = new Object();
                    clientInfo.room2 = new Object();
                    clientInfo.room3 = new Object();
                    clientInfo.room4 = new Object();
                    clientInfo.room5 = new Object();
                    clientInfo.room6 = new Object();
                    clientInfo.room7 = new Object();
                    clientInfo.room8 = new Object();
                    clientInfo.room9 = new Object();
                    clientInfo.room10 = new Object();
                    clientInfo.room11 = new Object();
                    clientInfo.room12 = new Object();
                    clientInfo.room13 = new Object();
                    clientInfo.room14 = new Object();
                    clientInfo.room15 = new Object();
                    clientInfo.room16 = new Object();
                    clientInfo.room17 = new Object();
                    clientInfo.room18 = new Object();
                    clientInfo.room19 = new Object();
                    clientInfo.room20 = new Object();
                    clientInfo.room21 = new Object();
                    clientInfo.room22 = new Object();
                    clientInfo.room1000001 = new Object();

                    connectedUsers[socket.id] = clientInfo;
                        
                                            	var clientInfo2 = new Object();
						clientInfo2.clientId = socket.id;
						clientInfo2.userID = rows[0].id;
                    	users.push(clientInfo2);


							db.query("UPDATE users SET socket = ? WHERE id = ? LIMIT 1", [socket.id, rows[0].id], function (err12, rows12, fields12) {

								if (!!err12)
									throw err12;
								else {
									console.log("Esta mascota no se ha creado pero adelante al creador para registro");

									socket.emit("adelanteAlCreador", rows1[0].id);
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


								}



							});




						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota ya existe, enviando datos al usuario");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows1[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO: " + rows1[0].id);
								console.log("Columnas encontradas: " + rows2.length);

								var petInfoReady = new Object();
								petInfoReady.userid = rows1[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = user;


								db.query("UPDATE users SET socket = ? WHERE id = ? LIMIT 1", [socket.id, rows1[0].id], function (err13, rows13, fields13) {

									if (!!err13)
										throw err13;
									else {
										var dat = new Object();
										dat.clientId = socket.id;
										dat.userID = rows[0].id;
										dat.username = user;
                                        dat.dataInit = false; //ESTA VARIABLE ES MI BANDERA PARA SABER SI EL USUARIO YA JALO TODOS LOS DATOS DEL SERVER Y INICIO CORRECTAAMENTE EL JUEGO

                    					dat.petclothes = new Object();
                    					dat.bells = 0;
                    					dat.cash = 0;
                    					dat.level = 1;
                   						dat.xp = 0;
                    					dat.pethealth = 10;
                    					dat.pethygiene = 10;
                   						dat.pethunger = 10;
                    					dat.inventory = new Object();
										dat.inventoryExt = new Object();
                    					dat.inventoryClothes = new Object();
                    					dat.room1 = new Object();
                    					dat.room2 = new Object();
                    					dat.room3 = new Object();
                    					dat.room4 = new Object();
                    					dat.room5 = new Object();
                    					dat.room6 = new Object();
                    					dat.room7 = new Object();
                    					dat.room8 = new Object();
                   		 				dat.room9 = new Object();
                    					dat.room10 = new Object();
                    					dat.room11 = new Object();
                    					dat.room12 = new Object();
                    					dat.room13 = new Object();
                    					dat.room14 = new Object();
                    					dat.room15 = new Object();
                    					dat.room16 = new Object();
                    					dat.room17 = new Object();
                    					dat.room18 = new Object();
                    					dat.room19 = new Object();
                    					dat.room20 = new Object();
                    					dat.room21 = new Object();
                    					dat.room22 = new Object();
                    					dat.room1000001 = new Object();


                    					connectedUsers[socket.id] = dat;
                                    
                                        var clientInfo2 = new Object();
										clientInfo2.clientId = socket.id;
										clientInfo2.userID = rows[0].id;
                    					users.push(clientInfo2);



										petsConnected.push(petInfoReady);

										console.log("estoy enviando el ID: " + petInfoReady.userid);
										socket.emit("petDataInfo", petInfoReady);
                                    
                        var d = new Date(rows[0].creationDate);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						var fecha = month + "/" + day + "/" + year;
                            	socket.emit("creationDate", fecha);


										db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1)", [rows[0].id, rows[0].id], function (errX, rowsX, fieldsX) {


											var amigosConectados = [];

											console.log("Amigos encontrados: " + rowsX.length);

											//Hago el arreglo de amigos con este for
											for (let i = 0; i < rowsX.length; i++) {

												var petFriend = new Object();

												if (rowsX[i].userTwo == rows[0].id)
													petFriend.userOne = rowsX[i].userOne;

												if (rowsX[i].userOne == rows[0].id)
													petFriend.userOne = rowsX[i].userTwo;

												for (var j = 0, len = users.length; j < len; ++j) {

													console.log("Checando al amigo para emitir, ID: " + petFriend.userOne);
													var c = users[j];
													// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
													if (c.userID == petFriend.userOne) {
														socket.broadcast.to(c.clientId).emit("seConecto", user); //sending to individual socketi


														amigosConectados.push(c.username); // agrego al usuario que se le hizo emit para enviarselo luego al que inicio sesion y saber quienes estan conectados para en el juego jalar el status
													}

												}




											}
											console.log("Enviando amigos conectados: " + JSON.stringify(amigosConectados));
											socket.emit("jugadoresConectados", amigosConectados);





										});



									}



								});




							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN


	//INICIA LOGIN
	socket.on("registerPetData", function (data) {
		const user = data.userid,
			head = data.head,
			ears = data.ears,
			eyes = data.eyes,
			eyebrow = data.eyebrow,
			mouth = data.mouth,
			nose = data.nose,
			facefill = data.facefill,
			r = data.r,
			g = data.g,
			b = data.b,
			eyeLashColor = data.eyeLashColor,
			eyeMakeUpColor = data.eyeMakeUpColor,
			eyePupilStyle = data.eyePupilStyle,
			eyebrowColor = data.eyebrowColor,
			mouthColor = data.mouthColor,
			lipsColor = data.lipsColor,
			noseColor = data.noseColor,
			facefillColor = data.facefillColor,
			facefillHColor = data.facefillHColor,
			petName = data.petName,
			username = data.username;

		db.query("SELECT * FROM pets WHERE userid=? LIMIT 1", [user], function (err, rows, fields) {
			if (rows.length == 0) {
				db.query("INSERT INTO pets(`userid`, `head`,  `ears`, `eyes`, `eyebrow`, `mouth`, `nose`, `facefill`, `r`, `g`, `b`, `eyeLashColor`, `eyeMakeUpColor`, `eyePupilStyle`, `eyebrowColor`, `mouthColor`, `lipsColor`, `noseColor`, `facefillColor`, `facefillHColor`, `petname`) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? , ?, ? ,?,? ,?,?,?,?,?,?)", [user, head, ears, eyes, eyebrow, mouth, nose, facefill, r, g, b, eyeLashColor, eyeMakeUpColor, eyePupilStyle, eyebrowColor, mouthColor, lipsColor, noseColor, facefillColor, facefillHColor, petName], function (err3, result3) {
					if (!!err3)
						throw err3;

					console.log(result3);

					db.query("UPDATE users SET petcreated = 1 WHERE id=? LIMIT 1", [user], function (err2, rows2, fields2) {
						if (!!err2)
							throw err2;


						console.log("Añadiendo a la mascota a la cola");
						var petInfo = new Object();
						petInfo.userid = user;
						petInfo.head = head;
						petInfo.ears = ears;
						petInfo.eyes = eyes;
						petInfo.eyebrow = eyebrow;
						petInfo.mouth = mouth;
						petInfo.nose = nose;
						petInfo.facefill = facefill;
						petInfo.r = r;
						petInfo.g = g;
						petInfo.b = b;
						petInfo.eyeLashColor = eyeLashColor;
						petInfo.eyeMakeUpColor = eyeMakeUpColor;
						petInfo.eyePupilStyle = eyePupilStyle;
						petInfo.eyebrowColor = eyebrowColor;
						petInfo.mouthColor = mouthColor;
						petInfo.lipsColor = lipsColor;
						petInfo.noseColor = noseColor;
						petInfo.facefillColor = facefillColor;
						petInfo.facefillHColor = facefillHColor;
						petInfo.petName = petName;
						petInfo.socket = socket.id;
						petInfo.username = username;

						petsConnected.push(petInfo);







						socket.emit("petregistered", petInfo);

					});
				});
			}
			else {
				//AQUI SE HACE UN UPDATE DE LAS PARTES

				console.log("updating pet parts");
				db.query("UPDATE pets SET userid=?, head=?, ears=?, eyes=?, eyebrow=?, mouth=?, nose=?, facefill=?, r=?, g=?, b=?, eyeLashColor=?, eyeMakeUpColor=?, eyePupilStyle=?, eyebrowColor=?, mouthColor=?, lipsColor=?, noseColor=?, facefillColor=?, facefillHColor=?, petname=? WHERE userid=? LIMIT 1", [user, head, ears, eyes, eyebrow, mouth, nose, facefill, r, g, b, eyeLashColor, eyeMakeUpColor, eyePupilStyle, eyebrowColor, mouthColor, lipsColor, noseColor, facefillColor, facefillHColor, petName, user], function (err4, rows4, fields4) {

					console.log("Añadiendo a la mascota a la cola");
					var petInfo = new Object();
					petInfo.userid = user;
					petInfo.head = head;
					petInfo.ears = ears;
					petInfo.eyes = eyes;
					petInfo.eyebrow = eyebrow;
					petInfo.mouth = mouth;
					petInfo.nose = nose;
					petInfo.facefill = facefill;
					petInfo.r = r;
					petInfo.g = g;
					petInfo.b = b;
					petInfo.eyeLashColor = eyeLashColor;
					petInfo.eyeMakeUpColor = eyeMakeUpColor;
					petInfo.eyePupilStyle = eyePupilStyle;
					petInfo.eyebrowColor = eyebrowColor;
					petInfo.mouthColor = mouthColor;
					petInfo.lipsColor = lipsColor;
					petInfo.noseColor = noseColor;
					petInfo.facefillColor = facefillColor;
					petInfo.facefillHColor = facefillHColor;
					petInfo.petName = petName;
					petInfo.socket = socket.id;
					petInfo.username = username;

					petsConnected.push(petInfo);



					if (!!err4)
						throw err4;
					socket.emit("petregistered", petInfo);

				});

			}
		});
	}); // TERMINA LOGIN


	socket.on("petRoomSaving", function (_data) {

		const roomInfo = _data.jsonData,
			user = _data.userID,
			roomN = _data.roomN,
			wallpaper = _data.wall,
			floor = _data.floor;

		console.log("ROOM: " + roomInfo);
		console.log("USERID: " + user);
		console.log("WALL: " + wallpaper);
		console.log("FLOOR : " + floor);
		db.query("SELECT * FROM room" + roomN + " WHERE userid=? LIMIT 1", [user], function (err, rows, fields) {
			if (!!err)
				throw err;

			if (rows.length > 0) {
				console.log("Si existe la room en BD");
				db.query("UPDATE room" + roomN + " SET room=?, wall=?, floor=?  WHERE userid=? LIMIT 1", [roomInfo, wallpaper, floor, user], function (err4, rows4, fields4) {
					if (!!err4)
						throw err4;
					console.log("Se ha guardado/actualizado la room: " + roomN);
				});
			}
			else {
				db.query("INSERT INTO room" + roomN + " (`room`,`userid`,`wall`,`floor`) VALUES(?, ?, ?, ?)", [roomInfo, user, wallpaper, floor], function (err3, result3) {
					if (!!err3)
						throw err3;

					console.log("Se ha insertado la room");
				});
			}

		});

	}); // TERMINA LOGIN





	//INICIA LOGIN
	socket.on("getFriend", function (data) {

		db.query("SELECT * FROM users WHERE username=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist");
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE username=? LIMIT 1", [data], function (err1, rows1, fields1) {
					if (rows1.length == 0) {


						socket.emit("mascotaNoRegistrada");
						console.log("Esta mascota aun no se ha registrado");

					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							socket.emit("mascotaNoRegistrada");
							console.log("Esta mascota aun no se ha registrado");

						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota es valida enviando datos de amigo");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows1[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO AMIGO: " + rows1[0].id);
								console.log("Columnas encontradas de amigo: " + rows2.length);

								var petInfoReady = new Object();
								petInfoReady.userid = rows1[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = data;
								petInfoReady.phoneColor = rows2[0].phoneColor;
								petInfoReady.status = 0;

								console.log("estoy enviando el ID amigo: " + petInfoReady.userid);



								socket.emit("petDataInfoAmigoUnknown", petInfoReady);



							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN



	//INICIA LOGIN
	socket.on("getFriendPreview", function (data) {

		var petInfoComplete = new Object();

		var petInfoReady = new Object();
		var petInfoReady2 = new Object();

		var petInfoReady3 = new Object();

		db.query("SELECT * FROM users WHERE username=? LIMIT 1", [data], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist");
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE username=? LIMIT 1", [data], function (err1, rows1, fields1) {
					if (rows1.length == 0) {


						socket.emit("mascotaNoRegistrada");
						console.log("Esta mascota aun no se ha registrado");

					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							socket.emit("mascotaNoRegistrada");
							console.log("Esta mascota aun no se ha registrado");

						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota es valida enviando datos de amigo");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows1[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO AMIGO: " + rows1[0].id);
								console.log("Columnas encontradas de amigo: " + rows2.length);


								petInfoReady.userid = rows1[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = data;
								petInfoReady.phoneColor = rows2[0].phoneColor;
								petInfoReady.status = 0;


								petInfoComplete.facials = petInfoReady;



								db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [rows1[0].id], function (err3, rows3, fields3) {


									if (rows3.length > 0) {

										petInfoReady2.userid = rows1[0].id;
										petInfoReady2.top = rows3[0].top;
										petInfoReady2.topC = rows3[0].topC;
										petInfoReady2.pants = rows3[0].pants;
										petInfoReady2.pantsC = rows3[0].pantsC;
										petInfoReady2.shoes = rows3[0].shoes;
										petInfoReady2.shoesC = rows3[0].shoesC;
										petInfoReady2.mask = rows3[0].mask;
										petInfoReady2.maskC = rows3[0].maskC;
										petInfoReady2.wig = rows3[0].wig;
										petInfoReady2.wigC = rows3[0].wigC;
										petInfoReady2.hat = rows3[0].hat;
										petInfoReady2.hatC = rows3[0].hatC;
										petInfoReady2.handAccR = rows3[0].handAccR;
										petInfoReady2.handAccRC = rows3[0].handAccRC;
										petInfoReady2.handAccL = rows3[0].handAccL;
										petInfoReady2.handAccLC = rows3[0].handAccLC;
										petInfoReady2.wings = rows3[0].wings;
										petInfoReady2.wingsC = rows3[0].wingsC;
										petInfoReady2.glasses = rows3[0].glasses;
										petInfoReady2.glassesC = rows3[0].glassesC;
										petInfoReady2.tail = rows3[0].tail;
										petInfoReady2.tailC = rows3[0].tailC;
										console.log("estoy enviando el ID mio ropa: " + petInfoReady.userid);

										petInfoComplete.clothes = petInfoReady2;


										socket.emit("petAmigoPreview", petInfoComplete);

									}
									else {


										petInfoReady3.userid = rows1[0].id;
										petInfoReady3.top = -1;
										petInfoReady3.topC = "";
										petInfoReady3.pants = -1;
										petInfoReady3.pantsC = "";
										petInfoReady3.shoes = -1;
										petInfoReady3.shoesC = "";
										petInfoReady3.mask = -1;
										petInfoReady3.maskC = "";
										petInfoReady3.wig = -1;
										petInfoReady3.wigC = "";
										petInfoReady3.hat = -1;
										petInfoReady3.hatC = "";
										petInfoReady3.handAccR = -1;
										petInfoReady3.handAccRC = "";
										petInfoReady3.handAccL = -1;
										petInfoReady3.handAccLC = "";
										petInfoReady3.wings = -1;
										petInfoReady3.wingsC = "";
										petInfoReady3.glasses = -1;
										petInfoReady3.glassesC = "";
										petInfoReady3.tail = -1;
										petInfoReady3.tailC = "";


										petInfoComplete.clothes = petInfoReady3;

										socket.emit("petAmigoPreview", petInfoComplete);

									}




								});




							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN


	//INICIA LOGIN
	socket.on("getFriendIndividually", function (data) {

		const idamigo = data.userOne,
			statusAmigo = data.status,
			conn = data.connection,
			fav = data.fav;

		var petInfoReady = new Object();
		var petInfoReady2 = new Object();
		var petInfoReady3 = new Object();

		var petInfoComplete = new Object();



		db.query("SELECT * FROM users WHERE id=? LIMIT 1", [idamigo], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist");
			}
			else {
				db.query("SELECT petcreated, id, fbid FROM users WHERE id=? LIMIT 1", [idamigo], function (err1, rows1, fields1) {
					if (rows1.length == 0) {


						socket.emit("mascotaNoRegistrada");
						console.log("Esta mascota aun no se ha registrado");

					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							socket.emit("mascotaNoRegistrada");
							console.log("Esta mascota aun no se ha registrado");

						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota es valida enviando datos de amigo");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [idamigo], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO AMIGO: " + idamigo);
								console.log("Columnas encontradas de amigo: " + rows2.length);

								petInfoReady.userid = idamigo;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = rows[0].username;
								petInfoReady.phoneColor = rows2[0].phoneColor;
								petInfoReady.status = statusAmigo;
								petInfoReady.connection = conn;
								petInfoReady.fav = fav;
                            	petInfoReady.fbid = rows[0].fbid;
								console.log("estoy enviando el ID amigo: " + petInfoReady.userid);
								petInfoComplete.facials = petInfoReady;

								db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [idamigo], function (err3, rows3, fields3) {


									if (rows3.length > 0) {

										petInfoReady2.userid = idamigo;
										petInfoReady2.top = rows3[0].top;
										petInfoReady2.topC = rows3[0].topC;
										petInfoReady2.pants = rows3[0].pants;
										petInfoReady2.pantsC = rows3[0].pantsC;
										petInfoReady2.shoes = rows3[0].shoes;
										petInfoReady2.shoesC = rows3[0].shoesC;
										petInfoReady2.mask = rows3[0].mask;
										petInfoReady2.maskC = rows3[0].maskC;
										petInfoReady2.wig = rows3[0].wig;
										petInfoReady2.wigC = rows3[0].wigC;
										petInfoReady2.hat = rows3[0].hat;
										petInfoReady2.hatC = rows3[0].hatC;
										petInfoReady2.handAccR = rows3[0].handAccR;
										petInfoReady2.handAccRC = rows3[0].handAccRC;
										petInfoReady2.handAccL = rows3[0].handAccL;
										petInfoReady2.handAccLC = rows3[0].handAccLC;
										petInfoReady2.wings = rows3[0].wings;
										petInfoReady2.wingsC = rows3[0].wingsC;
										petInfoReady2.glasses = rows3[0].glasses;
										petInfoReady2.glassesC = rows3[0].glassesC;
										petInfoReady2.tail = rows3[0].tail;
										petInfoReady2.tailC = rows3[0].tailC;
										console.log("estoy enviando el ID mio ropa: " + petInfoReady.userid);

										petInfoComplete.clothes = petInfoReady2;

										db.query("SELECT level  FROM balances WHERE userid=? LIMIT 1", [idamigo], function (err00, rows00, fields00) 
                                        {
                                        		var lvl = 1;
                                        
                                        		if(rows00.length>0)
                                                {
                                                	lvl = rows00[0].level;
                                                }
                                        		petInfoComplete.level = lvl;
                                        		socket.emit("petDataInfoAmigo", petInfoComplete);

                                        });


									}
									else {


										petInfoReady3.userid = idamigo;
										petInfoReady3.top = -1;
										petInfoReady3.topC = "";
										petInfoReady3.pants = -1;
										petInfoReady3.pantsC = "";
										petInfoReady3.shoes = -1;
										petInfoReady3.shoesC = "";
										petInfoReady3.mask = -1;
										petInfoReady3.maskC = "";
										petInfoReady3.wig = -1;
										petInfoReady3.wigC = "";
										petInfoReady3.hat = -1;
										petInfoReady3.hatC = "";
										petInfoReady3.handAccR = -1;
										petInfoReady3.handAccRC = "";
										petInfoReady3.handAccL = -1;
										petInfoReady3.handAccLC = "";
										petInfoReady3.wings = -1;
										petInfoReady3.wingsC = "";
										petInfoReady3.glasses = -1;
										petInfoReady3.glassesC = "";
										petInfoReady3.tail = -1;
										petInfoReady3.tailC = "";


										petInfoComplete.clothes = petInfoReady3;

										db.query("SELECT level  FROM balances WHERE userid=? LIMIT 1", [idamigo], function (err00, rows00, fields00) 
                                        {
                                        		var lvl = 1;
                                        
                                        		if(rows00.length>0)
                                                {
                                                	lvl = rows00[0].level;
                                                }
                                        		petInfoComplete.level = lvl;
                                        		socket.emit("petDataInfoAmigo", petInfoComplete);

                                        });
									}




								});





							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN


	//INICIA LOGIN
	socket.on("getFriendIndividuallyWithUsername", function (data) {

		const idamigo = data.userOne,
			statusAmigo = data.status,
			conn = data.connection,
			fav = data.fav;

		var petInfoReady = new Object();
		var petInfoReady2 = new Object();
		var petInfoReady3 = new Object();

		var petInfoComplete = new Object();

		db.query("SELECT * FROM users WHERE username=? LIMIT 1", [idamigo], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist");
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE id=? LIMIT 1", [rows[0].id], function (err1, rows1, fields1) {
					if (rows1.length == 0) {


						socket.emit("mascotaNoRegistrada");
						console.log("Esta mascota aun no se ha registrado");

					}
					else {

						//Si no esta la mascota, lo manda al creador
						if (rows1[0].petcreated == "0") {
							socket.emit("mascotaNoRegistrada");
							console.log("Esta mascota aun no se ha registrado");

						}
						//Si si exsite la mascota, se toman los datos de la BD y se envian por socket -(se manda directo al roomcanvas)
						else if (rows1[0].petcreated == "1") {
							console.log("Esta mascota es valida enviando datos de amigo");

							db.query("SELECT *  FROM pets WHERE userid=? LIMIT 1", [rows[0].id], function (err2, rows2, fields2) {

								console.log("ID DEL USUARIO AMIGO: " + rows[0].id);
								console.log("Columnas encontradas de amigo: " + rows2.length);

								petInfoReady.userid = rows[0].id;

								petInfoReady.head = rows2[0].head;
								petInfoReady.ears = rows2[0].ears;
								petInfoReady.eyes = rows2[0].eyes;
								petInfoReady.eyebrow = rows2[0].eyebrow;
								petInfoReady.mouth = rows2[0].mouth;
								petInfoReady.nose = rows2[0].nose;
								petInfoReady.facefill = rows2[0].facefill;
								petInfoReady.r = rows2[0].r;
								petInfoReady.g = rows2[0].g;
								petInfoReady.b = rows2[0].b;
								petInfoReady.eyeLashColor = rows2[0].eyeLashColor;
								petInfoReady.eyeMakeUpColor = rows2[0].eyeMakeUpColor;
								petInfoReady.eyePupilStyle = rows2[0].eyePupilStyle;
								petInfoReady.eyebrowColor = rows2[0].eyebrowColor;
								petInfoReady.mouthColor = rows2[0].mouthColor;
								petInfoReady.lipsColor = rows2[0].lipsColor;
								petInfoReady.noseColor = rows2[0].noseColor;
								petInfoReady.facefillColor = rows2[0].facefillColor;
								petInfoReady.facefillHColor = rows2[0].facefillHColor;
								petInfoReady.petName = rows2[0].petname;
								petInfoReady.socket = socket.id;
								petInfoReady.username = rows[0].username;
								petInfoReady.phoneColor = rows2[0].phoneColor;
								petInfoReady.status = statusAmigo;
								petInfoReady.connection = conn;
								petInfoReady.fav = fav;
								console.log("estoy enviando el ID amigo: " + petInfoReady.userid);

								petInfoComplete.facials = petInfoReady;

								db.query("SELECT *  FROM petclothes WHERE userid=? LIMIT 1", [rows[0].id], function (err3, rows3, fields3) {


									if (rows3.length > 0) {

										petInfoReady2.userid = rows[0].id;
										petInfoReady2.top = rows3[0].top;
										petInfoReady2.topC = rows3[0].topC;
										petInfoReady2.pants = rows3[0].pants;
										petInfoReady2.pantsC = rows3[0].pantsC;
										petInfoReady2.shoes = rows3[0].shoes;
										petInfoReady2.shoesC = rows3[0].shoesC;
										petInfoReady2.mask = rows3[0].mask;
										petInfoReady2.maskC = rows3[0].maskC;
										petInfoReady2.wig = rows3[0].wig;
										petInfoReady2.wigC = rows3[0].wigC;
										petInfoReady2.hat = rows3[0].hat;
										petInfoReady2.hatC = rows3[0].hatC;
										petInfoReady2.handAccR = rows3[0].handAccR;
										petInfoReady2.handAccRC = rows3[0].handAccRC;
										petInfoReady2.handAccL = rows3[0].handAccL;
										petInfoReady2.handAccLC = rows3[0].handAccLC;
										petInfoReady2.wings = rows3[0].wings;
										petInfoReady2.wingsC = rows3[0].wingsC;
										petInfoReady2.glasses = rows3[0].glasses;
										petInfoReady2.glassesC = rows3[0].glassesC;
										petInfoReady2.tail = rows3[0].tail;
										petInfoReady2.tailC = rows3[0].tailC;
										console.log("estoy enviando el ID mio ropa: " + petInfoReady.userid);

										petInfoComplete.clothes = petInfoReady2;


										socket.emit("petDataInfoAmigo", petInfoComplete);

									}
									else {


										petInfoReady3.userid = rows1[0].id;
										petInfoReady3.top = -1;
										petInfoReady3.topC = "";
										petInfoReady3.pants = -1;
										petInfoReady3.pantsC = "";
										petInfoReady3.shoes = -1;
										petInfoReady3.shoesC = "";
										petInfoReady3.mask = -1;
										petInfoReady3.maskC = "";
										petInfoReady3.wig = -1;
										petInfoReady3.wigC = "";
										petInfoReady3.hat = -1;
										petInfoReady3.hatC = "";
										petInfoReady3.handAccR = -1;
										petInfoReady3.handAccRC = "";
										petInfoReady3.handAccL = -1;
										petInfoReady3.handAccLC = "";
										petInfoReady3.wings = -1;
										petInfoReady3.wingsC = "";
										petInfoReady3.glasses = -1;
										petInfoReady3.glassesC = "";
										petInfoReady3.tail = -1;
										petInfoReady3.tailC = "";


										petInfoComplete.clothes = petInfoReady3;

										socket.emit("petDataInfoAmigo", petInfoComplete);

									}




								});





							});

						}


						else {
							console.log("No se encontro el dato de la mascota");

						}


					}

				});


				console.log("Logueado iniciando juego");
			}
		});
	}); // TERMINA LOGIN


	socket.on("setFavoriteFriend", function (data) {


		const mainUser = data.username1,
			friendUser = data.username2;

		console.log("Recibi como usuario principal: " + mainUser);
		console.log("Recibi como usuario secundario: " + friendUser);


		db.query("SELECT * FROM friends WHERE (userOne=? AND userTwo=?) OR (userOne=? AND userTwo=?)", [mainUser, friendUser, friendUser, mainUser], function (err2, rows2, fields2) {

			if (rows2.length > 0) {

				console.log("ID 1: " + rows2[0].userOne);
				console.log("ID 2: " + rows2[0].userTwo);


				if (mainUser == rows2[0].userOne) //FavUser1 = true
				{
					db.query("UPDATE friends SET favUser1=1 WHERE userOne=? AND userTwo=? ", [mainUser, friendUser], function (err3, result3) {


					});

				}


				if (mainUser == rows2[0].userTwo && friendUser == rows2[0].userOne) //FavUser2 = true
				{
					db.query("UPDATE friends SET favUser2=1 WHERE userOne=? AND userTwo=? ", [friendUser, mainUser], function (err3, result3) {


					});
				}
			}

		});
	});



	socket.on("unSetFavoriteFriend", function (data) {


		const mainUser = data.username1,
			friendUser = data.username2;


		db.query("SELECT * FROM friends WHERE (userOne=? AND userTwo=?) OR (userOne=? AND userTwo=?)", [mainUser, friendUser, friendUser, mainUser], function (err2, rows2, fields2) {

			if (rows2.length > 0) {

				console.log("ID 1: " + rows2[0].userOne);
				console.log("ID 2: " + rows2[0].userTwo);


				if (mainUser == rows2[0].userOne) //FavUser1 = true
				{
					db.query("UPDATE friends SET favUser1=0 WHERE userOne=? AND userTwo=? ", [mainUser, friendUser], function (err3, result3) {


					});

				}


				if (mainUser == rows2[0].userTwo && friendUser == rows2[0].userOne) //FavUser2 = true
				{
					db.query("UPDATE friends SET favUser2=0 WHERE userOne=? AND userTwo=? ", [friendUser, mainUser], function (err3, result3) {


					});
				}
			}

		});
	});


socket.on("receiptValidation", function (data) {



	console.log("Validando recibo");

	//var receipt = JSON.stringify(data);
//console.log(typeof receipt);
//var receipt = {"Payload":"{\"json\":\"{\\\"orderId\\\":\\\"GPA.3336-7915-8325-88814\\\",\\\"packageName\\\":\\\"com.DefaultCompany.TemporalPet\\\",\\\"productId\\\":\\\"temporalpet.coinpack5000\\\",\\\"purchaseTime\\\":1666308307892,\\\"purchaseState\\\":0,\\\"purchaseToken\\\":\\\"ppofleclcbocaapbcblcledn.AO-J1Oz3uA-IY5sZvaXu91bfjCqGnsmk9K9qZsuTLlhOzMzKfUSlgNzn6-sJxkOPBparx70Tt-jGASF4HU_WyLY3iXbN2abACC_RByvGG_ivnGCfBcYaiMY\\\",\\\"acknowledged\\\":false}\",\"signature\":\"QARO5q58d9xSQi/Meusvfp7hAn6/BE4owy8C8HJqw9vqpu1rz/SDt2M0nvRVUeg8DqsCkdhM1oz161mON2J79KHRvgjfdJ4Pz1+kFvHX0xcodQK1ASd7N6qEOMPx5vas8jJETGyPl9dLGMDM7XAYY7Lotv6IJjaiuPEqmQQ9Fbz3PD/XnJFEQZcjipJyRbj3+9ZFQ2tSk4MgBWTzf4lbtZNw2jKZKwxUCOC4Kkv9ooD0TTQLwbuiT0A1dxe/lG5FdbZKFeVaipAKo7wnS55T9Z0nx16z7zBFOnKO/wICGkd/47eXBK1J3/QK57Wacc5T+WY45lFe3WMEORs24y+1Fw==\",\"skuDetails\":\"{\\\"productId\\\":\\\"temporalpet.coinpack5000\\\",\\\"type\\\":\\\"inapp\\\",\\\"title\\\":\\\"Pack de 5000 (com.DefaultCompany.TemporalPet (unreviewed))\\\",\\\"name\\\":\\\"Pack de 5000\\\",\\\"description\\\":\\\"Este pack da 5000 monedas\\\",\\\"price\\\":\\\"$50.00\\\",\\\"price_amount_micros\\\":50000000,\\\"price_currency_code\\\":\\\"MXN\\\",\\\"skuDetailsToken\\\":\\\"AEuhp4KfZ53Szh-KFahuhP7x-4HM4dU8lpq_pNJBnxB0DLvDakmkFuBrqY-sQ4Txuzeu\\\"}\"}","Store":"GooglePlay","TransactionID":"ppofleclcbocaapbcblcledn.AO-J1Oz3uA-IY5sZvaXu91bfjCqGnsmk9K9qZsuTLlhOzMzKfUSlgNzn6-sJxkOPBparx70Tt-jGASF4HU_WyLY3iXbN2abACC_RByvGG_ivnGCfBcYaiMY"};


var receipt = data;
  
iap.config({

    /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
    googleServiceAccount: {
        clientEmail: 'temporalpet@temporal-pet.iam.gserviceaccount.com',
        privateKey: 'nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDJuhJWmr/t1fek\n+FuGFTfn+rySuqIYB6bgkkWRq/bnz7IxsbqgEUVd8T4rnqywfDhE6ONz8tt5DSN9\nrX9ML34KdQapAaHPH8y8D72ARRISzt6O7VoMwZyvbF8t7smvaoyC7+IEWLJFjsW4\nrLvL2KvKOv9060VYXNmXWBX2zShkfY9Mi5T7s0MDsmwr+3ed5RdiBwp3S9jYNPxU\nvWwNYg9pP5LyFQuFzUFOFszpo0cR/q5RQRbPJ8jyAIw3mOG+CVxjMFVbRnsO7ejV\n9UZClmR5sDd3pDIguEM5AsRZa4XHIGXVc57to+m9mK2J9lHcrdCRx8vue1s6Bz05\nYmnuD2ZnAgMBAAECggEADxlz7PKZYiqNZlZGt4MYE6+jdNIuduD/vziDp5M5IIHd\n4zVb9EZGrHD1x9sRLwalSZcrC09G2Uk/+lTFvgSiCRNYY8cg/vlw4DTHaPYCk9DT\nPNyMTH8jhMf2WeBRTWWKzfQ5tTyUX3t/1kJrribyOOlwnKZNov8UNG1d+4LAvsC7\nE3pXROVluxww8VDrFjhJDZ2py4cgdeGgs4qk+HGnDNmjLxfm+cvDlcH32onD0Vbq\nx+4aCveEzKM3jW6mgSl7d1lR8XHLJ1er123dkfjnFZx+RzF0MWf2CX1viJDz2d/o\nUjX5l2GSFcM/pd8Oe7UPMZMxw003yfzzr7ekH6eh4QKBgQD45HkPM4GnHo/tqsZ/\ndazOCwYdQmdqA8LrSsFz72gimIHXPgKDWh/apAZsR/0kviHCL0InOpge1zeXf8ks\n3W55WT+Bgbfqwz93mcrZI8BQfR77GxFXklRD2dc+vCbA7bKKhUPbeFW54thPHjqT\nIG1dWG2p1yd5QzfcNRXtFxRcRwKBgQDPfMtukqRVfs0qsW8wMrCdJ/+gZ4sQgK6S\ngSI4nWH8IcbWg9+y5p9RIuYMbbD4Y/NAeU9HMpQCFSXjzUaDE0dUctH/C9omgcFt\ntQtmyczP4fluehKp+mHVtBrLhI8jhjsLCAy0YkZptjQfbPmlR9/BBt4e7x59yB3p\nCBdeyoVU4QKBgQCI7XEoisaegXLfZx+TSdMK/AeeG0U3juAygEsTlDdvKQXtu8C4\nMOHrcGfUNHqxNyTtZwB3AoZkGTUNVREBbMT1X8NPZWUgc9A75VEyyrdn0J41uXt9\n+RQAzBzd97c+Vsbt7EkbugU3ofQs+s1w2dsxCpAyaxrdXLyjmlT4vcTGywKBgQCl\nBo/S4UVdTp4mD7vsrNR2GqMhVFlyBbdThOvP9bVCUScR5Q9d/jnG0agBSJlR5kVK\nCXI5oYvA4EsjlVg41nOMQkqtvSKEL/3FoRJxbZ291fCKowMHOMLpsvcA2ezzB0cc\nrglUyzlPyQBJ4mXoxHK91xWBqxQoXKsVdj8IQLGtYQKBgQCUSDuoTJvqXN+i0Lop\n6U7LNYiwq/tKBF9bI/Wg+6HBOLqnyRhbo2guCKJVgSaCE1o15NQCek3OJRXgqGtm\nJl1rhG3QDOgsMTcvwN7RYx99rD4TIPBsMgI9NXVyir5LFwmqOTkaLjvRa0JjPNzh\noQCCoYeD3ZUkMD5ifhjG4g2gwQ=='
    },

    /* Configurations for Google Play */
    googlePublicKeyPath: 'path/to/public/key/directory/', // this is the path to the directory containing iap-sanbox/iap-live files
    googlePublicKeyStrSandBox: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs5EllKOOvHxlA0qwsVsYtWTgZhKID0LttHz8CxXBOU0Qgj+tc8AB5h3vMkahGhDaWHWReac8+ySFal+Y/pBCScGCINYk+aYacy9lxuMWC6Mv9CkOv7yDx5+FXmdGra44kuTecM8dbnbKlBEvcRcNh96tHRE5FAACBT3CQJdUYlX//n6NkJetp2HQ6ejJTy7mtpVZvEBizRJ5bOVRB4wEuVLE/y0H/ufMZVVfrjQQ50wx5PJehOkTHxmYMtoLkyWiSp33gzIEQXT7Dv6zOWT9L3CCBgqsMVmjIywIHm/KyOq1w4Ll3/uyZAlnOzHN2PVPoayEatTqCp+kV5sD65O2xQIDAQAB', // this is the google iap-sandbox public key string
    googlePublicKeyStrLive: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAs5EllKOOvHxlA0qwsVsYtWTgZhKID0LttHz8CxXBOU0Qgj+tc8AB5h3vMkahGhDaWHWReac8+ySFal+Y/pBCScGCINYk+aYacy9lxuMWC6Mv9CkOv7yDx5+FXmdGra44kuTecM8dbnbKlBEvcRcNh96tHRE5FAACBT3CQJdUYlX//n6NkJetp2HQ6ejJTy7mtpVZvEBizRJ5bOVRB4wEuVLE/y0H/ufMZVVfrjQQ50wx5PJehOkTHxmYMtoLkyWiSp33gzIEQXT7Dv6zOWT9L3CCBgqsMVmjIywIHm/KyOq1w4Ll3/uyZAlnOzHN2PVPoayEatTqCp+kV5sD65O2xQIDAQAB', // this is the google iap-live public key string
    


    /* Configurations all platforms */
    test: true, // For Apple and Googl Play to force Sandbox validation only
    verbose: true // Output debug logs to stdout stream
});

iap.setup()
  .then(() => {

    
    // iap.validate(...) automatically detects what type of receipt you are trying to validate
    if(receipt != null){
      iap.validate(receipt).then(onSuccess).catch(onError);
    }
    
  })
  .catch((error) => {
    
    // error...
  });

function onSuccess(validatedData) {
	socket.emit("purchaseState", "TRUE");
    console.log("Salio bueno");
    // validatedData: the actual content of the validated receipt
    // validatedData also contains the original receipt
    var options = {
        ignoreCanceled: true, // Apple ONLY (for now...): purchaseData will NOT contain cancceled items
        ignoreExpired: true // purchaseData will NOT contain exipired subscription items
    };
    // validatedData contains sandbox: true/false for Apple and Amazon
    var purchaseData = iap.getPurchaseData(validatedData, options);
	
}

function onError(error) {
	socket.emit("purchaseState", "FALSE");
    console.log("Salio Malo");
    console.log(error);
    // failed to validate the receipt...
}




});

	socket.on("wantFriend", function (data) {


		const u1 = data.username1,
			u2 = data.username2;

		console.log("Reibi usuario a agregar: " + u2);
		console.log("Usuario que agregar���: " + u1);



		db.query("SELECT id, socket FROM users WHERE username=? LIMIT 1", [u2], function (err, rows, fields) {



			if (rows.length == 0) {
				console.log("Usuario amigo no existe");
				socket.emit("UserFriendNotExist");
			}
			else {
				db.query("SELECT * FROM friends WHERE userOne=? AND userTwo=? UNION SELECT * FROM friends WHERE userOne=? AND userTwo=?", [u1, rows[0].id, rows[0].id, u1], function (err2, rows2, fields2) {
					if (rows2.length == 0) {

						db.query("INSERT INTO friends(`userOne`, `userTwo`,  `status`) VALUES(?, ?, ?)", [u1, rows[0].id, 0], function (err3, result3) {


							db.query("SELECT username FROM users WHERE id=? LIMIT 1", [u1], function (errx, rowsx, fieldsx) {
								socket.emit("FriendRequestSent");
								socket.broadcast.to(rows[0].socket).emit("teAgrego", rowsx[0].username); //sending to individual socketi


							});



						});

					}
					else {
						console.log("La solicitud ya existe");
						socket.emit("RequestExists");
					}

				});



			}

		});
	});



	socket.on("wantFriendList", function (data) {


		let friendList = [];

		console.log("Recibi usuario a checar" + data);


		db.query("SELECT * FROM friends WHERE (userOne = ? OR userTwo =?) AND (status = 1) LIMIT 100", [data, data], function (err1, rows1, fields1) {

			console.log(rows1.length);

			for (let i = 0; i < rows1.length; i++) {
				console.log("Amigo: " + rows1[i].userOne + "Status: " + rows1[i].status);

				var petFriend = new Object();

				if (rows1[i].userTwo == data) {
					petFriend.userOne = rows1[i].userOne;
					petFriend.fav = rows1[i].favUser2;

				}

				if (rows1[i].userOne == data) {

					petFriend.userOne = rows1[i].userTwo;
					petFriend.fav = rows1[i].favUser1;

				}


				petFriend.status = rows1[i].status;
				
            	friendList.push(petFriend);
            

			}
        
        		var friendListObject = new Object();
        		friendListObject = toObject(friendList);
        
        				socket.emit("petFriendList", friendList);

			console.log("Se encontraron " + friendList.length + " amigos");

		});






	});


	socket.on("wantPendingFriendList", function (data) {




		console.log("Recibi usuario a checar" + data);


		db.query("SELECT * FROM friends WHERE (userOne = ?) AND (status = 0)", [data, data], function (err1, rows1, fields1) {

			console.log(rows1.length);

			for (let i = 0; i < rows1.length; i++) {
				console.log("Amigo: " + rows1[i].userOne + "Status: " + rows1[i].status);

				var petFriend = new Object();
				petFriend.userOne = rows1[i].userTwo;
				petFriend.status = rows1[i].status;

				socket.emit("petFriendFromList", petFriend);

			}
			//console.log("Se encontraron " + rows1.length + " solicitudes");

		});






	});



	socket.on("wantFriendRequestList", function (data) {




		console.log("Recibi usuario a checar" + data);


		db.query("SELECT * FROM friends WHERE (userTwo = ?) AND (status = 0)", [data], function (err1, rows1, fields1) {

			console.log("Encontre " + rows1.length + " solicitudes");
			for (let i = 0; i < rows1.length; i++) {


				db.query("SELECT username FROM users WHERE id = ? LIMIT 1", [rows1[i].userOne], function (err12, rows12, fields12) {


					if (rows12.length > 0)
						socket.emit("solicitudAmistad", rows12[0].username);

				});

			}

		});






	});



	socket.on("deleteFriend", function (data) {


		const u1 = data.username1,
			u2 = data.username2;



		db.query("DELETE FROM friends WHERE (userOne = ? AND userTwo = ?) OR (userOne = ? AND userTwo = ?)", [u1, u2, u2, u1], function (err1, rows1, fields1) {
			console.log("IDS: " + u1 + " y " + u2);
			console.log("Amigo eliminado");


			db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [u2], function (err1, rows1, fields1) {

				if (rows1.length > 0)
					socket.broadcast.to(rows1[0].socket).emit("teEliminaron", u1); //sending to individual socketi

			});


			//console.log("Se encontraron " + rows1.length + " solicitudes");

		});






	});



	socket.on("deleteFriendRequest", function (data) {


		const u1 = data.username1,
			u2 = data.username2;

		console.log("Solicitud  a eliminar id: " + "u1: " + u1 + " U2: " + u2);

		db.query("SELECT id, socket FROM users WHERE username = ? LIMIT 1", [u1], function (err2, rows2, fields2) {

			db.query("DELETE FROM friends WHERE userOne = ? and userTwo = ? LIMIT 1", [rows2[0].id, u2], function (err1, rows1, fields1) {
				console.log("Solicitud eliminado");



				if (rows2.length > 0)
					socket.broadcast.to(rows2[0].socket).emit("teEliminaronLaSolicitud", u2); //sending to individual socketi




				//console.log("Se encontraron " + rows1.length + " solicitudes");

			});
		});





	});


	socket.on("deleteFriendRequestSent", function (data) {


		const u1 = data.username1,
			u2 = data.username2;

		console.log("Solicitud  a eliminar id: " + "u1: " + u1 + " U2: " + u2);



		db.query("DELETE FROM friends WHERE (userOne = ? and userTwo = ?) OR  (userOne = ? and userTwo = ?)LIMIT 1", [u1, u2, u2, u1], function (err1, rows1, fields1) {
			console.log("Solicitud enviada eliminado");

			socket.emit("teEliminaronLaSolicitud", u2); //sending to individual socketi




			//console.log("Se encontraron " + rows1.length + " solicitudes");

		});






	});




	socket.on("acceptFriendRequest", function (data) {


		const u1 = data.username1,
			u2 = data.username2,
			conn = data.connection;

		console.log("Solicitud  a aceptar id: " + "u1: " + u1 + " U2: " + u2);

		db.query("SELECT id, socket FROM users WHERE username = ? LIMIT 1", [u1], function (err2, rows2, fields2) {

			db.query("UPDATE friends SET status = 1 WHERE userOne =? and userTwo = ?", [rows2[0].id, u2], function (err1, rows1, fields1) {
				console.log("Solicitud aceptada");



				if (rows2.length > 0)
					socket.broadcast.to(rows2[0].socket).emit("teAceptaronLaSolicitud", u2); //sending to individual socketi


			});
		});





	});



	socket.on("acceptGift", function (data) {


		const giftID = data;

		console.log("REGALO ID A ACEPTAR" + giftID);

		db.query("SELECT id FROM gifts WHERE id = ? LIMIT 1", [giftID], function (err2, rows2, fields2) {

			if (rows2.length > 0) {
				db.query("DELETE FROM gifts WHERE id = ? LIMIT 1", [giftID], function (err3, rows3, fields3) {
					if (!!err3) {
						throw err3;
						eocket.emit("errorAlAceptarRegalo", giftID); //sending to individual socketi

					}

					else {
                    	connectedUsers[socket.id].giftsReceived +=1;
						socket.emit("regaloValido", giftID); //sending to individual socketi

					}

				});
			}


		});





	});


	socket.on("deleteGift", function (data) {


		const giftID = data;

		console.log("REGALO ID A ELIMINAR" + giftID);

		db.query("SELECT id FROM gifts WHERE id = ? LIMIT 1", [giftID], function (err2, rows2, fields2) {

			if (rows2.length > 0) {
				db.query("DELETE FROM gifts WHERE id = ? LIMIT 1", [giftID], function (err3, rows3, fields3) {
					if (!!err3) {
						throw err3;
						eocket.emit("errorAlEliminarRegalo", giftID); //sending to individual socketi

					}

					else {
						socket.emit("regaloEliminado", giftID); //sending to individual socketi

					}

				});
			}


		});





	});


	socket.on("wantMyGifts", function (data) {




		console.log("Recibi usuario a checar" + data);


		db.query("SELECT * FROM gifts WHERE idReceiver = ?", [data], function (err1, rows1, fields1) {

			console.log("Encontre " + rows1.length + " regalos");
			for (let i = 0; i < rows1.length; i++) {


				db.query("SELECT username FROM users WHERE id = ? LIMIT 1", [rows1[i].idSender], function (err12, rows12, fields12) {


					if (rows12.length > 0) {

						var giftInfo = new Object();
						giftInfo.usernameSender = rows12[0].username;
						giftInfo.giftID = rows1[i].id;
						giftInfo.itemID = rows1[i].idItem;
						giftInfo.qty = rows1[i].qty;
						giftInfo.contained = rows1[i].contained;

						giftInfo.msg = rows1[i].msg;
						giftInfo.idSender = rows1[i].idSender;
						giftInfo.wrapID = rows1[i].wrapID;

						var d = new Date(rows1[i].date);
						var month = d.getUTCMonth() + 1; //months from 1-12
						var day = d.getUTCDate();
						var year = d.getUTCFullYear();

						giftInfo.date = month + "/" + day + "/" + year;;


						socket.emit("teEnviaronUnRegaloSilencioso", giftInfo);


					}

				});
			}

		});








	});

	socket.on("GetFishes", function () {

		console.log('entrando a get fishes y mandando send fishes ' + process.cwd());
		var data2 = new Object();
		fs.readFile('fishList.json', function (error, content) {
			data2 = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendFishes", data2);
		});
	});

socket.on("GetItemsExt", function () {

		console.log('entrando a GetItemsExt' + process.cwd());
		var data2 = new Object();
		fs.readFile('sellersDB.json', function (error, content) {
			data2 = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendSellers", data2);
		});
	});


socket.on("GetMissions", function () {

		console.log('entrando a get missions y mandando send missions ' + process.cwd());
		var data2 = new Object();
		fs.readFile('MissionList.json', function (error, content) {
			data2 = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendMissions", data2);
		});
	});

socket.on("GetTreasures", function () {

		console.log('entrando a GetTreasures y mandando sendTreasure ' + process.cwd());
		var data2 = new Object();
		fs.readFile('TreasureList.json', function (error, content) {
			data2 = JSON.parse(content);
			//console.log(data2);

			socket.emit("sendTreasure", data2);
		});
	});


	socket.on("gift", function (data) {


		const idSender = data.idSender,
			idReceiver = data.idReceiver,
			usernameSender = data.usernameSender,
			contained = data.contained,
			message = data.message,
			itemID = data.itemID,
			qty = data.qty,
			wrapID = data.wrapID;


		db.query("INSERT INTO gifts(`idSender`, `idReceiver`,  `idItem`,  `msg`,  `contained`,  `qty`, `wrapID`) VALUES(?, ?, ?, ?, ?, ?, ?) ", [idSender, idReceiver, itemID, message, contained, qty, wrapID], function (err2, rows2, fields2) {


			if (!!err2) {
				throw err2;
				console.log("Error al enviar regalo");
				socket.emit("regaloNoEntregado", usernameSender);
			}
			else {

				console.log("Regalo enviado con el ID: " + itemID);
				socket.emit("regaloEnviado", usernameSender);
                    	connectedUsers[socket.id].giftsSent +=1;

				db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [idReceiver], function (err3, rows3, fields3) {

					var datetime = new Date();
					console.log(datetime);
					var month = datetime.getUTCMonth() + 1; //months from 1-12
					var day = datetime.getUTCDate();
					var year = datetime.getUTCFullYear();

					var giftInfo = new Object();
					giftInfo.usernameSender = usernameSender;
					giftInfo.giftID = rows2.insertId;
					giftInfo.itemID = itemID;
					giftInfo.qty = qty;
					giftInfo.contained = contained;
					giftInfo.date = month + "/" + day + "/" + year;
					giftInfo.msg = message;
					giftInfo.idSender = idSender;
					giftInfo.wrapID = wrapID;


					if (rows3.length > 0)
						socket.broadcast.to(rows3[0].socket).emit("teEnviaronUnRegalo", giftInfo); //sending to individual socketi


				});

			}




		});





	});



	socket.on("giftNote", function (data) {


		const idSender = data.idSender,
			idReceiver = data.idReceiver,
			usernameSender = data.usernameSender,
			contained = data.contained,
			message = data.message,
			itemID = data.itemID,
			qty = data.qty;


		db.query("INSERT INTO gifts(`idSender`, `idReceiver`,  `idItem`,  `msg`,  `contained`,  `qty`) VALUES(?, ?, ?, ?, ?, ?) ", [idSender, idReceiver, itemID, message, contained, qty], function (err2, rows2, fields2) {


			if (!!err2) {
				throw err2;
				console.log("Error al enviar nota");
				socket.emit("notaNoEntregada", usernameSender);
			}
			else {

				console.log("Nota enviado");
				socket.emit("notaEnviada", usernameSender);

				db.query("SELECT socket FROM users WHERE id = ? LIMIT 1", [idReceiver], function (err3, rows3, fields3) {

					var datetime = new Date();
					console.log(datetime);
					var month = datetime.getUTCMonth() + 1; //months from 1-12
					var day = datetime.getUTCDate();
					var year = datetime.getUTCFullYear();

					var giftInfo = new Object();
					giftInfo.usernameSender = usernameSender;
					giftInfo.giftID = rows2.insertId;
					giftInfo.itemID = itemID;
					giftInfo.qty = qty;
					giftInfo.contained = contained;
					giftInfo.date = month + "/" + day + "/" + year;
					giftInfo.msg = message;
					giftInfo.idSender = idSender;
					giftInfo.wrapID = 1;


					if (rows3.length > 0)
						socket.broadcast.to(rows3[0].socket).emit("teEnviaronUnRegaloDeNota", giftInfo); //sending to individual socketi


				});

			}




		});





	});

	socket.on("GiveMeData", function (data) {

		const userInfo = data.userID
		const roomN = data.roomN

		console.log("Usuario recibido para room: " + userInfo);
		console.log("Room number recibido: " + roomN);
		console.log("SELECT * FROM room" + roomN + " WHERE userid=" + userInfo + "LIMIT 1");

		db.query("SELECT * FROM room" + roomN + " WHERE userid=? LIMIT 1", [userInfo], function (err, rows, fields) {
			console.log("Columnas encontradas de room: " + rows.length);
			if (rows.length > 0) {
				var roomInfoReady = new Object();



				roomInfoReady.room = rows[0].room;
				roomInfoReady.wall = rows[0].wall;
				roomInfoReady.floor = rows[0].floor;
				roomInfoReady.song = rows[0].song;
				roomInfoReady.light = rows[0].light;


				socket.emit("room", roomInfoReady);
			}
			else {



				var roomInfoReady = new Object();
				roomInfoReady.room = "[]";
				roomInfoReady.wall = "12";
				roomInfoReady.floor = "13";
				roomInfoReady.song = "103";
				roomInfoReady.light = "1";


				socket.emit("room", roomInfoReady);
				console.log("Enviando room: VACIA");
			}



		});


	});


	socket.on("setDataInitialized", function (data) {


    
		console.log("Inicializando usuario");

		if(connectedUsers[socket.id] != null)
        	if(connectedUsers[socket.id].dataInit != null)
    				connectedUsers[socket.id].dataInit = true;
    
		if(connectedUsers[socket.id] != null)
        	if(connectedUsers[socket.id].dataInit != null)
    				if(connectedUsers[socket.id].dataInit == true)
                    		console.log("Datos del usuario INICIALIZADOS");

    
	});



	socket.on("GiveMeShopExample", function (data) {


  		db.query("SELECT * FROM room1 WHERE userid=? LIMIT 1", 40, function (err, rows, fields) {
			console.log("Columnas encontradas de room: " + rows.length);
        
        var roomInfoReady = new Object();
            var obj = null;
            	if(rows[0].room != null)
                 obj= JSON.parse(rows[0].room);
        
        
        		roomInfoReady.room = JSON.stringify(obj);
				roomInfoReady.wall = 76;
				roomInfoReady.floor = 75;
				roomInfoReady.name = "Furniture";
        		roomInfoReady.xlimmax= 27;
                roomInfoReady.xlimmin= -27;

						socket.emit("room300" , roomInfoReady);

        
		});
    
	});



	socket.on("GiveMeShopGardenExample", function (data) {


  		db.query("SELECT * FROM room19 WHERE userid=? LIMIT 1", 40, function (err, rows, fields) {
			console.log("Columnas encontradas de room: " + rows.length);
        
        var roomInfoReady = new Object();
            var obj = null;
            	if(rows[0].room != null)
                 obj= JSON.parse(rows[0].room);
        
        
        		roomInfoReady.room = JSON.stringify(obj);
				roomInfoReady.wall = 54;
				roomInfoReady.floor = 55;
				roomInfoReady.name = "GardenShop";
        		roomInfoReady.xlimmax= 27;
                roomInfoReady.xlimmin= -27;

						socket.emit("room301" , roomInfoReady);

        
		});
    
	});



	socket.on("GiveMeRoomInfos", function (data) {

            var infoReady = new Object();

  				db.query("SELECT paneldata FROM roominfo WHERE uid=? LIMIT 1", [data], function (err, rows, fields) 
 				{
					console.log("Columnas encontradas de room: " + rows.length);
					var roomInfoReady = new Object();
                	if(rows.length >0)
                    {  
                    socket.emit("houseInfoVisitor", JSON.parse(rows[0].paneldata)); }
                	else
                    {socket.emit("houseInfoVisitor", "null");}
					
                
				});
    
	});





socket.on("GiveMeFriendExt", function (data) {

		const userInfo = data.userID
		const roomN = data.roomN

		console.log("Usuario recibido para room: " + userInfo);
		console.log("Room number recibido: " + roomN);
		console.log("SELECT * FROM room" + roomN + " WHERE userid=" + userInfo + "LIMIT 1");

		db.query("SELECT * FROM room" + roomN + " WHERE userid=? LIMIT 1", [userInfo], function (err, rows, fields) 
                 {
			console.log("Columnas encontradas de room: " + rows.length);
			if (rows.length > 0) {
				var roomInfoReady = new Object();

            var obj = null;
            	if(rows[0].room != null)
                 obj= JSON.parse(rows[0].room);
            	else
                {
                           obj= JSON.parse("[]");
                
                                			db.query("DELETE FROM room" + roomN + "WHERE userid = ?", [userInfo], function (err33, result33) {
                                                            			
                                            db.query("INSERT INTO room" + roomN + "(`userid`, `room`,  `wall`,`floor`, `name`) VALUES(?, ?, ?, ?, ?)", [userInfo, "[]", "12", "13", "Room"], function (err3, result3) {
							console.log("El usuario ha cargado su habitacion 1 en el servidor, error HABITACION NULA, ENVIANDO HABITACION REINICIADA VACIA");

						});

						});
                


                }
				console.log("Numero de items en room: " + countProperties(obj));

            
				var newRoom = obj.map(function (item) {
					item.c_id = makeid(5);
					return item;
				})
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = rows[0].wall;
				roomInfoReady.floor = rows[0].floor;
				roomInfoReady.name = rows[0].name;
				roomInfoReady.level = rows[0].level;
				roomInfoReady.song = rows[0].song;
				roomInfoReady.light = rows[0].light;

					console.log("El usuario ha cargado su habitacion 1 en el servidor");


						socket.emit("roomFriendRight", roomInfoReady);
						console.log("Enviando room: " + JSON.stringify(newRoom));

						console.log("Enviando room stringFy: " + JSON.stringify(roomInfoReady));


		


			}
			else {


				const obj = JSON.parse("[]");


				var roomInfoReady = new Object();
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = "12";
				roomInfoReady.floor = "13";
            	roomInfoReady.name = "Room";
            	roomInfoReady.level = "1";
            	roomInfoReady.song = "103";
            	roomInfoReady.light = "1";


				socket.emit("roomFriendRight" + roomN, roomInfoReady);
							console.log("Enviando room: vacia");

			
			}



		});


	});

socket.on("GiveMeRooms", function (data) {

		const userInfo = data.userID
		const roomN = data.roomN

		console.log("Usuario recibido para room: " + userInfo);
		console.log("Room number recibido: " + roomN);
		console.log("SELECT * FROM room" + roomN + " WHERE userid=" + userInfo + "LIMIT 1");

		db.query("SELECT * FROM room" + roomN + " WHERE userid=? LIMIT 1", [userInfo], function (err, rows, fields) 
                 {
			console.log("Columnas encontradas de room: " + rows.length);
			if (rows.length > 0) {
				var roomInfoReady = new Object();
			 console.log("En el if donde rows es mayor a 0-------------------------------");
            var obj = null;
            	if(rows[0].room != null){
                console.log("En el if donde la room no es nula-------------------------------");
                 obj= JSON.parse(rows[0].room);
                }
            	else
                {
                	console.log("En el if donde la room SI es nula------------------------------");
                           obj= JSON.parse("[]");
                
                                			db.query("DELETE FROM room" + roomN + "WHERE userid = ?", [userInfo], function (err33, result33) {
                                                            			
                                            db.query("INSERT INTO room" + roomN + "(`userid`, `room`,  `wall`,`floor`, `name`) VALUES(?, ?, ?, ?, ?)", [userInfo, "[]", "12", "13", "Room"], function (err3, result3) {
							console.log("El usuario ha cargado su habitacion 1 en el servidor, error HABITACION NULA, ENVIANDO HABITACION REINICIADA VACIA");

						});

						});
                


                }
				console.log("Numero de items en room: " + countProperties(obj));

            
				var newRoom = obj.map(function (item) {
					item.c_id = makeid(5);
					return item;
				})
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = rows[0].wall;
				roomInfoReady.floor = rows[0].floor;
				roomInfoReady.name = rows[0].name;
				roomInfoReady.level = rows[0].level;
				roomInfoReady.song = rows[0].song;
				roomInfoReady.light = rows[0].light;

					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null) 
                    {
						if (roomN == 1)
							connectedUsers[socket.id].room1 = newRoom;
						if (roomN == 2)
							connectedUsers[socket.id].room2 = newRoom;
						if (roomN == 3)
							connectedUsers[socket.id].room3 = newRoom;
						if (roomN == 4)
							connectedUsers[socket.id].room4 = newRoom;
						if (roomN == 5)
							connectedUsers[socket.id].room5 = newRoom;
						if (roomN == 6)
							connectedUsers[socket.id].room6 = newRoom;
						if (roomN == 7)
							connectedUsers[socket.id].room7 = newRoom;
						if (roomN == 8)
							connectedUsers[socket.id].room8 = newRoom;
						if (roomN == 9)
							connectedUsers[socket.id].room9 = newRoom;
						if (roomN == 10)
							connectedUsers[socket.id].room10 = newRoom;
						if (roomN == 11)
							connectedUsers[socket.id].room11 = newRoom;
						if (roomN == 12)
							connectedUsers[socket.id].room12 = newRoom;
						if (roomN == 13)
							connectedUsers[socket.id].room13 = newRoom;
						if (roomN == 14)
							connectedUsers[socket.id].room14 = newRoom;
						if (roomN == 15)
							connectedUsers[socket.id].room15 = newRoom;
						if (roomN == 16)
							connectedUsers[socket.id].room16 = newRoom;
						if (roomN == 17)
							connectedUsers[socket.id].room17 = newRoom;
						if (roomN == 18)
							connectedUsers[socket.id].room18 = newRoom;
						if (roomN == 19)
							connectedUsers[socket.id].room19 = newRoom;
						if (roomN == 20)
							connectedUsers[socket.id].room20 = newRoom;
						if (roomN == 21)
							connectedUsers[socket.id].room21 = newRoom;
						if (roomN == 22)
							connectedUsers[socket.id].room22 = newRoom;
                    	if (roomN == 1000001)
							connectedUsers[socket.id].room1000001 = newRoom;
                    	if (roomN == 99)
							connectedUsers[socket.id].room99 = newRoom;




						console.log("El usuario ha cargado su habitacion 1 en el servidor");


						socket.emit("room" + roomN, roomInfoReady);
						console.log("Enviando room: " + JSON.stringify(newRoom));

						console.log("Enviando room stringFy: " + JSON.stringify(roomInfoReady));


					}

		


			}
			else {

				 console.log("En el if donde rows es menor a 0-------------------------------");
				const obj = JSON.parse("[]");

				var newRoom = obj.map(function (item) {
					item.c_id = makeid(5);
					return item;
				})


				var roomInfoReady = new Object();
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = "12";
				roomInfoReady.floor = "13";
            	roomInfoReady.name = "Room";
            	roomInfoReady.level = "1";
            	roomInfoReady.song = "103";
            	roomInfoReady.light = "1";


					// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
					if (connectedUsers[socket.id] != null) 
                    {
						if (roomN == 1)
							connectedUsers[socket.id].room1 = newRoom;
						if (roomN == 2)
							connectedUsers[socket.id].room2 = newRoom;
						if (roomN == 3)
							connectedUsers[socket.id].room3 = newRoom;
						if (roomN == 4)
							connectedUsers[socket.id].room4 = newRoom;
						if (roomN == 5)
							connectedUsers[socket.id].room5 = newRoom;
						if (roomN == 6)
							connectedUsers[socket.id].room6 = newRoom;
						if (roomN == 7)
							connectedUsers[socket.id].room7 = newRoom;
						if (roomN == 8)
							connectedUsers[socket.id].room8 = newRoom;
						if (roomN == 9)
							connectedUsers[socket.id].room9 = newRoom;
						if (roomN == 10)
							connectedUsers[socket.id].room10 = newRoom;
						if (roomN == 11)
							connectedUsers[socket.id].room11 = newRoom;
						if (roomN == 12)
							connectedUsers[socket.id].room12 = newRoom;
						if (roomN == 13)
							connectedUsers[socket.id].room13 = newRoom;
						if (roomN == 14)
							connectedUsers[socket.id].room14 = newRoom;
						if (roomN == 15)
							connectedUsers[socket.id].room15 = newRoom;
						if (roomN == 16)
							connectedUsers[socket.id].room16 = newRoom;
						if (roomN == 17)
							connectedUsers[socket.id].room17 = newRoom;
						if (roomN == 18)
							connectedUsers[socket.id].room18 = newRoom;
						if (roomN == 19)
							connectedUsers[socket.id].room19 = newRoom;
                    	if (roomN == 20)
							connectedUsers[socket.id].room20 = newRoom;
                    	if (roomN == 21)
							connectedUsers[socket.id].room21 = newRoom;
                    	if (roomN == 22)
							connectedUsers[socket.id].room22 = newRoom;
                        if (roomN == 1000001)
							connectedUsers[socket.id].room1000001 = newRoom;
                    
                    
                    	if (roomN == 99){
							connectedUsers[socket.id].room99 = newRoom;

							console.log("En el if donde la room SI es nula Y poniendo a la 99------------------------------");
                           
                        db.query("INSERT INTO room99 (`userid`, `room`,  `wall`,`floor`, `name`) VALUES(?, ?, ?, ?, ?)", [userInfo, roomInfoReady.room, roomInfoReady.wall, roomInfoReady.floor, "Room"], function (err4, result4) {
							console.log("se inserto registro en  la 99 con el id de:  ");
console.log(userInfo);
							socket.emit("room" + roomN, roomInfoReady);
							console.log("Enviando room: de la 99");




						});
                
                                		/*
                                			 db.query("INSERT INTO room99" + "(`userid`, `room`,  `wall`,`floor`, `name`) VALUES(?, ?, ?, ?, ?)", [userInfo, "[]", "12", "13", "Room"], function (err5, result5) {
							console.log("El usuario ha cargado su habitacion 99 en el servidor, error HABITACION NULA, ENVIANDO HABITACION nueva VACIA");

						});
                        */
						}
                    else{
                    
							
                    
						db.query("INSERT INTO room" + roomN + "(`userid`, `room`,  `wall`,`floor`, `name`, `song`, `light`) VALUES(?, ?, ?, ?, ?, ?, ?)", [userInfo, roomInfoReady.room, roomInfoReady.wall, roomInfoReady.floor, "Room", "103", "1"], function (err3, result3) {
							console.log("El usuario ha cargado su habitacion " + roomN+ " en el servidor");


							socket.emit("room" + roomN, roomInfoReady);
							console.log("Enviando room: vacia");




						});
                    }
					}

			
			}



		});


	});



socket.on("GiveMeVisitorRoom", function (data) {

		const userInfo = data.userID
		const roomN = data.roomN

		console.log("Usuario recibido para room: " + userInfo);
		console.log("Room number recibido: " + roomN);

		db.query("SELECT * FROM room" + roomN + " WHERE userid=? LIMIT 1", [userInfo], function (err, rows, fields) 
                 {
			console.log("Columnas encontradas de room: " + rows.length);
			if (rows.length > 0) {
				var roomInfoReady = new Object();

            var obj = null;
            	if(rows[0].room != null)
                 obj= JSON.parse(rows[0].room);
            	else
                {
                           obj= JSON.parse("[]");
                }

            
				var newRoom = obj.map(function (item) {
					item.c_id = makeid(5);
					return item;
				})
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = rows[0].wall;
				roomInfoReady.floor = rows[0].floor;
				roomInfoReady.name = rows[0].name;
				roomInfoReady.level = rows[0].level;
				roomInfoReady.song = rows[0].song;
				roomInfoReady.light = rows[0].light;




						socket.emit("visitorRoom", roomInfoReady);

			}
			else {


				const obj = JSON.parse("[]");

				var newRoom = obj.map(function (item) {
					item.c_id = makeid(5);
					return item;
				})


				var roomInfoReady = new Object();
				roomInfoReady.room = JSON.stringify(newRoom);
				roomInfoReady.wall = "12";
				roomInfoReady.floor = "13";
            	roomInfoReady.name = "Room";
            	roomInfoReady.level = "1";
            	roomInfoReady.song = "103";
            	roomInfoReady.light = "1";


						socket.emit("visitorRoom", roomInfoReady);

			
			}



		});


	});






	socket.on("addItemR", function (data) {

		const r = data.r;
		const hash = data.hash;

		const uid = data.uid;
		const id = data.id;
		const px = data.px;
		const py = data.py;
		const pz = data.pz;
		const sx = data.sx;
		const sy = data.sy;
		const sz = data.sz;
		const p = data.p;
		const so = data.so;
		const rz = data.rz;
		const rx = data.rx;
		const ry = data.ry;

		var pos = new Object();
		pos.x = px;
		pos.y = py;
		pos.z = pz;

		var scale = new Object();
		scale.x = sx;
		scale.y = sy;
		scale.z = sz;
    
    	var rot = new Object();
    	rot.x = rx;
    	rot.y = ry;
    	rot.z = rz;


		var objeto = new Object();

		objeto.id = id;
		objeto.pos = pos;
		objeto.scale = scale;
		objeto.p = p;
		objeto.sO = so;
		objeto.c_id = hash.replace('_a', '');
    	objeto.rot = rot;
    
    		console.log("------------------- VOY A AÑADIR CON EL AL SOCKECT ID hash : " + socket.id);
			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				if (r == 1) {
                
                	console.log("------------------- LA ROOM 1 ES ASI : " + connectedUsers[socket.id].room1);
                
					connectedUsers[socket.id].room1.splice(0, 0, objeto);
					console.log("Item en room 1 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("El nuevo item tiene cid = :" + objeto.c_id);
					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}


				else if (r == 2) {
					connectedUsers[socket.id].room2.splice(0, 0, objeto);
					console.log("Item en room 2 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 3) {
					connectedUsers[socket.id].room3.splice(0, 0, objeto);
					console.log("Item en room 3 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 4) {
					connectedUsers[socket.id].room4.splice(0, 0, objeto);
					console.log("Item en room 4 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				} else if (r == 5) {
					connectedUsers[socket.id].room5.splice(0, 0, objeto);
					console.log("Item en room 5 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				} else if (r == 6) {
					connectedUsers[socket.id].room6.splice(0, 0, objeto);
					console.log("Item en room 6 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 7) {
					connectedUsers[socket.id].room7.splice(0, 0, objeto);
					console.log("Item en room 7 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 8) {
					connectedUsers[socket.id].room8.splice(0, 0, objeto);
					console.log("Item en room 8 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 9) {
					connectedUsers[socket.id].room9.splice(0, 0, objeto);
					console.log("Item en room 9 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 10) {
					connectedUsers[socket.id].room10.splice(0, 0, objeto);
					console.log("Item en room 10 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 11) {
					connectedUsers[socket.id].room11.splice(0, 0, objeto);
					console.log("Item en room 11 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 12) {
					connectedUsers[socket.id].room12.splice(0, 0, objeto);
					console.log("Item en room 12 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 13) {
					connectedUsers[socket.id].room13.splice(0, 0, objeto);
					console.log("Item en room 13 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 14) {
					connectedUsers[socket.id].room14.splice(0, 0, objeto);
					console.log("Item en room 14 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 15) {
					connectedUsers[socket.id].room15.splice(0, 0, objeto);
					console.log("Item en room 15 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 16) {
					connectedUsers[socket.id].room16.splice(0, 0, objeto);
					console.log("Item en room 16 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 17) {
					connectedUsers[socket.id].room17.splice(0, 0, objeto);
					console.log("Item en room 17 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else if (r == 18) {
					connectedUsers[socket.id].room18.splice(0, 0, objeto);
					console.log("Item en room 18 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            	else if (r == 19) {
					connectedUsers[socket.id].room19.splice(0, 0, objeto);
					console.log("Item en Jardin 19 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            	else if (r == 20) {
					connectedUsers[socket.id].room20.splice(0, 0, objeto);
					console.log("Item en Jardin 20 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            	else if (r == 21) {
					connectedUsers[socket.id].room21.splice(0, 0, objeto);
					console.log("Item en Jardin 21 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            	else if (r == 22) {
					connectedUsers[socket.id].room22.splice(0, 0, objeto);
					console.log("Item en Jardin 22 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            	else if (r == 1000001) {
					connectedUsers[socket.id].room1000001.splice(0, 0, objeto);
					console.log("Item en room 1000001 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
            else if (r == 99) {
					connectedUsers[socket.id].room99.splice(0, 0, objeto);
					console.log("Item en room 99 agregado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);

					console.log("Emitiendo de regreso el hash: " + hash);
					socket.emit("roomHash", hash);


				}
				else {
					console.log("No se encontro la room : " + r);
				}
			}




	});



	socket.on("updateItemR", function (data) {

		const r = data.r;
		const hash = data.hash;

		const uid = data.uid;
		const id = data.id;
		const px = data.px;
		const py = data.py;
		const pz = data.pz;
		const sx = data.sx;
		const sy = data.sy;
		const sz = data.sz;
		const p = data.p;
		const so = data.so;
		const rz = data.rz;
		const rx = data.rx;
		const ry = data.ry;

		var pos = new Object();
		pos.x = px;
		pos.y = py;
		pos.z = pz;

		var scale = new Object();
		scale.x = sx;
		scale.y = sy;
		scale.z = sz;

    	var rot = new Object();
    	rot.x = rx;
    	rot.y = ry;
    	rot.z = rz;
    
		var objeto = new Object();
    
    	console.log("Recibi rotacion; " + rz);
    	

		objeto.id = id;
		objeto.pos = pos;
		objeto.scale = scale;
		objeto.p = p;
		objeto.sO = so;
		objeto.c_id = hash;
		objeto.rot = rot;
    
    	console.log("Rotacion del item: " + objeto.rot.x + " " + objeto.rot.y + " " + objeto.rot.z +" ");
			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {
				
            	console.log("Dentro del conected con mi id y room " + r);
            	if (r == 1000001) {
					var newRoom = connectedUsers[socket.id].room1000001.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room1000001 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 1000001 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            
				if (r == 1) {
					var newRoom = connectedUsers[socket.id].room1.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room1 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 1 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
				if (r == 2) {
					var newRoom = connectedUsers[socket.id].room2.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room2 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 2 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
				if (r == 3) {
					var newRoom = connectedUsers[socket.id].room3.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room3 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 3 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 4) {
					var newRoom = connectedUsers[socket.id].room4.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room4 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 4 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}


				if (r == 5) {
					var newRoom = connectedUsers[socket.id].room5.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room5 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 5 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
				if (r == 6) {
					var newRoom = connectedUsers[socket.id].room6.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room6 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 6 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
				if (r == 7) {
					var newRoom = connectedUsers[socket.id].room7.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room7 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 7 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 8) {
					var newRoom = connectedUsers[socket.id].room8.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room8 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 8 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 9) {
					var newRoom = connectedUsers[socket.id].room9.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room9 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 9 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}


				if (r == 10) {
					var newRoom = connectedUsers[socket.id].room10.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room10 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 10 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 11) {
					var newRoom = connectedUsers[socket.id].room11.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room11 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 11 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}


				if (r == 12) {
					var newRoom = connectedUsers[socket.id].room12.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room12 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 12 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 13) {
					var newRoom = connectedUsers[socket.id].room13.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room13 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 13 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 14) {
					var newRoom = connectedUsers[socket.id].room14.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room14 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 14 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 15) {
					var newRoom = connectedUsers[socket.id].room15.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room15 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 15 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 16) {
					var newRoom = connectedUsers[socket.id].room16.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room16 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 16 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 17) {
					var newRoom = connectedUsers[socket.id].room17.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room17 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 17 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

				if (r == 18) {
					var newRoom = connectedUsers[socket.id].room18.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room18 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 18 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            
            				if (r == 19) {
					var newRoom = connectedUsers[socket.id].room19.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room19 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 19 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            				if (r == 20) {
					var newRoom = connectedUsers[socket.id].room20.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room20 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 20 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            				if (r == 21) {
					var newRoom = connectedUsers[socket.id].room21.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room21 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 21 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            				if (r == 22) {
					var newRoom = connectedUsers[socket.id].room22.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})
                    
                   

					if (newRoom != null)
						connectedUsers[socket.id].room22 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 22 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}
            
             if (r == 99) {
                    console.log("Entre al 99------------------" );
					var newRoom = connectedUsers[socket.id].room99.map(function (item) {
						if (item.c_id == hash) { item = objeto; }
						return item;
					})

					if (newRoom != null)
						connectedUsers[socket.id].room99 = newRoom;
					socket.emit("roomHash", hash);

					console.log("Item en room 99 actualizado con el hash: " + hash + "Posicion x: " + px + ", y:" + py + ", z:" + pz + "----- Escala x:" + sx + ", y:" + sy + ", z:" + sz + "-----Order in layer:" + so + "----Propiedades:" + p);
					console.log("Emitiendo de regreso el hash: " + hash);

				}

			}



	});




	socket.on("deleteItemR", function (data) {

		const r = data.r;
		const hash = data.hash;

		const uid = data.uid;




			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null ) {
            	
            	if (r == 1000001) {
					for (let j = 0; j < connectedUsers[socket.id].room1000001.length; j++) {
						if (connectedUsers[socket.id].room1000001[j].c_id == hash) {

							connectedUsers[socket.id].room1000001.splice(j, 1);
							console.log("se elimino un item del room1000001 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 1) {
					for (let j = 0; j < connectedUsers[socket.id].room1.length; j++) {
						if (connectedUsers[socket.id].room1[j].c_id == hash) {

							connectedUsers[socket.id].room1.splice(j, 1);
							console.log("se elimino un item del room1 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
				if (r == 2) {
					for (let j = 0; j < connectedUsers[socket.id].room2.length; j++) {
						if (connectedUsers[socket.id].room2[j].c_id == hash) {

							connectedUsers[socket.id].room2.splice(j, 1);
							console.log("se elimino un item del room2 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}


				if (r == 3) {
					for (let j = 0; j < connectedUsers[socket.id].room3.length; j++) {
						if (connectedUsers[socket.id].room3[j].c_id == hash) {

							connectedUsers[socket.id].room3.splice(j, 1);
							console.log("se elimino un item del room 3 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 4) {
					for (let j = 0; j < connectedUsers[socket.id].room4.length; j++) {
						if (connectedUsers[socket.id].room4[j].c_id == hash) {

							connectedUsers[socket.id].room4.splice(j, 1);
							console.log("se elimino un item del room 4 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 5) {
					for (let j = 0; j < connectedUsers[socket.id].room5.length; j++) {
						if (connectedUsers[socket.id].room5[j].c_id == hash) {

							connectedUsers[socket.id].room5.splice(j, 1);
							console.log("se elimino un item del room 5 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 6) {
					for (let j = 0; j < connectedUsers[socket.id].room6.length; j++) {
						if (connectedUsers[socket.id].room6[j].c_id == hash) {

							connectedUsers[socket.id].room6.splice(j, 1);
							console.log("se elimino un item del room 6 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 7) {
					for (let j = 0; j < connectedUsers[socket.id].room7.length; j++) {
						if (connectedUsers[socket.id].room7[j].c_id == hash) {

							connectedUsers[socket.id].room7.splice(j, 1);
							console.log("se elimino un item del room 7 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
				if (r == 8) {
					for (let j = 0; j < connectedUsers[socket.id].room8.length; j++) {
						if (connectedUsers[socket.id].room8[j].c_id == hash) {

							connectedUsers[socket.id].room8.splice(j, 1);
							console.log("se elimino un item del room 8 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
				if (r == 9) {
					for (let j = 0; j < connectedUsers[socket.id].room9.length; j++) {
						if (connectedUsers[socket.id].room9[j].c_id == hash) {

							connectedUsers[socket.id].room9.splice(j, 1);
							console.log("se elimino un item del room 9 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 10) {
					for (let j = 0; j < connectedUsers[socket.id].room10.length; j++) {
						if (connectedUsers[socket.id].room10[j].c_id == hash) {

							connectedUsers[socket.id].room10.splice(j, 1);
							console.log("se elimino un item del room 10 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 11) {
					for (let j = 0; j < connectedUsers[socket.id].room11.length; j++) {
						if (connectedUsers[socket.id].room11[j].c_id == hash) {

							connectedUsers[socket.id].room11.splice(j, 1);
							console.log("se elimino un item del room 11 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 12) {
					for (let j = 0; j < connectedUsers[socket.id].room12.length; j++) {
						if (connectedUsers[socket.id].room12[j].c_id == hash) {

							connectedUsers[socket.id].room12.splice(j, 1);
							console.log("se elimino un item del room 12 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 13) {
					for (let j = 0; j < connectedUsers[socket.id].room13.length; j++) {
						if (connectedUsers[socket.id].room13[j].c_id == hash) {

							connectedUsers[socket.id].room13.splice(j, 1);
							console.log("se elimino un item del room 13 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 14) {
					for (let j = 0; j < connectedUsers[uid].room14.length; j++) {
						if (connectedUsers[uid].room14[j].c_id == hash) {

							connectedUsers[uid].room14.splice(j, 1);
							console.log("se elimino un item del room 14 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 15) {
					for (let j = 0; j < connectedUsers[socket.id].room15.length; j++) {
						if (connectedUsers[socket.id].room15[j].c_id == hash) {

							connectedUsers[socket.id].room15.splice(j, 1);
							console.log("se elimino un item del room 15 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 16) {
					for (let j = 0; j < connectedUsers[socket.id].room16.length; j++) {
						if (connectedUsers[socket.id].room16[j].c_id == hash) {

							connectedUsers[socket.id].room16.splice(j, 1);
							console.log("se elimino un item del room 16 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 17) {
					for (let j = 0; j < connectedUsers[socket.id].room17.length; j++) {
						if (connectedUsers[socket.id].room17[j].c_id == hash) {

							connectedUsers[socket.id].room17.splice(j, 1);
							console.log("se elimino un item del room 17 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}

				if (r == 18) {
					for (let j = 0; j < connectedUsers[socket.id].room18.length; j++) {
						if (connectedUsers[socket.id].room18[j].c_id == hash) {

							connectedUsers[socket.id].room18.splice(j, 1);
							console.log("se elimino un item del room 18 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
            
            				if (r == 19) {
					for (let j = 0; j < connectedUsers[socket.id].room19.length; j++) {
						if (connectedUsers[socket.id].room19[j].c_id == hash) {

							connectedUsers[socket.id].room19.splice(j, 1);
							console.log("se elimino un item del room 19 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
            
                        				if (r == 20) {
					for (let j = 0; j < connectedUsers[socket.id].room20.length; j++) {
						if (connectedUsers[socket.id].room20[j].c_id == hash) {

							connectedUsers[socket.id].room20.splice(j, 1);
							console.log("se elimino un item del room 20 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
            
                        				if (r == 21) {
					for (let j = 0; j < connectedUsers[socket.id].room21.length; j++) {
						if (connectedUsers[socket.id].room21[j].c_id == hash) {

							connectedUsers[socket.id].room21.splice(j, 1);
							console.log("se elimino un item del room 21 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
            
            
                        				if (r == 22) {
					for (let j = 0; j < connectedUsers[socket.id].room22.length; j++) {
						if (connectedUsers[socket.id].room22[j].c_id == hash) {

							connectedUsers[socket.id].room22.splice(j, 1);
							console.log("se elimino un item del room 22 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
            
                        				if (r == 99) {
					for (let j = 0; j < connectedUsers[socket.id].room99.length; j++) {
						if (connectedUsers[socket.id].room99[j].c_id == hash) {

							connectedUsers[socket.id].room99.splice(j, 1);
							console.log("se elimino un item del room 99 con el hash: " + hash + " Emitiendo hash de regreso...");
							socket.emit("roomHashDeletion", hash);

							break;
						}

					}


				}
			}



	});



//INICIA LOGIN
	socket.on("giveMeMysteryPrize", function (data) {
		const mbid = data.mbId;
		var prize = 0;
		console.log("Recibi la caja para enviar prize: " + mbid);


			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) 
            {
				if (mbid == 17) 
                {
					var mb17 = [ 3, 14, 42 ];
					const random = Math.floor(Math.random() * mb17.length);
					prize = mb17[random];
				}
				if (mbid == 18) 
                {
                	var mb18 = [ 20, 15, 66 ];
					const random = Math.floor(Math.random() * mb18.length);
					prize = mb18[random];
					
				}
				if (mbid == 19) 
                {
					var mb19 = [ 26, 30, 34 ];
					const random = Math.floor(Math.random() * mb19.length);
					prize = mb19[random];
				}
				
            if(prize != 0)
            {
				console.log("Enviando premio de caja misteriosa");
            	console.log("Premio seleccionado al azar con el ID: " + prize);
            						socket.emit("mbPrizeReceived", prize);


            }

			}




	}); // TERMINA PRIZE MB

	socket.on("updatePhoneColor", function (data) {

    	const uid = data.uid;
    	const color = data.colorP;
    
    
		console.log("Actualizando color de celular");

					db.query("UPDATE pets SET phoneColor = ? WHERE userid=? LIMIT 1", [color, uid], function (err4, rows4, fields4) {


					});

	});					

	
	socket.on("getMyPhoneColor", function (data) {

		const uid = data;

		db.query("SELECT phoneColor FROM pets WHERE userid=? LIMIT 1", [uid], function (err1, rows1, fields1) {
        		if(rows1.length > 0)
                {
                	var pColor = rows1[0].phoneColor;
                
					socket.emit("getPhoneColor", pColor);
                }

		});


	});





	socket.on("updateWallpaper", function (data) {

		const visualObjectID = data.vOid;
   		 const r = data.r;
    	const uid = data.uid;
    
    
		console.log("Actualizando wallpaper");

					db.query("UPDATE room"+r+ " SET wall = ? WHERE userid=? LIMIT 1", [visualObjectID, uid], function (err4, rows4, fields4) {

						console.log("Se actualizo wallpaper, ID del material: " + visualObjectID);


					});

	});




	socket.on("updateFloor", function (data) {

		const visualObjectID = data.vOid;
    const r = data.r;
    const uid = data.uid;
    
    
		console.log("Actualizando floor");

					db.query("UPDATE room"+r+ " SET floor = ? WHERE userid=? LIMIT 1", [visualObjectID, uid], function (err4, rows4, fields4) {

						console.log("Se actualizo floor, ID del material: " + visualObjectID);


					});

	});


	socket.on("updateSong", function (data) {

		const audioObjectID = data.aOid;
    const r = data.r;
    const uid = data.uid;
    
    
		console.log("Actualizando cancion");

					db.query("UPDATE room"+r+ " SET song = ? WHERE userid=? LIMIT 1", [audioObjectID, uid], function (err4, rows4, fields4) {

						console.log("Se actualizo cancion, ID de la cancion: " + audioObjectID);


					});

	});

	socket.on("updateLight", function (data) {

		const light = data.l;
    const r = data.r;
    const uid = data.uid;
    
    
		console.log("Actualizando luces de room " + r);

					db.query("UPDATE room"+r+ " SET light = ? WHERE userid=? LIMIT 1", [light, uid], function (err4, rows4, fields4) {

						console.log("Se actualizo luz de habitacion" + r +", status: " + light);


					});

	});


	socket.on("updateRoomName", function (data) {

		const rnum = data.rnum;
    const rn = data.rn;
    const uid = data.uid;
    
    
		console.log("Actualizando nombre de habitacion");

					db.query("UPDATE room"+rnum+ " SET name = ? WHERE userid=? LIMIT 1", [rn, uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el nombre de la habitacion:  " + rnum);


					});

	});


	socket.on("testObjeto", function (data) {

		console.log("USUARIOS: " + JSON.stringify(connectedUsers));

	});




	

	socket.on("expandRoomLevel", function (data) {

		const rnum = data.rnum;
    const lvl = data.lvl;
    const uid = data.uid;
    
    
		console.log("Expandiendo habitacion");

			// EL AMIGO ESTA CONECTADO EN EL ARREGLO DE USUARIOS ACTIVOS
			if (connectedUsers[socket.id] != null) {

				if (connectedUsers[socket.id].cash == null) {
					console.log("NO SE PUDO ACTUALIZAR LA EXPANSION DE ROOM EN EL SERVIDOR, NO SE INICIALIZARON LOS BALANCES?");

				}
				else 
                {
                
                	if(lvl ==2)
                    {
                          if(connectedUsers[socket.id].cash >= expansionRoomLevel2)
                        {
                        	connectedUsers[socket.id].cash = connectedUsers[socket.id].cash - expansionRoomLevel2;
                        
                                            					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de cash: " + connectedUsers[socket.id].cash);

					db.query("UPDATE balances SET cash = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].cash.toFixed(0), uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de expandir la habitacion");

						socket.emit("expansionSold", connectedUsers[socket.id].cash.toFixed(0));
                    
                    						db.query("UPDATE room"+rnum+ " SET level = ? WHERE userid=? LIMIT 1", [lvl, uid], function (err5, rows5, fields5) 
                                            {
                                            
                                            						console.log("Se actualizo el nivel de la habitacion");

																	socket.emit("expansionDone", connectedUsers[socket.id].username);
                                            
                                            });


					});

                        }
                    else
                    {
																	socket.emit("notEnoughCashForExpansion", connectedUsers[socket.id].username);
                    
                    }
                    

                    }
                
                    else if(lvl ==3)
                    {
                          if(connectedUsers[socket.id].cash >= expansionRoomLevel3)
                        {
                        	connectedUsers[socket.id].cash = connectedUsers[socket.id].cash - expansionRoomLevel2;
                    					console.log("El usuario: " + connectedUsers[socket.id].username + " ahora tiene un balance de cash: " + connectedUsers[socket.id].cash);

					db.query("UPDATE balances SET cash = ? WHERE userid=? LIMIT 1", [connectedUsers[socket.id].cash.toFixed(0), uid], function (err4, rows4, fields4) {

						console.log("Se actualizo el balance despues de expandir la habitacion");

						socket.emit("expansionSold", connectedUsers[socket.id].cash.toFixed(0));
                    
                    						db.query("UPDATE room"+rnum+ " SET level = ? WHERE userid=? LIMIT 1", [lvl, uid], function (err5, rows5, fields5) 
                                            {
                                            
                                            						console.log("Se actualizo el nivel de la habitacion");

																	socket.emit("expansionDone", connectedUsers[socket.id].username);
                                            
                                            });


					});
                        }
                    else
                    {
                    																	socket.emit("notEnoughCashForExpansion", connectedUsers[socket.id].username);

                    }
                    

                    }
                	else
                    {
                    																		socket.emit("failToExpand", connectedUsers[socket.id].username);

                    }







				}


			}



});

});
