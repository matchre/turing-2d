var levels=[
	{
		description:{
			eng:"<div><h1>Over view</h1><p>Welcome to the 2D Turing engine! We will figure out how its work throught a series of case.</p><p>First lets make you confortable with the engine.</p><p>You can see on the main panel two maps, with a cursor on each. The one on top is the instruction map, the second is the tape map. You probably already know everything about the 2D Turing engine, if not there is a little resume. During one step of the engine, the system will read what it has to do on the instruction map, each symbol is an instruction ( don't worry these are pretty simple! ), and report the result of the instruction on the tape map. These are the symbols you can use : <ul><li>arrows which make the instruction cursor move, by default the engine read instruction from left to right.</li><li>arrows which make the tape cursor move</li><li>bunck of colors that dont make anything</li></ul>Now lets go to the serious ones, these are combinaisons of two symbols and are really usefull<ul><li>with the cross symbol, followed by a X symbol, you can write an X at the tape cursor place</li><li>you can read the symbol pointed by the tape cursor on the tape map, if the symbol red is the same that the one that follow the circle, the instruction cursor will continue its lecture, if not I will go to the bottom case instead.</li></ul>And I think you should have enought to go further now.</p><h2>Usage</h2><p>You got a tool box on your right side, this one has two mode. The editor mode allows you to modify the map with a bunch of cool tools, we will go back on theses later. Then, with the monitoring mode, you can launch and stop the engine or work step by step.</p><p>Lets work this out with an example. Try this little programm here, launch the engine and see how it's work.</p><p>Go to the next case when its done.</p>  <div>",
			fr:"<div><h1>Vue d'ensemble</h1><p>Bienvenue sur cette émulateur de machine de Turing en 2 dimension! Nous allons voir ensemble comment elle fonctionne à travers une série de cas.</p><h3>Concept</h3><p>Vous n'êtes peut être pas familier du prinicpe de machine de Turing. Un petit rappel s'impose donc. La machine dispose d'une bande de donné composé de cellules où sont inscrit des symboles. Ainsi que d'un jeu d'instruction qui forme un programme. A chaque itération la machine effectue des actions. Ces dernières sont typiquement : changer l'état de la machine, déplacer le curseur de lecture de la bande de donnée, écrire sur la bande de donnée. Elle décide de quoi faire d'après son jeu d'instruction, cela peut varier selon l'état dans lequel elle se trouve, ou selon le symbole lut sur la bande de donnée. A partir ce mécanisme simple on peut reproduire</p><p> Voila pour le principe général, ici nous utiliserons une machine particulière. Nous utiliserons une bande de donnée à deux dimension, c'est à dire que le curseur peut se déplacer horizontalement et verticalement, il conviendra de parler de <s>carte</s> pour désigner une telle bande. Nous utiliserons une seconde carte pour coder le jeu d'instruction, elle est elle aussi parcourut par un curseur. La position du curseur déterminera ainsi l'état de la machine. La carte programme et la carte de donnée utilise le même jeu de symbole.</p><p> Ce dernier est assez simple, il se compose de flêches codant pour le déplacement du curseur de la carte de donnée ( <span class='symbol-tleft mini-tile'/> <span class='symbol-tright mini-tile'/> <span class='symbol-ttop mini-tile'/> <span class='symbol-tbot mini-tile'/> ), de flêches codant pour le déplacement du curseur de la carte d'instruction ( <span class='symbol-left mini-tile'/> <span class='symbol-right mini-tile'/> <span class='symbol-top mini-tile'/> <span class='symbol-bot mini-tile'/> <span class='symbol-dright mini-tile'/> <span class='symbol-dleft mini-tile'/> ), par défaut ce dernier se déplace de gauche à droite apès la lecture d'un symbole , et de symbole de couleur, n'ayant pas d'autre sémantique pour le programme qu'un déplacement par par défaut ( <span class='symbol-color1 mini-tile'/> <span class='symbol-color2 mini-tile'/> <span class='symbol-color3 mini-tile'/> ... ). Ajoutons deux symboles plus complexe pour avoir une machine fonctionnelle. Un rond, ( <span class='symbol-check mini-tile'/> ) le symbole conditionnel sa sémantique est lié au symbole qui le suit. Lorsque la machine arrive sur ce symbole, elle lit le symbole sur la carte de donnée, si c'est le même que le symbole suivant sur la carte programme, la machine passe sur le symbole gauche suivant, sinon elle passe sur le symbole en bas. Enfin la croix ( <span class='symbol-write mini-tile'/> ) permet d'inscrire sur la carte de donnée un symbole.</p><h3>Usage</h3><p>Bien! Maintenant que l'on a les bases, penchons nous sur l'interface. Vous pouvez observer sur votre gauche les deux carte, la carte programme en haut et la carte donnée en bas. Vous pouvez naviguer dans ces carte via cliquer-glisser et ajuster le niveau de zoom avec la molette de la souris.</p><p>Manipulons à présent le panneau de monitoring, il se trouve tout à droite dans la boite à outil, selectionner l'onglet monitoring. Vous pouvez y lancer la machine, la stopper, ou choisir l'execution pas à pas.</p><p>Pour réussir cet exercice, lancer la machine et observer le curseur programme se déplacer en fonction du symbole inscrit sur sa case.</p></div>"    
		},
		writeManualInstruction:[{"x":15,"y":13,"s":4},{"x":15,"y":12,"s":6},{"x":15,"y":11,"s":6},{"x":15,"y":10,"s":6},{"x":15,"y":9,"s":6},{"x":15,"y":8,"s":6},{"x":15,"y":7,"s":6},{"x":14,"y":13,"s":4},{"x":14,"y":7,"s":3},{"x":13,"y":13,"s":4},{"x":13,"y":7,"s":3},{"x":12,"y":13,"s":4},{"x":12,"y":7,"s":3},{"x":11,"y":13,"s":4},{"x":11,"y":7,"s":3},{"x":10,"y":13,"s":4},{"x":10,"y":7,"s":3},{"x":9,"y":13,"s":4},{"x":9,"y":7,"s":3},{"x":8,"y":13,"s":5},{"x":8,"y":12,"s":5},{"x":8,"y":11,"s":5},{"x":8,"y":10,"s":5},{"x":8,"y":9,"s":5},{"x":8,"y":8,"s":5},{"x":8,"y":7,"s":3}],
		writeManualTape:[],
		writeManualInstructionSolution:[{"x":15,"y":13,"s":4},{"x":15,"y":12,"s":6},{"x":15,"y":11,"s":6},{"x":15,"y":10,"s":6},{"x":15,"y":9,"s":6},{"x":15,"y":8,"s":6},{"x":15,"y":7,"s":6},{"x":14,"y":13,"s":4},{"x":14,"y":7,"s":3},{"x":13,"y":13,"s":4},{"x":13,"y":7,"s":3},{"x":12,"y":13,"s":4},{"x":12,"y":7,"s":3},{"x":11,"y":13,"s":4},{"x":11,"y":7,"s":3},{"x":10,"y":13,"s":4},{"x":10,"y":7,"s":3},{"x":9,"y":13,"s":4},{"x":9,"y":7,"s":3},{"x":8,"y":13,"s":5},{"x":8,"y":12,"s":5},{"x":8,"y":11,"s":5},{"x":8,"y":10,"s":5},{"x":8,"y":9,"s":5},{"x":8,"y":8,"s":5},{"x":8,"y":7,"s":3}],
		writeManualTapeSolution:[],
		cursorInstruction:{x:8,y:7},
		cursorTape:{x:0,y:0},
		authorizerInstruction:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			cursorInstruction:{"x":8,"y":8},
		}
	
	},
	{
		description:{
			eng:"<div><h1>Your turn</h1><p>I will present you the smart editor. As you may guess thanks to it name, it really simple to use.<p>First thing to know is that not every cell is editable, for the need of this tutorial, we don't want you to mess up with everything. So all the case that have a grey background aren't editable.<p>The little programm below is mostly finished, some parts are missing.</p><p>Siwtch to editor mode in the toolbox, now you are able to move the cursor to modify the symbol in cells. Drag and drop the cursor to move it, note that in that exercise, it will be replace as you relaunch the engine. Double click on a cell to edit it. You can then either click on the symbole in the list, or use your keyBoard to type the keyword corresponding. Valid change by pressing enter. Navigate from cell to cell with the arrow pad.</p> <div>",
			fr:"<div><h1>Editons</h1><p>Apportez donc votre contribution! La carte programme de cet exercise est deffectueuse, on voudrait que le curseur effectue des cycles, comme précédement.</p><p> Voyons comment utiliser l'éditeur. Premièrement passer en mode édition en cliquant sur l'onglet de la boîte à outil. Nous reviendrons plus tard sur les boutons avec une tête bizarre. Sachez tout d'abord que votre liberté d'action est restreinte pour cette exercice et que vous ne pouvez éditer que les cellules non grisés. Double cliquer sur l'une d'elle pour modifier son symbole. Un panneau devrait vous permettre de selectionner le symbole souhaité dans une liste.</p><p>Remarquez que tout symbole est lié à une touche et que vous pouver rapidement écrire une ligne de symbole en vous servant de votre clavier. Validez l'entrée au clavier avec entré pour passer à la cellule suivante.</p><p>Lorsque vous avez complété le programme, tester le en mode monitoring.</p></div>",  
		},
		writeManualInstruction:[{"x":19,"y":15,"s":4},{"x":19,"y":14,"s":6},{"x":19,"y":13,"s":6},{"x":19,"y":10,"s":6},{"x":19,"y":9,"s":6},{"x":19,"y":8,"s":6},{"x":18,"y":15,"s":4},{"x":17,"y":15,"s":4},{"x":16,"y":15,"s":4},{"x":16,"y":7,"s":3},{"x":15,"y":15,"s":4},{"x":15,"y":7,"s":3},{"x":14,"y":15,"s":4},{"x":14,"y":7,"s":3},{"x":13,"y":7,"s":3},{"x":12,"y":7,"s":3},{"x":11,"y":7,"s":3},{"x":10,"y":15,"s":4},{"x":10,"y":7,"s":3},{"x":9,"y":15,"s":4},{"x":9,"y":7,"s":3},{"x":8,"y":15,"s":5},{"x":8,"y":14,"s":5},{"x":8,"y":13,"s":5},{"x":8,"y":12,"s":5},{"x":8,"y":11,"s":5},{"x":8,"y":10,"s":5},{"x":8,"y":9,"s":5},{"x":8,"y":8,"s":5},{"x":8,"y":7,"s":3}],
		writeManualInstructionSolution:[{"x":19,"y":15,"s":4},{"x":19,"y":14,"s":6},{"x":19,"y":13,"s":6},{"x":19,"y":12,"s":6},{"x":19,"y":11,"s":6},{"x":19,"y":10,"s":6},{"x":19,"y":9,"s":6},{"x":19,"y":8,"s":6},{"x":19,"y":7,"s":6},{"x":18,"y":15,"s":4},{"x":18,"y":7,"s":3},{"x":17,"y":15,"s":4},{"x":17,"y":7,"s":3},{"x":16,"y":15,"s":4},{"x":16,"y":7,"s":3},{"x":15,"y":15,"s":4},{"x":15,"y":7,"s":3},{"x":14,"y":15,"s":4},{"x":14,"y":7,"s":3},{"x":13,"y":15,"s":4},{"x":13,"y":7,"s":3},{"x":12,"y":15,"s":4},{"x":12,"y":7,"s":3},{"x":11,"y":15,"s":4},{"x":11,"y":7,"s":3},{"x":10,"y":15,"s":4},{"x":10,"y":7,"s":3},{"x":9,"y":15,"s":4},{"x":9,"y":7,"s":3},{"x":8,"y":15,"s":5},{"x":8,"y":14,"s":5},{"x":8,"y":13,"s":5},{"x":8,"y":12,"s":5},{"x":8,"y":11,"s":5},{"x":8,"y":10,"s":5},{"x":8,"y":9,"s":5},{"x":8,"y":8,"s":5},{"x":8,"y":7,"s":3}],
		writeManualTape:[],
		writeManualTapeSolution:[],
		cursorInstruction:{x:8,y:7},
		cursorTape:{x:0,y:0},
		authorizerInstruction:{
			defaultValue:false,
			exceptions:[{x:17,y:7},{x:18,y:7},{x:19,y:7},{x:17,y:8},{x:18,y:8},{x:19,y:8},{x:17,y:6},{x:18,y:6},{x:19,y:6},{x:19,y:11},{x:19,y:12},{x:13,y:15},{x:12,y:15},{x:11,y:15},{x:13,y:14},{x:12,y:14},{x:11,y:14},{x:13,y:16},{x:12,y:16},{x:11,y:16}],
			cursorCtrl:false
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			cursorInstruction:{"x":8,"y":8},
		},
	
	},
	{
		description:{
			eng:"<div><h1>Getting started<h1><div>",
			fr:"<div><h1>fonctionnalités avancées</h1><p>Même chose ici, le but est de compléter la boucle. Vous êtes cette fois invité à utilisé les outils avancés.</p><p>Prennez la première coupure, une manière rapide de tracer un chemin est d'utiliser l'outil de traçage de chemin . Vous le trouverez dans la boîte à outils à l'onglet edition. Lorsque celui est sélectionné, faites un cliquer-glisser depuis un point à un autre pour les relier par un chemin.</p><p>De même pour la seconde coupure, cependant avant d'utiliser l'outil vous aurez probablement besoin de nettoyer la zone de tout les symboles ( les chemin ne peuvent être tracer que sur des cases vides ). Pour cela utiliser l'effaceur de zone, lui aussi dans l'onglet edition. Selectionner une zone par cliquer glisser et relâcher pour supprimer effacer les symboles de la zone. Il ne vous reste qu'a tracer un chemin en évitant les cellules non modifiable.</p><p>Enfin pour la troisième coupure, vous aurez besoin de sauter par dessus une cellule, vous pouvez pour cela utiliser le symbole double déplacement ( <span class='mini-tile symbol-dleft'/> <span class='mini-tile symbol-dright'/> ). C'est très utile pour que des chemins puissent se croiser. Remarquez que le traceur de chemin est capable d'utiliser ce symbole si il le faut.</p></div>", 
		},
		writeManualInstruction:[{"x":-5,"y":11,"s":6},{"x":-5,"y":12,"s":6},{"x":-5,"y":13,"s":6},{"x":-5,"y":14,"s":6},{"x":-5,"y":15,"s":3},{"x":-4,"y":11,"s":4},{"x":-4,"y":15,"s":3},{"x":-3,"y":11,"s":4},{"x":-3,"y":15,"s":3},{"x":-2,"y":15,"s":3},{"x":-1,"y":15,"s":3},{"x":0,"y":0,"s":3},{"x":0,"y":1,"s":5},{"x":0,"y":2,"s":5},{"x":0,"y":3,"s":5},{"x":0,"y":4,"s":5},{"x":0,"y":5,"s":5},{"x":0,"y":6,"s":5},{"x":0,"y":7,"s":5},{"x":0,"y":8,"s":5},{"x":0,"y":9,"s":5},{"x":0,"y":10,"s":5},{"x":0,"y":11,"s":5},{"x":0,"y":12,"s":5},{"x":0,"y":13,"s":5},{"x":0,"y":14,"s":5},{"x":0,"y":15,"s":5},{"x":1,"y":0,"s":3},{"x":2,"y":0,"s":3},{"x":3,"y":0,"s":3},{"x":4,"y":0,"s":3},{"x":4,"y":11,"s":4},{"x":5,"y":11,"s":4},{"x":6,"y":11,"s":4},{"x":7,"y":11,"s":4},{"x":8,"y":11,"s":4},{"x":9,"y":11,"s":4},{"x":10,"y":8,"s":3},{"x":10,"y":9,"s":4},{"x":10,"y":10,"s":6},{"x":10,"y":11,"s":3},{"x":10,"y":12,"s":4},{"x":11,"y":8,"s":6},{"x":11,"y":9,"s":3},{"x":11,"y":10,"s":4},{"x":11,"y":11,"s":6},{"x":11,"y":12,"s":3},{"x":12,"y":8,"s":3},{"x":12,"y":9,"s":5},{"x":12,"y":10,"s":4},{"x":12,"y":11,"s":3},{"x":12,"y":12,"s":6},{"x":13,"y":8,"s":5},{"x":13,"y":9,"s":4},{"x":13,"y":10,"s":6},{"x":13,"y":11,"s":3},{"x":13,"y":12,"s":3},{"x":14,"y":3,"s":6},{"x":14,"y":4,"s":6},{"x":14,"y":5,"s":6},{"x":14,"y":6,"s":6},{"x":14,"y":7,"s":6},{"x":14,"y":8,"s":5},{"x":14,"y":9,"s":3},{"x":14,"y":10,"s":4},{"x":14,"y":11,"s":5},{"x":14,"y":12,"s":4},{"x":15,"y":8,"s":6},{"x":15,"y":9,"s":4},{"x":15,"y":10,"s":3},{"x":15,"y":11,"s":5},{"x":15,"y":12,"s":6}],
		writeManualInstructionSolution:[{"x":-5,"y":11,"s":6},{"x":-5,"y":12,"s":6},{"x":-5,"y":13,"s":6},{"x":-5,"y":14,"s":6},{"x":-5,"y":15,"s":3},{"x":-4,"y":11,"s":4},{"x":-4,"y":15,"s":3},{"x":-3,"y":11,"s":4},{"x":-3,"y":15,"s":3},{"x":-2,"y":11,"s":4},{"x":-2,"y":15,"s":3},{"x":-1,"y":11,"s":4},{"x":-1,"y":15,"s":3},{"x":0,"y":0,"s":3},{"x":0,"y":1,"s":5},{"x":0,"y":2,"s":5},{"x":0,"y":3,"s":5},{"x":0,"y":4,"s":5},{"x":0,"y":5,"s":5},{"x":0,"y":6,"s":5},{"x":0,"y":7,"s":5},{"x":0,"y":8,"s":5},{"x":0,"y":9,"s":5},{"x":0,"y":10,"s":5},{"x":0,"y":11,"s":5},{"x":0,"y":12,"s":5},{"x":0,"y":13,"s":5},{"x":0,"y":14,"s":5},{"x":0,"y":15,"s":5},{"x":1,"y":0,"s":3},{"x":1,"y":11,"s":7},{"x":2,"y":0,"s":3},{"x":2,"y":11,"s":4},{"x":3,"y":0,"s":3},{"x":3,"y":11,"s":4},{"x":4,"y":0,"s":3},{"x":4,"y":11,"s":4},{"x":5,"y":0,"s":3},{"x":5,"y":11,"s":4},{"x":6,"y":0,"s":3},{"x":6,"y":11,"s":4},{"x":7,"y":0,"s":3},{"x":7,"y":11,"s":4},{"x":8,"y":0,"s":3},{"x":8,"y":11,"s":4},{"x":9,"y":0,"s":3},{"x":9,"y":11,"s":4},{"x":10,"y":0,"s":3},{"x":10,"y":11,"s":4},{"x":11,"y":0,"s":3},{"x":11,"y":11,"s":4},{"x":12,"y":0,"s":3},{"x":12,"y":11,"s":4},{"x":13,"y":0,"s":3},{"x":13,"y":11,"s":4},{"x":14,"y":0,"s":6},{"x":14,"y":1,"s":6},{"x":14,"y":2,"s":6},{"x":14,"y":3,"s":6},{"x":14,"y":4,"s":6},{"x":14,"y":5,"s":6},{"x":14,"y":6,"s":6},{"x":14,"y":7,"s":6},{"x":14,"y":8,"s":6},{"x":14,"y":9,"s":6},{"x":14,"y":10,"s":6},{"x":14,"y":11,"s":4}],
		writeManualTape:[],
		writeManualTapeSolution:[],
		cursorInstruction:{x:0,y:0},
		cursorTape:{x:0,y:0},
		authorizerInstruction:{
			defaultValue:false,
			exceptions:[{x:0,y:11},{x:-1,y:11},{x:-2,y:11},{x:1,y:11},{x:2,y:11},{x:0,y:10},{x:-1,y:10},{x:-2,y:10},{x:1,y:10},{x:2,y:10},{x:0,y:12},{x:-1,y:12},{x:-2,y:12},{x:1,y:12},{x:2,y:12},{x:3,y:12},{x:3,y:11},{x:3,y:10} ,{x:10,y:8},{x:11,y:8},{x:12,y:8},{x:13,y:8},{x:14,y:8},{x:15,y:8},{x:10,y:9},{x:11,y:9},{x:12,y:9},{x:13,y:9},{x:14,y:9},{x:15,y:9},{x:10,y:10},{x:11,y:10},{x:12,y:10},{x:13,y:10},{x:14,y:10},{x:15,y:10},{x:10,y:11},{x:11,y:11},{x:12,y:11},{x:13,y:11},{x:14,y:11},{x:15,y:11},{x:10,y:12},{x:11,y:12},{x:12,y:12},{x:13,y:12},{x:14,y:12},{x:15,y:12},  {x:14,y:0},{x:13,y:0},{x:12,y:0},{x:11,y:0},{x:10,y:0},{x:9,y:0},{x:8,y:0},{x:7,y:0},{x:6,y:0},{x:5,y:0},{x:14,y:1},{x:13,y:1},{x:12,y:1},{x:11,y:1},{x:10,y:1},{x:9,y:1},{x:8,y:1},{x:7,y:1},{x:6,y:1},{x:5,y:1},{x:14,y:2},{x:13,y:2},{x:12,y:2},{x:11,y:2},{x:10,y:2},{x:9,y:2},{x:8,y:2},{x:7,y:2},{x:6,y:2},{x:5,y:2}],
			cursorCtrl:false
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			cursorInstruction:{"x":0,"y":1},
		},
	
	},
	
	{
		description:{
			eng:"<div><h1>Getting started<h1><div>",
			fr:"<div><h1>Dessinons</h1><p>C'est maintenant le moment d'utiliser les instructions pour agir sur la bande de donnée.</p><p>Le but de cet exercice est de dessiner un carré violet autour de la cellule orange.</p><div style='margin-left:10%'><div><span class='mini-tile symbol-color2'/><span class='mini-tile symbol-color2'/><span class='mini-tile symbol-color2'/></div><div><span class='mini-tile symbol-color2'/><span class='mini-tile symbol-color6'/><span class='mini-tile symbol-color2'/></div><div><span class='mini-tile symbol-color2'/><span class='mini-tile symbol-color2'/><span class='mini-tile symbol-color2'/></div></div><p>C'est à ce motif que l'on voudrait arriver.</p><p>Les instructions <span class='mini-tile symbol-tleft'/>, <span class='mini-tile symbol-tright'/>, <span class='mini-tile symbol-ttop'/> et <span class='mini-tile symbol-tbot'/> seront utile pour déplacer le cureur de la carte de donnée.</p><p>Une fois sur la bonne cellule, utilisez la compinaison de symbole <span class='mini-tile symbol-write'/> <span class='mini-tile symbol-color2'/> pour inscrire le symbole violet.</p><p>Répéter l'opération pour toutes les cellules du carré.</p><p>Pour cet exercie vous pouvez modifiez la position initial du curseur.</p></div>",
		},
		writeManualInstruction:[],
		writeManualInstructionSolution:[{"x":0,"y":0,"s":9},{"x":1,"y":0,"s":11},{"x":2,"y":0,"s":1},{"x":3,"y":0,"s":14},{"x":4,"y":0,"s":10},{"x":5,"y":0,"s":1},{"x":6,"y":0,"s":14},{"x":7,"y":0,"s":10},{"x":8,"y":0,"s":1},{"x":9,"y":0,"s":14},{"x":10,"y":0,"s":12},{"x":11,"y":0,"s":1},{"x":12,"y":0,"s":14},{"x":13,"y":0,"s":12},{"x":14,"y":0,"s":1},{"x":15,"y":0,"s":14},{"x":16,"y":0,"s":9},{"x":17,"y":0,"s":1},{"x":18,"y":0,"s":14},{"x":19,"y":0,"s":9},{"x":20,"y":0,"s":1},{"x":21,"y":0,"s":14},{"x":22,"y":0,"s":11},{"x":23,"y":0,"s":1},{"x":24,"y":0,"s":14},{"x":25,"y":0,"s":10}],
		writeManualTape:[{x:0,y:0,s:18}],
		writeManualTapeSolution:[{x:0,y:0,s:18}],
		cursorInstruction:{x:0,y:0},
		cursorTape:{x:0,y:0},
		authorizerInstruction:{
			defaultValue:true,
			exceptions:[],
			cursorCtrl:true
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			tapeEquals:[{x:0,y:0,s:18},{x:1,y:0,s:14},{x:1,y:1,s:14},{x:1,y:-1,s:14},{x:-1,y:0,s:14},{x:-1,y:-1,s:14},{x:-1,y:1,s:14},{x:0,y:1,s:14},{x:0,y:-1,s:14}],
		},
	
	},
	
	{
		description:{
			
		},
		writeManualInstruction:[],
		writeManualInstructionSolution:[{"x":-8,"y":-5,"s":6},{"x":-8,"y":-4,"s":6},{"x":-8,"y":-3,"s":6},{"x":-8,"y":-2,"s":3},{"x":-7,"y":-5,"s":4},{"x":-7,"y":-2,"s":3},{"x":-6,"y":-5,"s":4},{"x":-6,"y":-2,"s":3},{"x":-5,"y":-5,"s":4},{"x":-5,"y":-2,"s":1},{"x":-4,"y":-5,"s":4},{"x":-4,"y":-2,"s":16},{"x":-3,"y":-5,"s":4},{"x":-3,"y":-2,"s":3},{"x":-2,"y":-5,"s":4},{"x":-2,"y":-2,"s":3},{"x":-1,"y":-5,"s":4},{"x":-1,"y":-2,"s":3},{"x":0,"y":-5,"s":4},{"x":0,"y":-2,"s":3},{"x":1,"y":-5,"s":4},{"x":1,"y":-2,"s":9},{"x":1,"y":0,"s":6},{"x":1,"y":1,"s":11},{"x":1,"y":3,"s":6},{"x":1,"y":4,"s":10},{"x":1,"y":6,"s":6},{"x":1,"y":7,"s":12},{"x":1,"y":9,"s":6},{"x":2,"y":-5,"s":4},{"x":2,"y":-2,"s":2},{"x":2,"y":-1,"s":10},{"x":2,"y":0,"s":4},{"x":2,"y":1,"s":2},{"x":2,"y":2,"s":12},{"x":2,"y":3,"s":4},{"x":2,"y":4,"s":2},{"x":2,"y":5,"s":9},{"x":2,"y":6,"s":4},{"x":2,"y":7,"s":2},{"x":2,"y":8,"s":11},{"x":2,"y":9,"s":4},{"x":3,"y":-5,"s":4},{"x":3,"y":-2,"s":17},{"x":3,"y":-1,"s":6},{"x":3,"y":0,"s":4},{"x":3,"y":1,"s":17},{"x":3,"y":2,"s":6},{"x":3,"y":3,"s":4},{"x":3,"y":4,"s":17},{"x":3,"y":5,"s":6},{"x":3,"y":6,"s":4},{"x":3,"y":7,"s":17},{"x":3,"y":8,"s":6},{"x":3,"y":9,"s":4},{"x":4,"y":-5,"s":4},{"x":4,"y":-2,"s":3},{"x":4,"y":1,"s":3},{"x":4,"y":4,"s":3},{"x":4,"y":7,"s":3},{"x":5,"y":-5,"s":4},{"x":5,"y":-2,"s":3},{"x":5,"y":1,"s":3},{"x":5,"y":4,"s":3},{"x":5,"y":7,"s":3},{"x":6,"y":-5,"s":4},{"x":6,"y":-2,"s":3},{"x":6,"y":1,"s":3},{"x":6,"y":4,"s":3},{"x":6,"y":7,"s":3},{"x":7,"y":-5,"s":4},{"x":7,"y":-2,"s":3},{"x":7,"y":1,"s":3},{"x":7,"y":4,"s":3},{"x":7,"y":7,"s":3},{"x":8,"y":-5,"s":4},{"x":8,"y":-2,"s":3},{"x":8,"y":1,"s":3},{"x":8,"y":4,"s":3},{"x":8,"y":7,"s":3},{"x":9,"y":-5,"s":4},{"x":9,"y":-4,"s":5},{"x":9,"y":-3,"s":5},{"x":9,"y":-2,"s":5},{"x":9,"y":-1,"s":5},{"x":9,"y":0,"s":5},{"x":9,"y":1,"s":5},{"x":9,"y":2,"s":5},{"x":9,"y":3,"s":5},{"x":9,"y":4,"s":5},{"x":9,"y":5,"s":5},{"x":9,"y":6,"s":5},{"x":9,"y":7,"s":5}],
		writeManualTape:[{"x":-7,"y":-4,"s":17},{"x":-6,"y":-4,"s":17},{"x":-5,"y":-4,"s":17},{"x":-5,"y":-3,"s":17},{"x":-4,"y":-3,"s":17},{"x":-4,"y":-2,"s":17},{"x":-3,"y":-2,"s":17},{"x":-3,"y":-1,"s":17},{"x":-2,"y":-1,"s":17},{"x":-1,"y":-1,"s":17},{"x":-1,"y":0,"s":17},{"x":-1,"y":1,"s":17},{"x":0,"y":1,"s":17},{"x":0,"y":2,"s":17},{"x":1,"y":-6,"s":17},{"x":1,"y":-5,"s":17},{"x":1,"y":-4,"s":17},{"x":1,"y":-3,"s":17},{"x":1,"y":-2,"s":17},{"x":1,"y":2,"s":17},{"x":2,"y":-6,"s":17},{"x":2,"y":-2,"s":17},{"x":2,"y":-1,"s":17},{"x":2,"y":2,"s":17},{"x":3,"y":-6,"s":17},{"x":3,"y":-4,"s":17},{"x":3,"y":-1,"s":17},{"x":3,"y":2,"s":17},{"x":4,"y":-6,"s":17},{"x":4,"y":-4,"s":17},{"x":4,"y":-2,"s":17},{"x":4,"y":-1,"s":17},{"x":4,"y":1,"s":17},{"x":4,"y":2,"s":17},{"x":5,"y":-6,"s":17},{"x":5,"y":-4,"s":17},{"x":5,"y":-3,"s":17},{"x":5,"y":-2,"s":17},{"x":5,"y":1,"s":17},{"x":6,"y":-6,"s":17},{"x":6,"y":1,"s":17},{"x":7,"y":-6,"s":17},{"x":7,"y":-5,"s":17},{"x":7,"y":0,"s":17},{"x":7,"y":1,"s":17},{"x":8,"y":-5,"s":17},{"x":8,"y":-4,"s":17},{"x":8,"y":-3,"s":17},{"x":8,"y":-2,"s":17},{"x":8,"y":-1,"s":17},{"x":8,"y":0,"s":17}],
		writeManualTapeSolution:[{"x":-7,"y":-4,"s":17},{"x":-6,"y":-4,"s":17},{"x":-5,"y":-4,"s":17},{"x":-5,"y":-3,"s":17},{"x":-4,"y":-3,"s":17},{"x":-4,"y":-2,"s":17},{"x":-3,"y":-2,"s":17},{"x":-3,"y":-1,"s":17},{"x":-2,"y":-1,"s":17},{"x":-1,"y":-1,"s":17},{"x":-1,"y":0,"s":17},{"x":-1,"y":1,"s":17},{"x":0,"y":1,"s":17},{"x":0,"y":2,"s":17},{"x":1,"y":-6,"s":17},{"x":1,"y":-5,"s":17},{"x":1,"y":-4,"s":17},{"x":1,"y":-3,"s":17},{"x":1,"y":-2,"s":17},{"x":1,"y":2,"s":17},{"x":2,"y":-6,"s":17},{"x":2,"y":-2,"s":17},{"x":2,"y":-1,"s":17},{"x":2,"y":2,"s":17},{"x":3,"y":-6,"s":17},{"x":3,"y":-4,"s":17},{"x":3,"y":-1,"s":17},{"x":3,"y":2,"s":17},{"x":4,"y":-6,"s":17},{"x":4,"y":-4,"s":17},{"x":4,"y":-2,"s":17},{"x":4,"y":-1,"s":17},{"x":4,"y":1,"s":17},{"x":4,"y":2,"s":17},{"x":5,"y":-6,"s":17},{"x":5,"y":-4,"s":17},{"x":5,"y":-3,"s":17},{"x":5,"y":-2,"s":17},{"x":5,"y":1,"s":17},{"x":6,"y":-6,"s":17},{"x":6,"y":1,"s":17},{"x":7,"y":-6,"s":17},{"x":7,"y":-5,"s":17},{"x":7,"y":0,"s":17},{"x":7,"y":1,"s":17},{"x":8,"y":-5,"s":17},{"x":8,"y":-4,"s":17},{"x":8,"y":-3,"s":17},{"x":8,"y":-2,"s":17},{"x":8,"y":-1,"s":17},{"x":8,"y":0,"s":17}],
		cursorInstruction:{x:-7,y:-2},
		cursorTape:{x:-7,y:-4},
		authorizerInstruction:{
			defaultValue:true,
			exceptions:[],
			cursorCtrl:true
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			tapeEquals:[{"x":-7,"y":-4,"s":16},{"x":-6,"y":-4,"s":16},{"x":-5,"y":-4,"s":16},{"x":-5,"y":-3,"s":16},{"x":-4,"y":-3,"s":16},{"x":-4,"y":-2,"s":16},{"x":-3,"y":-2,"s":16},{"x":-3,"y":-1,"s":16},{"x":-2,"y":-1,"s":16},{"x":-1,"y":-1,"s":16},{"x":-1,"y":0,"s":16},{"x":-1,"y":1,"s":16},{"x":0,"y":1,"s":16},{"x":0,"y":2,"s":16},{"x":1,"y":-6,"s":16},{"x":1,"y":-5,"s":16},{"x":1,"y":-4,"s":16},{"x":1,"y":-3,"s":16},{"x":1,"y":-2,"s":16},{"x":1,"y":2,"s":16},{"x":2,"y":-6,"s":16},{"x":2,"y":-2,"s":16},{"x":2,"y":-1,"s":16},{"x":2,"y":2,"s":16},{"x":3,"y":-6,"s":16},{"x":3,"y":-4,"s":16},{"x":3,"y":-1,"s":16},{"x":3,"y":2,"s":16},{"x":4,"y":-6,"s":16},{"x":4,"y":-4,"s":16},{"x":4,"y":-2,"s":16},{"x":4,"y":-1,"s":16},{"x":4,"y":1,"s":16},{"x":4,"y":2,"s":16},{"x":5,"y":-6,"s":16},{"x":5,"y":-4,"s":16},{"x":5,"y":-3,"s":16},{"x":5,"y":-2,"s":16},{"x":5,"y":1,"s":16},{"x":6,"y":-6,"s":16},{"x":6,"y":1,"s":16},{"x":7,"y":-6,"s":16},{"x":7,"y":-5,"s":16},{"x":7,"y":0,"s":16},{"x":7,"y":1,"s":16},{"x":8,"y":-5,"s":16},{"x":8,"y":-4,"s":16},{"x":8,"y":-3,"s":16},{"x":8,"y":-2,"s":16},{"x":8,"y":-1,"s":16},{"x":8,"y":0,"s":16}],
		},
	
	},
	
	
	{
		description:{
			
		},
		writeManualInstruction:[],
		writeManualInstructionSolution:[{"x":-7,"y":-3,"s":6},{"x":-7,"y":-2,"s":3},{"x":-6,"y":-3,"s":4},{"x":-6,"y":-2,"s":12},{"x":-5,"y":-3,"s":4},{"x":-5,"y":-2,"s":9},{"x":-5,"y":-1,"s":5},{"x":-4,"y":-3,"s":4},{"x":-4,"y":-2,"s":2},{"x":-4,"y":-1,"s":4},{"x":-3,"y":-3,"s":4},{"x":-2,"y":-3,"s":4},{"x":-2,"y":-2,"s":10},{"x":-1,"y":-3,"s":4},{"x":-1,"y":-2,"s":2},{"x":0,"y":-3,"s":4},{"x":0,"y":-2,"s":17},{"x":1,"y":-3,"s":4},{"x":1,"y":-2,"s":1},{"x":2,"y":-3,"s":4},{"x":3,"y":-3,"s":4},{"x":3,"y":-2,"s":10},{"x":3,"y":-1,"s":5},{"x":4,"y":-3,"s":4},{"x":4,"y":-2,"s":2},{"x":4,"y":-1,"s":4},{"x":5,"y":-3,"s":4},{"x":5,"y":-2,"s":16},{"x":6,"y":-3,"s":4},{"x":6,"y":-2,"s":11},{"x":7,"y":-3,"s":4},{"x":7,"y":-2,"s":9},{"x":7,"y":-1,"s":5},{"x":8,"y":-3,"s":4},{"x":8,"y":-2,"s":2},{"x":8,"y":-1,"s":4},{"x":9,"y":-3,"s":4},{"x":10,"y":-3,"s":4},{"x":10,"y":-2,"s":1},{"x":11,"y":-3,"s":4},{"x":11,"y":-2,"s":17},{"x":12,"y":-3,"s":4},{"x":12,"y":-2,"s":10},{"x":12,"y":-1,"s":5},{"x":13,"y":-3,"s":4},{"x":13,"y":-2,"s":2},{"x":13,"y":-1,"s":4},{"x":14,"y":-3,"s":4},{"x":14,"y":-2,"s":16},{"x":15,"y":-3,"s":4},{"x":15,"y":-2,"s":5}],
		writeManualTape:[{"x":-7,"y":-2,"s":16},{"x":-7,"y":-1,"s":16},{"x":-6,"y":-2,"s":17},{"x":-6,"y":-1,"s":17},{"x":-5,"y":-2,"s":17},{"x":-5,"y":-1,"s":17},{"x":-4,"y":-2,"s":17},{"x":-4,"y":-1,"s":17},{"x":-3,"y":-2,"s":17},{"x":-3,"y":-1,"s":17},{"x":-2,"y":-2,"s":17},{"x":-2,"y":-1,"s":17},{"x":-1,"y":-2,"s":17},{"x":0,"y":-2,"s":17}],
		writeManualTapeSolution:[{"x":-7,"y":-2,"s":16},{"x":-7,"y":-1,"s":16},{"x":-6,"y":-2,"s":17},{"x":-6,"y":-1,"s":17},{"x":-5,"y":-2,"s":17},{"x":-5,"y":-1,"s":17},{"x":-4,"y":-2,"s":17},{"x":-4,"y":-1,"s":17},{"x":-3,"y":-2,"s":17},{"x":-3,"y":-1,"s":17},{"x":-2,"y":-2,"s":17},{"x":-2,"y":-1,"s":17},{"x":-1,"y":-2,"s":17},{"x":0,"y":-2,"s":17}],
		cursorInstruction:{x:-7,y:-2},
		cursorTape:{x:-7,y:-2},
		authorizerInstruction:{
			defaultValue:true,
			exceptions:[],
			cursorCtrl:true
		},
		authorizerTape:{
			defaultValue:false,
			exceptions:[],
			cursorCtrl:false
		},
		winTest:{
			tapeEquals:[{"x":-7,"y":-2,"s":16},{"x":-7,"y":-1,"s":16},{"x":-6,"y":-2,"s":17},{"x":-5,"y":-2,"s":17},{"x":-4,"y":-2,"s":17},{"x":-3,"y":-2,"s":17},{"x":-2,"y":-2,"s":17},{"x":-1,"y":-2,"s":17},{"x":0,"y":-2,"s":17},{"x":1,"y":-2,"s":17},{"x":2,"y":-2,"s":17},{"x":3,"y":-2,"s":17},{"x":4,"y":-2,"s":17},{"x":5,"y":-2,"s":17}],
		},
	
	},
];