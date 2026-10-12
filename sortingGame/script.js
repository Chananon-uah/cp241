// Game Config ระดับความยาก
const DIFFICULTY_SETTINGS = {
    easy: { time: 60, multiplier: 1.0, label: "Easy" },
    medium: { time: 45, multiplier: 1.5, label: "Medium" },
    hard: { time: 30, multiplier: 2.0, label: "Hard" }
};

//  Game State Variables 
let selectedDifficulty = 'easy';
let score = 0;
let timer = 60;
let scoreMultiplier = 1.0;
let gameInterval = null;
let randNum;

// Insertion & Merge Data
let numItem = 5;
let rackList = [];
let incomingCard = null;
let beltA = [], beltB = [], plateList = [];

// Event Listener สำหรับเปลี่ยนสีการเลือกความยาก
document.addEventListener('DOMContentLoaded', () => {
    const diffCards = document.querySelectorAll('.diff-card');
    diffCards.forEach(card => {
        card.addEventListener('click', () => {
            diffCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            const radio = card.querySelector('input[type="radio"]');
            radio.checked = true;
            selectedDifficulty = radio.value;
        });
    });
});

// --- Start Game Sequence ---
function startGame() {
    // โหลดค่าตามระดับความยากที่เลือก
    const config = DIFFICULTY_SETTINGS[selectedDifficulty];
    timer = config.time;
    scoreMultiplier = config.multiplier;
    score = 0;

    // อัปเดต UI หน้าเกม
    document.getElementById('diff-label').textContent = config.label;
    updateUI();

    // ซ่อนหน้าแรก แล้วเปิดหน้าเกม
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    startTimer();
    startInsertionMode();
}

function updateUI() {
    document.getElementById('score').textContent = Math.round(score);
    document.getElementById('timer').textContent = timer;
}

// จับเวลา
function startTimer() {
    clearInterval(gameInterval);
    gameInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').textContent = timer;
        if (timer <= 0) {
            timer = 0;
            endGame("หมดเวลา! คะแนนไม่ถึงเป้าหมาย ⏰");
        }
    }, 1000);
}

// ==========================================
// MODE 1: INSERTION SORT LOGIC
// ==========================================
function startInsertionMode() {
    document.getElementById('instruction').textContent = 
        "คำแนะนำ (Insertion): ดูตัวเลขส้มแล้วเลือกลูกศร [⬇️] เพื่อแทรกเข้าไปในตำแหน่งที่ทำให้ราวแขวนเรียงจากน้อยไปมาก!";
    document.getElementById('insertion-area').classList.remove('hidden');
    document.getElementById('merge-area').classList.add('hidden');

    // สุ่มเลขเริ่มต้น 3 เลขสำหรับการเปรียบเทียบให้ผู้เล่นแทรกเลข โดยใช้ insertion
    for (let i = 0; i < 3; i++) {
         randNum = getRandomInt((i*33)+1,(i+1)*33)
         rackList.push(randNum)
    }
    // สุ่มเลขตัวเลขถัดไปสำหรับนำมา sort
    generateIncomingCard();
    // การใส่ตัวเลขและตรวจสอบว่่า insertion ถูกต้องไหม
    renderInsertionArea();
}

// สุ่มตัวเลข
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateIncomingCard() {
    randNum = getRandomInt(1, 99);
    // เช็คว่าเลขที่สุ่มซ้ำกับเลขเริ่มต้นตอนแรกไหม ถ้าซ้ำสุ่มเลขใหม่
    while (rackList.includes(randNum)) {
        randNum = getRandomInt(1, 99);
    }
    incomingCard = randNum;
}

// การสร้างหน้า ui ไว้กดแทรกตัวเลขสำหรับ insertion
function renderInsertionArea() {
    const incContainer = document.getElementById('incoming-ticket-container');
    incContainer.innerHTML = `<div class="order-card new-item">${incomingCard}</div>`;

    const rackContainer = document.getElementById('rack-container');
    rackContainer.innerHTML = '';

    rackContainer.appendChild(createSlotButton(0));

    rackList.forEach((val, idx) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'order-card';
        cardDiv.textContent = val;
        rackContainer.appendChild(cardDiv);

        rackContainer.appendChild(createSlotButton(idx + 1));
    });
}

