var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
};


/*
 * Storage of element,
 * Store n element, if we tre try to store a (n+1)th element, the first whose been pushed is deleted
 * Storage can be iterate with next and resetCursor
 */
var Queue = function(){};
Queue.prototype = {
	_list : null,
	_capacity : 1,
	initWithCapacity : function( c ){
		this._capacity = c;
	},
	/*
	 * push the element at the queue
	 */
	push : function( e ){
	
		this._list = {
			e : e,
			next : this._list,
		};
		
		var p = this._list;
		for( var i = 1 ; i < this._capacity && p.next != null ; i ++)
			p = p.next;
		
		if( p.next != null ){
			if( p.next.e.finish != null )
				p.next.e.finish();
			p.next = null;
		}
	},
	/*
	 * return the first element ( the one that have been push in first so ) and delete it from the queue
	 */
	pop : function(){
		if( this._list == null )
			return null;
		if( this._list.next == null ){
			var e = this._list.e
			this._list = null;
			return e;
		}
		var p = this._list;
		while( p.next.next != null )
			p = p.next;
		
		var e = p.next.e;
		p.next = null;
		return e;
	},
	/*
	 * return the first matching element, delete it from the queue
	 */
	grab : function( match ){
		if( this._list == null )
			return;
		if( match( this._list.e ) ){
			var e = this._list.e;
			this._list = this._list.next;
			return e;
		}
		var last = this._list, p = this._list;
		while( ( p = p.next ) != null ){
			if(  match( p.e ) ){
				var e = p.e;
				last.next = p.next;
				return e;
			}
			last = p;
		}
		return ;
	},
	flush : function(){
		this.resetCursor();
		
		var i;
		
		while( ( i = this.next() ) != null )
			i.finish();
		
		this._list = null;
	},
	getNbElement : function(){
		this.resetCursor();
		
		var i , nb = 0;
		
		while( ( i = this.next() ) != null )
			nb ++;
			
		return nb;
	},
	getCapacity : function(){
		return this._capacity;
	},
	_cursor : null,
	resetCursor : function(){
		this._cursor = this._list;
	},
	next : function(){
		if( this._cursor == null )
			return null;
		var e = this._cursor.e;
		
		this._cursor = this._cursor.next;
		
		return e;
	},
	toArray : function(){
		this.resetCursor();
		
		var t = [],
			i;
		
		while( ( i = this.next() ) != null )
			t.push( i );
		
		return t;
	},
}
Queue.createWithCapacity = function( c ){
	var q = new Queue();
	q.initWithCapacity( c );
	return q;
}


var Stack = function(){};
Stack.prototype = {
	_tab : null,
	_n : 0,
	initWithCapacity : function( n ){
		
		this._tab = new Array();
		
		this._n = n;
	},
	push : function( e ){
		
		this._tab.unshift( e );
		
		if( this._tab.length > this._n )
			this._tab.splice( this._n , this._tab.length - this._n );
	
	},
	pop : function( ){
		return this._tab.shift();
	},
	
};
Stack.createWithCapacity  = function( n ){
	var s = new Stack();
	s.initWithCapacity( n );
	return s;
};

/**
 * register element in classes
 * do not manage redundancy
 * no need to init
 */
