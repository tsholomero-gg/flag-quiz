const flagEl = document.getElementById('flag');
const optionsEl = document.getElementById('options');
const nextBtn = document.getElementById('next');
const restartBtn = document.getElementById('restart');
const scoreEl = document.getElementById('score');
const askedEl = document.getElementById('asked');
const messageEl = document.getElementById('message');
const totalEl = document.getElementById('total');
const qNumEl = document.getElementById('question-number');

let countries = [];
let correctCountry = null;
let score = 0;
let currentQuestion = 0;
const totalQuestions = 10;
totalEl.textContent = totalQuestions;

// Load countries from REST countries API
async function loadCountries() {
    try{
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
        const data = await res.json();

        // Filter out any bad entries
        countries = data.filter(c => c && c.flags && (c.flags.svg || c.flags.png) && c.name && c.name.common);
    }catch(err){
        console.error("Error fetching countries:", err);
        messageEl.textContent = 'Failed to load country data';
    }
}

function shuffle(arr){
    for(let i=arr.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickRandomCountries(n, excludeName){
    const pool = countries.filter(c => c.name.common !== excludeName);
    const picked = [];
    while(picked.length < n && pool.length){
        const idx = Math.floor(Math.random()*pool.length);
        picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
}

function renderQuestion(){
    // End if we've shown all questions
    if(currentQuestion >= totalQuestions){
        endGame();
        return;
    }

    qNumEl.textContent = `Question ${currentQuestion + 1} of ${totalQuestions}`;

    // Prepare UI
    nextBtn.disabled = true;
    messageEl.textContent = '';
    optionsEl.innerHTML = '';

    // Choose correct country
    const idx = Math.floor(Math.random()*countries.length);
    correctCountry = countries[idx];

    // Create options: 3 wrong + 1 correct
    const others = pickRandomCountries(3, correctCountry.name.common);
    const options = [...others, correctCountry];
    shuffle(options);

    // Show flag
    flagEl.src = correctCountry.flags.svg || correctCountry.flags.png;
    flagEl.alt = `Flag of ${correctCountry.name.common}`;

    // Render options buttons
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.textContent = opt.name.common;
        btn.dataset.name = opt.name.common;
        btn.addEventListener('click', onSelect);
        optionsEl.appendChild(btn);
    });

    // Update Counters
    currentQuestion++;
    askedEl.textContent = currentQuestion;
}

function onSelect(e) {
    const selectedBtn = e.currentTarget;
    const chosenName = selectedBtn.dataset.name;

    // Disable all options
    const optionButtons = [...optionsEl.querySelectorAll('button.option')];
    optionButtons.forEach(b => b.disabled = true);

    if(chosenName === correctCountry.name.common){
        selectedBtn.classList.add('correct');
        score++;
        messageEl.textContent = 'Correct! 🎉';
    }else{
        selectedBtn.classList.add('wrong');
        messageEl.textContent = `Wrong — correct answer: ${correctCountry.name.common}`;
        const correctBtn = optionButtons.find(b => b.dataset.name === correctCountry.name.common);
        if(correctBtn) correctBtn.classList.add('correct');
    }
    scoreEl.textContent = score;
    nextBtn.disabled = false;
}

function nextQuestion(){
    // If we've reached the total, show results
    if(currentQuestion >= totalQuestions){
        endGame();
        return;
    }
    renderQuestion();
}

function endGame(){
    messageEl.textContent = `Game over — your score: ${score} / ${totalQuestions}`;
    nextBtn.disabled = true;
    restartBtn.hidden = false;
}

function restartGame(){
    score = 0;
    currentQuestion = 0;
    scoreEl.textContent = 0;
    restartBtn.hidden = true;
    renderQuestion();
}

nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartGame);

// Initialize
(async function init(){
    await loadCountries();
    if(countries.length){
        renderQuestion();
    }else{
        messageEl.textContent = 'No country data available.';
    }
})();