// สร้างปุ่มไว้กดแทรกตามตำแหน่งต่างๆ ระหว่างตัวเลข
function createSlotButton(insertIndex) {
    const btn = document.createElement('button');
    btn.className = 'slot-btn';
    btn.textContent = '⬇️';
    btn.onclick = () => handleInsertion(insertIndex);
    return btn;
}

// การทำงานของ insertion
function handleInsertion(index) {
    let tempArray = [...rackList];
    tempArray.splice(index, 0, incomingCard);

    // ตัวแปรเช็คค่าเรียงลำดับว่าตัวก่อนหน้ามีค่าน้อยกว่าตัวปัจจุบันเป็น true และตัวก่อนหน้ามีค่ามากกว่าเป็น false
    let isSorted = tempArray.every((val, i, arr) => i === 0 || arr[i - 1] <= val);

    // เช็คแล้วเป็น true ทำการ +10 คะแนน และสุ่มเลขอื่นขึ้นต่อ
    if (isSorted) {
        score += 10;
        rackList = tempArray;
        generateIncomingCard();
    // ถ้าเช็คแล้วผิดเวลา -10s และเตือนว่าผิด
    } else {
        timer -= 10
        alertGame("ผิดตำแหน่ง! เรียงลำดับไม่ถูกต้อง (⏱️-10s)");
        startTimer()
    }

    updateUI();
    // เมื่อใส่เลขครบตามที่กำหนด(8 เลข)ให้ย้ายไปที่เกมถัดไป merge sort
    if (rackList.length >= numItem+3) {
        alertGame("ราวออเดอร์เต็มแล้ว! ย้ายไปสู่โหมดรวมสายพาน (Merge Sort)");
        startTimer()
        startMergeMode();
    } else {
        renderInsertionArea();
    }
}

// ==========================================
// MODE 2: MERGE SORT LOGIC
// ==========================================
function startMergeMode() {
    document.getElementById('instruction').textContent = 
        "คำแนะนำ (Merge): เลือกชิ้นที่น้อยที่สุดจากหน้าสายพาน A หรือ B นำลงจานหลักทีละชิ้น!";

    document.getElementById('insertion-area').classList.add('hidden');
    document.getElementById('merge-area').classList.remove('hidden');
    // สุ่มเลขใส่ในชุด A (ฝั่งซ้าย)ตามจำนวนที่กำหนด (5)
    for (let i = 0; i < numItem; i++) {
        randNum = getRandomInt(1,99)
        while (beltA.includes(randNum)) {
            randNum = getRandomInt(1,99)
        }
        beltA.push(randNum)
    }
     // สุ่มเลขใส่ในชุด B (ฝั่งขวา)ตามจำนวนที่กำหนด (5)
    for (let i = 0; i < numItem; i++) {
        randNum = getRandomInt(1,99)
        while (beltB.includes(randNum) || beltA.includes(randNum)) {
            randNum = getRandomInt(1,99)
        }
        beltB.push(randNum)
    }
    // ทำการเรียงจากเลขน้อยไปมากในข้อมูลทั้ง 2 ชุด เพื่อให้เหมือนขั้นตอนก่อนสุดท้ายในการ merge sort
    beltA.sort((a, b) => a - b);
    beltB.sort((a, b) => a - b);

    plateList = [];

    renderMergeArea();
}

// การสร้างหน้า ui ไว้สำหรับ merge เช่น ปุ่ม ตัวเลข
function renderMergeArea() {
    const containerA = document.getElementById('belt-a');
    const containerB = document.getElementById('belt-b');
    const containerPlate = document.getElementById('plate-container');

    containerA.innerHTML = beltA.map(val => `<div class="order-card">${val}</div>`).join('');
    containerB.innerHTML = beltB.map(val => `<div class="order-card">${val}</div>`).join('');
    containerPlate.innerHTML = plateList.map(val => `<div class="order-card">${val}</div>`).join('');

    document.getElementById('btn-pick-a').disabled = beltA.length === 0;
    document.getElementById('btn-pick-b').disabled = beltB.length === 0;
}

