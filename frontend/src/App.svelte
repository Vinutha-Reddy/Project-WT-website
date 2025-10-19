<script>
  import { onMount, onDestroy } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  import questions from './questionData.js';

  const API_BASE = 'http://localhost:5000/api';

  let theme = 'dark';
  let currentIndex = 0;
  let responses = {};
  let showResults = false;
  let loading = false;
  let results = null;
  let notification = null;
  let notificationType = 'info';
  let notificationTimeout;

  const similarityStore = tweened(0, { duration: 800, easing: cubicOut });

  onMount(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null;
    setTheme(saved || 'dark');
  });

  onDestroy(() => {
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }
  });

  function setTheme(value) {
    theme = value;
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', value);
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', value);
    }
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  $: totalQuestions = questions.length;
  $: currentQuestion = questions[currentIndex];
  $: progress = ((currentIndex + 1) / totalQuestions) * 100;
  $: hasSelection = currentQuestion ? Boolean(responses[currentQuestion.key]) : false;
  $: isLastQuestion = currentIndex === totalQuestions - 1;
  $: similarityDegrees = results ? ((results.overallSimilarity || 0) / 100) * 360 : 0;
  $: messageInfo = results ? buildMessage(results, responses) : null;
  $: displayedSimilarity = Math.round($similarityStore);

  function selectOption(option) {
    if (!currentQuestion) return;
    responses = { ...responses, [currentQuestion.key]: option };
  }

  function goNext() {
    if (currentIndex < totalQuestions - 1 && hasSelection) {
      currentIndex += 1;
    }
  }

  function resetSurvey() {
    currentIndex = 0;
    responses = {};
    showResults = false;
    results = null;
    loading = false;
    similarityStore.set(0, { duration: 0 });
    notification = null;
  }

  async function submit() {
    if (!hasSelection || loading) return;
    loading = true;

    try {
      const response = await fetch(`${API_BASE}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responses)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      await response.json();

      const summaryUrl = new URL(`${API_BASE}/summary`);
      Object.entries(responses).forEach(([key, value]) => {
        summaryUrl.searchParams.set(key, value);
      });

      const summaryResponse = await fetch(summaryUrl);
      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        throw new Error(`Summary error (${summaryResponse.status}): ${errorText}`);
      }

      const data = await summaryResponse.json();
      results = data;
      showResults = true;
      similarityStore.set(data.overallSimilarity || 0);
      showNotification('Responses submitted successfully!', 'success');
    } catch (error) {
      console.error('Submission error:', error);
      const message = error.message.includes('Failed to fetch')
        ? 'Cannot connect to server. Please make sure the backend is running.'
        : error.message;
      showNotification(message || 'Failed to submit. Please try again.', 'error');
    } finally {
      loading = false;
    }
  }

  function showNotification(message, type = 'info') {
    notification = message;
    notificationType = type;
    if (notificationTimeout) clearTimeout(notificationTimeout);
    notificationTimeout = setTimeout(() => {
      notification = null;
    }, 4000);
  }

  function buildMessage(data, userResponses) {
    const exactMatches = data.exactMatches ?? 0;
    const partialMatches = data.partialMatches ?? 0;
    const total = data.total ?? 0;

    let title = 'Your Results Are In!';
    let message = '';

    if (exactMatches > 0) {
      title = '🎯 Perfect Match Found!';
      message = `Amazing! ${exactMatches} ${exactMatches === 1 ? 'person feels' : 'people feel'} exactly the same way as you across all 10 dimensions. You're definitely not alone in how you're experiencing today.`;
    } else if (partialMatches > 0) {
      title = '🤝 Great Similarity!';
      message = `You have ${partialMatches} ${partialMatches === 1 ? 'person who shares' : 'people who share'} most of your feelings today. While not identical, you're in very similar emotional territory.`;
    } else if (total > 0) {
      title = '⭐ You\'re Unique!';
      message = "Your combination of feelings today is completely unique! Sometimes being different is exactly what makes you special. Your perspective adds valuable diversity to our community.";
    } else {
      title = '🌟 First to Share!';
      message = "You're the very first person to share your feelings today! Your courage to be vulnerable paves the way for others to connect and share their experiences.";
    }

    const insight = getMoodInsight(userResponses.mood);
    return { title, message, insight };
  }

  function getMoodInsight(mood) {
    const insights = {
      Happy: 'Your positive energy is contagious! Keep spreading those good vibes.',
      Sad: "It's okay to feel sad sometimes. Tomorrow is a new opportunity for joy.",
      Anxious: "Take deep breaths. You're stronger than your worries.",
      Calm: "Your inner peace is a superpower in today's busy world.",
      Excited: 'Your enthusiasm lights up the room! Channel that energy wisely.',
      Angry: 'Strong emotions show you care deeply. Find healthy ways to express them.'
    };

    return insights[mood] || 'Every feeling is valid and part of the human experience.';
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
</script>

<main class="container">
  <div class="theme-toggle">
    <button
      class="theme-btn"
      type="button"
      aria-label="Toggle theme"
      aria-pressed={theme === 'dark'}
      on:click={toggleTheme}
    >
      <i class="fas fa-sun sun-icon"></i>
      <i class="fas fa-moon moon-icon"></i>
      <div class="toggle-slider"></div>
    </button>
    <span class="theme-label">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
  </div>

  <div class="header">
    <h1>WT Website</h1>
    <p class="lead">Answer 10 quick questions and discover how many people feel exactly like you today.</p>
  </div>

  {#if !showResults}
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" style={`width: ${progress}%`}></div>
      </div>
      <div class="progress-text">
        <span>{currentIndex + 1}</span> of <span>{totalQuestions}</span>
      </div>
    </div>
  {/if}

  {#if !showResults && currentQuestion}
    <section class="form-card">
      <div class="question-group">
        <div class="question" role="heading" aria-level="2">
          <i class={currentQuestion.icon}></i>
          {currentQuestion.text}
        </div>
        <div class="options" role="radiogroup" aria-label={currentQuestion.text}>
          {#each currentQuestion.options as option}
            <button
              type="button"
              role="radio"
              aria-checked={responses[currentQuestion.key] === option}
              class={`option-btn ${responses[currentQuestion.key] === option ? 'selected' : ''}`}
              on:click={() => selectOption(option)}
            >
              {option}
            </button>
          {/each}
        </div>
      </div>

      <div class="navigation-buttons">
        {#if !isLastQuestion}
          <button class="nav-btn" type="button" on:click={goNext} disabled={!hasSelection}>
            <i class="fas fa-arrow-right"></i>
            Next Question
          </button>
        {:else}
          <button
            class="nav-btn"
            type="button"
            on:click={submit}
            disabled={!hasSelection || loading}
          >
            {#if loading}
              <i class="fas fa-spinner fa-spin"></i>
              Processing...
            {:else}
              <i class="fas fa-paper-plane"></i>
              Submit &amp; See Results
            {/if}
          </button>
        {/if}
      </div>
    </section>
  {/if}

  {#if showResults && results}
    <section class="results-page">
      <h2>{messageInfo?.title || 'Your Results Are In!'}</h2>

      <div class="similarity-display">
        <div class="similarity-circle" style={`--percentage: ${similarityDegrees}deg`}>
          <div class="similarity-percentage">{displayedSimilarity}%</div>
        </div>
        <div class="circle-label">feel like you</div>
        <div class="similarity-text">{messageInfo?.message}</div>
        <div class="similarity-message">
          <p>{messageInfo?.insight}</p>
        </div>
      </div>

      <div class="results-stats">
        <div class="stat-card">
          <span class="stat-number">{results.exactMatches || 0}</span>
          <span class="stat-label">Exact Matches</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{results.partialMatches || 0}</span>
          <span class="stat-label">Similar Matches</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{results.total || 0}</span>
          <span class="stat-label">Total Responses</span>
        </div>
      </div>

      <button class="new-response-btn" type="button" on:click={resetSurvey}>
        <i class="fas fa-refresh"></i>
        Try Again
      </button>
    </section>
  {/if}

  {#if notification}
    <div class={`notification notification-${notificationType}`}>
      <i class={`fas ${getNotificationIcon(notificationType)}`}></i>
      <span>{notification}</span>
    </div>
  {/if}
</main>
