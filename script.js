/**
 * File: script.js
 * --- NOTE SULLE ULTIME MODIFICHE ---
 * MODIFICA: Aggiunto l'audio per la nuova meditazione "Lasciare andare" (ID 23).
 * MODIFICA: Riscritto il rendering HTML dello storico ('updateHistoryDisplay') per implementare il nuovo design più pulito e integrato.
 * MODIFICA: Unificato il check-in di umore, ansia e stress in un unico banner.
 * MODIFICA: Aggiornata la struttura dati per 'anxietyEntries' e 'stressEntries' per supportare registrazioni multiple giornaliere.
 * MODIFICA: Rifattorizzata la logica di salvataggio in una nuova funzione 'saveCombinedCheckin'.
 * MODIFICA: Assicurato il corretto reset dei check-in dopo la mezzanotte.
 * MODIFICA: Aggiunta logica per il refresh automatico dei contenuti giornalieri.
 * MODIFICA: Il messaggio di check-in umore scompare dopo la registrazione.
 * MODIFICA: Gli obiettivi nel report settimanale sono mostrati come "X/7".
 * MODIFICA: Aggiunto un nuovo modale per accorpare le impostazioni dell'account.
 * MODIFICA: Aggiunte linee guida e scala numerica al grafico del report.
 * --- NUOVE MODIFICHE IMPLEMENTATE ---
 * MODIFICA: Rimossa la generazione dell'asse Y e delle linee della griglia nella funzione `generateWeeklyReport` per un grafico più pulito.
 * MODIFICA: Rimosso lo slide "Percorsi di Crescita" dall'onboarding e aggiornata la logica di navigazione.
 * MODIFICA: Implementata la logica di caricamento con window.onload e durata minima garantita.
 * --- MODIFICHE PER RIMOZIONE ONBOARDING E NUOVA PAGINA AUTH ---
 * MODIFICA: Rimossa la funzione `initOnboarding` e la relativa logica a slide.
 * MODIFICA: Creata la nuova funzione `initAuthLogic` per gestire i form di login/registrazione.
 * MODIFICA: La logica di avvio ora controlla `isLoggedIn`. Se l'utente non è loggato, mostra la sezione `#auth-section`.
 * MODIFICA: Creata la funzione `enterMainApp` per gestire la transizione dalla pagina di auth all'app principale dopo il login/registrazione.
 * MODIFICA: Il modale di modifica profilo si apre automaticamente solo per i nuovi utenti dopo la registrazione.
 * --- ULTIME MODIFICHE ---
 * MODIFICA: Aggiunto `history.scrollRestoration` per prevenire il ripristino dello scroll al refresh della pagina.
 * MODIFICA: Aggiunto `window.scrollTo(0, 0)` per assicurare che l'app venga sempre visualizzata dall'inizio.
 * --- MODIFICHE FINALI ---
 * MODIFICA: Creata la funzione `animateButtonSuccess` per fornire un feedback visivo (icona di spunta ✓) quando un'azione di salvataggio ha successo.
 * MODIFICA: Integrata la funzione `animateButtonSuccess` in tutte le principali azioni di salvataggio (profilo, obiettivi, intenzioni, check-in, etc.) per migliorare l'UX.
 * MODIFICA: Ritardata la chiusura dei modali o il re-rendering degli elementi dopo il salvataggio per consentire all'utente di vedere l'animazione del pulsante.
 */
