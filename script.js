/**
 * File: script.js
 * --- MODIFICHE PRECEDENTI ---
 * Varie correzioni di layout, responsività, e stili dei componenti.
 * Aggiunta funzionalità come coriandoli, form di login, etc.
 * Prima revisione del tema scuro per migliorare contrasto e coerenza.
 * * --- NOTE SULLE ULTIME MODIFICHE ---
 * Le problematiche relative ai colori dei filtri, alla visibilità del selettore di abbonamento,
 * alla coerenza del tema scuro e alla rimozione dei loghi sono state risolte
 * direttamente nei file `style.css` e `index.html`.
 * L'ultima modifica ha uniformato l'uso del colore viola nel tema scuro per tutti
 * gli elementi richiesti, garantendo coerenza e leggibilità, seguendo alla lettera
 * le indicazioni fornite.
 * Questo file non ha richiesto modifiche funzionali.
 */
document.addEventListener('DOMContentLoaded', function() {
    // App state
    const state = {
        onboardingCompleted: false,
        currentMeditation: null,
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
            name: "Marco Rossi",
            gender: "M",
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
        /**
         * NOTA PER L'INTEGRAZIONE CON SUPABASE:
         * La tua idea di usare link diretti per le immagini e le frasi è ottima e rappresenta la best practice.
         * Ti permette di aggiornare i contenuti dinamicamente senza dover modificare il codice del sito.
         * * 1. Carica le immagini in un bucket di Supabase Storage (es. un bucket chiamato 'assets_pubblici/immagini_giornaliere').
         * 2. Crea una tabella in Supabase (es. 'daily_content') con colonne come 'id', 'quote_text', 'author', 'image_filename'.
         * 3. In questa tabella, inserisci le frasi e, nella colonna 'image_filename', solo il nome del file (es. 'daily1.jpg').
         *
         * L'array 'dailyQuotes' qui sotto diventerebbe obsoleto. Al suo posto, creeresti una funzione asincrona
         * per caricare i dati da Supabase all'avvio dell'app.
         * * Esempio di come apparirebbe l'oggetto dati con URL da Supabase:
         * {
         * image: "https://<id-progetto>.supabase.co/storage/v1/object/public/assets_pubblici/immagini_giornaliere/daily1.jpg",
         * quote: "La pace viene da dentro. Non cercarla fuori. - Buddha"
         * }
         * * Questo approccio è scalabile e ti dà pieno controllo sui contenuti mostrati agli utenti ogni giorno.
         * Puoi seguire lo stesso principio per le meditazioni e i suoni, come hai giustamente intuito.
         */
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
        termsAcceptedAt: null
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
        22: 'https://assets.mixkit.co/sfx/preview/mixkit-river-stream-water-1240.mp3'
    };

    const soundFiles = {
        bells: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        nature: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3',
        piano: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3'
    };

    // DOM Elements
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
    const nextBtn1 = document.getElementById('next-btn1');
    const nextBtn2 = document.getElementById('next-btn2');
    const nextBtn3 = document.getElementById('next-btn3');
    const nextBtn4 = document.getElementById('next-btn4');
    const logoutBtn = document.getElementById('logout-btn');
    const termsBtn = document.getElementById('terms-btn');
    const privacyBtn = document.getElementById('privacy-btn');
    const themeToggleInput = document.getElementById('theme-toggle-input');
    const themeToggleProfile = document.getElementById('theme-toggle-profile');
    const streakCounter = document.getElementById('streak-counter');
    const genderOptionsContainer = document.querySelector('.gender-options');
    const emojiPicker = document.querySelector('.emoji-picker');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const anxietySlider = document.getElementById('anxiety-slider');
    const anxietyValue = document.getElementById('anxiety-value');
    const saveAnxietyBtn = document.getElementById('save-anxiety');
    const stressSlider = document.getElementById('stress-slider');
    const stressValue = document.getElementById('stress-value');
    const saveStressBtn = document.getElementById('save-stress');
    const sleepSlider = document.getElementById('sleep-slider');
    const sleepValue = document.getElementById('sleep-value');
    const saveSleepBtn = document.getElementById('save-sleep');
    const onboardingLoginModal = document.getElementById('onboarding-login-modal');
    const onboardingLoginBack = document.getElementById('onboarding-login-back');
    const reportCloseBtn = document.getElementById('report-close-btn');
    const premiumCard = document.getElementById('premium-card');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const premiumLocks = document.querySelectorAll('.premium-lock');
    const premiumLockBtns = document.querySelectorAll('.premium-lock-btn');
    const manageSubscriptionBtn = document.getElementById('manage-subscription-btn');
    const downloadReportBtn = document.getElementById('download-report-btn');
    const shareReportBtn = document.getElementById('share-report-btn');
    const reportContent = document.getElementById('report-content');
    const dailyMoodValue = document.getElementById('daily-mood-value');
    const dailyAnxietyValue = document.getElementById('daily-anxiety-value');
    const dailyStressValue = document.getElementById('daily-stress-value');
    const dailySleepValue = document.getElementById('daily-sleep-value');
    const loadingScreen = document.getElementById('loading-screen');
    const calendarMonth = document.getElementById('calendar-month');
    const intentionInput = document.getElementById('intention-input');
    const setIntentionBtn = document.getElementById('set-intention-btn');
    const intentionText = document.getElementById('intention-text');

    // --- Nuovi selettori per abbonamento ---
    const yearlyToggle = document.getElementById('yearly-toggle');
    const monthlyToggle = document.getElementById('monthly-toggle');
    const subscriptionToggle = document.querySelector('.subscription-toggle');
    const yearlyPlan = document.getElementById('yearly-plan');
    const monthlyPlan = document.getElementById('monthly-plan');

    // --- NUOVI SELETTORI PER REGISTRAZIONE / ACCESSO ---
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


    // Initialize Supabase
    // const supabaseUrl = 'https://your-supabase-url.supabase.co';
    // const supabaseKey = 'your-supabase-key';
    // const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Carica i dati salvati da localStorage
    function loadSavedData() {
        const savedOnboarding = localStorage.getItem('onboardingCompleted');
        if (savedOnboarding) {
            state.onboardingCompleted = JSON.parse(savedOnboarding);
        }

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
        localStorage.setItem('onboardingCompleted', JSON.stringify(state.onboardingCompleted));
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

    // Funzione per aggiornare il messaggio di benvenuto in base al genere
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

    // Aggiorna stato login/logout
    function updateLoginState() {
        if (state.isLoggedIn) {
            logoutBtn.style.display = 'flex';
        } else {
            logoutBtn.style.display = 'none';
        }
    }

    // Funzione per visualizzare l'obiettivo giornaliero
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

    // Funzione per visualizzare l'intenzione giornaliera
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

    // Funzione per aggiornare i dati giornalieri
    function updateDailyData() {
        const today = getLocalDateString();

        if (state.moodEntries[today] && state.moodEntries[today].length > 0) {
            const moodValues = state.moodEntries[today].map(entry => getMoodValue(entry.mood));
            const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
            dailyMoodValue.textContent = avgMood.toFixed(1);
        } else {
            dailyMoodValue.textContent = "-";
        }

        if (state.anxietyEntries[today]) {
            dailyAnxietyValue.textContent = state.anxietyEntries[today];
        } else {
            dailyAnxietyValue.textContent = "-";
        }

        if (state.stressEntries[today]) {
            dailyStressValue.textContent = state.stressEntries[today];
        } else {
            dailyStressValue.textContent = "-";
        }

        if (state.sleepEntries[today]) {
            dailySleepValue.textContent = state.sleepEntries[today];
        } else {
            dailySleepValue.textContent = "-";
        }
    }

    // Funzione per impostare l'obiettivo giornaliero
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
        renderDailyGoal();
        showToast("Obiettivo impostato!");
    }

    // Funzione per impostare l'intenzione giornaliera
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
        renderDailyIntention();
        showToast("Intenzione fissata!");
    }

    // Funzione per segnare l'obiettivo come completato
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
        if (e.target.id === 'set-goal-btn') {
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
        let currentWindow = null;
        for (const window of state.timeWindows) {
            if (currentTime >= window.start && currentTime <= window.end) {
                currentWindow = window;
                break;
            }
        }

        const moodStatus = document.querySelector('.mood-status');
        if (moodStatus) {
            if (currentWindow) {
                moodStatus.innerHTML = `È ora per il tuo check-in ${currentWindow.name.toLowerCase()}!`;
            } else {
                moodStatus.innerHTML = `I check-in sono disponibili dalle 7:00 alle 23:59`;
            }
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

    loadSavedData();
    initUI();

    function initOnboarding() {
        const slides = document.querySelectorAll('.onboarding-slide');
        let currentSlide = 0;

        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            slides[index].classList.add('active');
            currentSlide = index;
        }

        if (nextBtn1) nextBtn1.addEventListener('click', () => showSlide(1));
        if (nextBtn2) nextBtn2.addEventListener('click', () => showSlide(2));
        if (nextBtn3) nextBtn3.addEventListener('click', () => showSlide(3));

        if (nextBtn4) {
            nextBtn4.addEventListener('click', () => onboardingLoginModal.classList.add('active'));
        }

        function finishOnboarding() {
            state.onboardingCompleted = true;
            saveData();
            document.getElementById('onboarding').style.transform = 'translateY(-100%)';

            setTimeout(() => {
                document.getElementById('onboarding').style.display = 'none';
                document.getElementById('home').classList.add('active');
                document.querySelector('[data-target="home"]').classList.add('active');
                profileEditModal.classList.add('active');
            }, 500);
        }

        if (state.onboardingCompleted) {
            document.getElementById('onboarding').style.display = 'none';
            document.getElementById('home').classList.add('active');
        }

        onboardingLoginBack.addEventListener('click', () => onboardingLoginModal.classList.remove('active'));

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
                updateLoginState();
                finishOnboarding();
                onboardingLoginModal.classList.remove('active');
            }, 1500);
        });

        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast("Accesso in corso...");
            setTimeout(() => {
                state.isLoggedIn = true;
                saveData();
                updateLoginState();
                finishOnboarding();
                onboardingLoginModal.classList.remove('active');
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

    initOnboarding();

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

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (targetId === 'health') {
            initTimeBasedCheckin();
            updateMoodStatusMessage();
        }
    });

    moodTracker.addEventListener('click', function(e) {
        const targetButton = e.target.closest('.mood-btn');
        if (!targetButton) return;

        if (!state.isPremium) {
            showToast("Questa funzionalità richiede un abbonamento Premium");
            return;
        }

        const mood = targetButton.dataset.mood;
        const now = new Date();
        const currentTime = now.getHours() + now.getMinutes()/100;
        const currentWindow = state.timeWindows.find(w => currentTime >= w.start && currentTime <= w.end);

        if (!currentWindow) {
            showToast("Il check-in è disponibile solo dalle 7:00 alle 23:59");
            return;
        }

        const today = getLocalDateString();
        if (!state.moodEntries[today]) state.moodEntries[today] = [];

        const hasLoggedIn = state.moodEntries[today].some(e => e.window === currentWindow.id);
        if (hasLoggedIn) {
            showToast(`Hai già effettuato il check-in per la ${currentWindow.name}`);
            return;
        }

        state.moodEntries[today].push({ mood, window: currentWindow.id });
        showToast(`Umore registrato: ${getMoodName(mood)} ${getMoodEmoji(mood)}`);

        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.disabled = true);

        if (!state.streakUpdatedToday) {
            updateStreak();
            state.streakUpdatedToday = true;
        }

        saveData();
        updateDailyData();
    });

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
        profileEditModal.classList.remove('active');
        showToast("Profilo aggiornato!");
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
        showToast("Diario della gratitudine salvato!");
        this.reset();
        saveData();
        checkGratitudeLock();
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
        const gratitudeEntries = state.gratitudeEntries[selectedDate] || [];
        const dailyGoal = state.dailyGoals[selectedDate] || null;

        moodHistoryContainer.innerHTML = moodEntries.length > 0 ? moodEntries.map(entry => `
            <div class="mood-history-item" style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f1f5f9;">
                <div style="font-size: 2rem; margin-right: 15px;">${getMoodEmoji(entry.mood)}</div>
                <div>
                    <div>${getMoodName(entry.mood)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">${state.timeWindows.find(w => w.id === entry.window).name}</div>
                </div>
            </div>
        `).join('') : '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';

        gratitudeHistoryContainer.innerHTML = gratitudeEntries.length > 0 ? `<ol style="padding-left: 20px; margin-top: 10px;">${gratitudeEntries.map(entry => `<li style="margin-bottom: 8px;">${entry}</li>`).join('')}</ol>` : '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';

        goalHistoryContainer.innerHTML = dailyGoal ? `
            <div class="goal-history-item">
                <div class="goal-history-icon ${dailyGoal.completed ? 'completed' : 'not-completed'}">${dailyGoal.completed ? '✓' : '✗'}</div>
                <div>
                    <div style="font-weight: ${dailyGoal.completed ? 'normal' : 'bold'}">${dailyGoal.text}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">${dailyGoal.completed ? '🎯 Completato' : '🎯 Non completato'}</div>
                </div>
            </div>
        ` : '<p style="text-align: center; padding: 10px; color: var(--text-light);">Nessun dato</p>';
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
        if (!currentWindow) {
            moodButtons.forEach(btn => btn.disabled = true);
            return;
        }
        const hasLoggedIn = state.moodEntries[today]?.some(e => e.window === currentWindow.id);
        moodButtons.forEach(btn => btn.disabled = hasLoggedIn);
    }

    if (document.querySelector('#health.section.active')) initTimeBasedCheckin();
    if (calendarMonth) {
        generateCalendar();
    }
    setInterval(() => {
        if (document.querySelector('#health.section.active')) {
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

    if(termsBtn) {
        termsBtn.addEventListener('click', () => alert("Qui verrebbero mostrati i Termini di Servizio."));
    }
    if(privacyBtn) {
        privacyBtn.addEventListener('click', () => alert("Qui verrebbe mostrata la Privacy Policy."));
    }

    document.getElementById('prev-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        generateCalendar();
    });
    document.getElementById('next-month-btn').addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() + 1);
        generateCalendar();
    });

    anxietySlider.addEventListener('input', function() { anxietyValue.textContent = this.value; });
    saveAnxietyBtn.addEventListener('click', () => {
        if (!state.isPremium) { showToast("Funzionalità Premium richiesta"); return; }
        const today = getLocalDateString();
        if (state.anxietyEntries[today]) { showToast("Hai già registrato l'ansia oggi"); return; }
        state.anxietyEntries[today] = anxietySlider.value;
        saveData();
        showToast("Ansia registrata: " + anxietySlider.value);
        updateDailyData();
    });

    stressSlider.addEventListener('input', function() { stressValue.textContent = this.value; });
    saveStressBtn.addEventListener('click', () => {
        if (!state.isPremium) { showToast("Funzionalità Premium richiesta"); return; }
        const today = getLocalDateString();
        if (state.stressEntries[today]) { showToast("Hai già registrato lo stress oggi"); return; }
        state.stressEntries[today] = stressSlider.value;
        saveData();
        showToast("Stress registrato: " + stressSlider.value);
        updateDailyData();
    });

    sleepSlider.addEventListener('input', function() { sleepValue.textContent = this.value; });
    saveSleepBtn.addEventListener('click', () => {
        if (!state.isPremium) { showToast("Funzionalità Premium richiesta"); return; }
        const today = getLocalDateString();
        if (state.sleepEntries[today]) { showToast("Hai già registrato il sonno oggi"); return; }
        state.sleepEntries[today] = sleepSlider.value;
        saveData();
        showToast("Sonno registrato: " + sleepSlider.value);
        updateDailyData();
    });

    generateReportBtn.addEventListener('click', () => {
        generateWeeklyReport();
        reportModal.classList.add('active');
    });
    reportCloseBtn.addEventListener('click', () => reportModal.classList.remove('active'));
    manageSubscriptionBtn.addEventListener('click', () => {
        showToast("Reindirizzamento per la gestione dell'abbonamento...");
        window.open('https://dashboard.stripe.com/', '_blank');
    });

    function generateWeeklyReport() {
        const today = new Date();
        let moodSum = 0, moodCount = 0, anxietySum = 0, anxietyCount = 0, stressSum = 0, stressCount = 0;
        let sleepSum = 0, sleepCount = 0, meditationCount = 0, gratitudeCount = 0, goalCompletionRate = 0;
        const moodData = [], anxietyData = [], stressData = [], sleepData = [], dates = [];
        const daysOfWeek = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            const dateStr = getLocalDateString(date);
            dates.push(daysOfWeek[date.getDay()]);

            if (state.moodEntries[dateStr]) {
                const avgMood = state.moodEntries[dateStr].map(e => getMoodValue(e.mood)).reduce((a, b) => a + b, 0) / state.moodEntries[dateStr].length;
                moodSum += avgMood; moodCount++; moodData.push(avgMood);
            } else { moodData.push(null); }
            if (state.anxietyEntries[dateStr]) { anxietySum += parseInt(state.anxietyEntries[dateStr]); anxietyCount++; anxietyData.push(parseInt(state.anxietyEntries[dateStr])); } else { anxietyData.push(null); }
            if (state.stressEntries[dateStr]) { stressSum += parseInt(state.stressEntries[dateStr]); stressCount++; stressData.push(parseInt(state.stressEntries[dateStr])); } else { stressData.push(null); }
            if (state.sleepEntries[dateStr]) { sleepSum += parseInt(state.sleepEntries[dateStr]); sleepCount++; sleepData.push(parseInt(state.sleepEntries[dateStr])); } else { sleepData.push(null); }
            if (state.gratitudeEntries[dateStr]) gratitudeCount++;
            if (state.dailyGoals[dateStr]?.completed) goalCompletionRate++;
        }

        const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : 'N/D';
        const avgAnxiety = anxietyCount > 0 ? (anxietySum / anxietyCount).toFixed(1) : 'N/D';
        const avgStress = stressCount > 0 ? (stressSum / stressCount).toFixed(1) : 'N/D';
        const avgSleep = sleepCount > 0 ? (sleepSum / sleepCount).toFixed(1) : 'N/D';
        const goalRate = Math.round((goalCompletionRate / 7) * 100);

        reportContent.innerHTML = `
            <div class="report-header"><h2 class="report-title">Resoconto Settimanale</h2></div>
            <div class="report-stats">
                <div class="report-stat"><div class="stat-value">${avgMood}</div><div class="stat-label">Umore</div></div>
                <div class="report-stat"><div class="stat-value">${avgAnxiety}</div><div class="stat-label">Ansia</div></div>
                <div class="report-stat"><div class="stat-value">${avgStress}</div><div class="stat-label">Stress</div></div>
                <div class="report-stat"><div class="stat-value">${avgSleep}</div><div class="stat-label">Sonno</div></div>
                <div class="report-stat"><div class="stat-value">${gratitudeCount}</div><div class="stat-label">Gratitudini</div></div>
                <div class="report-stat"><div class="stat-value">${goalRate}%</div><div class="stat-label">Obiettivi</div></div>
            </div>
            <div class="report-chart">
                <div class="chart-group">
                    ${dates.map((date, index) => `
                        <div class="chart-day-group">
                            <div class="chart-bars">
                                <div class="chart-bar mood-bar" style="height: ${moodData[index] ? (moodData[index] / 10) * 100 + '%' : '0%'};" title="Umore: ${moodData[index] || 'N/D'}"></div>
                                <div class="chart-bar anxiety-bar" style="height: ${anxietyData[index] ? (anxietyData[index] / 10) * 100 + '%' : '0%'};" title="Ansia: ${anxietyData[index] || 'N/D'}"></div>
                                <div class="chart-bar stress-bar" style="height: ${stressData[index] ? (stressData[index] / 10) * 100 + '%' : '0%'};" title="Stress: ${stressData[index] || 'N/D'}"></div>
                                <div class="chart-bar sleep-bar" style="height: ${sleepData[index] ? (sleepData[index] / 10) * 100 + '%' : '0%'};" title="Sonno: ${sleepData[index] || 'N/D'}"></div>
                            </div>
                            <div class="chart-label">${date}</div>
                        </div>
                    `).join('')}
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

    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 1500);

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
});
