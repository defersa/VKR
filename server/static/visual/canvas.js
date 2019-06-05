function cnvs_ui(options){

	const delay = 5;

	var _canvas;
	var _sources;
	var _model;

	var _setting;
	var _statistic;
	var _functions;
	var _size;

	var _colors;

	var link = this;
	var fragment = document.createDocumentFragment();

	//GLOBAL FUNCTIONS

	link.create = function(options){
		if(_canvas)			link.remove();

		if(options.parent == undefined)			options.parent = document.body;

		CREATE.canvas();
		CREATE.sources();

		_setting = { layers: [] };
		_functions = {};
		_size = { dpi: 1, scale: 1 };

		window.addEventListener('resize', DISPLAY.generate);

		link.change(options);
	}

	link.change = function(options){
		if(options == undefined)	options = {};

		if(options.parent !== undefined)		CHANGE.parent(options);
		if(options.type !== undefined)			_setting.type = options.type;
		
		if(options.sources !== undefined)		CHANGE.sources(options);

		if(options.functions !== undefined)		CHANGE.functions(options);
		if(options.layers !== undefined)		CHANGE.layers(options);
		if(options.carriage !== undefined)		_setting.carriage = options.carriage;
		if(options.scale !== undefined)			_size.scale = options.scale;
		if(options.step !== undefined)			_setting.step = options.step;
		if(options.stations !== undefined)		MODEL.stations = options.stations;
		if(options.intensity !== undefined)		MODEL.intensity = options.intensity;
		if(options.trainCount !== undefined)	MODEL.trainCount = options.trainCount;
		if(options.startTime !== undefined)		_setting.startTime = options.startTime;
		if(options.endTime !== undefined)		_setting.endTime = options.endTime;

		DISPLAY.generate();
	}
	
	link.remove = function(){
	}

	//INNER OBJECTS

	var GET = {
		
	}

	var EVENTS = {
		e: null,
		key:{
			down: function(e){
				var kc = e.keyCode;
				if(187 == kc){
					SCROLL.scale(0.1);
				}
				if(189 == kc){
					SCROLL.scale(-0.1);
				}
				DISPLAY.canvas();
			}
		},
		down: {
			canvas: function(e){
				EVENTS.e = e;
				window.addEventListener("mousemove", EVENTS.move.canvas);
				window.addEventListener("mouseup", EVENTS.up.canvas);
			}
		},
		move: {
			canvas: function(e){
				if( Math.abs(EVENTS.e.pageX - e.pageX) > 3 || Math.abs(EVENTS.e.pageY - e.pageY) ){

					window.removeEventListener("mousemove", EVENTS.move.canvas);
					window.removeEventListener("mouseup", EVENTS.up.canvas);

					SCROLL.down(EVENTS.e);
				}
			}
		},
		up: {
			canvas: function(e){

				window.removeEventListener("mousemove", EVENTS.move.canvas);
				window.removeEventListener("mouseup", EVENTS.up.canvas);
				
				EDIT.click(e);
			}
		},
		wheel: {
			canvas: function(e){
				SCROLL.wheel(e);
			}
		}
	}

	var CREATE = {
		canvas: function(){
			_canvas = {};
			_canvas.html = tools.createHTML({
				tag: 'canvas',
				tabIndex: 1,
				className: 'map-canvas',
				parent: fragment,
				onwheel: EVENTS.wheel.canvas,
				onmousedown: EVENTS.down.canvas,
				onkeydown: EVENTS.key.down
			});
			_canvas.ctx = _canvas.html.getContext("2d");
		},
		sources: function(){
			_sources = { };
		}
	}
	
	var CHANGE = {
		parent: function(options){
			_setting.parent = options.parent;
			if(_setting.parent instanceof Node){
				_setting.parent.appendChild(_canvas.html);
			} else {
				fragment.appendChild(_canvas.html);
			}
		},
		sources: function(options){
			_sources = options.sources;
			if(_sources.g){
				_canvas.html.onmousedown = false;
				_canvas.html.onwheel = false;
				DISPLAY.s.l = 0;
				DISPLAY.s.t = 20;
			}

			if(_sources.l){
				_canvas.html.onwheel = false;
				DISPLAY.s.l = -180 + _sources.l.r.length*2;
				DISPLAY.s.t = -5;
			}
		},
		functions: function(options){
			if(options.functions.select !== undefined)		_functions.select = options.functions.select;
		},
		layers: function(options){
		}
	}

	//INNER FUNCTIONS

	var DISPLAY = new function(){
		var s = this.s = { l: -50, t: -50 };


		this.generate = function(){
			_canvas.coord = _canvas.html.getBoundingClientRect();

			_canvas.width = _canvas.coord.right - _canvas.coord.left;
			_canvas.height = _canvas.coord.bottom - _canvas.coord.top;

			if( (_canvas.height < 0) || (_canvas.width < 0) )	return;

			_canvas.html.width = s.wt = _canvas.width * _size.dpi;
			_canvas.html.height = s.ht = _canvas.height * _size.dpi;

			s.width = _canvas.width * _size.dpi / _size.scale;
			s.height = _canvas.height * _size.dpi / _size.scale;

			DISPLAY.canvas();
		}

		this.canvas = function(){
			var c = _canvas.ctx;

			c.fillStyle = '#FFFFFF';
			c.strokeStyle = '#135ea8';
			c.lineWidth = _size.scale;

			c.fillRect( 0, 0, _canvas.width*_size.dpi, _canvas.height*_size.dpi );


			c.translate( 
				- _size.scale * s.l,
				- _size.scale * s.t
			);


			if(_sources.g){
				draw.g(c);
			}
			if(_sources.l){
				draw.l(c);
			}
			c.translate( 
				 _size.scale * s.l,
				 _size.scale * s.t );

		}
 		var gides = {
 			v: function(c){
 				fline = (Math.floor(s.l/50) + 1)*50;
			
 				c.lineWidth = 0.2*_size.scale;
				c.strokeStyle = '#222222';
				c.fillStyle = '#777777';
	
				c.textAlign = "left";
				c.textBaseline = "top";
				c.font = 4*_size.scale + 'px sans-serif';
	
				c.beginPath();
				while(fline < s.l + s.width){
					c.fillText(
						fline,
						_size.scale * (fline + 2),
						_size.scale * (s.t));
					c.moveTo(
						_size.scale * (fline),
						_size.scale * (s.t) );	
					c.lineTo(
						_size.scale * (fline),
						_size.scale * (s.height + s.t) );
					fline += 50;
				}
				c.stroke();
				c.closePath();
			},
			h: function(c){
				fline = (Math.floor(s.t/50) + 1)*50;

 				c.lineWidth = 0.2*_size.scale;
				c.strokeStyle = '#222222';
				c.fillStyle = '#777777';
	
				c.textAlign = "left";
				c.textBaseline = "top";
				c.font = 4*_size.scale + 'px sans-serif';
				
				c.beginPath();
				while(fline < s.t + s.height){
					c.fillText(
						fline,
						_size.scale * (s.l),
						_size.scale * (fline + 2));
					c.moveTo(
						_size.scale * (s.l),
						_size.scale * (fline) );	
					c.lineTo(
						_size.scale * (s.width + s.l),
						_size.scale * (fline) );
					fline += 50;
				}
				c.stroke();
				c.closePath();
			}
 		}

 		var rotation = function(p, ang){
 			x = p[0]*Math.cos(ang*Math.PI) - p[1]*Math.sin(ang*Math.PI);
 			y = p[0]*Math.sin(ang*Math.PI) + p[1]*Math.cos(ang*Math.PI);
 			return [x, y];
 		}

 		var draw = {
 			g: function(c){
 				var sum = _sources.g.p + _sources.g.w + _sources.g.d;
 				var sumpiece = 0;

 				c.beginPath();
 				c.lineWidth = 50*_size.scale;
				c.strokeStyle = colorStat[2];

 				c.arc(
 					_size.scale*100,
 					_size.scale*100,
 					_size.scale*50,
 					0,
 					(_sources.g.d/sum)*Math.PI*2
 				);
         		c.stroke();

 				c.beginPath();
 				c.lineWidth = 50*_size.scale;
				c.strokeStyle = colorStat[1];

 				c.arc(
 					_size.scale * 100,
 					_size.scale * 100,
 					_size.scale * 50,
 					(_sources.g.d/sum)*Math.PI*2,
 					(_sources.g.w/sum + _sources.g.d/sum)*Math.PI*2
 				);
         		c.stroke();

         		var arg = _sources.g.d/sum + _sources.g.w/sum;
         		var arg = (arg) ? arg : 1;

 				c.beginPath();
 				c.lineWidth = 50*_size.scale;
				c.strokeStyle = colorStat[0];
 				c.arc(
 					_size.scale * 100,
 					_size.scale * 100,
 					_size.scale * 50,
 					(arg)*Math.PI*2,
 					0
 					);
				c.stroke();


				c.fillStyle = colorStat[2];
				c.fillRect(
					_size.scale * (20),
					_size.scale * (180),
					_size.scale * (10),
					_size.scale * (10),
					);
				label.string(c, [35, 185], "Состояние 'Опастность'")
				c.fillStyle = colorStat[1];
				c.fillRect(
					_size.scale * (20),
					_size.scale * (195),
					_size.scale * (10),
					_size.scale * (10),
					);
				label.string(c, [35, 200], "Состояние 'Внимание'")
				c.fillStyle = colorStat[0];
				c.fillRect(
					_size.scale * (20),
					_size.scale * (210),
					_size.scale * (10),
					_size.scale * (10),
					);
				label.string(c, [35, 215], "Нормальное состояние")
 			},
 			l: function(c){

 				normalize()

				c.fillStyle = "#000000";

 				c.fillRect(
					_size.scale * -1,
					_size.scale * -1,
					_size.scale * 1,
					_size.scale * 110
				);
				c.fillRect(
					_size.scale * -9,
					_size.scale * 100,
					_size.scale * 10000,
					_size.scale * 1
				);
				label.string(c, [ -10, 108 ], '0');
				label.string(c, [ -10, 0 ], '1');

				for(var i = 1; i < 100; i++){
					label.string(c, [ 100*i, 108 ], 50*i);
					c.fillRect(
						_size.scale * (100*i - 1),
						_size.scale * 99,
						_size.scale * 2,
						_size.scale * 4
					);
				}

				// dangerous
				c.strokeStyle = '#FF0000';
				c.lineWidth = 0.5*_size.scale;
				c.beginPath();
				c.moveTo(
					_size.scale * 0,
					_size.scale * ( 100 - _sources.l.d*100)
				);
				c.lineTo(
					_size.scale * 10000,
					_size.scale * ( 100 - _sources.l.d*100)
				);

				c.stroke();
				c.closePath();

				// warning
				c.strokeStyle = '#FFD300';
				c.lineWidth = 0.5*_size.scale;
				c.beginPath();
				c.moveTo(
					_size.scale * 0,
					_size.scale * ( 100 - _sources.l.w*100)
				);
				c.lineTo(
					_size.scale * 10000,
					_size.scale * ( 100 - _sources.l.w*100)
				);

				c.stroke();
				c.closePath();

				var colors = [
					"#e84c3d",
					"#3598db",
					"#1bbc9b",
					"#9b58b5",
					"#34495e",
					"#f1c40f",
					"#95a5a5"

				];

				c.lineWidth = 1*_size.scale;

				c.beginPath();
				c.strokeStyle = colors[1];
				var count = 1;

				c.moveTo(
					_size.scale * 0,
					_size.scale * ( 100 - _sources.l.r[0]*100)
				);
				for(; count < _sources.l.r.length; count++){
					c.lineTo(
						_size.scale * 2 * count,
						_size.scale * ( 100 - _sources.l.r[count]*100)
					);
				}
				c.stroke();
				c.closePath();


				c.beginPath();
				c.strokeStyle = colors[3];

				c.fillRect(
					_size.scale * 2 * (count - 1),
					_size.scale * -1,
					_size.scale * 0.5,
					_size.scale * 100
				);

				c.moveTo(
					_size.scale * 2 * (count - 1),
					_size.scale * ( 100 - _sources.l.r.last()*100)
				);

				for(var i = 0; i < _sources.l.p.length; i++){
					c.lineTo(
						_size.scale * 2 * (count + i),
						_size.scale * ( 100 - _sources.l.p[i]*100)
					);
				}
				c.stroke();
				c.closePath();
 			}
 		}

 		var label = {
 			station: function(c, point, station){
				c.fillStyle = '#FFFFFF';
 				c.textAlign = "center";
				c.textBaseline = "middle";
				c.font = '14px sans-serif';
	
				var width = (c.measureText(station.name).width)/2 + 3;
	
				c.font = 14*_size.scale + 'px sans-serif';
	
				c.fillRect(
					_size.scale * (point[0] - width),
					_size.scale * (point[1] - 20),
					_size.scale * (width*2),
					_size.scale * (40),
					);
	
				c.fillStyle = '#444444';
	
				c.fillText(
					station.name,
					_size.scale * (point[0]),
					_size.scale * (point[1] - 10));

				c.fillText(
					'Count: ' + station.countIn,
					_size.scale * (point[0]),
					_size.scale * (point[1] + 10));

 			},
 			string: function(c, point, text){

				c.fillStyle = '#FFFFFF';
	 			c.textAlign = "left";
				c.textBaseline = "middle";
				c.font = '14px sans-serif';

				var width = (c.measureText(text).width)/2 + 3;

				c.font = 10*_size.scale + 'px sans-serif';

				c.fillStyle = '#444444';

				c.fillText(
					text,
					_size.scale * (point[0]),
					_size.scale * (point[1]));
 			}
 		}
	}

	var SCROLL = new function(){
		var s = this.s = {};

		this.down = function(e){
			s.e = s.ne = e;
			s.show = true;
			s.l = DISPLAY.s.l;
			s.t = DISPLAY.s.t;

			redrow();

			window.addEventListener("mousemove", move);
			window.addEventListener("mouseup", up);
		}

		var redrow = function(){
			if(s.show){
				DISPLAY.s.l = s.l + (s.e.pageX - s.ne.pageX)/_size.scale;
	
				DISPLAY.canvas();
				s.show = false;
			}
			timer = setTimeout(redrow, delay);
		}

		var move = function(e){
			s.show = true;
			s.ne = e;
		}

		var up = function(e){
			window.removeEventListener("mousemove", move);
			window.removeEventListener("mouseup", up);
		}

		this.scale = function(des){
			if(_size.scale + des < 0.1) 	return;
		
			DISPLAY.s.l += + DISPLAY.s.width/2;
			DISPLAY.s.t += + DISPLAY.s.height/2;

			DISPLAY.s.width = DISPLAY.s.width*(_size.scale/(_size.scale + des));
			DISPLAY.s.height = DISPLAY.s.height*(_size.scale/(_size.scale + des));

			DISPLAY.s.l += - DISPLAY.s.width/2;
			DISPLAY.s.t += - DISPLAY.s.height/2;
	
			DISPLAY.s.l = Math.round(DISPLAY.s.l);
			DISPLAY.s.t = Math.round(DISPLAY.s.t);

			_size.scale += des;
		}

		this.wheel = function(e){
			var delta = (e.deltaY || -e.wheelDelta)/2;

			if(delta > 0){
				SCROLL.scale(-0.1);
			} else if(delta < 0) {
				SCROLL.scale(0.1);
			}

			DISPLAY.canvas();
			tools.stopProp(e);
			return false;
		}

	}
	var EDIT = new function(){
		this.click = function(e){
			DISPLAY.canvas(); 
		}
	}

	function normalize(){
		var max = 0;
		for(var i = 0; i < _sources.l.r.length; i++){
			if(_sources.l.r[i] > max)
				max = _sources.l.r[i];
		}
		for(var i = 0; i < _sources.l.r.length; i++){
			_sources.l.r[i] = _sources.l.r[i]/max;
		}
		for(var i = 0; i < _sources.l.p.length; i++){
			_sources.l.p[i] = _sources.l.p[i]/max;
		}

		_sources.l.d = _sources.l.d/max;
		_sources.l.w = _sources.l.w/max;
	}

	link.create(options);
}