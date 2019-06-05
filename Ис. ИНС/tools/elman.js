function elman(){
	
	var layers = 3;
	var neuron = 5;
	var input = 2;
	
	var rate = 0.1;
	var output = 1;
	var input = 1;

	var contextCount = 5;
	
	var cycles;
	
	var source;
	var neural;
	var aErrors;
	
	this.create = function(options){
		
		source = options.source

		normalize(source);
	
		contextCount = options.contextCount;
		rate = options.rate;
		cycles = 0;
		neuron = options.neuron;
		layers = 2;
		output = options.output;
		input = 1;
	
		aErrors = [];
	
	
		CREATE();
	}
	
	this.study = function(){
	
	
		var train = [];
		var valid = [];
		var test = [];
	
		var trainStart = input;
		var trainEnd = Math.round(source.length*3/4);
		var testStart = Math.round(source.length*3/4);
		var testEnd = Math.round(source.length*7/8);
		var validStart = Math.round(source.length*7/8);
		var validEnd = source.length - 1;

		var train = [];

		for(var i = trainStart; i < trainEnd; i++){
			train.push( i );
		}
			
		var pOfEr = 1;
		var best = neural;
	
		var Ages = 1000;
	
	
		while(true){
	
			cycles++;
			train.sort(compareRandom);
	
			for(var j = trainStart; j < trainEnd; j++){

				var point = [];
				for(var k = 0; k < input; k++){
					point[k] = source[ j - k ];
				}
				
				STUDY(
					point,
					[source[ j + 1 ]]
				);
			}
			
			var errors = 0;
	
			for(var j = testStart; j < testEnd; j++){

				var point = [];
				for(var k = 0; k < input; k++){
					point[k] = source[ j - k ];
				}

				var answer = WORK(
					point
				);
	
	
				errors += Math.abs(answer[0] - source[ j + k ]);
			}
	
			errors = errors/(testEnd - testStart);
	
			aErrors.push(errors);
	
			if(errors < pOfEr ){
				pOfEr = errors;
				best = clone(neural);
				Ages = 100;
			} else {
				Ages--;
			}
	
			if(!Ages) break;
		}
		
		

		neural = best;
	
		var answers = [];
	
		for(var j = validStart; j < validEnd; j++){
			var point = [];
			for(var k = 0; k < input; k++){
				point[k] = source[ j - k ];
			}

			var answer = WORK(
				point
			);
			answers.push(answer[0]);
		}

		return answers;
	}
	
	
	function compareRandom() {
		return Math.random() - 0.5;
	}
	
	function STUDY( point, To){
		for(var i = 0; i < input; i++){
			neural.layers[0].neuron[i].o = point[i];
		}
	
		for(var i = 1; i < neural.layers.length; i++){
	
	
			var prNeu = neural.layers[i - 1].neuron;
			var crNeu = neural.layers[i].neuron;
	
			for(var j = 0; j < crNeu.length; j++){
				
				crNeu[j].o = 0;
	
				for(var k = 0; k < prNeu.length; k++){
					crNeu[j].o += prNeu[k].o * crNeu[j].w[k];
				}

				// use context
				if(neural.context[i] != undefined){
					for(var l = 0; l < neural.context[i].length; l++){

						for(var k = 0; k < neural.context[i][l].neuron.length; k++){
							crNeu[j].o += crNeu[j].wc[l][k] * neural.context[i][l].neuron[k].o;
						}
					}
				}				

				crNeu[j].o = 1 / ( 1 + Math.exp(-crNeu[j].o) );
	
			}
		}
	

		// BackPropagation
	
		for(var i = 0; i < output; i++){
			var Ok = neural.layers[layers].neuron[i].o;
			neural.layers[layers].neuron[i].b = Ok*(1 - Ok)*(To[i] -  Ok);
		}
	
		for(var i = layers - 1; i > 0; i--){
	
			var crNeu = neural.layers[i].neuron;
			var nxNeu = neural.layers[i + 1].neuron;
		
			for(var j = 0; j < crNeu.length; j++){
				crNeu[j].b = 0;
				for(var k = 0; k < nxNeu.length; k++){
					crNeu[j].b += nxNeu[k].w[j]*nxNeu[k].b;
				}
				crNeu[j].b = crNeu[j].o * (1 - crNeu[j].o) * crNeu[j].b;
			}
		}
	
		for(var i = 1; i < neural.layers.length; i++){
			for(var j = 0; j < neural.layers[i].neuron.length; j++){
	
				var crNeu = neural.layers[i].neuron[j];
	
				for(var k = 0; k < crNeu.w.length; k++){
					crNeu.w[k] = crNeu.w[k] + rate	* crNeu.b * neural.layers[i - 1].neuron[k].o;			
				}
			}
		}

		// context study

		for(var i = 0; i < neural.context[1].length; i++){
			var crNeu = neural.context[1][i].neuron;
			var nxNeu = neural.layers[1].neuron;
			
			for(var j = 0; j < crNeu.length; j++){
				crNeu[j].b = 0;
				for(var k = 0; k < nxNeu.length; k++){
					crNeu[j].b += nxNeu[k].wc[i][j] * nxNeu[k].b;
				}
				crNeu[j].b = crNeu[j].o * (1 - crNeu[j].o) * crNeu[j].b;
			}
		}
		for(var j = 0; j < neural.context[1].length; j++){
			for(var i = 0; i < neural.context[1][j].neuron.length; i++){
				for(var k = 0; k < neural.layers[1].neuron.length; k++){
					neural.layers[1].neuron[k].wc[j][i] = neural.layers[1].neuron[k].wc[j][i] + rate * neural.context[1][j].neuron[i].o * neural.context[1][j].neuron[i].b;
				}
			}
		}

		addToContext();
	}

	function addToContext(){
		// refresh context lvl
		for(var i = 0; i < neural.context[1].length - 1; i++){
			for(var j = 0; j < neural.context[1][i].neuron.length; j++){
				neural.context[1][i].neuron[j].o = neural.context[1][i + 1].neuron[j].o;
			}
		}
		var lc = neural.context[1].length - 1; // last context lvl
		for(var j = 0; j < neural.context[1][lc].neuron.length; j++){
			neural.context[1][lc].neuron[j].o = neural.layers[1].neuron[j].o;
		}
	}	
	function WORK( point ){
		for(var i = 0; i < input; i++){
			neural.layers[0].neuron[i].o = point[i];
		}
	
		for(var i = 1; i < neural.layers.length; i++){
	
	
			var prNeu = neural.layers[i - 1].neuron;
			var crNeu = neural.layers[i].neuron;
	
			for(var j = 0; j < crNeu.length; j++){
				
				crNeu[j].o = 0;
	
				for(var k = 0; k < prNeu.length; k++){
					crNeu[j].o += prNeu[k].o * crNeu[j].w[k];
				}

				// use context
				if(neural.context[i] != undefined){
					for(var l = 0; l < neural.context[i].length; l++){

						for(var k = 0; k < neural.context[i][l].neuron.length; k++){
							crNeu[j].o += crNeu[j].wc[l][k] * neural.context[i][l].neuron[k].o;
						}
					}
				}				

				crNeu[j].o = 1 / ( 1 + Math.exp(-crNeu[j].o) );
	
			}
		}

		var answer = [];
		for(var i = 0; i < output; i++){
			answer.push(neural.layers[layers].neuron[i].o);
		}
		addToContext();
		
		return answer;
	}
	
	function CREATE(){
		neural = {
			layers : [],
			context: [],
		}
	
		neural.layers.push({
			neuron: []
		})
	
		for(var j = 0; j < input; j++){
			neural.layers[0].neuron.push({
				v: 0
			})
		}
	

		neural.layers.push({
			neuron: []
		})

		for(var j = 0; j < neuron; j++){
			neural.layers[1].neuron.push({
				w: [],
				wc: [],
				v: 0,
				e: 0
			});

			for(var k = 0; k < neural.layers[0].neuron.length; k++ ){
				neural.layers[1].neuron[j].w.push(Math.random() - 0.5);
			}

			// weigh to context layer
			for(var l = 0; l < contextCount; l++){
				neural.layers[1].neuron[j].wc[l] = [];
				for(var k = 0; k < neuron; k++ ){
					neural.layers[1].neuron[j].wc[l].push(Math.random() - 0.5);
				}	
			}
		}

		// context lvl
		neural.context[1] = [];
		for(var j = 0; j < contextCount; j++){
			
			neural.context[1][j] = {
				neuron: []
			};
		
			for(var i = 0; i < neuron; i++){
				neural.context[1][j].neuron[i] = {
					o: 0,
					b: 0
				}
			}	
		}
		
		

		// output layer
	
		neural.layers.push({
			neuron: []
		})
	
		for(var j = 0; j < output; j++){
			neural.layers[layers].neuron.push({
				v: 0,
				w: []
			})
	
			for(var k = 0; k < neural.layers[layers - 1].neuron.length; k++ ){
				neural.layers[layers].neuron[j].w.push(Math.random() - 0.5);
			}
		}
	}
	
	function clone(source_obj){
		if (source_obj === null || typeof source_obj !== 'object')	return source_obj;
	
		var obj;
		if (Array.isArray(source_obj))						obj = [];
		else												obj = {};
	
		for (var key in source_obj)			{
			if (source_obj.hasOwnProperty(key))				obj[key] = clone(source_obj[key]);
		}	
		return obj;
	}
	
	var getDistance = function( p1, p2){
		var distance = 0;
		for(var i = 0; i < p1.length; i++){
			distance += (p1[i] - p2[i])*(p1[i] - p2[i]);
		}	
		return Math.sqrt(distance);
	}
	
	var getClasses = function( classes, output ){
		var countOfRange = Math.ceil(Math.pow(classes, 1/output));
	
		// check 1/(countOfRange - 1)
	
		var range = 1/countOfRange;
		var piece = [];
	
		for(var i = 0; i < countOfRange; i++){
			piece[i] = range/2 + range*i;
		}
	
		var classPoints = [];
	
		var step = function( arr, input ){
			if(input == 0){
				classPoints.push( arr )
			} else {
				for(var i = 0; i < piece.length; i++){
					step( arr.concat( piece[i] ) , input - 1);
				}
			}
		}
	
		step( [], output );
	
		var classPointsCorrect = [classPoints.splice(0, 1)[0]];
	
		while(classPoints.length > 0){
			var distance = 0;
			var position = 0;
			for(var i = 0; i < classPoints.length; i++){
				var cd = 0;
				for(var j = 0; j < classPointsCorrect.length; j++){
					cd += getDistance(classPoints[i], classPointsCorrect[j]);
				}
				if(cd > distance){
					distance = cd;
					position = i;
				}
			}
	
			classPointsCorrect.push(classPoints.splice(position, 1)[0]);
			if(classes == classPointsCorrect.length) break;
		}
	
	
		return classPointsCorrect;
	}
	
	var findClass = function( point ){
		var cl = 0;
		var distance = 1/0;
		for(var i = 0; i < clPoints.length; i++){
			if( distance > getDistance(clPoints[i], point)){
				distance = getDistance(clPoints[i], point);
				cl = i;
			}
		}
		return cl;
	}

	var normalize = function( source ){
		var min = 1/0;
		var max = -1/0;

		for(var i = 0; i < source.length; i++){
			if(source[i] < min)
				min = source[i];
			if(source[i] > max)
				max = source[i];
		}

		var koef = 1/(max - min);
		for(var i = 0; i < source.length; i++){
			source[i] = source[i]*koef - min*koef;
		}
	}
}