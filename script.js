// Global variables for quiz state
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let skippedAnswers = 0;
let timer;
let timeLeft = 30;
let username = "";
let questions = [];
let myPieChart = null;

// Show Results Function
function showResults() {
    clearInterval(timer); // Clear any existing timer
    document.getElementById("quiz-box").style.display = "none";
    document.getElementById("result-box").style.display = "block";
    
    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById("score-text").innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>Name: ${username}</p>
        <p>Score: ${score} out of ${questions.length} (${percentage}%)</p>
        <div class="result-details">
            <p>✅ Correct Answers: ${correctAnswers}</p>
            <p>❌ Incorrect Answers: ${incorrectAnswers}</p>
            <p>⏭️ Skipped Questions: ${skippedAnswers}</p>
        </div>
    `;

    createPieChart();
    saveScore();
}

// Create Pie Chart Function
function createPieChart() {
    const ctx = document.getElementById("pieChart");
    if (!ctx) {
        console.error("Canvas element not found");
        return;
    }

    // Destroy existing chart if it exists
    if (myPieChart) {
        myPieChart.destroy();
    }

    try {
        myPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Correct', 'Incorrect', 'Skipped'],
                datasets: [{
                    data: [correctAnswers, incorrectAnswers, skippedAnswers],
                    backgroundColor: ['#4CAF50', '#FF5733', '#FFD700']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating chart:", error);
    }
}

// Restart Quiz Function
function restartQuiz() {
    // Reset all quiz states
    resetQuiz();
    
    // Hide result box and show welcome container
    document.getElementById("result-box").style.display = "none";
    document.getElementById("welcome-container").style.display = "block";
    
    // Clear previous answers and reset form
    document.getElementById("options-form").innerHTML = "";
    document.getElementById("question").textContent = "";
    
    // Keep the username
    document.getElementById("username").value = username;
    
    // Destroy existing chart
    if (myPieChart) {
        myPieChart.destroy();
        myPieChart = null;
    }
}

// Make sure to add the event listener for the restart button
document.addEventListener('DOMContentLoaded', function() {
    // Add existing initialization code here
    
    // Add restart button event listener
    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn) {
        restartBtn.addEventListener("click", restartQuiz);
    }
});

// Initialize application
document.addEventListener('DOMContentLoaded', async () => {
    await loadQuestions();
    displayScores();
});

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch("questions.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        questions = await response.json();
        
        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid questions format");
        }
    } catch (error) {
        console.error("Error loading questions:", error);
        questions = sampleQuestions; // Use sample questions if loading fails
    }
}

// Event Listeners
document.getElementById("start-quiz-btn").addEventListener("click", startQuiz);
document.getElementById("submit-btn").addEventListener("click", submitAnswer);
document.getElementById("restart-btn").addEventListener("click", restartQuiz);

// Start Quiz Function
function startQuiz() {
    username = document.getElementById("username").value.trim();
    if (username === "") {
        alert("Please enter your name!");
        return;
    }

    document.getElementById("welcome-container").style.display = "none";
    document.getElementById("quiz-box").style.display = "block";
    document.getElementById("result-box").style.display = "none";
    resetQuiz();
    showQuestion();
}

// Reset Quiz State
function resetQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    skippedAnswers = 0;
    clearInterval(timer);
}

// Show Current Question
function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showResults();
        return;
    }

    const questionData = questions[currentQuestionIndex];
    document.getElementById("question").textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}: ${questionData.question}`;

    const optionsForm = document.getElementById("options-form");
    optionsForm.innerHTML = "";

    questionData.options.forEach((option, index) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "option";
        radio.value = option;
        radio.id = `option${index}`;
        label.htmlFor = `option${index}`;
        
        label.appendChild(radio);
        label.appendChild(document.createTextNode(` ${option}`));
        optionsForm.appendChild(label);
    });

    document.getElementById("submit-btn").disabled = false;
    resetTimer();
}

// Timer Functions
function resetTimer() {
    clearInterval(timer);
    timeLeft = 30;
    updateTimerDisplay();

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft === 0) {
            handleTimeUp();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    timerElement.textContent = timeLeft;
    timerElement.style.color = timeLeft <= 5 ? "red" : "black";
}

