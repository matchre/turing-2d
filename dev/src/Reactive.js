
var MapReactiveRenderer = function(){};
MapReactiveRenderer.prototype._renderStrategy=MapChunkRenderer;
extend( MapReactiveRenderer , MapReactiveRenderer.prototype._renderStrategy.prototype );
extend( MapReactiveRenderer , {
	eventLayer:null,
	initWithDimension:function(d,container,eventLayer,popUpLayer){
		this._renderStrategy.prototype.initWithDimension.call(this,d,container);
		
		this.eventLayer=eventLayer;
		this.popUpLayer=popUpLayer;
		
		this.initInteraction();
	},
	cycle:function( dt ){
		
		this._renderStrategy.prototype.cycle.call( this , dt );
	},
	initInteraction : function(  ){
	
	var self=this;
	
	// e an event
	var getCel=function(e){
		var ts=self.getTileSize();
		var offset=self.eventLayer.offset();
		//e.pageX-offset.left = offsetX, but this property is not supported in ff
		return cel = { 
			x : Math.floor( (e.pageX-offset.left) / ts - self.getOrigin().x ),
			y : Math.floor( (e.pageY-offset.top ) / ts - self.getOrigin().y )
		};
	};
	
	//edit
	( function( mapD ){
		
		
		var defaultLbl=[
				'',
				'+',
				'o',
				'd',
				'q',
				'z',
				's',
				'qq',
				'dd',
				'D',
				'Q',
				'Z',
				'S',
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7'
		];
		var convert={
			'o' 	: CEL_CHECK,
			''   	: CEL_EMPTY,
			'+' 	: CEL_WRITE,
			'q'  	: CEL_LEFT,
			'qq' 	: CEL_DLEFT,
			'z' 	: CEL_TOP,
			's' 	: CEL_BOT,
			'd' 	: CEL_RIGHT,
			'dd'	: CEL_DRIGHT,
			'Q'		: CEL_TLEFT,
			'D'		: CEL_TRIGHT,
			'Z'		: CEL_TTOP,
			'S'		: CEL_TBOT,
			'1'		: 13,
			'2'		: 14,
			'3'		: 15,
			'4'		: 16,
			'5'		: 17,
			'6'		: 18,
			'7'		: 19,
		};
		
		var popUp=(function(){
			
			var el=$('<div>')
			.css({'position':'absolute'})
			.addClass('selector-popUp popUp')
			.bind('mousedown',function(e){e.stopPropagation();});
			
			var listeContainer = $("<div>")
			.css( { "height" : "inherit" , "width" : "inherit" , "overflow-y" : "auto" , "position" : "absolute" } )
			.appendTo(el);
			
			var liste = $("<div>").css({ "position" : "absolute" , "white-space" : "nowrap" })
			.addClass("liste")
			.appendTo(listeContainer);
			
			var separation=[3,9,13,20];
			var i=0;
			for( var k=0;k<separation.length;k++){
				var column = $('<div>')
				.css({'display':'inline-block','vertical-align':'top'})
				.appendTo(liste);
				for( ; i < separation[k] ; i ++ ){
				
					var item = $("<div>")
					.addClass( "item" )
					.data( "symbol" , i )
					.appendTo(column);
					
					$('<div>')
					.addClass( "tile symbol-"+i )
					.css({'display':'inline-block'})
					.appendTo(item);
					
					$('<span>')
					.addClass('label')
					.wrapInner(defaultLbl[i+""])
					.appendTo(item);
				}
			}
			
			return el;
		})();
		
		var anchorM = {x:0 , y:0},
			timeStamp = 0,
			clickOn = false;
		var finishSimpleEdit=function(){
			mapD.popUpLayer.removeClass('active');
			popUp.find('.item').unbind('click');
			popUp.detach();
			editedCel=null;
			$('body').unbind( 'mousedown' , finishSimpleEdit );
		}
		var startEdit = function( e ){
			var ts=mapD.getTileSize(),
				o=mapD.getOrigin(),
				offset=mapD.eventLayer.position(),
				cell=getCel(e);
			var x= (cel.x+o.x)*ts + offset.left,
				y= (cel.y+o.y)*ts + offset.top;
			
			popUp.appendTo(mapD.popUpLayer)
			.css({'top':y+'px','left':(x+ts+25)+'px'});
			
			popUp.find('.label').css({'display':'none'});
			
			popUp.find('.item').unbind('click').bind('click',function(e){
				var item=$(e.target);
				if(!item.is('.item'))
					item=item.parents('.item');
				cmd.mgr.execute( cmd.writeMap.create( mapD._datamap , {x:editedCel.x,y:editedCel.y} , item.data('symbol') ) );
				finishSimpleEdit();
			});
			$('body').bind( 'mousedown' , finishSimpleEdit );
			editedCel=cel;
			mapD.popUpLayer.addClass('active');
		};
		
		var opac=$('<div>')
		.bind('mousedown',function(e){e.stopPropagation();})
		.css({'background-size':'cover','background-color':'rgba(255,255,255,0.5)'})
		.css({'position':'absolute','z-index':-1});
		
		var input=$('<input type="text">')
		.bind('mousedown',function(e){e.stopPropagation();})
		.unbind('keydown')
		.css({'background-size':'cover' , 'text-align':'center'})
		.css({'position':'absolute'});
		var editedCel;
		
		var rawEdit=function(cel){
			var ts=mapD.getTileSize(),
				o=mapD.getOrigin(),
				offset=mapD.eventLayer.position();
			var x= (cel.x+o.x)*ts + offset.left,
				y= (cel.y+o.y)*ts + offset.top;
			
			input.css({'top':y+'px','left':x+'px'})
			.width(ts).height(ts)
			.val( defaultLbl[mapD._datamap.read(cel.x,cel.y)] )
			.css({'font-size':(ts*0.5)+'px'})
			.data( 'cel' , cel )
			.appendTo(mapD.popUpLayer)
			.focusin();
			keyboardhandlerUp();
			
			opac.css({'top':y+'px','left':x+'px'})
			.width(ts).height(ts)
			.appendTo(mapD.popUpLayer);
			
			mapD.popUpLayer.addClass('active');
			
			popUp.appendTo(mapD.popUpLayer)
			.css({'top':y+'px','left':(x+ts+25)+'px'});
			
			popUp.find('.label').css({'display':'inline-block'});
			
			popUp.find('.item').unbind('click').bind('click',function(e){
				var item=$(e.target);
				if(!item.is('.item'))
					item=item.parents('.item');
				cmd.mgr.execute( cmd.writeMap.create( mapD._datamap , {x:editedCel.x,y:editedCel.y} , item.data('symbol') ) );
				finishNoSave();
			});
			input.focus().focusin();
			
			editedCel=cel;
		};
		var saveFromInput=function(){
			if( editedCel != null ){
				var symbol=convert[input.val().trim()];
				if( symbol != null )
					cmd.mgr.execute( cmd.writeMap.create( mapD._datamap , {x:editedCel.x,y:editedCel.y} , symbol ) );
			}
			editedCel=null;
		};
		var keyboardhandlerDown=function(e){
			switch( e.which ){
				case 13:		//enter
					var nextCel={x:editedCel.x,y:editedCel.y};
					switch(convert[input.val().trim()]){
						case CEL_TOP : nextCel.y--; break;
						case CEL_BOT : nextCel.y++; break;
						case CEL_LEFT : nextCel.x--; break;
						case CEL_DLEFT : nextCel.x-=2; break;
						case CEL_DRIGHT : nextCel.x+=2; break;
						default : nextCel.x++; break;
					}
					saveFromInput();
					rawEdit(nextCel);
				break;
				case 37:	//left
					rawEdit({x:editedCel.x-1,y:editedCel.y});
				break;
				case 38:	//top
					rawEdit({x:editedCel.x,y:editedCel.y-1});
				break;
				case 39:	//right
					rawEdit({x:editedCel.x+1,y:editedCel.y});
				break;
				case 40:	//bot
					rawEdit({x:editedCel.x,y:editedCel.y+1});
				break;
			};
		};
		var keyboardhandlerUp=function(e){
			var symbol=convert[input.val().trim()]||'';
			input.removeClass().addClass('symbol-'+symbol);
		};
		var finishNoSave=function(){
			input.data( 'cel' , null )
			.val('')
			.detach();
			opac.detach();
			mapD.popUpLayer.removeClass('active');
			editedCel=null;
			mapD.popUpLayer.unbind( 'keydown' , keyboardhandlerDown );
			mapD.popUpLayer.unbind( 'keydown' , keyboardhandlerUp );
			$('body').unbind( 'mousedown' , finishNoSave );
			popUp.find('.item').unbind('click');
			popUp.detach();
		}
		var finishSave=function(){
			saveFromInput();
			finishNoSave();
		};
		var startRawEdit=function(e){
			rawEdit( getCel( e ) );
			mapD.popUpLayer.unbind( 'keydown' , keyboardhandlerDown ).bind( 'keydown' , keyboardhandlerDown );
			mapD.popUpLayer.unbind( 'keyup' , keyboardhandlerUp ).bind( 'keyup' , keyboardhandlerUp );
			$('body').unbind( 'mousedown' , finishNoSave ).bind( 'mousedown' , finishNoSave );
		};
		
		var makeMeEditeable = function( enable  ){
			
			mapD.eventLayer.unbind('dblclick', startRawEdit );
			//mapD.eventLayer.bind('click', startEdit );
			//mapD.eventLayer.unbind( 'mousedown' , startEdit );
			//mapD.eventLayer.unbind( 'mouseup' , stopEdit );
			if( enable )
			{
				//mapD.eventLayer.bind( 'click' , startEdit );
				//mapD.eventLayer.bind( 'mousedown' , startEdit );
				//mapD.eventLayer.bind( 'mouseup' , stopEdit );
				mapD.eventLayer.bind('dblclick', startRawEdit );
			}
			
			return mapD;
		};

		mapD.editable = makeMeEditeable;

	} )( this );
	
	//move
	( function( mapD  ){

		var anchorM = { x : 0 , y : 0 },
			anchorD = { x : 0 , y : 0 },
			drag = false;
			
		
		var startMove = function( e ){
			drag = true;
				
			anchorD.x = mapD.getOrigin().x;
			anchorD.y = mapD.getOrigin().y;
				
			anchorM.x = e.clientX;
			anchorM.y = e.clientY;
		};
		var move = function( e ){
			if( !drag )
				return;
					
			var dx = e.clientX - anchorM.x,
				dy = e.clientY - anchorM.y;
				
			mapD.setOrigin( anchorD.x + dx / mapD.getTileSize() , anchorD.y + dy / mapD.getTileSize() );
			mapD.update( );
				
		};
		var stopMove = function( e ){
			if( drag )
				drag = false;
		};

		var makeMeMovable = function( enable  ){
			if( !mapD.eventLayer )
				throw "event layer not defined";
			mapD.eventLayer.unbind( 'mousedown' , startMove );
			mapD.eventLayer.unbind( 'mousemove' , move );
			$("body").unbind( 'mouseup' , stopMove );
			
			if( enable )
			{
				mapD.eventLayer.bind( 'mousedown' , startMove );
				mapD.eventLayer.bind( 'mousemove' , move );
				$("body").bind( 'mouseup' , stopMove );
			}
			
			return mapD;
		};

		mapD.movable = makeMeMovable;

	} )( this  );
	
	//pathTracable
	( function( mapD ){

		var anchorM = { x : 0 , y : 0 },
			anchorD = { x : 0 , y : 0 },
			drag = false,
			path = [];
		var DOMtiles=[];
		
		var addCelToPath = function( a ){
			//search for previous tile
			for( var i = path.length -1 ; i >=0 ; i -- )
				if( a.x == path[ i ].x && a.y == path[ i ].y )
					path.splice( i , path.length  );
			path.push( {x:a.x , y:a.y} );
		};
		// call the function given in arg on each cel of the path with ( s : the symbol of the cel that will be drawn (null is the path is not tracable) , {x,y} the cel )
		var iteratePath = function( callBack ){
			var s;
			var error = false;
			for( var i = 0 ; i < path.length-1 ; i ++ ){
					
					if( error )
						s = -1;
					else
					if( mapD.getDatamap().read( path[ i ].x , path[ i ].y ) != CEL_EMPTY ){
						if( i > 0 && mapD.getDatamap().read( path[ i - 1 ].x , path[ i - 1 ].y ) != CEL_EMPTY ){
							s = -1;
							error = true;
						}else{
							if( mapD.getDatamap().read( path[ i + 1 ].x , path[ i + 1 ].y ) != CEL_EMPTY 
								|| path[ i + 1 ].y != path[ i ].y 
							){
								s = -1;
								error = true;
							}else
								s = null;
						}
					}else
					if( path[ i ].x == path[ i +1 ].x && path[ i ].y == path[ i +1 ].y +1 )
						s = CEL_TOP;
					else
					if( path[ i ].x == path[ i +1 ].x && path[ i ].y == path[ i +1 ].y -1 )
						s = CEL_BOT;
					else
					if( path[ i ].x == path[ i +1 ].x -1 && path[ i ].y == path[ i +1 ].y ){
						if( i < path.length-2 && mapD.getDatamap().read( path[ i + 1 ].x , path[ i + 1 ].y ) != CEL_EMPTY )
							s = CEL_DRIGHT;
						else
							s = CEL_RIGHT;
					}else
					if( path[ i ].x == path[ i +1 ].x +1 && path[ i ].y == path[ i +1 ].y ){
						if( i < path.length-2 && mapD.getDatamap().read( path[ i + 1 ].x , path[ i + 1 ].y ) != CEL_EMPTY )
							s = CEL_DLEFT;
						else
							s = CEL_LEFT;
					}
					callBack.f.call( callBack.o , s , path[ i ] );
			}
			callBack.f.call( callBack.o , error ? -1 : null , path[ i ] );
		};
		
		var startRoute = function( e ){
			drag = true;
				
			var cel = getCel(e);
			
			path = [ cel ];
		};
		var moveRoute = function( e ){
			if( !drag )
				return;
				
			var ts=self.getTileSize();
			var offset=mapD.eventLayer.offset();
			
			var c = {
				x : (e.pageX-offset.left) / ts - self.getOrigin().x ,
				y : (e.pageY-offset.top) / ts - self.getOrigin().y 
			};
			
			var cel = { 
				x : Math.floor( c.x ),
				y : Math.floor( c.y )
			};
			
			if( Math.abs( (c.x%1+1)%1 - 0.5 ) < 0.4 && Math.abs( (c.y%1+1)%1 - 0.5 ) < 0.4 && ( cel.x != path[ path.length -1 ].x || cel.y != path[ path.length -1 ].y ) ){
			
				var a = { x : path[ path.length -1 ].x , y :  path[ path.length -1 ].y };
				
				for( ; a.x != cel.x ; a.x += ( ( cel.x < a.x ) ? -1 : 1 ) )
					addCelToPath( a );
				
				for( ; a.y != cel.y ; a.y += ( ( cel.y < a.y ) ? -1 : 1 ) )
					addCelToPath( a );
				
				addCelToPath( cel );
				
				var i=0;
				iteratePath( { f : function( s , cel ){
				
					var xScreen = (mapD._origin.x + cel.x)*ts,
						yScreen = (mapD._origin.y + cel.y)*ts;
					
					if(DOMtiles[i]==null){
						DOMtiles[i]=$('<div>')
						.css({'position':'absolute'})
						.width(ts).height(ts)
						.appendTo(mapD._container);
						
						$('<div>').width(ts).height(ts).appendTo(DOMtiles[i]);
					}
					
					DOMtiles[i].css({'left':xScreen+'px','top':yScreen+'px'})
					.removeClass().addClass('tile');
					if(s!=null&&s>0)
						DOMtiles[i].addClass('symbol-'+s);
					
					DOMtiles[i].children('div').removeClass().addClass( (s==null||s!=-1)?'path-valid':'path-invalid' );
					
					i++;
					
				} , o : this } );
				
				for(;i<DOMtiles.length;i++){
					if( DOMtiles[i]!=null )
						DOMtiles[i].remove();
					DOMtiles[i]=null;
					delete DOMtiles[i];
				}
			}
		
		};
		var stopRoute = function( e ){
			if( !drag )
				return;
				
			drag = false;
			
			var cmds = [];
			
			iteratePath( { f : function( s , cel ){
					
					if( s && s > 0 )
						cmds.push( cmd.writeMap.create( mapD.getDatamap() , cel , s  ) );
				
				} , o : this } );
			
			if( cmds.length > 0 )
				cmd.mgr.execute( cmd.multi.createWithTab( cmds ) );
			
			for(var i=0;i<DOMtiles.length;i++){
				if( DOMtiles[i]!=null )
					DOMtiles[i].remove();
				DOMtiles[i]=null;
				delete DOMtiles[i];
			}
			
		};

		var makeMePathTracable = function( enable  ){
			
			mapD.eventLayer.unbind( 'mousedown' , startRoute );
			mapD.eventLayer.unbind( 'mousemove' , moveRoute );
			$("body").unbind( 'mouseup' , stopRoute );
			if( enable )
			{
				mapD.eventLayer.bind( 'mousedown' , startRoute );
				mapD.eventLayer.bind( 'mousemove' , moveRoute );
				$("body").bind( 'mouseup' , stopRoute );
			}
			return mapD;
		};

		mapD.pathTracable = makeMePathTracable;

	} )( this );
	
	//erasable
	( function( mapD ){

		var anchorM = { x : 0 , y : 0 },
			anchorD = { x : 0 , y : 0 },
			drag = false;
		var DOMtiles=[];	
		
		var startRoute = function( e ){
			drag = true;
			anchorD = getCel(e);
		};
		var moveRoute = function( e ){
			if( !drag )
				return;
			
			var ts=self.getTileSize();
			var offset=mapD.eventLayer.offset();
			
			var c = {
				x : (e.pageX-offset.left) / ts - self.getOrigin().x ,
				y : (e.pageY-offset.top) / ts - self.getOrigin().y 
			};
			
			var cel={x:Math.floor(c.x),y:Math.floor(c.y)};
			
			if( Math.abs( (c.x%1+1)%1 - 0.5 ) < 0.5 && Math.abs( (c.y%1+1)%1 - 0.5 ) < 0.5 && ( anchorM.x != cel.x || anchorM.y != cel.y ) ){
				
				anchorM = cel;
				var i=0;
				for(var x = Math.min( anchorM.x , anchorD.x ) ; x <= Math.max( anchorM.x , anchorD.x ) ; x++ )
				for(var y = Math.min( anchorM.y , anchorD.y ) ; y <= Math.max( anchorM.y , anchorD.y ) ; y++ )
				{
					
					
					var xScreen = (mapD._origin.x + x)*ts,
						yScreen = (mapD._origin.y + y)*ts;
					
					if(DOMtiles[i]==null){
						DOMtiles[i]=$('<div>')
						.css({'position':'absolute'})
						.addClass( 'path-invalid' )
						.width(ts).height(ts)
						.appendTo(mapD._container);
					}
					
					DOMtiles[i].css({'left':xScreen+'px','top':yScreen+'px'})
					
					i++;
				}
				for(;i<DOMtiles.length;i++){
					if( DOMtiles[i]!=null )
						DOMtiles[i].remove();
					DOMtiles[i]=null;
					delete DOMtiles[i];
				}
			}
		
		};
		var stopRoute = function( e ){
			if( !drag )
				return;
				
			drag = false;
			
			var cmds = [];
			
			for(var x = Math.min( anchorM.x , anchorD.x ) ; x <= Math.max( anchorM.x , anchorD.x ) ; x++ )
			for(var y = Math.min( anchorM.y , anchorD.y ) ; y <= Math.max( anchorM.y , anchorD.y ) ; y++ )
			{
					
				cmds.push( cmd.writeMap.create( mapD.getDatamap() , {x:x,y:y} , CEL_EMPTY  ) );
			
			}
			
			if( cmds.length > 0 )
				cmd.mgr.execute( cmd.multi.createWithTab( cmds  ) );
			
			for(var i=0;i<DOMtiles.length;i++){
				if( DOMtiles[i]!=null )
					DOMtiles[i].remove();
				DOMtiles[i]=null;
				delete DOMtiles[i];
			}
		};

		var makeMeErasable = function( enable  ){
			mapD.eventLayer.unbind( 'mousedown' , startRoute );
			mapD.eventLayer.unbind( 'mousemove' , moveRoute );
			$("body").unbind( 'mouseup' , stopRoute );
			if( enable )
			{
				mapD.eventLayer.bind( 'mousedown' , startRoute );
				mapD.eventLayer.bind( 'mousemove' , moveRoute );
				$("body").bind( 'mouseup' , stopRoute );
			}
			return mapD;
		};

		mapD.erasable = makeMeErasable;

	} )( this );
	
	},
	getEventLayer:function(){
		return this.eventLayer;
	},
	movable:function(enable){return this},
	editable:function(enable){return this},
	pathTracable:function(enable){return this},
	erasable:function(enable){return this},
});
MapReactiveRenderer.createWithDimension=function(datamap,container,eventLayer,popUpLayer){
	var m=new MapReactiveRenderer();
	m.initWithDimension(datamap,container,eventLayer,popUpLayer);
	return m;
}