function AbstractNotifier(){};
AbstractNotifier.prototype = {
	_listener : null,
	_lock:false,
	_stack:null,
	
	/**
	 * call this is not necessary
	 */
	init : function( ){
		
	},
	
	
	/**
	 * add the element to the listener list
	 * @param ( [ class ] | optional )* ( [ object ] , [ function ] | [ function ] , [ object ] | { o:object , f:function} | object  )
	 * @param if no class are specified, register the element to the "all" class
	 * @param for the update, the fonction need a object and a function. theses can be pass wrapped in an object , or separetly. if only the object is specified, the function will be object.update
	 */
	registerListener : function(  ){
		if( !this._listener )
			this._listener = {};
		
		var update=null,
			i=0;
			
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++);
		
		if( i+1<arguments.length )
			update = {f:arguments[i+1] , o:arguments[i]};
		else
		if( i<arguments.length )
			if( arguments[i].f != undefined && arguments[i].o != undefined ){
				update = {f:arguments[i].f , o:arguments[i].o};
			}else{
				update = {f:arguments[i].update , o:arguments[i]};
			}
		if( update == null )
			throw "invalid param";
			
		
		if(this._lock){
			// if the Notifier is locked ( meaning he is current notfifying ) stack the modification on the listeners, and do it after
			if( !this._stack )
				this._stack=[];
			this._stack.push({f:this.registerListener,a:arguments});
			return update;
		}
		
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++){
			if( !this._listener[ arguments[i] ] )
				this._listener[ arguments[i] ] = [];
			this._listener[ arguments[i] ].push( update );
		}
		if( i==0 ){
			if( !this._listener[ "all" ] )
				this._listener[ "all" ] = [];
			this._listener[ "all" ].push( update );
		}
		return update;
	},
	/**
	 * remove the element to the listener list
	 * @param ( [ class ] | optional )* ( [ object ] , [ function ] | { o:object , f:function} | object  )
	 * @param if no class are specified, remove from all classes
	 * @param for the update, the fonction need a object and a function. theses can be pass wrapped in an object , or separetly. if only the object is specified, the function will be object.update
	 * @param if no update couple is specified, remove the entire classes
	 */
	removeListener : function( ){
		if( !this._listener )
			this._listener = {};
			
		var update=null,
			i=0;
			
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++);
		
		if( i+1<arguments.length )
			update = {f:arguments[i+1] , o:arguments[i]};
		else
		if( i<arguments.length )
			if( arguments[i].f != undefined && arguments[i].o != undefined ){
				update = {f:arguments[i].f , o:arguments[i].o};
			}else{
				update = {f:null , o:arguments[i]};
			}
		
		if(this._lock){
			// if the Notifier is locked ( meaning he is current notfifying ) stack the modification on the listeners, and do it after
			if( !this._stack )
				this._stack=[];
			this._stack.push({f:this.removeListener,a:arguments});
			return update;
		}
		
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++){
			if( !this._listener[ arguments[i] ] )
				continue;
			if( update == null ){
				this._listener[ arguments[i] ] = [];
				continue;
			}
			for( var j=0;j<this._listener[ arguments[i] ].length;j++)
				if( this._listener[ arguments[i] ][j].o == update.o && ( !update.f || update.f == this._listener[ arguments[i] ][j].f ) )
					this._listener[ arguments[i] ].splice(j,1);
		}
		if( i==0 )
			if( update == null )
				this._listener = {};
			else
				for( var k in this._listener )
					for( var j=0;j<this._listener[k].length;j++)
						if( this._listener[k][j].o == update.o && ( !update.f || update.f == this._listener[k][j].f ) )
							this._listener[k].splice(j,1);
		return update;
	},
	notify : function( ){
		if( !this._listener )
			return;
		this._lock=true;
		for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++)
			if( this._listener[ arguments[i] ] )
				for( var j=0;j<this._listener[ arguments[i] ].length;j++)
					this._listener[ arguments[i] ][j].f.call( this._listener[ arguments[i] ][j].o , this , arguments[i] );
		if( i==0 )
			for(var k in this._listener )
				for( var j=0;j<this._listener[ k ].length;j++)
					this._listener[ k ][j].f.call( this._listener[ k ][j].o , this , k );
		this._lock=false;
		if( this._stack ){
			for(var i=0;i<this._stack.length;i++)
				this._stack[i].f.apply( this,this._stack[i].a);
			this._stack=null;
		}
	},
}

function SynchronousNotifier(){};
extend( SynchronousNotifier , AbstractNotifier.prototype );
SynchronousNotifier.prototype._notifyStack=null,
SynchronousNotifier.prototype.notify=function( ){
	if( !this._notifyStack )
		this._notifyStack={};
	for(i=0;i<arguments.length&&typeof(arguments[i])=="string";i++)
		this._notifyStack[ arguments[i] ]=true;
}
SynchronousNotifier.prototype.triggerNotify=function( ){
	if( !this._notifyStack )
		return;
	for( var i in this._notifyStack )
		AbstractNotifier.prototype.notify.call( this , i );
	this._notifyStack={};
}


