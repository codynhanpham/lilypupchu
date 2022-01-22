// Get images from server
async function fetchImages(count) {
    const media = await fetch(
        `https://lilypupchu-api.herokuapp.com/poms/${count}`,
        {
            method: 'GET'
        }
    )
    .then((res) => res.json())
    .catch(error => {
        console.log('Error calling the API: ', error);
        throw error;
    });
    const data = media.data;
    mediaList = mediaList.concat(data);
};

// Cache images:
function preloadImages(array) {
    if (!preloadImages.list) {
        preloadImages.list = [];
    };
    var list = preloadImages.list;
    for (var i = 0; i < array.length; i++) {
        var img = new Image();
        img.onload = function() {
            var index = list.indexOf(this);
            if (index !== -1) {
                // remove image from the array once it's loaded
                // for memory consumption reasons
                list.splice(index, 1);
            };
        };
        list.push(img);
        img.src = array[i];
    };
};

// Check availability (deleted or not) :: 404 --> False || 200 --> True
function checkAvail(url,quit) {
    fetch(
        url,
        {
            method: 'HEAD'
        }
    )
    .then((res) => {  
        if (res.status === 404) {
            quit = true;
            return (
                notFound(), quit
            );
        }
        else if (res.status !== 200) {
            quit = true;
            return(
                notFound(), quit
            );
        };
    })
    .catch(error => {
        console.log('Error calling the API: ', error);
        throw error;
    });
};

// 404 --> change image
function notFound() {
    document.getElementById("main-image").src='./404.png';
    document.getElementById("main-container-background").src='./404.png';
};

// Remove just used image from mediaList, then display next image, if currentImageInBatch < (${batchSize}-5) images then pre-fetch new batch
function nextImg() {
    inputLocked = true;
    
    mediaList.splice(0,1);

    let quit = false;
    checkAvail(mediaList[0].url,quit);
    if (quit === true) return nextImg();

    document.getElementById("main-image").src=mediaList[0].url;
    document.getElementById("main-container-background").src=mediaList[0].url;

    if (mediaList.length < 5) {
        inputLocked = true;
        mediaList_old_length = mediaList.length;
        fetchImages(batchSize).then(() => {
            inputLocked = false;
            let images = [];
            for (let i=(mediaList_old_length); i<mediaList.length; i++) {
                images.push(mediaList[i].url);
            };
            preloadImages(images);
        });
    };

    inputLocked = false;
};

const batchSize = 16;
var mediaList = [];
var mediaList_old_length = 0; // index
var inputLocked = false;

window.onload = function() {
    fetchImages(batchSize).then(() => {
        inputLocked = true;

        let images = [];
        for (let i=(mediaList_old_length); i<mediaList.length; i++) {
            images.push(mediaList[i].url);
        };
        preloadImages(images);

        setTimeout(() => {
            document.getElementById("main-image").src=mediaList[0].url;
            document.getElementById("main-container-background").src=mediaList[0].url;
            inputLocked = false;
        }, 2000);
    });
};





// Keys event!

window.addEventListener("keydown", checkKeyPressed, false);
function checkKeyPressed(evt) {
    if (evt.keyCode == "38") { //up
        if (inputLocked) return;
        var arrowKey = document.getElementById("up");
        arrowKey.classList.add("pressed");
        var compass = document.getElementById("both-on-top");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "37") { //left
        if (inputLocked) return;
        var arrowKey = document.getElementById("left");
        arrowKey.classList.add("pressed");
        var compass = document.getElementById("vinky-on-left");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "40") { //down
        if (inputLocked) return;
        var arrowKey = document.getElementById("down");
        arrowKey.classList.add("pressed");
        var compass = document.getElementById("else-down-bottom");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "39") { //right
        if (inputLocked) return;
        var arrowKey = document.getElementById("right");
        arrowKey.classList.add("pressed");
        var compass = document.getElementById("temmie-on-right");
        compass.classList.add("popped");
    };
};

window.addEventListener("keyup", checkKeyReleased, false);
function checkKeyReleased(evt) {
    if (evt.keyCode == "38") { //up
        if (inputLocked) return;
        var arrowKey = document.getElementById("up");
        arrowKey.classList.remove("pressed");
        var compass = document.getElementById("both-on-top");
        compass.classList.remove("popped");
        
        nextImg();
    };
    if (evt.keyCode == "37") { //left
        if (inputLocked) return;
        var arrowKey = document.getElementById("left");
        arrowKey.classList.remove("pressed");
        var compass = document.getElementById("vinky-on-left");
        compass.classList.remove("popped");
        
        nextImg();
    };
    if (evt.keyCode == "40") { //down
        if (inputLocked) return;
        var arrowKey = document.getElementById("down");
        arrowKey.classList.remove("pressed");
        var compass = document.getElementById("else-down-bottom");
        compass.classList.remove("popped");
        
        nextImg();
    };
    if (evt.keyCode == "39") { //right
        if (inputLocked) return;
        var arrowKey = document.getElementById("right");
        arrowKey.classList.remove("pressed");
        var compass = document.getElementById("temmie-on-right");
        compass.classList.remove("popped");
        
        nextImg();
    };
};

