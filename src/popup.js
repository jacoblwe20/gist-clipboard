
document.addEventListener( 'DOMContentLoaded', function ( ) {
	var 
	api = 'https://api.github.com/gists',
	content = document.querySelectorAll('.content'),
	createGist = document.querySelectorAll('.create')[0],
	description = document.querySelectorAll('.description')[0],
	link = document.querySelectorAll('.link')[0],
	fileName = document.querySelectorAll('.fileName')[0],
	getUserSelection = function getUserSelection( id ) {
		chrome.tabs.sendMessage(id, "getUserSelection", function(res){
	    	
	    	if( content ) content[0].innerHTML = res || "Please select something";
	  	});
	},
	isReady = function isReady( id, callback ) {
		// this could become problematic for debugging
		try {
			chrome.tabs.sendMessage( id, "isReady", function(res){
		    	if ( res ) {
		    		callback ( true );
		    		return true;
		    	}

		    	callback( false );
		  	});
		} catch ( e ){
			callback ( false );
		}
	},
	injectScript = function injectScript( id ) {
  		chrome.tabs.executeScript( id , {file: "src/client.js"});
	},
	createLink = function createLink( url ){
		var a = document.createElement( 'a' );

		a.href = url;
		a.innerText = url;
		a.target = '_blank';

		link.appendChild( a );
	},
	defaults = function ( ) {
		content.innerHTML = '';
		fileName.value = '';
		description.value = '';
	},
	request = function ( url, options, callback ) {

		if( !url ){
			if ( callback ){
				var error = new Error('A url must be specified'); 
				callback( error );
			}
			return null;
		}

		options = options || {};

		var handle = function handle( ) {
			if ( xhr.readyState === 4 ){
				console.log( xhr.status );
				if( xhr.status ===  200 || xhr.status === 201 ) {
					callback( null, JSON.parse(xhr.responseText) );
				}else{
					var error = new Error('Unsuccessful server' + 
						' responded with a ' 
						+ xhr.status + ' status code' 
					);
					callback( error );
				}
			}
		};
		var xhr = new XMLHttpRequest( );

		if ( typeof options.header === 'object' ) {
			for ( var key in options.headers ) {
				xhr.setRequestHeader( key , options.headers[ key ] );
			}
		}

		xhr.onreadystatechange = handle;
		xhr.open( options.method || "GET", url, true );
		xhr.send( options.data ? JSON.stringify( options.data ) : null );

	}
	
	// get current tab and also status of it
	chrome.tabs.query({ 
		'active': true, 
		'currentWindow':true
	},function(tab){
	  	var id = tab[0].id;

	  	isReady( id, function ( yes ) {
	  		if ( yes ) {
	  			getUserSelection ( id );
	  			return true;
	  		}
	  		injectScript ( id );
	  		getUserSelection( id );
	  	})
	});

	createGist.addEventListener( 'click', function ( e ) {
		e.stopPropagation( );
		e.preventDefault( );
		var files = {};
		 if ( fileName.value ) {
		 	files[ fileName.value ] = {
		 		content: content[0]
		 			.innerHTML
		 			.replace(/\&lt\;/g, "<")
		 			.replace(/\&gt\;/g, ">")
		 	};
			request( api, {
				method: 'POST',
				data: {
					description: description.value || "Made with Gist Clipboard",
					public: true,
					files: files
				}
			}, function ( err, res ) {
				if ( err ) {
					return null;
				}else{
					if ( res.html_url ) createLink( res.html_url );
					defaults( );
				}
				console.log( arguments );
			})
		}else{
			fileName.className += ' error';
		}

	});

});