var CEL_EMPTY = 0,
	CEL_WRITE = 1,
	CEL_CHECK = 2,
	
	CEL_RIGHT = 3,
	CEL_LEFT = 4,
	CEL_TOP = 5,
	CEL_BOT = 6,
	CEL_DLEFT = 7,
	CEL_DRIGHT = 8,
	
	CEL_TRIGHT = 9,
	CEL_TLEFT = 10,
	CEL_TTOP = 11,
	CEL_TBOT = 12;

var CEL_NAME=[
	'empty',
	'write',
	'check',
	'right',
	'left',
	'top',
	'bot',
	'dleft',
	'dright',
	'tright',
	'tleft',
	'ttop',
	'tbot',
	'color1',
	'color2',
	'color3',
	'color4',
	'color5',
	'color6',
	'color7',
];
	
var tileSize = 25;

var colorPalette = [
	"#BBA341",
	"#A76CBA",
	"#C23102",
	"#913B10",
	"#01B101",
	"#128190",
	"#EBA914",
	"#9012C1",
];

/*
 * draw a motif 
 * in a square of 1x1 pixel
 */
var vectorMotif = function(){
	
	var arrow = function( ctx ){
		ctx.beginPath();
		ctx.moveTo( 0 , 0.3 );
		ctx.lineTo( 0.45 , 0.3 );
		ctx.lineTo( 0.45 , 0 );
		ctx.lineTo( 1 , 0.5 );
		ctx.lineTo( 0.45 , 1 );
		ctx.lineTo( 0.45 , 0.7 );
		ctx.lineTo( 0 , 0.7 );
		ctx.lineTo( 0 , 0.3 );
	};
	
	var cross = function( ctx ){
		ctx.beginPath();
		ctx.moveTo( 0.4 , 0 );
		ctx.lineTo( 0.6 , 0 );
		ctx.lineTo( 0.6 , 0.4 );
		ctx.lineTo( 1 , 0.4 );
		ctx.lineTo( 1 , 0.6 );
		ctx.lineTo( 0.6 , 0.6 );
		ctx.lineTo( 0.6 , 1 );
		ctx.lineTo( 0.4 , 1 );
		ctx.lineTo( 0.4 , 0.6 );
		ctx.lineTo( 0 , 0.6 );
		ctx.lineTo( 0 , 0.4 );
		ctx.lineTo( 0.4 , 0.4 );
		ctx.lineTo( 0.4 , 0 );
		
	};
	
	var bigCross = function( ctx ){
		ctx.beginPath();
		ctx.moveTo( 0.3 , 0 );
		ctx.lineTo( 0.7 , 0 );
		ctx.lineTo( 0.7 , 0.3 );
		ctx.lineTo( 1 , 0.3 );
		ctx.lineTo( 1 , 0.7 );
		ctx.lineTo( 0.7 , 0.7 );
		ctx.lineTo( 0.7 , 1 );
		ctx.lineTo( 0.3 , 1 );
		ctx.lineTo( 0.3 , 0.7 );
		ctx.lineTo( 0 , 0.7 );
		ctx.lineTo( 0 , 0.3 );
		ctx.lineTo( 0.3 , 0.3 );
		ctx.lineTo( 0.3 , 0 );
		
	};
	
	var rond = function( ctx ){
		ctx.beginPath();
		ctx.arc( 0.5 , 0.5 , 0.5 , 0 , Math.PI*2 );
		
	};
	
	return {
		arrow : arrow,
		arrowLight : arrow,
		arrowDouble : arrow,
		write : bigCross,
		check : rond,
	};
}();

/*
 * collection of canvas that represent the motif
 */
