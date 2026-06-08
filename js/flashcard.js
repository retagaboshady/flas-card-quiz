const masterDecks = {
    frontend: [
        { question: "What does HTML stand for", answer: "HyperText Markup Language"},
        { question: "What does CSS stand for", answer: "Cascading Style Sheets"},
        { question: "What is closure in JAVA SCRIPT", answer: "An inner function that has access to outer function scope even after outer has returned"}
    ],
    general: [
        { question: "What is the capital of France", answer: "Paris"},
        { question: "How many planets are in our solar system", answer: "8"}
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
    document.getElementById('card-form').addEventListener('submit', creatCard);
    document.getElementById('clear-custom-btn').addEventListener('click', resetCustomCards);
    document.getElementById('restart-btn').addEventListener('click', resetSession);
    
}