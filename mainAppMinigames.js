const { debug } = require('console');
const express = require('express'),
	socket = require('socket.io'),
	mysql = require('mysql');


const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

var iap = require('in-app-purchase');

const io = new Server(server);

const fs = require('fs');


var battlePassDB = new Object();
fs.readFile('/home/ec2-user/PetFiles/bpData.json', function (error, content) {
	battlePassDB = JSON.parse(content);
});

//Arreglo de salas activas

 var rooms = new Object();
 var users = new Object();


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
function ObjectLength( object ) {
    var length = 0;
    for( var key in object ) {
        if( object.hasOwnProperty(key) ) {
            ++length;
        }
    }
    return length;
};

function countProperties(obj) {
	var count = 0;

	for (var prop in obj) {
		if (obj.hasOwnProperty(prop))
			++count;
	}

	return count;
}

const config = {
	"host": "93.127.197.124",
	"user": "Admin",
	"password": "danielito001",
	"base": "temporal_pet"
};

var db = mysql.createConnection({
	host: config.host,
	user: config.user,
	password: config.password,
	database: config.base
});

db.connect(function (error) {
	if (!!error)
		throw error;

	console.log('mysql connected to ' + config.host + ", user " + config.user + ", database " + config.base);
});





server.listen(3014, () => {
	console.log('listening on *:3014, escuchando minijuegos');
});




