


( function( scope ){


var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
};


//============================
//============================
//== Data Related Objects ====
//============================
//============================


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
 * @class an object that notify listener every application cycle ( 1/60 s )
 * register element 
 * do not manage redundancy
 * got a delta cap
 */
function CycleNotifier(){};
CycleNotifier.prototype = {
	_listener : null,
	_lock:false,
	_stack:null,
	
	lastTime:null,
	run:false,
	stats:null,
	
	/**
	 * call this is not necessary
	 */
	init : function( ){
		this._listener = [];
		this._lock=false;
		this._stack=[];
	},
	/**
	 * add the element to the listener list
	 * @param ( [ class ] | optional )* ( [ object ] , [ function ] | [ function ] , [ object ] | { o:object , f:function} | object  )
	 * @param if no class are specified, register the element to the "all" class
	 * @param for the update, the fonction need a object and a function. theses can be pass wrapped in an object , or separetly. if only the object is specified, the function will be object.update
	 */
	registerListener : function(  ){
		
		var update=null;
			
		if( arguments.length==2 )
			update = {f:arguments[1] , o:arguments[0]};
		else
		if( arguments.length==1 )
			if( arguments[0].f != null && arguments[0].o != undefined ){
				update = {f:arguments[0].f , o:arguments[0].o};
			}else{
				update = {f:arguments[0].update , o:arguments[0]};
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
		
		this._listener.push( update );
		
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
		var update=null;
		
		if( arguments.length==2 )
			update = {f:arguments[1] , o:arguments[0]};
		else
		if( arguments.length==1 )
			if( arguments[0].f != undefined && arguments[0].o != undefined ){
				update = {f:arguments[0].f , o:arguments[0].o};
			}else{
				update = {f:null , o:arguments[0]};
			}
		
		if(this._lock){
			// if the Notifier is locked ( meaning he is current notfifying ) stack the modification on the listeners, and do it after
			if( !this._stack )
				this._stack=[];
			this._stack.push({f:this.removeListener,a:arguments});
			return update;
		}
		
		if( update == null )
			this._listener = [];
		else
			for( var j=0;j<this._listener.length;j++)
				if( this._listener[j].o == update.o && ( !update.f || update.f == this._listener[j].f ) )
					this._listener.splice(j,1);
		
		return update;
	},
	start : function(){
		this.setRun( true );
	},
	stop : function(){
		this.setRun( false );
	},
	setRun : function(val){
		var exRun=this.run;
		if( !val )
			this.run = !this.run;
		else
			this.run = val;
		
		
		var self=this;
		var cycle=function(){
			var now=new Date().getTime();
			var dt=Math.min(now-self.lastTime,500);
			
			self._lock=true;
			if(self.stats)
				self.stats.begin();
			
			var i=self._listener.length;
			while(i--)
				self._listener[i].f.call(self._listener[i].o,dt);
			
			if(self.stats)
				self.stats.end();
			self._lock=false;
			
			if( self._stack ){
				for(var i=0;i<self._stack.length;i++)
					self._stack[i].f.apply(self,self._stack[i].a);
				self._stack=null;
			}
			if(self.run)
				window.requestAnimFrame(cycle);
			self.lastTime=now;
		};
		
		
		if( !exRun&&this.run ){
			this.lastTime = new Date().getTime();
			//this._requestAnimationFrame(this._cycle);
			window.requestAnimFrame(cycle);
		}
	},
	_requestAnimationFrame:
	(function(callback){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 1000 / 60 );
		};
	})(),
};
CycleNotifier.create=function(){
	var c=new CycleNotifier();
	c.init();
	return c;
};
window.requestAnimFrame=(function(callback){
		return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function(callback){
			window.setTimeout(callback, 1000 / 60 );
		};
})();

/**
 * @class an object that call a callBack when the timer is over
 * @description assuming a CycleNotifier exist and is named timeLine
 */
var WakeMeUp=function(){};
WakeMeUp.prototype={
	d:null,
	cb:null,
	init:function(d,cb){
		this.d=d;
		this.cb=cb;
		timeLine.registerListener({o:this,f:this._call});
	},
	_call:function(dt){
		this.d-=dt;
		if(this.d<0){
			this.cb.f.call(this.cb.o);
			this.cancel();
		}
	},
	cancel:function(){
		timeLine.removeListener({o:this,f:this._call});
	},
};
WakeMeUp.create = function(d,cb){
	var s = new WakeMeUp();
	s.init(d,cb);
	return s;
};


timeLine=CycleNotifier.create();
timeLine.start();

/**
 * @class a class that notify stuff
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

/**
 * @class herit from AbstractNotifier, hold the notification and trigger it on demand
 */
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
CmdMoveCursor.create = function( one , engine , newP , update ){
	var m = new CmdMoveCursor();
	m.init( one , engine , newP , update );
	return m;
}

