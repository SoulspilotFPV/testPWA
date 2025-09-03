/**
 * File: script.js
 * --- NOTE SULLE MODIFICHE IMPLEMENTATE IN QUESTA VERSIONE ---
 * NUOVA MODIFICA: Risolto il bug per cui il modale di modifica profilo non appariva dopo la registrazione.
 * NUOVA MODIFICA: Corretti i percorsi delle immagini per il "Pensiero del Giorno" per un corretto collegamento.
 * NUOVA MODIFICA: Aggiunto un feedback visivo (icona di spunta e animazioni) per tutti i pulsanti di salvataggio (check-in, gratitudine, sonno, profilo).
 * NUOVA MODIFICA: Implementata un'animazione di comparsa per l'obiettivo e l'intenzione giornalieri appena impostati.
 * NUOVA MODIFICA: I filtri delle meditazioni si resettano quando si cambia pagina.
 * NUOVA MODIFICA: I check-in (sonno, benessere) si disabilitano e resettano correttamente.
 * NUOVA MODIFICA: Il contatore "Giorni di crescita" è stato rinominato, non si resetta più e incrementa al primo check-in giornaliero.
 * NUOVA MODIFICA: Implementato un nuovo sistema di Medaglie sbloccabili con popup di notifica.
 * --- REFACTORING COMPLETO DELLO STORICO E REPORT ---
 * NUOVA MODIFICA: Riscritta completamente la logica di generazione del calendario (`generateCalendar`) per maggiore robustezza.
 * NUOVA MODIFICA: Riscritta la funzione di visualizzazione dello storico (`updateHistoryDisplay`) utilizzando la manipolazione del DOM (`createElement`)
 * invece di `innerHTML` per migliorare performance, sicurezza e manutenibilità del codice.
 * NUOVA MODIFICA: Riscritta la funzione di generazione del report (`generateWeeklyReport`) utilizzando la manipolazione del DOM,
 * garantendo che la creazione del grafico e delle statistiche sia più affidabile e leggibile.
 * --- NUOVE MODIFICHE IMPLEMENTATE ---
 * NUOVA MODIFICA: Invertita la posizione della sesta (Contento) e settima (Calmo) emoji nel check-in del benessere. La modifica è stata effettuata nel file HTML.
 * NUOVA MODIFICA: Verificata l'implementazione dello scroll automatico per il form di registrazione su mobile (modifica in style.css).
 * NUOVA MODIFICA (FIX): Centralizzata la logica di feedback dei pulsanti nella funzione `showButtonFeedback` per uniformare l'animazione di salvataggio
 * e lo stato finale (disabilitato/grigio) su tutti i pulsanti della sezione Salute, risolvendo un conflitto di aggiornamento dell'interfaccia.
 * --- NUOVE MODIFICHE RICHIESTE DALL'UTENTE ---
 * NUOVA MODIFICA: Implementate funzioni `showButtonLoading` e `hideButtonLoading` per aggiungere un feedback di caricamento ai pulsanti di registrazione, accesso e pagamento.
 * NUOVA MODIFICA: Uniformata la logica dei pulsanti della sezione Salute: ora mostrano tutti "Salvato" dopo il salvataggio, come richiesto.
 * NUOVA MODIFICA: Modificato `handleSubscription` per accettare l'elemento pulsante e mostrare lo stato di caricamento.
 * NUOVA MODIFICA: Aggiornati i listener degli eventi per registrazione, accesso e pagamenti per utilizzare la nuova logica di caricamento.
 */