var AnimatedCursor = function(){};
extend( AnimatedCursor , {
	animLayer:null,
	element:null,
	eventLayer:null,
	_zoomCtx:null,
	_loupEventLayer:null,
	_loup:null,
	
	_map:null,
	_targetPos:null,
	_currentPos:null,
	_cursorPosfn:null,
	
	_loupW:null,
	_loupEventW:null,
	
	_drag:false,
	init:function(cursorPosfn,map,container,containerEvent){
		
		
		this._map=map;
		this._cursorPosfn=cursorPosfn;
		this._currentPos={x:0,y:0};
		this._targetPos={x:0,y:0};
		
		this._loupEventLayer=$('<div>')
		.css({'position':'absolute'})
		.appendTo( containerEvent );
		
		this._loup=$('<div>')
		.css({'position':'absolute'})
		.appendTo( container );
		
		this.eventLayer=containerEvent;
		this._buildLoup( 50 );
		
		
		this.initInteraction();
	},
	cycle:function(dt){
		this._checkTarget();
		this.move(dt);
	},
	move:function(dt){
		var dx=(this._targetPos.x-this._currentPos.x),
			dy=(this._targetPos.y-this._currentPos.y);
		
		var l=Math.sqrt( dx*dx + dy*dy );
		
		if( l<0.01 )
			return;
		
		var pas = Math.min( l , Math.max( 0.7  , l/500  ) * dt );
		
		this._currentPos.x+=dx/l*pas;
		this._currentPos.y+=dy/l*pas;
		
		this._loup.css({'top':(this._currentPos.y-this._loupW)+'px','left':(this._currentPos.x-this._loupW)+'px'});
		this._loupEventLayer.css({'top':(this._currentPos.y-this._loupEventW)+'px','left':(this._currentPos.x-this._loupEventW)+'px'});
	},
	movable:function(enable){return this;},
	initInteraction:function(){
		
		MapReactiveRenderer.prototype.initInteraction.call( this );
		
		//movable
		(function(scope){
			
			var drag=false;
			
			var anchorPage = {x:0,y:0};
				
			
			var posStartToGrid={x:0,y:0};
			var posStart={x:0,y:0};
			
			scope._map.getDatamap();
			
			var start=function(e){
				console.log(e);
				drag=true;
				scope._drag=true;
				
				var o=scope._map.getOrigin(),
					ts=scope._map.getTileSize();
				
				
				posStartToGrid.x = Math.round( scope._currentPos.x / ts - o.x -0.5 );
				posStartToGrid.y = Math.round( scope._currentPos.y / ts - o.y -0.5 );
				
				posStart.x=scope._currentPos.x;
				posStart.y=scope._currentPos.y;
				
				anchorPage.x=e.pageX;
				anchorPage.y=e.pageY;
				
				e.stopPropagation();
			};
			var move=function(e){
				if( drag ){
					
					var o=scope._map.getOrigin(),
						ts=scope._map.getTileSize();
					
					var cx=e.pageX-anchorPage.x+posStart.x,
						cy=e.pageY-anchorPage.y+posStart.y;
					
					var cgx = cx/ts - o.x ,
						cgy = cy/ts - o.y ;
					
					if( Math.abs( Math.round( cgx ) - cgx )  < 0.25 && Math.abs( Math.round( cgy ) - cgy )  < 0.25 ){
						cgx = Math.round( cgx );
						cgy = Math.round( cgy );
					}
					
					scope._targetPos.x=cx;
					scope._targetPos.y=cy;
					
					/*
					scope._targetPos.x=(cgx+0.5+o.x)*ts;
					scope._targetPos.y=(cgy+0.5+o.y)*ts;
					*/
					e.stopPropagation();
				}
			};
			var stop=function(e){
				if( drag ){
				
					var o=scope._map.getOrigin(),
						ts=scope._map.getTileSize();
						
					var cx=e.pageX-anchorPage.x+posStart.x,
						cy=e.pageY-anchorPage.y+posStart.y;
						
					var cgx = Math.round( cx/ts - o.x ),
						cgy = Math.round( cy/ts - o.y );
					
					var one = (scope._cursorPosfn.f==scope._cursorPosfn.o.getCursorTape)?'tape':'instr'; 		//not so clean
					cmd.mgr.execute( cmd.moveCursor.create( one , scope._cursorPosfn.o , {x:cgx,y:cgy}  ) );
					
					drag = false;
					scope._drag=false;
				}
			};
			
			var makeMeMovable=function(enable){
				if( !scope.eventLayer )
					throw "event layer not defined";
				scope._loupEventLayer.unbind( 'mousedown' , start );
				scope.eventLayer.unbind( 'mousemove' , move );
				$("body").unbind( 'mouseup' , stop );
				
				if( enable )
				{
					scope._loupEventLayer.bind( 'mousedown' , start );
					scope.eventLayer.bind( 'mousemove' , move );
					$("body").bind( 'mouseup' , stop );
				}
				return scope;
			};
			
			scope.movable=makeMeMovable;
			
		})(this);
	
	},
	_buildLoup:function(w){
		
		this._loup
		.width( w ).height( w ).attr('width' , w ).attr( 'height' , w );
		
		var cadre=$('<canvas>')
		.width( w ).height( w ).attr('width' , w ).attr( 'height' , w );
		// draw the loupe
		(function( context , w ){
			context.beginPath();
			context.arc( w*0.5 , w*0.5 , w*0.455 , 0 , Math.PI*2 );
			context.lineWidth = w*0.1;
			context.strokeStyle = "#ABCD20";
			context.stroke();
		})( cadre[0].getContext( "2d" ) , w );
		
		var flare=$('<canvas>')
		.width( w ).height( w ).attr('width' , w ).attr( 'height' , w );
		// draw the loupe flare
		(function( context , w ){
			
			var lw = w,
				lh = w;
			
			context.save();
		
			context.beginPath();
			context.arc( lw / 2  , lh / 2 , w*0.5 , 0 , Math.PI*2 );
			context.clip();
			
			
			context.beginPath();
			context.moveTo( lw*0.2 , lh * 0.8 );
			context.quadraticCurveTo( 	lw*0.2 , lh * 0.1 ,
										lw*1 , lh * 0.19 
								);		
			context.lineTo( lw , 0 );
			context.lineTo( 0 , 0 );
			context.lineTo( 0 , lh*0.6 );
			context.globalAlpha = 0.4;
			context.fillStyle = "#ddd";
			context.fill();
			
			
			context.beginPath();
			context.moveTo( lw*0.1 , lh * 0.6 );
			context.bezierCurveTo( 	lw*0.2 , lh * 0.3 ,
									lw*0.4 , lh * 0.3 ,
									lw*0.45 , lh * 0.25
								);		
			context.quadraticCurveTo( 	lw*0.6 , lh * 0.2 ,
										lw*0.5 , lh * 0 
									);				
			context.lineTo( 0 , 0 );
			context.lineTo( 0 , lh*0.6 );
			context.globalAlpha = 0.4;
			context.fillStyle = "#ddd";
			context.fill();
			
			
			context.restore();
		
		})( flare[0].getContext("2d") , w );
		
		var zoom=$('<canvas>')
		.width( w ).height( w ).attr('width' , w ).attr( 'height' , w );
		
		this._loupEventLayer
		.width( w ).height( w ).attr('width' , w ).attr( 'height' , w );
		
		this._loup.children().remove();
		
		zoom.css({'position':'absolute'}).appendTo(this._loup);
		flare.css({'position':'absolute'}).appendTo(this._loup);
		cadre.css({'position':'absolute'}).appendTo(this._loup);
		
		this._zoomCtx=zoom[0].getContext("2d");
		
		this._loupEventW=w*0.5;
		this._loupW=w*0.5;
	},
	_checkTarget:function(){
		if( this._drag )
			return;
		
		//compute the position of the cursor on the screen according to the engine and the map
		var c=this._cursorPosfn.f.call( this._cursorPosfn.o );
		this._targetPos.x= (this._map.getOrigin().x + c.x +0.5)*this._map.getTileSize();
		this._targetPos.y= (this._map.getOrigin().y + c.y +0.5)*this._map.getTileSize();
		
	},

});
AnimatedCursor.create=function(cursorPosfn,map,container,containerEvent){
	var m=new AnimatedCursor();
	m.init(cursorPosfn,map,container,containerEvent);
	return m;
}

