/* myBubbleShoot */

/*
ui.js contains the functionality needed for
the user interface and
to place and display elements on the screen.

the structural diffence of the ui code from the game class
is that just a single ui object is created here (var ui = ...).
Then methods are attached to the ui object.

this code also handles the movement process for the bubble which is shot.
*/
var BubbleShoot = window.BubbleShoot || {};
BubbleShoot.ui = (function($){
	var ui = {
		BUBBLE_DIMS : 44, /* width of each bubble */
		ROW_HEIGHT : 40,
		/* 
		for calculating bubble processes, often
		want to use the center point of a bubble, 
		whereas to place and display a bubble,
		one will use the top and left bubble properties.
		*/
		init : function(){
		},
		hideDialog : function(){
			$(".dialog").fadeOut(300);
			/* 300 ms */
		},
		getMouseCoords : function(e){
			var coords = {x : e.pageX, y : e.pageY };
			return coords;
		},

		getBubbleCoords : function(sprite){
					/*
			Note that author used "bubble" as the name of the parameter t
			that is passed into both
			the getBubbleCoords and getBubbleAngle functions.
			But it is a "sprite" that is passed in, not a "bubble".
			So I named it "sprite".
			*/
			/* position() is a jQuery method */
			var bubbleCoords = sprite.position();
			/* ui is required below because the reference is needed after a bubble is instantiated */
			bubbleCoords.left += ui.BUBBLE_DIMS/2 ;
			bubbleCoords.top  += ui.BUBBLE_DIMS/2 ;
			return bubbleCoords;
		},
		getBubbleAngle : function(sprite, e){
			var mouseCoords = this.getMouseCoords(e); //removing the ui does not work, etc.
			//var mouseCoords = ui.getMouseCoords(e)
			var bubbleCoords = ui.getBubbleCoords(sprite);
			var gameCoords = $("#game").position();
			var boardLeft = 120;
			var angle = Math.atan(
				(mouseCoords.x - bubbleCoords.left - boardLeft) / (bubbleCoords.top + gameCoords.top - mouseCoords.y));
			if(mouseCoords.y > bubbleCoords.top + gameCoords.top){
				angle += Math.PI;
			} /* book version doesnt have ";" here */
			return angle;
		},
		fireBubble : function(bubble, coords, duration){
			bubble.setState(BubbleShoot.BubbleState.FIRING); //for CANVAS
			var complete = function(){
				if(typeof(bubble.getRow()) != 'undefined'){
				/*
				the BOOK, on P119, uses the above line, 
				but it is not in BOLD.

				the line is used in place of the line:
				if(bubble.getRow() !== null ){

				The reader never knows when the auther meant 
				for the line to be changed, nor why

				The why is important here:
				the original line creates an on-screen error 
				if canvas is being used.  
				The error will appear when a bubble is shot
				off screen without a collision happening. Here,
				a half of a bubble will permanently show up in the top left, just left of where	the rest of the bubbles are.
				*/
					bubble.getSprite().css(Modernizr.prefixed("transition"),"");
					bubble.getSprite().css({
						left : bubble.getCoords().left - ui.BUBBLE_DIMS/2, //removing the ui does not work, because in real time, ui will not typically be the in the active scope!
						top  : bubble.getCoords().top - ui.BUBBLE_DIMS/2
					});
					bubble.setState(BubbleShoot.BubbleState.ON_BOARD);
				}else{
					bubble.setState(BubbleShoot.BubbleState.FIRED);
				};
			};
			if(Modernizr.csstransitions && !BubbleShoot.Renderer){
				//Modernizr.prefixed("transition") adds any necessary vendor-specific prefixes
				bubble.getSprite().css(Modernizr.prefixed("transition"),"all " +
					(duration/1000) + "s linear"); //duration divided by 1000 to convert from milleseconds to seconds
				bubble.getSprite().css({
					left : coords.x - ui.BUBBLE_DIMS/2,
					top : coords.y - ui.BUBBLE_DIMS/2				
				});
				setTimeout(
					complete, duration);
			}else{
				/*
				//note animate is a  jQuery function.
				//for canvas, it gets overriden
				//by the animate function that is
				//defined in _js.sprite
				*/
				bubble.getSprite().animate({
					left : coords.x - ui.BUBBLE_DIMS/2,
					top : coords.y - ui.BUBBLE_DIMS/2
				},
				{
					duration : duration, //in milliseconds 
					easing : "linear",
					// must lock the fired bubble into precise position if collision occurred 
					complete: complete
				//easing property affects the speed of the movement 
				//experimented with other easing settings: most caused no animation to occur 
				});  //animate end
			}; // if(Modernizr....){}else{
/*
			This is the code before CSS transitions were added.
			bubble.getSprite().animate({
				left : coords.x - ui.BUBBLE_DIMS/2,
				top : coords.y - ui.BUBBLE_DIMS/2
			},
			{
				duration : duration, //in milliseconds 
				easing : "linear",
				// must lock the fired bubble into precise position if collision occurred 
				complete: function(){
					/* 
					the row and col of a curBubble (a fired bubble) is null if no collision has occurred 
					if not null, then lock its sprite into precise position
					*/
				  /*
					if(bubble.getRow() !== null ){
						bubble.getSprite().css({
							left : bubble.getCoords().left - ui.BUBBLE_DIMS/2, //removing the ui does not work
							top  : bubble.getCoords().top - ui.BUBBLE_DIMS/2
						});
					};
				}
				//easing property affects the speed of the movement 
				//experimented with other easing settings: most caused no animation to occur 
			});
*/
		},  //end firebubble
		/* drawBoard: rendering the level (the bubble layout) */
		/* 
		separating the code that calculates an object's position 
		from the code that renders that object ot hte screen
		is a principle you should apply in all of your game ideas.
		It allows you to more easily change how objects are rendered and
		improves code readability.

		three steps:
		1. Loop over rows and cols and pull out each bubble object.
		2. write the bubble's HTML into the DOM
		3. Position the bubble in the correct position 
		*/

		drawBoard : function(board){
			var row;
			var bubble;
			var sprite;
			var left;
			var top;
			var i;
			var j;
			var rows = board.getRows();
			var gameArea = $("#board");
			for(i=0; i<rows.length;i++){
				row = rows[i];
				for (j =0;j<row.length;j++){
					bubble = row[j];
					if(bubble){
						/* step 1: pulls out the bubble object */
						sprite = bubble.getSprite();
						/* step 2: write bubble's HTML into the DOM */
						gameArea.append(sprite);
						/* 
						step 3: posision the bubble .
						Note that .css is a jQuery function,
						which here passes in an object 
						which is used to set css properties of
						the sprite
						*/
						left = j * ui.BUBBLE_DIMS/2;
						top = i * ui.ROW_HEIGHT;
						sprite.css({
							left : left,
							top : top
						});
					};					  
				};				
			};		
		},
		drawBubblesRemaining : function(numBubbles){
			$("#bubbles_remaining").text(numBubbles);
		},
		drawScore: function (score){
			$("#score").text(score);
		},
		drawHighScore : function(highScore){
			$("#high_score").text(highScore);
		},
		drawLevel : function(level){
			$("#level").text(level+1);
		},
		endGame : function(hasWon,score){
			$("#game").unbind("click");
			BubbleShoot.ui.drawBubblesRemaining(0);
			if(hasWon){
				$(".level_complete").show();
				$(".level_failed").hide();
			}else{
				$(".level_complete").hide();
				$(".level_failed").show();
			};
			$("#end_game").fadeIn(500);
			$("#final_score_value").text(score);					
		}
	};
	return ui;
})(jQuery);