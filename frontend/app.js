// Configure backend base URL
const API_BASE = 'http://localhost:5000/api';

// Theme management
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.querySelector('.theme-label');
const body = document.body;

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);
    updateThemeLabel(savedTheme);
}

// Update theme label
function updateThemeLabel(theme) {
    themeLabel.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
}

// Toggle theme
function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeLabel(newTheme);
    
    // Add a nice animation effect
    body.style.transition = 'all 0.5s ease';
    setTimeout(() => {
        body.style.transition = '';
    }, 500);
}

// Event listeners
themeToggle.addEventListener('click', toggleTheme);

// Initialize theme on page load
initializeTheme();

// Question configurations with icons and display text
const questionData = [
    {
        key: 'mood',
        icon: 'fas fa-smile',
        text: 'How are you feeling?',
        options: ['Happy', 'Sad', 'Anxious', 'Calm', 'Excited', 'Angry']
    },
    {
        key: 'energy',
        icon: 'fas fa-battery-three-quarters',
        text: 'Energy Level?',
        options: ['High Energy', 'Medium Energy', 'Low Energy', 'Exhausted']
    },
    {
        key: 'stress',
        icon: 'fas fa-heartbeat',
        text: 'Stress Level?',
        options: ['No Stress', 'Mild Stress', 'Moderate Stress', 'High Stress']
    },
    {
        key: 'productivity',
        icon: 'fas fa-chart-line',
        text: 'Productivity Today?',
        options: ['Very Productive', 'Productive', 'Average', 'Unproductive']
    },
    {
        key: 'sleep',
        icon: 'fas fa-bed',
        text: 'How was your sleep?',
        options: ['Excellent Sleep', 'Good Sleep', 'Poor Sleep', 'No Sleep']
    },
    {
        key: 'social',
        icon: 'fas fa-users',
        text: 'Social Interaction?',
        options: ['Very Social', 'Somewhat Social', 'Alone by Choice', 'Lonely']
    },
    {
        key: 'health',
        icon: 'fas fa-heart',
        text: 'Physical Health?',
        options: ['Excellent', 'Good', 'Fair', 'Poor']
    },
    {
        key: 'motivation',
        icon: 'fas fa-fire',
        text: 'Motivation Level?',
        options: ['Highly Motivated', 'Motivated', 'Neutral', 'Unmotivated']
    },
    {
        key: 'focus',
        icon: 'fas fa-bullseye',
        text: 'Focus Today?',
        options: ['Very Focused', 'Focused', 'Distracted', 'Unfocused']
    },
    {
        key: 'overall',
        icon: 'fas fa-star',
        text: 'Overall Day Rating?',
        options: ['Amazing Day', 'Good Day', 'Okay Day', 'Bad Day']
    }
];

// State management
let currentQuestionIndex = 0;
let userResponses = {};

// DOM elements
const questionContainer = document.getElementById('currentQuestionGroup');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressFill = document.getElementById('progressFill');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const formCard = document.getElementById('questionContainer');
const resultsPage = document.getElementById('resultsPage');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    totalQuestionsSpan.textContent = questionData.length;
    showQuestion(currentQuestionIndex);
    
    nextBtn.addEventListener('click', handleNext);
    submitBtn.addEventListener('click', handleSubmit);
});

function showQuestion(index) {
    const question = questionData[index];
    
    // Update progress
    const progress = ((index + 1) / questionData.length) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionSpan.textContent = index + 1;
    
    // Create question HTML
    questionContainer.innerHTML = `
        <label class="question">
            <i class="${question.icon}"></i>
            ${question.text}
        </label>
        <div class="options" id="currentOptions">
            ${question.options.map(option => `
                <button type="button" class="option-btn" data-value="${option}">
                    ${option}
                </button>
            `).join('')}
        </div>
    `;
    
    // Add click handlers to options
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => handleOptionSelect(btn, question.key));
    });
    
    // Animate question appearance
    questionContainer.style.animation = 'slideInLeft 0.6s ease-out';
    
    // Hide/show navigation buttons
    nextBtn.classList.add('hidden');
    submitBtn.classList.add('hidden');
    
    // If this question was already answered, pre-select it
    if (userResponses[question.key]) {
        setTimeout(() => {
            const selectedBtn = Array.from(optionButtons).find(btn => 
                btn.dataset.value === userResponses[question.key]
            );
            if (selectedBtn) {
                selectedBtn.click();
            }
        }, 100);
    }
}

function handleOptionSelect(selectedBtn, questionKey) {
    // Store the response
    userResponses[questionKey] = selectedBtn.dataset.value;
    
    // Update button states
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedBtn.classList.add('selected');
    
    // Add selection animation
    selectedBtn.style.transform = 'scale(1.05)';
    setTimeout(() => {
        selectedBtn.style.transform = '';
    }, 200);
    
    // Show appropriate navigation button
    setTimeout(() => {
        if (currentQuestionIndex < questionData.length - 1) {
            nextBtn.classList.remove('hidden');
            nextBtn.style.animation = 'fadeInUp 0.5s ease-out';
        } else {
            submitBtn.classList.remove('hidden');
            submitBtn.style.animation = 'fadeInUp 0.5s ease-out';
        }
    }, 300);
}

