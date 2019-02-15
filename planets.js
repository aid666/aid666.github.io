_collisionValues = [ 'Combine', 'Bounce', 'None' ];
_minMass = 1000;
_maxMass = 100000;

_minG = 1;
_maxG = 1000;

_minR = 0.1;
_maxR = 1000;

_minM = 0.1;
_maxM = 1000;

_settings = {
	mass: 4000,
	color: "#bbbb99",
	trailOpacity: .24,
	timeStep: 1/75,
	barnesHut: false,
	collisions: _collisionValues[0],
	damping: 0,
	G: 1,
	R: 30,
	M: 60,
	clear: function() {
		_doClear = true;
	},
	reset: function() {
		_settings.mass = 4000;
		_settings.color = "#bbbb99";
		_settings.trailOpacity = .24;
		_settings.timeStep = 1/75;
		_settings.barnesHut = false;
		_settings.collisions = _collisionValues[0];
		_settings.damping = 0;
	}
};

_doClear = false;
_mouseDown = false;
_rightClick = false;
_ctrlDown = false;
_clickX = 0;
_clickY = 0;
_currentX = 0;
_currentY = 0;

_planets = [];
_collisions = [];

_initRadius = Math.log(Math.E + 1.0);

function eventResize() {
	_can.width = window.innerWidth;
	_can.height = window.innerHeight;
	_canbak.width = window.innerWidth;
	_canbak.height = window.innerHeight;
}

function drawVelocityLine() {
	if(_mouseDown) {
		drawLine(_clickX, _clickY, _currentX, _currentY);
	}
}

function mouseDown(e) {
	_mouseDown = true;
	_clickX = e.layerX-_initRadius;
	_clickY = e.layerY-_initRadius;
}

function mouseMove(e) {
	var oldX = _currentX;
	var oldY = _currentY;
	_currentX = e.clientX - _can.offsetLeft;
	_currentY = e.clientY - _can.offsetTop;

	var xdiff = (_currentX-oldX);
	var ydiff = (_currentY-oldY);
	if(_ctrlDown && !_mouseDown) {
		for(var i = 0; i<_planets.length; i++) {
			_planets[i].x += xdiff;
			_planets[i].ox +=  xdiff;
			_planets[i].y += ydiff;
			_planets[i].oy += ydiff;
		}
	}
}

function mouseUp(e) {
	var vx = (e.layerX-_initRadius)-_clickX;
	var vy = (e.layerY-_initRadius)-_clickY;

	if(_rightClick) {
		_rightClick = false;
		_mouseDown = false;
		system(_clickX, _clickY, vx, vy);
	} else {
		_rightClick = false;
		_mouseDown = false;
		_planets.push(new Planet(_settings.mass, _clickX, _clickY, vx, vy));
	}

}

function rightClick(e) {
	_rightClick = true;
	return false;
}

function keydown(e) {
	if(e.keyCode == 17) {
		_ctrlDown = true;
	}
}

function keyup(e) {
	if(e.keyCode == 17) {
		_ctrlDown = false;
	}
}

function drawLine(x1, y1, x2, y2) {
	_ctxbak.lineWidth = 2;
	_ctxbak.beginPath();
	_ctxbak.lineCap = "round";
	_ctxbak.moveTo(x1, y1);
	_ctxbak.lineTo(x2, y2);
	_ctxbak.strokeStyle = "#2299ff";
	_ctxbak.stroke();
}

function init() {
	// gui
	var gui = new dat.GUI();
	gui.add(_settings, 'reset').name('Reset Controls');
	var newPlanetSettings = gui.addFolder('New Planet Controls');
	newPlanetSettings.add(_settings, 'mass', _minMass, _maxMass).step(1000).name('Mass').listen();
	newPlanetSettings.addColor(_settings, 'color').name('Color').listen();
	newPlanetSettings.open();
	var globalSettings = gui.addFolder('Global Controls');
	globalSettings.add(_settings, 'clear').name('Remove Planets').listen();
	globalSettings.add(_settings, 'G', _minG, _maxG).step(1).name('G').listen();
	globalSettings.add(_settings, 'R', _minR, _maxR).step(1).name('R').listen();
	globalSettings.add(_settings, 'M', _minM, _maxM).step(1).name('M').listen();
	globalSettings.add(_settings, 'trailOpacity', 0.0, 1.0).step(.01).name('Trail Opacity').listen();
	globalSettings.add(_settings, 'timeStep', 1/250, 1/5).name('Time Step');
	globalSettings.add(_settings, 'collisions', _collisionValues).name('Collisions').listen();
	globalSettings.add(_settings, 'damping', 0, 100).name('Damping').listen();
	//globalSettings.add(_settings, 'barnesHut').name('Barnes Hut?').listen();
	globalSettings.open();


	// background
	_canbak = document.getElementById('canbak');
	_canbak.style.left="0px";
	_canbak.style.top="0px";
	_canbak.style.width="100%";
	_canbak.style.height="100%";
	_canbak.style.zIndex = 1;
	_canbak.width=_canbak.offsetWidth;
	_canbak.height=_canbak.offsetHeight;
	_ctxbak = _canbak.getContext('2d');

	_can = document.getElementById('can');
	_can.style.left="0px";
	_can.style.top="0px";
	_can.style.width="100%";
	_can.style.height="100%";
	_can.style.zIndex = 0;
	_can.width=_can.offsetWidth;
	_can.height=_can.offsetHeight;

	_can.onmousemove = mouseMove;
	_can.onmousedown = mouseDown;
	_can.onmouseup = mouseUp;
	_can.oncontextmenu = rightClick;
	_can.onkeydown = keydown;
	_can.onkeyup = keyup;
	_can.onselectstart = function () { return false; };

	_can.addEventListener("touchstart", (e) => {
		if (e.touches.length > 1) {
			_ctrlDown = true;
		}
	});
	_can.addEventListener("touchmove", (e) => {
		if (e.touches.length > 1) {
			mouseMove(e);
		}
	});
	_can.addEventListener("touchend", (e) => {
		_ctrlDown = false;
	});


	_ctx = _can.getContext('2d');

	_stats = document.getElementById('stats');
	_blurb = document.getElementById('blurb');

	_frameTime = 0;
	_lastLoop = new Date();
	var fpsOut = document.getElementById('fps');
	setInterval(function(){
		fpsOut.innerHTML = (1000/_frameTime).toFixed(1) + " fps";
	},1000);

	run();
	setInterval(run, 10);
}

