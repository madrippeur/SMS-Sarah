exports.action = function(data, callback, config, SARAH) {
	var config = config.modules.sms;
	//Numero de tel des admin
  	var admin = new Array();
	//AJOUTER ICI LES NUM DE CEUX QUI PEUVENT ENVOYER DES COMMANDES !
	var admin = [
    "+33606060606", "+33606060606"
    ];

  
	//ICI "MOTCLE", "COMMANDE", PENSER A NE PAS METTREDE VIRGULE A LA DERNIERE LIGNE 
	var commandes = new Array();
	var commandes = [
		"Lumieresoff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=-1",
		"Lumiereson", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=-1",
		"Tableon", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=1",
		"Tableoff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=1",
		"Salonon", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=2",
		"Salonoff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=2",
		"Sphereon", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=3",
		"Sphereoff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=3",
		"Couloiron", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=4",
		"Couloiroff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=4",
		"Teleoff", "http://127.0.0.1:8080/sarah/requete?requete=/tv/samsungremote.php?key=POWEROFF",
		"Neonoff", "http://127.0.0.1:8080/sarah/phue?todo=1&param=off&room=5",
		"Neonon", "http://127.0.0.1:8080/sarah/phue?todo=1&param=on&room=5",
		"Merci", "http://127.0.0.1:8080/sarah/sms?phone=" + data.phone + "&text=Mais%20de%20rien%20!"
  ];
 

	////////////////////A PARTIR DE LA NE RIEN TOUCHER !

	//AVONS NOUS LA CONFIGURATION MINIMALE REQUISE ? 
	if (( typeof config.ip == 'undefined') || ( typeof config.port == 'undefined')){
		console.log("Erreur de configuration");
		callback({});
		return;
	}  

	console.log('-----------------------------------------');
	console.log('Numero de tel : ' + data.phone); 
   

 
	//SI data.smscenter EST DEFINI IL SAGIT DE LA RECPETION D UN SMS
	if ( typeof data.smscenter !== 'undefined'){
		console.log('MESSAGE RECU ! ');

		
		    //EST CE UN NUM ADMIN ?
			for (i = 0; i < admin.length; i++) {
				if ( data.phone == admin[i] ){
						var admin = "1";
        } else {
						var admin ="0";
        }
			}

    console.log('ADMIN : ' + admin );


		//EST CE UNE COMMANDE OU DU TEXTE ?
		//CEST UNE COMMNANDE
    
		//Est ce que cest une demande pour avoir la liste descmds ?
		if (( data.text == "Listecmd" ) && (admin == "1")){
			lst = "Liste des commandes disponibles :";
			for (i = 0; i <= commandes.length-1; i++) {
				var lst = lst + "%0D%0A" + commandes[i];
				i++;
			}
			//on envoie sms avec les commandes
			var request = require('request');
			var url = 'http://127.0.0.1:8080/sarah/sms?phone=' + data.phone + '&text=' + lst + '&password=' + config.password;
			request({ 'uri' : url , method: "POST"}, function (err, response, body){});
			callback();
		}  
       
        
        var actionsms = commandes[i];
		//boucle pour tester si cest une commande
		for (i = 0; i < commandes.length; i++) {
			if (( data.text == commandes[i] ) && (admin == "1")){
				i++;
				var actionsms = commandes[i];
			}
			i++;
		}
    console.log('commande : ' + data.text);
    console.log('action : ' + actionsms);

		if (( typeof actionsms !== 'undefined' ) && (admin == "1")){
			console.log('LE MESSAGE EST UNE COMMANDE');
			var request = require('request');
			request({ 'uri' : actionsms , method: "POST"}, function (err, response, body){
				if (err || response.statusCode != 200) {
					callback({'tts': "L'action n'a pas abouti !"});
					return;
				} else {
					if ( config.smsconfirmation == "1" ){
						console.log('SMS DECONFIRMATION ENVOYE');
						var request = require('request');
						var url = 'http://' + config.ip + ':' + config.port + '/sendsms?phone=' + data.phone + '&text=Commande reçue !&password=' + config.password;
            request({ 'uri' : url , method: "POST"}, function (err, response, body){});   
					}
          callback({});    
					return;
				}
			});
		} else {
			//CEST DU TEXTE ON DECORTIQUE LENUM DE TEL POUR UNE LECTURE CORRECTE ET ONNE A MANGER A ASKME
			data.phone='0' + data.phone.charAt(3) + ' ' + data.phone.substr(4,2) + ' ' + data.phone.substr(6,2) + ' ' + data.phone.substr(8,2) + ' ' + data.phone.substr(10,2);
			console.log('Ce n est pas une action, on va utiliser askme');
			var url='http://127.0.0.1:8080/sarah/askme?request={"question":"Message%20re%C3%A7u%20deux%20' + data.phone + '.%20Dois%20je%20le%20lire%20?","answer":["Oui",%20"Non"],"answervalue":["http://127.0.0.1:8080/sarah/parle?phrase=' + data.text + '.","http://127.0.0.1:8080/sarah/parle?phrase=compris."]}';
			var request = require('request');
			request({ 'uri' : url , method: "POST"}, function (err, response, body){
				if (err || response.statusCode != 200) {
					callback({'tts': "L'action n'a pas abouti !"});
					return;
				} else {
					if ( config.smsconfirmation == "1" ){
						console.log('SMS DECONFIRMATION ENVOYE');
						var request = require('request');
						//var url = 'http://127.0.0.1:8080/sarah/sms?phone=' + data.phone + '&text=Sms reçu !' + '&password=' + config.password;
						var url = 'http://' + config.ip + ':' + config.port + '/sendsms?phone=' + data.phone + '&text=Sms reçu !&password=' + config.password;

            request({ 'uri' : url , method: "POST"}, function (err, response, body){});   
					}
					callback({});
					return;
				}
			});
			callback({});
		}
		return;
	}
	//SMS RECOIT UNE REQUETTE HTTP POUR ENVOYER UN TEXTO DONC ON ENVOIE LE TEXTO
	if ((typeof data.dictation == 'undefined')&&(typeof data.text == 'undefined')){
		callback({'tts': "Erreur de dictée vocale, ou texto non reçu."});
		return;
	}
	if (typeof data.dictation == 'undefined'){
		console.log('DICTEE : VIDE');
		console.log('Texto : ' + data.text);
		// Build URL
		var url = 'http://' + config.ip + ':' + config.port + '/sendsms?phone=' + data.phone + '&text=' + data.text + '&password=' + config.password;
		console.log("Sending request to : " + url);
		// Send Request
		var request = require('request');
		request({ 'uri' : url , method: "POST"}, function (err, response, body){
			if (err || response.statusCode != 200) {
				SARAH.speak("Message non envoyé");
				callback({});
			} else { 
				SARAH.speak("Message envoyé");
				callback({});
			}
		});
    }
	//ENVOIE SMS PAR LA VOIX
	if (typeof data.text == 'undefined'){
		console.log('TEXTO : VIDE');
		console.log('DICTEE :' + data.dictation);
		message=data.dictation.slice( data.action.length + data.qui.length + data.clef.length + 1 ,data.dictation.length );     
		console.log('MESSAGE : ' + message );
		if ( message.length < "2"){
			SARAH.speak('Le message à envoyer est vide, recommence !');
			callback({});
			return;
		}
		data.phone2=data.phone.substr(0,2) + ' ' + data.phone.substr(2,2) + ' ' + data.phone.substr(4,2) + ' ' + data.phone.substr(6,2) + ' ' + data.phone.substr(8,2);
		//LE MESSAGE EST ENVOYE A ASKME POUR ETRE SUR QUIL NOUS CONVIENNE
		// Build URL
		var url = 'http://127.0.0.1:8080/sarah/askme?request={%22question%22:%22Message%20a%20' + data.phone2 + '.%20Le%20message%20est%20:%20' + message + '.%20Dois%20je%20envoyer%20?%22,%22answer%22:[%22oui%22,%22non%22],%22answervalue%22:[%22http://127.0.0.1:8080/sarah/sms?phone=' + data.phone + '%26text=Message%20vocal%20:%20' + message + '%22,%22http://127.0.0.1:8080/sarah/parle?phrase=Annulation%22],%22no_answervalue%22:%22http://127.0.0.1:8080/sarah/parle?phrase=Annulation%22,%22timeout%22:30,%22recall%22:false}';
		console.log("Message askme : " + url);
		// Send Request
		var request = require('request');
		request({ 'uri' : url , method: "POST"}, function (err, response, body){
			if (err || response.statusCode != 200) {
				callback({'tts': "L'action n'a pas abouti !"});
				return;
			} else {
				callback({});
			}
		});
	}
}
