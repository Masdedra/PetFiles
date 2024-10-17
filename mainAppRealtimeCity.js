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

var itemDB = new Object();
fs.readFile('/home/ec2-user/PetFiles/Database.json', function (error, content) {
	itemDB = JSON.parse(content);
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





server.listen(3020, () => {
	console.log('listening on *:3020, escuchando salas en tiempo real de la ciudad');
});




io.on('connection', (socket) => {


socket.on('joinToCity', function (userID) 
{
	var wasAddedToRoom = false;
	var roomData= new Object();

	if(ObjectLength(rooms) <= 0)
    {
    	var roomID = 1;
		//INICIALIZO EL USUARIO EN MI OBJETO
		var userObj = new Object();
		userObj.rid = roomID.toString();

		users[socket.id]= userObj;

		var roomObj = new Object();
		roomObj.roomID = roomID.toString();
		roomObj.hostSockID = socket.id;
  		roomObj.guests = new Object();

		rooms[roomID] = roomObj;

		rooms[roomID].guests[socket.id] = new Object();
		rooms[roomID].guests[socket.id].act = "0";//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].uid = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].un = userID.un;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].visiting = 1;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].uVisiting = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].roomVisit = 0;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].x = 8.28;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].y = -28.0;//Le digo que la actividad es 001 porque la sala se crea en la room 1

		console.log("Creando una sala inicial");
		console.log("Me uní al room: "  + roomID);

 	 	socket.join(roomID.toString());
		socket.emit("roid", roomID.toString());
    	wasAddedToRoom = true;
    
    }
	else
    {
    	for(let i = 0 ; i < ObjectLength(rooms); i++)
        {
        		var actualRoom =
                    parseInt(i) +
                    parseInt(1);
        		//PRIMERO CUENTO LA CANTIDAD DE USUARIOS EN LA SALA
                console.log("Checando los invitados en la sala: " + actualRoom);
        	    var keys;
        		keys = Object.keys(rooms[actualRoom].guests);
        
        		console.log("Verificando la sala: " + actualRoom);
                console.log("La sala verificada tiene un total de : " + keys.length + " usuarios");

        	//SI LA CANTIDAD ES MENOR A 40 USUARIOS, ME UNO A ELLA
        	if(keys.length < 40)
            {
            	console.log("Uniendome a una sala existente en la ciudad, ID:" + actualRoom);
            
            	if(rooms[actualRoom] !=null)
				{
				if(rooms[actualRoom].guests != null)
                {
	
        				roomData.roomID = actualRoom.toString();
        
        
        			//INICIALIZO EL USUARIO EN MI OBJETO
						var userObj = new Object();
						userObj.rid = actualRoom.toString();

						users[socket.id]= userObj;
	
				        rooms[actualRoom].guests[socket.id] = new Object();
				        rooms[actualRoom].guests[socket.id].act = 0;
				        rooms[actualRoom].guests[socket.id].uid = userID.uid;
        		        rooms[actualRoom].guests[socket.id].un = userID.un;
				        rooms[actualRoom].guests[socket.id].visiting = 1;
				        rooms[actualRoom].guests[socket.id].x = 0;//LE digo que estoy visitando a un usuario
				        rooms[actualRoom].guests[socket.id].y = 0;//LE digo que estoy visitando a un usuario
                		rooms[actualRoom].guests[socket.id].roomVisit = 0;//Le digo que la actividad es 001 porque la sala se crea en la room 1
						rooms[actualRoom].guests[socket.id].x = 8.28;//Le digo que la actividad es 001 porque la sala se crea en la room 1
						rooms[actualRoom].guests[socket.id].y = -28.0;//Le digo que la actividad es 001 porque la sala se crea en la room 1

                        console.log("El total de miembros en esta sala es de: " + ObjectLength(rooms[actualRoom].guests) );
                        console.log("Me uni a la sala y mi actual actividad en el juego es : " + rooms[actualRoom].guests[socket.id].act);
                        console.log("Obtuve datos de la sala a la que me quiero unir");
                        
                        socket.join(actualRoom.toString());
            						console.log("Me uní al room: "  + actualRoom);

            
            			  var keys;
        				  keys = Object.keys(rooms[actualRoom].guests);
        
        
        								for (let j = 0; j < keys.length;j++)
            							{
                                        console.log("Me uni a la sala y ya estaba en ella el usuario: "+ rooms[actualRoom].guests[keys[j]].uid)
						

                                        var myinfo2 =  new Object();
        								myinfo2.uid = rooms[actualRoom].guests[keys[j]].uid;
        								myinfo2.activity = rooms[actualRoom].guests[keys[j]].act;
        								myinfo2.visiting = rooms[actualRoom].guests[keys[j]].visiting;
        								myinfo2.uVisiting = rooms[actualRoom].guests[keys[j]].uVisiting;
        								myinfo2.roomVisit = rooms[actualRoom].guests[keys[j]].roomVisit;
            							myinfo2.x = rooms[actualRoom].guests[keys[j]].x;
            							myinfo2.y = rooms[actualRoom].guests[keys[j]].y;

        								myinfo2.roomID = roomID;
            							myinfo2.sid = keys[j];
            							myinfo2.un = rooms[actualRoom].guests[keys[j]].un;
										io.to(actualRoom.toString()).emit("userjoined", myinfo2);

            							}
            
            			
                				wasAddedToRoom = true;
                				socket.emit("roid", actualRoom.toString());
                		break;

				}

				}

            
            	
            }


        }
    	
    
    
    	if(wasAddedToRoom == false)
        {
          console.log("Necesito crear una nueva sala, todas las demas están llenas");
            		
          var roomID = parseInt(ObjectLength(rooms))  + parseInt(1);
		//INICIALIZO EL USUARIO EN MI OBJETO
		var userObj = new Object();
		userObj.rid = roomID.toString();

		users[socket.id]= userObj;

		var roomObj = new Object();
		roomObj.roomID = roomID.toString();
		roomObj.hostSockID = socket.id;
  		roomObj.guests = new Object();

		rooms[roomID] = roomObj;

		rooms[roomID].guests[socket.id] = new Object();
		rooms[roomID].guests[socket.id].act = "0";//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].uid = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].un = userID.un;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].visiting = 1;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].uVisiting = userID.uid;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].roomVisit = 0;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].x = 8.28;//Le digo que la actividad es 001 porque la sala se crea en la room 1
		rooms[roomID].guests[socket.id].y = -28.0;//Le digo que la actividad es 001 porque la sala se crea en la room 1

		console.log("Creando una sala nueva porque las otras estaban llenas");
        console.log("Me uní al room: "  + roomID);

 	 	socket.join(roomID.toString());
		socket.emit("roid", roomID.toString());
        }
    }


    
  
  


console.log("El total de salas creadas es: " + ObjectLength(rooms));
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




socket.on('petMove', function (data) 
{
  	var dat = new Object();

  const x = data.x;
  const y = data.y
  const dir = data.dir;
  const hashKey = data.hashKey;
  const roomID = data.roomID;

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



		console.log("[CIUDAD] Emitiendo movimiento de pet al room ID " + roomID);
		socket.to(roomID.toString()).emit("petMoved", dat);
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

            }
        }

       console.log("SE EXPULSO A : " + id);

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

            }
        }


});


	//Se desconecta y se elimina de la lista
	socket.on('disconnect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);

		if(users[socket.id] != null)
        {	
        		console.log("Socketid encontrado en desconexion");
        		if(users[socket.id].rid != null)
                {
                	        		console.log("Roomid encontrado en desconexion");

                	
                        	var roomID = users[socket.id].rid;	
                
							       	if(rooms[roomID] != null)
       								 {
                                     	     console.log("Room no es nula en desconexion todo bien");

        									if(rooms[roomID].guests[socket.id] != null)
           							 		{
                                            	console.log("Miembro en room no es nula en desconexion todo bien");
															
                                               				var userID = rooms[roomID].guests[socket.id].uid;
															console.log("Se elimino al usuario con el ID: " + userID);
                                            				io.to(roomID).emit("petKicked", userID);

                                                    	    var keys;
        													keys = Object.keys(rooms[roomID].guests);
                                                                console.log("El total de usuarios en la habitacion es " + keys.length);
                        									delete rooms[roomID].guests[socket.id];
                                            				delete users[socket.id];
                                            
                                            	          	 var keys2;
        													keys2 = Object.keys(rooms[roomID].guests);
                                            	
                                            if(keys2.length > 0)
                                            {
                                            	console.log("El total de usuarios restantes es" + keys2.length);

                                            }
                                            else
                                            {
                                            	if(keys2.length <= 0)
                                                {
                                                	console.log("Se eliminó la sala porque no quedaban usuarios en ella");
                                                	delete rooms[roomID];
                                                }
                                            }

                                                		//Si no era el host, solo se avisa que un miembro se desconecto
                                            		//	io.to(roomID).emit("petKicked", userID);

                                               }

            						}
        		}


          }
        
        
        
		

});




});