var motif = function(){ 

	var motif = {};
	
	for( var i = 0 ; i < 20 ; i ++ ){
		
		var canvas = $("<canvas>");
		
		canvas.width( tileSize );
		canvas.height( tileSize );
		
		canvas.attr( "width" , tileSize );
		canvas.attr( "height" , tileSize );
		
		motif[ i ] = canvas;
		
		var context = canvas[0].getContext( "2d" );
		
		switch( i ){
			case CEL_EMPTY :
				
			break;
			
			case CEL_WRITE :
			
				context.translate( tileSize*0.1 , tileSize*0.1 );
				context.scale( tileSize*0.8 , tileSize*0.8 );
				context.fillStyle = "#12BA43";
				vectorMotif.write( context );
				context.fill();
				
			break;
			
			case CEL_CHECK :
				
				context.translate( tileSize*0.1 , tileSize*0.1 );
				context.scale( tileSize*0.8 , tileSize*0.8 );
				context.fillStyle = "#12BA43";
				vectorMotif.check( context );
				context.fill();
				
			break;
			
			case CEL_RIGHT :
			case CEL_LEFT :
			case CEL_BOT :
			case CEL_TOP :
				
				context.translate( tileSize*0.5 , tileSize*0.5 );
				
				switch( i ){
					case CEL_LEFT :
						context.rotate( Math.PI );
					break;
					case CEL_TOP :
						context.rotate( Math.PI*1.5 );
					break;
					case CEL_BOT :
						context.rotate( Math.PI*0.5 );
					break;
				}
				
				context.translate( -tileSize*0.5 , -tileSize*0.5 );
				
				
				context.translate( tileSize*0.1 , tileSize*0.1 );
				context.scale( tileSize*0.8 , tileSize*0.8 );
				context.fillStyle = "#12BA43";
				vectorMotif.arrow( context );
				context.fill();
				
			break;
			
			case CEL_DRIGHT :
			case CEL_DLEFT :
				
				context.translate( tileSize*0.5 , tileSize*0.5 );
				
				if( i == CEL_DLEFT )
					context.rotate( Math.PI );
				
				context.translate( -tileSize*0.5 , -tileSize*0.5 );
				
				
				context.translate( tileSize*0.1 , tileSize*0.3 );
				context.scale( tileSize*0.8 , tileSize*0.4 );
				context.fillStyle = "#12BA43";
				vectorMotif.arrowDouble( context );
				context.fill();
				
			break;
			
			case CEL_TRIGHT :
			case CEL_TLEFT :
			case CEL_TBOT :
			case CEL_TTOP :
				
				context.translate( tileSize*0.5 , tileSize*0.5 );
				
				switch( i ){
					case CEL_TLEFT :
						context.rotate( Math.PI );
					break;
					case CEL_TTOP :
						context.rotate( Math.PI*1.5 );
					break;
					case CEL_TBOT :
						context.rotate( Math.PI*0.5 );
					break;
				}
				
				context.translate( -tileSize*0.5 , -tileSize*0.5 );
				
				
				context.translate( tileSize*0.2 , tileSize*0.2 );
				context.scale( tileSize*0.6 , tileSize*0.6 );
				context.fillStyle = "#A12B45";
				vectorMotif.arrowLight( context );
				context.fill();
				
			break;
		}
	
		if( i > 12 ){
			context.fillStyle = colorPalette[ Math.min( i - 13 , colorPalette.length -1 ) ] ;
			context.beginPath();
			context.rect(  0 , 0 , tileSize , tileSize );
			context.fill();
		}
	}
	
	motif.drawTile = function( symbol , context , ts , x , y ){
		var x=x||0;
		var y=y||0;
		if( symbol >= 20 )
			return;
		
		if( symbol < 13 )
			context.drawImage( motif[ symbol ][0] , x , y , ts , ts );
		else
		{
			context.fillStyle = colorPalette[ Math.min( symbol - 13 , colorPalette.length -1 ) ] ;
			context.beginPath();
			context.rect(  x , y , ts , ts );
			context.fill();
		}
	};
	
	return motif;
}();	

/*
 * command system
 */
