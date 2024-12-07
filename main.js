// DOM elements
let staticNoise = document.querySelector(".static-noise");
let smpte = document.querySelector(".smpte");
let channelName = document.querySelector(".channel-name");
let muteIcon = document.querySelector(".muteIcon");
let videoId = document.querySelector(".video-id");
let powerScreen = document.querySelector(".power-screen");
let info = document.querySelector(".info");

// Player and video variables
let player, playingNow, startAt, vids;
let channelNumber = localStorage.getItem("storedChannelNumber") ? Number(localStorage.getItem("storedChannelNumber")) : 1;
let isMin = false, isMuted = true, isOn = true, showInfo = false;

if (!vids || !vids[channelNumber]) {
    channelNumber = 1;
    localStorage.setItem("storedChannelNumber", 1);
}

function getChannelName(channel) {
    return vids[channel] ? vids[channel].name : "...";
}

function resizePlayer() {
    let p = document.querySelector("#player");
    p.style.top = -window.innerHeight * 0.5 + "px";
    p.style.left = (window.innerWidth - Math.min(window.innerHeight * 1.777, window.innerWidth)) / 2 + "px";
    player.setSize(Math.min(window.innerHeight * 1.777, window.innerWidth), window.innerHeight * 2);
}

function getList() {
    fetch('./list.json')
        .then(response => response.json())
        .then(data => {
            vids = data;
            if (!vids[channelNumber]) {
                channelNumber = 1;
                localStorage.setItem("storedChannelNumber", 1);
            }
            playChannel(channelNumber, false);
        })
        .catch(error => console.error('Error loading list.json:', error));
}

let currentChannel = null;
let currentVideoIndex = 0;

function showChannelNameBriefly() {
    channelName.style.opacity = 1;
    setTimeout(() => {
        channelName.style.opacity = 0;
    }, 3000);
}

function showTitleBriefly() {
    let titleElement = document.getElementById("title");
    titleElement.style.opacity = 1;
    setTimeout(() => {
        titleElement.style.opacity = 0;
    }, 5000);
}

function playChannel(ch, s) {
    currentChannel = ch;
    if (vids && vids[ch]) {
        let channelVideos = Object.values(vids[ch].videos);
        if (channelVideos.length > 0) {
            currentVideoIndex = Math.floor(Math.random() * channelVideos.length);
            let video = channelVideos[currentVideoIndex];
            playingNow = video.id;
            startAt = 0;
            player.loadVideoById(playingNow, startAt);
            player.setVolume(100);
            player.setPlaybackRate(1);
            document.getElementById('title').textContent = video.title;
        } else {
            smpte.style.opacity = 1;
        }
    } else {
        smpte.style.opacity = 1;
    }
    channelName.textContent = getChannelName(ch);
    showChannelNameBriefly();
    showTitleBriefly();
    videoId.textContent = `${playingNow}`;
    videoId.onclick = () => {
        const videoUrl = `https://www.youtube.com/watch?v=${playingNow}`;
        navigator.clipboard.writeText(videoUrl).then(() => {
            alert("Video URL copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    };
}

function switchToNextVideo() {
    let channelVideos = Object.values(vids[currentChannel].videos);
    currentVideoIndex = (currentVideoIndex + 1) % channelVideos.length;
    let nextVideo = channelVideos[currentVideoIndex];
    playingNow = nextVideo.id;
    startAt = 0;
    player.loadVideoById(playingNow, startAt);
    player.setVolume(100);
    player.setPlaybackRate(1);
    document.getElementById('title').textContent = nextVideo.title;
    showTitleBriefly();
}

var scriptUrl = 'https://www.youtube.com/s/player/d2e656ee/www-widgetapi.vflset/www-widgetapi.js';
try {
    var ttPolicy = window.trustedTypes.createPolicy('youtube-widget-api', {
        createScriptURL: function (x) {
            return x;
        }
    });
    scriptUrl = ttPolicy.createScriptURL(scriptUrl);
} catch (e) {}
var YT;
if (!window['YT']) YT = { loading: 0, loaded: 0 };
var YTConfig;
if (!window['YTConfig']) YTConfig = { 'host': 'https://www.youtube.com' };
if (!YT.loading) {
    YT.loading = 1;
    (function () {
        var l = [];
        YT.ready = function (f) {
            if (YT.loaded) f();
            else l.push(f);
        };
        window.onYTReady = function () {
            YT.loaded = 1;
            for (var i = 0; i < l.length; i++) try { l[i](); } catch (e) {}
        };
        YT.setConfig = function (c) {
            for (var k in c) if (c.hasOwnProperty(k)) YTConfig[k] = c[k];
        };
        var a = document.createElement('script');
        a.type = 'text/javascript';
        a.id = 'www-widgetapi-script';
        a.src = scriptUrl;
        a.async = true;
        var c = document.currentScript;
        if (c) {
            var n = c.nonce || c.getAttribute('nonce');
            if (n) a.setAttribute('nonce', n);
        }
        var b = document.getElementsByTagName('script')[0];
        b.parentNode.insertBefore(a, b);
    })();
}

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
            'mute': 1,
            'modestbranding': 1,
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onAutoplayBlocked': onAutoplayBlocked,
            'onError': onErrorOccured
        }
    });
    resizePlayer();
    window.addEventListener('resize', resizePlayer, true);
}

function onErrorOccured(event) {
    console.error(event.data);
}

function hideStaticNoise() {
    staticNoise.style.display = "none";
}

function onPlayerReady(event) {
    hideStaticNoise();
    getList();
    showChannelNameBriefly();
    showTitleBriefly();
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        switchToNextVideo();
    }
}

function onAutoplayBlocked() {
    console.log("Autoplay blocked!");
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
        channelNumber = (channelNumber + a - 1 + Object.keys(vids).length) % Object.keys(vids).length + 1;
        localStorage.setItem("storedChannelNumber", channelNumber);
        playChannel(channelNumber, true);
    }
}

function toggleControl() {
    let min = document.querySelectorAll(".min");
    let minimize = document.querySelector(".minimize");
    let minimizeImg = document.querySelector(".minimize img");
    if (isMin) {
        min.forEach(el => el.style.display = "flex");
        minimize.style.margin = "0 0 1rem auto";
        minimizeImg.src = "icons/minimize-2.svg";
        isMin = false;
    } else {
        min.forEach(el => el.style.display = "none");
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
    showInfo = !showInfo;
    info.style.display = showInfo ? "flex" : "none";
}