var Scene = function(){};
Scene.prototype = {
	
	engine : null,
	
	_phyTape : null,
	_phyInstruc : null,
	
	_cursorTape:null,
	_cursorInst:null,
	
	element : null,
	
	initWithDim : function( width , height , engine ){
		
		
		// data
		this.engine = engine;
		
		this._initDOM( width , height );
		this.initInteraction();
		this.zoomable(true);
	},
	
	_initDOM : function( width , height ){
	
		
		/*
		 **** LAYER CHART ********
		 
		 top
		 
		 popUp Layer 
				- where the popUp are displayed,
				indeed the popUp disable the other event
		
		tools Layer
		
		
		event Layer for cursors
				- one square for each cursor.
				the curosr event are prior before the other event
				
		event Layer for tape
				- two zones, one for the tape, one for the instruct
				
		animation Layer
				- contains the cursors and the animations,
				Note that with this configuration, animation react letting the tape be clicked, without blocking the event
		
		tape Layer
				- two zones again,
				draw the tapes
		*/
		
		
		
		var element=$('<div>')
		.width(width).height(height);
		
		//map container
		var instrContainer=$('<div>').attr( 'id' , 'instructionLayer' )
		.css({'overflow-x':'hidden','overflow-y':'hidden'})
		.css({'position':'absolute','top':'0px'})
		.width( width ).height( height/2 ).attr( "width" , width ).attr( "height" , height/2 )
		.appendTo(element);
		
		var tapeContainer=$('<div>').attr( 'id' , 'tapeLayer' )
		.css({'overflow-x':'hidden','overflow-y':'hidden'})
		.css({'position':'absolute','top':(height/2)+'px'})
		.width( width ).height( height/2 ).attr( "width" , width ).attr( "height" , height/2 )
		.appendTo(element);
		
		//event container
		var instrEventlayer = $("<div>").attr( 'id' , 'instructionEventLayer' )
		.width(width).height(height/2)
		.css({'position':'absolute' , 'top':'0px'})
		.appendTo( element );
		
		var tapeEventlayer = $("<div>").attr( 'id' , 'tapeEventLayer' )
		.width(width).height(height/2)
		.css({'position':'absolute' , 'top':(height/2)+'px'})
		.appendTo( element );
		
		//popUpLayer
		var popUpLayer = $("<div>").attr( 'id' , 'popUpLayer' )
		.width(width).height(height)
		.css({'position':'absolute' , 'top':'0px'})
		.appendTo( element );
		
		///////
		// initiate elements
		this._phyTape = MapReactiveRenderer.createWithDimension( this.engine.getTape() , tapeContainer , tapeEventlayer , popUpLayer  );
		this._phyInstruc = MapReactiveRenderer.createWithDimension( this.engine.getIntruction() , instrContainer , instrEventlayer , popUpLayer );
		
		
		this._cursorInstr = AnimatedCursor.create( {o:this.engine,f:this.engine.getCursorInstr} , this._phyInstruc , instrContainer , instrEventlayer );
		this._cursorTape = AnimatedCursor.create( {o:this.engine,f:this.engine.getCursorTape} , this._phyTape , tapeContainer , tapeEventlayer );
		
		this.element=element;
	},
	
	_initPopUpMgr : function( element ){
		
		var topLayer = $("<div>").attr( 'id' , 'popUpLayer' );
		topLayer.css({'width':'inherit' , 'height':'inherit'});
		topLayer.css({'position':'absolute' , 'top':'0px'});
		
		
		var under = $("<div>");
		under.css({'width':'inherit' , 'height':'inherit'});
		under.css({'position':'absolute' , 'top':'0px'});
		under.css({'z-index':'-1'});
		
		
		under.mousedown( function( e ){
			var popUp;
			if( (popUp = topLayer.data("on") ) )
				popUp.close();
			else
				throw "popUpLayer on but popUp unreachable";
		});
		
		under.appendTo( topLayer );
		
		topLayer.appendTo( element );
		
		topLayer.css({'z-index':'-10'});
		
		this._popUpLayer = topLayer;
	
	},
	
	initInteraction:function(){
		
		var self=this;
		//zoomable
		( function( scope ){
			var zoomLvls=[10,25,40,60];
			var zoom=1;
			
			var handler=function(e){
				if(e.wheelDelta>0){
					if(zoom==zoomLvls.length-1)
						return;
					zoom++;
				}else{
					if(zoom==0)
						return;
					zoom--;
				}
				self._phyInstruc.setTileSize( zoomLvls[zoom] );
				self._phyTape.setTileSize( zoomLvls[zoom] );
			};
			
			var makeMeZoomable=function(enable){
				self.element[0].onmousewheel=function(){};
				if( enable ){
					self.element[0].onmousewheel=handler;
				}
				return scope;
			}
			scope.zoomable=makeMeZoomable;
		})(this);
	
	},
	
	_popUpEditeablePanel : function( pos , mapData , cel ){
		
		PopUpEditable.create( mapData , cel ).pop( this._popUpLayer , pos );
	},
	
	cycle : function(dt){
		/*
		this._phyTape.getDatamap().cycle( dt );
		this._phyInstruc.getDatamap().cycle( dt );
		*/
		this._phyTape.cycle( dt );
		this._phyInstruc.cycle( dt );
		
		this._cursorTape.cycle( dt );
		this._cursorInstr.cycle( dt );
	},
	
	update : function(){
		
	},
	
	cursorInstMovable:function(enable){ this._cursorInstr.movable(enable); return this; },
	cursorTapeMovable:function(enable){ this._cursorTape.movable(enable); return this; },
	zoomable:function(enable){ return this; },
	
	
	getPhyTape : function(){
		return this._phyTape;
	},
	getPhyInstr : function(){
		return this._phyInstruc;
	},
	getAnimMgr : function(){
		return this._animMgr;
	},
	getEngine : function(){
		return this.engine;
	},
	getElement:function(){
		return this.element;
	},
	_updateAnim : function(){
		
		this._animMgr.update();
		
	},
}
Scene.createWithDim = function( w,h,eng ){
	var md = new Scene();
	md.initWithDim( w,h,eng );
	return md;
};