function stats() {
	_stats.innerHTML = _planets.length + " planets";
}

function run() {
	reDraw();
	drawVelocityLine();
	stats();

	_prevPlanets = [];

	for(var j = 0; j<_planets.length; j++) {
		var p = _planets[j];
		_prevPlanets.push(new Planet(p.m, p.x, p.y, p.vx, p.vy, p.color));
	}

	for(var j = 0; j<_planets.length; j++) {
		takeStep(j);
	}

	var thisLoop = new Date();
	var thisFrameTime = thisLoop - _lastLoop;
	_frameTime += (thisFrameTime - _frameTime) / 20.0;
	_lastLoop = thisLoop;
}

function reDraw() {
	_ctxbak.clearRect(0, 0, _can.width, _can.height);
	var alpha = _settings.trailOpacity;
	if(_ctrlDown || _doClear) {
		alpha = 1.0;
	}
	if(_doClear) {
		_doClear = false;
		_planets = [];
		_collisions = [];
	}
	_ctx.fillStyle = "rgba(42, 42, 42, " + alpha + ")";
	_ctx.fillRect(0, 0, _can.width, _can.height);
	for(var i = 0; i<_planets.length; i++) {
		_planets[i].draw(_ctx);
	}
}

function nsquaredacceleration(j, x, y, r) {
	var deltaAx = 0;
	var deltaAy = 0;
	for(var i = 0; i<_prevPlanets.length; i++) {
		var op = _prevPlanets[i];
		if(i != j) {
			var xdiff = (op.x-x);
			var ydiff = (op.y-y);
			var d = Math.max(Math.sqrt((xdiff*xdiff)+(ydiff*ydiff)), r + op.r);
			var squD = d*d;
			var gravity = _settings.G * op.m/squD;
			var repulsive = -1 * _settings.R * op.m/(squD * d);
			var m = _settings.M * op.m/(squD * squD);
			var acc = gravity + repulsive + m;
			console.log("Force: ", j, acc, gravity, repulsive, m);
			deltaAx += (acc*xdiff)/d;
			deltaAy += (acc*ydiff)/d;
		}
	}
	return [ deltaAx, deltaAy ];
}

function takeStep(j) {
	var p = _planets[j];
	var px = p.x;
	var py = p.y;
	var pp = _prevPlanets[j];
	var ppx = pp.x;
	var ppy = pp.y;
	var ppvx = pp.vx;
	var ppvy = pp.vy;
	var h = _settings.timeStep;
	var f = _settings.damping/2000;

	// verlet
	var a = nsquaredacceleration(j, ppx, ppy, pp.r);
	if(p.isnew) {
		p.ox = p.x;
		p.x += (p.vx*h) + (0.5*a[0]*h*h);
		p.vx = (p.x - p.ox)/h;
		p.oy = p.y;
		p.y += (p.vy*h) + (0.5*a[1]*h*h);
		p.vy = (p.y - p.oy)/h;

		p.isnew = false;
	} else {
		p.x = ((2 - f)*p.x - (1 - f)*p.ox) + a[0]*h*h;
		p.ox = px;
		p.vx = (p.x - p.ox)/h;
		p.y = ((2 - f)*p.y - (1 - f)*p.oy) + a[1]*h*h;
		p.oy = py;
		p.vy = (p.y - p.oy)/h;
	}
}

function Planet(pm, px, py, pvx, pvy, color) {
	this.m = pm;
	this.r = Math.log(Math.E + pm/_minMass);
	if(typeof(color)==='undefined') {
		this.color = _settings.color;
	} else {
		this.color = color;
	}
	this.x = px;
	this.y = py;
	this.ox = 0;
	this.oy = 0;
	this.vx = pvx;
	this.vy = pvy;
	this.isnew = true;

	this.draw = function( ctx ) {
  	ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI, 0);
		ctx.fillStyle = this.color;
		ctx.fill();
  }
}

function system(ix, iy, ivx, ivy) {
	var sign = (Math.random()>0.5)?1:-1;
	for(var i = 0; i<3; i++) {
		var dd = Math.min(_can.width, _can.height);
		var r = Math.random()*dd/2;
		var theta = Math.random()*Math.PI*2;
		var x = r*Math.cos(theta);
		var y = r*Math.sin(theta);

		var m = _settings.mass + ((Math.random()*2)-1)*(_settings.mass/4.0);
		var v = Math.min((2800.0*Math.pow(r, -1.0/2.0) + 30)+Math.pow((m/_minMass)*1.3, 2.6), 1000.00);
		var vx = v*Math.cos(theta+(Math.PI*sign/2));
		var vy = v*Math.sin(theta+(Math.PI*sign/2));

		_planets.push(new Planet(m, ix+x, iy+y, vx+ivx, vy+ivy));
	}
	_planets.push(new Planet((_settings.mass)*8000, ix, iy, ivx, ivy));
}

window.addEventListener('resize', eventResize, false);
window.onload = init;