var CmdResetMap = function(){};
extend( CmdResetMap , AbstractCmd.prototype );
extend( CmdResetMap , {	
	_manual : null,
	_map : null,
	_update : null,
	init : function( map , update  ){
		
		this._map = map;
		this._manual = map.getRewriteManual();
		this._update = update;
		
		this._state = STATE_READY;
	},
	
	execute : function( ){
		if( this._state != STATE_READY )
			return false;
		
		
		this._map.reset();
		if( this._update )
			this._update.f.call( this._update.o );
		
		this._state = STATE_SUCCESS;
		return true;
	},
	undo : function( ){
		if( this._state != STATE_SUCCESS )
			return false;
		
		for(var i=0;i<this._manual.length;i++)
			tape.write(this._manual[i].x,this._manual[i].y,this._manual[i].s);
		if( this._update )
			this._update.f.call( this._update.o );
			
		this._state = STATE_CANCEL;
		return true;
	},
	toString : function(){ return "reset";},
} );
CmdResetMap.create = function( map , update ){
	var c = new CmdResetMap();
	c.init( map , update );
	return c;
};


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
scope.resetMap = CmdResetMap;

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
	
	getRewriteManual : function(){
		var man=[],
			s;
		var boxL=200;
		for(var x=-boxL;x<this._map.length;x++){
			if(this._map[x]==null)
				continue;
			for(var y=-boxL;y<this._map[x].length;y++)
				if((s=this.read(x,y))!=CEL_EMPTY)
					man.push( {x:x,y:y,s:s});
		}
		return man;
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


/**
 * @class overwrite write and reset method of map
 * @class retain all the modification in _dirtyCel, in that way the renderer knows what to redraw
 */
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
extend( EnhancedMap , Map.prototype );
EnhancedMap.prototype.write = function( x , y , symbol ){
	var prev = this.read( x , y );
	Map.prototype.write.call( this , x , y , symbol );
	if( prev != this.read( x , y ) )
		this._dirtyCel.push( {x:x , y:y } );
	if( symbol != CEL_EMPTY )
		this._recalBox( x , y );
};
EnhancedMap.prototype.init = function(){
	Map.prototype.init.call( this );
	this._dirtyCel = new Array();
};
EnhancedMap.create = function(){
	var m = new EnhancedMap();
	m.init();
	return m;
};


/**
 * @class a map that implement notifier interface, notify whenever the map is modify
 * @description event thowed : 'write' , 'reset'
 */
var SocialMap=function(){};
extend( SocialMap , AbstractNotifier.prototype );
extend( SocialMap , EnhancedMap.prototype );
SocialMap.prototype.write = function( x , y , symbol ){
	var prev = this.read( x , y );
	EnhancedMap.prototype.write.call( this , x , y , symbol );
	if( prev != this.read( x , y ) )
		this.notify( 'write' );
};
SocialMap.prototype.reset = function(  ){
	EnhancedMap.prototype.reset.call( this );
	this.notify( 'reset' );
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
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
				//this._cursorInstr.x ++;
			break;
			
			case CEL_LEFT :
				this.setCursorInstr(this._cursorInstr.x-1,this._cursorInstr.y);
			break;
			
			case CEL_DLEFT :
				this.setCursorInstr(this._cursorInstr.x-2,this._cursorInstr.y);
			break;
			
			case CEL_DRIGHT :
				this.setCursorInstr(this._cursorInstr.x+2,this._cursorInstr.y);
			break;
			
			case CEL_TOP :
				this.setCursorInstr(this._cursorInstr.x,this._cursorInstr.y-1);
			break;
			
			case CEL_BOT :
				this.setCursorInstr(this._cursorInstr.x,this._cursorInstr.y+1);
			break;
			
			// tape effect
			case CEL_WRITE :
				var symbol = this._instruction.read( this._cursorInstr.x + 1 , this._cursorInstr.y );
				this._tape.write( this._cursorTape.x , this._cursorTape.y , symbol );
				this.setCursorInstr(this._cursorInstr.x+2,this._cursorInstr.y);
			break;
			
			case CEL_CHECK :
				var symbol = this._instruction.read( this._cursorInstr.x + 1 , this._cursorInstr.y );
				var symbolCheck = this._tape.read( this._cursorTape.x , this._cursorTape.y );
				
				if( symbol == symbolCheck )
					this.setCursorInstr(this._cursorInstr.x+2,this._cursorInstr.y);
				else
					this.setCursorInstr(this._cursorInstr.x,this._cursorInstr.y+1);
			break;
			
			case CEL_TTOP :
				this.setCursorTape(this._cursorTape.x,this._cursorTape.y-1);
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
			break;
			
			case CEL_TBOT :
				this.setCursorTape(this._cursorTape.x,this._cursorTape.y+1);
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
			break;
			
			case CEL_TRIGHT :
				this.setCursorTape(this._cursorTape.x+1,this._cursorTape.y);
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
			break;
			
			case CEL_TLEFT :
				this.setCursorTape(this._cursorTape.x-1,this._cursorTape.y);
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
			break;
			default :
				this.setCursorInstr(this._cursorInstr.x+1,this._cursorInstr.y);
		}
		
		this.notify('after-cycle');
	},
	setCursorTape : function( x , y ){
		this._cursorTape.x = x;
		this._cursorTape.y = y;
		this.notify('set-cursor-tape');
	},
	setCursorInstr : function( x , y ){
		this._cursorInstr.x = x;
		this._cursorInstr.y = y;
		this.notify('set-cursor-instruction');
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
	getInstruction : function(){
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

/**
 * @class a object that can call cycle on the engine every frame
 */
var EnginePlayer = function(){};
extend( EnginePlayer , AbstractNotifier.prototype );
extend( EnginePlayer , {
	engine:null,
	ll:null,
	
	_cyclePerS:null,
	_cyclePartial:null,
	_run:false,
	
	init:function(engine,ll){
		this.engine=engine;
		this.ll=ll;
		timeLine.registerListener({f:this.call,o:this});
		
		this._cyclePartial=0;
		this._cyclePerS=0;
		
		if( this.ll )
			this.ll.registerListener( 'set-level' ,{f:function(){ this.reset(); } , o:this} );
			
		
	},
	setSpeed:function(v){
		if( this._cyclePerS == v )
			return;
		this._cyclePerS = v;
		this.notify("set-speed");
	},
	isRunning:function(){
		return this._run;
	},
	getSpeed:function(){
		return this._cyclePerS
	},
	next:function(){
		this.engine.cycle();
	},
	start : function( ){
		if(this._run)
			return;
		this._run = true;
		this._cyclePartial = 0;
		this.notify('start');
	},
	stop : function(){
		if(!this._run)
			return;
		this._run = false;
		this.notify('stop');
	},
	call : function( delta ){
		
		if( !this._run )
			return;
		
		var n = delta / 1000 * this._cyclePerS + this._cyclePartial;
		
		for( var i = 0 ; i < Math.floor( n ) ; i ++ )
			this.engine.cycle();
		this._cyclePartial = n%1;
	},
	reset : function(options){
		options=options||{};
		var cursor		= options.cursor!=null?options.cursor:true;
		var map			= options.map!=null?options.map:true;
		var instruction	= options.instruction!=null?options.instruction:true;
		var tape		= options.tape!=null?options.tape:true;
		var solution 	= options.solution!=null?options.solution:false;
		var undoable 	= options.undoable!=null?options.undoable:true;
		var lvl			= options.lvl || ( this.ll ? this.ll.getLvl() : null );
		
		var t=[];
		
		if( map && instruction ){
			var instruction = this.engine.getInstruction();
			var rewriteManual = lvl ? ( solution ? lvl.writeManualInstructionSolution : lvl.writeManualInstruction ) : [];
			
			t.push( cmd.resetMap.create( instruction ) );
			for(var i=0;i<rewriteManual.length;i++)
				t.push( cmd.writeMap.create( instruction , rewriteManual[i] , rewriteManual[i].s ) );
		}
		if( map && tape ){
			var tape = this.engine.getTape();
			var rewriteManual = lvl ? ( solution ? lvl.writeManualTapeSolution : lvl.writeManualTape ) : [];
			
			t.push( cmd.resetMap.create( tape ) );
			for(var i=0;i<rewriteManual.length;i++)
				t.push( cmd.writeMap.create( tape , rewriteManual[i] , rewriteManual[i].s ) );
		}
		if( cursor && instruction ){
			var cursorp = lvl ? lvl.cursorInstruction : {x:0, y:0};
			t.push( cmd.moveCursor.create( 'instruction' , this.engine , cursorp ) );
		}
		if( cursor && tape ){
			var cursorp = lvl ? lvl.cursorTape : {x:0, y:0};
			t.push( cmd.moveCursor.create( 'tape' , this.engine , cursorp ) );
		}
		if(t.length==0)
			return;
		if(undoable)
			cmd.mgr.execute( cmd.multi.createWithTab(t) );
		else
			cmd.multi.createWithTab(t).execute();
	},
});
EnginePlayer.create=function(engine,ll){
	var e=new EnginePlayer();
	e.init(engine,ll);
	return e;
};

/**
 * @class a object that know if a cell is editable or not
 */
var Authorizer=function(){};
extend( Authorizer , AbstractNotifier.prototype );
extend( Authorizer , {
	exceptions:null,
	defaultValue:null,
	cursorCtrl:null,
	init:function(defaultValue,exceptions,cursorCtrl){
		this.exceptions=exceptions||[];
		this.defaultValue=defaultValue;
		this.cursorCtrl=cursorCtrl;
		this.notify('struct');
	},
	read:function(x,y){
		var i=this.exceptions.length;
		while(i--)
			if(this.exceptions[i].x==x&&this.exceptions[i].y==y)
				return !this.defaultValue;
		return this.defaultValue;
	},
});
Authorizer.create=function(defaultValue,exceptions,cursorCtrl){
	var a=new Authorizer();
	a.init(defaultValue,exceptions,cursorCtrl);
	return a;
};



//============================
//============================
//== View Related Object =====
//============================
//============================


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


//== Prepare the draw Tile Function =====

var tileSize = 100;

var colorPalette = [
	"#BBA341",
	"#A76CBA",
	"#C23102",
	"#01B101",
	"#128190",
	"#EBA914",
	"#9012C1",
	"#913B10",
];

/*
 * draw a motif 
 * in a square of 1x1 pixel
 * no longuer used, we load bitmap image instead
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
var motif = {drawTile:function(){}};
initWhenDOMLoaded=function(){
	motif = (function(){ 
	
	var rightSized={};		// contain the tile at the right size, acces like this -> rightSized[ {int}tilseSize ][ {int} symbol ] is the canvas
	
	var pool=$('#tilePool');
	
	var computeRightSized=function(ts){
		var t=[];
		for( var i = 1 ; i <= 12 ; i ++ ){
			var canvas = $("<canvas>");
			
			canvas.width( ts );
			canvas.height( ts );
			
			canvas.attr( "width" , ts );
			canvas.attr( "height" , ts );
			
			t[ i ] = canvas[0];
			
			var context = canvas[0].getContext( "2d" );
			
			context.drawImage( pool.find('[data-symbol="'+i+'"]')[0] , 0 , 0 , ts , ts );
		}
		rightSized[ ts ]=t;
	};
	
	motif.drawTile = function( symbol , context , ts , x , y ){
		var x=x||0;
		var y=y||0;
		if( symbol >= 20 || symbol == 0)
			return;		// draw nothing
		
		if( symbol < 13 ){
			// draw the symbol, search for it in the array
			if( !rightSized[ ts ] )
				// if it doesnt exits at this size, create the whole set for this size
				computeRightSized(ts);	
			
			//draw the tile ( the canvas is already at the correct size, we assume its faster to draw that way )
			context.drawImage( rightSized[ ts ][ symbol ] , x , y );
		}
		else
		{
			// fill the tile with a color
			context.fillStyle = colorPalette[ Math.min( symbol - 13 , colorPalette.length -1 ) ] ;
			context.beginPath();
			context.rect(  x , y , ts , ts );
			context.fill();
		}
	};
	return motif;
})();	

};


//== Components =====

var MapDOMRenderer = 
(function(){
	
	var tileSize=25;
	
	var DOMTile=function(){};
	DOMTile.prototype={
		factory:null,
		canvas:null,
		ctx:null,
		_drawn:null,
		init:function(el){
			this.canvas=$('<canvas>')
			.addClass( 'tile' )
			.css({'position':'absolute'})
			.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			
			if(el)
				this.canvas.appendTo(el);
			
			this.ctx=this.canvas.get(0).getContext('2d');
			
			this._drawn=-1;
		},
		resize:function(){
			this.canvas.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			this.ctx=this.canvas.get(0).getContext('2d');
		},
		draw:function(symbol){
			if( this._drawn == symbol )	//already drawn
				return;	
				
			this.canvas.removeClass( 'symbol-'+this._drawn );
			
			this.canvas.addClass( 'symbol-'+symbol );
			
			this._drawn=symbol;
			
			//draw
			/*
			var ts=tileSize;
			this.ctx.clearRect(0,0,ts,ts);
			motif.drawTile(symbol,this.ctx,ts);
			
			/*
			this.ctx.font = 'normal '+(ts*0.6)+'px Calibri';
			this.ctx.fillText(symbol, ts*0.2, ts*0.8);
			*/
		},
		move:function(x,y){
			this.canvas.css({'top':Math.round(y)+'px','left':Math.round(x)+'px'});
		},
		getElement:function(){
			return this.canvas;
		},
		finish:function(){
			this.canvas.remove();
		},
	};
	DOMTile.create=function(el){
		var d=new DOMTile();
		d.init(el);
		return d;
	};
	
	
	
	var MapDOMRenderer = function(){};
	extend( MapDOMRenderer , {
		_datamap:null,
		_dirty:null,
		_tileSize:null,
		_sceneSize:null,
		_origin:null,
		_cells:null,
		_container:null,
		initWithDimension:function(datamap,container){
			this._datamap=datamap;
			this.listen(true);
			
			this._sceneSize = { x : container.width() , y : container.height() };
			this._origin = { x : 0 , y : 0 };
			
			this._container=container;
			
			this._adaptCellsToDim();
		},
		_adaptCellsToDim:function(){
			
			if(!this._cells )
				this._cells=[];
			
			
			this._sceneDim = { 
				x : Math.floor(this._sceneSize.x/tileSize)+2 , 
				y : Math.floor(this._sceneSize.y/tileSize)+2 
				};
			
			var exL=this._cells.length;
			var newL= this._sceneDim.x*this._sceneDim.y;
			
			var i=0;
			for( ; exL>newL ; exL-- ){
				this._cells[i].finish();
				this._cells[i]=null;		//
				delete this._cells[i];		// can be use as a buffer instead
			}
			for( ; i<exL ; i++ )
				this._cells[i].resize();
			for( ; i<newL ; i++ )
				this._cells[i]=DOMTile.create(this._container);
			
		},
		cycle:function( dt ){
			this.triggerUpdate();
		},
		update:function(){
			this._dirty=true;
		},
		triggerUpdate:function(){
			if( this._dirty ){
				this.draw();
				this._dirty=false;
			}
		},
		setOrigin : function( x , y ){
			this._origin.x = x;
			this._origin.y = y;
		},
		getOrigin : function(){
			return this._origin;
		},
		draw:function(){
			
			var ts=tileSize;
			
			var dx = (this._origin.x%1+1)%1 -1,
				dy = (this._origin.y%1+1)%1 -1;
			
			var ox=Math.floor(this._origin.x)+1,
				oy=Math.floor(this._origin.y)+1;
			
			var cell;
			
			var x=this._sceneDim.x,
				y;
			while(x--){
			y=this._sceneDim.y;
			while(y--){				//loop on all the cell
				
				cell=this._cells[ x * this._sceneDim.y + y ];
				
				//draw the symbol
				cell.draw( this._datamap.read( x-ox , y-oy ) );
				
				//move
				cell.move( (x+dx)*ts , (y+dy)*ts );
			}
			}
			
		},
		listen:function(enable){
			this._datamap.removeListener('write', {o:this,f:this.update} );
			if( enable ){
				this._datamap.registerListener('write', {o:this,f:this.update} );
				this.update();
			}
		},
		getDatamap:function(){
			return this._datamap;
		},
		getTileSize:function(){
			return tileSize;
		},
	});
	MapDOMRenderer.createWithDimension=function(datamap,container){
		var m=new MapDOMRenderer();
		m.initWithDimension(datamap,container);
		return m;
	}
	
	return MapDOMRenderer;
})();