var cmd = {};
( function( scope ){

var STATE_READY = 0,
	STATE_SUCCESS = 1,
	STATE_CANCEL = 2,
	STATE_FAIL = 4;

	
var AbstractCmd = function(){};
AbstractCmd.prototype = {
	_state : null,
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
			
			
		this._state = STATE_CANCEL;
		return true;
	},
	redo : function( ){
		if( this._state != STATE_CANCEL )
			return false;
		this._state = STATE_READY;
		return this.execute();
	},
	getState : function(){
		return this._state;
	},
	toString : function(){ return "Abstract Commande";},
};

/*
 * execute in one round severals cmds 
 */
var CmdMultiple = function(){};
extend( CmdMultiple , AbstractCmd.prototype );
extend( CmdMultiple , {	
	_cmds : null,
	_update : null,
	initWithCmds : function( t , update ){
		
		this._cmds = t;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_READY )
				return false;
			this._cmds[ i ].execute();
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
			this._cmds[ i ].undo();
			if( this._cmds[ i ].getState() != STATE_CANCEL )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
	redo : function( ){
		if( this._state != STATE_CANCEL )
			return false;
		
		for( var i = 0 ; i < this._cmds.length ; i ++ ){
			if( this._cmds[ i ].getState() != STATE_CANCEL )
				return false;
			this._cmds[ i ].redo();
			if( this._cmds[ i ].getState() != STATE_SUCCESS )
				return false;
		}
		
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	}
} );
CmdMultiple.create = function( ){
	var c = new CmdMultiple();
	c.initWithCmds( arguments );
	return c;
};
CmdMultiple.createWithTab = function( t , update ){
	var c = new CmdMultiple();
	c.initWithCmds( t , update );
	return c;
};


var CmdWriteMap = function(){};
extend( CmdWriteMap , AbstractCmd.prototype );
extend( CmdWriteMap , {	
	_cel : null,
	_newS  : null,
	_oldS  : null,
	_map : null,
	_update : null,
	init : function( map , cel , s , update  ){
		
		this._map = map;
		this._cel = cel;
		this._newS = s;
		this._oldS = map.read( cel.x , cel.y );
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		
		this._map.write( this._cel.x , this._cel.y , this._newS );
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		this._map.write( this._cel.x , this._cel.y , this._oldS );
		if( this._update )
			this._update.f.call( this._update.o );
			
		this._state = STATE_CANCEL;
		return true;
	},
	toString : function(){ return "write a "+this._oldS;},
} );
CmdWriteMap.create = function( map , cel , s , update ){
	var c = new CmdWriteMap ();
	c.init( map , cel , s , update );
	return c;
};


var CmdMoveCursor = function(){};
extend( CmdMoveCursor , AbstractCmd.prototype );
extend( CmdMoveCursor , {	
	_update : null,
	_newP : null,
	_oldP : null,
	_one : null,
	_engine : null,
	init : function( one , engine , newP , update ){
		
		this._engine = engine;
		this._one = one;
		if( this._one == "tape" )
			this._oldP = {
				x:this._engine.getCursorTape().x,
				y:this._engine.getCursorTape().y 
				};
		else
			this._oldP = {
				x:this._engine.getCursorInstr().x,
				y:this._engine.getCursorInstr().y 
				};
		this._newP = newP;
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		if( this._one == "tape" )
			this._engine.setCursorTape( this._newP.x , this._newP.y );
		else
			this._engine.setCursorInstr( this._newP.x , this._newP.y );
	
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		if( this._one == "tape" )
			this._engine.setCursorTape( this._oldP.x , this._oldP.y );
		else
			this._engine.setCursorInstr( this._oldP.x , this._oldP.y );
	
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_CANCEL;
		return true;
	},
	toString : function(){ return "move the cursor ";},
} );
CmdMoveCursor.create = function( one , engine , oldP , newP , update ){
	var m = new CmdMoveCursor();
	m.init( one , engine , oldP , newP , update );
	return m;
}



var CmdMgr = function(){};
CmdMgr.prototype = {
	
	_undoable : null,
	_redoable : null,
	
	init : function(){
		
		this._undoable = Stack.createWithCapacity( 50 );
		this._redoable = Stack.createWithCapacity( 50 );
		
	},
	execute : function( cmd ){
		
		if( !cmd.execute() )
			throw "unable to execute cmd ";
		
		this._undoable.push( cmd );
	},
	undo : function( ){
		
		var cmd = this._undoable.pop();
		
		if( !cmd )
			return;
			
		if( !cmd.undo() )
			throw "unable to undo cmd ";
		
		this._redoable.push( cmd );
	},
	redo : function( ){
		
		var cmd = this._redoable.pop();
		
		if( !cmd )
			return;
			
		if( !cmd.redo() )
			throw "unable to redo cmd ";
		
		this._undoable.push( cmd );
	},
};
CmdMgr.create = function(){
	var m = new CmdMgr();
	m.init();
	return m;
};

scope.moveCursor = CmdMoveCursor;
scope.writeMap = CmdWriteMap;
scope.multi = CmdMultiple;
scope.mgr = CmdMgr.create();


})( cmd );




