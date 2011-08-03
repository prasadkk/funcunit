(function(){
	//the queue of commands waiting to be run
	var queue = [], 
		//are we in a callback function (something we pass to a FuncUnit plugin)
		incallback = false,
		//where we should add things in a callback
		currentPosition = 0;
		
	
	FuncUnit.
	/**
	 * @hide
	 * Adds a function to the queue.  The function is passed within an object that
	 * can have several other properties:
	 * method : the method to be called.  It will be provided a success and error function to call
	 * callback : an optional callback to be called after the function is done
	 * error : an error message if the command fails
	 * timeout : the time until success should be called
	 * bind : an object that will be 'this' of the success
	 * stop : 
	 */
	add = function(handler){
//		console.log('ADD', handler)
		//if we are in a callback, add to the current position
		if (incallback) {
			queue.splice(currentPosition,0,handler)
			currentPosition++;
		}
		else {
			//add to the end
			queue.push(handler);
		}
		//if our queue has just started, stop qunit
		//call done to call the next command
        if (queue.length == 1 && ! incallback) {
			stop();
            setTimeout(FuncUnit._done, 13)
        }
	}
	//this is called after every command
	// it gets the next function from the queue
	var currentEl;
	FuncUnit._done = function(prevItem){
//		console.log("DONE START", el)
//		if(FuncUnit.stop == true) return;
		var next, 
			timer,
			el = prevItem && prevItem.bind,
			selector = prevItem && prevItem.selector,
			speed = 0;
			
		if(FuncUnit.speed == "slow"){
			speed = 500;
		}
		if (queue.length > 0) {
			next = queue.shift();
			currentPosition = 0;
			// set a timer that will error
			
			
//		console.log("before settimeout", speed, FuncUnit._window, window)
		window.focus()
			//call next method
			setTimeout(function(){
//		console.log("in settimeout")
				timer = setTimeout(function(){
						next.stop && next.stop();
						ok(false, next.error);
						FuncUnit._done();
					}, 
					(next.timeout || 10000) + speed)
				// if the last successful method had a collection, save it
				if(el && el.jquery){
					currentEl = el;
//					console.log("currentEl", currentEl)
				}
				// make the new collection the last successful collection
				if(currentEl){
					next.bind = currentEl;
//					console.log("bind", next.bind)
				}
				if(selector){
					next.selector = selector;
				}
//		if(FuncUnit.stop == true) return;
//		console.log("in settimeout22", next)
				next.method(	//success
					function(el){
						if(el && el.jquery && el.length){
							next.bind = el;
						}
//						console.log("success", next)
						//make sure we don't create an error
						clearTimeout(timer);
						
						//mark in callback so the next set of add get added to the front
						
						incallback = true;
//						console.log("DONE", next, next.bind)
						if (next.callback) 
							// callback's "this" is the collection
							next.callback.apply(next.bind || null, arguments);
						incallback = false;
						
						
						FuncUnit._done(next);
					}, //error
					function(message){
						clearTimeout(timer);
						ok(false, message);
						FuncUnit._done();
					})
				
				
			}, speed);
			
		}
		else {
			start();
		}
	}
})()