function handleNext() {
    if (currentQuestionIndex < questionData.length - 1) {
        currentQuestionIndex++;
        showQuestion(currentQuestionIndex);
    }
}

async function handleSubmit() {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    
    try {
        console.log('Submitting responses:', userResponses);
        
        // Submit to backend
        const response = await fetch(API_BASE + '/responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userResponses)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('Response data:', responseData);
        
        // Get similarity data
        const summaryUrl = new URL(API_BASE + '/summary');
        Object.keys(userResponses).forEach(key => {
            summaryUrl.searchParams.set(key, userResponses[key]);
        });
        
        console.log('Fetching summary from:', summaryUrl.toString());
        
        const summaryResponse = await fetch(summaryUrl);
        if (!summaryResponse.ok) {
            throw new Error(`Summary fetch failed: ${summaryResponse.status}`);
        }
        
        const summaryData = await summaryResponse.json();
        console.log('Summary data:', summaryData);
        
        // Show results
        showResults(summaryData);
        
    } catch (error) {
        console.error('Submit error:', error);
        let errorMessage = 'Failed to submit. Please try again.';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else if (error.message.includes('Server error')) {
            errorMessage = error.message;
        }
        
        showNotification(errorMessage, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit & See Results';
    }
}

function showResults(data) {
    // Hide form and show results
    formCard.style.animation = 'fadeOutUp 0.5s ease-out';
    
    setTimeout(() => {
        formCard.style.display = 'none';
        resultsPage.classList.remove('hidden');
        
        // Animate the percentage circle
        const percentage = data.overallSimilarity || 0;
        const circle = document.getElementById('similarityCircle');
        const percentageDisplay = document.getElementById('percentageDisplay');
        
        // Set the circle fill
        const degrees = (percentage / 100) * 360;
        circle.style.setProperty('--percentage', `${degrees}deg`);
        
        // Animate the percentage counter
        let currentPercentage = 0;
        const animatePercentage = () => {
            if (currentPercentage < percentage) {
                currentPercentage += 1;
                percentageDisplay.textContent = `${currentPercentage}%`;
                setTimeout(animatePercentage, 30);
            }
        };
        
        setTimeout(animatePercentage, 500);
        
        // Show personalized message
        const messageContainer = document.getElementById('resultsMessage');
        const message = generatePersonalizedMessage(data, userResponses);
        messageContainer.innerHTML = message;
        
        // Show statistics
        const statsContainer = document.getElementById('resultsStats');
        statsContainer.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${data.exactMatches || 0}</span>
                <span class="stat-label">Exact Matches</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${data.partialMatches || 0}</span>
                <span class="stat-label">Similar Matches</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${data.total || 0}</span>
                <span class="stat-label">Total Responses</span>
            </div>
        `;
        
    }, 500);
}

function generatePersonalizedMessage(data, responses) {
    const exactMatches = data.exactMatches || 0;
    const partialMatches = data.partialMatches || 0;
    const total = data.total || 0;
    
    let title = "";
    let message = "";
    
    if (exactMatches > 0) {
        title = "🎯 Perfect Match Found!";
        message = `Amazing! ${exactMatches} ${exactMatches === 1 ? 'person feels' : 'people feel'} exactly the same way as you across all 10 dimensions. You're definitely not alone in how you're experiencing today.`;
    } else if (partialMatches > 0) {
        title = "🤝 Great Similarity!";
        message = `You have ${partialMatches} ${partialMatches === 1 ? 'person who shares' : 'people who share'} most of your feelings today. While not identical, you're in very similar emotional territory.`;
    } else if (total > 0) {
        title = "⭐ You're Unique!";
        message = "Your combination of feelings today is completely unique! Sometimes being different is exactly what makes you special. Your perspective adds valuable diversity to our community.";
    } else {
        title = "🌟 First to Share!";
        message = "You're the very first person to share your feelings today! Your courage to be vulnerable paves the way for others to connect and share their experiences.";
    }
    
    // Add mood-specific insight
    const moodInsight = getMoodInsight(responses.mood, responses.overall);
    
    return `
        <h3>${title}</h3>
        <p>${message}</p>
        <p style="margin-top: 1rem; font-style: italic; color: var(--text-secondary);">${moodInsight}</p>
    `;
}

function getMoodInsight(mood, overall) {
    const insights = {
        'Happy': "Your positive energy is contagious! Keep spreading those good vibes.",
        'Sad': "It's okay to feel sad sometimes. Tomorrow is a new opportunity for joy.",
        'Anxious': "Take deep breaths. You're stronger than your worries.",
        'Calm': "Your inner peace is a superpower in today's busy world.",
        'Excited': "Your enthusiasm lights up the room! Channel that energy wisely.",
        'Angry': "Strong emotions show you care deeply. Find healthy ways to express them."
    };
    
    return insights[mood] || "Every feeling is valid and part of the human experience.";
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOutUp 0.5s ease-out';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}