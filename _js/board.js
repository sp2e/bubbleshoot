/*my board.js*/
var BubbleShoot = window.BubbleShoot || {};
BubbleShoot.Board = (function($){
	NUM_ROWS = 9;
	NUM_COLS = 32;
	var Board = function(){
		var that = this;		
		var rows = createLayout();
		this.getRows = function(){return rows;};
		this.addBubble = function(bubble, coords){
			var rowNum = Math.floor(coords.y / BubbleShoot.ui.ROW_HEIGHT);
			var colNum = coords.x / BubbleShoot.ui.BUBBLE_DIMS * 2;
			if(rowNum % 2 == 1){
				colNum -= 1;
			}
			colNum = Math.round(colNum/2) * 2;
			if(rowNum % 2 == 0){
				colNum -= 1;
			}
			if(!rows[rowNum]){
				rows[rowNum] = [];
			}
			rows[rowNum][colNum] = bubble;
			bubble.setRow(rowNum);
			bubble.setCol(colNum);
		};	

		this.popBubbleAt = function(rowNum, colNum){
			var row = rows[rowNum];
			delete row[colNum];
		};

		this.getBubbleAt = function(rowNum,colNum){
			var row = this.getRows()[rowNum];
			// the line below also works, instead of the above line:
			// var row = rows[rowNum];
			return (!row ? null : row[colNum]);
		};

		this.getBubblesAround = function(rowBase, colBase){
			var bubbleGroup = [];
			var candidate;
			for(var rowNum = rowBase-1; rowNum <= rowBase+1; rowNum++){
				for(var colNum = colBase-2; colNum <= colBase+2; colNum++){
					candidate = that.getBubbleAt(rowNum,colNum);
					if(candidate && !(rowBase == rowNum && colBase == colNum)){
						bubbleGroup.push(candidate);
					};
				};
			};
			return bubbleGroup;
		};

		this.getGroup = function(bubble,found, differentColors){
			var curRow = bubble.getRow();
			var curCol = bubble.getCol();
			var color;
			var surGroup;
			var i;
			var candidate;
			//if(differentColors !== true){differentColors = false;}; 
			if (!found[curRow]){
				found[curRow] = {};
			};

			if (!found.list){
				found.list = [];
			};
/*
			if(found[curRow][curCol]){
				return found;
			};
*/
			if(!(found[curRow][curCol]) === true){
/*
			push bubble onto found
*/
				found[curRow][curCol] = bubble;
				found.list.push(bubble);
	/*
	prepare for iteration and then iterate
	*/			
				color = bubble.getType();
	//			var curBubble = bubble;
				surGroup = that.getBubblesAround(curRow,curCol);
				for(i=0;i<surGroup.length;i++){
					candidate = surGroup[i];
					if(candidate.getType() === color || differentColors ){
						found = that.getGroup(candidate,found,differentColors);
					};
				};
			};
			return found;	
		};		

		this.getOrphans = function(){
			/*
			start with bottom row (the row with the highest index).
			for each bubble in each row on the board,
			if it has not already been marked as processsed ("true") in a new "processed" matrix
			get the group of all bubbles connected to it indepenent of color.
			then if the group does not include a top row (row 0) bubble,
			all bubbles in the group are pushed onto the orphans array.
			All bubbles in the group are marked as processed (true) in the "processed" matrix.
			return orphans array.
			*/
			var processed = [];
			var rowsLen = rows.length;
			var rowNum;
			var colNum;
			var startCol;
			var tempRow;
			var found = {};
			var orphans = [];
			var candidate;
			ROW_ZERO = 0;

			
			for(rowNum = 0; rowNum < rowsLen; rowNum += 1){
				/*
				//initialize processed matrix  => FROM CROCKETT BOOK, BUT NOT NEEDED HERE
				tempRow = [];
				startCol = rowNum%2 == 0 ? 1 : 0 ;
				for(colNum=startCol; colNum < NUM_COLS; colNum += 2){
					tempRow[colNum] = 0;
				};
				processed[rowNum] = tempRow;
				*/
				//ONLY NEED TO DEFINE EACH ROW AS AN EMPYT ARRAY: DONT NEED TO INITIALIZE THE ARRAY MEMBERS (COLUMN ENTRIES)
				processed[rowNum] = [];
			}

			for(rowNum = rowsLen - 1; rowNum >= 0; rowNum -= 1){
				startCol = rowNum%2 == 0 ? 1 : 0 ;
				for(colNum=startCol; colNum < NUM_COLS; colNum += 2){
					candidate = that.getBubbleAt(rowNum, colNum);
					//if(processed[rowNum][colNum] === 0 && candidate){
					if(candidate && !processed[rowNum][colNum]){	
						found = that.getGroup(candidate, {}, true);
						if(!found[ROW_ZERO]){    //this bubble group is orphaned
							$.each(found.list, function(){
								orphans.push(this);
							});
						};
						//mark all bubbles in group as processed
						$.each(found.list, function(){
							var bubble = this;
							processed[bubble.getRow()][bubble.getCol()] = true;
						});			
					};
				};
			};
			return orphans;
		};

	
		//added for CANVAS
		this.getBubbles = function(){
			var bubbles = [];
			var bubble;
			var rows = this.getRows();
			var i,j;
			var row;
			for(i=0;i<rows.length;i+=1){
				row = rows[i];
				for(j=0;j<row.length;j+=1){
					bubble = row[j];
					if(bubble){
						bubbles.push(bubble);
					};
				};
			};
			return bubbles;
		};
		//end CANVAS additions
		this.isEmpty = function(){
			return this.getBubbles().length == 0;
		};

		return this;  //as result of Board()
	};
	
	var createLayout = function(){
		var rows = [];
		var i;
		var row;
		var startCol;
		var j;
		var bubble;
		var left;
		var top;
		for (i=0;i<NUM_ROWS;i++){
			row = [];
			startCol = i%2 == 0 ? 1 : 0 ;
			for (j = startCol; j<NUM_COLS; j+=2){
				bubble = BubbleShoot.Bubble.create(i,j);
				bubble.setState(BubbleShoot.BubbleState.ON_BOARD); //for CANVAS
				if(BubbleShoot.Renderer){
				//for CANVAS: must set onscreen coords for sprite objects by JS code
					left = j * BubbleShoot.ui.BUBBLE_DIMS/2;
					top = i *  BubbleShoot.ui.ROW_HEIGHT;
					bubble.getSprite().setPosition({
						left: left,
						top : top
					});
				};
				row[j] = bubble;			
			};
			rows.push(row);
		};
		return rows;
	};
	
	return Board;
})(jQuery);