io.on('connection', (socket) => {


socket.on('create', function (userID) 
{
  
  var roomID = makeid(6);
	//INICIALIZO EL USUARIO EN MI OBJETO
	var userObj = new Object();
		userObj.rid = roomID;

	users[socket.id]= userObj;

	var roomObj = new Object();
		roomObj.roomID = roomID;
		roomObj.host = userID.uid;
		roomObj.hostSockID = socket.id;
  		roomObj.guests = new Object();
		roomObj.currentMG = 1;
		roomObj.numPlayers = 2;
		roomObj.roomLocked = false;

		  		roomObj.bubbles = new Object();

	rooms[roomID] = roomObj;

	rooms[roomID].guests[socket.id] = new Object();
	rooms[roomID].guests[socket.id].act = "1";//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].uid = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].un = userID.un;//Le digo que la actividad es 001 porque la sala se crea en la room 1

	rooms[roomID].guests[socket.id].visiting = 0;//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].uVisiting = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].roomVisit = 1;//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].x = 0.77;//Le digo que la actividad es 001 porque la sala se crea en la room 1
	rooms[roomID].guests[socket.id].y = -1.11;//Le digo que la actividad es 001 porque la sala se crea en la room 1

console.log("El total de miembros en esta sala es de: " + ObjectLength(rooms[roomID].guests) );

	console.log("Se creo la sala: " + roomID + " donde el host es el usuario: " + rooms[roomID].host);
console.log("Cree una sala y soy el host, mi actividad es: " + rooms[roomID].guests[socket.id].act);

 	 socket.join(roomID);
	socket.emit("roid", roomID);
});



socket.on('join', function (room) 
{
  
	var roomData= new Object();
  	const roomID = room.room;
  	const uid = room.uid;
	const act = room.act;
   const un = room.un;
	const x = room.x;
	const y = room.y;
     var keysToCheck;
        		

if(rooms[roomID] !=null)
{
		if(rooms[roomID].guests != null)
		{
keysToCheck = Object.keys(rooms[roomID].guests)

if(keysToCheck.length < 3)
{
	db.query("SELECT favRoom FROM balances WHERE userid=? LIMIT 1", [rooms[roomID].host], function (err, rows, fields) {
	
    	if(rows.length > 0 )
        {
        		roomData.roomID = room.room;
				roomData.roomHost = rooms[roomID].host;
        
        
        			//INICIALIZO EL USUARIO EN MI OBJETO
					var userObj = new Object();
						userObj.rid = roomID;

						users[socket.id]= userObj;
	
				rooms[roomID].guests[socket.id] = new Object();
				rooms[roomID].guests[socket.id].act = act;
				rooms[roomID].guests[socket.id].uid = uid;
        		rooms[roomID].guests[socket.id].un = un;

				rooms[roomID].guests[socket.id].visiting = 1;
				rooms[roomID].guests[socket.id].uVisiting = rooms[roomID].host;//LE digo que estoy visitando a un usuario
				rooms[roomID].guests[socket.id].roomVisit = rows[0].favRoom;//LE digo que estoy visitando a un usuario
				rooms[roomID].guests[socket.id].x = x;//LE digo que estoy visitando a un usuario
				rooms[roomID].guests[socket.id].y = y;//LE digo que estoy visitando a un usuario

				console.log("El total de miembros en esta sala es de: " + ObjectLength(rooms[roomID].guests) );
				console.log("Me uni a la sala y mi actual actividad en el juego es : " + rooms[roomID].guests[socket.id].act);
				console.log("Obtuve datos de la sala a la que me quiero unir");
				console.log("Datos obtenidos: "+ room.room + " Host de la sala: " + rooms[roomID].host);
				console.log("Me quiero unir a la sala: " + roomData.roomID + " cuyo host es: " + roomData.roomHost);
				console.log("La habitacion favorita del usuario al que me uni es: " + rooms[roomID].guests[socket.id].roomVisit);
        
       

  				socket.join(roomID);
 				socket.emit("joinedToRoom", roomData);
        



                
              var keys;
        		keys = Object.keys(rooms[roomID].guests);
        
        		console.log("KEYS;  " + keys);
        		console.log("Keys size= " + keys.length);
        
        
        	//Si se unio alguien nuevo, forzo a todos a cambiar su estado a no listo
                for (let i = 0; i < keys.length; i++)
            	{
                        	rooms[roomID].guests[keys[i]].gState = false
				}
        
				io.to(roomID).emit("forceNotReadyEveryone");

        
        	for (let i = 0; i < keys.length; i++)
            {
                console.log("Me uni a la sala y ya estaba en ella el usuario: "+ rooms[roomID].guests[keys[i]].uid)
						

                                        var myinfo2 =  new Object();
        								myinfo2.uid = rooms[roomID].guests[keys[i]].uid;
        								myinfo2.activity = rooms[roomID].guests[keys[i]].act;
        								myinfo2.visiting = rooms[roomID].guests[keys[i]].visiting;
        								myinfo2.uVisiting = rooms[roomID].guests[keys[i]].uVisiting;
        								myinfo2.roomVisit = rooms[roomID].guests[keys[i]].roomVisit;
            							myinfo2.x = rooms[roomID].guests[keys[i]].x;
            							myinfo2.y = rooms[roomID].guests[keys[i]].y;

        								myinfo2.roomID = roomID;
            							myinfo2.sid = keys[i];
            							myinfo2.un = rooms[roomID].guests[keys[i]].un;
										io.to(roomID).emit("userjoined", myinfo2);
            			

            }
        
        
        }
    
    });
}
else

{
	 				socket.emit("roomIsFull", "");


}




		}

}


});

//ACTUALIZA LA ACTIVIDAD EN LAS SALAS
socket.on('act', function (data) 
{
	const uid = socket.id;
	const act = data.act;
	const visiting = data.visiting;
	const uVisit = data.uVisit;
	const rVisit = data.roomVisit;
	var x = data.x;
	var y = data.y;
	const roomID = data.roomID;
	const msg = data.msg;

	console.log("Este usuario esta visitando a : " + uVisit);
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	rooms[roomID].guests[socket.id].act = act;
            	rooms[roomID].guests[socket.id].visiting = visiting;
				rooms[roomID].guests[socket.id].uVisiting = uVisit;
				rooms[roomID].guests[socket.id].roomVisit = rVisit;
            	rooms[roomID].guests[socket.id].x = x;
                rooms[roomID].guests[socket.id].y = y;

            	console.log("Se actualizo la actividad de este usuario en el servidor");
            	
            		var dat = new Object();
            		dat.uid = rooms[roomID].guests[socket.id].uid;
            		dat.act = rooms[roomID].guests[socket.id].act;
					dat.vis = rooms[roomID].guests[socket.id].visiting;
					dat.uVis = rooms[roomID].guests[socket.id].uVisiting;
					dat.rVis = rooms[roomID].guests[socket.id].roomVisit;
					dat.x = rooms[roomID].guests[socket.id].x;
            		dat.y = rooms[roomID].guests[socket.id].y;
					dat.msg = msg;
            		io.to(roomID).emit("uact", dat);
            	console.log("Se emitio la actividad de este usuario a la sala: " + roomID);
            	console.log("El usuario en esta room ahora tiene de actividad: " + rooms[roomID].guests[socket.id].act);

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});

//Cuando ya se va a empezar el juego nadie puede dar listo ni cancelar
socket.on('cannotCancel', function (data) 
{
	rooms[data].roomLocked = true;
	io.to(data).emit("cannotCancelMatchmaking");

	
});


//Desbloquea el estado de la room para que se pueda dar listo de nuevo
socket.on('canMatchmake', function (data) 
{
	rooms[data].roomLocked = false;

	
});


//Se encarga de cambiar el minijuego actual
socket.on('setMG', function (data) 
{

	const roomID= data.rID;
	const mg = data.gID;
	const pN = data.pN; //player number
	if(rooms[roomID] !=null)
	{
		rooms[roomID].currentMG = mg;
    		rooms[roomID].numPlayers = pN;
			console.log("Se ha cambiado el minijuego a: " + mg + " con un numero requerido de jugadores de: "  + pN);
		io.to(roomID).emit("newMG",rooms[roomID].currentMG );

	}
});





//ACTUALIZA EL ESTADO LISTO O NO LISTO DEL JUGADOR EN LA SALA
socket.on('readyForMG', function (data) 
{
	const uid = socket.id;
	const gID = data.gID;
	const uID = data.uID;

const roomID = data.rID;

	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].roomLocked == false)
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	rooms[roomID].guests[socket.id].gState = true;
            	console.log("Se actualizo la actividad de este usuario en el servidor");
            	
            		var dat = new Object();
            		dat.uid = rooms[roomID].guests[socket.id].uid;
            		dat.gState = rooms[roomID].guests[socket.id].gState;
                    
            		rooms[roomID].guests[socket.id].inGState = false;

					socket.emit("youreReady");

            		io.to(roomID).emit("playerReady", dat);
            		console.log("Se emitio actividad de listo de este usuario a la sala: " + roomID);
            		console.log("El usuario en esta room ahora esta listo para el juego: " + rooms[roomID].guests[socket.id].uid);
            
                    var readyUsers = 0;
              		var keys;
        			keys = Object.keys(rooms[roomID].guests);
        
        			console.log("KEYS;  " + keys);
        			console.log("Keys size= " + keys.length);
        
            			for (let i = 0; i < keys.length; i++)
            			{
                        	if(rooms[roomID].guests[keys[i]].gState == true)
                            {
                            	readyUsers++;
                            }
            			}
            		//Verifico si los jugadores estan listos
            		if(readyUsers ==  rooms[roomID].numPlayers)
                	{
                    	rooms[roomID].finishedPlayers =0 ;
                	    io.to(roomID).emit("gameReady", rooms[roomID].currentMG);
                    
                	}

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});





