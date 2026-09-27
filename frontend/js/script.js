// =========================
// API URL
// =========================

const API_URL = "http://127.0.0.1:5000";


// =========================
// PAGE LOAD
// =========================

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // REGISTER
    // =========================

    const registerForm =
        document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const name =
                document.getElementById("name").value;

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("registerMessage");

            try {

                const response =
                    await fetch(`${API_URL}/api/register`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            password: password
                        })
                    });

                const data =
                    await response.json();

                message.textContent =
                    data.message;

                if (response.ok) {

                    registerForm.reset();

                    setTimeout(() => {
                        window.location.href =
                            "login.html";
                    }, 1000);
                }

            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                console.error(error);
            }
        });
    }


    // =========================
    // LOGIN
    // =========================

    const loginForm =
        document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            const message =
                document.getElementById("loginMessage");

            try {

                const response =
                    await fetch(`${API_URL}/api/login`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    });

                const data =
                    await response.json();

                message.textContent =
                    data.message;

                if (response.ok) {

                    localStorage.setItem(
                        "speaknextUser",
                        JSON.stringify(data.user)
                    );

                    setTimeout(() => {
                        window.location.href =
                            "../index.html";
                    }, 1000);
                }

            } catch (error) {

                message.textContent =
                    "Unable to connect to server.";

                console.error(error);
            }
        });
    }


    // =========================
    // DAILY PRACTICE
    // =========================

    const startPracticeBtn =
        document.getElementById("startPracticeBtn");

    const stopPracticeBtn =
        document.getElementById("stopPracticeBtn");

    const recordingStatus =
        document.getElementById("recordingStatus");

    let mediaRecorder;
    let audioChunks = [];

    if (startPracticeBtn && stopPracticeBtn) {

        startPracticeBtn.addEventListener("click", async () => {

            try {

                const stream =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });

                mediaRecorder =
                    new MediaRecorder(stream);

                audioChunks = [];

                mediaRecorder.ondataavailable =
                    (event) => {
                        audioChunks.push(event.data);
                    };

                mediaRecorder.onstop =
                    async () => {

                        const audioBlob =
                            new Blob(audioChunks, {
                                type: "audio/webm"
                            });

                        const audioUrl =
                            URL.createObjectURL(audioBlob);

                        const audio =
                            document.createElement("audio");

                        audio.controls = true;
                        audio.src = audioUrl;

                        recordingStatus.innerHTML =
                            "✅ Recording completed!";

                        recordingStatus.appendChild(audio);

                        const userData =
                            localStorage.getItem("speaknextUser");

                        if (userData) {

                            const user =
                                JSON.parse(userData);

                            try {

                                const response =
                                    await fetch(
                                        `${API_URL}/api/progress`,
                                        {
                                            method: "POST",
                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },
                                            body: JSON.stringify({
                                                user_id: user.id,
                                                activity:
                                                    "Daily English Practice",
                                                score: 0
                                            })
                                        }
                                    );

                                const data =
                                    await response.json();

                                console.log(
                                    "Daily Progress:",
                                    data
                                );

                            } catch (error) {

                                console.error(
                                    "Progress save error:",
                                    error
                                );
                            }

                        }

                        stream
                            .getTracks()
                            .forEach(track => track.stop());
                    };

                mediaRecorder.start();

                startPracticeBtn.disabled = true;
                stopPracticeBtn.disabled = false;

                recordingStatus.textContent =
                    "🔴 Recording... Speak now!";

            } catch (error) {

                recordingStatus.textContent =
                    "Microphone permission is required.";

                console.error(error);
            }
        });


        stopPracticeBtn.addEventListener("click", () => {

            if (
                mediaRecorder &&
                mediaRecorder.state !== "inactive"
            ) {

                mediaRecorder.stop();

                startPracticeBtn.disabled = false;
                stopPracticeBtn.disabled = true;
            }
        });
    }


    // =========================
    // DASHBOARD PROGRESS
    // =========================

    const activityCount =
        document.getElementById("activityCount");

    if (activityCount) {

        const userData =
            localStorage.getItem("speaknextUser");

        if (userData) {

            const user =
                JSON.parse(userData);

            fetch(`${API_URL}/api/progress/${user.id}`)
                .then(response => response.json())
                .then(data => {

                    if (data.status === "success") {

                        activityCount.textContent =
                            data.completed_activities;
                    }

                })
                .catch(error => {

                    console.error(
                        "Progress fetch error:",
                        error
                    );

                    activityCount.textContent = "0";
                });

        } else {

            activityCount.textContent = "0";
        }
    }

});


// =========================
// ENGLISH LEARNING
// =========================

