const masterDecks = {
    frontend: [
        { question: "What does HTML stand for?", answer: "HyperText Markup Language" },
        { question: "What does CSS stand for?", answer: "Cascading Style Sheets" },
        { question: "What is closure in JavaScript?", answer: "An inner function that has access to outer function scope even after outer has returned." }
    ],
    general: [
        { question: "What is the capital of France?", answer: "Paris" },
        { question: "How many planets are in our solar system?", answer: "8" }
    ],
    custom: []
};

let activeDeck = [];
let currentCardIndex = 0;
let userScore = 0;
let runTimer = null;
let timeLeft = 15;
let sessionWrongAnswers = [];

const cardEl = document.getElementById('flashcard');
const questionTxt = document.getElementById('question-text');
const answerTxt = document.getElementById('answer-text');
const scoreTrack = document.getElementById('score-track');
const progressBar = document.getElementById('progress-bar');
const timerEl = document.getElementById('timer');
const deckSelect = document.getElementById('deck-select');
const badgeEl = document.getElementById('deck-badge');

const wrongBtn = document.getElementById('wrong-btn');
const rightBtn = document.getElementById('right-btn');
const nextBtn = document.getElementById('next-btn');

document.addEventListener("DOMContentLoaded", () => {
    initLocalStorage();
    setupStreak();
    bindEvents();
    changeDeck();
});

function bindEvents() {
    cardEl.addEventListener('click', toggleFlip);
    deckSelect.addEventListener('change', changeDeck);
    
    wrongBtn.addEventListener('click', () => recordAnswer(false));
    rightBtn.addEventListener('click', () => recordAnswer(true));
    nextBtn.addEventListener('click', advanceQuiz);
    
    document.getElementById('card-form').addEventListener('submit', createCard);
    document.getElementById('clear-custom-btn').addEventListener('click', resetCustomCards);
    document.getElementById('restart-btn').addEventListener('click', resetSession);
    
    document.addEventListener('keydown', (e) => {
        if(e.code === "Space" && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            toggleFlip();
        }
        if(!wrongBtn.disabled && e.key === "ArrowLeft") recordAnswer(false);
        if(!rightBtn.disabled && e.key === "ArrowRight") recordAnswer(true);
    });
}

function initLocalStorage() {
    const savedCustom = localStorage.getItem('custom_deck');
    if (savedCustom) {
        masterDecks.custom = JSON.parse(savedCustom);
    }
    const highScore = localStorage.getItem('high_score') || 0;
    document.getElementById('high-score').innerText = highScore;
}

function createCard(e) {
    e.preventDefault();
    const q = document.getElementById('new-question').value;
    const a = document.getElementById('new-answer').value;
    
    masterDecks.custom.push({ question: q, answer: a });
    localStorage.setItem('custom_deck', JSON.stringify(masterDecks.custom));
    
    document.getElementById('card-form').reset();
    alert('🎉 Card added to "My Custom Cards" successfully!');
    
    if(deckSelect.value === 'custom') changeDeck();
}

function resetCustomCards() {
    if(confirm("Are you sure you want to clear your custom cards?")) {
        localStorage.removeItem('custom_deck');
        masterDecks.custom = [];
        if(deckSelect.value === 'custom') changeDeck();
    }
}

function setupStreak() {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('last_played_date');
    let streak = parseInt(localStorage.getItem('streak_count')) || 0;

    if (lastPlayed) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastPlayed === yesterday.toDateString()) {
            
        } else if (lastPlayed !== today) {
            streak = 0;
        }
    }
    localStorage.setItem('streak_count', streak);
    document.getElementById('streak-count').innerText = streak;
}

function incrementStreak() {
    const today = new Date().toDateString();
    const lastPlayed = localStorage.getItem('last_played_date');
    let streak = parseInt(localStorage.getItem('streak_count')) || 0;

    if (lastPlayed !== today) {
        streak++;
        localStorage.setItem('streak_count', streak);
        localStorage.setItem('last_played_date', today);
        document.getElementById('streak-count').innerText = streak;
    }
}

function changeDeck() {
    const selected = deckSelect.value;
    badgeEl.innerText = deckSelect.options[deckSelect.selectedIndex].text;
    
    if (selected === 'all') {
        activeDeck = [...masterDecks.frontend, ...masterDecks.general, ...masterDecks.custom];
    } else {
        activeDeck = [...masterDecks[selected]];
    }

    activeDeck.sort(() => Math.random() - 0.5);
    resetSession();
}

function loadCard() {
    clearInterval(runTimer);
    cardEl.classList.remove('flipped');
    
    if(activeDeck.length === 0) {
        questionTxt.innerText = "No cards available in this deck category.";
        answerTxt.innerText = "Add cards using the sidebar dashboard panel.";
        wrongBtn.disabled = true; rightBtn.disabled = true;
        return;
    }

    if(currentCardIndex >= activeDeck.length) {
        endSession();
        return;
    }

    const currentCard = activeDeck[currentCardIndex];
    questionTxt.innerText = currentCard.question;
    answerTxt.innerText = currentCard.answer;

    scoreTrack.innerText = `Card: ${currentCardIndex + 1}/${activeDeck.length}`;
    progressBar.style.width = `${(currentCardIndex / activeDeck.length) * 100}%`;
    
    wrongBtn.disabled = false;
    rightBtn.disabled = false;
    nextBtn.style.display = 'none';

    startTimer();
}

function toggleFlip() {
    cardEl.classList.toggle('flipped');
}

function startTimer() {
    timeLeft = 15;
    timerEl.innerText = timeLeft;
    runTimer = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(runTimer);
            recordAnswer(false);
        }
    }, 1000);
}

function recordAnswer(isCorrect) {
    clearInterval(runTimer);
    wrongBtn.disabled = true;
    rightBtn.disabled = true;
    nextBtn.style.display = 'block';

    if(isCorrect) {
        userScore++;
    } else {
        sessionWrongAnswers.push(activeDeck[currentCardIndex]);
    }

    if(!cardEl.classList.contains('flipped')) {
        cardEl.classList.add('flipped');
    }
}

function advanceQuiz() {
    currentCardIndex++;
    loadCard();
}

function endSession() {
    progressBar.style.width = '100%';
    incrementStreak();
    
    const savedHighScore = parseInt(localStorage.getItem('high_score')) || 0;
    if(userScore > savedHighScore) {
        localStorage.setItem('high_score', userScore);
        document.getElementById('high-score').innerText = userScore;
    }

    document.getElementById('res-score').innerText = `${userScore}/${activeDeck.length}`;
    const pct = activeDeck.length > 0 ? Math.round((userScore / activeDeck.length) * 100) : 0;
    document.getElementById('res-pct').innerText = `${pct}%`;

    const listContainer = document.getElementById('wrong-list');
    const reviewSection = document.getElementById('wrong-review-section');
    listContainer.innerHTML = "";
    
    if(sessionWrongAnswers.length > 0) {
        reviewSection.style.display = "block";
        sessionWrongAnswers.forEach(card => {
            let li = document.createElement('li');
            li.innerHTML = `<strong>Q:</strong> ${card.question} <br> <strong>A:</strong> ${card.answer}`;
            li.style.marginBottom = "10px";
            listContainer.appendChild(li);
        });
    } else {
        reviewSection.style.display = "none";
    }

    document.getElementById('result-modal').style.display = "flex";
}

function resetSession() {
    currentCardIndex = 0;
    userScore = 0;
    sessionWrongAnswers = [];
    document.getElementById('result-modal').style.display = "none";
    loadCard();
}