var ToolBox = function(){};
ToolBox.prototype = {
	
	_main : null,
	
	_panels : null,
	
	_mode : null,
	
	_containerPanel : null,
	
	element:null,
	
	init : function( scene ){
		
		
		var element=$('<div>').attr( 'id' , 'toolLayer' ).addClass( "toolBox" );
		
		var main = $("<div>").css( {"position" : "absolute" , "top" : "0px" , "left" : "0px" } );
		
		this._panels = {
			editing : EditingPanel.create( scene  ),
			monitoring : MonitoringPanel.create( scene  ),
		};
		
		
		var self = this;
		var switchBn = $('<div>').addClass("btn").attr( "title" , "switch" );;
		switchBn.mousedown( function( e ){
			self.switchMode();
		});
		
		switchBn.appendTo( element );
		main.appendTo( element );
		
		this._containerPanel = $("<div>").appendTo( element );
		
		this._mode = "editing";
		
		this.element=element;
		
		this.switchMode( );
	},
	getElement : function(){
		return this.element;
	},
	switchMode : function( mode ){
	
		mode = mode || ( this._mode == "editing" ) ? "monitoring" : "editing";
		
		this._panels[ this._mode ].finish();
		
		this._panels[ mode ].prepare( this._containerPanel );
		
		this._mode = mode;
	},

};
ToolBox.create = function( scene ){
	var m = new ToolBox();
	m.init( scene );
	return m;
}

