// main.js

console.log(`yo`);
let $ = function(id) {
	return document.getElementById(id)
};
var paper = new Raphael($("mySVGCanvas"));
// GLOBAL VARIABLES DECLARED HERE. DO NOT CHANGE!======//
//SLIDERS WILL DO THE CHANGING FOR YOU ================//
var dimX = paper.width;
var dimY = paper.height;
var gravity = 0.2;
var drag = 0.99;
//do i want to set a limit to the number of balls?
// const limit = 10;
//=====================================================//

//GENERAL PURPOSE FUNCTIONS============================//
//VERY USEFUL FOR MY PURPOSES==========================//
//RETURNS DISTANCE BETWEEN TWO POINTS==================//
let distance = function(p1, p2){
	return Math.sqrt(Math.pow(p2.x-p1.x,2)+Math.pow(p2.y-p1.y,2));
}
//MAPS A VALUE x WITHIN RANGE [a,b] TO PROPORTIONAL VALUE IN [m,n]//
//ALSO CAN MAP INVERSE PROPORTION IF YOU PUT [b,a] INSTEAD.
let map =function (x, a, b, m, n){
    let range = n-m;
    let proportion = (x-a)/(b-a);
    return (m + proportion*range);
}
//COLOR GENERATOR. I TRY TO ONLY MAKE NEON COLOURS//
let getRandomColor = function() {
	let hue = Math.floor(Math.random()*360)
 	var color = `hsl(${hue},70,50)`
 	return color;
}
//=====================================================//
//DECLARING THE BG AND ARRAY OF EXISTING CIRCLES=======//
let bg = paper.rect(0,0,dimX,dimY).attr({
	"fill":"#222",
	"cursor":'crosshair',
	"stroke-width":0,
});
let circles = [];
//======================================================//
//======================================================//

let createCircle = function(cx,cy) {
	//each circle has a random weight that affects its bounciness and radius
	//inversely proportional
	let weight = Math.random();
	let rad = map(weight, 1, 0, 20,70)
	let newc = paper.circle(cx,cy,rad).attr({
		"fill":getRandomColor(),
		"stroke-width":0
	})
	//innate properties of the circles
	newc.mass = rad;
	newc.speedy = speedy;
	newc.speedx = speedx;
	newc.posx = cx;
	newc.posy = cy;
	newc.bounce = weight;
	//ensure circles do not interfere with clicking
	newc.node.setAttribute('pointer-events',"none")
	//add this circle to existing circles array.
	//push adds the new circle to the array.
	//shift removes the first circle in the array.
	//it should work in order. Ensure no clogging.
	circles.push(newc);
	newc.animate({'opacity':0},5000,()=>{
		newc.remove();
		circles.shift();})
	//lastly, this physics method gets called in intervals to update its locations
	newc.physics = function() {
		newc.speedx = newc.speedx*drag
		newc.posx += newc.speedx;
		newc.speedy += gravity;
		newc.posy += newc.speedy;
		newc.attr({
			'cx':newc.posx,
			'cy':newc.posy
		})
		//if it hits a wall
		//I want it to be a bit more exact
		//so I make it bounce at the edge
		if (newc.attr('cy') > dimY-newc.attr('r')) {
			newc.posy = dimY - newc.attr('r');
			newc.speedy = -(newc.speedy*newc.bounce)
			if (Math.abs(newc.speedy) > 1)
				{bounceEffect(newc);}
		}
		if (newc.attr('cx') > dimX-newc.attr('r')) {
			newc.posx = dimX-newc.attr('r');
			newc.speedx = -(newc.speedx)
			if (Math.abs(newc.speedx) > 1)
				{bounceEffect(newc);}
		}
		if (newc.attr('cx') < 0+newc.attr('r')) {
			newc.posx = 0+newc.attr('r');
			newc.speedx = -(newc.speedx)
			if (Math.abs(newc.speedx) > 1)
				{bounceEffect(newc);}
		}
	}
}