var MapChunkRenderer = 
(function(){
	
	var tileSize=20;
	
	var chunkSize=6;
	
	
	var Tile={};
	
	var CSSTile=function(){};
	CSSTile.prototype={
		element:null,
		_drawn:null,
		init:function(el){
			this.element=$('<div>')
			.addClass( 'tile' )
			.css({'position':'absolute'})
			.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			
			if(el)
				this.element.appendTo(el);
		},
		resize:function(){
			this.element.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
		},
		draw:function(celx,cely,datamap,access){
			
			var symbol=datamap.read(celx,cely),
				granted=access.read(celx,cely);
			if( granted )
				this.element.removeClass('read-only')
			else
				this.element.addClass('read-only');
			this.element.removeClass( 'symbol-'+this._drawn )
			.addClass( 'symbol-'+symbol )
			.attr('data-x',celx).attr('data-y',cely);
			this._drawn=symbol;
			
			//this.element.empty().wrapInner(celx+'/'+cely).css({'font-size':'10px'});
		},
		move:function(x,y){
			this.element.css({'top':Math.round(y)+'px','left':Math.round(x)+'px'});
		},
		getElement:function(){
			return this.element;
		},
		finish:function(){
			this.element.remove();
		},
	};
	
	var CanvasTile=function(){};
	CanvasTile.prototype={
		factory:null,
		canvas:null,
		ctx:null,
		_drawn:null,
		init:function(el){
			this.canvas=$('<canvas>')
			.addClass( 'tile' )
			.css({'position':'absolute'})
			.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			
			if(el)
				this.canvas.appendTo(el);
			
			this.ctx=this.canvas.get(0).getContext('2d');
			
			this._drawn=-1;
		},
		resize:function(){
			this.canvas.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			this.ctx=this.canvas.get(0).getContext('2d');
		},
		draw:function(symbol){
			if( this._drawn == symbol )	//already drawn
				return;	
			this._drawn=symbol;
			
			//draw
			/*
			var ts=tileSize;
			this.ctx.clearRect(0,0,ts,ts);
			motif.drawTile(symbol,this.ctx,ts);
			
			/*
			this.ctx.font = 'normal '+(ts*0.6)+'px Calibri';
			this.ctx.fillText(symbol, ts*0.2, ts*0.8);
			*/
		},
		move:function(x,y){
			this.canvas.css({'top':Math.round(y)+'px','left':Math.round(x)+'px'});
		},
		getElement:function(){
			return this.canvas;
		},
		finish:function(){
			this.canvas.remove();
		},
	};
	
	Tile.create=function(el){
		var d=new CSSTile();
		d.init(el);
		return d;
	};
	
	
	
	
	var CanvasChunk=function(){};
	CanvasChunk.prototype={
		element:null,
		tiles:null,
		ctx:null,
		init:function(container){
			this.element=$('<canvas>')
			.css({'position':'absolute'})
			.appendTo(container);
			this.resize();
		},
		resize:function(){
			this.element.width(chunkSize*tileSize).height(chunkSize*tileSize)
			.attr('width',chunkSize*tileSize).attr('height',chunkSize*tileSize);
			this.ctx=this.element[0].getContext('2d');
		},
		draw:function( x,y,celx,cely,datamap,access ){
			var symbol=datamap.read(celx,cely),
				granted=access.read(celx,cely);
			this.ctx.clearRect(x*tileSize,y*tileSize,tileSize,tileSize);
			
			
			
			this.ctx.beginPath();
			this.ctx.globalAlpha=0.3;
			this.ctx.rect(x*tileSize,y*tileSize,tileSize,tileSize);
			//this.ctx.fillStyle='#'+(Math.floor(Math.random()*(255*256*256))).toString(16);
			this.ctx.fillStyle='#'+(Math.floor(Math.random()*30+110)*(1+256+256*256)  ).toString(16);
			if(!granted)
				this.ctx.globalAlpha=0.4;
			else
				this.ctx.globalAlpha=0.1;
			this.ctx.fill();
			this.ctx.globalAlpha=1;
			
			
			motif.drawTile( symbol , this.ctx , tileSize , x*tileSize , y*tileSize );
			
			this.ctx.beginPath();
			this.ctx.moveTo((x+0.2)*tileSize-1,y*tileSize+1);
			this.ctx.lineTo(x*tileSize+1,y*tileSize+1);
			this.ctx.lineTo(x*tileSize+1,(y+0.2)*tileSize-2);
			this.ctx.lineWidth=0.5;
			this.ctx.strokeStyle='#555';
			this.ctx.stroke();
			
		},
		drawAll:function(celx,cely,datamap,access){
			var j,
				i=chunkSize;
			while(i--){
				j=chunkSize;
				while(j--)
					this.draw(i,j,celx+i,cely+j,datamap,access);
			}
		},
		move:function(x,y){
			this.element.css({'top':(Math.round(y*100)/100)+'px','left':(Math.round(x*100)/100)+'px'});
		},
		finish:function(){
			this.element.remove();
			this.element=null;
		},
	};
	
	var DOMChunk=function(){};
	DOMChunk.prototype={
		element:null,
		tiles:null,
		init:function(container){
			this.element=$('<div>')
			.addClass( 'chunk' )
			.css({'position':'absolute'})
			.width( chunkSize*tileSize ).height( chunkSize*tileSize )
			.appendTo(container);
			this._adaptCellsToDim();
		},
		_adaptCellsToDim:function(){
			if(!this.tiles )
				this.tiles=[];
			
			var exL=this.tiles.length;
			var newL= chunkSize*chunkSize;
			
			for( ; exL>newL ; exL-- ){
				this.tiles[exL-1].finish();
				this.tiles[exL-1]=null;		//
				delete this.tiles[exL-1];		// can be use as a buffer instead
				i++
			}
			this.tiles=this.tiles.slice(0,exL);
			var i=0;
			for( ; i<exL ; i++ )
				this.tiles[i].resize();
			for( ; i<newL ; i++ )
				this.tiles[i]=Tile.create(this.element);
				
			for(var x=0;x<chunkSize;x++)
			for(var y=0;y<chunkSize;y++)
				this.tiles[x*chunkSize+y].move(x*tileSize,y*tileSize);
			
		},
		resize:function(){
			this._adaptCellsToDim();
			this.element.width( chunkSize*tileSize ).height( chunkSize*tileSize );
		},
		draw:function( x,y,celx,cely,datamap,access ){
			this.tiles[x*chunkSize+y].draw(celx,cely,datamap,access);
		},
		drawAll:function(celx,cely,datamap,access){
			var j,
				i=chunkSize;
			while(i--){
				j=chunkSize;
				while(j--)
					this.tiles[i*chunkSize+j].draw(celx+i,cely+j,datamap,access);
			}
		},
		move:function(x,y){
			this.element.css({'top':Math.round(y)+'px','left':Math.round(x)+'px'});
		},
		finish:function(){
			var i=this.tiles.length;
			while(i--)
				this.tiles[i].finish();
			this.element.remove();
		},
	};
	
	var Chunk={};
	Chunk.create=function(el){
		var d=new CanvasChunk();
		d.init(el);
		return d;
	};
	
	
	
	var Renderer = function(){};
	extend( Renderer , {
		_datamap:null,
		_dirty:null,
		_dirtyPaint:null,
		_dirtyAuthorization:null,
		_sceneSize:null,
		_origin:null,
		_originTarget:null,
		_chunks:null,
		_container:null,
		initWithDimension:function(datamap,authorizer,container){
			this._datamap=datamap;
			this._authorizer=authorizer;
			this._dirtyAuthorization=false;
			this._dirtyPaint=false;
			this.listen(true);
			
			this._sceneSize = { x : container.width() , y : container.height() };
			this._origin = { x : 0 , y : 0 };
			this._originTarget = { x : 0 , y : 0 };
			
			this._container=container;
			
			this._adaptCellsToDim();
		},
		_adaptCellsToDim:function(){
			if(!this._chunks )
				this._chunks=[];
			this._sceneDim = { 
				x : Math.floor(this._sceneSize.x/(tileSize*chunkSize))+2 , 
				y : Math.floor(this._sceneSize.y/(tileSize*chunkSize))+2 
				};
			
			var exL=this._chunks.length;
			var newL= this._sceneDim.x*this._sceneDim.y;
			
			for( ; exL>newL ; exL-- ){
				this._chunks[exL-1].finish();
				this._chunks[exL-1]=null;		//
				delete this._chunks[exL-1];		// can be use as a buffer instead
				i++
			}
			this._chunks=this._chunks.slice(0,exL);
			var i=0;
			for( ; i<exL ; i++ )
				this._chunks[i].resize();
			for( ; i<newL ; i++ )
				this._chunks[i]=Chunk.create(this._container);
			
		},
		cycle:function( dt ){
			this.triggerUpdate();
		},
		update:function(){
			this._dirty=true;
		},
		triggerUpdate:function(){
			if( this._dirty ){
				if( this._dirtyAuthorization ){
					this.drawAll();
					this._dirtyPaint=false;
					this._dirtyAuthorization=false;
				}
				if(this._dirtyPaint){
					this.draw();
					this._dirtyPaint=false;
				}
				this.move();
				this._dirty=false;
			}
		},
		setOrigin : function( x , y ){
			this._originTarget.x = x;
			this._originTarget.y = y;
			this.update();
		},
		getOrigin : function(){
			return this._origin;
		},
		move:function(){
			var dx=this._origin.x-this._originTarget.x,
				dy=this._origin.y-this._originTarget.y;
			
			var ts=tileSize*chunkSize;
			
			var olx=Math.floor(this._origin.x/chunkSize)+1,		//last orgin , the current
				oly=Math.floor(this._origin.y/chunkSize)+1;
			
			var ox=Math.floor(this._originTarget.x/chunkSize)+1,		//target origin, 
				oy=Math.floor(this._originTarget.y/chunkSize)+1;
				
			//$('#instructionLayer').css({'overflow-x':'visible','overflow-y':'visible','border':'solid 3px #333'});
			//$('#instructionLayer').find('.chunk').css({'box-shadow':'0 0 1px 1px #000'});
			
			if( dx>0 ){
				for(var i=olx;i>ox;i--){
				// need a circular permutation
					var j=this._sceneDim.y;
					var tmp;
					while(j--){
						//circular permutation
						//first go to end
						tmp=this._chunks[j];
						var end=this._sceneDim.x*this._sceneDim.y;
						for(var k=this._sceneDim.y;k<end;k+=this._sceneDim.y)
							this._chunks[k-this._sceneDim.y+j]=this._chunks[k+j];
						this._chunks[k-this._sceneDim.y+j]=tmp;
						//update the moved tile
						tmp.drawAll( (this._sceneDim.x-i)*chunkSize , (j-oly)*chunkSize , this._datamap , this._authorizer);
					}
				}
			}
			if( dx<0 ){
				for(var i=olx;i<ox;i++){
				// need a circular permutation
					var j=this._sceneDim.y;
					var tmp;
					while(j--){
						//circular permutation
						tmp=this._chunks[(this._sceneDim.x-1)*this._sceneDim.y+j];
						for(var k=(this._sceneDim.x-1)*this._sceneDim.y;k>=this._sceneDim.y;k-=this._sceneDim.y)
							this._chunks[k+j]=this._chunks[k-this._sceneDim.y+j];
						this._chunks[j]=tmp;
						//update the moved tile
						tmp.drawAll( (-i-1)*chunkSize , (j-oly)*chunkSize , this._datamap , this._authorizer);
					}
				}
			}
			
			if( dy>0 ){
				for(var i=oly;i>oy;i--){
				// need a circular permutation
					var j=this._sceneDim.x;
					var tmp;
					while(j--){
						//circular permutation
						tmp=this._chunks[j*this._sceneDim.y];
						for(var k=1;k<this._sceneDim.y;k++)
							this._chunks[k-1+j*this._sceneDim.y]=this._chunks[k+j*this._sceneDim.y];
						this._chunks[k-1+j*this._sceneDim.y]=tmp;
						//update the moved tile
						tmp.drawAll( (j-ox)*chunkSize , (this._sceneDim.y-i)*chunkSize , this._datamap , this._authorizer);
					}
				}
			}
			if( dy<0 ){	
				for(var i=oly;i<oy;i++){
				// need a circular permutation
					var j=this._sceneDim.x;
					var tmp;
					while(j--){
						//circular permutation
						tmp=this._chunks[j*this._sceneDim.y+this._sceneDim.y-1];
						for(var k=this._sceneDim.y-1;k>=1;k--)
							this._chunks[k+j*this._sceneDim.y]=this._chunks[k-1+j*this._sceneDim.y];
						this._chunks[j*this._sceneDim.y]=tmp;
						//update the moved tile
						tmp.drawAll( (j-ox)*chunkSize , (-i-1)*chunkSize , this._datamap , this._authorizer);
					}
				}
			}
			
			var ix = (((this._originTarget.x/chunkSize)%1+1)%1 -1),
				iy = (((this._originTarget.y/chunkSize)%1+1)%1 -1);
			
			var chunk;
			
			var x=this._sceneDim.x,
				y,
				cx,
				cy,
				symbols=new Array(chunkSize*chunkSize);
			while(x--){
			y=this._sceneDim.y;
			while(y--){				//loop on all the cell
				
				//move
				this._chunks[ x * this._sceneDim.y + y ].move( (x+ix)*ts , (y+iy)*ts );
			}
			}
			this._origin.x=this._originTarget.x;
			this._origin.y=this._originTarget.y;
			
		},
		//redraw all
		drawAll:function(){
			
			this._datamap.popDirtyStack();	//we will draw all the stuff, including the ones which are in the dirtyStack
			
			var cx=Math.floor(this._origin.x/chunkSize)+1,
				cy=Math.floor(this._origin.y/chunkSize)+1;
			
			var x=this._sceneDim.x,
				y;
			while(x--){
			y=this._sceneDim.y;
			while(y--){				//loop on all the cell
				//draw the symbol
				this._chunks[ x * this._sceneDim.y + y ].drawAll( (x-cx)*chunkSize , (y-cy)*chunkSize , this._datamap , this._authorizer );
			}
			}
		},
		//draw only the dirty cell
		draw:function(){
			var dirties = this._datamap.popDirtyStack();
			if(dirties.length<=0)
				return;
			
			var ox=Math.floor(Math.floor(this._origin.x)/chunkSize+1)*chunkSize,
				oy=Math.floor(Math.floor(this._origin.y)/chunkSize+1)*chunkSize;
			
			
			var i=dirties.length,
				cel,
				cx,cy;
			while(i--){
				cel = dirties[i];
				cx=Math.floor((cel.x+ox)/chunkSize);
				cy=Math.floor((cel.y+oy)/chunkSize);
				if(cx<0||cy<0||cx>=this._sceneDim.x||cy>=this._sceneDim.y)
					continue;
				this._chunks[ cx * this._sceneDim.y + cy ].draw( (cel.x%chunkSize+chunkSize)%chunkSize , (cel.y%chunkSize+chunkSize)%chunkSize , cel.x , cel.y , this._datamap , this._authorizer );
			}
		},
		setTileSize:function(ts){
			tileSize=ts;
			chunkSize=Math.max(3,Math.round(100/tileSize));
			this._adaptCellsToDim();
			this.drawAll();
			this.update();
		},
		setChunkSize:function(ts){
			chunkSize=ts;
			this._adaptCellsToDim();
			this.drawAll();
			this.update();
		},
		listen:function(enable){
			this._datamap.removeListener('write', this );
			this._datamap.removeListener('reset', this );
			this._authorizer.removeListener('struct', this );
			if( enable ){
				this._datamap.registerListener('write', {o:this,f:function(){this._dirtyPaint=true;this.update()}} );
				this._authorizer.registerListener('struct', {o:this,f:function(){this._dirtyAuthorization=true;this.update()}} );
				this._datamap.registerListener('reset', {o:this,f:function(){this._dirtyAuthorization=true;this.update()}} );		//will repaint all 
				this.update();
			}
		},
		getDatamap:function(){
			return this._datamap;
		},
		getTileSize:function(){
			return tileSize;
		},
	});
	Renderer.createWithDimension=function(datamap,authorizer,container){
		var m=new Renderer();
		m.initWithDimension(datamap,authorizer,container);
		return m;
	}
	
	return Renderer;
})();

