
var extend = function( child , f ){
	for( var p in f )
		child.prototype[ p ] = f[ p ];
};


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
			this._datamap.removeListener('struct', {o:this,f:this.update} );
			if( enable ){
				this._datamap.registerListener('struct', {o:this,f:this.update} );
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
		factory:null,
		element:null,
		_drawn:null,
		init:function(el){
			this.element=$('<div>')
			.addClass( 'tile' )
			.css({'position':'absolute'})
			.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
			
			if(el)
				this.element.appendTo(el);
			
			this._drawn=-1;
		},
		resize:function(){
			this.element.width( tileSize ).height( tileSize ).attr( "width" , tileSize ).attr( "height" , tileSize );
		},
		draw:function(symbol){
			if( this._drawn == symbol )	//already drawn
				return;	
				
			this.element.removeClass( 'symbol-'+this._drawn );
			
			this.element.addClass( 'symbol-'+symbol );
			
			this._drawn=symbol;
			
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
	
	
	var Chunk={};
	
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
			this.tiles=new Array( chunkSize*chunkSize );
			for(var x=0;x<chunkSize;x++)
			for(var y=0;y<chunkSize;y++){
				this.tiles[x*chunkSize+y]=Tile.create(this.element);
				this.tiles[x*chunkSize+y].move(x*tileSize,y*tileSize);
			}
		},
		resize:function(){
			for(var x=0;x<chunkSize;x++)
			for(var y=0;y<chunkSize;y++){
				this.tiles[x*chunkSize+y].move(x*tileSize,y*tileSize);
				this.tiles[x*chunkSize+y].resize();
			}
		},
		draw:function( symbols ){
			var i=this.tiles.length;
			while(i--)
				this.tiles[i].draw(symbols[i]);
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
	Chunk.create=function(el){
		var d=new DOMChunk();
		d.init(el);
		return d;
	};
	
	
	
	var Renderer = function(){};
	extend( Renderer , {
		_datamap:null,
		_dirty:null,
		_sceneSize:null,
		_origin:null,
		_lastOrigin:null,
		_chunks:null,
		_container:null,
		initWithDimension:function(datamap,container){
			this._datamap=datamap;
			this.listen(true);
			
			this._sceneSize = { x : container.width() , y : container.height() };
			this._origin = { x : 0 , y : 0 };
			this._lastOrigin = { x : 0 , y : 0 };
			
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
			
			var dx= this._lastOrigin.x-this._origin.x,
				dy=	this._lastOrigin.y-this._origin.y;
			
			var ts=tileSize*chunkSize;
			
			var olx=Math.floor(this._lastOrigin.x/chunkSize)+1,
				oly=Math.floor(this._lastOrigin.y/chunkSize)+1;
			
			var ox=Math.floor(this._origin.x/chunkSize)+1,
				oy=Math.floor(this._origin.y/chunkSize)+1;
			
			if( dx>0 ){
				for(var i=ox;i<olx;i++){
				// need a circular permutation
					var j=this._sceneDim.y;
					var tmp;
					while(j--){
						//circular permutation
						tmp=this._chunks[j];
						var end=this._sceneDim.x*this._sceneDim.y;
						for(var k=this._sceneDim.y;k<end;k+=this._sceneDim.y)
							this._chunks[k-this._sceneDim.y+j]=this._chunks[k+j];
						this._chunks[k-this._sceneDim.y+j]=tmp;
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
					}
				}
			}
			
			if( dy>0 ){
				for(var i=oy;i<oly;i++){
				// need a circular permutation
					var j=this._sceneDim.x;
					var tmp;
					while(j--){
						//circular permutation
						tmp=this._chunks[j*this._sceneDim.y];
						for(var k=1;k<this._sceneDim.y;k++)
							this._chunks[k-1+j*this._sceneDim.y]=this._chunks[k+j*this._sceneDim.y];
						this._chunks[k-1+j*this._sceneDim.y]=tmp;
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
					}
				}
			}
			
			var ts=tileSize*chunkSize;
			
			var ix = (((this._origin.x/chunkSize)%1+1)%1 -1),
				iy = (((this._origin.y/chunkSize)%1+1)%1 -1);
			
			var chunk;
			
			var x=this._sceneDim.x,
				y,
				cx,
				cy,
				symbols=new Array(chunkSize*chunkSize);
			while(x--){
			y=this._sceneDim.y;
			while(y--){				//loop on all the cell
				
				chunk=this._chunks[ x * this._sceneDim.y + y ];
				
				//draw the symbol
				cx=chunkSize;
				while(cx--){
				cy=chunkSize;
				while(cy--){
					symbols[cx*chunkSize+cy]=this._datamap.read( (x-ox)*chunkSize+cx , (y-oy)*chunkSize+cy );
				}
				}
				chunk.draw( symbols );
				
				//move
				chunk.move( (x+ix)*ts , (y+iy)*ts );
			}
			}
			this._lastOrigin.x=this._origin.x;
			this._lastOrigin.y=this._origin.y;
		},
		setTileSize:function(ts){
			tileSize=ts;
			this._adaptCellsToDim();
			this.update();
		},
		listen:function(enable){
			this._datamap.removeListener('struct', {o:this,f:this.update} );
			if( enable ){
				this._datamap.registerListener('struct', {o:this,f:this.update} );
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
	Renderer.createWithDimension=function(datamap,container){
		var m=new Renderer();
		m.initWithDimension(datamap,container);
		return m;
	}
	
	return Renderer;
})();