/**
 * @class unlimited two dimension array, write symbol in any cell and access it.
 */
var Map = function(){}
Map.prototype = {
	_map:null,
	/**
	 * @private
	 */
	init : function(){
		this._map = new Array();
	},
	/**
	 * @public
	 * @param {int} x , horizontal coordinate
	 * @param {int} y , vertical coordinate
	 * @return {int} symbol , the symbol writed in the given cell, or CEL_EMPTY if the cell as never been written ( or written empty )
	 */
	read : function( x , y ){
		if( !this._map[ x ] || ( this._map[ x ][ y ] != 0 && !this._map[ x ][ y ] ) )
			return CEL_EMPTY;
		return this._map[ x ][ y ];
	},
	/**
	 * @public
	 * @param {int} x , horizontal coordinate
	 * @param {int} y , vertical coordinate
	 * @param {int} content , the symbol to write , use the constants CEL_*
	 */
	write : function( x , y , symbol ){
		if( !this._map[ x ] )
			this._map[ x ] = new Array();
		this._map[ x ][ y ] = symbol;
	},
	
	reset : function(){
		this._map = [];
	},
};
/**
 * @constructor
 */
Map.create = function(){
	var m = new Map();
	m.init();
	return m;
};



var EnhancedMap = function(){};
EnhancedMap.prototype = {
	
	_dirtyCel : null,
	
	_box : {
		topx : Infinity,
		topy : Infinity,
		botx : -Infinity,
		boty : -Infinity
	},
	
	_recalBox : function( x , y ){
		
		if( this._box.topx > x )
			this._box.topx = x;
		if( this._box.topy > y )
			this._box.topy = y;
		if( this._box.botx < x )
			this._box.botx = x;
		if( this._box.boty < y )
			this._box.boty = y;
	},
	
	popDirtyStack : function(){
		var a = this._dirtyCel;
		this._dirtyCel = new Array();
		return a;
	},
	getBoundaryBox : function(){
		return this._box;
	},
};
for( var p in Map.prototype )
	EnhancedMap.prototype[ p ] = Map.prototype[ p ];
EnhancedMap.prototype._super = Map.prototype;
EnhancedMap.prototype.write = function( x , y , symbol ){
	var prev = this.read( x , y );
	this._super.write.call( this , x , y , symbol );
	if( prev != this.read( x , y ) )
		this._dirtyCel.push( {x:x , y:y } );
	if( symbol != CEL_EMPTY )
		this._recalBox( x , y );
};
EnhancedMap.prototype.init = function(){
	this._super.init.call( this );
	this._dirtyCel = new Array();
};
EnhancedMap.create = function(){
	var m = new EnhancedMap();
	m.init();
	return m;
};


/**
 *@class a map that implement notifier interface, notify the 'struct' event whenever the map is modify
 */
var SocialMap=function(){};
extend( SocialMap , AbstractNotifier.prototype );
extend( SocialMap , Map.prototype );
SocialMap.prototype.write = function( x , y , symbol ){
	var prev = this.read( x , y );
	Map.prototype.write.call( this , x , y , symbol );
	if( prev != this.read( x , y ) )
		this.notify( 'struct' );
};
SocialMap.prototype.reset = function(  ){
	Map.prototype.reset.call( this );
	this.notify( 'struct' );
};
SocialMap.create=function(){
	var m = new SocialMap();
	m.init();
	return m
}



