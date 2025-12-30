let level = 1;
let time = 30;
let maxTime = 30;
let timer;
let correctAnswer;
let lives = 3;
let record = Number(localStorage.getItem("record")) || 0;
let lang = localStorage.getItem("lang") || "es";
let sound = localStorage.getItem("sound") !== "off";

// ===== TEXTOS =====
const t = {
  es: {
    play:"Jugar", settings:"Ajustes", pause:"Pausa", resume:"Reanudar",
    restart:"Restablecer", support:"Servicio al cliente",
    loseTitle:"Perdiste 💀", loseBtn:"Volver al inicio",
    level:"Nivel", time:"Tiempo", record:"Récord",
    send:"Enviar", close:"Cerrar", ageTitle:"¿Cuántos años tienes?"
  },
  en: {
    play:"Play", settings:"Settings", pause:"Pause", resume:"Resume",
    restart:"Reset", support:"Customer support",
    loseTitle:"You lost 💀", loseBtn:"Back to home",
    level:"Level", time:"Time", record:"Record",
    send:"Send", close:"Close", ageTitle:"How old are you?"
  }
};

window.onload = () => {
  applyLang();
  createBackground(); 
  document.getElementById("record").innerText = record;
  if (!localStorage.getItem("age")) {
    openModal("ageModal");
  }
};

// ===== FONDO ANIMADO =====
function createBackground() {
  const bg = document.getElementById("mathBg");
  if(!bg) return;
  const symbols = ['+', '-', '×', '÷', 'π', '√'];
  for (let i = 0; i < 15; i++) {
    let span = document.createElement("span");
    span.innerText = symbols[rand(0, symbols.length - 1)];
    span.className = "floating-symbol";
    span.style.left = rand(0, 100) + "%";
    span.style.top = rand(0, 100) + "%";
    span.style.animationDuration = rand(10, 20) + "s";
    bg.appendChild(span);
  }
}

// ===== UTIL =====
function openModal(id){ document.getElementById(id).style.display="flex"; }
function closeModal(id){ document.getElementById(id).style.display="none"; }
function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

// ===== JUEGO =====
function startGame(){
  level=1; lives=3;
  show("game");
  next();
}

function next(){
  setTime();
  genQuestion();
  startTimer();
  updateUI();
}

function updateUI() {
  document.getElementById("lives").innerText="❤️".repeat(lives);
  document.getElementById("level").innerText=level;
  const bar = document.getElementById("timerBar");
  if(bar) bar.style.width = "100%";
}

function setTime(){
  time = level<=10?30:level<=30?20:level<=50?15:level<=70?10:5;
  maxTime = time;
  document.getElementById("time").innerText=time;
}

function startTimer(){
  clearInterval(timer);
  const bar = document.getElementById("timerBar");
  timer=setInterval(()=>{
    time -= 0.1;
    if(bar) bar.style.width = (time / maxTime * 100) + "%";
    document.getElementById("time").innerText = Math.ceil(time);
    
    if(time<=0) {
        clearInterval(timer);
        lose();
    }
  }, 100);
}

// ===== PREGUNTAS (LIMPIEZA DE ERROR DE COLOR AQUÍ) =====
function genQuestion(){
  let a, b, op;
  if(level < 5) { 
    a=rand(1,10); b=rand(1,10); op='+'; correctAnswer=a+b;
  } else if(level < 15) { 
    a=rand(10,30); b=rand(1,20);
    op = Math.random() > 0.5 ? '+' : '-';
    correctAnswer = op === '+' ? a+b : a-b;
  } else { 
    a=rand(2,12); b=rand(2,12); op='×'; correctAnswer=a*b;
  }

  document.getElementById("question").innerText=`${a} ${op} ${b}`;
  
  let set=new Set([correctAnswer]);
  while(set.size<4) set.add(correctAnswer+rand(-5,5));
  let options = [...set].sort(() => Math.random() - 0.5);
  
  [...document.querySelectorAll(".options button")].forEach((btn,i)=> {
      btn.innerText=options[i];
      // FIX: Limpiamos los colores de la ronda anterior
      btn.style.background = ""; 
      btn.classList.remove("correct", "wrong");
  });
}

function answer(btn){
  clearInterval(timer);
  if(+btn.innerText===correctAnswer){
    btn.style.background = "#22c55e"; // Verde éxito temporal
    play("soundCorrect");
    level++;
    if(level>record){
      record=level;
      localStorage.setItem("record",record);
      document.getElementById("record").innerText=record;
    }
    setTimeout(next, 250); // Pequeña pausa para ver el color y cambiar
  } else {
    btn.style.background = "#ef4444"; // Rojo error temporal
    document.getElementById("game").classList.add("shake");
    setTimeout(()=> document.getElementById("game").classList.remove("shake"), 400);
    lose();
  }
}

function lose(){
  play("soundWrong");
  lives--;
  if(lives<=0){
    play("soundLose");
    show("loseModal");
  } else {
    setTimeout(next, 400);
  }
}

// ===== NAVEGACIÓN Y AJUSTES =====
function saveAge(){
  localStorage.setItem("age", document.getElementById("ageInput").value);
  closeModal("ageModal");
}
function setLanguage(l){
  lang=l; localStorage.setItem("lang",l); applyLang();
}
function applyLang(){
  document.querySelectorAll("[data-text]").forEach(e=>{
    if(t[lang][e.dataset.text]) e.innerText = t[lang][e.dataset.text];
  });
}
function play(id){
  if(!sound) return;
  let a=document.getElementById(id);
  if(a) { a.currentTime=0; a.play(); }
}
function toggleSound(){
  sound=!sound;
  localStorage.setItem("sound", sound?"on":"off");
  let btn = document.getElementById("soundBtn");
  if(btn) btn.innerText = sound ? "ON" : "OFF";
}
function show(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".modal").forEach(m=>m.style.display="none");
  const el = document.getElementById(id);
  if(el.classList.contains("screen")) el.classList.add("active");
  else el.style.display = "flex";
}
function goHome(){ show("home"); }
function openPause(){ clearInterval(timer); openModal("pauseModal"); }
function resumeGame(){ closeModal("pauseModal"); startTimer(); }
function confirmReset(){
  if(confirm(lang==='es'?"¿Restablecer?":"Reset?")) goHome();
}
function openSettings(){ openModal("settingsModal"); }
function closeSettings(){ closeModal("settingsModal"); }
function openSupport(){ openModal("supportModal"); }
function closeSupport(){ closeModal("supportModal"); }
function sendSupport(){
  window.location.href = "mailto:bfsoports@gmail.com?subject=Soporte Math Game";
}