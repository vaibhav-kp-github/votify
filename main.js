// console.log("let start javascript");

let songinfo = document.getElementById("songinfo")
let previousSong = document.getElementById("previousSong")
let playPause = document.getElementById("playPause")
let nextSong = document.getElementById("nextSong")
let currentSong = new Audio()
let duration = document.getElementById("duration")
let updatetime = document.getElementById("updatetime")
let seekbar = document.getElementById("seekbar")
let hamburger = document.getElementById("hamburger")
let menuhide = document.getElementById("menuhide")
let songs;
let currentfolder;

menuhide.addEventListener("click" , ()=>{
    document.querySelector(".left").style.left = "-100%"
})


hamburger.addEventListener("click" , ()=>{
    document.querySelector(".left").style.left = "0"
})





async function getsong(folder) {
    currentfolder = folder
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    let responce = await a.text()
    // console.log(responce);

    let div = document.createElement("div")
    div.innerHTML = responce
    let anc = div.getElementsByTagName("a")
    
    let songs =[]
    for (let index = 0; index < anc.length; index++) {
        const element = anc[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    if (songs.length === 0) {
        console.warn("No songs found in:", folder)
        return []
    }

    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML +
            `<li class="list-card">
                <img src="./assest/music.svg" alt="" srcset="">
                <p>${decodeURIComponent(song).replaceAll(" " , "_")}</p>
                <div class="list-info">
                    <p>play Now </p>
                    <img class="listplay" src="./assest/playsong.svg" alt="">
                </div>
            </li>`
    }

    // attach an event listeners to all songs

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(elm => {

        elm.addEventListener("click", () => {
            playMusic(elm.querySelector("p").innerHTML.replaceAll("_" , " ") , elm)
            
            

        })
    })
    
    return songs
}

const playMusic = (trac, elm) => {
    // If same song clicked again → toggle play/pause
    if (currentSong.src.includes(trac)) {
        if (currentSong.paused) {
            currentSong.play();
            playPause.src = "./assest/pausesong.svg";
            elm.querySelector(".listplay").src = "./assest/pausesong.svg";
        } else {
            currentSong.pause();
            playPause.src = "./assest/playsong.svg";
            elm.querySelector(".listplay").src = "./assest/playsong.svg";
        }
        return;
    }

    // Otherwise: play new song
    songinfo.innerHTML = decodeURI(trac.split(".")[0]);
    currentSong.src = `${location.origin}/songs/${currentfolder}/${trac}`;
    playPause.src = "./assest/pausesong.svg";
    currentSong.play();

    // console.log(currentSong);
    

    // Reset all icons to play
    Array.from(document.querySelectorAll(".listplay")).forEach(icon => {
        icon.src = "./assest/playsong.svg";
    });

    // Change current song icon
    elm.querySelector(".listplay").src = "./assest/pausesong.svg";
};


const minuteToSecond = (second) => {
    let minute = Math.floor(second / 60)
    let sec = Math.floor(second % 60)
    if(isNaN(second) || second < 0) return "00:00"
    
    return `${String(minute).padStart(2 , "0")}:${String(sec).padStart(2 , "0")}`


}

async function displaAlbums() {
    let b = await fetch(`http://127.0.0.1:5500/songs/`)
    let responce = await b.text()
    // console.log(responce);

    let div = document.createElement("div")
    div.innerHTML = responce

    let anc = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anc)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];
        if (e.classList.contains("icon-directory") && e.title !== ("..")){
            let albumname = e.title

            let b = await fetch(`http://127.0.0.1:5500/songs/${albumname}/info.json`)
            let responce = await b.json()
            // console.log(responce);

            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div id="card" class="card" data-folder="${albumname}">
                <button class="play-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img"
                        aria-hidden="true" class="e-91000-icon e-91000-baseline" viewBox="0 0 24 24">
                        <path
                            d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
                        </path>
                    </svg>
                </button>
                <img src="./songs/${albumname}/cover.jpg" alt="playlist-first-image" class="" />
                <h2>${responce.title}</h2>
                <p class="">
                    ${responce.description}
                </p>
            </div>`
        }
    }


    // Handle album (card) click to change playlist
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", async e => {
            const folder = e.currentTarget.dataset.folder; // folder name from data-folder attribute
            // console.log("Selected album folder:", folder);

            // Clear current playlist before loading new songs
            document.querySelector(".songlist ul").innerHTML = "";

            // Load songs from selected folder
            songs = await getsong(folder);
            // console.log("Songs updated for album:", folder);
        });
    });
    
}



async function main() {
    let songs  = await getsong("arijeet_singh")
    // console.log(songs);

    displaAlbums()

    // add event listeners to play pause button in seekbar

    playPause.addEventListener("click" , ()=>{
        if(currentSong.paused){
            currentSong.play()
            playPause.src = "./assest/pausesong.svg"
        }else{
            currentSong.pause()
            playPause.src = "./assest/playsong.svg"
        }
    })


    // sond duration and current time update

    currentSong.addEventListener("timeupdate" , ()=>{
        seekbar.value = Math.floor(currentSong.currentTime)
        seekbar.max = Math.floor(currentSong.duration)

        duration.innerHTML = `${minuteToSecond(currentSong.duration)}`
        updatetime.innerHTML = `${minuteToSecond(currentSong.currentTime)}`
        
    })

    // add event listener to seekbar

    seekbar.addEventListener("input", () => {
        currentSong.currentTime = seekbar.value
    })


    // previousSong functionality
    previousSong.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    });

    nextSong.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    });

    // auto next song functionality
    currentSong.addEventListener("ended", () => {
        nextSong.click();
    })


}

main()