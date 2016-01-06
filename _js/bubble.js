/*myBubbleShoot */
var BubbleShoot = window.BubbleShoot || {};
/*
This file represents the Bubble "class".
For every bubble object we need to manipulate in code, an onscreen element will display; therefore, well create a property to reference that.  Wel'll call it the sprite porperty, and it will store a reference to the jQuery object that we use to manipulate the DOM element.

chain of processes for Bubble is
1) in index:
 upon completing load of "_js/game.js"
Modernizr creates, via jQuery function,
 var game
 and performs game.init
2) above "game" code line: var game = new BubbleShoot.Game();
3) in game.js
  BubbleShoot.Game is defined via 
IIFE (Immediately Invoked Function Expression).
Remember, typically declared functions (=not IIFE)
are not executed immediately.
And in creating a var via an IIFE,
this var function "block" is prevented from polluting global scope.

  here, for Game,
"init","startGame", and getNextBubble methods" are defined.
  
  The startGame method calls getNextBubble(),
which creates a bubble by calling
"B..Shoot.Bubble.create()"
and
bubble.getSprite() 

Note a single image is used to create the four different pictures
for a bubble, for each of the four colors. so 16 different bubble
images are contained in the single image, arranged in four rows,
each row representing a different color.  So a particular color
and bubble state (picture) will be selected by defining one of
the sixteen areas (bubble pictures) within the single image.


*/

/*myBubbleShoot */
BubbleShoot.Bubble = (function($){
	/* Bubble = "constructor":
	1) it returns its internally created variable "Bubble"
	which note is not IIFE
 	2) defines create method for BubbleShoot.Bubble	
	*/
	
	/*
	the following states were added for CANVAS functionality
	*/
	BubbleShoot.BubbleState = {
		CURRENT : 1, //waiting to be fired
		ON_BOARD : 2, // already part of the board display
		FIRING : 3,  // moving toward the board or off the screen
		POPPING : 4,  // being popped. this will display one ot hte popping animation frames
		FALLING : 5, // an orphaned bubble that's falling from the screen
		POPPED : 6,  //done POPPING. A popped bubble dosnt need to be rendered
		FIRED : 7,   //missed the board disply after FIRING. a fired bubble doesnt need to be rendered
		FALLEN : 8	//done FALLING off the screen.  a fallen bubble doesnt need to be rendered.
	};

	var Bubble = function(row,col,type,sprite){
	//  me: 	getSprite becomes a method 
	//	for any instantiated "bubble"
		var that = this;

		// following added for CANVAS capability
		var state;
		var stateStart = Date.now();
		this.getState = function(){return state;};
		this.setState = function(stateIn){
			state = stateIn;
			stateStart = Date.now();
		};
		this.getTimeInState = function(){
			return Date.now() - stateStart;
		};
		// end CANVAS additions

		this.getType = function(){return type;};
		this.getSprite = function(){ return sprite;};
		this.getRow = function(){return row;};
		this.getCol = function(){return col;};
		this.setRow = function(rowIn){row = rowIn;};
		this.setCol = function(colIn){col = colIn;};

		/*for CollisionDetector */
		/* returns the coords for the center of the bubble */
		this.getCoords = function(){
			var coords = {
				left : that.getCol() * BubbleShoot.ui.BUBBLE_DIMS/2 +
					BubbleShoot.ui.BUBBLE_DIMS/2,
				top : that.getRow() * BubbleShoot.ui.ROW_HEIGHT +
					BubbleShoot.ui.BUBBLE_DIMS/2
			};
			return coords;
		};

		this.animateBubble = function(){
			//in book, name= "animatePop" 
			var top = type * that.getSprite().height();
			this.getSprite().css(Modernizr.prefixed("transform"),"rotate(" + (Math.
				random() * 360) + "deg)");
			setTimeout(function(){
				that.getSprite().css("background-position","-50px -" + top + "px");
			},125);
			setTimeout(function(){
				that.getSprite().css("background-position","-50px -" + top + "px");
			},150);
			setTimeout(function(){
				that.getSprite().css("background-position","-50px -" + top + "px");
			},175);
			setTimeout(function(){
				that.getSprite().remove();
			},200);
/*
			for(var i=1; i<=3; i=i+1 ){
				setTimeout(function(){
					var spritePop = that.getSprite();
					spritePop.css("background-position = {i*50,};")
				},100)
			};
*/
		};
	};
	/*me: create is a method of BubbleShoot.Bubble */
	Bubble.create = function(rowNum, colNum, type){
		/* 
		note Author defined variables where first used, 
		as opposed to at the top of their scope's creation.
		I put them at the top here, per Crockford's JS guidelines.
		*/
		var sprite;
		var bubble;
		if (type === undefined){
			type = Math.floor(Math.random() * 4);
			/* floor rounds down to nearest integer */
			/* random() creates real # between 0 and 1, not including 1 */
		};
		/* 
		the sprite variable is defined as a DOM "div" element,
		but it is NOT PLACED in the HTML doc yet here
		*/
		if(!BubbleShoot.Renderer){ 
			sprite = $(document.createElement("div"));
			sprite.addClass("bubble");
			sprite.addClass("bubble_" + type);
		}else{
			sprite = new BubbleShoot.Sprite();
		};
		sprite.addClass("bubble");
		sprite.addClass("bubble_" + type);		
		bubble = new Bubble(rowNum, colNum, type, sprite);
		return bubble;
	};
	return Bubble;
})(jQuery);
		