let currSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = " ";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert"
            src="https://cdn.hugeicons.com/icons/music-note-square-02-stroke-rounded.svg"
            alt="music-note-square-02" width="24" height="24" />
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Harry</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="https://cdn.hugeicons.com/icons/play-stroke-rounded.svg"
                alt="play" width="24" height="24" />
        </div></li>`;
    }
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs;
}
const playMusic = (track, pause = false) => {
    currSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00  / 00:00"
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardCont = document.querySelector(".cardCont")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            cardCont.innerHTML = cardCont.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                    color="#000000" fill="#000">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
           </div>`
        }
    }
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
            })
        })
}
    ///// main
async function main() {
        await getSongs("songs/ncs");
        playMusic(songs[0], true);

        displayAlbum();

        play.addEventListener("click", () => {
            if (currSong.paused) {
                currSong.play();
                play.src = "img/pause.svg";
            }
            else {
                currSong.pause();
                play.src = "img/play.svg";
            }
        })

        currSong.addEventListener("timeupdate", () => {
            document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currSong.currentTime)} / ${secondsToMinutesSeconds(currSong.duration)}`
            document.querySelector(".circle").style.left = (currSong.currentTime / currSong.duration) * 100 + "%";
        });

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
            document.querySelector(".circle").style.left = percent + "%";
            currSong.currentTime = ((currSong.duration) * percent) / 100;
        })
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").style.left = "0";
        })
        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").style.left = "-120%";
        })

        document.querySelector("#prev").addEventListener("click", () => {
            let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
            if ((index - 1) >= 0) {
                playMusic(songs[index - 1]);
            }
        })
        document.querySelector("#next").addEventListener("click", () => {
            currSong.pause();
            let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        })
        currSong.onended=()=>{
            let index = songs.indexOf(currSong.src.split("/").slice(-1)[0])
            if ((index + 1) < songs.length) {
                playMusic(songs[index + 1]);
            }
        }
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
            let img=document.querySelector("#volumee")
            currSong.volume = parseInt(e.target.value) / 100;
            if(currSong.volume===0){
                img.src="img/mute.svg"
            }else{
                img.src="img/volume.svg"
            }
        })
        document.querySelector(".volume>img").addEventListener("click",e=>{
            if(e.target.src.includes("img/volume.svg")){
                e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg")
                currSong.volume=0;
                document.querySelector(".range").getElementsByTagName("input")[0].value=0;
            }else{
                e.target.src="img/volume.svg"
                e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg")
                currSong.volume=.10;    
                document.querySelector(".range").getElementsByTagName("input")[0].value=10;
            }
        })
    }
    main();