var MonitoringPanel = function(){};
MonitoringPanel.prototype = {
	
	_scene : null,
	
	_el : null,
	
	_run : false,
	
	_speeds : [ 1 , 2 , 5 , 10  , 30 , 90  ],
	_cyclePerS : 0,
	
	_timeLine : null,
	
	_cyclePartial : 0,
	
	prepare : function( container ){

		this._el.appendTo( container );
		
		this._scene.getPhyTape().editable( false ).movable( true );
		this._scene.getPhyInstr().editable( false ).movable( true );
		
		this._scene.cursorInstMovable(false).cursorTapeMovable(false);
		
	},
	finish : function(){
		
		if( this._el && this._el.parent() )
			this._el.detach();
		
		if( this._run )
			this.stop();
			
		this._scene.getPhyTape().editable( false ).movable( false );
		this._scene.getPhyInstr().editable( false ).movable( false );
	},
	
	init : function( scene  ){
		
		this._scene   = scene;
		
		
		var self = this;
		
		var el = $("<div>");
		
		var nextBn = $('<div>').addClass("btn").attr( "title" , "next" );;
		nextBn.mousedown( function( e ){
			scene.getEngine().cycle();
		});
		
		var playPauseBn = $('<div>').addClass("btn").addClass( "bn_paused" ).attr( "title" , "play" );
		playPauseBn.mousedown( function( e ){
			
			if( self._run ){
				$(e.target).addClass( "bn_running" ).removeClass( "bn_paused" ).attr( "title" , "play" );
				nextBn.show();
				self.stop();
			} else {
				$(e.target).addClass( "bn_paused" ).removeClass( "bn_running" ).attr( "title" , "pause" );
				nextBn.hide();
				self.start();
			}
		});
		
		var labelSpeed = $("<div>");
		
		var speedBn = $('<input type="range" min="0" max="5" >').addClass( "bn_paused" ).css({"width" : "100" });
		speedBn[0].value = 0;
		speedBn.change( function( e ){
			self._cyclePerS = self._speeds[ e.target.value ];
			self._cyclePartial = 0;
			labelSpeed[0].innerHTML = self._cyclePerS+" cycle per seconde";
		});
		speedBn.change();
		
		var speedDownBn = $('<div>').addClass("btn").attr( "title" , "speed down" );
		speedDownBn.mousedown( function( e ){
			speedBn[ 0 ].value = Math.max( 0 , parseInt( speedBn[ 0 ].value )-1 );
			speedBn.change();
		});
		
		var speedUpBn = $('<div>').addClass("btn").attr( "title" , "speed up" );
		speedUpBn.mousedown( function( e ){
			speedBn[ 0 ].value = Math.min( 5 , parseInt( speedBn[ 0 ].value )+1 );
			speedBn.change();
		});
		
		nextBn.appendTo( el );
		playPauseBn.appendTo( el );
		labelSpeed.appendTo( el );
		speedBn.appendTo( el );
		speedDownBn.appendTo( el );
		speedUpBn.appendTo( el );
		
		
		this._el = el;
		
		
		this._timeLine = TimeLine.create();
		this._timeLine.addListener( "eachFrame" , this.call , this );
		this._timeLine.start();
		
		
	},
	start : function( ){
		this._run = true;
		this._cyclePartial = 0;
	},
	stop : function(){
		this._run = false;
	
	},
	call : function( delta ){
		
		if( !this._run )
			return;
		
		var n = delta / 1000 * this._cyclePerS + this._cyclePartial;
		
		for( var i = 0 ; i < Math.floor( n ) ; i ++ )
			this._scene.getEngine().cycle();
		this._cyclePartial = n%1;
	},
};
MonitoringPanel.create = function( engine , mapInstr , mapTape ){
	var m = new MonitoringPanel();
	m.init( engine , mapInstr , mapTape );
	return m;
}

