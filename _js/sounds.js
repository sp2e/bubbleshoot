/*will reuse sound objects , 
so will create these as the code is initialized.
whenever a sound needs to play, 
will pull out the next object in the quiue, 
change the src to the file we want to play, and then play it. 
will set a cap of 10 sounds that can plya simultaneously, 
which is a low number, 
buteven on the rare occasion when a player is popping more than 10 bubbbles at a time, 
there's no need to play more than 10 sounds
*/

var BubbleShoot = window.BubbleShoot || {};
BubbleShoot.Sounds = (function(){
  var soundObjects = [];
  var curSoundNum = 0;
  var Sounds;
  /* the ten Audio objects (soundObjects) 
  are initialized as sone as the code is loaded, 
  right here :
  */
  for (var i = 0; i < 10; i++) {
    soundObjects.push(new Audio());
  };
  /*
      create the object "sounds" sto play the sound,
    which contains a single method "play" to play a sound .
    it accepts two parameters: 
      the URL of the osund file to play, and
      the volume to play the sound at,
       which is a decimal number between 0(silent) and 1(full volume)

      Modernizr checks if HTML5 audio is supported
    if not, method does nothing, but no error is thrown because of check for Modernizr.audio
    if supported,
  */
  //sound control will happen inside gmae.js with a call to the 
  //BubbleShoot.Sounds.play function
  Sounds = {
    play : function (url,volume){
      var sound;
      if(Modernizr.audio){
        //if supported:
        //grab current Audio object
        sound = soundObjects[curSoundNum];
        //set it to url of file to play
        sound.src = url;
        sound.volume = volume;
        //play it
        sound.play();
        //play next object in queue next time
        curSoundNum++;
        //limit to 10 last sounds
        if(curSoundNum >= soundObjects.length){
          curSoundNum = curSoundNum % soundObjects.length;
        };
      };
    }
  };
  return Sounds;
})(); 