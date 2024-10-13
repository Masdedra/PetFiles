//Para ver si jala los cambios 2
const { debug } = require('console');
const express = require('express'),
	socket = require('socket.io'),
	mysql = require('mysql');

//Para ver si jala los cambios 2
const app = express();
const http = require('http');

var https = require('https');

var fs = require('fs');

var credentials = {
	ca: fs.readFileSync("/CERTS/certificate.ca.crt", 'utf8'), //la certification authority o CA
	key: fs.readFileSync("/CERTS/certificate.key", 'utf8'), //la clave SSL, que es el primer archivo que generamos ;)
	cert: fs.readFileSync("/CERTS/certificate.crt", 'utf8') //el certificado
};





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
  				socket.broadcast.emit("seDesconecto", connectedUsers[socket.id].username);

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
  				socket.broadcast.emit("seDesconecto", connectedUsers[socket.id].username);

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
  																		socket.broadcast.emit("seDesconecto", connectedUsers[c.clientId].username);

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
  						socket.broadcast.emit("seConecto", clientInfoToEmit);

	

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




	
	//INICIA LOGIN
	socket.on("login", function (data) {
		const user = data.user,
			pass = data.pass;

		db.query("SELECT * FROM users WHERE username=? AND password =? LIMIT 1", [user, pass], function (err, rows, fields) {
			if (rows.length == 0) {
				console.log("Usuario no existe");
				socket.emit("UserDoesNotExist", { user: user });
			}
			else {
				db.query("SELECT petcreated, id FROM users WHERE username=? LIMIT 1", [user], function (err1, rows1, fields1) {
					if (rows1.length == 0) {
						var clientInfo = new Object();
						clientInfo.clientId = socket.id;
						clientInfo.userID = rows[0].id;
						clientInfo.username = user;
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


	

});




