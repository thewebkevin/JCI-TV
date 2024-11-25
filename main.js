let staticNoise = document.querySelector(".static-noise");
let smpte = document.querySelector(".smpte");
let channelName = document.querySelector(".channel-name");
let muteIcon = document.querySelector(".muteIcon");
let videoId = document.querySelector(".video-id");
let control = document.querySelector(".control");
let powerScreen = document.querySelector(".power-screen");
let info = document.querySelector(".info");
let player, playingNow, playingNowOrder, startAt, vids;
let channelNumber = 1;
let isMin = false, isMuted = true, isOn = true, showInfo = false;

let watchHistory = {};

if (localStorage.getItem("storedChannelNumber") === null) {
    channelNumber = 1;
    localStorage.setItem("storedChannelNumber", 1);
} else {
    channelNumber = Number(localStorage.getItem("storedChannelNumber"));
}

control.addEventListener("mouseover", function () {
    control.style.animation = 0;
});

control.addEventListener("mouseleave", function () {
    if (isMin) {
        control.style.animation = "fadeout 3s forwards";
    }
});

function getChannelName(channel) {
    let name = "...";
    switch (channel) {
        case 1: name = "Sci & Tech"; break;
        case 2: name = "Travel"; break;
        case 3: name = "Food"; break;
        case 4: name = "Architecture"; break;
        case 5: name = "Film"; break;
        case 6: name = "Documentaries"; break;
        case 7: name = "Comedy"; break;
        case 8: name = "Music"; break;
        case 9: name = "Autos"; break;
        case 10: name = "News"; break;
        case 11: name = "UFC"; break;
        case 12: name = "Podcasts"; break;
        case 13: name = "Gaming"; break;
        case 14: name = "Literature"; break;
        case 15: name = "Cooking"; break;
        case 16: name = "Short Films"; break;
        case 17: name = "Game Shows"; break;
        case 18: name = "Cartoons"; break;
    }
    return name;
}

function resizePlayer() {
    let p = document.querySelector("#player");
    p.style.top = - window.innerHeight * 0.5 + "px";
    p.style.left = (window.innerWidth - Math.min(window.innerHeight * 1.777, window.innerWidth)) / 2 + "px";
    player.setSize(Math.min(window.innerHeight * 1.777, window.innerWidth), window.innerHeight * 2);
}

function getList() {
    fetch('./list.json')
        .then(response => response.json())
        .then(data => {
            vids = data;
            console.log("Loaded video list:", vids); // Check if vids is populated correctly
            playChannel(channelNumber, false);
        })
        .catch(error => console.error('Error loading list.json:', error));
}

function playChannel(ch, s) {
    console.log("Playing channel:", ch);
    
    if (vids && vids[ch]) {
        let channelVideos = Object.values(vids[ch]);  // Convert the object to an array
        console.log("Videos for channel:", channelVideos);

        if (channelVideos.length > 0) {
            let video = channelVideos[0];  // Get the first video for the channel
            console.log("Loading video:", video);
            
            playingNow = video.id;  // Set current video ID
            startAt = 0;            // Start at the beginning of the video
            player.loadVideoById(playingNow, startAt);
            player.setVolume(100);
            player.setPlaybackRate(1);
        } else {
            console.log("No video found for channel", ch);
            smpte.style.opacity = 1; // Show SMPTE color bars if no video found
        }
    } else {
        console.log("No data for channel", ch);
        smpte.style.opacity = 1; // Show SMPTE color bars if no video found
    }
}

var scriptUrl = 'https://www.youtube.com/s/player/d2e656ee/www-widgetapi.vflset/www-widgetapi.js';
try {
    var ttPolicy = window.trustedTypes.createPolicy('youtube-widget-api', {
        createScriptURL: function (x) {
            return x;
        }
    });
    scriptUrl = ttPolicy.createScriptURL(scriptUrl);
} catch (e) {
}
var YT;
if (!window['YT'])
    YT = {
        loading: 0,
        loaded: 0
    };
var YTConfig;
if (!window['YTConfig'])
    YTConfig = { 'host': 'https://www.youtube.com' };
