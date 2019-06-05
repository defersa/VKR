var colorStat = ['#1DD300','#FFD300','#FF0000'];
var colorStatus = [
	'<span style="color: ' + colorStat[0] + ';"> Нормально</span>',
	'<span style="color: ' + colorStat[1] + ';"> Внимание</span>',
	'<span style="color: ' + colorStat[1] + ';"> Опастность</span>'
];

window.onload = function(){
	
	var html = document.getElementById('v-ser-content');

	var xhr = new XMLHttpRequest();
	var csrftoken = getCookie('csrftoken');
	
	xhr.open("POST", '/predict/addrow', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.setRequestHeader("X-CSRFToken", csrftoken);

	xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

        	predictFrom = JSON.parse(xhr.responseText)

        	for(var i = 0; i < predictFrom.length; i++){
				makeRow({
					parent: html,
					data: predictFrom[i],
					remove: removeLine
				})	
			}
        };
    }
	
	xhr.send();
}


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function removeLine(){
	var wind = new window_ui({
		modal: true,
		resize: false,
		title: "Предупреждение",
		width: '500px',
		height: '40px',
		apply: false,
		cancel: false,
		picMinMax: false,
		customButtons: [
			{
				style: 0,
				name: "Отмена",
				onclick: function(){
					wind.remove();
				}
			},
			{
				style: 1,
				name: "Нет",
				onclick: function(){
					wind.remove();
				}
			},
			{
				style: 1,
				name: "Да",
				onclick: function(){
					wind.remove();
				}
			}
		]
	});
	wind.container.innerHTML = '<div style="height: 90px; line-height: 90px; margin: auto; font-size: 18px; width: 100%; text-align:center;">Вы действительно хотите удалить ряд?</div>';
}

function makeRow( options ){
	
	var _m = {};
	_m.row = {};

	_m.HROW = tools.createHTML({
		tag: 'div',
		className: 'v-line',
		parent: options.parent
	});

	_m.row.about = tools.createHTML({
		tag: 'div',
		className: 'v-line-about',
		parent: _m.HROW
	});
	_m.row.statistic = tools.createHTML({
		tag: 'div',
		className: 'v-line-statistic',
		parent: _m.HROW
	});
	_m.row.graph = tools.createHTML({
		tag: 'div',
		className: 'v-line-graph',
		parent: _m.HROW
	});
	_m.row.canvas = tools.createHTML({
		tag: 'div',
		className: 'v-line-canvas',
		parent: _m.HROW
	});
	_m.row.remove = tools.createHTML({
		tag: 'div',
		className: 'v-line-remove',
		parent: _m.HROW
	});


	_m.row.graph.c = new cnvs_ui({
		parent: _m.row.graph,
		sources: {
			g: options.data.g
		}
	});
	_m.row.canvas.c = new cnvs_ui({
		parent: _m.row.canvas,
		scale: 1.7,
		sources: {
			l: options.data.l
		}
	});

	// about

	_m.row.about.name = tools.createHTML({
		tag: 'div',
		className: 'v-stat-name',
		parent: _m.row.about,
		innerHTML: ('<span style="color: #777;">Название:</span> ' + options.data.name)
	});
	_m.row.about.adress = tools.createHTML({
		tag: 'div',
		className: 'v-stat-adress',
		parent: _m.row.about,
		innerHTML: ('<span style="color: #777;">Адрес:</span> ' + options.data.adress)
	});
	_m.row.about.scheme = tools.createHTML({
		tag: 'div',
		className: 'v-stat-scheme',
		parent: _m.row.about,
		innerHTML: ('<span style="color: #777;">Схема:</span> ' + options.data.scheme)
	});

	// statistic

	_m.row.statistic.statusnow = tools.createHTML({
		tag: 'div',
		className: 'v-stat-statusnow',
		parent: _m.row.statistic,
		innerHTML: ('<span style="color: #777;">Состояние:</span> ' + colorStatus[options.data.statusnow] )
	});
	_m.row.statistic.status24 = tools.createHTML({
		tag: 'div',
		className: 'v-stat-status24',
		parent: _m.row.statistic,
		innerHTML: ('<span style="color: #777;">Состояние на 24 часа:</span> ' + colorStatus[options.data.status24])
	});
	_m.row.statistic.wlimit = tools.createHTML({
		tag: 'div',
		className: 'v-stat-wlimit',
		parent: _m.row.statistic,
		innerHTML: ('<span style="color: #777;">Граница состояния "Внимание":</span><span style="color: ' + colorStat[1] + ';"> ' + options.data.w + '</span>')
	});
	_m.row.statistic.dlimit = tools.createHTML({
		tag: 'div',
		className: 'v-stat-dlimit',
		parent: _m.row.statistic,
		innerHTML: ('<span style="color: #777;">Граница состояния "Опастность":</span><span style="color: ' + colorStat[2] + ';"> ' + options.data.d + '</span>')
	});

	// 

	_m.row.remove.button = tools.createHTML({
		tag: 'div',
		className: 'v-remove',
		parent: _m.row.remove,
		onclick: options.remove,
		innerHTML: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 24 24" xml:space="preserve"><g class="v-fill"><path d="M 0,0 L 24,0 L 24,24 L 0,24 L 0,0 z" /></g><g class="v-cross"><path d="M 5.5,7 L 7,5.5 L 18.5,17 L 17,18.5 L 5.5,7 z" /><path d="M 5.5,17 L 7,18.5 L 18.5,7 L 17,5.5 L 5.5,17 z" /></g></svg>'
	});
}

