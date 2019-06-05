var es = function ( source, n ) {
	var answer = [];

	for(var i = Math.round(source.length*7/8); i < source.length - 1; i++){
		var U = 0;
		for(var j = 0; j < n; j++){
			U += source[i - j];
		}
		U = U/n;
		var a = 2/(n + 1);

		var r = source[i]*a + (1 - a)*U;
		answer.push(r);
	}

	return answer;
}