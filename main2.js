const PROBLEMS = [
    { id: 1, question: "10 + 5 = ?", answer: 15, submitted: false },
    { id: 2, question: "3 * 4 = ?", answer: 12, submitted: false },
    { id: 3, question: "20 / 4 = ?", answer: 5, submitted: false },
    { id: 4, question: "100 - 33 = ?", answer: 67, submitted: false }
];

const TIME_LIMIT = 25.0; // 제한 시간 (초)

let currentTime = TIME_LIMIT;
let timerInterval = null;
let submittedCount = 0;

// =========================
// 2. DOM 요소 연결
// =========================
const assignmentsList = document.getElementById('assignments-list');
const submissionBox = document.getElementById('submission-box');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const resultModal = document.getElementById('result-modal');
const finalScoreDisplay = document.getElementById('final-score');
const gradeDisplay = document.getElementById('grade');
const restartButton = document.getElementById('restart-button');

// =========================
// 3. 게임 로직 함수
// =========================

/**
 * 게임을 시작하거나 재시작할 때 초기화합니다.
 */
function initGame() {
    // 변수 초기화
    currentTime = TIME_LIMIT;
    submittedCount = 0;
    PROBLEMS.forEach(p => p.submitted = false);

    // UI 업데이트
    timerDisplay.textContent = `남은 시간: ${currentTime.toFixed(1)}초`;
    scoreDisplay.textContent = `제출 완료: 0개`;
    resultModal.classList.add('hidden');
    assignmentsList.innerHTML = ''; // 문제 목록 비우기
    
    createAssignmentCards();
    startTimer();
}

/**
 * 문제 카드를 생성하고 드래그 이벤트를 설정합니다.
 */
function createAssignmentCards() {
    PROBLEMS.forEach(problem => {
        const card = document.createElement('div');
        card.classList.add('assignment-card');
        card.setAttribute('data-id', problem.id);
        
        card.innerHTML = `
            <div class="problem">${problem.question}</div>
            <input type="text" class="answer-input" placeholder="정답 입력" data-id="${problem.id}">
        `;
        
        // 정답 입력 시 이벤트 리스너
        const input = card.querySelector('.answer-input');
        input.addEventListener('input', (e) => checkAnswer(e.target, problem, card));

        // 드래그 시작 이벤트 (초기에는 드래그 불가)
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);

        assignmentsList.appendChild(card);
    });
}

/**
 * 정답을 확인하고 카드에 드래그 가능 속성을 부여합니다.
 * @param {HTMLInputElement} inputElement - 현재 입력 요소
 * @param {object} problem - 문제 객체
 * @param {HTMLElement} card - 문제 카드 요소
 */
function checkAnswer(inputElement, problem, card) {
    // 입력된 값을 숫자로 변환 (공백 제거)
    const userAnswer = Number(inputElement.value.trim()); 
    const isCorrect = userAnswer === problem.answer;

    if (isCorrect) {
        // 정답일 경우: 드래그 가능하게 설정
        card.classList.add('draggable');
        card.setAttribute('draggable', true);
    } else {
        // 오답일 경우: 드래그 불가능하게 설정
        card.classList.remove('draggable');
        card.setAttribute('draggable', false);
    }
}


// =========================
// 4. 타이머 로직
// =========================

/**
 * 타이머를 시작합니다.
 */
function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    let startTime = performance.now();
    let elapsed = 0;

    timerInterval = setInterval(() => {
        const now = performance.now();
        elapsed = (now - startTime) / 1000; // 밀리초를 초로 변환
        currentTime = TIME_LIMIT - elapsed;

        if (currentTime <= 0) {
            currentTime = 0;
            clearInterval(timerInterval);
            endGame();
        }

        timerDisplay.textContent = `남은 시간: ${currentTime.toFixed(1)}초`;
    }, 100); // 0.1초마다 업데이트
}

/**
 * 게임을 종료하고 결과를 표시합니다.
 */
function endGame() {
    // 모든 카드 드래그 막기
    document.querySelectorAll('.assignment-card').forEach(card => {
        card.setAttribute('draggable', false);
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragend', handleDragEnd);
    });

    const grade = calculateGrade(submittedCount);
    
    finalScoreDisplay.textContent = `최종 제출 개수: ${submittedCount}개`;
    gradeDisplay.textContent = `최종 성적: ${grade}`;
    resultModal.classList.remove('hidden');
}

/**
 * 제출 개수에 따라 성적을 계산합니다.
 * @param {number} count - 제출된 문제 수
 * @returns {string} 성적 문자열 (F, C, B, A)
 */
function calculateGrade(count) {
    if (count === PROBLEMS.length) {
        return 'A+ (만점!)';
    } else if (count >= 3) {
        return 'A';
    } else if (count >= 2) {
        return 'B';
    } else if (count >= 1) {
        return 'C';
    } else {
        return 'F (재수강..)';
    }
}

// =========================
// 5. 드래그 앤 드롭 로직
// =========================

let draggedItem = null;

function handleDragStart(e) {
    if (e.target.classList.contains('draggable')) {
        draggedItem = e.target;
        // 드래그되는 요소의 ID를 데이터로 저장
        e.dataTransfer.setData('text/plain', draggedItem.dataset.id); 
        setTimeout(() => draggedItem.classList.add('dragging'), 0);
    } else {
        // 드래그 불가능한 요소는 드래그를 막음
        e.preventDefault(); 
    }
}

function handleDragEnd(e) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}

function handleDragOver(e) {
    e.preventDefault(); // 드롭을 허용하기 위해 기본 동작 막기
    submissionBox.classList.add('drag-over');
}

function handleDragLeave() {
    submissionBox.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    submissionBox.classList.remove('drag-over');
    
    // 드래그된 요소의 ID 가져오기
    const assignmentId = e.dataTransfer.getData('text/plain');
    const droppedCard = document.querySelector(`.assignment-card[data-id="${assignmentId}"]`);
    
    if (droppedCard) {
        const problem = PROBLEMS.find(p => p.id === Number(assignmentId));

        if (!problem.submitted) {
            // 제출 처리
            problem.submitted = true;
            submittedCount++;
            
            // UI 변경: 제출된 카드는 목록에서 제거 또는 스타일 변경
            droppedCard.style.backgroundColor = '#ddd';
            droppedCard.innerHTML = `제출 완료! (${problem.question})`;
            droppedCard.classList.remove('draggable');
            droppedCard.setAttribute('draggable', false);
            droppedCard.style.opacity = 0.6; 
            
            scoreDisplay.textContent = `제출 완료: ${submittedCount}개`;

            // 모든 문제 제출 완료 시 게임 종료
            if (submittedCount === PROBLEMS.length) {
                clearInterval(timerInterval);
                endGame();
            }
        }
    }
}

// =========================
// 6. 이벤트 리스너 등록 및 초기화
// =========================

// 제출 영역에 드롭 이벤트 리스너 등록
submissionBox.addEventListener('dragover', handleDragOver);
submissionBox.addEventListener('dragleave', handleDragLeave);
submissionBox.addEventListener('drop', handleDrop);

// 다시 시작 버튼
restartButton.addEventListener('click', initGame);

// 게임 초기화로 시작
document.addEventListener('DOMContentLoaded', initGame);