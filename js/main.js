document.getElementById('jsOnly').style.display = 'block';
var clipboard = new ClipboardJS('.btn');
var lbidEl = document.getElementById("lbid"),
    usernameEl = document.getElementById("username"),
    lbid, username;

clipboard.on('success', function(e) {
    document.getElementById('fifth').classList.remove('hidden');
    document.getElementById('clipboardsuccess').classList.add('shown');
});

lbidEl.addEventListener("input", function() {
    lbid = lbidEl.value;
    if(lbid.length > 0) {
        document.getElementById('usernamewrapper').classList.remove('hidden');
    } else {
        document.getElementById('usernamewrapper').classList.add('hidden');
    }
    handleInput()
});

usernameEl.addEventListener("input", function() {
    username = usernameEl.value;
    handleInput()
});

function handleInput() {
    var url;
    document.getElementById('clipboardsuccess').classList.remove('shown');
    if(lbid.length > 0 && username.length > 0) {
        url = 'https://eavesdrop.fm/?id=' + encodeURIComponent(lbid) + '&user=' + encodeURIComponent(username);
        document.getElementById('copybutton').classList.remove('hidden');
    } else {
        url = '';
        document.getElementById('copybutton').classList.add('hidden');
        document.getElementById('fifth').classList.add('hidden');
    }
    document.getElementById('copier').setAttribute("data-clipboard-text", url);
}