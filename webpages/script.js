// Get images from server
async function fetchImages(count, subject) {
    if (subject === null) { subject = '' };
    const media = await fetch(
        `https://lilypupchu-api.herokuapp.com/poms/?count=${count}&subject=${subject}`,
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

    if (subject === '') { justList = justList.concat(data); return };
    if (subject === 'both') { bothList = bothList.concat(data); return };
    if (subject === 'temmie') { temmieList = temmieList.concat(data); return };
    if (subject === 'davinky') { vinkyList = vinkyList.concat(data); return };
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
            return nextImg();
        }
        else if (res.status !== 200) {
            return nextImg();
        };
        return;
    })
    .catch(error => {
        console.log('Error calling the API: ', error);
        throw error;
    });
};

// Remove just used image from mediaList, then display next image, if currentImageInBatch < (${batchSize}-5) images then pre-fetch new batch
function nextImg(subject, subjectArray) {
    inputLocked = true;
    
    subjectArray.splice(0,1);

    checkAvail(subjectArray[0].url,subjectArray);

    document.getElementById("main-image").src=subjectArray[0].url;
    document.getElementById("main-container-background").src=subjectArray[0].url;

    if (subjectArray.length < 5) {
        fetchImages(batchSize, subject).then(() => {
            inputLocked = false;
            let images = [];
            for (let i=0; i<mediaList.length; i++) {
                images.push(mediaList[i].url);
            };
            preloadImages(images);
            mediaList = [];
        });
    };

    inputLocked = false;
};

const batchSize = 15;
let mediaList = []; // temporary, just to cache images
let justList = [];
let temmieList = [];
let vinkyList = [];
let bothList = [];
let inputLocked = false;

window.onload = function() {
    inputLocked = true;
    fetchImages(4, null);
    fetchImages(4, 'both');
    fetchImages(4, 'temmie');
    fetchImages(4, 'davinky');

    setTimeout(() => {
        let images = [];
        for (let i=0; i<mediaList.length; i++) {
            images.push(mediaList[i].url);
        };
        preloadImages(images);
        mediaList = [];

        document.getElementById("main-image").src=justList[0].url;
        document.getElementById("main-container-background").src=justList[0].url;
        inputLocked = false;
    }, 2000);
};



// up --> random // left vinky // right temmie // down both

// Keys event!

window.addEventListener("keydown", checkKeyPressed, false);
function checkKeyPressed(evt) {
    if (evt.keyCode == "38" || evt.keyCode == "87") { //up
        if (inputLocked) return;
        var compass = document.getElementById("just-on-top");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "37" || evt.keyCode == "65") { //left
        if (inputLocked) return;
        var compass = document.getElementById("vinky-on-left");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "40" || evt.keyCode == "83") { //down
        if (inputLocked) return;
        var compass = document.getElementById("both-down-bottom");
        compass.classList.add("popped");
    };
    if (evt.keyCode == "39" || evt.keyCode == "68") { //right
        if (inputLocked) return;
        var compass = document.getElementById("temmie-on-right");
        compass.classList.add("popped");
    };
};

window.addEventListener("keyup", checkKeyReleased, false);
function checkKeyReleased(evt) {
    if (evt.keyCode == "38" || evt.keyCode == "87") { //up
        if (inputLocked) return;
        var compass = document.getElementById("just-on-top");
        compass.classList.remove("popped");
        
        nextImg(null, justList);
    };
    if (evt.keyCode == "37" || evt.keyCode == "65") { //left
        if (inputLocked) return;
        var compass = document.getElementById("vinky-on-left");
        compass.classList.remove("popped");
        
        nextImg('davinky', vinkyList);
    };
    if (evt.keyCode == "40" || evt.keyCode == "83") { //down
        if (inputLocked) return;
        var compass = document.getElementById("both-down-bottom");
        compass.classList.remove("popped");
        
        nextImg('both', bothList);
    };
    if (evt.keyCode == "39" || evt.keyCode == "68") { //right
        if (inputLocked) return;
        var compass = document.getElementById("temmie-on-right");
        compass.classList.remove("popped");
        
        nextImg('temmie', temmieList);
    };
};

