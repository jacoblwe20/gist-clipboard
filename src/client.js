( function() {

    var 
    getUserSelection = function getSelection() {
        var html = "";
        if (typeof window.getSelection != "undefined") {
            var sel = window.getSelection();
            if (sel.rangeCount) {
                var container = document.createElement("div");
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerText;
            }
        } else if (typeof document.selection != "undefined") {
            if (document.selection.type == "Text") {
                html = document.selection.createRange().htmlText;
            }
        }

        html = html.replace(/</g, '&lt;').replace(/>/g, '&gt;');

        return html;
    };

    chrome.extension.onMessage.addListener(function( message, sender, reply){
        if ( message === 'getUserSelection' ) {
            reply( getUserSelection( ) );
        } else if ( message === 'isReady' ) {
            // this responds if we have already injected the script
            reply( true );
        }
    });

}());