var EditingPanel = function(){};
EditingPanel.prototype = {
	
	_scene : null,
	
	_el : null,
	
	_state : 0,
	
	prepare : function( container ){

		this._el.appendTo( container );
		
		this._scene.getPhyTape().editable( true ).movable( true );
		this._scene.getPhyInstr().editable( true ).movable( true );
		
		this._scene.cursorInstMovable(true).cursorTapeMovable(true);
	},
	finish : function(){
		
		if( this._el && this._el.parent() )
			this._el.detach();
			
		this._scene.getPhyTape().editable( false ).movable( false ).pathTracable( false ).erasable( false );
		this._scene.getPhyInstr().editable( false ).movable( false ).pathTracable( false ).erasable( false );
	},
	
	init : function( scene  ){
		
		this._scene   = scene;
		
		var self = this;
		
		var el = $("<div>");
		
		var routeBn = $('<div>').addClass("btn").attr( "title" , "route tracer" ).attr( "data-actived" , "false" );
		routeBn.mousedown( function( e ){
			self.changeState( 1 );
			routeBn.attr( "data-actived" , ( self.state == 1 )? "true" : "false" );
		});
		routeBn.appendTo( el );
		
		var eraserBn = $('<div>').addClass("btn").attr( "title" , "eraser" ).attr( "data-actived" , "false" );
		eraserBn.mousedown( function( e ){
			self.changeState( 2 );
			eraserBn.attr( "data-actived" , ( self.state == 2 )? "true" : "false" );
		});
		eraserBn.appendTo( el );
		
		this._el = el;
		
	},
	changeState : function( s ){
		
		this._scene.getPhyTape().pathTracable( false ).erasable( false );
		this._scene.getPhyInstr().pathTracable( false ).erasable( false );
		
		if( this._state == s )
			s = 0;
		
		$('input[type="button"][data-actived]').attr( "data-actived" , "false" );
		
		switch( s ){
			case 0 :
				this._scene.getPhyTape().movable( true );
				this._scene.getPhyInstr().movable( true );
			break;
			
			case 1 :
				this._scene.getPhyTape().movable( false ).pathTracable( true );
				this._scene.getPhyInstr().movable( false ).pathTracable( true );
				$('input[type="button"][title="route tracer"]').attr( "data-actived" , "true" );
			break;
			
			case 2 :
				this._scene.getPhyTape().movable( false ).erasable( true );
				this._scene.getPhyInstr().movable( false ).erasable( true );
				$('input[type="button"][title="eraser"]').attr( "data-actived" , "true" );
			break;
		}
		
		this._state = s;
		
	},
	
};
EditingPanel.create = function( engine , mapInstr , mapTape ){
	var m = new EditingPanel();
	m.init( engine , mapInstr , mapTape );
	return m;
}


// already existing , name is offset
(function($) {
    $.fn.pagePos = function () {
        var pos=this.position(),
			c = this,
			p = null;
		while( (p=c.parent())[0].tagName.toLowerCase() != 'html' ){
			c=p;
			pos.left+=c.position().left;
			pos.top+=c.position().top;
		}
		return pos;
    };
})(jQuery);
*/