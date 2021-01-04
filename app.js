var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var jump = false;
var startGame = false;
const pic = {
    stand: [0 , 0],
    up1: [768 , 0],
    up2: [0, 256],
    down1: [256, 0],
    down2: [512, 0],
    socks: [256, 256],
    ground_surface: [[512, 256], [768, 256], [0, 512]],
    ground: [[256, 512], [512, 512], [768, 512]],
    origin_size: 256,
    canvas_size: 128
}
var x = 400;
var y = 810;
var dy = 10;
var Gx = 0;
var Gy = 952;
var GSy = 824;
var sx = 1920;
var sy = 810;
var j = 0;
var k = 16;
var crash = false;
var threshold = 3000;
var time = 0;
var socks_p = 2;
var spawnsocks = false;
var speed = 3;
var timecheck = 0;
var start;

var img = new Image();
img.src = "lib/img.png";




function drawPearl() {
    if(jump == true) {
        y = y - dy
        if(y >= 810) {
            y = 810;
            ctx.drawImage(img, pic.stand[0], pic.stand[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
            jump = false;
            dy = 10;
        }
        else {
            dy-=0.13;
            if (dy >= 5) {
                ctx.drawImage(img, pic.up2[0], pic.up2[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
            }
            else if (dy >= 0 && dy < 5) {
                ctx.drawImage(img, pic.up1[0], pic.up1[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
            }
            else if (dy < 0 && dy > -5) {
                ctx.drawImage(img, pic.down1[0], pic.down1[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
            }
            else if (dy <= -5){
                ctx.drawImage(img, pic.down2[0], pic.down2[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
            }
        }
    }
    else {
        ctx.drawImage(img, pic.stand[0], pic.stand[1], pic.origin_size, pic.origin_size, x, y, pic.canvas_size, pic.canvas_size);
    }
}

function drawGround() {
    if (!startGame) {
        for(i = 0; i < 15; i++) {
            ctx.drawImage(img, pic.ground_surface[i%3][0], pic.ground_surface[i%3][1], pic.origin_size, pic.origin_size, Gx+i*128, GSy, pic.canvas_size, pic.canvas_size); //땅표면
            ctx.drawImage(img, pic.ground[i%3][0], pic.ground[i%3][1], pic.origin_size, pic.origin_size, Gx+i*128, Gy, pic.canvas_size, pic.canvas_size); //땅
        }
    }
    else {
        var jj = 0;
        for(j; j < k; j++) {
            ctx.drawImage(img, pic.ground_surface[j%3][0], pic.ground_surface[j%3][1], pic.origin_size, pic.origin_size, Gx+jj*128, GSy, pic.canvas_size, pic.canvas_size); //땅표면
            ctx.drawImage(img, pic.ground[j%3][0], pic.ground[j%3][1], pic.origin_size, pic.origin_size, Gx+jj*128, Gy, pic.canvas_size, pic.canvas_size); //땅
            jj+=1;
        }
        if(Gx <= -128) {
            Gx = 0;
            j-=15;
            k+=1;
        }
        else {
            Gx-=speed;
            j-=16;
        }
    }
}

function drawSocks() {
    //랜덤으로 소환, 피할수 있게(양말이 소환되는 최소 간격 설정; 시간으로 할까)
    //우선 양말 소환할지 안할지 결정(임계 시간이 지난 다음 무작위 시간에 소환)
    
    //실제로 소환, 한화면에 한개의 장애물 밖에 오지 못한다
    if (spawnsocks) {
        ctx.drawImage(img, pic.socks[0], pic.socks[1], pic.origin_size, pic.origin_size, sx, sy, pic.canvas_size, pic.canvas_size);
        if(checkCrash()) {
            crash = true;
        }
        sx-=speed;
        if (sx <= -128) {
            spawnsocks = false;
            sx = 1920;
        }
    }
    else {
        var ntime = new Date();
        if (time == 0) {
            time = ntime.getTime();
        }
        else {
            if (ntime.getTime() - time > threshold) {
                if (Math.random()*10%socks_p) {
                    time = 0;
                    spawnsocks = true;
                }
            }
        }
    }
}

function checkCrash() {
    x_c = x + 64;
    y_c = y + 64;
    if (sx - x_c < 64 && sx - x_c > 0 && y_c - sy <= 64 && y_c - sy > 0) {
        return true
    }
    else if (Math.pow(x_c - sx, 2) + Math.pow(y_c - sy, 2) <= Math.pow(pic.canvas_size/2, 2)) {
        return true
    }
    else if (x_c < sx + 60 && x_c > sx && y_c >= sy - 64) {
        return true;
    }
    else if (Math.pow(x_c - sx - 60, 2) + Math.pow(y_c - sy, 2) <= Math.pow(pic.canvas_size/2, 2)) {
        return true;
    }
    else {
        return false;
    }
}

function showGameOver() {
    startGame = false;
    document.removeEventListener("keydown", keydownHandler, false);
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(100, 100, 100, 1)"; //색상지정
    ctx.font = "80px 'Noto Sans KR'"; //폰트의 크기, 글꼴체 지정
    ctx.fillText("Game Over", 960, 700);
    ctx.font = "50px 'Noto Sans KR'"; //폰트의 크기, 글꼴체 지정
    ctx.fillText("스페이스바를 눌러 다시 시작할 수 있습니다", 960, 800);
    document.addEventListener("keydown", restart, false)
}

function playGame() {
    ctx.clearRect(0, 0, 1920, 1080);
    drawGround();
    drawPearl();
    drawSocks();
    
    if(crash) {
        clearInterval(start);
        showGameOver();
    }

    if(timecheck == 0) {
        timecheck = new Date();
        timecheck = timecheck.getTime();
    }
    else {
        ntime = new Date();
        if (ntime.getTime() - timecheck > 5000) {
            threshold = threshold * speed / (speed + 1);
            speed+=1;
            timecheck = 0;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, 1920, 1080);
    drawGround();
    drawPearl();
}

function restart(event) {  
    if (event.keyCode == 32) {
        document.removeEventListener("keydown", restart, false);
        document.addEventListener("keydown", keydownHandler, false);
        jump = false;
        startGame = true;
        crash = false;
        speed = 3;
        threshold = 3000;
        y = 810;
        dy = 10;
        Gx = 0;
        sx = 1920;
        j = 0;
        time = 0;
        spawnsocks = false;
        timecheck = 0;
        start = setInterval(playGame, 1);
    }
}

function keydownHandler(event) {
    if (event.keyCode == 32) {
        jump = true;
    }
}


//해야할 것, 연결없음페이지

//연결없음 페이지에서 스페이스바를 누르면 .cover .left가 왼쪽으로 빠지면서 게임 시작
function moveCover(event) {
    if (event.keyCode == 32) {
        document.getElementsByClassName("right")[0].classList.add("move");
        document.removeEventListener("keydown", moveCover, false);
        document.addEventListener("keydown", keydownHandler, false);
        setTimeout(function () { startGame = true; }, 300);
        start = setInterval(playGame, 1);
    }
}



document.addEventListener("keydown", moveCover, false);



img.onload = draw;