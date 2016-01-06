/* myBubbleshoot   game.js file */

/*the line below is included at the top of every "class" file
so you dont have to worry about the order in which scripts
are loaded.  If window.BubbleShoot doesnt exist,
it will be created as an empty object.
*/
var BubbleShoot = window.BubbleShoot || {};

BubbleShoot.Game = (function($){
/*
an IIFE (Immediately Invoked Function Expression) 
is defined by:   

(function() {
  // the code here is immediately executed once in its own scope
}());

Passing variables into the scope is done as follows:

(function(a, b) {
  // a == 'hello'
  // b == 'world'
}('hello', 'world'));

BubbleShoot.Game is defined via this structure.  The "$",
here a variable, is defined as jQuery.

Remember, typically declared functions (=not IIFE)
are not executed immediately.

And in creating a var via an IIFE,
this var function "block" is prevented from polluting global scope.

Below, var Game = ....
basically is used by the author's to represent a "class."
Note of course , that classes arent specifically defined by the javascript language itself.

in effect, Game here represents the "controller" code for the game.
*/

	var Game = function(){
		var curBubble;
		var board;
		var numBubbles;
		var bubbles = []; //for CANVAS: 
		/*
		contains all bubbles of the game,both on and off the board layout.
		initially, every bubble is part of the board, 
		so the board contents can be used to populate the array.
		*/
		var MAX_BUBBLES = 70;
		var POINTS_PER_BUBBLE = 50;
		var MAX_ROWS = 11;
		var level = 0;
		var score = 0;
		var highScore = 0;
		var requestAnimationID; //for CANVAS: used to 
		// 1) determine if frame counter is running, and
		// 2) store a timestamp for when the last animation occurred.

		/*	 "init" method defined: 
 		it is called from within Modernizr.load in index.html.

		JQuery's bind method is a cross-browser way to add event handlers.  
		It binds a function to an object that triggers when an event occurs.
		Here, the trigger occurs when the user clicks the New Game button, 
		which calls the startGame function.

		Note an "unbind" is issued the first thing within the startGame function,
		to prevent double-clicks from being regiswtered while the button is fading out
		and trying to start a game twice. 		
		*/
		this.init = function(){
			//for canvas, dont want startGame function to start 
			//until after sprite sheet image has loades
			if(BubbleShoot.Renderer){
				BubbleShoot.Renderer.init(function(){
					$(".but_start_game").click("click",startGame);	
				});
			}else{
				$(".but_start_game").click("click",startGame);
			};
			//first check if localStorage is supported by Browser
			// and if value for high_score exists
			if(window.localStorage && localStorage.getItem("high_score")){
				//values in localStorage are returned as strings
				//we want to work with an integer
				highScore = parseInt(localStorage.getItem("highScore"));
			};
			BubbleShoot.ui.drawScore(highScore);
		};
		/* 
		  "startGame" also is a method,
		but is defined as a variable for later use/reference.
		It is a PRIVATE method, accessible anywhere within Game's scope.
		*/
		var startGame = function(){
			$(".but_start_game").unbind("click");
			numBubbles = MAX_BUBBLES - level * 5;
			BubbleShoot.ui.hideDialog();
			board = new BubbleShoot.Board();
			bubbles = board.getBubbles(); //for CANVAS, initialize bubbles array
			curBubble = getNextBubble();		
			if(BubbleShoot.Renderer){  
				//for CANVAS
				if(!requestAnimationID){
					requestAnimationID = requestAnimationFrame(renderFrame);
				};
			}else{ 
				BubbleShoot.ui.drawBoard(board);
			};	
			$("#game").bind("click",clickGameScreen);
			BubbleShoot.ui.drawScore(score);
			BubbleShoot.ui.drawLevel(level);
		};

		/* getNextBubble creates next shooting bubble (new color,etc) */
		var getNextBubble = function(){
			var top;
			var left;
			var bubble = BubbleShoot.Bubble.create();
			//for CANVAS = results of next code line are not used if CANVAS not used.
			bubbles.push(bubble); //add bubble that's ready to fire to CANVAS
			bubble.setState(BubbleShoot.BubbleState.CURRENT); //set its state
			bubble.getSprite().addClass("cur_bubble"); //sets initial bubble position by CSS
			
			// alternatively, for CANVAS, the current bubble position is set via js:
			top = 470;
			left = ( $("#board").width() - BubbleShoot.ui.BUBBLE_DIMS )/2;
			bubble.getSprite().css({
				top : top,
				left : left
			});
			// end CANVAS code

			$("#board").append(bubble.getSprite());
			BubbleShoot.ui.drawBubblesRemaining(numBubbles);
			numBubbles--;
			return bubble;
		};
		
		var clickGameScreen = function(e){
		/* no unbind. more user clicks will also fire. */

		/*
		..Angle function returns angle, in radians, 
		to left or right of vertical center line of the bubble 
		*/	
			var angle = BubbleShoot.ui.getBubbleAngle(curBubble.getSprite(),e);
			/*			ME */
			var collision = BubbleShoot.CollisionDetector.findIntersection(curBubble,board,angle);
			var duration = 750;
			var distance = 1000;
			//note define variables here for clarity and good code
			var coords = {};
			var distX;
			var distY;
			var bubbleCoords = {};
			var colorGroup;			
			var orphanedBubbles;
			var orphanDelay = 0;
			var popped;
			var points;
			var topRow;
			var topRowBubbles;

			if(collision){
				duration = Math.round(duration * collision.distToCollision / distance)  ;	
				coords = collision.coords ;			
				board.addBubble(curBubble,coords);
				colorGroup = board.getGroup(curBubble,{}, false);
				if(colorGroup.list.length>=3){
					popBubbles(colorGroup.list, duration);
					topRow = board.getRows()[0];
					topRowBubbles =[];
					for (var i = 0; i < topRow.length; i++){
						if(topRow[i]){
							topRowBubbles.push(topRow[i])
						};
					};
					if(topRowBubbles.length <= 5){
						popBubbles(topRowBubbles,duration);
						colorGroup.list.concat(topRowBubbles);
					};
					orphanedBubbles = board.getOrphans();
					orphanDelay = duration;
					if(orphanedBubbles.length>0){
						//delay the popping of orphan bubbles until after the main group has popped
						//orphanDelay =  duration + 200 + colorGroup.list.length * 60; //pre kaboom plugin, my code
						orphanDelay =  duration + 200 + colorGroup.list.length * 30;
							popOrphans(orphanedBubbles, orphanDelay);					
					};
					popped = [].concat(colorGroup.list,orphanedBubbles);
					points = popped.length * POINTS_PER_BUBBLE;
					score += points;
					setTimeout(function(){
						BubbleShoot.ui.drawScore(score);
					},orphanDelay);
				};
			}else{			
				distX = Math.sin(angle) * distance;
				distY = Math.cos(angle) * distance;
				bubbleCoords = BubbleShoot.ui.getBubbleCoords(curBubble.getSprite());
				coords = {
					x : bubbleCoords.left + distX,
					y : bubbleCoords.top - distY
				};
			};
			BubbleShoot.ui.fireBubble(curBubble, coords, duration);
			if(board.getRows().length > MAX_ROWS){
				endGame(false);
			}else if(numBubbles== 0){
				endGame(false);				
			}else if(board.isEmpty()){
				endGame(true);
			}else{
				curBubble = getNextBubble();
			}
		};

		/*
		 Research why:
		 "delay" argument not required to be explicity defined as
		 arguments of the function inside the jQuery "each" method.
		 Simularly for "bubble" to the function inside setTimeout(). 
		*/
		var popBubbles = function(bubbles, delay){
			$.each(bubbles, function(){
				var bubble = this;

/*
				I used the following: RESEARCH if it works!!
				BubbleShoot.board.deleteBubbleAt(bubble.getRow(),bubble.getCol());
*/
				setTimeout(function(){
					bubble.setState(BubbleShoot.BubbleState.POPPING); //for CANVAS
					bubble.animateBubble();
					setTimeout(function(){
						bubble.setState(BubbleShoot.BubbleState.POPPED);	//for CANVAS
					}, 200);
					BubbleShoot.Sounds.play("_mp3/pop.mp3",Math.random()*.5 + .5);
				},delay);
				board.popBubbleAt(bubble.getRow(),bubble.getCol());
				setTimeout(function(){
					bubble.getSprite().remove();					
				},delay + 200);
				delay += 60;
			});
		};

		var popOrphans = function(orphans, popDelay){
			//this function pops the orphan bubbles and 
			//defines what happens visually when they pop

			//my name for this method is different from that of the book
			//the book name for this method is "dropBubbles"

			//popDelay delays the popping of orphanBubbles
			//until after main group of bubbles have popped
			$.each(orphans, function(){
				var bubble = this;

				/*
				KABOOM PLUGIN
				following is for kaboom plugin method of dropping bubbles
				method will only operate on jQuery objects
				as jQuery plugin, will have now knowledge of the game objects and
				will only work with DOM elements,
				making the plugin reusable in future games

				KABOOM causes bubbles to move UP and OUTWARD, before DROPPINNG (sort of explosion effect).
				Explore jQuery PLUGINS more in-depth at 
				http://learn.jquery.com/plugins/basic-plugin-creation/

				Also, the book contains a significant error by the Author, 
				that I noticed on the top of page 20,
				where state information for CANVAS was being added
				to the dropBubbles (book's name for this method) method.
				The book never previously specified 
				the addition of the callback parameter
				that is passed in the call to kaboom, 
				in the code just below.
				So the lines for the call to kaboom should have been in black here,
				or the author needed to previously change or correct the line,
					bubble.getSprite().kaboom({
				on page 85 for dropBubbles.				:
				*/
				board.popBubbleAt(this.getRow(),this.getCol());
				setTimeout(function(){
					bubble.getSprite().kaboom({
						//this callback added for CANVAS
						callback : function(){
							bubble.getSprite().remove();
							bubble.setState(BubbleShoot.BubbleState.FALLEN); //for CANVAS
						}
					});
				},popDelay);				
				
				/*
				//DROPPING ORPHAN BUBBLES, JS ONLY
				//below needed only for PRE-KABOOM setTimeout method for dropping bubbles
				var duration = 200;
				var eachDelay = 100;
				
				coords = bubble.getCoords();
				board.popBubbleAt(this.getRow(),this.getCol());

				//orphan bubbles fall off the board, one by one
				//the following dropped the bubbles before we included the kaboom jquery plugin
				setTimeout(function(){
					bubble.getSprite().animate({
					//left: coords.x,
					top: 1000 //370
					},
					{
					duration: duration,
					easing : "linear"
					});
				}, popDelay);
				popDelay += eachDelay;
				*/
				/*
				 the following would remove the orphan bubbles
				from the display if one didnt have them fall all
				the way off the board
				*/
				/*	
				setTimeout(function(){
					bubble.getSprite().remove();					
				}, popDelay + 200);
				*/
			});
			return;
		}; //popOrphans	
		var renderFrame = function(){
			$.each(bubbles,function(){
				if(this.getSprite().updateFrame){
					this.getSprite().updateFrame();
				};
			});
			BubbleShoot.Renderer.render(bubbles);
			requestAnimationID = requestAnimationFrame(renderFrameS);
		};
		var endGame = function(hasWon){
			if(score > highScore){
				highScore = score;
				$("#new_high_score").show();
				BubbleShoot.ui.drawHighScore(highScore);
				if(window.localStorage){
					localStorage.setItem("high_score",highScore);
				};
			}else{
				$("#new_high_score").hide();
			};
			if(hasWon){
				level++;
			}else{
				score = 0;
				level = 0;
			};
			$(".but_start_game").click("click",startGame);
			$("#board.bubble").remove();
			BubbleShoot.ui.endGame(hasWon,score);
		};
	};
	window.requestAnimationFrame = Modernizr.prefixed("requestAnimationFrame", window) || function(callback){
		window.setTimeout(function(){
			callback();
		},40);
	};	
	return Game;
})(jQuery);
