import { n as noop, b as assign, i as identity, c as create_ssr_component, a as subscribe, o as onDestroy, d as add_attribute, e as escape, f as each } from "../../chunks/ssr.js";
import { w as writable } from "../../chunks/index.js";
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0) raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0) raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function cubicOut(t) {
  const f = t - 1;
  return f * f * f + 1;
}
function get_interpolator(a, b) {
  if (a === b || a !== a) return () => a;
  const type = typeof a;
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    throw new Error("Cannot interpolate values of different type");
  }
  if (Array.isArray(a)) {
    const arr = b.map((bi, i) => {
      return get_interpolator(a[i], bi);
    });
    return (t) => arr.map((fn) => fn(t));
  }
  if (type === "object") {
    if (!a || !b) throw new Error("Object cannot be null");
    if (is_date(a) && is_date(b)) {
      a = a.getTime();
      b = b.getTime();
      const delta = b - a;
      return (t) => new Date(a + t * delta);
    }
    const keys = Object.keys(b);
    const interpolators = {};
    keys.forEach((key) => {
      interpolators[key] = get_interpolator(a[key], b[key]);
    });
    return (t) => {
      const result = {};
      keys.forEach((key) => {
        result[key] = interpolators[key](t);
      });
      return result;
    };
  }
  if (type === "number") {
    const delta = b - a;
    return (t) => a + t * delta;
  }
  throw new Error(`Cannot interpolate ${type} values`);
}
function tweened(value, defaults = {}) {
  const store = writable(value);
  let task;
  let target_value = value;
  function set(new_value, opts) {
    if (value == null) {
      store.set(value = new_value);
      return Promise.resolve();
    }
    target_value = new_value;
    let previous_task = task;
    let started = false;
    let {
      delay = 0,
      duration = 400,
      easing = identity,
      interpolate = get_interpolator
    } = assign(assign({}, defaults), opts);
    if (duration === 0) {
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      store.set(value = target_value);
      return Promise.resolve();
    }
    const start = now() + delay;
    let fn;
    task = loop((now2) => {
      if (now2 < start) return true;
      if (!started) {
        fn = interpolate(value, new_value);
        if (typeof duration === "function") duration = duration(value, new_value);
        started = true;
      }
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      const elapsed = now2 - start;
      if (elapsed > /** @type {number} */
      duration) {
        store.set(value = new_value);
        return false;
      }
      store.set(value = fn(easing(elapsed / duration)));
      return true;
    });
    return task.promise;
  }
  return {
    set,
    update: (fn, opts) => set(fn(target_value, value), opts),
    subscribe: store.subscribe
  };
}
const questionData = [
  {
    key: "mood",
    icon: "fas fa-smile",
    text: "How are you feeling?",
    options: ["Happy", "Sad", "Anxious", "Calm", "Excited", "Angry"]
  },
  {
    key: "energy",
    icon: "fas fa-battery-three-quarters",
    text: "Energy Level?",
    options: ["High Energy", "Medium Energy", "Low Energy", "Exhausted"]
  },
  {
    key: "stress",
    icon: "fas fa-heartbeat",
    text: "Stress Level?",
    options: ["No Stress", "Mild Stress", "Moderate Stress", "High Stress"]
  },
  {
    key: "productivity",
    icon: "fas fa-chart-line",
    text: "Productivity Today?",
    options: ["Very Productive", "Productive", "Average", "Unproductive"]
  },
  {
    key: "sleep",
    icon: "fas fa-bed",
    text: "How was your sleep?",
    options: ["Excellent Sleep", "Good Sleep", "Poor Sleep", "No Sleep"]
  },
  {
    key: "social",
    icon: "fas fa-users",
    text: "Social Interaction?",
    options: ["Very Social", "Somewhat Social", "Alone by Choice", "Lonely"]
  },
  {
    key: "health",
    icon: "fas fa-heart",
    text: "Physical Health?",
    options: ["Excellent", "Good", "Fair", "Poor"]
  },
  {
    key: "motivation",
    icon: "fas fa-fire",
    text: "Motivation Level?",
    options: ["Highly Motivated", "Motivated", "Neutral", "Unmotivated"]
  },
  {
    key: "focus",
    icon: "fas fa-bullseye",
    text: "Focus Today?",
    options: ["Very Focused", "Focused", "Distracted", "Unfocused"]
  },
  {
    key: "overall",
    icon: "fas fa-star",
    text: "Overall Day Rating?",
    options: ["Amazing Day", "Good Day", "Okay Day", "Bad Day"]
  }
];
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalQuestions;
  let currentQuestion;
  let progress;
  let hasSelection;
  let isLastQuestion;
  let $$unsubscribe_similarityStore;
  let theme = "dark";
  let currentIndex = 0;
  let responses = {};
  let loading = false;
  const similarityStore = tweened(0, { duration: 800, easing: cubicOut });
  $$unsubscribe_similarityStore = subscribe(similarityStore, (value) => value);
  onDestroy(() => {
  });
  totalQuestions = questionData.length;
  currentQuestion = questionData[currentIndex];
  progress = (currentIndex + 1) / totalQuestions * 100;
  hasSelection = currentQuestion ? Boolean(responses[currentQuestion.key]) : false;
  isLastQuestion = currentIndex === totalQuestions - 1;
  $$unsubscribe_similarityStore();
  return `<main class="container"><div class="theme-toggle"><button class="theme-btn" type="button" aria-label="Toggle theme"${add_attribute("aria-pressed", theme === "dark", 0)}><i class="fas fa-sun sun-icon"></i> <i class="fas fa-moon moon-icon"></i> <div class="toggle-slider"></div></button> <span class="theme-label">${escape("Dark Mode")}</span></div> <div class="header" data-svelte-h="svelte-vvl74t"><h1>WT Website</h1> <p class="lead">Answer 10 quick questions and discover how many people feel exactly like you today.</p></div> ${`<div class="progress-container"><div class="progress-bar"><div class="progress-fill"${add_attribute("style", `width: ${progress}%`, 0)}></div></div> <div class="progress-text"><span>${escape(currentIndex + 1)}</span> of <span>${escape(totalQuestions)}</span></div></div>`} ${currentQuestion ? `<section class="form-card"><div class="question-group"><div class="question" role="heading" aria-level="2"><i${add_attribute("class", currentQuestion.icon, 0)}></i> ${escape(currentQuestion.text)}</div> <div class="options" role="radiogroup"${add_attribute("aria-label", currentQuestion.text, 0)}>${each(currentQuestion.options, (option) => {
    return `<button type="button" role="radio"${add_attribute("aria-checked", responses[currentQuestion.key] === option, 0)}${add_attribute(
      "class",
      `option-btn ${responses[currentQuestion.key] === option ? "selected" : ""}`,
      0
    )}>${escape(option)} </button>`;
  })}</div></div> <div class="navigation-buttons">${!isLastQuestion ? `<button class="nav-btn" type="button" ${!hasSelection ? "disabled" : ""}><i class="fas fa-arrow-right"></i>
            Next Question</button>` : `<button class="nav-btn" type="button" ${!hasSelection || loading ? "disabled" : ""}>${`<i class="fas fa-paper-plane"></i>
              Submit &amp; See Results`}</button>`}</div></section>` : ``} ${``} ${``}</main>`;
});
export {
  Page as default
};