// การเลือกว่าเอาข้อมูลฝั่งไหนมาเรียงก่อน pointer ไปที่ตำแหน่ง 0(ฝั่งที่ตัวหน้าสุดน้อยกว่า)
function pickMergeItem(source) {
    let valA = beltA[0];
    let valB = beltB[0];
    let correctChoice = null;

    // เช็คว่าชุดข้อมูลฝั่งซ้ายและขวาไม่ว่าง
    if (valA !== undefined && valB !== undefined) {
        // และถ้าตัวเลขแรกของของ A น้อยกว่าฝั่งขวา B ให้คำตอบที่ต้องเลือกคือฝั่ง A ถ้าไม่ใช่ให้เลือก B 
        correctChoice = valA <= valB ? 'A' : 'B';
    // ถ้ามีข้อมูลใน A แต่ใน B ไม่มี คำตอบมาจากฝั่ง A
    } else if (valA !== undefined) {
        correctChoice = 'A';
    // ถ้ามีข้อมูลใน B แต่ใน A ไม่มี คำตอบมาจากฝั่ง B
    } else {
        correctChoice = 'B';
    }

    // ถ้าคำตอบที่เลือกมาจากฝั่งที่ถูก +คะแนน 20
    if (source === correctChoice) {
        score += 20;
        // ถ้าคำตอบที่ถูกคือชุดข้อมูล A ให้ทำการลบข้อมูลตัวแรกของ A ออกและขยับตัวที่เหลือมาแทน ถ้าไม่ใช่ให้ทำในชุดข้อมูล B
        let item = (source === 'A') ? beltA.shift() : beltB.shift();
        plateList.push(item);
    // ถ้าตอบผิดให้เวลา -10s และเตือนว่าเราเลือกผิด
    } else {
        timer -= 10
        alertGame("เลือกผิด! ค่าตรงหน้าสายพานอีกฝั่งน้อยกว่า (⏱️-10s)");
        startTimer()
    }

    updateUI();
    renderMergeArea();

    // เมื่อทำการ merge ถูกต้องหมด +50 คะแนน
    if (beltA.length === 0 && beltB.length === 0) {
        score += 50;
        endGame("ยินดีด้วย! คุณผ่านการทำงานในกะนี้เรียบร้อย 🎉");
    }
}

// แสดงหน้าจอตอนเกมจบ
function endGame(message) {
    clearInterval(gameInterval);
    document.getElementById('modal-title').textContent = timer > 0 ? "Mission Accomplished!" : "Time out Game Over!";
    document.getElementById('modal-message').innerHTML = `
    <br><br>${message}
    <br><br>Score: ${score}
    <br><br>remaining time: ${timer} sec
    <br><br>Total Score (×${scoreMultiplier}): <strong>${(score+timer)*scoreMultiplier}</strong>
    <br><br><button class="main-btn" onclick="returnToStartScreen()">กลับไปหน้าหลัก</button>`;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

// Overlay แจ้งเตือนต่างๆ
function alertGame(message) {
    clearInterval(gameInterval);
    document.getElementById('modal-message').innerHTML = `${message}<br><br>`;
    document.getElementById('game-over-modal').classList.remove('hidden')
    setTimeout(() => {
        document.getElementById('game-over-modal').classList.add('hidden')
    }, 1000);;
}

// Overlay ของกฎและกติกา
function openRulesModal() {
    document.getElementById('rules-modal').classList.remove('hidden');
}

function closeRulesModal() {
    document.getElementById('rules-modal').classList.add('hidden');
}

// กลับไปที่หน้าเริ่มต้นและรีเซ็ตค่าตัวแปรและข้อมูล
function returnToStartScreen() {
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');

    // --- reset Game State Variables ---
    selectedDifficulty = 'easy';
    score = 0;
    timer = 60;
    scoreMultiplier = 1.0;
    gameInterval = null;

    // reset Insertion & Merge Data
    numItem = 5;
    rackList = [];
    incomingCard = null;
    beltA = [], beltB = [], plateList = [];
}