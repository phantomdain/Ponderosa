/* ================================================================
   AVAILABILITY CHECKER – Google Calendar Integration
   ================================================================

   SETUP INSTRUCTIONS:
   1. Go to https://console.cloud.google.com/
   2. Create a new project (or use existing)
   3. Enable "Google Calendar API" under APIs & Services
   4. Create an API key under Credentials
   5. Restrict the API key:
      - Application restriction → HTTP referrers → add your domain
        (e.g. ponderosaeventsplace.com/*)
      - API restriction → Google Calendar API only
   6. In Google Calendar, go to Settings → your booking calendar →
      "Access permissions" → check "Make available to public"
      (or at minimum "See only free/busy")
   7. Copy the Calendar ID from "Integrate calendar" section
   8. Paste the API key and Calendar ID below
   ================================================================ */

const AVAIL_CONFIG = {
  apiKey: 'AIzaSyAsbvyA_BWoO5T9AUKvEuvhUu0ocTaFVNY',
  calendarId: 'c_10ae3472306a2ef9d642408736debdb8f3e8d686422f164f38cecfa6596b5e00@group.calendar.google.com',

  // Minimum days in advance an event can be booked
  minLeadDays: 14,
};

(function initAvailabilityChecker() {
  const dateInput = document.getElementById('avail-date');
  const checkBtn  = document.getElementById('avail-btn');
  const resultDiv = document.getElementById('avail-result');

  if (!dateInput || !checkBtn || !resultDiv) return;

  // Set minimum selectable date
  const today = new Date();
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + AVAIL_CONFIG.minLeadDays);
  dateInput.min = minDate.toISOString().split('T')[0];
  dateInput.value = '';

  checkBtn.addEventListener('click', handleCheck);

  async function handleCheck() {
    const dateVal = dateInput.value;
    if (!dateVal) {
      dateInput.focus();
      return;
    }

    const selected = new Date(dateVal + 'T00:00:00');
    if (selected < minDate) {
      showResult('error', 'Too Soon',
        `Please select a date at least ${AVAIL_CONFIG.minLeadDays} days from today.`);
      return;
    }

    // Show loading state
    checkBtn.disabled = true;
    checkBtn.innerHTML = '<span class="avail__spinner"></span> Checking…';
    resultDiv.hidden = true;

    try {
      const booked = await checkCalendar(dateVal);
      const dateLabel = formatDate(dateVal);

      if (booked) {
        showResult('booked',
          'Date Unavailable',
          `${dateLabel} is already booked. Try a different date.`,
          { label: 'Try Another Date', action: () => { resultDiv.hidden = true; dateInput.value = ''; dateInput.focus(); } }
        );
      } else {
        showResult('available',
          'Date Available!',
          `${dateLabel} is open. Reserve it before someone else does!`,
          { label: 'Book This Date', action: () => scrollToForm(dateVal) }
        );
      }
    } catch (err) {
      console.error('Availability check failed:', err);
      showResult('error', 'Could Not Check',
        'Unable to verify availability right now. Please call us or send an inquiry instead.');
    } finally {
      checkBtn.disabled = false;
      checkBtn.textContent = 'Check Availability';
    }
  }

  async function checkCalendar(dateStr) {
    const timeMin = dateStr + 'T00:00:00+08:00'; // PHT
    const timeMax = dateStr + 'T23:59:59+08:00';

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/freeBusy?key=' + AVAIL_CONFIG.apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeMin,
          timeMax,
          items: [{ id: AVAIL_CONFIG.calendarId }],
        }),
      }
    );

    if (!response.ok) throw new Error('API request failed: ' + response.status);

    const data = await response.json();
    const calendar = data.calendars && data.calendars[AVAIL_CONFIG.calendarId];
    return calendar && calendar.busy && calendar.busy.length > 0;
  }

  function showResult(type, title, subtitle, cta) {
    const icons = {
      available: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>',
      booked:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      error:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>',
    };

    let html = `
      ${icons[type]}
      <div class="avail__result-body">
        <div class="avail__result-title">${title}</div>
        <div class="avail__result-sub">${subtitle}</div>
      </div>
    `;

    if (cta) {
      html += `<button class="btn ${type === 'available' ? 'btn--primary' : 'btn--outline'} avail__cta-btn">${cta.label}</button>`;
    }

    resultDiv.className = 'avail__result avail__result--' + type;
    resultDiv.innerHTML = html;
    resultDiv.hidden = false;

    if (cta) {
      resultDiv.querySelector('.avail__cta-btn').addEventListener('click', cta.action);
    }
  }

  function scrollToForm(dateVal) {
    const dateField = document.getElementById('event-date');
    if (dateField) {
      dateField.value = dateVal;
      dateField.closest('.contact-main')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
})();