/**
 *@class assuming the turingEngine receive one instruction map and one tape map. It hold the position of the reading and writing cursor. It know what to do with the symbol encounter on the instruction map and modifie the tape map according. 
 */
var TuringEngine = function(){};
extend( TuringEngine , AbstractNotifier.prototype );
extend( TuringEngine , {
	
	_tape:null,
	_instruction:null,
	
	_cursorTape:null,
	_cursorInstr:null,
	
	init : function( tape , instruction , startTape , startInstr ){
		
		this._cursorTape  = startTape  || { x: 0 , y : 0 };
		this._cursorInstr = startInstr || { x: 0 , y : 0 };
		
		this._tape = tape;
		this._instruction = instruction;
		
	},
	cycle : function( ){
		
		this.notify('before-cycle');
		
		var celInst = this._instruction.read( this._cursorInstr.x , this._cursorInstr.y );
		
		switch( celInst ){
			// instruction naviguate
			case CEL_EMPTY :
			case CEL_RIGHT :
				this._cursorInstr.x ++;
			break;
			
			case CEL_LEFT :
				this._cursorInstr.x --;
			break;
			
			case CEL_DLEFT :
				this._cursorInstr.x -= 2;
			break;
			
			case CEL_DRIGHT :
				this._cursorInstr.x += 2;
			break;
			
			case CEL_TOP :
				this._cursorInstr.y --;
			break;
			
			case CEL_BOT :
				this._cursorInstr.y ++;
			break;
			
			// tape effect
			case CEL_WRITE :
				var symbol = this._instruction.read( this._cursorInstr.x + 1 , this._cursorInstr.y );
				this._tape.write( this._cursorTape.x , this._cursorTape.y , symbol );
				this._cursorInstr.x +=2;
			break;
			
			case CEL_CHECK :
				var symbol = this._instruction.read( this._cursorInstr.x + 1 , this._cursorInstr.y );
				var symbolCheck = this._tape.read( this._cursorTape.x , this._cursorTape.y );
				
				if( symbol == symbolCheck )
					this._cursorInstr.x +=2;
				else
					this._cursorInstr.y ++;
			break;
			
			case CEL_TTOP :
				this._cursorTape.y --;
				this._cursorInstr.x ++;
			break;
			
			case CEL_TBOT :
				this._cursorTape.y ++;
				this._cursorInstr.x ++;
			break;
			
			case CEL_TRIGHT :
				this._cursorTape.x ++;
				this._cursorInstr.x ++;
			break;
			
			case CEL_TLEFT :
				this._cursorTape.x --;
				this._cursorInstr.x ++;
			break;
			default :
				this._cursorInstr.x ++;
		}
		
		this.notify('after-cycle');
	},
	setCursorTape : function( x , y ){
		this._cursorTape.x = x;
		this._cursorTape.y = y;
	},
	setCursorInstr : function( x , y ){
		this._cursorInstr.x = x;
		this._cursorInstr.y = y;
	},
	getCursorTape : function(){
		return this._cursorTape;
	},
	getCursorInstr : function(){
		return this._cursorInstr;
	},
	getTape : function(){
		return this._tape;
	},
	getIntruction : function(){
		return this._instruction;
	},
});
/**
 *@constructor
 *@param {Map} tape , the map where the engine write 
 *@param {Map} instruction , the map where the engine read 
 *@param {Map} [startTape={x:0,y:0}] , the position of the cursor on the tape map at the begining, optional {x:0,y:0} if omited
 *@param {Map} [startInstr={x:0,y:0}] , the position of the cursor on the instruction map at the begining, optional {x:0,y:0} if omited
 */
TuringEngine.create = function( tape , instruction , startTape , startInstr ){
	var te = new TuringEngine( tape , instruction , startTape , startInstr );
	te.init( tape , instruction , startTape , startInstr );
	return te;
};



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