if (!YT.loading) {
    YT.loading = 1;
    (function () {
        var l = [];
        YT.ready = function (f) {
            if (YT.loaded)
                f();
            else
                l.push(f);
        };
        window.onYTReady = function () {
            YT.loaded = 1;
            var i = 0;
            for (; i < l.length; i++)
                try {
                    l[i]();
                } catch (e) {
                }
        };
        YT.setConfig = function (c) {
            var k;
            for (k in c)
                if (c.hasOwnProperty(k))
                    YTConfig[k] = c[k];
        };
        var a = document.createElement('script');
        a.type = 'text/javascript';
        a.id = 'www-widgetapi-script';
        a.src = scriptUrl;
        a.async = true;
        var c = document.currentScript;
        if (c) {
            var n = c.nonce || c.getAttribute('nonce');
            if (n)
                a.setAttribute('nonce', n);
        }
        var b = document.getElementsByTagName('script')[0];
        b.parentNode.insertBefore(a, b);
    }());
};

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: 400,
        width: 700,
        playerVars: {
            'playsinline': 1,
            'disablekb': 1,
            'enablejsapi': 1,
            'iv_load_policy': 3,
            'cc_load_policy': 0,
            'controls': 0,
            'rel': 0,
            'autoplay': 1,
            'mute': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onAutoplayBlocked': onAutoplayBlocked,
            'onError': onErrorOccured
        }
    });
    resizePlayer();
    window.addEventListener('resize', function (event) {
        resizePlayer();
    }, true);
}

function onErrorOccured(event) {
    console.error(event.data);
}

function onPlayerReady(event) {
    getList();
}

function onPlayerStateChange(event) {
    staticNoise.style.opacity = 1;
    if (event.data == -1) {
        videoId.textContent = "UNSTARTED";
    } else if (event.data == 0) {
        videoId.textContent = "ENDED";
        if (Object.keys(vids[channelNumber]).length == playingNowOrder) {
            getList();
        } else {
            playChannel(channelNumber, false);
        }
    } else if (event.data == 1) {
        let _startAt = startAt;
        let _playingNow = playingNow;
        let _playingNowOrder = playingNowOrder;
        if (sync(channelNumber)) {
            if (_playingNow == playingNow && _playingNowOrder == playingNowOrder) {
                if (Math.abs(_startAt - startAt) > 7) {
                    player.seekTo(startAt);
                }
            } else {
                player.loadVideoById(playingNow, startAt);
            }
        } else {
            getList();
        }
        staticNoise.style.opacity = 0;
        videoId.textContent = playingNow;

        videoData = player.getVideoData();
        console.log(videoData);

        if (!watchHistory[channelNumber]) {
            watchHistory[channelNumber] = new Set([videoData.author]);
        } else {
            watchHistory[channelNumber].add(videoData.author);
        }

        document.getElementById("title").innerText = videoData.title + " BY " + videoData.author;
    } else if (event.data == 2) {
        videoId.textContent = "PAUSED";
    } else if (event.data == 3) {
        videoId.textContent = "BUFFERING";
    } else if (event.data == 5) {
        videoId.textContent = "VIDEO CUED";
    }
}

function onAutoplayBlocked() {
    console.log("Autoplay blocked!");
}

function onPlayerReady(event) {
    getList();
}

function toggleMute() {
    if (player.isMuted()) {
        player.unMute();
        isMuted = false;
        muteIcon.src = "icons/volume-2.svg";
    } else {
        muteIcon.src = "icons/volume-x.svg";
        player.mute();
        isMuted = true;
    }
}

function switchChannel(a) {
    if (isOn) {
        player.stopVideo();
        channelNumber += a;
        if (channelNumber < 1) {
            channelNumber = Object.keys(vids).length;
        }
        if (channelNumber > Object.keys(vids).length) {
            channelNumber = 1;
        }
        localStorage.setItem("storedChannelNumber", channelNumber);
        playChannel(channelNumber, true);
    }
}

function toggleControl() {
    let min = document.querySelectorAll(".min");
    let minimize = document.querySelector(".minimize");
    let minimizeImg = document.querySelector(".minimize img");
    if (isMin) {
        min[0].style.display = "flex";
        min[1].style.display = "flex";
        min[2].style.display = "flex";
        minimize.style.margin = "0 0 1rem auto";
        minimizeImg.src = "icons/minimize-2.svg";
        isMin = false;
    } else {
        min[0].style.display = "none";
        min[1].style.display = "none";
        min[2].style.display = "none";
        minimize.style.margin = "0";
        minimizeImg.src = "icons/maximize.svg";
        isMin = true;
    }
}


function togglePower() {
    if (isOn) {
        isOn = false;
        player.pauseVideo();
        videoId.textContent = "POWER OFF";
        powerScreen.style.display = "block";
    } else {
        isOn = true;
        powerScreen.style.display = "none";
        playChannel(channelNumber, true);
    }
}
function toggleInfo() {
    if (showInfo) {
        showInfo = false;
        info.style.display = "none";
    } else {
        showInfo = true;
        info.style.display = "flex";
    }
}