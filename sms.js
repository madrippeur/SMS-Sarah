exports.action = function(data, callback, config, SARAH) {
	var config = config.modules.sms;
	//Numero de tel des admin
  	var admin = new Array();
	//AJOUTER ICI LES NUM DE CEUX QUI PEUVENT ENVOYER DES COMMANDES !
	var admin = [
    "+33606060606",
    "+33606060606"
    ];

  
	//ICI "MOTCLE", "COMMANDE", PENSER A NE PAS METTREDE VIRGULE A LA DERNIERE LIGNE 
	var commandes = new Array();
	var commandes = [
		"Lumieresoff", "http://127.0.0.1:8080/sarah/hue?on=false&lights=true",
		"Lumiereson", "http://127.0.0.1:8080/sarah/hue?on=true&lights=true",
		"Tableon", "http://127.0.0.1:8080/sarah/hue?on=true&light=1",
		"Tableoff", "http://127.0.0.1:8080/sarah/hue?on=false&light=1",
		"Salonon", "http://127.0.0.1:8080/sarah/hue?on=true&light=2",
		"Salonoff", "http://127.0.0.1:8080/sarah/hue?on=false&light=2",
		"Sphereon", "http://127.0.0.1:8080/sarah/hue?on=true&light=3",
		"Sphereoff", "http://127.0.0.1:8080/sarah/hue?on=false&light=3",
		"Couloiron", "http://127.0.0.1:8080/sarah/hue?on=true&light=4",
		"Couloiroff", "http://127.0.0.1:8080/sarah/hue?on=false&light=4",
		"Neonoff", "http://127.0.0.1:8080/sarah/hue?on=false&light=5",
		"Neonon", "http://127.0.0.1:8080/sarah/hue?on=true&light=5",
		"Teleoff", "http://127.0.0.1:8080/sarah/requete?requete=/tv/samsungremote.php?key=POWEROFF",
		"Chauffage21", "http://127.0.0.1:8080/sarah/heatmiser?commande=settemp&action=21",
		"Chauffage20", "http://127.0.0.1:8080/sarah/heatmiser?commande=settemp&action=20",
		"Chauffage19", "http://127.0.0.1:8080/sarah/heatmiser?commande=settemp&action=19",
		"Chauffage18", "http://127.0.0.1:8080/sarah/heatmiser?commande=settemp&action=18",
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
		console.log( "longueur : " + admin.length);

		    //EST CE UN NUM ADMIN ?
    	var a = "0";
			for (a = 0; a < admin.length; a++) {
        console.log( "num testé : " + admin[a]);
				if ( data.phone == admin[a] ){
						var adminok = "1"; break;
        } else {
						var adminok = "0";
        }
			}

		console.log('ADMIN : ' + adminok );


		//EST CE UNE COMMANDE OU DU TEXTE ?
		//CEST UNE COMMNANDE
    
		//Est ce que cest une demande pour avoir la liste descmds ?
		if (( data.text == "Listecmd" ) && (adminok == "1")){
			lst = "Liste des commandes disponibles :";
      var z = "0";
			for (z = 0; z < commandes.length; z++) {
				var lst = lst + "%0D%0A" + commandes[z];
				z++;
			}
			//on envoie sms avec les commandes
			var request = require('request');
			var url = 'http://127.0.0.1:8080/sarah/sms?phone=' + data.phone + '&text=' + lst + '&password=' + config.password;
			request({ 'uri' : url , method: "POST"}, function (err, response, body){});
			callback();
      return;
		}  
       
        
        var actionsms = commandes[i];
		//boucle pour tester si cest une commande
		var i = "0";
		for (i = 0; i < commandes.length; i++) {
			if (( data.text == commandes[i] ) && (adminok == "1")){
				i++;
				var actionsms = commandes[i];
			}
			i++;
		}
		console.log('commande : ' + data.text);
		console.log('action : ' + actionsms);

		if (( typeof actionsms !== 'undefined' ) && (adminok == "1")){
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
			var json={"request":{}};
			json.request.question="Message reçu deux "  + data.phone + ". Dois je le lire ?";
			json.request.answer=["oui"," non"];
			json.request.answervalue=['http://127.0.0.1:8888/?tts=Voici le contenu du message : ' + data.text + '' ,"http://127.0.0.1:8888/?tts=compris."];
			json.request.answercallback=[true,true];
			json.request.TTSanswer=["Ok.",""];
			json.request.no_answervalue="http://127.0.0.1:8888/?tts=Je suis tout seul en fait !";
			json.request.recall=true;
			json.request.timeout=40;
			var url='http://127.0.0.1:8080/sarah/askme';
			var request = require('request');
			request({ 
				'uri': url,
				'method': 'POST',
				'json': json,
				'timeout': 5000,
				}, function (err, response, body){
					if (err || response.statusCode != 200) {
						callback({'tts':'error'});
						return;
					}
					});	
		}
		callback({});
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
			var json={"request":{}};
			json.request.question='Message à '  + data.phone2 + '. Le message est : ' + message + '.Dois je envoyer ?';
			json.request.answer=["oui"," non"];
			json.request.answervalue=['http://127.0.0.1:8080/sarah/sms?phone=' + data.phone + '&text=Message vocal : ' + message + '&password=' + config.password + '' ,"http://127.0.0.1:8888/?tts=Très bien. Recommence."];
			json.request.answercallback=[true,true];
			json.request.TTSanswer=["Ok.",""];
			json.request.no_answervalue="http://127.0.0.1:8888/?tts=Ne pars pas comme ça ...";
			json.request.recall=true;
			json.request.timeout=40;
			var url='http://127.0.0.1:8080/sarah/askme';
			var request = require('request');
			request({ 
				'uri': url,
				'method': 'POST',
				'json': json,
				'timeout': 5000,
				}, function (err, response, body){
				if (err || response.statusCode != 200) {
					callback({'tts':'error'});
					return;
				}
				});	
		
		callback({});
		return;
	}
}