/**
 * @class herit of a map renderer, knows to listen to user event and react ( navigaute , edit ... )
 * @description behavior can be altered with the following methods
 * @description - movable( {boolean} enable ) -> the map can be navigate throught drag
 * @description - editable( {boolean} enable ) -> the map can be edit ( pop the symbol tab , pop the text input ) when dblclick on a cell, change will be made throught a command
 * @description - pathTracable( {boolean} enable ) -> enable the path tracer tool
 * @description - erasable( {boolean} enable ) -> enable the zone eraser tool
 */
var MapReactiveRenderer = function(){};
MapReactiveRenderer.prototype._renderStrategy=MapChunkRenderer;
extend( MapReactiveRenderer , MapReactiveRenderer.prototype._renderStrategy.prototype );
extend( MapReactiveRenderer , {
	eventLayer:null,
	_targetOriginD:null,
	_onMove:null,
	initWithDimension:function(d,authorizer,container,eventLayer,popUpLayer){
		this._renderStrategy.prototype.initWithDimension.call(this,d,authorizer,container);
		
		this.eventLayer=eventLayer;
		this.popUpLayer=popUpLayer;
		
		this._targetOriginD={x:0,y:0};
		this._onMove=false;
		
		timeLine.registerListener({o:this,f:this.cycle});
		
		this.initInteraction();
	},
	/**
	 * @public
	 * @description make the cell passed in param to be on the center on the screen
	 * @param {int} celx , horizontal coordinate of the cell
	 * @param {int} cely , vertical coordinate of the cell
	 * @param {boolean} smooth , if true, the move is not instantly
	 */
	focusOn:function(celx,cely,smooth){
		var smooth=(smooth==null)?true:smooth;
		
		var midx=this._sceneSize.x/this.getTileSize()/2,
			midy=this._sceneSize.y/this.getTileSize()/2;
		
		var x=-celx-0.5+midx,
			y=-cely-0.5+midy;
		
		if(smooth)
			this.setOriginSmooth(x,y);
		else{
			this.setOrigin(x,y);
		}
	},
	/**
	 * @private
	 */
	setOriginSmooth:function(x,y){
		this._targetOriginD.x=x;
		this._targetOriginD.y=y;
		this._onMove=true;
	},
	cycle:function( dt ){
		if(this._onMove){
			
			var o=this.getOrigin();
			
			var dx=this._targetOriginD.x-o.x;
			var dy=this._targetOriginD.y-o.y;
			
			var l=Math.sqrt(dx*dx+dy*dy);
			
			if( l<0.01 ){
				this._onMove=false;
			}else{
				var pas = Math.min( l , Math.max( 0.1/tileSize  , l/700  ) * dt );
				//pesudo set origin
				this._renderStrategy.prototype.setOrigin.call(this,o.x+dx/l*pas,o.y+dy/l*pas);
				this.update();
			}
		}
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
		.css({'color':'#000' , 'weight':'bold'})
		.css({'position':'absolute'});
		var editedCel;
		
		var rawEdit=function(cel){
			
			var ts=mapD.getTileSize(),
				o=mapD.getOrigin(),
				offset=mapD.eventLayer.position();
				
			var x= (cel.x+o.x)*ts + offset.left,
				y= (cel.y+o.y)*ts + offset.top;
			
			input.css({'top':(y-ts*0.2)+'px','left':(x-ts*0.2)+'px'})
			.css({'width':(ts*1.4)+'px','height':(ts*1.4)+'px'})
			.val( defaultLbl[mapD._datamap.read(cel.x,cel.y)] )
			//.val( '' )
			.css({'font-size':(ts*1)+'px'})
			.data( 'cel' , cel )
			.appendTo(mapD.popUpLayer)
			.focusin();
			keyboardhandlerUp();
			
			opac.css({'top':y+'px','left':x+'px'})
			.width(ts).height(ts)
			.appendTo(mapD.popUpLayer);
			
			mapD.popUpLayer.addClass('active');
			
			popUp.appendTo(mapD.popUpLayer)
			.css({'top':y+'px','left':(x+ts+35)+'px'});
			
			popUp.find('.label').css({'display':'inline-block'});
			
			popUp.find('.item').unbind('click').bind('click',function(e){
				var item=$(e.target);
				if(!item.is('.item'))
					item=item.parents('.item');
				cmd.mgr.execute( cmd.writeMap.create( mapD._datamap , {x:editedCel.x,y:editedCel.y} , item.data('symbol') ) );
				finishNoSave();
			});
			input.focus().select();
			
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
			var nextCel=null;
			switch( e.which ){
				case 13:		//enter
					nextCel={x:editedCel.x,y:editedCel.y};
					switch(convert[input.val().trim()]){
						case CEL_TOP : nextCel.y--; break;
						case CEL_BOT : nextCel.y++; break;
						case CEL_LEFT : nextCel.x--; break;
						case CEL_DLEFT : nextCel.x-=2; break;
						case CEL_DRIGHT : nextCel.x+=2; break;
						default : nextCel.x++; break;
					}
					saveFromInput();
				break;
				case 37:	//left
					nextCel={x:editedCel.x-1,y:editedCel.y};
				break;
				case 38:	//top
					nextCel={x:editedCel.x,y:editedCel.y-1};
				break;
				case 39:	//right
					nextCel={x:editedCel.x+1,y:editedCel.y};
				break;
				case 40:	//bot
					nextCel={x:editedCel.x,y:editedCel.y+1};
				break;
			};
			if( nextCel ){
				if(!mapD._authorizer.read(nextCel.x,nextCel.y))
					finishNoSave();
				else
					rawEdit(nextCel);
				e.preventDefault();
			}
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
			var cel=getCel( e );
			if(!mapD._authorizer.read(cel.x,cel.y))
				return;
			rawEdit( cel );
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
					
					if( s && s > 0 && mapD._authorizer.read(cel.x,cel.y) )
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
		
		var fill=function(){
			var ts=self.getTileSize(); 
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
		};
		
		var startRoute = function( e ){
			drag = true;
			anchorD = getCel(e);
			anchorM = getCel(e);
			fill();
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
				fill();
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
				if( mapD._authorizer.read(x,y) )
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
	
	//
	
	},
	getEventLayer:function(){
		return this.eventLayer;
	},
	movable:function(enable){return this},
	editable:function(enable){return this},
	pathTracable:function(enable){return this},
	erasable:function(enable){return this},
});
MapReactiveRenderer.prototype.setOrigin=function(x,y){
	this._renderStrategy.prototype.setOrigin.call(this,x,y);
	this._onMove=false;
};
MapReactiveRenderer.createWithDimension=function(datamap,authorizer,container,eventLayer,popUpLayer){
	var m=new MapReactiveRenderer();
	m.initWithDimension(datamap,authorizer,container,eventLayer,popUpLayer);
	return m;
}

/**
 * @class know how to display the cursor.
 */
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
		.css({'z-index':2})
		.appendTo( container );
		
		this.eventLayer=containerEvent;
		this._buildLoup( map.getTileSize()*2 );
		
		timeLine.registerListener({o:this,f:this.cycle});
		
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
		
		var pas = Math.min( l , Math.max( 0.9  , l/400  ) * dt );
		
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
					
					if( Math.abs( Math.round( cgx ) - cgx )  < 0.28 && Math.abs( Math.round( cgy ) - cgy )  < 0.28 ){
						cgx = Math.round( cgx );
						cgy = Math.round( cgy );
					}
					
					scope._targetPos.x=cx+scope._loupW;
					scope._targetPos.y=cy+scope._loupW;
					
					
					scope._targetPos.x=(cgx+0.5+o.x)*ts;
					scope._targetPos.y=(cgy+0.5+o.y)*ts;
					
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
	resize:function(){
		this._buildLoup( this._map.getTileSize()*2);
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

/**
 * @class knows how to display a instruction bubble
 * @description instanciate via a hidden factory
 */
var Bubble=function(){};
Bubble.prototype={
        
        element : null,
        _q : null,
        _pos : null,
		_phymap:null,
        ctx:null,
		
		_d:null,
		
        init : function( queue ){
            this._q = queue;
              
			var w=50;
			this.element = $("<canvas>")
			.width( w ).height( w ).attr( 'height' ,  w ).attr( 'width' ,  w )
			.css({ 'position' : 'absolute' })
			.css({ 'z-index' : '5' });
            this.ctx=this.element[0].getContext('2d');
        },
        prepare : function( symbols , pos , phymap ){
                
                var w=phymap.getTileSize()*2.5;
				
				
				this.element.width( w ).height( w ).attr( 'height' ,  w ).attr( 'width' ,  w )
				this.ctx=this.element[0].getContext('2d');
				
                this.ctx.clearRect( 0 , 0 , w , w );
                
				if(symbols.length==1)
					switch(symbols[0]){
						
						case CEL_RIGHT:
						case CEL_DRIGHT:
						case CEL_LEFT:
						case CEL_DLEFT:
						case CEL_TOP:
						case CEL_BOT:
						
						case CEL_TRIGHT:
						case CEL_TLEFT:
						case CEL_TTOP:
						case CEL_TBOT:
							motif.drawTile( symbols[0] , this.ctx , w );
						break;
						default :
							motif.drawTile( symbols[0] , this.ctx , w );
						break;
					}
				if(symbols.length>=2)
					switch(symbols[0]){
						case CEL_CHECK:
							motif.drawTile( symbols[0] , this.ctx , w/2 );
							motif.drawTile( symbols[1] , this.ctx , w/2 , w/2 , 0 );
							this.ctx.beginPath();
							this.ctx.rect(w/2,0,w/2,w/2);
							this.ctx.lineWidth=0.5;
							this.ctx.stroke();
							
						break;
						case CEL_WRITE:
							motif.drawTile( symbols[0] , this.ctx , w/2 );
							motif.drawTile( symbols[1] , this.ctx , w/2 , w/2 , 0 );
							this.ctx.beginPath();
							this.ctx.rect(w/2,0,w/2,w/2);
							this.ctx.lineWidth=0.5;
							this.ctx.stroke();
							
						break;
					}
					
				
				
				
				
                this._d=0;
                this._pos = {
                        x : pos.x,
                        y : pos.y
                };
                this._phymap=phymap;
                
				timeLine.registerListener({o:this,f:this._live});
				this._live(0);
				this.element.css({'opacity':1});
        },
        _live : function( delta ){
                var o=this._phymap.getOrigin(),
					ts=this._phymap.getTileSize(),
					d=Math.min(1,this._d/1000);
					
				var w=ts*2.5;
				
				var t= (Math.sin( d*d * Math.PI * 5 )*0.3+0.7);
				
				var x=(this._pos.x+o.x+0.5)*ts	-w*t*0.5  ,
					y=(this._pos.y+o.y+0.5)*ts	-w*t*0.5  -Math.sin( d*d * Math.PI * 5 )*(1-d)*w  -d*w;
				
				this.element.css({ 'width' : (t*w)+'px' , 'height' : (t*w)+'px' });
                this.element.css({ 'left' : (Math.round( x*100 )/100)+'px' , 'top' : (Math.round( y*100 )/100)+'px' });
                
				
                if( d>0.6 )
                   this.element.css({ 'opacity' : Math.max( 0 , (1-d)/0.4 ) });
                
                
				this._d+=delta;
				if(this._d>1000){
					this._pushToQueue();
				}
        },    
       finish : function( ){
                if( this.element )
                     this.element.remove();
                this.element = null;
				timeLine.removeListener({o:this,f:this._live});
        },
        _pushToQueue : function(){
             this.element.detach();
			 timeLine.removeListener({o:this,f:this._live});
             this._q.push( this );
        },
        getElement : function(){
             return this.element;
        },

};
Bubble._unuseStack=Queue.createWithCapacity(25);
Bubble.create = function( symbols , pos , phymap ){
        var b = this._unuseStack.pop();
        if( b == null ){
            b = new Bubble();
            b.init( this._unuseStack );
        }
        b.prepare( symbols , pos , phymap );
        return b;
};

/**
 * @class instanciate bubble whenever its necessary
 */
var BubbleEmitter = function(){};
BubbleEmitter.prototype = {
	containerInstruction:null,
	containerTape:null,
	engine:null,
	phyTape:null,
	phyInstruction:null,
	init:function(engine ,containerInstruction , containerTape , phyTape , phyInstruction ){
		this.containerInstruction=containerInstruction;
		this.containerTape=containerTape;
		this.phyTape=phyTape;
		this.phyInstruction=phyInstruction;
		this.engine=engine;
		
		this.listen(true);
	},
	_readAndEmit:function(){
		var c={x:this.engine.getCursorInstr().x,y:this.engine.getCursorInstr().y};
		var s=this.engine.getInstruction().read(c.x,c.y);
		switch( s ){
			case CEL_TRIGHT:
			case CEL_TLEFT:
			case CEL_TTOP:
			case CEL_TBOT:
				var b=Bubble.create([s] , c , this.phyInstruction);
				b.getElement().appendTo(this.containerInstruction);
			break;
			
			case CEL_CHECK:
				//read the next
				var sn=this.engine.getInstruction().read(c.x+1,c.y);
				var b=Bubble.create([s,sn] , c , this.phyInstruction);
				b.getElement().appendTo(this.containerInstruction);
				var ct={x:this.engine.getCursorTape().x,y:this.engine.getCursorTape().y};
				var st=this.engine.getTape().read(ct.x,ct.y);
				var cond=(sn==st);
				var self=this;
				(function(){
					var cc=c;
					WakeMeUp.create(800,{o:self,f:function(){
						var b=Bubble.create([(cond)?CEL_DRIGHT:CEL_BOT] , cc , self.phyInstruction);
						b.getElement().appendTo(self.containerInstruction);
					}});
				})();
				var b=Bubble.create( [CEL_CHECK,st] , ct , this.phyTape);
				b.getElement().appendTo(self.containerTape);
			break;
			
			case CEL_WRITE:
				//read the next
				var sn=this.engine.getInstruction().read(c.x+1,c.y);
				var b=Bubble.create([s,sn] , c , this.phyInstruction);
				b.getElement().appendTo(this.containerInstruction);
				var ct={x:this.engine.getCursorTape().x,y:this.engine.getCursorTape().y};
				var b=Bubble.create( [CEL_WRITE,sn] , ct , this.phyTape);
				b.getElement().appendTo(this.containerTape);
				
			break;
		}
	},
	listen:function(enable){
		this.engine.removeListener('before-cycle',{o:this,f:this._readAndEmit});
		if(enable)
			this.engine.registerListener('before-cycle',{o:this,f:this._readAndEmit});
	},
};
BubbleEmitter.create = function( engine , containerInstruction , containerTape , phyTape , phyInstruction ){
	var m = new BubbleEmitter();
	m.init( engine , containerInstruction , containerTape , phyTape , phyInstruction );
	return m;
}




//== Composite =====

/**
 * @class a composition of two reactive maps and two animated cursors
 */
var Scene = function(){};
Scene.prototype = {
	
	engine : null,
	authorizerTape : null,
	authorizerInstruction : null,
	
	_phyTape : null,
	_phyInstruc : null,
	
	_cursorTape:null,
	_cursorInstr:null,
	
	_bubbleMgr:null,
	
	element : null,
	popUpLayer : null,
	
	initWithDim : function( width , height , engine , authorizerTape , authorizerInstruction ){
		
		
		// data
		this.engine = engine;
		this.authorizerTape = authorizerTape;
		this.authorizerInstruction = authorizerInstruction;
		
		this._initDOM( width , height );
		this.initInteraction();
		this.zoomable(true);
		this.followTapeCursor(true);
		this.followInstructionCursor(true);
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
		.css({'position':'absolute' , 'top':'0px' , 'z-index':5})
		.appendTo( element );
		
		var tapeEventlayer = $("<div>").attr( 'id' , 'tapeEventLayer' )
		.width(width).height(height/2)
		.css({'position':'absolute' , 'top':(height/2)+'px' , 'z-index':5})
		.appendTo( element );
		
		//popUpLayer
		var popUpLayer = $("<div>").attr( 'id' , 'popUpLayer' )
		.width(width).height(height)
		.css({'position':'absolute' , 'top':'0px' , 'z-index':10})
		.appendTo( element );
		
		///////
		// initiate elements
		this._phyTape = MapReactiveRenderer.createWithDimension( this.engine.getTape() , this.authorizerTape , tapeContainer , tapeEventlayer , popUpLayer  );
		this._phyInstruc = MapReactiveRenderer.createWithDimension( this.engine.getInstruction() , this.authorizerInstruction , instrContainer , instrEventlayer , popUpLayer );
		
		
		this._cursorInstr = AnimatedCursor.create( {o:this.engine,f:this.engine.getCursorInstr} , this._phyInstruc , instrContainer , instrEventlayer );
		this._cursorTape = AnimatedCursor.create( {o:this.engine,f:this.engine.getCursorTape} , this._phyTape , tapeContainer , tapeEventlayer );
		
		this._bubbleMgr = BubbleEmitter.create( this.engine , instrContainer , tapeContainer , this._phyTape , this._phyInstruc );
		
		
		this.element=element;
		this.popUpLayer=popUpLayer;
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
			var zoomLvls=[12,18,25,40,60];
			var zoom=2;
			var handler=function(e,delta){
				if(delta>0){
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
				
				self._cursorTape.resize( );
				self._cursorInstr.resize( );
				
				var c=self.engine.getCursorInstr()
				self._phyInstruc.focusOn(c.x,c.y,false);
				
				var c=self.engine.getCursorTape()
				self._phyTape.focusOn(c.x,c.y,false);
				
				e.preventDefault();
			};
			var makeMeZoomable=function(enable){
				self.element.unbind('mousewheel',handler);
				if( enable ){
					self.element.bind('mousewheel',handler);
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
		/*
		this._phyTape.cycle( dt );
		this._phyInstruc.cycle( dt );
		
		this._cursorTape.cycle( dt );
		this._cursorInstr.cycle( dt );
		*/
	},
	
	update : function(){
		
	},
	
	
	followTapeCursor:function(enable){
		this.engine.removeListener('set-cursor-tape',this);
		if( enable ){
			this.engine.registerListener('set-cursor-tape',{o:this,f:function(){
				var c=this.engine.getCursorTape();
				this._phyTape.focusOn(c.x,c.y);
			}});
			var c=this.engine.getCursorTape();
			this._phyTape.focusOn(c.x,c.y);
		}
		return this;
	},
	followInstructionCursor:function(enable){
		this.engine.removeListener('set-cursor-instruction',this);
		if( enable ){
			this.engine.registerListener('set-cursor-instruction',{o:this,f:function(){
				var c=this.engine.getCursorInstr();
				this._phyInstruc.focusOn(c.x,c.y);
			}});
			var c=this.engine.getCursorInstr();
			this._phyInstruc.focusOn(c.x,c.y);
		}
		return this;
	},
	popsUpBubble:function(enable){
		this._bubbleMgr.listen(enable);
		return this;
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
Scene.createWithDim = function( w,h,eng,authorizerTape,authorizerInstruction ){
	var md = new Scene();
	md.initWithDim( w,h,eng,authorizerTape,authorizerInstruction );
	return md;
};


var ToolBox = function(){};
ToolBox.prototype = {
	
	_main : null,
	
	_panels : null,
	
	_mode : null,
	
	_containerPanel : null,
	scene:null,
	element:null,
	
	$el:null,
	
	_speeds : [ 1 , 2 , 5 , 10  , 30 , 90 , 500 ],
	
	engineplayer:null,
	ll:null,
	
	init : function( scene , engineplayer , ll ){
		
		this.scene=scene;
		this.engineplayer=engineplayer;
		this.ll=ll;
		
		this.$el=$('#tools-box');
		
		engineplayer.registerListener('start',{o:this,f:this.runningChanged});
		engineplayer.registerListener('stop',{o:this,f:this.runningChanged});
		engineplayer.registerListener('set-speed',{o:this,f:this.speedChanged});
		
		
		
		//bind actions
		this.$el.find("[data-action=toggle-pop-up-interaction]")
		.on('mousedown',$.proxy( this.togglePopUp , this ) )
		.click()
		.tooltip({'title':function(){
			if( !$('#tools-box').find('[data-action=toggle-pop-up-interaction]').hasClass('active') )
				return 'unable animation on running';
			else
				return 'disable animation on running';
			},
			'placement':'left',
		 });
		
		this.$el.find("[data-action=toggle-follow-cursor]")
		.on('mousedown',$.proxy( this.toggleFollow , this ) )
		.click()
		.tooltip({'title':function(){
			if( !$('#tools-box').find('[data-action=toggle-follow-cursor]').hasClass('active') )
				return 'make the map follow the cursor';
			else
				return 'stop following the cursor';
			},
			'placement':'left',
		 });
		
		this.$el.find("[data-action=toggle-play]")
		.on('mousedown',$.proxy( this.togglePlay , this ) );
		
		this.$el.find("[data-action=play-next]")
		.on('mousedown',$.proxy( this.next , this ) );
		
		
		this.$el.find("[data-action=toggle-path-tracer]")
		.on('mousedown',$.proxy( this.togglePathTrace , this ) )
		.tooltip({'title':'route tracer tool'});
		 
		
		this.$el.find("[data-action=toggle-eraser]")
		.on('mousedown',$.proxy( this.toggleEraser , this ) )
		.tooltip({'title':'eraser tool'});
		
		this.$el.find('[data-action=speed-set]')
		.on('change',$.proxy(this.changeSpeed,this))
		.on('mousedown',function(e){
			e.stopPropagation();
		})
		.change();
		
		this.$el.find('[data-action=speed-up]')
		.on('mousedown',$.proxy(this.speedUp,this))
		.tooltip({'title':'increase the running speed','placement':'bottom'});
		
		this.$el.find('[data-action=speed-down]')
		.on('mousedown',$.proxy(this.speedDown,this))
		.tooltip({'title':'decrease the running speed','placement':'bottom'});
		
		
		this.$el.find('[data-action=reset-tape]')
		.on('mousedown',$.proxy(this.resetTape,this))
		.tooltip({'title':'reset the tape map and its cursor'})
		
		this.$el.find('[data-action=reset-instruction]')
		.on('mousedown',$.proxy(this.resetInstruction,this))
		.tooltip({'title':'reset the instruction map and its cursor'})
		
		
		this.$el.find('.nav').find('a').on( 'mousedown' , function( e ){
		  e.preventDefault();
		  e.stopPropagation();
		  $(this).tab('show');
		});
		
		$( this.$el.find('.nav').find('[data-target=#monitoring]') )
		.on('show',$.proxy( this.monitoringShow , this ) );
		
		$( this.$el.find('.nav').find('[data-target=#editing]') )
		.on('show',$.proxy( this.editingShow , this ) );
		
		this.$el.movable();
		

		$( this.$el.find('.nav').find('[data-target=#monitoring]') ).tab('show');
		
	},
	monitoringShow:function(){
		this.scene.getPhyTape().pathTracable( false ).erasable( false ).editable( false ).movable( true );
		this.scene.getPhyInstr().pathTracable( false ).erasable( false ).editable( false ).movable( true );
		
		this.$el.find("[data-action=toggle-path-tracer]").removeClass('active');
		this.$el.find("[data-action=toggle-eraser]").removeClass('active');
		
		this.scene.cursorInstMovable(false).cursorTapeMovable(false);
		
		if( !this.scene.authorizerTape.defaultValue )
			this.engineplayer.reset({'instruction':false,'tape':true,'undoable':false});
	},
	editingShow:function(){
		
		this.scene.getPhyTape().pathTracable( false ).erasable( false ).editable( true ).movable( true );
		this.scene.getPhyInstr().pathTracable( false ).erasable( false ).editable( true ).movable( true );
		
		this.scene.cursorInstMovable(true).cursorTapeMovable(true);
	},
	resetTape:function(e){
		
		this.engineplayer.stop();
		this.engineplayer.reset({'instruction':false,'tape':true});
		
		e.preventDefault();
		e.stopPropagation();
	},
	resetInstruction:function(e){
		
		this.engineplayer.stop();
		this.engineplayer.reset({'instruction':true,'tape':false});
		
		e.preventDefault();
		e.stopPropagation();
	},
	toggleEraser:function(e){
		var active= !this.$el.find("[data-action=toggle-eraser]").hasClass('active');
		
		if( active ){
			this.scene.getPhyTape().movable( false ).pathTracable( false ).erasable( true );
			this.scene.getPhyInstr().movable( false ).pathTracable( false ).erasable( true );
			
			this.$el.find("[data-action=toggle-path-tracer]").removeClass('active');
		}else{
			this.scene.getPhyTape().erasable( false );
			this.scene.getPhyInstr().erasable( false );
			
			
			if( this.$el.find("[data-action=toggle-path-tracer]").hasClass('active') ){
				this.scene.getPhyTape().movable( false ).pathTracable( true );
				this.scene.getPhyInstr().movable( false ).pathTracable( true );
			}else{
				this.scene.getPhyTape().pathTracable( false ).movable( true );
				this.scene.getPhyInstr().pathTracable( false ).movable( true );
			}
		}
	},
	togglePathTrace:function(e){
		var active= !this.$el.find("[data-action=toggle-path-tracer]").hasClass('active');
		
		if( active ){
			this.scene.getPhyTape().movable( false ).erasable( false ).pathTracable( true );
			this.scene.getPhyInstr().movable( false ).erasable( false ).pathTracable( true );
			
			this.$el.find("[data-action=toggle-eraser]").removeClass('active');
		}else{
			this.scene.getPhyTape().pathTracable( false );
			this.scene.getPhyInstr().pathTracable( false );
			
			
			if( this.$el.find("[data-action=toggle-eraser]").hasClass('active') ){
				this.scene.getPhyTape().movable( false ).erasable( true );
				this.scene.getPhyInstr().movable( false ).erasable( true );
			}else{
				this.scene.getPhyTape().erasable( false ).movable( true );
				this.scene.getPhyInstr().erasable( false ).movable( true );
			}
		}
		
	},
	speedUp:function(e){
		var s=this.engineplayer.getSpeed();
		
		for(var i=0;i<this._speeds.length && s!=this._speeds[i];i++);
			
		this.engineplayer.setSpeed( this._speeds[ Math.min(this._speeds.length-1,i+1) ] );
		
		e.preventDefault();
		e.stopPropagation();
	},
	speedDown:function(e){
		var s=this.engineplayer.getSpeed();
		
		for(var i=0;i<this._speeds.length && s!=this._speeds[i];i++);
			
		this.engineplayer.setSpeed( this._speeds[ Math.max(0,i-1) ] );
		
		e.preventDefault();
		e.stopPropagation();
	},
	changeSpeed:function(e){
		
		this.engineplayer.setSpeed( this._speeds[ parseInt(this.$el.find('[data-action=speed-set]').attr('value')) ] );
		
		e.preventDefault();
		e.stopPropagation();
	},
	togglePlay:function(e){
		if(!this.engineplayer.isRunning())
			this.engineplayer.start();
		else
			this.engineplayer.stop();
		
		e.preventDefault();
		e.stopPropagation();
	},
	next:function(e){
		this.scene.getEngine().cycle();
		e.preventDefault();
		e.stopPropagation();
	},
	togglePopUp:function(e){
		var active=!this.$el.find("[data-action=toggle-pop-up-interaction]").hasClass('active');
		this.scene.popsUpBubble( active );
		e.preventDefault();
		e.stopPropagation();
	},
	toggleFollow:function(e){
		var active=!this.$el.find("[data-action=toggle-follow-cursor]").hasClass('active');
		this.scene
		.followTapeCursor( active )
		.followInstructionCursor( active );
		e.preventDefault();
		e.stopPropagation();
	},
	
	runningChanged:function(){
		if( this.engineplayer.isRunning() )
			this.$el.find("[data-action=toggle-play]").addClass('paused').addClass('active');
		else
			this.$el.find("[data-action=toggle-play]").removeClass('paused').removeClass('active');
	},
	speedChanged:function(){
		var s=this.engineplayer.getSpeed();
		
		for(var i=0;i<this._speeds.length && s!=this._speeds[i];i++);
		
		this.$el.find('[data-action=speed-set]').attr('value' , i );
		
		this.$el.find("[data-action=number-cycle]")
		.empty()
		.wrapInner( s );
	},	
	
	getElement : function(){
		return this.$el;
	},
	
};
ToolBox.create = function( scene , engineplayer , ll ){
	var m = new ToolBox();
	m.init( scene , engineplayer , ll );
	return m;
}

//// ctrl z - ctrl y listener
$(document).ready(function(){
		$(document).on('keyup' , function(e){
			if(!e.ctrlKey)
				return;
			switch(e.which){
				case 90:
					cmd.mgr.undo();
				break;
				case 89:
					cmd.mgr.redo();
				break;
			}
		});
});

var SaveLoadView=function(){};
SaveLoadView.prototype={
	engine:null,
	element:null,
	init:function(engine,engineplayer,panel){
		this.engine=engine;
		this.engineplayer=engineplayer;
		
		var save=function(){
			
			var instruction=panel.find( '#collapse-save #save-instruction' ).length==0?true:panel.find( '#collapse-save #save-instruction' ).is(':checked');
			var tape=panel.find( '#collapse-save #save-panel' ).length==0?true:panel.find( '#collapse-save #save-tape' ).is(':checked');
			
			var save = this.save({
				instructionMap:instruction,
				instructionCursor:instruction,
				tapeMap:tape,
				tapeCursor:tape,
			});
			var s=JSON.stringify(save);
			
			panel.find( '#collapse-save input[type=text]' )
			.val(s)
			.focus()
			.select();
			
			
			/*
				// not working properly 
				panel.find( '[data-action=link]' )
				.children().remove();
				
				panel.find( '[data-action=link]' )
				.append( this.generateLink(s) )
				.append( this.generateGetLink(s) );
				
				panel.find( '[data-action=link] a' )
				.on( 'mousedown' , function(e){
					if(e.which==1){
						alert('use right click , save as\n otherwise we will lose what you are doing');
						e.stopPropagation();
						e.preventDefault();
					}
				});
				*/
		};
		
		panel.find("[data-action=save]").on('click',
			$.proxy( function(e){
				save.call(this);
				panel.find("#collapse-save").collapse('show');
			},this));
		
		panel.find("#collapse-save input[type=checkbox]").on('change',$.proxy( save ,this));
		
		
		panel.find( 'input[type=text]' )
		.on('click' , function(e){ 
			$(e.target).focus().select(); 
			e.stopPropagation(); 
			e.preventDefault();
		} );
		
		var loadinput=function(e){ 
			var s=$(e.target).val();
			if(s.trim().length>0){
				var save=JSON.parse(s);
				this.load(save,
					panel.find( '#collapse-load #load-instruction' ).is(':checked'),
					panel.find( '#collapse-load #load-tape' ).is(':checked')
					);
				panel.find("#collapse-load").collapse('hide');
				panel.find( '#collapse-load input[type=text]' ).val('');
			}
			e.stopPropagation(); 
			e.preventDefault();
		};
		
		panel.find( '#collapse-load input[type=text]' )
		.on('focusout' , $.proxy( loadinput,this) )
		.on('keydown' , $.proxy( function(e){
			if(e.which==13)
				loadinput.call(this,e);
		},this) );
		
		panel.find( '#collapse-load input[type=file]' )
		.on('change' , $.proxy( function(e){
			var file=e.target.files[0];
			var fr=new FileReader();
			fr.onload=$.proxy(function(e){
				var s=e.target.result;
				if(s.trim().length>0){
					var save=JSON.parse(s);
					this.load(save);
				}
			},this);
			fr.readAsText(file);
		},this) );
		
		panel.movable();
	},
	generateLink:function(save){
		return $('<form name="pseudoform" method="post" action="http://arthur-brongniart.fr/Stockage/worstProxyEver/proxy.php"><input type="hidden" name="stuff" value=\'' + save +'\'/><input type="submit"></input><a target="_blank" href="javascript:pseudoform.submit()">file ( post method )</a></form>');	
	},
	generateGetLink:function(save){
		return $('<a href=\'http://arthur-brongniart.fr/Stockage/worstProxyEver/proxy.php?stuff='+save+'\' target="_blank" >file ( get method )</a>');	
	},
	save:function(options){
		options=options||{};
		var s={};
		
		if( options.instructionMap != null ? options.instructionMap : true )
			s[ 'writeManualInstruction' ] = this.engine.getInstruction().getRewriteManual();
		
		if( options.instructionCursor != null ? options.instructionCursor : true )
			s[ 'cursorInstruction' ] = this.engine.getCursorInstr();
		
		if( options.tapeMap != null ? options.tapeMap : true )
			s[ 'writeManualTape' ] = this.engine.getTape().getRewriteManual();
		
		if( options.tapeCursor != null ? options.tapeCursor : true )
			s[ 'cursorTape' ] = this.engine.getCursorTape();
		
		return s;
	},
	load:function(save,instruction,tape){
		instruction= instruction != null ? instruction : true;
		tape = tape != null ? tape : true;
		var options={
			'lvl':save,
			'instruction' : instruction && save.writeManualInstruction != null,
			'tape' : tape && save.writeManualTape != null,
		};
		this.engineplayer.reset( options );
	},
};
SaveLoadView.create = function( engine,engineplayer,panel ){
     var s=new SaveLoadView()
	 s.init(engine,engineplayer,panel);
	 return s;
};


var LevelsLoader=function(){};
extend( LevelsLoader , AbstractNotifier.prototype );
extend( LevelsLoader , {
	engine:null,
	authorizerTape:null,
	authorizerInstruction:null,
	level:-1,
	descriptionLayer:null,
	wintests:null,
	init:function(engine,authorizerTape,authorizerInstruction){
		this.engine=engine;
		this.authorizerTape=authorizerTape;
		this.authorizerInstruction=authorizerInstruction;
	},
	next:function(){
		this.level = Math.min( this.level+1 , levels.length-1 );
		this.load();
		this.notify('set-level');
	},
	prev:function(){
		this.level = Math.max( this.level-1 , 0 );
		this.load();
		this.notify('set-level');
	},
	gotoLvl:function(v){
		this.level = v;
		this.load();
		this.notify('set-level');
	},
	getLvl:function(){
		return levels[this.level];
	},
	load:function(){
		
		var lvl=this.getLvl();
		
		this.authorizerInstruction.init( lvl.authorizerInstruction.defaultValue , lvl.authorizerInstruction.exceptions , lvl.authorizerInstruction.cursorCtrl );
		this.authorizerTape.init( lvl.authorizerTape.defaultValue , lvl.authorizerTape.exceptions , lvl.authorizerTape.cursorCtrl );
		
		//win test
		this.wintests={};
		var self=this;
		self.engine.getTape().removeListener('write',this);
		self.engine.getInstruction().removeListener('write',this);
		self.engine.removeListener('set-cursor-instruction',this);
		self.engine.removeListener('set-cursor-tape',this);
		if(lvl.winTest.tapeEquals){
			this.wintests['tapeEquals']=false;
			self.engine.getTape().registerListener('write',{o:this,f:function(){
					var i=lvl.winTest.tapeEquals.length;
					while(i--){
						var g=lvl.winTest.tapeEquals[i];
						if( self.engine.getTape().read(g.x,g.y)!=g.s )
							return;
					};
					self.wintests['tapeEquals']=true;
					self.win();
			}});
		}
		if(lvl.winTest.cursorInstruction){
			this.wintests['cursorInstruction']=false;
			self.engine.registerListener('set-cursor-instruction',{o:this,f:function(){
					if(self.engine.getCursorInstr().x!=lvl.winTest.cursorInstruction.x||self.engine.getCursorInstr().y!=lvl.winTest.cursorInstruction.y)
						return;
					self.wintests['cursorInstruction']=true;
					self.win();
			}});
		}
	},
	win:function(){
		for(var i in this.wintests)
			if(!this.wintests[i])
				return;
		
		//ok!
		this.notify('win');
	},
});
LevelsLoader.create=function(engine,authorizerTape,authorizerInstruction){
	var ll=new LevelsLoader();
	ll.init(engine,authorizerTape,authorizerInstruction);
	return ll;
};


var DecriptionPanelView=function(){};
DecriptionPanelView.prototype={
	navigation:null,
	description:null,
	
	engineplayer:null,
	ll:null,
	
	lang:'fr',
	
	init:function(engineplayer,ll,description,navigation){
		this.navigation=navigation;
		this.description=description;
		
		this.engineplayer=engineplayer;
		this.ll=ll;
		
		var rek=(/lang=([^&]+)/).exec(document.URL);
		this.lang = rek==null?'fr':rek[1];
		if(this.lang!="eng"&&this.lang!="fr")
			this.lang="fr";
		
		for( var i=0;i<levels.length;i++)
			this.navigation.find('#exercices').append( $('<button class="btn" data-i="'+i+'">'+(i+1)+'</button>') );
		
		
		var table=$('<ul>');
		var group=[ 
			{a:0,  b:2,  title:'découverte'},
			{a:3,  b:4,  title:'premiers programmes'},
			{a:5,  b:9,  title:'arithmétique'},
			{a:10,  b:11,  title:'représentation binaire'},
			{a:12,  b:12,  title:'bonus'},
		];
		var tmp=$('<div>');
		for(var i=0;i<group.length;i++){
			var l=$('<ul>');
			for(var j=group[i].a;j<=group[i].b;j++){
				tmp.empty().wrapInner(  $(".descriptionPool[lang="+this.lang+"]").children(".description[data-id="+j+"]").html()  );
				var title=tmp.find('h1').text();
				$('<li>'+(j+1)+' : <a data-i="'+j+'">'+title+'</a></li>')
				.appendTo(l)
				.find('a')
				.on('click',$.proxy(function(e){
					this.ll.gotoLvl( parseInt( $(e.target).attr('data-i') ) );
					e.preventDefault();
					e.stopPropagation();
				},this))
			}
			table.append( $('<li><h4>'+group[i].title+'</h4></li>').append(l) );
		};
		$('#summary-btn').popover({
			'title':$('<h4>summary</h4>'),
			'placement':'top',
			'trigger':'click',
			'html':true,
			'content':table
		})
		
		this.navigation.find('.btn-group .btn')
		.on('click' , $.proxy( function(e){ if($(e.target).attr('data-i')==null)return; this.ll.gotoLvl( parseInt( $(e.target).attr('data-i') ) ); } ,this ) );
		
		this.navigation.find('.btn[data-action="next"]')
		.on('click' , $.proxy( function(e){ this.engineplayer.stop(); this.ll.next(); } ,this ) );
		
		this.navigation.find('.btn[data-action="solution"]')
		.on('click' , $.proxy( function(e){ this.engineplayer.stop(); this.engineplayer.reset({'solution':true}); } ,this ) );
		
		this.ll.registerListener( 'set-level' , {o:this,f:this.loadLevel} );
		this.ll.registerListener( 'win' , {o:this,f:this.win} );
	},
	loadLevel:function(){
		var lvl=this.ll.getLvl();
		
		//load the html description
		this.description.children().remove();
		this.description.empty().wrapInner( $(".descriptionPool[lang="+this.lang+"]").children(".description[data-id="+this.ll.level+"]").html() );
		
		//reset btn
		this.navigation.find('.btn[data-action="next"]')
		.removeClass('btn-success');
			
		this.navigation.find('.btn-group .btn:not(#summary-btn)').removeClass('active')
		this.navigation.find('.btn-group .btn[data-i='+this.ll.level+']').addClass('active');
	},
	win:function(){
		this.navigation.find('.btn[data-action="next"]').addClass("btn-success");
		this.navigation.find('.btn-group .btn[data-i='+this.ll.level+']').addClass("btn-success");
	},
};
DecriptionPanelView.create=function(engineplayer,ll,description,navigation){
	var a=new DecriptionPanelView();
	a.init(engineplayer,ll,description,navigation);
	return a;
};


scope.SaveLoadView = SaveLoadView;
scope.DecriptionPanelView = DecriptionPanelView;
scope.EnginePlayer = EnginePlayer;
scope.TuringEngine = TuringEngine;
scope.Authorizer = Authorizer;
scope.Scene = Scene;
scope.ToolBox = ToolBox;
scope.LevelsLoader = LevelsLoader;

scope.SocialMap = SocialMap;

scope.initWhenDOMLoaded=initWhenDOMLoaded;

} )( window );


// disable selection
document.onselectstart = function(e) {
  return false;
};

/**
 * jQuery plugin for making an element draggable
 */
(function($){
	var Mover=function(element,option){
		this.drag=false;
		this.anchor={x:0,y:0};
		this.anchorD={x:0,y:0};
		this.$element=element;
		this.$target=option.target||element;
		this.listen();
	};
	Mover.prototype={
		
		$element:null,
		
		drag:null,
		
		anchor:null,
		anchorD:null,
		
		startmove:function(e){
			this.drag=true;
			$('body').bind('mousemove',$.proxy(this.move,this));
			$('body').bind('mouseup',$.proxy(this.stopmove,this));
			this.anchorD.x=this.$element.position().left;
			this.anchorD.y=this.$element.position().top;
			
			this.anchor.x=e.pageX;
			this.anchor.y=e.pageY;
		},
		move:function(e){
			if(this.drag){
				var dx=this.anchor.x-e.pageX,
					dy=this.anchor.y-e.pageY;
					
				this.$element.css({'left':(this.anchorD.x-dx)+'px','top':(this.anchorD.y-dy)+'px'});
			}
		},
		stopmove:function(e){
			if(this.drag){
				$('body').unbind('mousemove',$.proxy(this.move,this));
				$('body').unbind('mouseup',$.proxy(this.stopmove,this));
				this.drag=false;
			}
		},
		
		listen:function(){
			this.$target.bind('mousedown',$.proxy(this.startmove,this));
		},
		
	};
	
	
	$.fn.movable=function( options ){
		return this.each(function(){
			var el=$(this);
			el.data('Mover', new Mover(el,options||{}));
		});
	};
})(window.jQuery);







/*
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