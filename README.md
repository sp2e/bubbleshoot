# bubbleshoot
Notes from the book: Build an HTML5 Game

Some notes from studying the book and writing the game code are contained in the file:
BubShtNotes.txt.   My other (many) are included inline withing the code files.  All these
notes are 1) meant to be used as references for later coding, and 2) to clarify things as needed.

My code is not a duplicate of the book's code. I usually tried to write my own code,
before looking at the book code. However, often, after my own attempts, and then looking
at the book code, I would thereafter use the book code, and then modify it with my own code changes
and notes.  

All the code for finding "orphans" (bubbles no longer connected to the top of the board by other bubbles)
I wrote myself.  My technique I believe is more efficient in execution time than the book code.

One significant deficiency in the book code that I discovered and changed was that 
the display area for the High Score needed to be widened.  This deficiency also exists in the online code 
that is used to play the game on the author's site.

I also added a few features afterwards:
  1) adjusted how the total number of bubbles allowed for shooting at each level was determined.  
  The book code too quickly reduced this number to an impractical number.

  2) Once the bubbles on the board are reduced to a certain number,
  new bubbles for shooting are not allowed to be a bubble color that is no longer on the board.

I also refactored the code per Crockford's book: "Javascript: The Good Parts."
This mostly involved the following:

  1) How I indented and placed brackets on lines.
  2) I always used brackets for "If" instructions, even if just one statement was included inside the If.
  3) I put all variable declarations at the front of their scope.
    The author did not abide by this rule. In this case, the author's code actually was preferable to me,
    mostly because the overall code amount was not huge.  So keeping track of the scope of the variables 
    was never a problem in terms of code perusal (it was in terms of my knowledge/learning at times!). 
    But I felt this was important for me in developing future habits.
  4) I adopted Crockets spacing rules for expressions. 
    a) spaces around operators.
    b) dont use the ++ or -- operators.
  5) I always placed a ";" at the end of every line applicable, so as to avoid automatic semicolon insertion.
  