document.addEventListener('DOMContentLoaded', function() {
    // MODIFICA: Disabilita il ripristino automatico della posizione di scroll del browser.
    // Questo risolve il problema della pagina che non parte dall'alto al refresh.
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
            { image: "daily1.jpg", quote: "🌱 La pace viene da dentro. Non cercarla fuori. - Buddha" },
            { image: "daily2.jpg", quote: "⏳ Il momento presente è l'unico momento disponibile. - Thich Nhat Hanh" },
            { image: "daily3.jpg", quote: "💨 Respira. Lascia andare. E ricorda che questo momento è l'unico che sai per certo di avere. - Oprah Winfrey" },
            { image: "daily4.jpg", quote: "🧘‍♀️ La meditazione non è fuga dalla realtà. È un incontro sereno con la realtà. - Thich Nhat Hanh" },
            { image: "daily5.jpg", quote: "🌿 La natura non ha fretta, eppure tutto si realizza. - Lao Tzu" },
            { image: "daily6.jpg", quote: "💫 Ogni giorno è una nuova opportunità per cambiare la tua vita. - Anonimo" },
            { image: "daily7.jpg", quote: "🌅 Il sole sorge ogni mattina senza fallire. Sii come il sole. - Anonimo" },
            { image: "daily8.jpg", quote: "🍃 Lascia andare ciò che non puoi controllare. - Anonimo" },
            { image: "daily9.jpg", quote: "🌊 Sii come l'acqua: adattati, fluttua e scorri. - Bruce Lee" },
            { image: "daily10.jpg", quote: "🌸 Ogni fiore sboccia nel suo tempo. Rispetta il tuo ritmo. - Anonimo" }
        ],
        termsAcceptedAt: null,
        loadedDate: null
    };

    // Percorsi dei file audio
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

    // Carica i dati salvati da localStorage
    function loadSavedData() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
            state.profile = JSON.parse(savedProfile);
        }

        const savedMoodEntries = localStorage.getItem('moodEntries');
        if (savedMoodEntries) {
            state.moodEntries = JSON.parse(savedMoodEntries);
        }

        const savedGratitudeEntries = localStorage.getItem('gratitudeEntries');
        if (savedGratitudeEntries) {
            state.gratitudeEntries = JSON.parse(savedGratitudeEntries);
        }

        const savedAnxietyEntries = localStorage.getItem('anxietyEntries');
        if (savedAnxietyEntries) {
            state.anxietyEntries = JSON.parse(savedAnxietyEntries);
        }

        const savedStressEntries = localStorage.getItem('stressEntries');
        if (savedStressEntries) {
            state.stressEntries = JSON.parse(savedStressEntries);
        }

        const savedSleepEntries = localStorage.getItem('sleepEntries');
        if (savedSleepEntries) {
            state.sleepEntries = JSON.parse(savedSleepEntries);
        }

        const savedReminders = localStorage.getItem('reminders');
        if (savedReminders) {
            state.reminders = JSON.parse(savedReminders);
        }

        const savedDailyGoals = localStorage.getItem('dailyGoals');
        if (savedDailyGoals) {
            state.dailyGoals = JSON.parse(savedDailyGoals);
        }

        const savedDailyIntentions = localStorage.getItem('dailyIntentions');
        if (savedDailyIntentions) {
            state.dailyIntentions = JSON.parse(savedDailyIntentions);
        }

        const savedPremium = localStorage.getItem('isPremium');
        if (savedPremium) {
            state.isPremium = JSON.parse(savedPremium);
        }

        const savedReferralCode = localStorage.getItem('referralCode');
        if (savedReferralCode) {
            state.referralCode = savedReferralCode;
        }

        const savedLogin = localStorage.getItem('isLoggedIn');
        if (savedLogin) {
            state.isLoggedIn = JSON.parse(savedLogin);
        }

        const savedDarkTheme = localStorage.getItem('darkTheme');
        if (savedDarkTheme) {
            state.darkTheme = JSON.parse(savedDarkTheme);
        }

        const savedStreak = localStorage.getItem('growthStreak');
        if (savedStreak) {
            state.growthStreak = JSON.parse(savedStreak);
        }

        const savedLastActivity = localStorage.getItem('lastActivityDate');
        if (savedLastActivity) {
            state.lastActivityDate = savedLastActivity;
        }

        const savedDownloads = localStorage.getItem('downloadedMeditations');
        if (savedDownloads) {
            state.downloadedMeditations = JSON.parse(savedDownloads);
        }

        const savedMeditationHistory = localStorage.getItem('meditationHistory');
        if (savedMeditationHistory) {
            state.meditationHistory = JSON.parse(savedMeditationHistory);
        }

        const savedLastAccess = localStorage.getItem('lastAccessDate');
        if (savedLastAccess) {
            state.lastAccessDate = savedLastAccess;
        }

        const savedStreakUpdated = localStorage.getItem('streakUpdatedToday');
        if (savedStreakUpdated) {
            state.streakUpdatedToday = JSON.parse(savedStreakUpdated);
        }

        const savedDailyContent = localStorage.getItem('dailyContent');
        if (savedDailyContent) {
            const content = JSON.parse(savedDailyContent);
            if (content.date === getLocalDateString()) {
                state.dailyContent = content;
            }
        }

        const savedSelectedDate = localStorage.getItem('selectedHistoryDate');
        if (savedSelectedDate) {
            state.selectedHistoryDate = savedSelectedDate;
        }
    }

    // Salva dati in localStorage
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
            case "M":
                welcomeText = "Bentornato!";
                break;
            case "F":
                welcomeText = "Bentornata!";
                break;
            case "N":
                welcomeText = "Bentornatə!";
                break;
            default:
                welcomeText = "Bentornato/a!";
        }

        document.getElementById('welcome-header').innerHTML = `${welcomeText} ${state.profile.emoji || '😊'}`;

        const welcomeElement = document.querySelector('.profile-welcome');
        let welcomeProfileText = "";

        switch(state.profile.gender) {
            case "M":
                welcomeProfileText = "Benvenuto nella tua area personale";
                break;
            case "F":
                welcomeProfileText = "Benvenuta nella tua area personale";
                break;
            case "N":
                welcomeProfileText = "Benvenutə nella tua area personale";
                break;
            default:
                welcomeProfileText = "Benvenuto/a nella tua area personale";
        }

        if (welcomeElement) {
            welcomeElement.textContent = welcomeProfileText;
        }
    }

    // Initialize UI
    function initUI() {
        state.loadedDate = getLocalDateString();

        document.querySelector('.profile-name').textContent = state.profile.name;
        document.querySelector('.profile-emoji').textContent = state.profile.emoji;
        updateWelcomeMessage();
        renderDailyGoal();
        renderDailyIntention();
        updateTheme();
        updatePremiumLocks();
        updateDailyData();

        if (state.isPremium) {
            premiumCard.style.display = 'none';
        } else {
            premiumCard.style.display = 'block';
        }

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
        updateLoginState();
    }

    function updateLoginState() {
        if (state.isLoggedIn) {
            logoutBtn.style.display = 'flex';
        } else {
            logoutBtn.style.display = 'none';
        }
    }

    function renderDailyGoal() {
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
            <div class="goal-item">
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

    function renderDailyIntention() {
        const today = getLocalDateString();
        const todayIntention = state.dailyIntentions[today];

        if (!todayIntention) {
            intentionText.textContent = "Crea la tua intenzione per guidare la giornata";
            intentionInput.style.display = "block";
            setIntentionBtn.style.display = "block";
            setIntentionBtn.innerHTML = '<i class="fas fa-feather"></i> Imposta Intenzione';
            return;
        }

        intentionText.textContent = `"${todayIntention.text}"`;
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

        const setGoalBtn = document.getElementById('set-goal-btn');
        if (setGoalBtn) animateButtonSuccess(setGoalBtn);
        showToast("Obiettivo impostato!");

        // Ritarda il re-rendering per mostrare l'animazione del pulsante
        setTimeout(() => {
            saveData();
            renderDailyGoal();
        }, 2000);
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

        animateButtonSuccess(setIntentionBtn);
        showToast("Intenzione fissata!");

        // Ritarda il re-rendering per mostrare l'animazione del pulsante
        setTimeout(() => {
            saveData();
            renderDailyIntention();
        }, 2000);
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
        if (e.target.id === 'set-goal-btn' || e.target.closest('#set-goal-btn')) {
            setDailyGoal();
        } else if (e.target.id === 'goal-checkbox') {
            toggleGoalCompletion();
        }
    });


    function checkGratitudeLock() {
        const today = getLocalDateString();

        if (state.gratitudeEntries[today]) {
            gratitudeInputs.forEach(input => {
                input.value = state.gratitudeEntries[today][Array.from(gratitudeInputs).indexOf(input)] || '';
                input.disabled = true;
            });

            gratitudeBtn.disabled = true;
            gratitudeBtn.textContent = "✅ Completato per oggi";
            gratitudeBtn.classList.add('completed');
            gratitudeBtn.style.background = "#e2e8f0";
            gratitudeBtn.style.color = "#64748b";
            gratitudeBtn.style.cursor = "not-allowed";
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
            showToast("Registrazione in corso...");

            setTimeout(() => {
                state.isLoggedIn = true;
                state.termsAcceptedAt = new Date().toISOString();
                saveData();
                enterMainApp(true);
            }, 1500);
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast("Accesso in corso...");
            setTimeout(() => {
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

            // MODIFICA: Porta la pagina in cima.
            window.scrollTo(0, 0);

            initUI();

            document.getElementById('home').classList.add('active');
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');

            if (isNewUser) {
                profileEditModal.classList.add('active');
            }
        }, 500);
    }

    navBar.addEventListener('click', function(e) {
        const targetItem = e.target.closest('.nav-item');
        if (!targetItem) return;

        e.preventDefault();
        const targetId = targetItem.dataset.target;

        navBar.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        targetItem.classList.add('active');

        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');
            }
        });

        // La funzione per portare in cima la pagina è già presente qui e funziona correttamente.
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (targetId === 'health') {
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

        const hasLoggedIn = state.moodEntries[today].some(e => e.window === currentWindow.id);
        if (hasLoggedIn) {
            showToast(`Hai già effettuato il check-in per la ${currentWindow.name}`);
            return;
        }

        state.moodEntries[today].push({ mood: state.currentSelectedMood, window: currentWindow.id });
        state.anxietyEntries[today].push({ value: anxietySlider.value, window: currentWindow.id });
        state.stressEntries[today].push({ value: stressSlider.value, window: currentWindow.id });

        animateButtonSuccess(saveCombinedCheckinBtn);
        showToast(`Check-in della ${currentWindow.name} registrato!`);

        setTimeout(() => {
            initTimeBasedCheckin();
            updateMoodStatusMessage();
        }, 2000);

        updateDailyData();

        if (!state.streakUpdatedToday) {
            updateStreak();
            state.streakUpdatedToday = true;
        }

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
        playerModal.classList.add('active');
    });

    function updateStreak() {
        const today = new Date();
        const todayStr = getLocalDateString(today);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);

        if (!state.lastActivityDate) {
            state.growthStreak = 1;
        } else if (state.lastActivityDate === yesterdayStr) {
            state.growthStreak++;
        } else if (state.lastActivityDate !== todayStr) {
            state.growthStreak = 1;
        }
        state.lastActivityDate = todayStr;
        updateStreakCounter();
    }

    document.getElementById('player-close-btn').addEventListener('click', () => {
        playerModal.classList.remove('active');
        audioPlayer.pause();
    });

    historyBtn.addEventListener('click', () => {
        state.selectedHistoryDate = getLocalDateString();
        saveData();
        historyModal.classList.add('active');
        generateCalendar();
    });
    historyCloseBtn.addEventListener('click', () => historyModal.classList.remove('active'));

    editProfileBtn.addEventListener('click', () => {
        document.getElementById('profile-name-input').value = state.profile.name;
        document.querySelectorAll('.emoji-option, .gender-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`.emoji-option[data-emoji="${state.profile.emoji}"]`)?.classList.add('selected');
        document.querySelector(`.gender-option[data-gender="${state.profile.gender}"]`)?.classList.add('selected');
        profileEditModal.classList.add('active');
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

        animateButtonSuccess(profileEditSave);
        showToast("Profilo aggiornato!");

        setTimeout(() => {
            profileEditModal.classList.remove('active');
            profileEditSave.disabled = false; // Riabilita per la prossima apertura
        }, 2000);
    });
    profileEditCancel.addEventListener('click', () => profileEditModal.classList.remove('active'));

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

        animateButtonSuccess(gratitudeBtn);
        showToast("Diario della gratitudine salvato!");
        this.reset();

        // Ritarda il blocco del form per mostrare l'animazione
        setTimeout(() => {
            saveData();
            checkGratitudeLock();
        }, 2000);
    });

    function handleSubscription(plan) {
        showToast("Stiamo elaborando il tuo pagamento...");
        setTimeout(() => {
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

        if (monthlySubscribeBtn) {
            monthlySubscribeBtn.addEventListener('click', () => handleSubscription("mensile"));
        }
        if (annualSubscribeBtn) {
            annualSubscribeBtn.addEventListener('click', () => handleSubscription("annuale"));
        }
    }
    setupSubscriptionToggle();


    if (googleLoginBtn) {
       googleLoginBtn.addEventListener('click', () => loginModal.classList.add('active'));
    }
    if(loginCloseBtn) {
        loginCloseBtn.addEventListener('click', () => loginModal.classList.remove('active'));
    }

    document.getElementById('google-login').addEventListener('click', () => {
        showToast("Accesso con Google in corso...");
        setTimeout(() => {
            state.isLoggedIn = true;
            saveData();
            updateLoginState();
            loginModal.classList.remove('active');
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

    accountSettingsBtn.addEventListener('click', () => accountSettingsModal.classList.add('active'));
    accountSettingsCloseBtn.addEventListener('click', () => accountSettingsModal.classList.remove('active'));

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

    function updateHistoryDisplay(date) {
        const selectedDate = getLocalDateString(date);
        state.selectedHistoryDate = selectedDate;
        saveData();

        const moodEntries = state.moodEntries[selectedDate] || [];
        const anxietyEntries = state.anxietyEntries[selectedDate] || [];
        const stressEntries = state.stressEntries[selectedDate] || [];
        const gratitudeEntries = state.gratitudeEntries[selectedDate] || [];
        const dailyGoal = state.dailyGoals[selectedDate] || null;

        let moodHistoryHTML = '';
        state.timeWindows.forEach(window => {
            const moodEntry = moodEntries.find(e => e.window === window.id);
            if (moodEntry) {
                const anxietyEntry = anxietyEntries.find(e => e.window === window.id);
                const stressEntry = stressEntries.find(e => e.window === window.id);

                moodHistoryHTML += `
                    <div class="mood-history-item">
                        <div class="mood-history-emoji">${getMoodEmoji(moodEntry.mood)}</div>
                        <div class="mood-history-details">
                            <div class="mood-history-mood-name">${getMoodName(moodEntry.mood)}</div>
                            <div class="mood-history-window">${window.name}</div>
                        </div>
                        <div class="mood-history-stats">
                            <div class="mood-history-stat">
                                <div class="stat-label-history">Ansia</div>
                                <div class="stat-value-history">${anxietyEntry ? anxietyEntry.value : '-'}</div>
                            </div>
                             <div class="mood-history-stat">
                                <div class="stat-label-history">Stress</div>
                                <div class="stat-value-history">${stressEntry ? stressEntry.value : '-'}</div>
                            </div>
                        </div>
                    </div>`;
            }
        });

        moodHistoryContainer.innerHTML = moodHistoryHTML || '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';
        gratitudeHistoryContainer.innerHTML = gratitudeEntries.length > 0 ? `<ol style="padding-left: 20px; margin-top: 10px;">${gratitudeEntries.map(entry => `<li style="margin-bottom: 8px;">${entry}</li>`).join('')}</ol>` : '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';
        goalHistoryContainer.innerHTML = dailyGoal ? `
            <div class="goal-history-item">
                <div class="goal-history-icon ${dailyGoal.completed ? 'completed' : 'not-completed'}">${dailyGoal.completed ? '✓' : '✗'}</div>
                <div>
                    <div style="font-weight: ${dailyGoal.completed ? 'normal' : 'bold'}">${dailyGoal.text}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">${dailyGoal.completed ? '🎯 Completato' : '🎯 Non completato'}</div>
                </div>
            </div>` : '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';
    }

    function generateCalendar() {
        if(!calendarMonth || !document.getElementById('calendar')) return;
        const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        calendarMonth.textContent = `${monthNames[state.currentCalendarDate.getMonth()]} ${state.currentCalendarDate.getFullYear()}`;
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
        days.forEach(day => calendar.innerHTML += `<div class="calendar-header">${day}</div>`);

        const firstDay = new Date(state.currentCalendarDate.getFullYear(), state.currentCalendarDate.getMonth(), 1);
        const lastDay = new Date(state.currentCalendarDate.getFullYear(), state.currentCalendarDate.getMonth() + 1, 0);

        for (let i = 0; i < firstDay.getDay(); i++) calendar.innerHTML += '<div></div>';

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const day = new Date(state.currentCalendarDate.getFullYear(), state.currentCalendarDate.getMonth(), i);
            const dayString = getLocalDateString(day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            if (state.moodEntries[dayString] || state.gratitudeEntries[dayString] || state.dailyGoals[dayString]) dayElement.classList.add('has-data');
            if (dayString === getLocalDateString(new Date())) dayElement.classList.add('active');
            if (dayString === state.selectedHistoryDate) dayElement.classList.add('selected');
            dayElement.addEventListener('click', function() {
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                this.classList.add('selected');
                updateHistoryDisplay(day);
            });
            calendar.appendChild(dayElement);
        }
        updateHistoryDisplay(new Date(state.selectedHistoryDate));
    }

    function initTimeBasedCheckin() {
        const now = new Date();
        const currentTime = now.getHours() + now.getMinutes()/100;
        const today = getLocalDateString();

        const moodButtons = moodTracker.querySelectorAll('.mood-btn');
        const currentWindow = state.timeWindows.find(w => currentTime >= w.start && currentTime <= w.end);

        let isDisabled = true;
        if (currentWindow) {
            const hasLoggedIn = state.moodEntries[today]?.some(e => e.window === currentWindow.id);
            if (!hasLoggedIn) {
                isDisabled = false;
            }
        }

        moodButtons.forEach(btn => btn.disabled = isDisabled);
        anxietySlider.disabled = isDisabled;
        stressSlider.disabled = isDisabled;
        saveCombinedCheckinBtn.disabled = isDisabled;
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
        animateButtonSuccess(saveSleepBtn);
        showToast("Sonno registrato: " + sleepSlider.value);
        updateDailyData();
        setTimeout(() => {
            saveSleepBtn.disabled = false; // Riabilita dopo l'animazione
        }, 2000);
    });

    generateReportBtn.addEventListener('click', () => {
        generateWeeklyReport();
        reportModal.classList.add('active');
    });
    reportCloseBtn.addEventListener('click', () => reportModal.classList.remove('active'));

    function generateWeeklyReport() {
        const today = new Date();
        let moodSum = 0, moodCount = 0, anxietySum = 0, anxietyCount = 0, stressSum = 0, stressCount = 0;
        let sleepSum = 0, sleepCount = 0, gratitudeCount = 0, goalCompletionCount = 0;
        const moodData = [], anxietyData = [], stressData = [], sleepData = [], dates = [];
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            dates.push(daysOfWeek[date.getDay()]);

            if (state.moodEntries[dateStr] && state.moodEntries[dateStr].length > 0) {
                const avgMood = state.moodEntries[dateStr].map(e => getMoodValue(e.mood)).reduce((a, b) => a + b, 0) / state.moodEntries[dateStr].length;
                moodSum += avgMood; moodCount++; moodData.push(avgMood);
            } else { moodData.push(null); }
            if (state.anxietyEntries[dateStr] && state.anxietyEntries[dateStr].length > 0) {
                const avgAnxiety = state.anxietyEntries[dateStr].map(e => parseInt(e.value)).reduce((a,b) => a+b, 0) / state.anxietyEntries[dateStr].length;
                anxietySum += avgAnxiety; anxietyCount++; anxietyData.push(avgAnxiety);
            } else { anxietyData.push(null); }
            if (state.stressEntries[dateStr] && state.stressEntries[dateStr].length > 0) {
                const avgStress = state.stressEntries[dateStr].map(e => parseInt(e.value)).reduce((a,b) => a+b, 0) / state.stressEntries[dateStr].length;
                stressSum += avgStress; stressCount++; stressData.push(avgStress);
            } else { stressData.push(null); }
            if (state.sleepEntries[dateStr]) {
                sleepSum += parseInt(state.sleepEntries[dateStr]);
                sleepCount++;
                sleepData.push(parseInt(state.sleepEntries[dateStr]));
            } else { sleepData.push(null); }
            if (state.gratitudeEntries[dateStr]) gratitudeCount++;
            if (state.dailyGoals[dateStr]?.completed) goalCompletionCount++;
        }

        const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : 'N/D';
        const avgAnxiety = anxietyCount > 0 ? (anxietySum / anxietyCount).toFixed(1) : 'N/D';
        const avgStress = stressCount > 0 ? (stressSum / stressCount).toFixed(1) : 'N/D';
        const avgSleep = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : 'N/D';

        reportContent.innerHTML = `
            <div class="report-header"><h2 class="report-title">Resoconto Settimanale</h2></div>
            <div class="report-stats">
                <div class="report-stat"><div class="stat-value">${avgMood}</div><div class="stat-label">Umore</div></div>
                <div class="report-stat"><div class="stat-value">${avgAnxiety}</div><div class="stat-label">Ansia</div></div>
                <div class="report-stat"><div class="stat-value">${avgStress}</div><div class="stat-label">Stress</div></div>
                <div class="report-stat"><div class="stat-value">${avgSleep}</div><div class="stat-label">Sonno</div></div>
                <div class="report-stat"><div class="stat-value">${gratitudeCount}</div><div class="stat-label">Gratitudini</div></div>
                <div class="report-stat"><div class="stat-value">${goalCompletionCount}/7</div><div class="stat-label">Obiettivi</div></div>
            </div>
            <div class="report-chart-area">
                <div class="report-chart">
                    <div class="chart-group">
                        ${dates.map((date, index) => `
                            <div class="chart-day-group">
                                <div class="chart-bars">
                                    <div class="chart-bar mood-bar" style="height: ${moodData[index] ? (moodData[index] / 10) * 100 + '%' : '0%'};" title="Umore: ${moodData[index] ? moodData[index].toFixed(1) : 'N/D'}"></div>
                                    <div class="chart-bar anxiety-bar" style="height: ${anxietyData[index] ? (anxietyData[index] / 10) * 100 + '%' : '0%'};" title="Ansia: ${anxietyData[index] ? anxietyData[index].toFixed(1) : 'N/D'}"></div>
                                    <div class="chart-bar stress-bar" style="height: ${stressData[index] ? (stressData[index] / 10) * 100 + '%' : '0%'};" title="Stress: ${stressData[index] ? stressData[index].toFixed(1) : 'N/D'}"></div>
                                    <div class="chart-bar sleep-bar" style="height: ${sleepData[index] ? (sleepData[index] / 10) * 100 + '%' : '0%'};" title="Sonno: ${sleepData[index] || 'N/D'}"></div>
                                </div>
                                <div class="chart-label">${date}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="chart-legend">
                <div class="legend-item"><div class="legend-color" style="background: var(--primary);"></div>Umore</div>
                <div class="legend-item"><div class="legend-color" style="background: #EF5350;"></div>Ansia</div>
                <div class="legend-item"><div class="legend-color" style="background: #FFB74D;"></div>Stress</div>
                <div class="legend-item"><div class="legend-color" style="background: var(--calm-1);"></div>Sonno</div>
            </div>`;
    }

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
        const container = document.body;

        for (let i = 0; i < numeroCoriandoli; i++) {
            const coriandolo = document.createElement('span');
            coriandolo.classList.add('coriandolo');
            coriandolo.innerHTML = forme[Math.floor(Math.random() * forme.length)];
            coriandolo.style.left = `${Math.random() * 100}vw`;
            coriandolo.style.fontSize = `${Math.random() * 1 + 1}rem`;
            const durataAnimazione = Math.random() * 1.5 + 2.5;
            coriandolo.style.animationDuration = `${durataAnimazione}s`;
            coriandolo.style.animationDelay = `${Math.random() * 0.5}s`;
            const oscillazione = (Math.random() - 0.5) * 250;
            coriandolo.style.setProperty('--oscillazione', `${oscillazione}px`);
            container.appendChild(coriandolo);

            coriandolo.addEventListener('animationend', () => {
                coriandolo.classList.add('fade-out');
                coriandolo.addEventListener('animationend', () => {
                    coriandolo.remove();
                }, { once: true });
            }, { once: true });
        }
    }

    /**
     * NUOVA FUNZIONE: Fornisce un feedback visivo di successo su un pulsante.
     * Trasforma temporaneamente il pulsante per mostrare un'icona di spunta (✓)
     * e un colore di successo, per poi ripristinare lo stato originale.
     * @param {HTMLElement} button - L'elemento del pulsante da animare.
     */
    function animateButtonSuccess(button) {
        if (!button) return; // Controllo di sicurezza

        const originalContent = button.innerHTML;
        const originalWidth = button.offsetWidth;

        // Imposta una larghezza fissa per evitare cambi di layout durante l'animazione
        button.style.width = `${originalWidth}px`;

        button.classList.add('btn-success');
        button.innerHTML = '✓';
        button.disabled = true;

        // Dopo 2 secondi, ripristina lo stato originale del pulsante
        setTimeout(() => {
            button.classList.remove('btn-success');
            button.innerHTML = originalContent;
            button.style.width = ''; // Rimuovi la larghezza fissa

            // La logica specifica di ogni funzione si occuperà di riabilitare
            // il pulsante se necessario, per evitare conflitti.
        }, 2000);
    }

    function main() {
        loadSavedData();

        if (state.isLoggedIn) {
            authSection.style.display = 'none';
            mainAppContainer.style.display = 'block';

            // MODIFICA: Porta la pagina in cima quando un utente loggato ricarica la pagina.
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
