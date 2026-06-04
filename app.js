/* App JS for Hansaem Church Travel Planner */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- Constants & State ---
  const TARGET_DATE = new Date('2026-06-05T17:00:00').getTime();
  
  const PARTICIPANTS = {
    male: ['오덕환', '정병수', '이용연', '정동근', '박양호', '이현규'],
    female: ['홍정순', '김은주', '최운자', '장옥자', '전제순', '정영옥', '조영자']
  };

  const DEFAULT_TODOS = [
    { text: '🚨 [필수] 개인 세면도구 (치약, 칫솔 등) 및 수건 지참 🧼🪥🧴', checked: false },
    { text: '성경책 및 찬송가 📖', checked: false },
    { text: '필기도구 ✏️', checked: false },
    { text: '편안한 운동화/신발 👟', checked: false },
    { text: '상비약 및 개인 복용 약 💊', checked: false },
    { text: '스마트폰 충전기 & 보조배터리 🔋', checked: false },
    { text: '가벼운 겉옷/바람막이 (바닷바람 대비 🧥)', checked: false }
  ];

  let state = {
    theme: localStorage.getItem('theme') || 'light',
    checkedParticipants: JSON.parse(localStorage.getItem('checkedParticipants')) || [],
    todos: JSON.parse(localStorage.getItem('todos_v5')) || DEFAULT_TODOS
  };

  // --- Theme Toggle Setup ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
    localStorage.setItem('theme', theme);
  }

  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
  });

  applyTheme(state.theme);

  // --- Countdown Timer ---
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  const countdownStatusEl = document.getElementById('countdown-status');
  const countdownBoxEl = document.getElementById('countdown-box');

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    if (distance < 0) {
      // Trip is ongoing or completed
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      
      const oneDay = 24 * 60 * 60 * 1000;
      const tripEnd = TARGET_DATE + (2 * oneDay); // Mock 2 days trip window
      
      if (now < tripEnd) {
        countdownStatusEl.textContent = '🌊 한샘교회 성지탐방이 지금 진행 중입니다! 은혜로운 시간 보내세요.';
        countdownStatusEl.style.color = 'var(--color-teal)';
      } else {
        countdownStatusEl.textContent = '✨ 한샘교회 성지탐방 일정이 안전하게 마무리되었습니다. 할렐루야!';
        countdownStatusEl.style.color = 'var(--color-text-secondary)';
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // --- Clipboard Copy Helper ---
  const copyBtn = document.querySelector('.copy-btn');
  copyBtn.addEventListener('click', () => {
    const textToCopy = copyBtn.getAttribute('data-clipboard');
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '복사 완료! ✓';
      copyBtn.style.color = 'var(--color-accent)';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.color = 'var(--color-teal)';
      }, 1500);
    });
  });

  // --- Day Tabs switching ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const day1Timeline = document.getElementById('day1-timeline');
  const day2Timeline = document.getElementById('day2-timeline');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const day = btn.getAttribute('data-day');
      
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (day === 'day1') {
        day1Timeline.classList.add('active');
        day2Timeline.classList.remove('active');
      } else {
        day1Timeline.classList.remove('active');
        day2Timeline.classList.add('active');
      }
    });
  });

  // --- Expandable Itinerary Items ---
  const expandables = document.querySelectorAll('.timeline-content.expandable');
  expandables.forEach(item => {
    item.addEventListener('click', (e) => {
      // Don't toggle if a link inside is clicked
      if (e.target.tagName === 'A' || e.target.classList.contains('inline-link')) {
        return;
      }
      item.classList.toggle('open');
    });
  });

  // --- Participants Management ---
  const maleContainer = document.getElementById('male-container');
  const femaleContainer = document.getElementById('female-container');
  const peopleStatsEl = document.getElementById('people-stats');
  const peopleProgressBar = document.getElementById('people-progress-bar');

  function renderParticipants() {
    maleContainer.innerHTML = '';
    femaleContainer.innerHTML = '';

    PARTICIPANTS.male.forEach(name => {
      createChip(name, maleContainer);
    });

    PARTICIPANTS.female.forEach(name => {
      createChip(name, femaleContainer);
    });

    updateParticipantsProgress();
  }

  function createChip(name, container) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    if (state.checkedParticipants.includes(name)) {
      chip.classList.add('active');
    }
    chip.textContent = name;

    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      if (chip.classList.contains('active')) {
        if (!state.checkedParticipants.includes(name)) {
          state.checkedParticipants.push(name);
        }
      } else {
        state.checkedParticipants = state.checkedParticipants.filter(p => p !== name);
      }
      localStorage.setItem('checkedParticipants', JSON.stringify(state.checkedParticipants));
      updateParticipantsProgress();
    });

    container.appendChild(chip);
  }

  function updateParticipantsProgress() {
    const totalCount = PARTICIPANTS.male.length + PARTICIPANTS.female.length;
    const checkedCount = state.checkedParticipants.length;
    
    peopleStatsEl.textContent = `${checkedCount} / ${totalCount} 명`;
    
    const percentage = (checkedCount / totalCount) * 100;
    peopleProgressBar.style.width = `${percentage}%`;
  }

  renderParticipants();

  // --- Preparation Checklist (Todo) ---
  const todoListUl = document.getElementById('todo-list-ul');
  const newTodoInput = document.getElementById('new-todo-input');
  const addTodoBtn = document.getElementById('add-todo-btn');

  function renderTodos() {
    todoListUl.innerHTML = '';
    state.todos.forEach((todo, index) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (todo.checked) {
        li.classList.add('checked');
      }

      const label = document.createElement('label');
      label.className = 'todo-label';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.checked;
      checkbox.addEventListener('change', () => {
        state.todos[index].checked = checkbox.checked;
        if (checkbox.checked) {
          li.classList.add('checked');
        } else {
          li.classList.remove('checked');
        }
        saveTodos();
      });

      const span = document.createElement('span');
      span.textContent = todo.text;

      label.appendChild(checkbox);
      label.appendChild(span);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-todo-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.ariaLabel = '준비물 삭제';
      deleteBtn.addEventListener('click', () => {
        state.todos.splice(index, 1);
        saveTodos();
        renderTodos();
      });

      li.appendChild(label);
      li.appendChild(deleteBtn);
      todoListUl.appendChild(li);
    });
  }

  function saveTodos() {
    localStorage.setItem('todos_v5', JSON.stringify(state.todos));
  }

  addTodoBtn.addEventListener('click', () => {
    const text = newTodoInput.value.trim();
    if (text) {
      state.todos.push({ text, checked: false });
      newTodoInput.value = '';
      saveTodos();
      renderTodos();
    }
  });

  newTodoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodoBtn.click();
    }
  });

  renderTodos();

  // Budget calculator removed

  // --- Interactive Map Linked Event ---
  const mapPins = document.querySelectorAll('.map-pin');
  
  mapPins.forEach(pin => {
    const targetId = pin.getAttribute('data-target');
    const timelineItem = document.getElementById(targetId);

    pin.addEventListener('click', () => {
      // Remove active states from all pins
      mapPins.forEach(p => p.classList.remove('active'));
      
      // Activate this pin
      pin.classList.add('active');

      if (timelineItem) {
        // Toggle tab depending on which day the item resides in
        const timelineParent = timelineItem.closest('.timeline-container');
        if (timelineParent) {
          const isDay1 = timelineParent.id === 'day1-timeline';
          const correspondingTabBtn = document.querySelector(`.tab-btn[data-day="${isDay1 ? 'day1' : 'day2'}"]`);
          if (correspondingTabBtn) {
            correspondingTabBtn.click();
          }
        }

        // Scroll to the timeline item smoothly
        timelineItem.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Highlight parent timeline item briefly
        const mainTimelineItem = timelineItem.closest('.timeline-item');
        if (mainTimelineItem) {
          mainTimelineItem.classList.add('highlighted');
          setTimeout(() => {
            mainTimelineItem.classList.remove('highlighted');
          }, 2000);
        }
        
        // Expand item if it is or is inside an expandable box
        const contentBox = timelineItem.closest('.timeline-content.expandable') || timelineItem.querySelector('.timeline-content.expandable');
        if (contentBox) {
          contentBox.classList.add('open');
        }
      }
    });

    // Hover effect mapping
    pin.addEventListener('mouseenter', () => {
      if (timelineItem) {
        const mainTimelineItem = timelineItem.closest('.timeline-item');
        if (mainTimelineItem) {
          mainTimelineItem.classList.add('highlighted');
        }
      }
    });

    pin.addEventListener('mouseleave', () => {
      if (timelineItem) {
        const mainTimelineItem = timelineItem.closest('.timeline-item');
        if (mainTimelineItem) {
          mainTimelineItem.classList.remove('highlighted');
        }
      }
    });
  });

});