//to be called by interval.
let circlePhysics = function(){
	//move circles
	for (var i=0; i<circles.length; i++){
		circles[i].physics()
	}
	//check collision after moving circles
	//different for loop so that each circle moves first
	for (var i=0; i<circles.length; i++){
		for (let j=0; j<circles.length; j++){
			//ensure it doesn't check collision with itself
			if (i != j) {
				if (circleCollide(circles[i],circles[j])) {
					circleCollideSpeed(circles[i],circles[j]);
				}
			}
		}
	}

}

//this checks if the circles are colliding and returns boolean
let circleCollide = function(c1,c2) {
	//minimum distance
	let minD = c1.attr('r')+c2.attr('r');
	//actual distance
	let actD = distance({'x':c1.attr('cx'), 'y':c1.attr('cy')},{'x':c2.attr('cx'), 'y':c2.attr('cy')});
	if (actD < minD) {
		console.log("collide")
		return true
	}
	return false
}

//After checking for collision, this function should alter the speeds of the colliding balls
let circleCollideSpeed = function(c1,c2) {
	//first, i need to store the old speed values or else it will affect subsequent calculations.
	let oldspeed1 = {'x':c1.speedx, 'y':c1.speedy};
	let oldspeed2 = {'x':c2.speedx, 'y':c2.speedy};
	c1.speedx = (oldspeed1.x*(c1.mass-c2.mass)+(2*c2.mass*oldspeed2.x))/(c1.mass+c2.mass);
	c1.speedy = (oldspeed1.y*(c1.mass-c2.mass)+(2*c2.mass*oldspeed2.y))/(c1.mass+c2.mass);
	c2.speedx = (oldspeed2.x*(c2.mass-c1.mass)+(2*c1.mass*oldspeed1.x))/(c1.mass+c2.mass);
	c2.speedy = (oldspeed2.y*(c2.mass-c1.mass)+(2*c1.mass*oldspeed1.y))/(c1.mass+c2.mass);
	//notice that the calculation for speedx does not involve speedy at all, and vice versa. 
	//it is proportional to the circle "mass" which is the radius.
	//next, need to adjust posx and posy so that the circles don't repeatedly overlap each instance
	c1.posx += c1.speedx;
	c1.posy += c1.speedy;
	c2.posx += c2.speedx;
	c2.posy += c2.speedy;
	c1.attr({
		'cx':c1.posx,
		'cy':c1.posy
	})
	c2.attr({
		'cx':c2.posx,
		'cy':c2.posy
	})
}

//To be called when the balls bounce off surfaces
//ripple effect
let bounceEffect = function(c) {
	let circ = paper.circle(c.posx,c.posy,c.mass).attr({
		'stroke-width':10,
		'stroke':c.attr("fill"),
	})
	circ.node.setAttribute('pointer-events','none');
	circ.animate({
		'r':200,
		'opacity':0
	},2000,"ease-out",circ.remove)
}


setInterval(circlePhysics,10)

