var SOM = function(options){

	var _set;
	var _net;

	this.create = function(options){

		_set = {};

		_set.input = options.input;
		_set.source = options.source;

		// m*n = size of table
		_set.i = options.n;
		_set.j = options.m;

		_set.sigm0 = options.sigm0;
		_set.nu0 = options.nu0;

		_set.t1 = options.t1;
		_set.t2 = options.t2;

		_net = CREATE.net();
	}

	this.work = function(){
		for(var n = 0; n < 10000; n++){
			for(var i = 0; i < _set.source.length; i++){
				WORK.study( _set.source[i], n)
			}
		}
		var clasters = [];
		for(var i = 0; i < _set.i*_set.j; i++){
			clasters[i] = [];
		}
		for(var i = 0; i < _set.source.length; i++){
			var w = WORK.work( _set.source[i]);
			clasters[ w.index[0]*_set.j + w.index[1] ].push( _set.source[i] );
		}
		return clasters;
	}

	this.predict = function( dot ){
		var w = WORK.work( dot );
		return (w.index[0]*_set.j + w.index[1]);
	}


	var GET = {
		distance: function(p1, p2){
			var distance = 0;
			for(var i = 0; i < p1.length; i++){
				distance += (p1[i] - p2[i])*(p1[i] - p2[i]);
			}
			return Math.sqrt(distance);
		},
		ldistance: function(p1, p2){
			var distance = 0;
			for(var i = 0; i < p1.length; i++){
				distance += Math.pow( Math.abs(p1[i] - p2[i]), 2);
			}
			return distance;
		}
	}

	var CREATE = {
		net: function(){
			var net = {};

			net.input = [];
			net.neuron = [];
			for(var i = 0; i < _set.i; i++){
				net.neuron[i] = [];
				for(var j = 0; j < _set.j; j++){
					var n = net.neuron[i][j] = {};
					
					n.index = [i, j];
					n.w = [];
					for(var k = 0; k < _set.input; k++)
						n.w.push( Math.random()*2 - 1 );
				}
			}

			return net;
		}
	}

	var WORK = {
		study: function( input, n){

			var w;

			for(var i = 0; i < input.length; i++){
				_net.input[i] = input[i];
			}

			var d = 1/0;
			for(var i = 0; i < _set.i; i++){
				for(var j = 0; j < _set.j; j++){
					if(d > GET.distance( _net.neuron[i][j].w, _net.input) ){
						d = GET.distance( _net.neuron[i][j].w, _net.input);
						w = _net.neuron[i][j];
					}
				}
			}
			for(var i = 0; i < _set.i; i++){
				for(var j = 0; j < _set.j; j++){
					var ne = _net.neuron[i][j];

					var sigm1 = _set.sigm0*Math.exp( -n/_set.t1 )
					var h = Math.exp( - GET.ldistance( ne.index, w.index )/(2*sigm1) )

					var nu = _set.nu0*Math.exp( -n/_set.t2 )

					for(var k = 0; k < ne.w.length; k++){
						ne.w[k] = ne.w[k] + nu*h*(input[k] - ne.w[k]);
					}
				}
			}
		},
		work: function(input){
			var w;

			for(var i = 0; i < input.length; i++){
				_net.input[i] = input[i];
			}

			var d = 1/0;
			for(var i = 0; i < _set.i; i++){
				for(var j = 0; j < _set.j; j++){
					if(d > GET.distance( _net.neuron[i][j].w, _net.input) ){
						d = GET.distance( _net.neuron[i][j].w, _net.input);
						w = _net.neuron[i][j];
					}
				}
			}
			return w;
		}
	}

	this.create(options);
}