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
let channelNumber = 1;
let isMin = false, isMuted = true, isOn = true, showInfo = false;

// Initialize stored channel number
if (localStorage.getItem("storedChannelNumber") === null) {
    channelNumber = 1;
    localStorage.setItem("storedChannelNumber", 1);
} else {
    channelNumber = Number(localStorage.getItem("storedChannelNumber"));
    // Ensure the stored channel number is valid
    if (!vids || !vids[channelNumber]) {
        channelNumber = 1;
        localStorage.setItem("storedChannelNumber", 1);
    }
}

/**
 * Get the name of the channel.
 * @param {number} channel - The channel number.
 * @returns {string} - The name of the channel.
 */
function getChannelName(channel) {
    return vids[channel] ? vids[channel].name : "...";
}

/**
 * Resize the YouTube player to fit the screen.
 */
function resizePlayer() {
    let p = document.querySelector("#player");
    p.style.top = - window.innerHeight * 0.5 + "px";
    p.style.left = (window.innerWidth - Math.min(window.innerHeight * 1.777, window.innerWidth)) / 2 + "px";
    player.setSize(Math.min(window.innerHeight * 1.777, window.innerWidth), window.innerHeight * 2);
}

/**
 * Fetch the list of videos from list.json.
 */
function getList() {
    fetch('./list.json')
        .then(response => response.json())
        .then(data => {
            vids = data;
            console.log("Loaded video list:", vids); // Check if vids is populated correctly
            // Ensure the stored channel number is valid after loading the list
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

/**
 * Show the channel name briefly.
 */
function showChannelNameBriefly() {
    channelName.style.opacity = 1;
    setTimeout(() => {
        channelName.style.opacity = 0;
    }, 3000); // Show for 3 seconds
}

/**
 * Play a specific channel.
 * @param {number} ch - The channel number.
 * @param {boolean} s - A flag indicating whether to start the channel.
 */
function playChannel(ch, s) {
    currentChannel = ch;
    console.log("Playing channel:", ch);
    
    if (vids && vids[ch]) {
        let channelVideos = Object.values(vids[ch].videos);
        console.log("Videos for channel:", channelVideos);

        if (channelVideos.length > 0) {
            // Pick a random video
            currentVideoIndex = Math.floor(Math.random() * channelVideos.length);
            let video = channelVideos[currentVideoIndex];
            console.log("Loading video:", video);
            
            playingNow = video.id;
            startAt = 0;
            player.loadVideoById(playingNow, startAt);
            player.setVolume(100);
            player.setPlaybackRate(1);
            
            // Update the title
            document.getElementById('title').textContent = video.title;
        } else {
            console.log("No video found for channel", ch);
            smpte.style.opacity = 1;
        }
    } else {
        console.log("No data for channel", ch);
        smpte.style.opacity = 1;
    }
    
    channelName.textContent = getChannelName(ch);
    showChannelNameBriefly(); // Show channel name briefly
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

// Function to switch to the next video in the current channel
function switchToNextVideo() {
    let channelVideos = Object.values(vids[currentChannel].videos);
    currentVideoIndex++;
    if (currentVideoIndex >= channelVideos.length) {
        currentVideoIndex = 0; // Restart from the first video
    }
    let nextVideo = channelVideos[currentVideoIndex];
    playingNow = nextVideo.id;
    startAt = 0;
    player.loadVideoById(playingNow, startAt);
    player.setVolume(100);
    player.setPlaybackRate(1);
    
    // Update the title
    document.getElementById('title').textContent = nextVideo.title;
}

// YouTube API script setup
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

/**
 * Initialize the YouTube player when the API is ready.
 */
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
    window.addEventListener('resize', function (event) {
        resizePlayer();
    }, true);
}

/**
 * Handle errors from the YouTube player.
 * @param {Object} event - The error event.
 */
function onErrorOccured(event) {
    console.error(event.data);
}

/**
 * Hide the static noise overlay.
 */
function hideStaticNoise() {
    staticNoise.style.display = "none";
}

/**
 * Handle the YouTube player ready event.
 * @param {Object} event - The ready event.
 */
function onPlayerReady(event) {
    hideStaticNoise();
    getList();
    showChannelNameBriefly(); // Show channel name briefly on load
}

/**
 * Handle state changes in the YouTube player.
 * @param {Object} event - The state change event.
 */
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        switchToNextVideo();
    }
}

/**
 * Handle autoplay blocked event.
 */
function onAutoplayBlocked() {
    console.log("Autoplay blocked!");
}

/**
 * Toggle the mute state of the player.
 */
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

/**
 * Switch to a different channel.
 * @param {number} a - The channel offset.
 */
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

/**
 * Toggle the control panel visibility.
 */
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

/**
 * Toggle the power state of the player.
 */
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

/**
 * Toggle the info panel visibility.
 */
function toggleInfo() {
    if (showInfo) {
        showInfo = false;
        info.style.display = "none";
    } else {
        showInfo = true;
        info.style.display = "flex";
    }
}