function handleTimeUp() {
    clearInterval(timer);
    skippedAnswers++;
    document.getElementById("submit-btn").disabled = true;
    
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1000);
}

// Submit Answer Function
function submitAnswer() {
    const selectedOption = document.querySelector("input[name='option']:checked");
    
    if (!selectedOption) {
        alert("Please select an answer!");
        return;
    }

    clearInterval(timer);
    
    if (selectedOption.value === questions[currentQuestionIndex].answer) {
        score++;
        correctAnswers++;
    } else {
        incorrectAnswers++;
    }

    currentQuestionIndex++;
    showQuestion();
}

// Show Results Function
function showResults() {
    document.getElementById("quiz-box").style.display = "none";
    document.getElementById("result-box").style.display = "block";
    
    const percentage = Math.round((score / questions.length) * 100);
    document.getElementById("score-text").innerHTML = `
        <h2>Quiz Complete!</h2>
        <p>Name: ${username}</p>
        <p>Score: ${score} out of ${questions.length} (${percentage}%)</p>
        <div class="result-details">
            <p>✅ Correct Answers: ${correctAnswers}</p>
            <p>❌ Incorrect Answers: ${incorrectAnswers}</p>
            <p>⏭️ Skipped Questions: ${skippedAnswers}</p>
        </div>
    `;

    // Wait for a brief moment to ensure the canvas is ready
    setTimeout(() => {
        createPieChart();
        saveScore();
    }, 100);
}

// Create Pie Chart Function
function createPieChart() {
    const ctx = document.getElementById("pieChart");
    if (!ctx) return;  // Guard clause if canvas doesn't exist

    if (myPieChart) {
        myPieChart.destroy();
    }

    myPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Correct', 'Incorrect', 'Skipped'],
            datasets: [{
                data: [correctAnswers, incorrectAnswers, skippedAnswers],
                backgroundColor: ['#4CAF50', '#FF5733', '#FFD700'],
                borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                }
            }
        }
    });
}

// Save Score Function
function saveScore() {
    try {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
        const percentage = Math.round((score / questions.length) * 100) || 0;
        
        const scoreData = {
            name: username || 'Anonymous',
            score: score || 0,
            total: questions.length || 0,
            percentage: percentage,
            date: new Date().toLocaleDateString(),
            correctAnswers: correctAnswers || 0,
            incorrectAnswers: incorrectAnswers || 0,
            skippedAnswers: skippedAnswers || 0
        };
        
        scores.push(scoreData);
        scores.sort((a, b) => b.percentage - a.percentage);
        scores = scores.slice(0, 10);
        
        localStorage.setItem("scores", JSON.stringify(scores));
        displayScores();
    } catch (error) {
        console.error("Error saving score:", error);
    }
}

// Restart Quiz Function
function restartQuiz() {
    document.getElementById("result-box").style.display = "none";
    document.getElementById("welcome-container").style.display = "block";
    document.getElementById("username").value = username;
    resetQuiz();
    displayScores();
}

// Display Previous Scores Function
function displayScores() {
    try {
        const scores = JSON.parse(localStorage.getItem("scores")) || [];
        const scoreList = document.getElementById("score-list");
        
        if (scores.length === 0) {
            scoreList.innerHTML = "<li>No scores yet</li>";
            return;
        }

        scoreList.innerHTML = scores
            .map(entry => `
                <li class="score-entry">
                    <div class="score-main">
                        <strong>${entry.name || 'Anonymous'}</strong>: 
                        ${entry.score || 0}/${entry.total || 0} 
                        (${entry.percentage || 0}%)
                    </div>
                    <div class="score-details">
                        ✅ ${entry.correctAnswers || 0} correct 
                        ❌ ${entry.incorrectAnswers || 0} incorrect 
                        ⏭️ ${entry.skippedAnswers || 0} skipped
                    </div>
                    <div class="score-date">${entry.date || 'Unknown date'}</div>
                </li>
            `)
            .join("");
    } catch (error) {
        console.error("Error displaying scores:", error);
        document.getElementById("score-list").innerHTML = "<li>Error loading previous scores</li>";
    }
}