function showWord() {

    const words = [

        {
            word: "Confident",
            meaning:
                "Feeling sure about your abilities.",
            example:
                "She answered the interview questions confidently."
        },

        {
            word: "Adaptable",
            meaning:
                "Able to adjust to new situations.",
            example:
                "An adaptable employee can learn new technologies quickly."
        },

        {
            word: "Articulate",
            meaning:
                "Able to express ideas clearly.",
            example:
                "He was articulate during the presentation."
        }

    ];

    const randomWord =
        words[Math.floor(Math.random() * words.length)];

    const wordTitle =
        document.getElementById("wordTitle");

    if (!wordTitle) return;

    wordTitle.textContent =
        randomWord.word;

    const card =
        wordTitle.parentElement;

    const paragraphs =
        card.querySelectorAll("p");

    if (paragraphs.length >= 2) {

        paragraphs[0].innerHTML =
            "<strong>Meaning:</strong> " +
            randomWord.meaning;

        paragraphs[1].innerHTML =
            "<strong>Example:</strong> " +
            randomWord.example;
    }
}


function checkAnswer(answer) {

    const result =
        document.getElementById("grammarResult");

    if (!result) return;

    if (answer === "goes") {

        result.textContent =
            "✅ Correct! Great job.";

    } else {

        result.textContent =
            "❌ Not quite. The correct answer is 'Goes'.";
    }
}


function showTip() {

    const tip =
        document.getElementById("communicationTip");

    if (!tip) return;

    tip.textContent =
        "🎤 Practice speaking for 60 seconds about your day, your college or your career goal.";
}


// =========================
// HR PREPARATION
// =========================

const hrQuestions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "What are your weaknesses?",
    "Why should we hire you?",
    "Where do you see yourself in five years?"
];

let currentHRQuestion = 0;


async function checkHRAnswer() {

    const answer =
        document.getElementById("hrAnswer");

    const feedback =
        document.getElementById("hrFeedback");

    if (!answer || !feedback) return;

    const text =
        answer.value.trim();

    if (text.length === 0) {

        feedback.textContent =
            "⚠️ Please type your answer first.";

        return;
    }

    if (text.length < 30) {

        feedback.textContent =
            "💡 Try adding a little more detail to your answer.";

        return;
    }

    feedback.textContent =
        "✅ Good attempt! Saving HR progress...";

    const userData =
        localStorage.getItem("speaknextUser");

    if (!userData) {

        feedback.textContent =
            "Please login to save your progress.";

        return;
    }

    const user =
        JSON.parse(userData);

    try {

        const response =
            await fetch(`${API_URL}/api/progress`, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    user_id: user.id,
                    activity:
                        "HR Interview Practice",
                    score: 1
                })
            });

        const data =
            await response.json();

        if (
            response.ok &&
            data.status === "success"
        ) {

            feedback.textContent =
                "🎉 HR progress saved successfully!";

        } else {

            feedback.textContent =
                "Good answer, but progress could not be saved.";
        }

    } catch (error) {

        console.error(
            "HR progress error:",
            error
        );

        feedback.textContent =
            "Good answer, but progress could not be saved.";
    }
}


function nextHRQuestion() {

    const question =
        document.getElementById("hrQuestion");

    const answer =
        document.getElementById("hrAnswer");

    const feedback =
        document.getElementById("hrFeedback");

    if (!question || !answer) return;

    currentHRQuestion++;

    if (
        currentHRQuestion >=
        hrQuestions.length
    ) {

        currentHRQuestion = 0;
    }

    question.textContent =
        hrQuestions[currentHRQuestion];

    answer.value = "";

    if (feedback) {
        feedback.textContent = "";
    }
}


// =========================
// TECHNICAL PREPARATION
// =========================

const technicalQuestions = [
    "What is HTML?",
    "What is CSS?",
    "What is JavaScript?",
    "What is Python?",
    "What is SQL?",
    "What is a database?"
];

let currentTechnicalQuestion = 0;


async function checkTechnicalAnswer() {

    const answer =
        document.getElementById("technicalAnswer");

    const feedback =
        document.getElementById("technicalFeedback");

    if (!answer || !feedback) return;

    const text =
        answer.value.trim();

    if (text.length === 0) {

        feedback.textContent =
            "⚠️ Please type your answer first.";

        return;
    }

    if (text.length < 30) {

        feedback.textContent =
            "💡 Try adding more details to your answer.";

        return;
    }

    feedback.textContent =
        "✅ Good attempt! Saving technical progress...";

    const userData =
        localStorage.getItem("speaknextUser");

    if (!userData) {

        feedback.textContent =
            "Please login to save your progress.";

        return;
    }

    const user =
        JSON.parse(userData);

    try {

        const response =
            await fetch(`${API_URL}/api/progress`, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    user_id: user.id,
                    activity:
                        "Technical Practice",
                    score: 1
                })
            });

        const data =
            await response.json();

        if (
            response.ok &&
            data.status === "success"
        ) {

            feedback.textContent =
                "🎉 Technical progress saved successfully!";

        } else {

            feedback.textContent =
                "Good answer, but progress could not be saved.";
        }

    } catch (error) {

        console.error(
            "Technical progress error:",
            error
        );

        feedback.textContent =
            "Good answer, but progress could not be saved.";
    }
}


