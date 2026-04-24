/* ─── VitaLog — app.js ───────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

  // ════════════════════════════════════════════════════════════════
  // STORAGE HELPERS
  // ════════════════════════════════════════════════════════════════

  const Store = {
    get:    (key)      => JSON.parse(localStorage.getItem(key)),
    set:    (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    raw:    (key)      => localStorage.getItem(key),
    setRaw: (key, val) => localStorage.setItem(key, val),
    remove: (key)      => localStorage.removeItem(key),
  };

  // ════════════════════════════════════════════════════════════════
  // TAB NAVIGATION
  // ════════════════════════════════════════════════════════════════

  const navBtns   = document.querySelectorAll('.nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });

  const subNavBtns = document.querySelectorAll('.sub-nav-btn');
  const subPanels  = document.querySelectorAll('.sub-panel');

  subNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.subtab;
      subNavBtns.forEach(b => b.classList.remove('active'));
      subPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`subtab-${target}`).classList.add('active');
    });
  });

  // ════════════════════════════════════════════════════════════════
  // ONBOARDING
  // ════════════════════════════════════════════════════════════════

  const modal       = document.getElementById('onboarding-modal');
  const tempProfile = {};

  function initApp() {
    if (!Store.raw('vitaLog_onboarded')) {
      modal.classList.remove('hidden');
    } else {
      modal.classList.add('hidden');
    }
  }

  function showStep(id) {
    document.querySelectorAll('.onboard-step').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => showStep(btn.dataset.back));
  });

  document.getElementById('btn-calc-path').addEventListener('click', () => showStep('step-gender'));
  document.getElementById('btn-manual-path').addEventListener('click', () => showStep('step-manual'));

  document.querySelectorAll('#step-gender .choice-card').forEach(btn => {
    btn.addEventListener('click', () => {
      tempProfile.gender = btn.dataset.value;
      showStep('step-age');
    });
  });

  document.getElementById('next-age').addEventListener('click', () => {
    const val = parseInt(document.getElementById('input-age').value);
    const err = document.getElementById('error-age');
    if (!val || val < 10 || val > 100) { err.textContent = 'Please enter a valid age between 10 and 100.'; return; }
    err.textContent = '';
    tempProfile.age = val;
    showStep('step-weight');
  });

  document.getElementById('next-weight').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('input-weight').value);
    const err = document.getElementById('error-weight');
    if (!val || val < 20 || val > 300) { err.textContent = 'Please enter a valid weight between 20 and 300 kg.'; return; }
    err.textContent = '';
    tempProfile.weight = val;
    showStep('step-height');
  });

  document.getElementById('next-height').addEventListener('click', () => {
    const val = parseInt(document.getElementById('input-height').value);
    const err = document.getElementById('error-height');
    if (!val || val < 100 || val > 250) { err.textContent = 'Please enter a valid height between 100 and 250 cm.'; return; }
    err.textContent = '';
    tempProfile.height = val;
    showStep('step-activity');
  });

  document.querySelectorAll('#step-activity .choice-item').forEach(btn => {
    btn.addEventListener('click', () => {
      tempProfile.activity = parseFloat(btn.dataset.value);
      showStep('step-goal');
    });
  });

  document.querySelectorAll('#step-goal .choice-item').forEach(btn => {
    btn.addEventListener('click', () => {
      tempProfile.goal = parseInt(btn.dataset.value);
      tempProfile.calorieTarget = calcCalorieTarget(tempProfile);
      showStep('step-apikey');
    });
  });

  document.getElementById('next-manual').addEventListener('click', () => {
    const val = parseInt(document.getElementById('input-manual-cal').value);
    const err = document.getElementById('error-manual');
    if (!val || val < 500 || val > 10000) { err.textContent = 'Please enter a value between 500 and 10,000 kcal.'; return; }
    err.textContent = '';
    tempProfile.calorieTarget = val;
    showStep('step-apikey');
  });

  document.getElementById('btn-finish-setup').addEventListener('click', () => {
    const key = document.getElementById('input-apikey').value.trim();
    const err = document.getElementById('error-apikey');
    if (!key) { err.textContent = 'Please enter your Gemini API key.'; return; }
    err.textContent = '';
    Store.setRaw('vitaLog_apiKey', key);
    Store.set('vitaLog_profile', tempProfile);
    Store.setRaw('vitaLog_onboarded', 'true');
    document.getElementById('display-calories').textContent = tempProfile.calorieTarget;
    showStep('step-done');
  });

  document.getElementById('btn-start-tracking').addEventListener('click', () => {
    modal.classList.add('hidden');
    renderFoodLog();
  });

  function calcCalorieTarget(p) {
    const bmr = p.gender === 'male'
      ? (10 * p.weight) + (6.25 * p.height) - (5 * p.age) + 5
      : (10 * p.weight) + (6.25 * p.height) - (5 * p.age) - 161;
    return Math.round(bmr * p.activity + p.goal);
  }

  // ════════════════════════════════════════════════════════════════
  // DAILY DASHBOARD
  // ════════════════════════════════════════════════════════════════

  function renderDashboard() {
    const profile = Store.get('vitaLog_profile');
    const target  = profile?.calorieTarget || 2000;

    // Sum up today's food
    const totalCals    = todayData.foods.reduce((s, f) => s + (f.calories  || 0), 0);
    const totalProtein = todayData.foods.reduce((s, f) => s + (f.protein_g || 0), 0);
    const totalCarbs   = todayData.foods.reduce((s, f) => s + (f.carbs_g   || 0), 0);
    const totalFat     = todayData.foods.reduce((s, f) => s + (f.fat_g     || 0), 0);
    const totalFibre   = todayData.foods.reduce((s, f) => s + (f.fibre_g   || 0), 0);

    // Sum up today's workouts
    const totalBurnt = todayData.workouts.reduce((s, w) => s + (w.calories_burnt || 0), 0);
    const netCals    = totalCals - totalBurnt;

    // Update ring
    const CIRCUMFERENCE = 2 * Math.PI * 52; // 326.7
    const pct    = Math.min(totalCals / target, 1);
    const offset = CIRCUMFERENCE * (1 - pct);

    const ring = document.getElementById('calorie-ring');
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = pct < 0.75 ? '#c8f135' : pct < 1 ? '#ff9500' : '#ff3b30';

    // Update ring center text
    document.getElementById('ring-consumed').textContent = Math.round(totalCals);
    document.getElementById('ring-target').textContent   = target;

    // Update net card
    document.getElementById('net-consumed').textContent = Math.round(totalCals);
    document.getElementById('net-burnt').textContent    = Math.round(totalBurnt);
    document.getElementById('net-total').textContent    = Math.round(netCals);

    // Update macro pills
    document.getElementById('dash-protein').textContent = Math.round(totalProtein) + 'g';
    document.getElementById('dash-carbs').textContent   = Math.round(totalCarbs)   + 'g';
    document.getElementById('dash-fat').textContent     = Math.round(totalFat)     + 'g';
    document.getElementById('dash-fibre').textContent   = Math.round(totalFibre)   + 'g';

    // Warning banners
    const banner = document.getElementById('warning-banner');
    const warnText = document.getElementById('warning-text');
    const pctInt = Math.round(pct * 100);

    if (pct >= 1) {
      banner.classList.remove('hidden', 'warning');
      banner.classList.add('danger');
      warnText.textContent = `⚠️ You've hit your ${target} kcal daily target!`;
    } else if (pct >= 0.75) {
      banner.classList.remove('hidden', 'danger');
      warnText.textContent = `You're at ${pctInt}% of your daily target.`;
    } else {
      banner.classList.add('hidden');
    }
  }

  // ── Midnight reset ──────────────────────────────────────────────
  function checkMidnightReset() {
    const today   = new Date().toISOString().split('T')[0];
    const stored  = Store.get('vitaLog_today');
    if (stored && stored.date !== today) {
      archiveDay(stored);
      todayData = { date: today, foods: [], workouts: [] };
      saveToday();
      renderFoodLog();
      renderWorkoutLog();
      renderDashboard();
    }
  }

  function archiveDay(dayData) {
    const history = Store.get('vitaLog_history') || {};
    history[dayData.date] = {
      calories:    dayData.foods.reduce((s, f) => s + (f.calories  || 0), 0),
      protein_g:   dayData.foods.reduce((s, f) => s + (f.protein_g || 0), 0),
      carbs_g:     dayData.foods.reduce((s, f) => s + (f.carbs_g   || 0), 0),
      fat_g:       dayData.foods.reduce((s, f) => s + (f.fat_g     || 0), 0),
      fibre_g:     dayData.foods.reduce((s, f) => s + (f.fibre_g   || 0), 0),
      workoutKcal: dayData.workouts.reduce((s, w) => s + (w.calories_burnt || 0), 0),
    };
    Store.set('vitaLog_history', history);
  }

  // Check every minute if the date has changed
  setInterval(checkMidnightReset, 60 * 1000);

  // ════════════════════════════════════════════════════════════════
  // CHART HELPER — draws a bar chart on a <canvas> element
  // ════════════════════════════════════════════════════════════════

  function drawBarChart(canvasId, labels, values, target) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx    = canvas.getContext('2d');
    const dpr    = window.devicePixelRatio || 1;
    const W      = canvas.offsetWidth  || 320;
    const H      = 180;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, W, H);

    const pad    = { top: 16, bottom: 28, left: 8, right: 8 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top  - pad.bottom;
    const n      = labels.length;
    const barW   = Math.floor((chartW / n) * 0.55);
    const gap    = chartW / n;
    const maxVal = Math.max(...values, target || 1, 1);

    // Target line
    if (target) {
      const ty = pad.top + chartH * (1 - target / maxVal);
      ctx.strokeStyle = '#333';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(pad.left, ty);
      ctx.lineTo(W - pad.right, ty);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Bars
    values.forEach((v, i) => {
      const x   = pad.left + gap * i + (gap - barW) / 2;
      const bH  = v > 0 ? Math.max(chartH * (v / maxVal), 3) : 0;
      const y   = pad.top + chartH - bH;
      ctx.fillStyle = (target && v > target) ? '#ff3b30' : '#c8f135';
      ctx.beginPath();
      ctx.roundRect(x, y, barW, bH, 3);
      ctx.fill();

      // Label below bar
      ctx.fillStyle = '#666';
      ctx.font      = `${10 * dpr / dpr}px DM Sans, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(labels[i], x + barW / 2, H - 8);
    });
  }

  // ════════════════════════════════════════════════════════════════
  // WEEKLY DASHBOARD
  // ════════════════════════════════════════════════════════════════

  function renderWeeklyDashboard() {
    const history = Store.get('vitaLog_history') || {};
    const profile = Store.get('vitaLog_profile');
    const target  = profile?.calorieTarget || 2000;

    // Build last 7 days (including today)
    const days   = [];
    const labels = [];
    const values = [];
    const DAY_NAMES = ['Su','Mo','Tu','We','Th','Fr','Sa'];

    for (let i = 6; i >= 0; i--) {
      const d    = new Date();
      d.setDate(d.getDate() - i);
      const key  = d.toISOString().split('T')[0];
      const data = i === 0 ? buildTodaySnapshot() : (history[key] || null);
      days.push({ key, data });
      labels.push(DAY_NAMES[d.getDay()]);
      values.push(data ? data.calories : 0);
    }

    drawBarChart('weekly-chart', labels, values, target);

    // Deficit/surplus stats
    const logged  = days.filter(d => d.data);
    const deficits = logged.map(d => target - d.data.calories);
    const totalDef = deficits.reduce((s, v) => s + v, 0);
    const avgDef   = logged.length ? Math.round(totalDef / logged.length) : 0;

    document.getElementById('weekly-total-deficit').textContent = fmtDeficit(Math.round(totalDef));
    document.getElementById('weekly-avg-deficit').textContent   = fmtDeficit(avgDef);

    // Today's macro split
    const snap = buildTodaySnapshot();
    const macroTotal = (snap.protein_g || 0) + (snap.carbs_g || 0) + (snap.fat_g || 0);
    if (macroTotal > 0) {
      document.getElementById('split-protein').textContent = pct(snap.protein_g, macroTotal) + '%';
      document.getElementById('split-carbs').textContent   = pct(snap.carbs_g,   macroTotal) + '%';
      document.getElementById('split-fat').textContent     = pct(snap.fat_g,     macroTotal) + '%';
    } else {
      ['split-protein','split-carbs','split-fat'].forEach(id => document.getElementById(id).textContent = '—');
    }

    // Today's workout burn
    const burn = snap.workoutKcal || 0;
    document.getElementById('weekly-workout-burn').textContent = burn + ' kcal burnt today';
  }

  // ════════════════════════════════════════════════════════════════
  // MONTHLY DASHBOARD
  // ════════════════════════════════════════════════════════════════

  function renderMonthlyDashboard() {
    const history = Store.get('vitaLog_history') || {};
    const profile = Store.get('vitaLog_profile');
    const target  = profile?.calorieTarget || 2000;

    const now      = new Date();
    const yearStr  = now.getFullYear();
    const monthStr = String(now.getMonth() + 1).padStart(2, '0');
    const prefix   = `${yearStr}-${monthStr}`;
    const daysInMonth = new Date(yearStr, now.getMonth() + 1, 0).getDate();

    const labels = [];
    const values = [];
    const entries = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const key  = `${prefix}-${String(d).padStart(2,'0')}`;
      const isToday = key === now.toISOString().split('T')[0];
      const data = isToday ? buildTodaySnapshot() : (history[key] || null);
      labels.push(d % 5 === 1 || d === 1 ? String(d) : '');
      values.push(data ? data.calories : 0);
      if (data) entries.push({ key, calories: data.calories, workoutKcal: data.workoutKcal || 0 });
    }

    drawBarChart('monthly-chart', labels, values, target);

    const avgCals   = entries.length ? Math.round(entries.reduce((s,e) => s + e.calories, 0) / entries.length) : 0;
    const totalDef  = entries.reduce((s,e) => s + (target - e.calories), 0);
    const bestDay   = entries.length ? entries.reduce((a,b) => Math.abs(a.calories-target) < Math.abs(b.calories-target) ? a : b) : null;
    const worstDay  = entries.length ? entries.reduce((a,b) => Math.abs(a.calories-target) > Math.abs(b.calories-target) ? a : b) : null;
    const burnTotal = entries.reduce((s,e) => s + e.workoutKcal, 0);
    const streak    = calcStreak(history, now);

    document.getElementById('monthly-avg').textContent          = avgCals ? avgCals + ' kcal' : '—';
    document.getElementById('monthly-total-deficit').textContent = fmtDeficit(Math.round(totalDef));
    document.getElementById('monthly-best').textContent         = bestDay  ? bestDay.key.slice(8)  + ' (' + bestDay.calories  + ' kcal)' : '—';
    document.getElementById('monthly-worst').textContent        = worstDay ? worstDay.key.slice(8) + ' (' + worstDay.calories + ' kcal)' : '—';
    document.getElementById('monthly-streak').textContent       = streak + ' day' + (streak !== 1 ? 's' : '') + ' logged in a row';
    document.getElementById('monthly-workout-burn').textContent = burnTotal + ' kcal';
  }

  // ════════════════════════════════════════════════════════════════
  // YEARLY DASHBOARD
  // ════════════════════════════════════════════════════════════════

  function renderYearlyDashboard() {
    const history = Store.get('vitaLog_history') || {};
    const profile = Store.get('vitaLog_profile');
    const target  = profile?.calorieTarget || 2000;
    const year    = new Date().getFullYear();
    const MONTHS  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const monthlyAvgs  = [];
    const monthlyBurns = [];

    MONTHS.forEach((_, mi) => {
      const monthStr = String(mi + 1).padStart(2, '0');
      const prefix   = `${year}-${monthStr}`;
      const daysInM  = new Date(year, mi + 1, 0).getDate();
      const entries  = [];

      for (let d = 1; d <= daysInM; d++) {
        const key = `${prefix}-${String(d).padStart(2,'0')}`;
        const isToday = key === new Date().toISOString().split('T')[0];
        const data = isToday ? buildTodaySnapshot() : (history[key] || null);
        if (data && data.calories > 0) entries.push(data);
      }

      const avg  = entries.length ? Math.round(entries.reduce((s,e) => s + e.calories, 0) / entries.length) : 0;
      const burn = entries.reduce((s,e) => s + (e.workoutKcal || 0), 0);
      monthlyAvgs.push(avg);
      monthlyBurns.push(burn);
    });

    drawBarChart('yearly-chart', MONTHS, monthlyAvgs, target);

    const loggedMonths  = monthlyAvgs.filter(v => v > 0);
    const yearlyTotal   = monthlyAvgs.reduce((s,v) => s + v, 0);
    const yearlyAvg     = loggedMonths.length ? Math.round(yearlyTotal / loggedMonths.length) : 0;
    const yearlyBurn    = monthlyBurns.reduce((s,v) => s + v, 0);
    const bestIdx       = monthlyAvgs.indexOf(loggedMonths.length ? loggedMonths.reduce((a,b) => Math.abs(a-target)<Math.abs(b-target)?a:b) : 0);
    const worstIdx      = monthlyAvgs.indexOf(loggedMonths.length ? loggedMonths.reduce((a,b) => Math.abs(a-target)>Math.abs(b-target)?a:b) : 0);

    document.getElementById('yearly-total-cals').textContent   = yearlyTotal  ? yearlyTotal.toLocaleString() + ' kcal' : '—';
    document.getElementById('yearly-avg').textContent          = yearlyAvg    ? yearlyAvg + ' kcal/day'  : '—';
    document.getElementById('yearly-best-month').textContent   = monthlyAvgs[bestIdx]  > 0 ? MONTHS[bestIdx]  : '—';
    document.getElementById('yearly-worst-month').textContent  = monthlyAvgs[worstIdx] > 0 ? MONTHS[worstIdx] : '—';
    document.getElementById('yearly-workout-burn').textContent = yearlyBurn   ? yearlyBurn.toLocaleString() + ' kcal' : '0 kcal';
  }

  // ── Shared helpers ──────────────────────────────────────────────

  function buildTodaySnapshot() {
    return {
      calories:    todayData.foods.reduce((s,f) => s + (f.calories  || 0), 0),
      protein_g:   todayData.foods.reduce((s,f) => s + (f.protein_g || 0), 0),
      carbs_g:     todayData.foods.reduce((s,f) => s + (f.carbs_g   || 0), 0),
      fat_g:       todayData.foods.reduce((s,f) => s + (f.fat_g     || 0), 0),
      fibre_g:     todayData.foods.reduce((s,f) => s + (f.fibre_g   || 0), 0),
      workoutKcal: todayData.workouts.reduce((s,w) => s + (w.calories_burnt || 0), 0),
    };
  }

  function fmtDeficit(val) {
    if (!val && val !== 0) return '—';
    return (val >= 0 ? '-' : '+') + Math.abs(val) + ' kcal';
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }

  function calcStreak(history, now) {
    let streak = 0;
    const d = new Date(now);
    while (true) {
      const key = d.toISOString().split('T')[0];
      const isToday = key === now.toISOString().split('T')[0];
      const hasData = isToday
        ? todayData.foods.length > 0
        : !!(history[key] && history[key].calories > 0);
      if (!hasData) break;
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // Re-render dashboards when user switches to Dashboard tab
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.tab === 'dashboard') {
      btn.addEventListener('click', () => {
        renderWeeklyDashboard();
        renderMonthlyDashboard();
        renderYearlyDashboard();
      });
    }
  });

  // Re-render active sub-tab when switching between Weekly/Monthly/Yearly
  document.querySelectorAll('.sub-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.subtab;
      if (t === 'weekly')  renderWeeklyDashboard();
      if (t === 'monthly') renderMonthlyDashboard();
      if (t === 'yearly')  renderYearlyDashboard();
    });
  });

  // ════════════════════════════════════════════════════════════════
  // TODAY'S DATA
  // ════════════════════════════════════════════════════════════════

  let todayData = loadToday();

  function loadToday() {
    const today = new Date().toISOString().split('T')[0];
    const stored = Store.get('vitaLog_today');
    if (stored && stored.date === today) return stored;
    return { date: today, foods: [], workouts: [] };
  }

  function saveToday() {
    Store.set('vitaLog_today', todayData);
  }

  // ════════════════════════════════════════════════════════════════
  // GEMINI API
  // ════════════════════════════════════════════════════════════════

  async function callGemini(prompt, jsonMode = true) {
    const apiKey = Store.raw('vitaLog_apiKey');
    if (!apiKey) throw new Error('NO_KEY');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (jsonMode) {
      body.generationConfig = { responseMimeType: 'application/json' };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`HTTP_${response.status}`);

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // ════════════════════════════════════════════════════════════════
  // FOOD LOGGING
  // ════════════════════════════════════════════════════════════════

  async function logFood(userInput) {
    showFoodLoading(true);

    const prompt = `You are a nutrition database. Extract nutrition info for the food described below.
Food: "${userInput}"
Return ONLY valid JSON in exactly this format (no explanation, no markdown, just JSON):
{"name":"","calories":0,"protein_g":0,"carbs_g":0,"fat_g":0,"fibre_g":0}
Use null for any value you are genuinely unsure about. Estimate reasonable values where possible.`;

    try {
      const raw  = await callGemini(prompt);
      const data = JSON.parse(raw);

      const entry = {
        id:        Date.now(),
        time:      new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        name:      data.name      || userInput,
        calories:  data.calories  ?? null,
        protein_g: data.protein_g ?? null,
        carbs_g:   data.carbs_g   ?? null,
        fat_g:     data.fat_g     ?? null,
        fibre_g:   data.fibre_g   ?? null,
      };

      todayData.foods.push(entry);
      saveToday();
      renderFoodLog();
      renderDashboard();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      showFoodLoading(false);
    }
  }

  function renderFoodLog() {
    const list  = document.getElementById('food-log-list');
    const empty = document.getElementById('food-empty');

    if (todayData.foods.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    list.innerHTML = todayData.foods.map(f => `
      <div class="food-card" data-id="${f.id}">
        <div class="food-card-header">
          <div>
            <span class="food-name">${escapeHtml(f.name)}</span>
            <span class="food-time">${f.time}</span>
          </div>
          <button class="delete-btn" data-id="${f.id}" aria-label="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
        <div class="food-card-macros">
          <div class="macro-pill"><span>${fmt(f.calories)}</span><small>kcal</small></div>
          <div class="macro-pill"><span>${fmt(f.protein_g)}g</span><small>protein</small></div>
          <div class="macro-pill"><span>${fmt(f.carbs_g)}g</span><small>carbs</small></div>
          <div class="macro-pill"><span>${fmt(f.fat_g)}g</span><small>fat</small></div>
          <div class="macro-pill"><span>${fmt(f.fibre_g)}g</span><small>fibre</small></div>
        </div>
      </div>
    `).join('');
  }

  // Event delegation — one listener handles all delete buttons
  document.getElementById('food-log-list').addEventListener('click', e => {
    const btn = e.target.closest('.delete-btn');
    if (btn) deleteFood(Number(btn.dataset.id));
  });

  function deleteFood(id) {
    todayData.foods = todayData.foods.filter(f => f.id !== id);
    saveToday();
    renderFoodLog();
    renderDashboard();
  }

  // ════════════════════════════════════════════════════════════════
  // VOICE INPUT  (Web Speech API)
  // ════════════════════════════════════════════════════════════════

  function startVoice(inputEl, micBtn) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showToast('Voice input is not supported in this browser.'); return; }

    const recognition  = new SR();
    recognition.lang   = 'en-US';
    recognition.interimResults = false;

    micBtn.classList.add('listening');

    recognition.onresult = e => {
      inputEl.value = e.results[0][0].transcript;
      micBtn.classList.remove('listening');
    };
    recognition.onerror = () => {
      micBtn.classList.remove('listening');
      showToast('Could not capture voice. Please try again.');
    };
    recognition.onend = () => micBtn.classList.remove('listening');

    recognition.start();
  }

  // ════════════════════════════════════════════════════════════════
  // WORKOUT LOGGING
  // ════════════════════════════════════════════════════════════════

  async function logWorkout(userInput) {
    showWorkoutLoading(true);

    const profile = Store.get('vitaLog_profile');
    const weight  = profile?.weight || 70;

    const prompt = `You are a fitness calorie calculator. The user weighs ${weight}kg.
Estimate calories burnt for this workout: "${userInput}"
Return ONLY valid JSON in exactly this format (no explanation, no markdown):
{"exercise":"","duration_min":0,"calories_burnt":0}
Use null for any value you are unsure about. Estimate reasonable values where possible.`;

    try {
      const raw  = await callGemini(prompt);
      const data = JSON.parse(raw);

      const entry = {
        id:             Date.now(),
        time:           new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        exercise:       data.exercise       || userInput,
        duration_min:   data.duration_min   ?? null,
        calories_burnt: data.calories_burnt ?? null,
      };

      todayData.workouts.push(entry);
      saveToday();
      renderWorkoutLog();
      renderDashboard();
    } catch (err) {
      showToast(getErrorMessage(err));
    } finally {
      showWorkoutLoading(false);
    }
  }

  function renderWorkoutLog() {
    const list  = document.getElementById('workout-log-list');
    const empty = document.getElementById('workout-empty');

    if (todayData.workouts.length === 0) {
      list.innerHTML = '';
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    list.innerHTML = todayData.workouts.map(w => `
      <div class="workout-card" data-id="${w.id}">
        <div class="workout-card-header">
          <div>
            <span class="workout-name">${escapeHtml(w.exercise)}</span>
            <span class="workout-time">${w.time}</span>
          </div>
          <button class="delete-btn" data-id="${w.id}" aria-label="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
        <div class="workout-card-stats">
          <div class="stat-pill">
            <span>${fmt(w.duration_min)} min</span>
            <small>duration</small>
          </div>
          <div class="stat-pill highlight">
            <span>${fmt(w.calories_burnt)} kcal</span>
            <small>burnt</small>
          </div>
        </div>
      </div>
    `).join('');
  }

  document.getElementById('workout-log-list').addEventListener('click', e => {
    const btn = e.target.closest('.delete-btn');
    if (btn) deleteWorkout(Number(btn.dataset.id));
  });

  function deleteWorkout(id) {
    todayData.workouts = todayData.workouts.filter(w => w.id !== id);
    saveToday();
    renderWorkoutLog();
    renderDashboard();
  }

  function showWorkoutLoading(show) {
    document.getElementById('workout-loading').classList.toggle('hidden', !show);
    document.getElementById('workout-send-btn').disabled = show;
  }

  // ── Workout input events ────────────────────────────────────────
  const workoutInput = document.getElementById('workout-input');
  const workoutSend  = document.getElementById('workout-send-btn');
  const workoutMic   = document.getElementById('workout-mic-btn');

  function submitWorkout() {
    const val = workoutInput.value.trim();
    if (!val) return;
    workoutInput.value = '';
    logWorkout(val);
  }

  workoutSend.addEventListener('click', submitWorkout);
  workoutInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitWorkout(); });
  workoutMic.addEventListener('click', () => startVoice(workoutInput, workoutMic));

  // ════════════════════════════════════════════════════════════════
  // FOOD INPUT EVENT LISTENERS
  // ════════════════════════════════════════════════════════════════

  const foodInput  = document.getElementById('food-input');
  const foodSend   = document.getElementById('food-send-btn');
  const foodMic    = document.getElementById('food-mic-btn');

  function submitFood() {
    const val = foodInput.value.trim();
    if (!val) return;
    foodInput.value = '';
    logFood(val);
  }

  foodSend.addEventListener('click', submitFood);
  foodInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitFood(); });
  foodMic.addEventListener('click', () => startVoice(foodInput, foodMic));

  // ════════════════════════════════════════════════════════════════
  // UI HELPERS
  // ════════════════════════════════════════════════════════════════

  function showFoodLoading(show) {
    document.getElementById('food-loading').classList.toggle('hidden', !show);
    document.getElementById('food-send-btn').disabled = show;
  }

  let toastTimer;
  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  function getErrorMessage(err) {
    const m = err.message || '';
    if (m === 'NO_KEY')           return 'No API key found. Please add your Gemini key in Settings.';
    if (m.includes('HTTP_400'))   return 'Bad request. Check your API key in Settings.';
    if (m.includes('HTTP_401') || m.includes('HTTP_403')) return 'Invalid API key. Please update it in Settings.';
    if (m.includes('HTTP_429'))   return 'Too many requests. Wait a moment and try again.';
    if (m.includes('HTTP_5'))     return 'Gemini server error. Please try again shortly.';
    if (m.includes('Failed to fetch')) return 'No internet connection.';
    return 'Something went wrong. Please try again.';
  }

  function escapeHtml(str) {
    if (!str) return '—';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function fmt(val) {
    return val !== null && val !== undefined ? val : '—';
  }

  // ════════════════════════════════════════════════════════════════
  // SETTINGS
  // ════════════════════════════════════════════════════════════════

  function initSettings() {
    const profile = Store.get('vitaLog_profile');
    const target  = profile?.calorieTarget || '—';
    document.getElementById('settings-cal-display').textContent = target + ' kcal';
  }

  document.getElementById('btn-save-calories').addEventListener('click', () => {
    const val = parseInt(document.getElementById('settings-cal-input').value);
    if (!val || val < 500 || val > 10000) { showToast('Enter a value between 500 and 10,000 kcal.'); return; }
    const profile = Store.get('vitaLog_profile') || {};
    profile.calorieTarget = val;
    Store.set('vitaLog_profile', profile);
    document.getElementById('settings-cal-display').textContent = val + ' kcal';
    document.getElementById('settings-cal-input').value = '';
    renderDashboard();
    showToast('Calorie target updated to ' + val + ' kcal.');
  });

  document.getElementById('btn-save-key').addEventListener('click', () => {
    const key = document.getElementById('settings-key-input').value.trim();
    if (!key) { showToast('Please paste your API key.'); return; }
    Store.setRaw('vitaLog_apiKey', key);
    document.getElementById('settings-key-input').value = '';
    showToast('API key updated.');
  });

  // ── Confirmation modal ──────────────────────────────────────────
  let pendingAction = null;

  function showConfirm(message, action) {
    pendingAction = action;
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.remove('hidden');
  }

  document.getElementById('confirm-yes').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (pendingAction) { pendingAction(); pendingAction = null; }
  });

  document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('confirm-modal').classList.add('hidden');
    pendingAction = null;
  });

  document.getElementById('btn-reset-today').addEventListener('click', () => {
    showConfirm("Reset today's food and workout log? This cannot be undone.", () => {
      const today = new Date().toISOString().split('T')[0];
      todayData = { date: today, foods: [], workouts: [] };
      saveToday();
      renderFoodLog();
      renderWorkoutLog();
      renderDashboard();
      showToast("Today's log has been reset.");
    });
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    showConfirm('Delete ALL data including history and profile? This cannot be undone.', () => {
      ['vitaLog_today','vitaLog_history','vitaLog_profile','vitaLog_apiKey','vitaLog_onboarded']
        .forEach(k => Store.remove(k));
      location.reload();
    });
  });

  // Populate settings display when user opens Settings tab
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.dataset.tab === 'settings') btn.addEventListener('click', initSettings);
  });

  // ════════════════════════════════════════════════════════════════
  // AI CHAT
  // ════════════════════════════════════════════════════════════════

  const chatHistory = []; // holds last 6 turns in memory, not persisted

  const SYSTEM_PROMPT = `You are a friendly, concise nutrition and fitness assistant called VitaLog AI.
Answer questions clearly and helpfully. Never recommend medical treatment or diagnose conditions.
Keep responses under 150 words unless the user explicitly asks for more detail.
If asked about calories or macros, give practical, actionable advice.`;

  async function sendChatMessage(userText) {
    appendBubble(userText, 'user');

    // Keep last 6 turns for context
    chatHistory.push({ role: 'user', parts: [{ text: userText }] });
    if (chatHistory.length > 12) chatHistory.splice(0, 2);

    const typingBubble = appendTypingIndicator();

    const prompt = SYSTEM_PROMPT + '\n\nUser: ' + userText;

    try {
      const reply = await callGemini(prompt, false);
      typingBubble.remove();
      appendBubble(reply, 'gemini');
      chatHistory.push({ role: 'model', parts: [{ text: reply }] });
    } catch (err) {
      typingBubble.remove();
      appendBubble('Sorry, I couldn\'t reach the AI. ' + getErrorMessage(err), 'gemini');
    }
  }

  function appendBubble(text, who) {
    const msgs = document.getElementById('chat-messages');
    const div  = document.createElement('div');
    div.className = `chat-bubble ${who}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function appendTypingIndicator() {
    const msgs = document.getElementById('chat-messages');
    const div  = document.createElement('div');
    div.className = 'chat-bubble gemini typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  const chatInput = document.getElementById('chat-input');
  const chatSend  = document.getElementById('chat-send-btn');
  const chatMic   = document.getElementById('chat-mic-btn');

  function submitChat() {
    const val = chatInput.value.trim();
    if (!val) return;
    chatInput.value = '';
    sendChatMessage(val);
  }

  chatSend.addEventListener('click', submitChat);
  chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') submitChat(); });
  chatMic.addEventListener('click', () => startVoice(chatInput, chatMic));

  // ════════════════════════════════════════════════════════════════
  // BOOT
  // ════════════════════════════════════════════════════════════════

  initApp();
  checkMidnightReset();
  renderDashboard();
  renderFoodLog();
  renderWorkoutLog();

});