document.addEventListener('DOMContentLoaded', function() {
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }

    const startTime = Date.now();
    const loadingScreen = document.getElementById('loading-screen');

    function hideLoadingScreen() {
        const elapsedTime = Date.now() - startTime;
        const minimumTime = 1500;
        const remainingTime = minimumTime - elapsedTime;

        const hide = () => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
        };

        if (remainingTime > 0) {
            setTimeout(hide, remainingTime);
        } else {
            hide();
        }
    }

    window.onload = hideLoadingScreen;

    // App state
    const state = {
        currentMeditation: null,
        currentSelectedMood: null,
        moodEntries: {},
        gratitudeEntries: {},
        dailyGoals: {},
        dailyIntentions: {},
        anxietyEntries: {},
        stressEntries: {},
        sleepEntries: {},
        timeWindows: [
            {id: 'morning', start: 7, end: 13.99, name: 'Mattina'},
            {id: 'afternoon', start: 14, end: 20.99, name: 'Pomeriggio'},
            {id: 'evening', start: 21, end: 23.99, name: 'Sera'}
        ],
        profile: {
            name: "Utente",
            gender: "N",
            emoji: "😊"
        },
        reminders: {
            breathing: {
                interval: 60,
                sound: 'bells',
                active: true,
                from: "08:30",
                to: "21:30"
            },
            posture: {
                interval: 45,
                sound: 'bells',
                active: true,
                from: "08:30",
                to: "21:30"
            },
            water: {
                interval: 30,
                sound: 'bells',
                active: true,
                from: "08:30",
                to: "21:30"
            }
        },
        currentCalendarDate: new Date(),
        selectedHistoryDate: new Date().toISOString().split('T')[0],
        isPremium: false,
        referralCode: null,
        isLoggedIn: false,
        darkTheme: false,
        growthStreak: 0,
        lastActivityDate: null,
        downloadedMeditations: {},
        meditationHistory: {},
        lastAccessDate: null,
        streakUpdatedToday: false,
        dailyQuotes: [
            { image: "Daily/daily1.jpg", quote: "🌱 La pace viene da dentro. Non cercarla fuori. - Buddha" },
            { image: "Daily/daily2.jpg", quote: "⏳ Il momento presente è l'unico momento disponibile. - Thich Nhat Hanh" },
            { image: "Daily/daily3.jpg", quote: "💨 Respira. Lascia andare. E ricorda che questo momento è l'unico che sai per certo di avere. - Oprah Winfrey" },
            { image: "Daily/daily4.jpg", quote: "🧘‍♀️ La meditazione non è fuga dalla realtà. È un incontro sereno con la realtà. - Thich Nhat Hanh" },
            { image: "Daily/daily5.jpg", quote: "🌿 La natura non ha fretta, eppure tutto si realizza. - Lao Tzu" },
            { image: "Daily/daily6.jpg", quote: "💫 Ogni giorno è una nuova opportunità per cambiare la tua vita. - Anonimo" },
            { image: "Daily/daily7.jpg", quote: "🌅 Il sole sorge ogni mattina senza fallire. Sii come il sole. - Anonimo" },
            { image: "Daily/daily8.jpg", quote: "🍃 Lascia andare ciò che non puoi controllare. - Anonimo" },
            { image: "Daily/daily9.jpg", quote: "🌊 Sii come l'acqua: adattati, fluttua e scorri. - Bruce Lee" },
            { image: "Daily/daily10.jpg", quote: "🌸 Ogni fiore sboccia nel suo tempo. Rispetta il tuo ritmo. - Anonimo" }
        ],
        termsAcceptedAt: null,
        loadedDate: null,
        dailyContent: {
            date: null,
            quoteIndex: 0
        }
    };

    const medalTiers = [
        { days: 1, name: 'Inizio del Percorso', icon: 'fa-solid fa-seedling' },
        { days: 3, name: 'Primi Passi', icon: 'fa-solid fa-shoe-prints' },
        { days: 7, name: 'Una Settimana', icon: 'fa-solid fa-calendar-week' },
        { days: 14, name: 'Costanza', icon: 'fa-solid fa-mountain-sun' },
        { days: 21, name: 'Nuova Abitudine', icon: 'fa-solid fa-brain' },
        { days: 30, name: 'Un Mese', icon: 'fa-solid fa-moon' },
        { days: 90, name: 'Tre Mesi', icon: 'fa-solid fa-tree' },
        { days: 180, name: 'Sei Mesi', icon: 'fa-solid fa-person-hiking' },
        { days: 365, name: 'Un Anno', icon: 'fa-solid fa-star' },
        { days: 730, name: 'Due Anni', icon: 'fa-solid fa-trophy' },
        { days: 1095, name: 'Tre Anni', icon: 'fa-solid fa-award' },
        { days: 1460, name: 'Quattro Anni', icon: 'fa-solid fa-crown' },
        { days: 1825, name: 'Cinque Anni', icon: 'fa-solid fa-gem' }
    ];

    const meditationAudios = {
        1: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        2: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        3: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        4: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        5: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        6: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        7: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        8: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        9: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        10: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        11: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        12: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        13: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        14: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        15: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        16: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-124.mp3',
        17: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-ambience-573.mp3',
        18: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-ambience-239.mp3',
        19: 'https://assets.mixkit.co/sfx/preview/mixkit-waves-ambience-1184.mp3',
        20: 'https://assets.mixkit.co/sfx/preview/mixkit-night-ambience-427.mp3',
        21: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-ambience-1191.mp3',
        22: 'https://assets.mixkit.co/sfx/preview/mixkit-river-stream-water-1240.mp3',
        23: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3'
    };

    const soundFiles = {
        bells: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        nature: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        piano: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3'
    };

    // DOM Elements
    const authSection = document.getElementById('auth-section');
    const mainAppContainer = document.getElementById('main-app');
    const sections = document.querySelectorAll('.section');
    const navBar = document.querySelector('.nav-bar');
    const moodTracker = document.querySelector('.mood-tracker');
    const meditationList = document.querySelector('.meditation-list');
    const meditationFilters = document.querySelector('.meditation-filters');
    const playerModal = document.getElementById('player-modal');
    const historyModal = document.getElementById('history-modal');
    const profileEditModal = document.getElementById('profile-edit-modal');
    const loginModal = document.getElementById('login-modal');
    const reportModal = document.getElementById('report-modal');
    const audioPlayer = document.getElementById('meditation-audio');
    const toast = document.getElementById('toast');
    const historyBtn = document.getElementById('history-btn');
    const historyCloseBtn = document.getElementById('history-close-btn');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const moodHistoryContainer = document.getElementById('mood-history-container');
    const gratitudeHistoryContainer = document.getElementById('gratitude-history-container');
    const goalHistoryContainer = document.getElementById('goal-history-container');
    const dailyGoalContainer = document.getElementById('daily-goal-container');
    const intentionContainer = document.getElementById('intention-container');
    const monthlySubscribeBtn = document.getElementById('monthly-subscribe');
    const annualSubscribeBtn = document.getElementById('annual-subscribe');
    const googleLoginBtn = document.getElementById('google-login');
    const dailyImage = document.getElementById('daily-image');
    const dailyQuote = document.getElementById('daily-quote');
    const gratitudeForm = document.getElementById('gratitude-form');
    const gratitudeInputs = document.querySelectorAll('.gratitude-input');
    const gratitudeBtn = document.getElementById('gratitude-btn');
    const profileEditCancel = document.getElementById('profile-edit-cancel');
    const profileEditSave = document.getElementById('profile-edit-save');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleInput = document.getElementById('theme-toggle-input');
    const themeToggleProfile = document.getElementById('theme-toggle-profile');
    const streakCounter = document.getElementById('streak-counter');
    const genderOptionsContainer = document.querySelector('.gender-options');
    const emojiPicker = document.querySelector('.emoji-picker');
    const anxietySlider = document.getElementById('anxiety-slider');
    const anxietyValue = document.getElementById('anxiety-value');
    const stressSlider = document.getElementById('stress-slider');
    const stressValue = document.getElementById('stress-value');
    const sleepSlider = document.getElementById('sleep-slider');
    const sleepValue = document.getElementById('sleep-value');
    const saveSleepBtn = document.getElementById('save-sleep-btn');
    const reportCloseBtn = document.getElementById('report-close-btn');
    const premiumCard = document.getElementById('premium-card');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const premiumLocks = document.querySelectorAll('.premium-lock');
    const premiumLockBtns = document.querySelectorAll('.premium-lock-btn');
    const downloadReportBtn = document.getElementById('download-report-btn');
    const shareReportBtn = document.getElementById('share-report-btn');
    const reportContent = document.getElementById('report-content');
    const dailyMoodValue = document.getElementById('daily-mood-value');
    const dailyAnxietyValue = document.getElementById('daily-anxiety-value');
    const dailyStressValue = document.getElementById('daily-stress-value');
    const dailySleepValue = document.getElementById('daily-sleep-value');
    const calendarMonth = document.getElementById('calendar-month');
    const intentionInput = document.getElementById('intention-input');
    const setIntentionBtn = document.getElementById('set-intention-btn');
    const intentionText = document.getElementById('intention-text');
    const saveCombinedCheckinBtn = document.getElementById('save-combined-checkin-btn');
    const accountSettingsModal = document.getElementById('account-settings-modal');
    const accountSettingsBtn = document.getElementById('account-settings-btn');
    const accountSettingsCloseBtn = document.getElementById('account-settings-close-btn');
    const manageSubscriptionBtn = document.getElementById('manage-subscription-btn');
    const termsBtn = document.getElementById('terms-btn');
    const privacyBtn = document.getElementById('privacy-btn');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const yearlyToggle = document.getElementById('yearly-toggle');
    const monthlyToggle = document.getElementById('monthly-toggle');
    const subscriptionToggle = document.querySelector('.subscription-toggle');
    const yearlyPlan = document.getElementById('yearly-plan');
    const monthlyPlan = document.getElementById('monthly-plan');
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const registrationView = document.getElementById('registration-view');
    const loginView = document.getElementById('login-view');
    const showLoginLink = document.getElementById('show-login-link');
    const showRegisterLink = document.getElementById('show-register-link');
    const registerBtn = document.getElementById('register-btn');
    const termsCheckboxRegister = document.getElementById('terms-checkbox-register');
    const termsLinkRegister = document.getElementById('terms-link-register');
    const privacyLinkRegister = document.getElementById('privacy-link-register');
    const passwordInput = document.getElementById('password-input');
    const passwordFeedback = document.getElementById('password-feedback');
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');
    const medalsContainer = document.getElementById('medals-container');
    const medalUnlockModal = document.getElementById('medal-unlock-modal');
    const medalUnlockCloseBtn = document.getElementById('medal-unlock-close-btn');

    function loadSavedData() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) state.profile = JSON.parse(savedProfile);

        const savedMoodEntries = localStorage.getItem('moodEntries');
        if (savedMoodEntries) state.moodEntries = JSON.parse(savedMoodEntries);

        const savedGratitudeEntries = localStorage.getItem('gratitudeEntries');
        if (savedGratitudeEntries) state.gratitudeEntries = JSON.parse(savedGratitudeEntries);

        const savedAnxietyEntries = localStorage.getItem('anxietyEntries');
        if (savedAnxietyEntries) state.anxietyEntries = JSON.parse(savedAnxietyEntries);

        const savedStressEntries = localStorage.getItem('stressEntries');
        if (savedStressEntries) state.stressEntries = JSON.parse(savedStressEntries);

        const savedSleepEntries = localStorage.getItem('sleepEntries');
        if (savedSleepEntries) state.sleepEntries = JSON.parse(savedSleepEntries);

        const savedReminders = localStorage.getItem('reminders');
        if (savedReminders) state.reminders = JSON.parse(savedReminders);

        const savedDailyGoals = localStorage.getItem('dailyGoals');
        if (savedDailyGoals) state.dailyGoals = JSON.parse(savedDailyGoals);

        const savedDailyIntentions = localStorage.getItem('dailyIntentions');
        if (savedDailyIntentions) state.dailyIntentions = JSON.parse(savedDailyIntentions);

        const savedPremium = localStorage.getItem('isPremium');
        if (savedPremium) state.isPremium = JSON.parse(savedPremium);

        const savedReferralCode = localStorage.getItem('referralCode');
        if (savedReferralCode) state.referralCode = savedReferralCode;

        const savedLogin = localStorage.getItem('isLoggedIn');
        if (savedLogin) state.isLoggedIn = JSON.parse(savedLogin);

        const savedDarkTheme = localStorage.getItem('darkTheme');
        if (savedDarkTheme) state.darkTheme = JSON.parse(savedDarkTheme);

        const savedStreak = localStorage.getItem('growthStreak');
        if (savedStreak) state.growthStreak = JSON.parse(savedStreak);

        const savedLastActivity = localStorage.getItem('lastActivityDate');
        if (savedLastActivity) state.lastActivityDate = savedLastActivity;

        const savedDownloads = localStorage.getItem('downloadedMeditations');
        if (savedDownloads) state.downloadedMeditations = JSON.parse(savedDownloads);

        const savedMeditationHistory = localStorage.getItem('meditationHistory');
        if (savedMeditationHistory) state.meditationHistory = JSON.parse(savedMeditationHistory);

        const savedLastAccess = localStorage.getItem('lastAccessDate');
        if (savedLastAccess) state.lastAccessDate = savedLastAccess;

        const savedStreakUpdated = localStorage.getItem('streakUpdatedToday');
        if (savedStreakUpdated) state.streakUpdatedToday = JSON.parse(savedStreakUpdated);

        const savedDailyContent = localStorage.getItem('dailyContent');
        if (savedDailyContent) {
            const content = JSON.parse(savedDailyContent);
            if (content.date === getLocalDateString()) {
                state.dailyContent = content;
            }
        }

        const savedSelectedDate = localStorage.getItem('selectedHistoryDate');
        if (savedSelectedDate) state.selectedHistoryDate = savedSelectedDate;
    }

    function saveData() {
        localStorage.setItem('userProfile', JSON.stringify(state.profile));
        localStorage.setItem('moodEntries', JSON.stringify(state.moodEntries));
        localStorage.setItem('gratitudeEntries', JSON.stringify(state.gratitudeEntries));
        localStorage.setItem('anxietyEntries', JSON.stringify(state.anxietyEntries));
        localStorage.setItem('stressEntries', JSON.stringify(state.stressEntries));
        localStorage.setItem('sleepEntries', JSON.stringify(state.sleepEntries));
        localStorage.setItem('reminders', JSON.stringify(state.reminders));
        localStorage.setItem('dailyGoals', JSON.stringify(state.dailyGoals));
        localStorage.setItem('dailyIntentions', JSON.stringify(state.dailyIntentions));
        localStorage.setItem('isPremium', JSON.stringify(state.isPremium));
        localStorage.setItem('referralCode', state.referralCode || '');
        localStorage.setItem('isLoggedIn', JSON.stringify(state.isLoggedIn));
        localStorage.setItem('darkTheme', JSON.stringify(state.darkTheme));
        localStorage.setItem('growthStreak', JSON.stringify(state.growthStreak));
        localStorage.setItem('lastActivityDate', state.lastActivityDate || '');
        localStorage.setItem('downloadedMeditations', JSON.stringify(state.downloadedMeditations));
        localStorage.setItem('meditationHistory', JSON.stringify(state.meditationHistory));
        localStorage.setItem('lastAccessDate', state.lastAccessDate || '');
        localStorage.setItem('streakUpdatedToday', JSON.stringify(state.streakUpdatedToday));
        localStorage.setItem('selectedHistoryDate', state.selectedHistoryDate || new Date().toISOString().split('T')[0]);
        if (state.dailyContent) {
            localStorage.setItem('dailyContent', JSON.stringify(state.dailyContent));
        }
    }

    function updateWelcomeMessage() {
        let welcomeText = "";
        switch(state.profile.gender) {
            case "M": welcomeText = "Bentornato!"; break;
            case "F": welcomeText = "Bentornata!"; break;
            case "N": welcomeText = "Bentornatə!"; break;
            default: welcomeText = "Bentornato/a!";
        }
        document.getElementById('welcome-header').innerHTML = `${welcomeText} ${state.profile.emoji || '😊'}`;

        const welcomeElement = document.querySelector('.profile-welcome');
        let welcomeProfileText = "";
        switch(state.profile.gender) {
            case "M": welcomeProfileText = "Benvenuto nella tua area personale"; break;
            case "F": welcomeProfileText = "Benvenuta nella tua area personale"; break;
            case "N": welcomeProfileText = "Benvenutə nella tua area personale"; break;
            default: welcomeProfileText = "Benvenuto/a nella tua area personale";
        }
        if (welcomeElement) welcomeElement.textContent = welcomeProfileText;
    }

    function initUI() {
        state.loadedDate = getLocalDateString();
        document.querySelector('.profile-name').textContent = state.profile.name;
        document.querySelector('.profile-emoji').textContent = state.profile.emoji;
        updateWelcomeMessage();
        renderDailyGoal();
        renderDailyIntention();
        renderMedals();
        updateStreakCounter();
        updateTheme();
        updatePremiumLocks();
        updateDailyData();

        premiumCard.style.display = state.isPremium ? 'none' : 'block';

        const today = getLocalDateString();
        if (!state.dailyContent || state.dailyContent.date !== today) {
            state.dailyContent = {
                date: today,
                quoteIndex: Math.floor(Math.random() * state.dailyQuotes.length)
            };
            saveData();
        }

        const quote = state.dailyQuotes[state.dailyContent.quoteIndex];
        dailyImage.src = quote.image;
        dailyQuote.textContent = quote.quote;

        checkGratitudeLock();
        checkSleepLock();
        updateLoginState();
    }

    function updateLoginState() {
        logoutBtn.style.display = state.isLoggedIn ? 'flex' : 'none';
    }

    function renderDailyGoal(isNew = false) {
        const today = getLocalDateString();
        const todayGoal = state.dailyGoals[today];

        if (!todayGoal) {
            dailyGoalContainer.innerHTML = `
                <div class="goal-input-container">
                    <input type="text" class="goal-input" id="goal-input" placeholder="🎯 Cosa vuoi realizzare oggi?" required>
                    <button class="goal-btn" id="set-goal-btn"><i class="fas fa-plus"></i> Imposta</button>
                </div>
                <p style="color: var(--text-light); font-size: 0.9rem; margin-top: 5px;">
                    Inserisci un obiettivo realistico che vuoi portare a termine entro oggi.
                </p>
            `;
            return;
        }

        dailyGoalContainer.innerHTML = `
            <div class="goal-item ${isNew ? 'new-item-feedback' : ''}">
                <div class="goal-checkbox ${todayGoal.completed ? 'checked' : ''}" id="goal-checkbox">
                    ${todayGoal.completed ? '✓' : ''}
                </div>
                <div class="goal-text ${todayGoal.completed ? 'completed' : ''}">${todayGoal.text}</div>
                <div class="goal-status">
                    ${todayGoal.completed ? '🎉 Completato' : '⏳ In corso...'}
                </div>
            </div>
        `;
    }

    function renderDailyIntention(isNew = false) {
        const today = getLocalDateString();
        const todayIntention = state.dailyIntentions[today];
        const intentionBanner = document.querySelector('.intention-banner');

        if (!todayIntention) {
            intentionText.textContent = "Crea la tua intenzione per guidare la giornata";
            intentionInput.style.display = "block";
            setIntentionBtn.style.display = "block";
            return;
        }

        intentionText.textContent = `"${todayIntention.text}"`;
        if (isNew && intentionBanner) {
            intentionBanner.classList.remove('new-item-feedback');
            void intentionBanner.offsetWidth;
            intentionBanner.classList.add('new-item-feedback');
        }
        intentionInput.style.display = "none";
        setIntentionBtn.style.display = "none";
    }

    function updateDailyData() {
        const today = getLocalDateString();

        if (state.moodEntries[today] && state.moodEntries[today].length > 0) {
            const moodValues = state.moodEntries[today].map(entry => getMoodValue(entry.mood));
            const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
            dailyMoodValue.textContent = avgMood.toFixed(1);
        } else {
            dailyMoodValue.textContent = "-";
        }

        if (state.anxietyEntries[today] && state.anxietyEntries[today].length > 0) {
            const anxietyValues = state.anxietyEntries[today].map(entry => parseInt(entry.value));
            const avgAnxiety = anxietyValues.reduce((a, b) => a + b, 0) / anxietyValues.length;
            dailyAnxietyValue.textContent = avgAnxiety.toFixed(1);
        } else {
            dailyAnxietyValue.textContent = "-";
        }

        if (state.stressEntries[today] && state.stressEntries[today].length > 0) {
            const stressValues = state.stressEntries[today].map(entry => parseInt(entry.value));
            const avgStress = stressValues.reduce((a, b) => a + b, 0) / stressValues.length;
            dailyStressValue.textContent = avgStress.toFixed(1);
        } else {
            dailyStressValue.textContent = "-";
        }

        if (state.sleepEntries[today]) {
            dailySleepValue.textContent = state.sleepEntries[today];
        } else {
            dailySleepValue.textContent = "-";
        }
    }

    function setDailyGoal() {
        const input = document.getElementById('goal-input');
        if (!input) return;
        const goalText = input.value.trim();

        if (!goalText) {
            showToast("Per favore inserisci un obiettivo");
            return;
        }

        const today = getLocalDateString();
        state.dailyGoals[today] = {
            text: goalText,
            completed: false,
            timestamp: new Date().getTime()
        };

        saveData();
        renderDailyGoal(true);
        showToast("Obiettivo impostato!");
    }

    function setDailyIntention() {
        const input = document.getElementById('intention-input');
        const intentionTextValue = input.value.trim();

        if (!intentionTextValue) {
            showToast("Per favore inserisci un'intenzione");
            return;
        }

        const today = getLocalDateString();
        state.dailyIntentions[today] = {
            text: intentionTextValue,
            timestamp: new Date().getTime()
        };

        saveData();
        renderDailyIntention(true);
        showToast("Intenzione fissata!");
        showButtonFeedback(setIntentionBtn);
    }

    function toggleGoalCompletion() {
        const today = getLocalDateString();
        const goal = state.dailyGoals[today];
        if (!goal) return;

        goal.completed = !goal.completed;
        saveData();
        renderDailyGoal();

        if (goal.completed) {
            showToast("Obiettivo completato! Complimenti!");
            avviaCoriandoliPersonalizzati();
        } else {
            showToast("Obiettivo riportato in corso");
        }
    }

    dailyGoalContainer.addEventListener('click', function(e) {
        if (e.target.id === 'set-goal-btn') setDailyGoal();
        else if (e.target.id === 'goal-checkbox') toggleGoalCompletion();
    });

    /**
     * NUOVA MODIFICA: La logica di blocco è stata uniformata.
     * Ora, quando un dato è già salvato per il giorno, il pulsante mostra "Salvato".
     */
    function checkGratitudeLock() {
        const today = getLocalDateString();
        if (state.gratitudeEntries[today]) {
            gratitudeInputs.forEach(input => {
                input.value = state.gratitudeEntries[today][Array.from(gratitudeInputs).indexOf(input)] || '';
                input.disabled = true;
            });
            gratitudeBtn.disabled = true;
            gratitudeBtn.textContent = "Salvato";
        } else {
             gratitudeInputs.forEach(input => {
                input.value = '';
                input.disabled = false;
            });
            gratitudeBtn.disabled = false;
            gratitudeBtn.innerHTML = `<i class="fas fa-book"></i> Salva nel Diario`;
        }
    }

    function checkSleepLock() {
        const today = getLocalDateString();
        if (state.sleepEntries[today]) {
            sleepSlider.disabled = true;
            saveSleepBtn.disabled = true;
            saveSleepBtn.textContent = "Salvato";
        } else {
            sleepSlider.disabled = false;
            saveSleepBtn.disabled = false;
            saveSleepBtn.textContent = "Salva";
        }
    }

    function updateMoodStatusMessage() {
        const now = new Date();
        const currentTime = now.getHours() + now.getMinutes()/100;
        const today = getLocalDateString();
        const moodStatus = document.querySelector('.mood-status');
        if (!moodStatus) return;

        const currentWindow = state.timeWindows.find(w => currentTime >= w.start && currentTime <= w.end);
        const hasLoggedInCurrentWindow = state.moodEntries[today]?.some(e => e.window === currentWindow?.id);

        if (hasLoggedInCurrentWindow) {
            moodStatus.style.display = 'none';
            return;
        }

        moodStatus.style.display = 'block';
        if (currentWindow) {
            moodStatus.innerHTML = `È ora per il tuo check-in della ${currentWindow.name.toLowerCase()}!`;
        } else {
            moodStatus.innerHTML = `I check-in sono disponibili dalle 7:00 alle 23:59`;
        }
    }

    function updateStreakCounter() {
        streakCounter.textContent = state.growthStreak;
    }

    function updateTheme() {
        if (state.darkTheme) {
            document.body.classList.add('dark-theme');
            if (themeToggleInput) themeToggleInput.checked = true;
        } else {
            document.body.classList.remove('dark-theme');
            if (themeToggleInput) themeToggleInput.checked = false;
        }
    }

    function updatePremiumLocks() {
        premiumLocks.forEach(lock => {
            lock.style.display = state.isPremium ? 'none' : 'flex';
        });
    }

    function getLocalDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function checkDateAndReload() {
        if (document.visibilityState === 'visible') {
            const today = getLocalDateString();
            if (today !== state.loadedDate) {
                window.location.reload();
            }
        }
    }
    document.addEventListener('visibilitychange', checkDateAndReload);

    /**
     * NUOVA MODIFICA: Funzioni per gestire lo stato di caricamento dei pulsanti.
     */
    function showButtonLoading(button) {
        if (!button) return;
        button.dataset.originalContent = button.innerHTML;
        button.innerHTML = '<div class="btn-loading-spinner"></div>';
        button.disabled = true;
    }

    function hideButtonLoading(button) {
        if (!button || !button.dataset.originalContent) return;
        button.innerHTML = button.dataset.originalContent;
        button.disabled = false;
    }

    function initAuthLogic() {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registrationView.style.display = 'none';
            loginView.style.display = 'block';
        });

        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            registrationView.style.display = 'block';
        });

        let passwordValidity = { length: false, number: false, special: false };
        passwordInput.addEventListener('input', () => {
            const value = passwordInput.value;
            passwordValidity.length = value.length >= 8;
            lengthCheck.classList.toggle('valid', passwordValidity.length);
            passwordValidity.number = /\d/.test(value);
            numberCheck.classList.toggle('valid', passwordValidity.number);
            passwordValidity.special = /[!@#$%^&*(),.?":{}|<>]/.test(value);
            specialCheck.classList.toggle('valid', passwordValidity.special);
        });

        function isPasswordValid() {
            return passwordValidity.length && passwordValidity.number && passwordValidity.special;
        }

        termsCheckboxRegister.addEventListener('change', function() {
            registerBtn.disabled = !this.checked;
        });

        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isPasswordValid()) {
                showToast("La password non rispetta i criteri di sicurezza.");
                return;
            }

            // NUOVA MODIFICA: Aggiunto stato di caricamento
            const button = e.submitter;
            showButtonLoading(button);

            setTimeout(() => {
                hideButtonLoading(button);
                state.isLoggedIn = true;
                state.termsAcceptedAt = new Date().toISOString();
                saveData();
                enterMainApp(true);
            }, 1500);
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // NUOVA MODIFICA: Aggiunto stato di caricamento
            const button = e.submitter;
            showButtonLoading(button);

            setTimeout(() => {
                hideButtonLoading(button);
                state.isLoggedIn = true;
                saveData();
                enterMainApp(false);
            }, 1500);
        });

        if (termsLinkRegister) {
            termsLinkRegister.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Qui verrebbero mostrati i Termini e Condizioni.");
            });
        }
        if (privacyLinkRegister) {
            privacyLinkRegister.addEventListener('click', (e) => {
                e.preventDefault();
                alert("Qui verrebbe mostrata l'Informativa sulla Privacy.");
            });
        }
    }

    function enterMainApp(isNewUser = false) {
        authSection.style.opacity = '0';
        setTimeout(() => {
            authSection.style.display = 'none';
            mainAppContainer.style.display = 'block';

            window.scrollTo(0, 0);
            initUI();

            document.getElementById('home').classList.add('active');
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');

            if (isNewUser) {
                setTimeout(() => {
                    openModal(profileEditModal);
                }, 100);
            }
        }, 500);
    }

    function resetMeditationFilters() {
        meditationFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        const allFilterBtn = meditationFilters.querySelector('.filter-btn[data-filter="all"]');
        if (allFilterBtn) {
            allFilterBtn.classList.add('active');
            document.querySelectorAll('.meditation-item').forEach(item => {
                item.style.display = 'flex';
            });
        }
    }

    function resetWellbeingCheckinUI() {
        state.currentSelectedMood = null;
        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        anxietySlider.value = 5;
        anxietyValue.textContent = 5;
        stressSlider.value = 5;
        stressValue.textContent = 5;
    }

    navBar.addEventListener('click', function(e) {
        const targetItem = e.target.closest('.nav-item');
        if (!targetItem) return;

        e.preventDefault();
        const targetId = targetItem.dataset.target;

        const currentActive = navBar.querySelector('.nav-item.active').dataset.target;
        if (currentActive === 'meditations' && targetId !== 'meditations') {
            resetMeditationFilters();
        }

        navBar.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        targetItem.classList.add('active');

        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        // FIX: Forzato lo scroll immediato a (0,0) per risolvere il bug
        // per cui la pagina a volte non tornava in cima alla sezione.
        // L'uso di 'smooth' può essere interrotto da altri processi di rendering.
        window.scrollTo(0, 0);

        if (targetId === 'health') {
            resetWellbeingCheckinUI();
            initTimeBasedCheckin();
            updateMoodStatusMessage();
        }
    });

    moodTracker.addEventListener('click', function(e) {
        const targetButton = e.target.closest('.mood-btn');
        if (!targetButton) return;
        state.currentSelectedMood = targetButton.dataset.mood;
        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        targetButton.classList.add('selected');
    });

    function saveCombinedCheckin() {
        if (!state.isPremium) {
            showToast("Questa funzionalità richiede un abbonamento Premium");
            return;
        }
        if (!state.currentSelectedMood) {
            showToast("Per favore, seleziona un'emoji per il tuo umore");
            return;
        }

        const now = new Date();
        const currentTime = now.getHours() + now.getMinutes() / 100;
        const today = getLocalDateString();
        const currentWindow = state.timeWindows.find(w => currentTime >= w.start && currentTime <= w.end);

        if (!currentWindow) {
            showToast("Il check-in è disponibile solo dalle 7:00 alle 23:59");
            return;
        }

        if (!state.moodEntries[today]) state.moodEntries[today] = [];
        if (!state.anxietyEntries[today]) state.anxietyEntries[today] = [];
        if (!state.stressEntries[today]) state.stressEntries[today] = [];

        if (state.moodEntries[today].some(e => e.window === currentWindow.id)) {
            showToast(`Hai già effettuato il check-in per la ${currentWindow.name}`);
            return;
        }

        state.moodEntries[today].push({ mood: state.currentSelectedMood, window: currentWindow.id });
        state.anxietyEntries[today].push({ value: anxietySlider.value, window: currentWindow.id });
        state.stressEntries[today].push({ value: stressSlider.value, window: currentWindow.id });

        showToast(`Check-in della ${currentWindow.name} registrato!`);
        showButtonFeedback(saveCombinedCheckinBtn);
        updateDailyData();

        if (state.lastActivityDate !== today) updateStreak();

        state.currentSelectedMood = null;
        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        saveData();
    }

    saveCombinedCheckinBtn.addEventListener('click', saveCombinedCheckin);

    meditationList.addEventListener('click', function(e) {
        const targetItem = e.target.closest('.meditation-item');
        if (!targetItem) return;

        if (!state.isPremium) {
            showToast("Questa meditazione richiede un abbonamento Premium");
            return;
        }

        const id = targetItem.dataset.id;
        document.getElementById('player-title').textContent = targetItem.dataset.title;
        document.getElementById('player-description').textContent = `${targetItem.dataset.duration} di ${targetItem.querySelector('.meditation-desc').textContent}`;
        audioPlayer.src = meditationAudios[id];
        audioPlayer.pause();
        openModal(playerModal);
    });

    function updateStreak() {
        const todayStr = getLocalDateString();
        if (state.lastActivityDate !== todayStr) {
            const oldStreak = state.growthStreak;
            state.growthStreak++;
            state.lastActivityDate = todayStr;
            updateStreakCounter();
            checkForNewMedal(oldStreak, state.growthStreak);
        }
    }

    function openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    document.querySelectorAll('.player-modal, .history-modal, .profile-edit-modal, .login-modal, .medal-unlock-modal, .report-modal, .account-settings-modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
                if (modal.id === 'player-modal') audioPlayer.pause();
            }
        });
    });

    document.getElementById('player-close-btn').addEventListener('click', () => {
        closeModal(playerModal);
        audioPlayer.pause();
    });

    historyBtn.addEventListener('click', () => {
        state.currentCalendarDate = new Date();
        state.selectedHistoryDate = getLocalDateString(new Date());
        openModal(historyModal);
        generateCalendar();
    });

    historyCloseBtn.addEventListener('click', () => closeModal(historyModal));

    editProfileBtn.addEventListener('click', () => {
        document.getElementById('profile-name-input').value = state.profile.name;
        document.querySelectorAll('.emoji-option, .gender-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`.emoji-option[data-emoji="${state.profile.emoji}"]`)?.classList.add('selected');
        document.querySelector(`.gender-option[data-gender="${state.profile.gender}"]`)?.classList.add('selected');
        openModal(profileEditModal);
    });

    emojiPicker.addEventListener('click', function(e) {
        const targetOption = e.target.closest('.emoji-option');
        if (!targetOption) return;
        emojiPicker.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
        targetOption.classList.add('selected');
    });

    genderOptionsContainer.addEventListener('click', function(e) {
        const targetOption = e.target.closest('.gender-option');
        if (!targetOption) return;
        genderOptionsContainer.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));
        targetOption.classList.add('selected');
    });

    profileEditSave.addEventListener('click', () => {
        const newName = document.getElementById('profile-name-input').value.trim();
        const emoji = document.querySelector('.emoji-option.selected')?.dataset.emoji;
        const gender = document.querySelector('.gender-option.selected')?.dataset.gender;

        if (!newName || !emoji || !gender) {
            showToast("Per favore compila tutti i campi");
            return;
        }
        state.profile = { name: newName, emoji, gender };
        document.querySelector('.profile-name').textContent = newName;
        document.querySelector('.profile-emoji').textContent = emoji;
        updateWelcomeMessage();
        saveData();
        showButtonFeedback(profileEditSave);
        setTimeout(() => closeModal(profileEditModal), 1000);
        showToast("Profilo aggiornato!");
    });
    profileEditCancel.addEventListener('click', () => closeModal(profileEditModal));

    gratitudeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!state.isPremium) {
            showToast("Questa funzionalità richiede un abbonamento Premium");
            return;
        }
        const entries = Array.from(this.querySelectorAll('.gratitude-input')).map(i => i.value.trim());
        if (entries.some(e => e === '')) {
            showToast("Per favore compila tutti i campi");
            return;
        }
        state.gratitudeEntries[getLocalDateString()] = entries;
        showToast("Diario della gratitudine salvato!");
        showButtonFeedback(gratitudeBtn);
        saveData();
    });

    /**
     * NUOVA MODIFICA: La funzione ora accetta l'elemento `button` per mostrare
     * lo stato di caricamento durante l'elaborazione del pagamento.
     */
    function handleSubscription(plan, button) {
        showToast("Stiamo elaborando il tuo pagamento...");
        showButtonLoading(button);

        setTimeout(() => {
            hideButtonLoading(button);
            const isSuccess = true;
            if (isSuccess) {
                state.isPremium = true;
                saveData();
                updatePremiumLocks();
                showToast("Pagamento riuscito! Abbonamento Premium attivato.");
                initUI();
            } else {
                showToast("Pagamento non riuscito. Riprova.");
            }
        }, 3000);
    }

    function setupSubscriptionToggle() {
        yearlyToggle.addEventListener('click', () => {
            subscriptionToggle.classList.remove('monthly-active');
            yearlyToggle.classList.add('active');
            monthlyToggle.classList.remove('active');
            yearlyPlan.classList.add('active');
            monthlyPlan.classList.remove('active');
        });

        monthlyToggle.addEventListener('click', () => {
            subscriptionToggle.classList.add('monthly-active');
            monthlyToggle.classList.add('active');
            yearlyToggle.classList.remove('active');
            monthlyPlan.classList.add('active');
            yearlyPlan.classList.remove('active');
        });

        // NUOVA MODIFICA: Passa l'elemento del pulsante a handleSubscription
        if (monthlySubscribeBtn) monthlySubscribeBtn.addEventListener('click', (e) => handleSubscription("mensile", e.currentTarget));
        if (annualSubscribeBtn) annualSubscribeBtn.addEventListener('click', (e) => handleSubscription("annuale", e.currentTarget));
    }
    setupSubscriptionToggle();


    if (googleLoginBtn) googleLoginBtn.addEventListener('click', () => openModal(loginModal));
    if(loginCloseBtn) loginCloseBtn.addEventListener('click', () => closeModal(loginModal));

    document.getElementById('google-login').addEventListener('click', () => {
        showToast("Accesso con Google in corso...");
        setTimeout(() => {
            state.isLoggedIn = true;
            saveData();
            updateLoginState();
            closeModal(loginModal);
            showToast("Accesso effettuato con successo!");
        }, 1500);
    });

    logoutBtn.addEventListener('click', function() {
        showToast("Disconnessione in corso...");
        setTimeout(() => {
            localStorage.clear();
            window.location.reload();
        }, 1500);
    });

    accountSettingsBtn.addEventListener('click', () => openModal(accountSettingsModal));
    accountSettingsCloseBtn.addEventListener('click', () => closeModal(accountSettingsModal));

    manageSubscriptionBtn.addEventListener('click', () => {
        showToast("Reindirizzamento per la gestione dell'abbonamento...");
        window.open('https://dashboard.stripe.com/', '_blank');
    });

    termsBtn.addEventListener('click', () => alert("Qui verrebbero mostrati i Termini di Servizio."));
    privacyBtn.addEventListener('click', () => alert("Qui verrebbe mostrata la Privacy Policy."));

    deleteAccountBtn.addEventListener('click', function() {
        const isConfirmed = confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e cancellerà tutti i tuoi dati.");
        if (isConfirmed) {
            showToast("Il tuo account verrà eliminato...");
            setTimeout(() => {
                localStorage.clear();
                window.location.reload();
            }, 2000);
        }
    });

    if (themeToggleInput) {
        themeToggleInput.addEventListener('change', function() {
            state.darkTheme = this.checked;
            saveData();
            updateTheme();
        });
    }

    function getMoodName(mood) {
        const names = {'devastato': 'Devastato', 'stressato': 'Stressato', 'arrabbiato': 'Arrabbiato', 'triste': 'Triste', 'neutro': 'Neutro', 'calmo': 'Calmo', 'contento': 'Contento', 'felice': 'Felice', 'entusiasta': 'Entusiasta', 'amore': 'Amore'};
        return names[mood] || mood;
    }
    function getMoodEmoji(mood) {
        const emojis = {'devastato': '😭', 'stressato': '😩', 'arrabbiato': '😠', 'triste': '😔', 'neutro': '😐', 'calmo': '😌', 'contento': '🙂', 'felice': '😊', 'entusiasta': '😄', 'amore': '😍'};
        return emojis[mood] || '';
    }
    function getMoodValue(mood) {
        const values = {'devastato': 1, 'stressato': 2, 'arrabbiato': 3, 'triste': 4, 'neutro': 5, 'calmo': 6, 'contento': 7, 'felice': 8, 'entusiasta': 9, 'amore': 10};
        return values[mood] || 5;
    }
    function showToast(message) {
        toast.innerHTML = `<span>🌸</span> ${message}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- INIZIO SEZIONE DI REFACTORING: STORICO E REPORT ---

    /**
     * NUOVA MODIFICA: Riscrittura della logica di visualizzazione dello storico.
     * Questa funzione ora costruisce gli elementi del DOM programmaticamente (`createElement`)
     * invece di usare `innerHTML`. Questo approccio è più sicuro, performante e manutenibile.
     * @param {Date} date - La data per cui visualizzare lo storico.
     */
    function updateHistoryDisplay(date) {
        const selectedDate = getLocalDateString(date);
        state.selectedHistoryDate = selectedDate;
        saveData(); // Salva la data selezionata per persistere la scelta

        // Funzione helper per creare un messaggio di "Nessun dato"
        const createNoDataMessage = () => {
            const p = document.createElement('p');
            p.textContent = 'Nessun dato';
            p.style.textAlign = 'center';
            p.style.padding = '10px';
            p.style.color = 'var(--text-light)';
            return p;
        };

        // --- Aggiorna Check-in Benessere ---
        moodHistoryContainer.innerHTML = ''; // Pulisce il contenitore
        const moodEntries = state.moodEntries[selectedDate] || [];
        const anxietyEntries = state.anxietyEntries[selectedDate] || [];
        const stressEntries = state.stressEntries[selectedDate] || [];

        if (moodEntries.length > 0) {
            state.timeWindows.forEach(window => {
                const moodEntry = moodEntries.find(e => e.window === window.id);
                if (moodEntry) {
                    const anxietyEntry = anxietyEntries.find(e => e.window === window.id);
                    const stressEntry = stressEntries.find(e => e.window === window.id);

                    const item = document.createElement('div');
                    item.className = 'mood-history-item';

                    const emoji = document.createElement('div');
                    emoji.className = 'mood-history-emoji';
                    emoji.textContent = getMoodEmoji(moodEntry.mood);

                    const details = document.createElement('div');
                    details.className = 'mood-history-details';
                    const moodName = document.createElement('div');
                    moodName.className = 'mood-history-mood-name';
                    moodName.textContent = getMoodName(moodEntry.mood);
                    const windowName = document.createElement('div');
                    windowName.className = 'mood-history-window';
                    windowName.textContent = window.name;
                    details.append(moodName, windowName);

                    const stats = document.createElement('div');
                    stats.className = 'mood-history-stats';
                    const anxietyStat = document.createElement('div');
                    anxietyStat.className = 'mood-history-stat';
                    anxietyStat.innerHTML = `<div class="stat-label-history">Ansia</div><div class="stat-value-history">${anxietyEntry ? anxietyEntry.value : '-'}</div>`;
                    const stressStat = document.createElement('div');
                    stressStat.className = 'mood-history-stat';
                    stressStat.innerHTML = `<div class="stat-label-history">Stress</div><div class="stat-value-history">${stressEntry ? stressEntry.value : '-'}</div>`;
                    stats.append(anxietyStat, stressStat);

                    item.append(emoji, details, stats);
                    moodHistoryContainer.appendChild(item);
                }
            });
        } else {
            moodHistoryContainer.appendChild(createNoDataMessage());
        }

        // --- Aggiorna Diario della Gratitudine ---
        gratitudeHistoryContainer.innerHTML = '';
        const gratitudeEntries = state.gratitudeEntries[selectedDate] || [];
        if (gratitudeEntries.length > 0) {
            const ol = document.createElement('ol');
            ol.style.paddingLeft = '20px';
            ol.style.marginTop = '10px';
            gratitudeEntries.forEach(entry => {
                const li = document.createElement('li');
                li.textContent = entry;
                li.style.marginBottom = '8px';
                ol.appendChild(li);
            });
            gratitudeHistoryContainer.appendChild(ol);
        } else {
            gratitudeHistoryContainer.appendChild(createNoDataMessage());
        }

        // --- Aggiorna Obiettivo Giornaliero ---
        goalHistoryContainer.innerHTML = '';
        const dailyGoal = state.dailyGoals[selectedDate] || null;
        if (dailyGoal) {
            const item = document.createElement('div');
            item.className = 'goal-history-item';
            const icon = document.createElement('div');
            icon.className = `goal-history-icon ${dailyGoal.completed ? 'completed' : 'not-completed'}`;
            icon.textContent = dailyGoal.completed ? '✓' : '✗';

            const textContainer = document.createElement('div');
            const text = document.createElement('div');
            text.style.fontWeight = dailyGoal.completed ? 'normal' : 'bold';
            text.textContent = dailyGoal.text;
            const status = document.createElement('div');
            status.style.fontSize = '0.85rem';
            status.style.color = 'var(--text-light)';
            status.textContent = dailyGoal.completed ? '🎯 Completato' : '🎯 Non completato';
            textContainer.append(text, status);

            item.append(icon, textContainer);
            goalHistoryContainer.appendChild(item);
        } else {
            goalHistoryContainer.appendChild(createNoDataMessage());
        }
    }

    /**
     * NUOVA MODIFICA: Riscrittura della logica di generazione del calendario.
     * La funzione è stata ottimizzata per essere più chiara e performante,
     * utilizzando un DocumentFragment per minimizzare le manipolazioni del DOM.
     */
    function generateCalendar() {
        if (!calendarMonth || !document.getElementById('calendar')) return;

        const calendar = document.getElementById('calendar');
        const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        const currentDate = state.currentCalendarDate;

        calendarMonth.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        calendar.innerHTML = '';

        const fragment = document.createDocumentFragment();

        // Aggiunge le intestazioni dei giorni della settimana
        daysOfWeek.forEach(day => {
            const headerEl = document.createElement('div');
            headerEl.className = 'calendar-header';
            headerEl.textContent = day;
            fragment.appendChild(headerEl);
        });

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const todayStr = getLocalDateString(new Date());

        // Aggiunge celle vuote per i giorni prima dell'inizio del mese
        for (let i = 0; i < firstDayOfMonth; i++) {
            fragment.appendChild(document.createElement('div'));
        }

        // Aggiunge i giorni del mese
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dayString = getLocalDateString(dayDate);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            dayElement.dataset.date = dayString;

            const classes = [];
            if (state.moodEntries[dayString] || state.gratitudeEntries[dayString] || state.dailyGoals[dayString]) classes.push('has-data');
            if (dayString === todayStr) classes.push('active');
            if (dayString === state.selectedHistoryDate) classes.push('selected');
            if (classes.length > 0) dayElement.classList.add(...classes);

            dayElement.addEventListener('click', function() {
                calendar.querySelector('.calendar-day.selected')?.classList.remove('selected');
                this.classList.add('selected');
                state.selectedHistoryDate = dayString;
                updateHistoryDisplay(dayDate);
            });
            fragment.appendChild(dayElement);
        }

        calendar.appendChild(fragment);
        updateHistoryDisplay(new Date(state.selectedHistoryDate + 'T00:00:00'));
    }

    /**
     * NUOVA MODIFICA: Logica uniformata per i pulsanti della sezione Salute.
     * Se un check-in è già stato fatto, il pulsante mostrerà "Salvato".
     */
    function initTimeBasedCheckin() {
        const now = new Date();
        const currentTime = now.getHours() + now.getMinutes()/100;
        const today = getLocalDateString();
        const moodButtons = moodTracker.querySelectorAll('.mood-btn');
        const currentWindow = state.timeWindows.find(w => currentTime >= w.start && currentTime <= w.end);

        let isDisabled = true;
        let buttonText = "Salva Check-in";
        if (currentWindow) {
            const hasLoggedIn = state.moodEntries[today]?.some(e => e.window === currentWindow.id);
            if (!hasLoggedIn) {
                isDisabled = false;
            } else {
                buttonText = "Salvato";
            }
        }

        moodButtons.forEach(btn => btn.disabled = isDisabled);
        anxietySlider.disabled = isDisabled;
        stressSlider.disabled = isDisabled;
        saveCombinedCheckinBtn.disabled = isDisabled;
        saveCombinedCheckinBtn.textContent = buttonText;
    }

    setInterval(() => {
        if (state.isLoggedIn && document.querySelector('#health.section.active')) {
            initTimeBasedCheckin();
            updateMoodStatusMessage();
        }
    }, 60000);

    meditationFilters.addEventListener('click', function(e) {
        const targetButton = e.target.closest('.filter-btn');
        if (!targetButton) return;
        const filter = targetButton.dataset.filter;
        meditationFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        targetButton.classList.add('active');
        document.querySelectorAll('.meditation-item').forEach(item => {
            item.style.display = (filter === 'all' || item.dataset.tags.includes(filter)) ? 'flex' : 'none';
        });
    });

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        generateCalendar();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
        generateCalendar();
    });

    anxietySlider.addEventListener('input', function() { anxietyValue.textContent = this.value; });
    stressSlider.addEventListener('input', function() { stressValue.textContent = this.value; });
    sleepSlider.addEventListener('input', function() { sleepValue.textContent = this.value; });

    saveSleepBtn.addEventListener('click', () => {
        if (!state.isPremium) { showToast("Funzionalità Premium richiesta"); return; }
        const today = getLocalDateString();
        if (state.sleepEntries[today]) { showToast("Hai già registrato il sonno oggi"); return; }
        state.sleepEntries[today] = sleepSlider.value;
        saveData();
        showToast("Sonno registrato: " + sleepSlider.value);
        showButtonFeedback(saveSleepBtn);
        updateDailyData();
    });

    generateReportBtn.addEventListener('click', () => {
        generateWeeklyReport();
        openModal(reportModal);
    });
    reportCloseBtn.addEventListener('click', () => closeModal(reportModal));

    /**
     * NUOVA MODIFICA: Riscrittura completa della generazione del report settimanale.
     * La funzione calcola i dati come prima, ma ora costruisce l'HTML del report
     * in modo strutturato e programmatico, migliorando la robustezza e la leggibilità.
     */
    function generateWeeklyReport() {
        const today = new Date();
        let moodSum = 0, moodCount = 0, anxietySum = 0, anxietyCount = 0, stressSum = 0, stressCount = 0;
        let sleepSum = 0, sleepCount = 0, gratitudeCount = 0, goalCompletionCount = 0;
        const moodData = [], anxietyData = [], stressData = [], sleepData = [], dates = [];
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        // Raccoglie i dati degli ultimi 7 giorni
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            dates.push(daysOfWeek[date.getDay()]);

            if (state.moodEntries[dateStr]?.length > 0) {
                const avgMood = state.moodEntries[dateStr].map(e => getMoodValue(e.mood)).reduce((a, b) => a + b, 0) / state.moodEntries[dateStr].length;
                moodSum += avgMood; moodCount++; moodData.push(avgMood);
            } else { moodData.push(null); }
            if (state.anxietyEntries[dateStr]?.length > 0) {
                const avgAnxiety = state.anxietyEntries[dateStr].map(e => parseInt(e.value)).reduce((a,b) => a+b, 0) / state.anxietyEntries[dateStr].length;
                anxietySum += avgAnxiety; anxietyCount++; anxietyData.push(avgAnxiety);
            } else { anxietyData.push(null); }
            if (state.stressEntries[dateStr]?.length > 0) {
                const avgStress = state.stressEntries[dateStr].map(e => parseInt(e.value)).reduce((a,b) => a+b, 0) / state.stressEntries[dateStr].length;
                stressSum += avgStress; stressCount++; stressData.push(avgStress);
            } else { stressData.push(null); }
            if (state.sleepEntries[dateStr]) {
                const sleepVal = parseInt(state.sleepEntries[dateStr]);
                sleepSum += sleepVal; sleepCount++; sleepData.push(sleepVal);
            } else { sleepData.push(null); }
            if (state.gratitudeEntries[dateStr]) gratitudeCount++;
            if (state.dailyGoals[dateStr]?.completed) goalCompletionCount++;
        }

        const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : 'N/D';
        const avgAnxiety = anxietyCount > 0 ? (anxietySum / anxietyCount).toFixed(1) : 'N/D';
        const avgStress = stressCount > 0 ? (stressSum / stressCount).toFixed(1) : 'N/D';
        const avgSleep = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : 'N/D';

        reportContent.innerHTML = ''; // Pulisce il contenitore del report

        // Crea dinamicamente gli elementi del report
        const fragment = document.createDocumentFragment();

        // Header
        const header = document.createElement('div');
        header.className = 'report-header';
        const title = document.createElement('h2');
        title.className = 'report-title';
        title.textContent = 'Resoconto Settimanale';
        header.appendChild(title);
        fragment.appendChild(header);

        // Griglia delle statistiche
        const statsGrid = document.createElement('div');
        statsGrid.className = 'report-stats';
        const statsData = [
            { label: 'Umore', value: avgMood }, { label: 'Ansia', value: avgAnxiety },
            { label: 'Stress', value: avgStress }, { label: 'Sonno', value: avgSleep },
            { label: 'Gratitudini', value: gratitudeCount }, { label: 'Obiettivi', value: `${goalCompletionCount}/7` }
        ];
        statsData.forEach(stat => {
            const statEl = document.createElement('div');
            statEl.className = 'report-stat';
            statEl.innerHTML = `<div class="stat-value">${stat.value}</div><div class="stat-label">${stat.label}</div>`;
            statsGrid.appendChild(statEl);
        });
        fragment.appendChild(statsGrid);

        // Area del grafico
        const chartArea = document.createElement('div');
        chartArea.className = 'report-chart-area';
        const reportChart = document.createElement('div');
        reportChart.className = 'report-chart';
        const chartGroup = document.createElement('div');
        chartGroup.className = 'chart-group';

        dates.forEach((date, index) => {
            const dayGroup = document.createElement('div');
            dayGroup.className = 'chart-day-group';
            const bars = document.createElement('div');
            bars.className = 'chart-bars';

            const moodBar = document.createElement('div');
            moodBar.className = 'chart-bar mood-bar';
            moodBar.style.height = moodData[index] ? `${(moodData[index] / 10) * 100}%` : '0%';
            moodBar.title = `Umore: ${moodData[index] ? moodData[index].toFixed(1) : 'N/D'}`;

            const anxietyBar = document.createElement('div');
            anxietyBar.className = 'chart-bar anxiety-bar';
            anxietyBar.style.height = anxietyData[index] ? `${(anxietyData[index] / 10) * 100}%` : '0%';
            anxietyBar.title = `Ansia: ${anxietyData[index] ? anxietyData[index].toFixed(1) : 'N/D'}`;

            const stressBar = document.createElement('div');
            stressBar.className = 'chart-bar stress-bar';
            stressBar.style.height = stressData[index] ? `${(stressData[index] / 10) * 100}%` : '0%';
            stressBar.title = `Stress: ${stressData[index] ? stressData[index].toFixed(1) : 'N/D'}`;

            const sleepBar = document.createElement('div');
            sleepBar.className = 'chart-bar sleep-bar';
            sleepBar.style.height = sleepData[index] ? `${(sleepData[index] / 10) * 100}%` : '0%';
            sleepBar.title = `Sonno: ${sleepData[index] || 'N/D'}`;

            bars.append(moodBar, anxietyBar, stressBar, sleepBar);

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = date;

            dayGroup.append(bars, label);
            chartGroup.appendChild(dayGroup);
        });
        reportChart.appendChild(chartGroup);
        chartArea.appendChild(reportChart);
        fragment.appendChild(chartArea);

        // Legenda del grafico
        const legend = document.createElement('div');
        legend.className = 'chart-legend';
        const legendItems = [
            { label: 'Umore', color: 'var(--primary)' }, { label: 'Ansia', color: '#EF5350' },
            { label: 'Stress', color: '#FFB74D' }, { label: 'Sonno', color: 'var(--calm-1)' }
        ];
        legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `<div class="legend-color" style="background: ${item.color};"></div>${item.label}`;
            legend.appendChild(legendItem);
        });
        fragment.appendChild(legend);

        reportContent.appendChild(fragment);
    }

    // --- FINE SEZIONE DI REFACTORING ---

    downloadReportBtn.addEventListener('click', () => {
        html2canvas(reportContent).then(canvas => {
            const link = document.createElement('a');
            link.download = 'resoconto-settimanale.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    shareReportBtn.addEventListener('click', () => {
        if (navigator.share) {
            html2canvas(reportContent).then(canvas => {
                canvas.toBlob(blob => {
                    const file = new File([blob], 'resoconto.png', { type: 'image/png' });
                    navigator.share({ title: 'Il mio resoconto', files: [file] }).catch(console.error);
                });
            });
        } else {
            showToast("Condivisione non supportata");
        }
    });

    premiumLockBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.target)?.scrollIntoView({behavior: 'smooth'});
        });
    });

    setIntentionBtn.addEventListener('click', setDailyIntention);

    function avviaCoriandoliPersonalizzati() {
        const numeroCoriandoli = 60;
        const forme = ['🍃', '💧', '✨'];
        for (let i = 0; i < numeroCoriandoli; i++) {
            const coriandolo = document.createElement('span');
            coriandolo.classList.add('coriandolo');
            coriandolo.innerHTML = forme[Math.floor(Math.random() * forme.length)];
            coriandolo.style.left = `${Math.random() * 100}vw`;
            coriandolo.style.fontSize = `${Math.random() * 1 + 1}rem`;
            coriandolo.style.animationDuration = `${Math.random() * 1.5 + 2.5}s`;
            coriandolo.style.animationDelay = `${Math.random() * 0.5}s`;
            coriandolo.style.setProperty('--oscillazione', `${(Math.random() - 0.5) * 250}px`);
            document.body.appendChild(coriandolo);
            coriandolo.addEventListener('animationend', () => {
                coriandolo.remove();
            }, { once: true });
        }
    }

    function renderMedals() {
        if (!medalsContainer) return;
        medalsContainer.innerHTML = '';
        medalTiers.forEach(tier => {
            const isUnlocked = state.growthStreak >= tier.days;
            const medalEl = document.createElement('div');
            medalEl.className = `medal ${isUnlocked ? 'unlocked' : ''}`;
            medalEl.title = `${tier.name} - Sbloccato a ${tier.days} giorni`;
            medalEl.innerHTML = `<div class="medal-icon-wrapper"><i class="${tier.icon}"></i></div><div class="medal-name">${tier.name}</div>`;
            medalsContainer.appendChild(medalEl);
        });
    }

    function showMedalUnlockPopup(medal) {
        document.getElementById('medal-unlock-icon').innerHTML = `<i class="${medal.icon}"></i>`;
        document.getElementById('medal-unlock-title').textContent = medal.name;
        openModal(medalUnlockModal);
    }

    function checkForNewMedal(oldStreak, newStreak) {
        const newlyUnlockedMedal = medalTiers.find(tier => oldStreak < tier.days && newStreak >= tier.days);
        if (newlyUnlockedMedal) {
            showMedalUnlockPopup(newlyUnlockedMedal);
            renderMedals();
        }
    }

    if (medalUnlockCloseBtn) {
        medalUnlockCloseBtn.addEventListener('click', () => closeModal(medalUnlockModal));
    }

    /**
     * --- NUOVA MODIFICA (FIX) ---
     * Questa funzione è stata centralizzata per gestire il feedback visivo di tutti i pulsanti di salvataggio.
     * 1. Mostra un'animazione con spunta e sfondo verde.
     * 2. Dopo un timeout, rimuove lo stato di feedback.
     * 3. Chiama la funzione appropriata (es. checkGratitudeLock) per impostare lo stato finale del pulsante
     * (es. disabilitato con testo "Completato").
     * Questo risolve il bug per cui lo stato finale veniva sovrascritto prematuramente.
     */
    function showButtonFeedback(button, iconClass = 'fa-check', duration = 1500) {
        if (!button || button.disabled) return;

        const originalContent = button.innerHTML;
        button.disabled = true;
        button.innerHTML = `<i class="fas ${iconClass}"></i>`;
        button.classList.add('btn-success-feedback');

        setTimeout(() => {
            button.classList.remove('btn-success-feedback');

            // In base all'ID del pulsante, chiama la funzione di aggiornamento UI corretta
            // per impostare lo stato finale (es. disabilitato e con testo aggiornato).
            if (button.id === 'gratitude-btn') {
                checkGratitudeLock();
            } else if (button.id === 'save-sleep-btn') {
                checkSleepLock();
            } else if (button.id === 'save-combined-checkin-btn') {
                initTimeBasedCheckin();
                updateMoodStatusMessage();
            } else {
                // Comportamento di default per pulsanti con feedback temporaneo (es. Modifica Profilo)
                button.innerHTML = originalContent;
                button.disabled = false;
            }
        }, duration);
    }

    function main() {
        loadSavedData();
        if (state.isLoggedIn) {
            authSection.style.display = 'none';
            mainAppContainer.style.display = 'block';
            window.scrollTo(0, 0);
            initUI();
            document.getElementById('home').classList.add('active');
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');
        } else {
            authSection.style.display = 'flex';
            authSection.classList.add('active');
            mainAppContainer.style.display = 'none';
            initAuthLogic();
        }
    }

    main();
});