function nextTechnicalQuestion() {

    const question =
        document.getElementById("technicalQuestion");

    const answer =
        document.getElementById("technicalAnswer");

    const feedback =
        document.getElementById("technicalFeedback");

    if (!question || !answer) return;

    currentTechnicalQuestion++;

    if (
        currentTechnicalQuestion >=
        technicalQuestions.length
    ) {

        currentTechnicalQuestion = 0;
    }

    question.textContent =
        technicalQuestions[
            currentTechnicalQuestion
        ];

    answer.value = "";

    if (feedback) {
        feedback.textContent = "";
    }
}


// =========================
// MOCK INTERVIEW
// =========================

const mockQuestions = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your strengths?",
    "What is your biggest weakness?",
    "Where do you see yourself in five years?"
];

let currentMockQuestion = 0;


async function checkMockAnswer() {

    const answer =
        document.getElementById("mockAnswer");

    const feedback =
        document.getElementById("mockFeedback");

    if (!answer || !feedback) return;

    const text =
        answer.value.trim();

    if (text.length === 0) {

        feedback.textContent =
            "⚠️ Please type your answer first.";

        return;
    }

    if (text.length < 40) {

        feedback.textContent =
            "💡 Try giving a little more detail in your answer.";

        return;
    }

    feedback.textContent =
        "✅ Good attempt! Saving Mock Interview progress...";

    const userData =
        localStorage.getItem("speaknextUser");

    if (!userData) {

        feedback.textContent =
            "Please login to save your progress.";

        return;
    }

    const user =
        JSON.parse(userData);

    try {

        const response =
            await fetch(`${API_URL}/api/progress`, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    user_id: user.id,
                    activity:
                        "Mock Interview",
                    score: 1
                })
            });

        const data =
            await response.json();

        if (
            response.ok &&
            data.status === "success"
        ) {

            feedback.textContent =
                "🎉 Mock Interview progress saved successfully!";

        } else {

            feedback.textContent =
                "Good answer, but progress could not be saved.";
        }

    } catch (error) {

        console.error(
            "Mock progress error:",
            error
        );

        feedback.textContent =
            "Good answer, but progress could not be saved.";
    }
}


function nextMockQuestion() {

    const question =
        document.getElementById("mockQuestion");

    const answer =
        document.getElementById("mockAnswer");

    const feedback =
        document.getElementById("mockFeedback");

    if (!question || !answer) return;

    currentMockQuestion++;

    if (
        currentMockQuestion >=
        mockQuestions.length
    ) {

        currentMockQuestion = 0;
    }

    question.textContent =
        mockQuestions[currentMockQuestion];

    answer.value = "";

    if (feedback) {
        feedback.textContent = "";
    }
}


// =========================
// AI CHAT
// =========================

async function sendChatMessage() {

    const input =
        document.getElementById("chatInput");

    const messages =
        document.getElementById("chatMessages");

    if (!input || !messages) return;

    const userText =
        input.value.trim();

    if (userText === "") return;


    // USER MESSAGE

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";

    userMessage.innerHTML =
        "<strong>You:</strong> " +
        userText;

    messages.appendChild(
        userMessage
    );

    input.value = "";


    // BOT MESSAGE

    const botMessage =
        document.createElement("div");

    botMessage.className =
        "bot-message";

    botMessage.innerHTML =
        "<strong>SpeakNext AI:</strong> Thinking...";

    messages.appendChild(
        botMessage
    );

    messages.scrollTop =
        messages.scrollHeight;


    try {

        const response =
            await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    message: userText
                })
            });

        const data =
            await response.json();

        if (
            response.ok &&
            data.status === "success"
        ) {

            botMessage.innerHTML =
                "<strong>SpeakNext AI:</strong> " +
                data.response;

        } else {

            botMessage.innerHTML =
                "<strong>SpeakNext AI:</strong> " +
                "Sorry, something went wrong.";
        }

    } catch (error) {

        botMessage.innerHTML =
            "<strong>SpeakNext AI:</strong> " +
            "Unable to connect to SpeakNext AI server.";

        console.error(
            "AI Chat Error:",
            error
        );
    }

    messages.scrollTop =
        messages.scrollHeight;
}