//The actual clicking is here=================//
//===========================================//
//VARIABLES TO TRACK MOUSE POSITION AND SPEED//
var mouse = {'x':0, 'y':0} //current mousepos
var old = {'x':0, 'y':0} //old mousepos
var speedx = 0;
var speedy = 0;
var mousestate = false;
var length = 0;
var maxLength = distance({'x':0,'y':0},{'x':dimX,'y':dimY});
//===========================================//
//====Arrow for speed of circles==============//
let arrow = paper.path("M 0 0 L 100 0 Z").attr({
	"stroke-width":10,
	"stroke-linecap":"round",
	"stroke-dasharray":".",
})
arrow.node.setAttribute('pointer-events','none')
arrow.hide();
//==============================================//
//dragging======================================//
bg.node.addEventListener('mousedown', function(ev){
	mousestate = true;
	old.x = ev.offsetX;
	old.y = ev.offsetY;
	arrow.attr("path", `M ${old.x} ${old.y}`)
	arrow.show();
});
bg.node.addEventListener('mousemove', function(ev){
	if (mousestate) {
	mouse.x = ev.offsetX;
	mouse.y = ev.offsetY;
	bg.attr("cursor","none");
	arrow.attr("path",`M ${old.x} ${old.y} L ${mouse.x} ${mouse.y}`);
	length = Math.floor(distance(old,mouse))
	//seems like there's no issue if length exceeds 200 for opacity. but the colour needs the maxLength variable.
	//gets increasingly redder based on length of arrow 'pull'. 
	//gets increasingly visible until max at 200 length.
	let redv = map(length, 0, maxLength, 100, 255)
	let opa = map(length, 0, 200, 0, 1)
	arrow.attr({
		"stroke":`rgb(${redv},0,0)`,
		"opacity":opa});
	//there is an error if you try to put an arrowhead while the path is too short
	//this places an arrowhead only if it's long enough.
	if (length > 50) {
		arrow.attr("arrow-end","block-medium-short")
		}
	}
})
//resets everything and submits the speed.
//mouseup is when the circle is created.
bg.node.addEventListener('mouseup', function(ev){
	mousestate = false;
	length = 0;
	bg.attr("cursor","crosshair")
	arrow.attr("arrow-end","none")
	speedx = (mouse.x - old.x)/10;
	speedy = (mouse.y - old.y)/10;
	createCircle(ev.offsetX, ev.offsetY);
	arrow.hide();
})
//if it leaves the area, just release the ball.
bg.node.addEventListener('mouseout', function(ev){
	if (mousestate) {
	mousestate = false;
	length = 0;
	bg.attr("cursor","crosshair")
	arrow.attr("arrow-end","none")
	speedx = (mouse.x - old.x)/10;
	speedy = (mouse.y - old.y)/10;
	createCircle(ev.offsetX, ev.offsetY);
	arrow.hide();
	}
})


//range from 0 gravity to 0.4 (double)
let gravSlider = $('grav')
gravSlider.addEventListener('input', function(ev){
	//don't use arrow notation if you want to use 'this' keyword
	//i honestly dk why arrow notation is like this
	//value is a string
	gravity = parseFloat(this.value);
})
//effective range from 1 (no drag) to 0.98 (most drag)
let dragSlider = $('drag')
dragSlider.addEventListener('input', function(ev){
	drag = 1 - parseFloat(this.value);
})

let resetbtm = $('resetbtn').addEventListener('click', function(){
	gravSlider.value = 0.2;
	gravity = 0.2
	dragSlider.value = 0.01;
	drag = 0.99
	for (let i=0; i<circles.length; i++) {
		circles[i].remove();
	}
	circles = [];
})

//todo: add sounds when bouncing off x and y surface?
//todo: maybe make the bounces change the glow effect?

//credits:
//https://gamedevelopment.tutsplus.com/tutorials/when-worlds-collide-simulating-circle-circle-collisions--gamedev-769
//allowing me to wrap my head around ball collision physics.
//conservation of energy

//let's try making a path.
//accepts 2 obj with x,y values
let makePath = function(start,end) {
	let path = paper.path(`M ${start.x},${start.y} L ${end.x}, ${end.y}`);
	path.start = start;
	path.end = end; //attaching objects as property of the path object
	//path.gradient = gradient(start,end);    //TODO
	//path.constant = constant(start, path.gradient) //TODO
}
//TODO: gradient()
//TODO: constant()
let checkPathCollide = function(path,circle) {
	for (let x = path.start.x; x = path.end.x; x++) {
		let y = (path.gradient*x + path.constant); //y=mx+c
		let dist = distance({'x':x,'y':y},{'x':circle.posx,'y':circle.posy});
		if (dist <= circle.mass) {//because i stored the radius in the mass property lol
			//return true;
			//if return it will probably break out of loop
		}
	}
}