//ACTUALIZA EL ESTADO LISTO O NO LISTO DEL JUGADOR EN LA SALA
socket.on('notReadyForMG', function (data) 
{
	const uid = socket.id;
	const gID = data.gID;
	const uID = data.uID;

const roomID = data.rID;

	
	if(rooms[roomID] != null)
    {
        	if(rooms[roomID].roomLocked == false)
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	rooms[roomID].guests[socket.id].gState = false;
            	console.log("Se actualizo la actividad de este usuario en el servidor");
            	
            		var dat = new Object();
            		dat.uid = rooms[roomID].guests[socket.id].uid;
            		dat.gState = rooms[roomID].guests[socket.id].gState;
					socket.emit("youreNotReady");

            		io.to(roomID).emit("playerNotReady", dat);
            	console.log("Se emitio actividad de listo de este usuario a la sala: " + roomID);
            	console.log("El usuario en esta room ahora esta listo para el juego: " + rooms[roomID].guests[socket.id].uid);

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});

socket.on('stadiumStats', function (data) 
{
  
	var uid = data;
        		
	
	db.query("SELECT wonRaces FROM minigamesStats WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) 
    {
			if(rows.length == 0)
            {
                        db.query("INSERT INTO minigamesStats(`userid`,`wonRaces`)  VALUES(?, ?)", [uid, 0], function (err1, rows1, result3) 
    			{
                        if (!!err1)
						throw err1;
                		socket.emit("wonRaces", 0);
                		console.log("Emitiendo e insertando carreras en 0");

                });


            }
    		else
            {
            			socket.emit("wonRaces", rows[0].wonRaces);
                		console.log("Emitiendo carreras existentes");
            	
            }
	});

});


socket.on('multiplayerPass', function (data) 
{
  
	var uid = data;
        		
	
	db.query("SELECT * FROM multiplayerGamePass WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) 
    {
			if(rows.length == 0)
            {
                        db.query("INSERT INTO multiplayerGamePass(`userid`,`membershipType`)  VALUES(?, ?)", [uid, "free"], function (err1, rows1, result3) 
    			{
                        if (!!err1)
						throw err1;
                        
                        var mpPass = new Object();
                        mpPass.type = "free";
                        mpPass.rw1 = 0;
                        mpPass.rw2 = 0;                        
                        mpPass.rw3 = 0;
                        mpPass.rw4 = 0;                        
                        mpPass.rw5 = 0;                        
                        mpPass.rw6 = 0;                        
                        mpPass.rw7 = 0;                        
                        mpPass.rw8 = 0;                        
                        mpPass.rw9 = 0;                       
                        mpPass.rw10 = 0;                        
                        mpPass.rw11 = 0;                        
                        mpPass.rw12 = 0;                        
                        mpPass.rw13 = 0;                        
                        mpPass.rw14 = 0;                        
                        mpPass.rw15 = 0;                        
                        mpPass.rw16 = 0;                        
                        mpPass.rw17 = 0;                        
                        mpPass.rw18 = 0;                        
                        mpPass.rw19 = 0;                        
                        mpPass.rw20 = 0;                        
                        mpPass.rw21 = 0;
                        mpPass.rw22 = 0; 
                         mpPass.rw23 = 0;                          
                         mpPass.rw24 = 0;                          
                         mpPass.rw25 = 0;                          
                         mpPass.rw26 = 0;                          
                         mpPass.rw27 = 0;                          
                         mpPass.rw28 = 0;                          
                         mpPass.rw29 = 0;                          
                         mpPass.rw30 = 0;  
                		socket.emit("mpPass", mpPass);
                		console.log("Emitiendo e insertando pase multijugador");

                });


            }
    		else
            {
                        var mpPass = new Object();
                        mpPass.type = rows[0].membershipType;
                        mpPass.rw1 = rows[0].rw1;
                        mpPass.rw2 = rows[0].rw2;                        
                        mpPass.rw3 = rows[0].rw3;
                        mpPass.rw4 = rows[0].rw4;                        
                        mpPass.rw5 = rows[0].rw5;                        
                        mpPass.rw6 = rows[0].rw6;                        
                        mpPass.rw7 = rows[0].rw7;                        
                        mpPass.rw8 = rows[0].rw8;                        
                        mpPass.rw9 = rows[0].rw9;                       
                        mpPass.rw10 = rows[0].rw10;                        
                        mpPass.rw11 = rows[0].rw11;                        
                        mpPass.rw12 = rows[0].rw12;                        
                        mpPass.rw13 = rows[0].rw13;                        
                        mpPass.rw14 = rows[0].rw14;                        
                        mpPass.rw15 = rows[0].rw15;                        
                        mpPass.rw16 = rows[0].rw16;                        
                        mpPass.rw17 = rows[0].rw17;                        
                        mpPass.rw18 = rows[0].rw18;                        
                        mpPass.rw19 = rows[0].rw19;                        
                        mpPass.rw20 = rows[0].rw20;                        
                        mpPass.rw21 = rows[0].rw21;
                        mpPass.rw22 = rows[0].rw22; 
                         mpPass.rw23 = rows[0].rw23;                          
                         mpPass.rw24 = rows[0].rw24;                          
                         mpPass.rw25 = rows[0].rw25;                          
                         mpPass.rw26 = rows[0].rw26;                          
                         mpPass.rw27 = rows[0].rw27;                          
                         mpPass.rw28 = rows[0].rw28;                          
                         mpPass.rw29 = rows[0].rw29;                          
                         mpPass.rw30 = rows[0].rw30;  
                		socket.emit("mpPass", mpPass);  
                       console.log("Emitiendo carreras existentes");
            	
            }
	});

});






socket.on('getWonRacesGuest', function (data) 
{
  
	var uid = data;
        		
	
	db.query("SELECT wonRaces FROM minigamesStats WHERE userid=? LIMIT 1", [uid], function (err, rows, fields) 
    {
			if(rows.length == 0)
            {
            			var racesInfo = new Object();
            			racesInfo.id = uid;
            			racesInfo.races = 0;
                		socket.emit("wonRacesGuest", racesInfo);

              


            }
    		else
            {
            			var racesInfo = new Object();
            			racesInfo.id = uid;
            			racesInfo.races = rows[0].wonRaces;
            			socket.emit("wonRacesGuest",racesInfo);
                		console.log("Emitiendo carreras existentes");
            	
            }
	});

});





//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO DE SALTO MIENTRAS SE JUEGA UNA CARRERA
socket.on('ST_Jump', function (data) 
{
const roomID = data;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		
            		io.to(roomID).emit("ST_PJumped", rooms[roomID].guests[socket.id].uid);
            		console.log("Se emitio un salto a la pista de carreras con el RID: " + roomID);
            		console.log("El usuario en esta carrera ha saltado: " + rooms[roomID].guests[socket.id].uid);
            
                 

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});

//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO DE CAIDA MIENTRAS SE JUEGA UNA CARRERA
socket.on('ST_Fall', function (data) 
{
const roomID = data;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		
            		io.to(roomID).emit("ST_PFell", rooms[roomID].guests[socket.id].uid);
            		console.log("Se emitio una caida a la pista de carreras con el RID: " + roomID);
            		console.log("El usuario en esta carrera ha caido: " + rooms[roomID].guests[socket.id].uid);
            
                 

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO DE CAIDA MIENTRAS SE JUEGA UNA CARRERA
socket.on('ST_Won', function (data) 
{
const roomID = data;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		rooms[roomID].finishedPlayers += 1;
            
            		var dat = new Object();
            		dat.player = rooms[roomID].guests[socket.id].uid;
            		dat.place = rooms[roomID].finishedPlayers;
            
            		io.to(roomID).emit("ST_PPlace", dat);
            		console.log("Se emitio ganar pista de carreras con el RID: " + roomID);
            		console.log("El usuario en esta carrera ha llegado a la meta: " + rooms[roomID].guests[socket.id].uid);
            
                 	if(dat.place == 1)
                    {
                                        db.query("UPDATE minigamesStats SET wonRaces = wonRaces + 1 WHERE userid=? LIMIT 1", [dat.player], function (err4, rows4, fields4) {
									console.log("Se actualizaron las carreras ganadas del usuario ganador");
										});
                    }

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});



//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO DE ACELERACION MIENTRAS SE JUEGA UNA CARRERA
socket.on('ST_AcceD', function (data) 
{
const roomID = data;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		
            		io.to(roomID).emit("ST_PAcce", rooms[roomID].guests[socket.id].uid);
            		console.log("Se emitio una aceleracion a la pista de carreras con el RID: " + roomID);
            		console.log("El usuario en esta carrera ha acelerado: " + rooms[roomID].guests[socket.id].uid);
            
                 

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO DE ACELERACION MIENTRAS SE JUEGA UNA CARRERA
socket.on('ST_SlowD', function (data) 
{
const roomID = data;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		
            		io.to(roomID).emit("ST_PSlowed", rooms[roomID].guests[socket.id].uid);
            		console.log("Se emitio una desaceleracion a la pista de carreras con el RID: " + roomID);
            		console.log("El usuario en esta carrera ha desacelerado: " + rooms[roomID].guests[socket.id].uid);
            
                 

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


//////ESTADIO DE CARRERAS ////////////////////////////////////////////////
//ACTUALIZA EL ESTADO LISTO O NO LISTO DEL JUGADOR EN EL MINIJUEGO DE CARRERAS
socket.on('ST_Ready', function (data) 
{
const roomID = data;
var racePlayers = 3; //Numero de jugdores para el estadio
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {
            	
                    
            		rooms[roomID].guests[socket.id].inGState = true;

					socket.emit("ST_MGReady");
					const uidReady = rooms[roomID].guests[socket.id].uid;
            		io.to(roomID).emit("ST_MGPlayerR", uidReady);
            		console.log("Se emitio actividad de listo de este usuario en el minijuego: " + roomID);
            		console.log("El usuario en este minijuego ahora esta listo para la carrera: " + rooms[roomID].guests[socket.id].uid);
            
                    var readyUsers = 0;
              		var keys;
        			keys = Object.keys(rooms[roomID].guests);
        
        			console.log("KEYS;  " + keys);
        			console.log("Keys size= " + keys.length);
        
            			for (let i = 0; i < keys.length; i++)
            			{
                        	if(rooms[roomID].guests[keys[i]].inGState == true)
                            {
                            	readyUsers++;
                            }
            			}
            		racePlayers= keys.length;
            		console.log("La carrera ahora consta de : "+ racePlayers + " jugadores");
            		//Verifico si los jugadores estan listos
            		if(readyUsers ==  racePlayers)
                	{
                	    io.to(roomID).emit("raceReady");
                    
                    	//REINICIO A NO LISTO A TODOS LOS JUGADORES
              			var keys2;
        				keys2 = Object.keys(rooms[roomID].guests);
        
            			for (let i = 0; i < keys2.length; i++)
            			{
                        	rooms[roomID].guests[keys2[i]].gState = false;
                            
            			}
                	}
            


            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});



socket.on('rtmsg', function (data) 
{
	const uid = socket.id;
	const roomID = data.roomID;
	const msg = data.msg;
	
	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {

            		console.log("Se envio un mensaje de dialogo en tiempo real");
            	
            		var dat = new Object();
            		dat.uid = rooms[roomID].guests[socket.id].uid;
					dat.msg = msg;
            		io.to(roomID).emit("rtmsgf", dat);
            		console.log("Se emitio la actividad de este usuario a la sala: " + roomID);
            		console.log("El usuario ha emitido el mensaje: " + msg);
	
            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


socket.on('bubble', function (data) 
{
	const uid = data.uid;
	const id = data.id;
	const t = data.t;
	const room = data.room;
	const ctned =  data.ctned;
	const hash = data.hash;
	const roomID = data.roomID;

            		console.log("burbuja recibida en servidor para la roomID " + roomID);

	
	if(rooms[roomID] != null)
    {
	if(rooms[roomID].bubbles != null)
    {

					
            		console.log("Se solto una burbuja contenedora");
            	
            		var dat = new Object();
            		dat.uid = uid;
        			dat.id = id;
        			dat.t = t;
        			dat.room = room;
        			dat.hash = hash;
        			dat.ctned = ctned;
        			dat.vuid = data.vuid;
        
        			rooms[roomID].bubbles[hash] = new Object();
        			rooms[roomID].bubbles[hash].uid = uid;
        			rooms[roomID].bubbles[hash].id= id;
        			rooms[roomID].bubbles[hash].t =t;
        			rooms[roomID].bubbles[hash].room = room;
        			rooms[roomID].bubbles[hash].ctned= ctned;
					
        
            		io.to(roomID).emit("container", dat);
            		console.log("Se emitio una burbuja contenedora de este usuario a la sala: " + roomID);
            		console.log("El usuario ha emitido una burbuja ");
    }
    else
    {console.log("No se inicializaron las burbujas");}
	

    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


socket.on('destroyBubble', function (data) 
{
	const uid = data.uid;
	const roomID = data.roomID;
	const hash = data.hash;

            		console.log("Destruyendo burbuja en servidor para la roomID " + roomID);

	
	if(rooms[roomID] != null)
    {
	if(rooms[roomID].bubbles != null)
    {	
    if(rooms[roomID].bubbles[hash] != null)
    {

    			   var dat = new Object();
    				dat.hash = hash;
    				dat.uid =rooms[roomID].bubbles[hash].uid;
    				
    				
            		io.to(roomID).emit("bubbleExpired", dat);
            		console.log("Servidor le regreso una burbuja con timer expirado");
    
    
    			  delete rooms[roomID].bubbles[hash];

					
            		console.log("Se destruyo una burbuja contenedora");

        
            		io.to(roomID).emit("bubbleDestroyed", hash);
            		console.log("Se emitio una destruccion de burbuja contenedora de este usuario a la sala: " + roomID);
            		console.log("El usuario ha destruido una burbuja ");
    }
    }
    else
    {console.log("No se inicializaron las burbujas");}
	

    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});


socket.on('getBubble', function (data) 
{
	const roomID = data.roomID;
	const hash = data.hash;
	const uid = data.uid;

		console.log("El usuario: " + uid + " ha reventado una burbuja");
            		console.log("Obteniendo burbuja en servidor para la roomID " + roomID);

	
	if(rooms[roomID] != null)
    {
	if(rooms[roomID].bubbles != null)
    {	
    if(rooms[roomID].bubbles[hash] != null)
    {

    
    			  delete rooms[roomID].bubbles[hash];

					
            		console.log("Se obtuvo una burbuja contenedora");

        			var dat = new Object();
    				dat.hash = hash;
    				dat.uid = uid;
    				
    				
            		io.to(roomID).emit("bubbleIsYours", dat);
            		console.log("El usuario ha tomado una burbuja ");
    }
    }
    else
    {console.log("No se inicializaron las burbujas");}
	

    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }
	


});

socket.on('claimBPItem', function (data) 
{

	console.log("Reclamando objeto a usuario: " + data.pid);
	const rwToClaim = data.rwIndex;
	var claimType = "free";
	var userPassType = "free";
	var userCurrentMedals = 0;
	var itemCost = 999;
	var rwID = 3;
    var rwIndexToUpdate = "rw";

	rwIndexToUpdate = rwIndexToUpdate+ (rwToClaim+1).toString();

//PRIMERO OBTENGO LOS DATOS DEL ITEM DE LA BD DEL PASE DE BATALLA

		for (let i = 0; i < battlePassDB.length; i++) {
			if (battlePassDB[i].rwIndex == rwToClaim) 
            {
				if (battlePassDB[i].cash == false) 
                {
					claimType = "free";
					itemCost = battlePassDB[i].price;
                	rwID = battlePassDB[i].id;
				}
				else 
                {
					claimType = "premium";
					itemCost = battlePassDB[i].price;
                	rwID = battlePassDB[i].id;

				}

				break;
			}
		}


	db.query("SELECT membershipType FROM multiplayerGamePass WHERE userid=? LIMIT 1", [data.pid], function (err, rows, fields) 
    {
    			if(rows.length == 0)
            	{
                		//EMITO QUE NO EXISTE EL USUARIO EN LOS PASES DE BATALLA
            			socket.emit("cannotClaimNoUser");

            	
            	}
    			else
    			{
                		userPassType = rows[0].membershipType;
                	db.query("SELECT wonRaces FROM minigamesStats WHERE userid=? LIMIT 1", [data.pid], function (err1, rows1, fields1) 
    				{
                    	if(rows1.length == 0)
                        {
                                        		//EMITO QUE NO EXISTE EL USUARIO EN LOS STATS MINIGAMES
            					socket.emit("cannotClaimNoUser");
                        }
                    	else
                    	{
                        		userCurrentMedals = rows1[0].wonRaces;
                        
                        		if(claimType == "free")
                                {
                                	//Si le alcanzan las medallas se reclama
                                	if(itemCost <= userCurrentMedals)
                                    {
                                    	userCurrentMedals -= itemCost;
                                    	 db.query("UPDATE minigamesStats SET wonRaces = ? WHERE userid=? LIMIT 1", [userCurrentMedals, data.pid], function (err4, rows4, fields4) {
												console.log("Se actualizaron las medallas al reclamar un item");
										});
                                    
                                    	 db.query("UPDATE multiplayerGamePass SET "+rwIndexToUpdate+" = ? WHERE userid=? LIMIT 1", [true, data.pid], function (err5, rows5, fields5) {
												console.log("Se actualizo el estado de reclamado de un item al reclamar");
                                         
                                         	var responseClaim = new Object();
                                         		responseClaim.rwIndex = rwToClaim;
                                         		responseClaim.medals = userCurrentMedals;
                                                responseClaim.rwID = rwID;

                                               socket.emit("itemClaimed", responseClaim);

                                         		
										});
                                    	
                                    }
                                	else
                                    {
                                    	socket.emit("notEnoughMedals");
                                    }

                                }
                        		else
                                {	
                                	//VERIFICO QUE EL USUARIO TENGA PASE PREMIUM
                                	if(userPassType == "premium")
                                    {	
                                    	
                                    	                              	//Si le alcanzan las medallas se reclama
                                	if(itemCost <= userCurrentMedals)
                                    {
                                    	userCurrentMedals -= itemCost;
                                    	 db.query("UPDATE minigamesStats SET wonRaces = ? WHERE userid=? LIMIT 1", [userCurrentMedals, data.pid], function (err4, rows4, fields4) {
												console.log("Se actualizaron las medallas al reclamar un item");
										});
                                    
                                    	 db.query("UPDATE multiplayerGamePass SET "+rwIndexToUpdate+" = ? WHERE userid=? LIMIT 1", [true, data.pid], function (err5, rows5, fields5) {
												console.log("Se actualizo el estado de reclamado de un item al reclamar");
                                               var responseClaim = new Object();
                                         		responseClaim.rwIndex = rwToClaim;
                                         		responseClaim.medals = userCurrentMedals;
                                         		responseClaim.rwID = rwID;
                                               socket.emit("itemClaimed", responseClaim);

                                         		
										});
                                    	
                                    }
                                	else
                                    {
                                    	socket.emit("notEnoughMedals");
                                    }
                                    
                                    }
                                }
                        
                    	}
                    
                    
                    });
                	
    			}
    	
    	
	});


		

	
});





socket.on('petMove', function (data) 
{
  	var dat = new Object();

  const x = data.x;
  const y = data.y
  const dir = data.dir;
  const hashKey = data.hashKey;
  const roomID = data.roomID;
const act = data.act;

console.log("Se esta moviendo un pet en el roomID: " + roomID + " con el usuario: " + hashKey);

	if(rooms[roomID] != null)
    {
    	if(rooms[roomID].guests != null)
        {
        	if(rooms[roomID].guests[socket.id] != null)
            {

            	rooms[roomID].guests[socket.id].x = x;
                rooms[roomID].guests[socket.id].y = y;

            }
        	else
            {
            	console.log("Este usuario no se encuentra en esta sala");
            }
        }
    	else
        {
        	console.log("Los invitados en esta sala no fueron inicializados al crear sala");
        }
    }
	else
    {
    	console.log("La sala a actualizar actividad no existe");
    }

	dat.x= x;
	dat.y = y;
	dat.hashKey = hashKey;
  	dat.dir = dir;
	  	dat.act = act;




		socket.to(roomID).emit("petMoved", dat);
});



socket.on('kick', function (data) 
{
	
  	const id = data.id;
	const rid = data.rid;
	const sid = data.sid;

	console.log("Se expulso al usuario: "  + id);

       	if(rooms[rid] != null)
        {
        	if(rooms[rid].guests[sid] != null)
            {
                        	delete rooms[rid].guests[sid];
            
              console.log("SE EXPULSO A : " + id);

              var keys;
        		keys = Object.keys(rooms[rid].guests);
        
        		console.log("KEYS;  " + keys);
        		console.log("Keys size= " + keys.length);
        
        
        	//Si se unio alguien nuevo, forzo a todos a cambiar su estado a no listo
                for (let i = 0; i < keys.length; i++)
            	{
                        	rooms[rid].guests[keys[i]].gState = false
				}
        
				io.to(rid).emit("forceNotReadyEveryone");
             

            }
        }

    

		io.to(rid).emit("petKicked", id);

		socket.to(sid).emit("kicked");
});


socket.on('leave', function (data) 
{
	
  	const id = data.id;
	const rid = data.rid;
	const sid = socket.id;

	console.log("El usuario salio de la sala: "  + id);
    socket.leave(sid);

       	if(rooms[rid] != null)
        {
        	if(rooms[rid].guests[sid] != null)
            {
                        	delete rooms[rid].guests[sid];
  console.log("SE EXPULSO A : " + id);

              var keys;
        		keys = Object.keys(rooms[rid].guests);
        
        		console.log("KEYS;  " + keys);
        		console.log("Keys size= " + keys.length);
        
        
        	//Si se unio alguien nuevo, forzo a todos a cambiar su estado a no listo
                for (let i = 0; i < keys.length; i++)
            	{
                        	rooms[rid].guests[keys[i]].gState = false
				}
        
				io.to(rid).emit("forceNotReadyEveryone");
            }
        }


		io.to(rid).emit("petKicked", id);

		socket.emit("youExit");
});


socket.on('bye', function (data) 
{
	

            				socket.leave(data);

	console.log("Se elimino al usuario: "  + socket.id);

       	if(rooms[data] != null)
        {
        	if(rooms[data].guests[socket.id] != null)
            {
                        	delete rooms[data].guests[socket.id];
            
              console.log("SE EXPULSO A : " + id);

              var keys;
        		keys = Object.keys(rooms[data].guests);
        
        		console.log("KEYS;  " + keys);
        		console.log("Keys size= " + keys.length);
        
        
        	//Si se unio alguien nuevo, forzo a todos a cambiar su estado a no listo
                for (let i = 0; i < keys.length; i++)
            	{
                        	rooms[data].guests[keys[i]].gState = false
				}
        
				io.to(data).emit("forceNotReadyEveryone");

            }
        }


});





	//Se desconecta y se elimina de la lista
socket.on('disconnect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);

		if(users[socket.id] != null)
        {	
        		if(users[socket.id].rid != null)
                {
                        	var roomID = users[socket.id].rid;	
                
							       	if(rooms[roomID] != null)
       								 {
        									if(rooms[roomID].guests[socket.id] != null)
           							 		{
                                               var userID = rooms[roomID].guests[socket.id].uid;
                                            	var hostSID = rooms[roomID].hostSockID; 
												var wasHostDisconnected = false;
                                            	
                                            	if(hostSID == socket.id) //Si coincide mi hostsocket con mi socket de esa room, significa que soy el lider
                                                {
                                                	wasHostDisconnected = true;
                                                }
                        							delete rooms[roomID].guests[socket.id];
                                            		delete users[socket.id];
                                            	
                                            	if(wasHostDisconnected == false)
                                                {
                                                		//Si no era el host, solo se avisa que un miembro se desconecto
                                            			io.to(roomID).emit("petKicked", userID);
                                                }
                                            	else
                                                {
                                                		//Si fue el host, se avisa que se desconecto el host y se elimina la sala por completo de los arreglo
                                                		io.to(roomID).emit("hostDisconnected"); 
                                               			delete rooms[roomID];

                                                }

            								}
        							 }


                }
        
        	
        }
		

});




});