function addLine(){
	var wind = new window_ui({
		modal: true,
		resize: false,
		title: "Добавление объекта",
		width: '500px',
		height: '600px',
		apply: false,
		cancel: false,
		picMinMax: false,
		customButtons: [
			{
				style: 0,
				name: "Отмена",
				onclick: function(){
					wind.remove();
				}
			},
			{
				style: 1,
				name: "добавить",
				onclick: function(){
					repToServer(wind);
				}
			}
		]
	});
	wind.container.innerHTML = '<div id="v-add"><div class="v-add-row"><div class="v-add-label">Название</div><input class="v-add-input" id="v-add-name" type="text"></div><div class="v-add-row"><div class="v-add-label">Адрес</div><input class="v-add-input" id="v-add-adress" type="text"></div><div class="v-add-row"><div class="v-add-label">Схема</div><input class="v-add-input" id="v-add-scheme" type="text"></div><div class="v-add-row"><div class="v-add-label">Лимит "Внимание"</div><input class="v-add-input" id="v-add-wlimit" type="text"></div><div class="v-add-row"><div class="v-add-label">Лимит "Опастность"</div><input class="v-add-input" id="v-add-dlimit" type="text"></div><div class="v-add-row"><div class="v-add-label">Ряд</div><input class="v-add-input" id="v-add-file" type="file"></div></div>';
	document.getElementById('v-add-file').addEventListener('change', readFile, false);
}

var inputrow;

function repToServer(wind){
	var n = document.getElementById( 'v-add-name' ).value;
	var a = document.getElementById( 'v-add-adress' ).value;
	var s = document.getElementById( 'v-add-scheme' ).value;
	var w = document.getElementById( 'v-add-wlimit' ).value;
	var d = document.getElementById( 'v-add-dlimit' ).value;



	if( n !== '' && a !== '' && s !== '' && inputrow && !isNaN(parseFloat(d)) && !isNaN(parseFloat(w)) ){

		var max = 0;
		var min = 1/0;

		for(var i = 0; i < inputrow.length; i++){
			if(inputrow[i] > max)
				max = inputrow[i];
			if(inputrow[i] < min)
				min = inputrow[i];
		}
		for(var i = 0; i < inputrow.length; i++){
			inputrow[i] += - min;
		}

		var output = {
			name: n,
			adress: a,
			scheme: s,
			min: min,
			max: max,
			d: d,
			w: w,
			l: {
				r: inputrow,
				p: ''
			}
		}

		var csrftoken = getCookie('csrftoken');

		function csrfSafeMethod(method) {
		    // these HTTP methods do not require CSRF protection
		    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
		}
		
		$.ajaxSetup({
		    beforeSend: function(xhr, settings) {
		        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
		            xhr.setRequestHeader("X-CSRFToken", csrftoken);
		        }
		    }
		});

		$.ajax({
		    url: '/predict/takerow/',
		    type: 'POST',
		    contentType: 'application/json; charset=utf-8',
		    data: JSON.stringify(output),
		    dataType: 'text',
		    success: function(result) {
		        console.log(result.Result);
		    }
		});
		
		/*
		var outputjson = JSON.stringify(output);

		var xhr = new XMLHttpRequest();
		var csrftoken = getCookie('csrftoken');
		
		xhr.open("POST", '/predict/takerow/', true);
		xhr.setRequestHeader('Content-type', 'application/json');
		xhr.setRequestHeader("X-CSRFToken", csrftoken);
	
		xhr.onreadystatechange = function () {
    	    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
	
    	    	console.log(xhr.responseText)
	   	    };
    	}
	
		xhr.send(outputjson);
		*/

		wind.remove();
	}
}


function readFile (e) {
	var files = e.target.files;
	var file = files[0];
	var reader = new FileReader();
	reader.onload = function(event) {
		inputrow = JSON.parse(event.target.result);
	}
	reader.readAsText(file)
}