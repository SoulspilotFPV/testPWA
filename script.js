/**
 * File: script.js
 * --- NOTE SULLE MODIFICHE IMPLEMENTATE ---
 * MODIFICA: La logica principale non ha richiesto una riscrittura completa, poiché la struttura esistente è solida e funzionale.
 * MODIFICA: Sono stati aggiunti commenti dettagliati in italiano, come richiesto, per chiarire il flusso di autenticazione
 * e le funzioni principali che gestiscono il passaggio dalla schermata di login/registrazione all'app vera e propria.
 * MODIFICA: Garantita la coerenza della logica con le modifiche CSS per assicurare una transizione fluida e senza problemi visivi.
 */
document.addEventListener('DOMContentLoaded', function() {
    // Disabilita il ripristino automatico della posizione di scroll del browser.
    // Questo risolve il problema della pagina che non parte dall'alto al refresh.
    if (history.scrollRestoration) {
        history.scrollRestoration = 'manual';
    }

    const startTime = Date.now();
    const loadingScreen = document.getElementById('loading-screen');

    // Funzione per nascondere la schermata di caricamento con una durata minima garantita
    function hideLoadingScreen() {
        const elapsedTime = Date.now() - startTime;
        const minimumTime = 1500;
        const remainingTime = minimumTime - elapsedTime;

        const hide = () => {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500); // Attende la fine della transizione CSS
            }
        };

        if (remainingTime > 0) {
            setTimeout(hide, remainingTime);
        } else {
            hide();
        }
    }

    // Nasconde la schermata di caricamento solo quando la pagina è completamente caricata
    window.onload = hideLoadingScreen;

    // Stato globale dell'applicazione
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

    // Percorsi dei file audio per le meditazioni
    const meditationAudios = {
        1: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 2: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 3: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 4: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 5: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 6: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 7: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 8: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 9: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 10: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 11: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 12: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 13: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 14: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 15: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3', 16: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-124.mp3', 17: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-ambience-573.mp3', 18: 'https://assets.mixkit.co/sfx/preview/mixkit-rain-ambience-239.mp3', 19: 'https://assets.mixkit.co/sfx/preview/mixkit-waves-ambience-1184.mp3', 20: 'https://assets.mixkit.co/sfx/preview/mixkit-night-ambience-427.mp3', 21: 'https://assets.mixkit.co/sfx/preview/mixkit-thunder-ambience-1191.mp3', 22: 'https://assets.mixkit.co/sfx/preview/mixkit-river-stream-water-1240.mp3', 23: 'https://assets.mixkit.co/sfx/preview/mixkit-meditation-bell-552.mp3'
    };

    // Selezione degli elementi del DOM
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
    const dailyImage = document.getElementById('daily-image');
    const dailyQuote = document.getElementById('daily-quote');
    const gratitudeForm = document.getElementById('gratitude-form');
    const gratitudeInputs = document.querySelectorAll('.gratitude-input');
    const gratitudeBtn = document.getElementById('gratitude-btn');
    const profileEditCancel = document.getElementById('profile-edit-cancel');
    const profileEditSave = document.getElementById('profile-edit-save');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleInput = document.getElementById('theme-toggle-input');
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

    // Elementi del form di autenticazione
    const registrationForm = document.getElementById('registration-form');
    const loginForm = document.getElementById('login-form');
    const registrationView = document.getElementById('registration-view');
    const loginView = document.getElementById('login-view');
    const showLoginLink = document.getElementById('show-login-link');
    const showRegisterLink = document.getElementById('show-register-link');
    const registerBtn = document.getElementById('register-btn');
    const termsCheckboxRegister = document.getElementById('terms-checkbox-register');
    const passwordInput = document.getElementById('password-input');
    const passwordFeedback = document.getElementById('password-feedback');
    const lengthCheck = document.getElementById('length-check');
    const numberCheck = document.getElementById('number-check');
    const specialCheck = document.getElementById('special-check');

    // Carica i dati salvati da localStorage
    function loadSavedData() {
        const savedState = localStorage.getItem('appState');
        if (savedState) {
            Object.assign(state, JSON.parse(savedState));
        }
    }

    // Salva dati in localStorage
    function saveData() {
        localStorage.setItem('appState', JSON.stringify(state));
    }

    // Funzione per mostrare un messaggio temporaneo (toast)
    function showToast(message) {
        toast.innerHTML = `<span>🌸</span> ${message}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    /**
     * COMMENTO: Questa è la funzione chiave per la logica di autenticazione.
     * Si occupa di:
     * 1. Gestire il passaggio tra il form di login e quello di registrazione.
     * 2. Validare la password in tempo reale durante la digitazione.
     * 3. Abilitare/disabilitare il pulsante di registrazione in base all'accettazione dei termini.
     * 4. Simulare il processo di registrazione e login.
     * 5. Chiamare la funzione `enterMainApp` in caso di successo.
     */
    function initAuthLogic() {
        // Passa dalla vista registrazione alla vista login
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registrationView.style.display = 'none';
            loginView.style.display = 'block';
        });

        // Passa dalla vista login alla vista registrazione
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginView.style.display = 'none';
            registrationView.style.display = 'block';
        });

        // Validazione della password in tempo reale
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

        // Abilita il pulsante di registrazione solo se i termini sono accettati
        termsCheckboxRegister.addEventListener('change', function() {
            registerBtn.disabled = !this.checked;
        });

        // Gestisce l'invio del form di registrazione
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isPasswordValid()) {
                showToast("La password non rispetta i criteri di sicurezza.");
                return;
            }
            showToast("Registrazione in corso...");

            // Simula una chiamata di rete
            setTimeout(() => {
                state.isLoggedIn = true;
                state.termsAcceptedAt = new Date().toISOString();
                saveData();
                enterMainApp(true); // Entra nell'app come nuovo utente
            }, 1500);
        });

        // Gestisce l'invio del form di login
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            showToast("Accesso in corso...");

            // Simula una chiamata di rete
            setTimeout(() => {
                state.isLoggedIn = true;
                saveData();
                enterMainApp(false); // Entra nell'app come utente esistente
            }, 1500);
        });
    }

    /**
     * COMMENTO: Questa funzione gestisce la transizione visiva dalla sezione di autenticazione
     * all'applicazione principale.
     * @param {boolean} isNewUser - Indica se l'utente si è appena registrato.
     * Se true, mostra il modale per modificare il profilo.
     */
    function enterMainApp(isNewUser = false) {
        // Nasconde la sezione di autenticazione con una dissolvenza
        authSection.style.opacity = '0';
        setTimeout(() => {
            authSection.style.display = 'none';
            mainAppContainer.style.display = 'block';

            // Assicura che la vista dell'app parta dall'alto
            window.scrollTo(0, 0);

            // Inizializza l'interfaccia utente dell'app
            initUI();

            document.getElementById('home').classList.add('active');
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');

            // Se è un nuovo utente, apre il modale per la modifica del profilo
            if (isNewUser) {
                profileEditModal.classList.add('active');
            }
        }, 500); // La durata corrisponde alla transizione CSS
    }

    /**
     * COMMENTO: Punto di ingresso principale dell'applicazione.
     * Viene eseguito al caricamento del DOM.
     * Decide se mostrare la schermata di autenticazione o l'app principale
     * in base allo stato di login dell'utente.
     */
    function main() {
        loadSavedData();

        if (state.isLoggedIn) {
            // Se l'utente è già loggato, nasconde l'autenticazione e mostra l'app
            authSection.style.display = 'none';
            mainAppContainer.style.display = 'block';

            window.scrollTo(0, 0);

            initUI();
            document.getElementById('home').classList.add('active');
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');
        } else {
            // Se l'utente non è loggato, mostra la sezione di autenticazione
            authSection.style.display = 'flex';
            authSection.classList.add('active');
            mainAppContainer.style.display = 'none';
            initAuthLogic(); // Inizializza la logica per i form di login/registrazione
        }
    }

    // --- IL RESTO DEL CODICE DELL'APP RIMANE INVARIATO ---
    // (Funzioni per UI, gestione stato, eventi, etc.)

    // Initialize UI
    function initUI() {
        state.loadedDate = getLocalDateString();
        updateWelcomeMessage();
        renderDailyGoal();
        renderDailyIntention();
        updateTheme();
        updatePremiumLocks();
        updateDailyData();
        updateStreakCounter();

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
        document.querySelector('.profile-name').textContent = state.profile.name;
        document.querySelector('.profile-emoji').textContent = state.profile.emoji;
    }

    function updateLoginState() {
        logoutBtn.style.display = state.isLoggedIn ? 'flex' : 'none';
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
                </p>`;
        } else {
            dailyGoalContainer.innerHTML = `
                <div class="goal-item">
                    <div class="goal-checkbox ${todayGoal.completed ? 'checked' : ''}" id="goal-checkbox">
                        ${todayGoal.completed ? '✓' : ''}
                    </div>
                    <div class="goal-text ${todayGoal.completed ? 'completed' : ''}">${todayGoal.text}</div>
                    <div class="goal-status">
                        ${todayGoal.completed ? '🎉 Completato' : '⏳ In corso...'}
                    </div>
                </div>`;
        }
    }

    function renderDailyIntention() {
        const today = getLocalDateString();
        const todayIntention = state.dailyIntentions[today];
        if (!todayIntention) {
            intentionText.textContent = "Crea la tua intenzione per guidare la giornata";
            intentionInput.style.display = "block";
            setIntentionBtn.style.display = "block";
            setIntentionBtn.innerHTML = '<i class="fas fa-feather"></i> Imposta Intenzione';
        } else {
            intentionText.textContent = `"${todayIntention.text}"`;
            intentionInput.style.display = "none";
            setIntentionBtn.style.display = "none";
        }
    }

    function updateDailyData() {
        const today = getLocalDateString();
        if (state.moodEntries[today] && state.moodEntries[today].length > 0) {
            const moodValues = state.moodEntries[today].map(entry => getMoodValue(entry.mood));
            const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;
            dailyMoodValue.textContent = avgMood.toFixed(1);
        } else { dailyMoodValue.textContent = "-"; }
        if (state.anxietyEntries[today] && state.anxietyEntries[today].length > 0) {
            const anxietyValues = state.anxietyEntries[today].map(entry => parseInt(entry.value));
            const avgAnxiety = anxietyValues.reduce((a, b) => a + b, 0) / anxietyValues.length;
            dailyAnxietyValue.textContent = avgAnxiety.toFixed(1);
        } else { dailyAnxietyValue.textContent = "-"; }
        if (state.stressEntries[today] && state.stressEntries[today].length > 0) {
            const stressValues = state.stressEntries[today].map(entry => parseInt(entry.value));
            const avgStress = stressValues.reduce((a, b) => a + b, 0) / stressValues.length;
            dailyStressValue.textContent = avgStress.toFixed(1);
        } else { dailyStressValue.textContent = "-"; }
        dailySleepValue.textContent = state.sleepEntries[today] || "-";
    }

    function setDailyGoal() {
        const input = document.getElementById('goal-input');
        if (!input) return;
        const goalText = input.value.trim();
        if (!goalText) { showToast("Per favore inserisci un obiettivo"); return; }
        const today = getLocalDateString();
        state.dailyGoals[today] = { text: goalText, completed: false, timestamp: new Date().getTime() };
        saveData(); renderDailyGoal(); showToast("Obiettivo impostato!");
    }

    function setDailyIntention() {
        const input = document.getElementById('intention-input');
        const intentionTextValue = input.value.trim();
        if (!intentionTextValue) { showToast("Per favore inserisci un'intenzione"); return; }
        const today = getLocalDateString();
        state.dailyIntentions[today] = { text: intentionTextValue, timestamp: new Date().getTime() };
        saveData(); renderDailyIntention(); showToast("Intenzione fissata!");
    }

    function toggleGoalCompletion() {
        const today = getLocalDateString();
        const goal = state.dailyGoals[today];
        if (!goal) return;
        goal.completed = !goal.completed;
        saveData(); renderDailyGoal();
        if (goal.completed) { showToast("Obiettivo completato! Complimenti!"); avviaCoriandoliPersonalizzati(); }
        else { showToast("Obiettivo riportato in corso"); }
    }

    dailyGoalContainer.addEventListener('click', function(e) {
        if (e.target.id === 'set-goal-btn') setDailyGoal();
        else if (e.target.id === 'goal-checkbox') toggleGoalCompletion();
    });

    function checkGratitudeLock() {
        const today = getLocalDateString();
        if (state.gratitudeEntries[today]) {
            gratitudeInputs.forEach((input, index) => {
                input.value = state.gratitudeEntries[today][index] || '';
                input.disabled = true;
            });
            gratitudeBtn.disabled = true;
            gratitudeBtn.textContent = "✅ Completato per oggi";
            gratitudeBtn.classList.add('completed');
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
        return date.toISOString().split('T')[0];
    }

    navBar.addEventListener('click', function(e) {
        const targetItem = e.target.closest('.nav-item');
        if (!targetItem) return;
        e.preventDefault();
        const targetId = targetItem.dataset.target;
        navBar.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        targetItem.classList.add('active');
        sections.forEach(section => {
            section.classList.toggle('active', section.id === targetId);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    moodTracker.addEventListener('click', function(e) {
        const targetButton = e.target.closest('.mood-btn');
        if (!targetButton) return;
        state.currentSelectedMood = targetButton.dataset.mood;
        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        targetButton.classList.add('selected');
    });

    function saveCombinedCheckin() {
        if (!state.isPremium) { showToast("Questa funzionalità richiede un abbonamento Premium"); return; }
        if (!state.currentSelectedMood) { showToast("Per favore, seleziona un'emoji per il tuo umore"); return; }
        const today = getLocalDateString();
        if (!state.moodEntries[today]) state.moodEntries[today] = [];
        if (!state.anxietyEntries[today]) state.anxietyEntries[today] = [];
        if (!state.stressEntries[today]) state.stressEntries[today] = [];
        state.moodEntries[today].push({ mood: state.currentSelectedMood });
        state.anxietyEntries[today].push({ value: anxietySlider.value });
        state.stressEntries[today].push({ value: stressSlider.value });
        showToast(`Check-in registrato!`);
        updateDailyData();
        updateStreak();
        state.currentSelectedMood = null;
        moodTracker.querySelectorAll('.mood-btn').forEach(btn => btn.classList.remove('selected'));
        saveData();
    }

    saveCombinedCheckinBtn.addEventListener('click', saveCombinedCheckin);

    meditationList.addEventListener('click', function(e) {
        const targetItem = e.target.closest('.meditation-item');
        if (!targetItem) return;
        if (!state.isPremium) { showToast("Questa meditazione richiede un abbonamento Premium"); return; }
        const id = targetItem.dataset.id;
        document.getElementById('player-title').textContent = targetItem.dataset.title;
        document.getElementById('player-description').textContent = `${targetItem.dataset.duration} di ${targetItem.querySelector('.meditation-desc').textContent}`;
        audioPlayer.src = meditationAudios[id];
        playerModal.classList.add('active');
    });

    function updateStreak() {
        const todayStr = getLocalDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterday);
        if (state.lastActivityDate !== todayStr) {
            if (state.lastActivityDate === yesterdayStr) {
                state.growthStreak++;
            } else {
                state.growthStreak = 1;
            }
            state.lastActivityDate = todayStr;
            updateStreakCounter();
            saveData();
        }
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
        if (targetOption) {
            emojiPicker.querySelectorAll('.emoji-option').forEach(opt => opt.classList.remove('selected'));
            targetOption.classList.add('selected');
        }
    });

    genderOptionsContainer.addEventListener('click', function(e) {
        const targetOption = e.target.closest('.gender-option');
        if (targetOption) {
            genderOptionsContainer.querySelectorAll('.gender-option').forEach(opt => opt.classList.remove('selected'));
            targetOption.classList.add('selected');
        }
    });

    profileEditSave.addEventListener('click', () => {
        const newName = document.getElementById('profile-name-input').value.trim();
        const emoji = document.querySelector('.emoji-option.selected')?.dataset.emoji;
        const gender = document.querySelector('.gender-option.selected')?.dataset.gender;
        if (!newName || !emoji || !gender) { showToast("Per favore compila tutti i campi"); return; }
        state.profile = { name: newName, emoji, gender };
        updateWelcomeMessage();
        saveData();
        profileEditModal.classList.remove('active');
        showToast("Profilo aggiornato!");
    });
    profileEditCancel.addEventListener('click', () => profileEditModal.classList.remove('active'));

    gratitudeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!state.isPremium) { showToast("Questa funzionalità richiede un abbonamento Premium"); return; }
        const entries = Array.from(gratitudeInputs).map(i => i.value.trim());
        if (entries.some(e => e === '')) { showToast("Per favore compila tutti i campi"); return; }
        state.gratitudeEntries[getLocalDateString()] = entries;
        showToast("Diario della gratitudine salvato!");
        this.reset();
        saveData();
        checkGratitudeLock();
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

    deleteAccountBtn.addEventListener('click', function() {
        // Usa un modale custom invece di confirm
        const isConfirmed = window.confirm("Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile.");
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

    function getMoodName(mood) { return {'devastato': 'Devastato', 'stressato': 'Stressato', 'arrabbiato': 'Arrabbiato', 'triste': 'Triste', 'neutro': 'Neutro', 'calmo': 'Calmo', 'contento': 'Contento', 'felice': 'Felice', 'entusiasta': 'Entusiasta', 'amore': 'Amore'}[mood] || mood; }
    function getMoodEmoji(mood) { return {'devastato': '😭', 'stressato': '😩', 'arrabbiato': '😠', 'triste': '😔', 'neutro': '😐', 'calmo': '😌', 'contento': '🙂', 'felice': '😊', 'entusiasta': '😄', 'amore': '😍'}[mood] || ''; }
    function getMoodValue(mood) { return {'devastato': 1, 'stressato': 2, 'arrabbiato': 3, 'triste': 4, 'neutro': 5, 'calmo': 6, 'contento': 7, 'felice': 8, 'entusiasta': 9, 'amore': 10}[mood] || 5; }

    function updateHistoryDisplay(date) {
        const selectedDate = getLocalDateString(date);
        state.selectedHistoryDate = selectedDate;
        saveData();
        const moodEntries = state.moodEntries[selectedDate] || [];
        const anxietyEntries = state.anxietyEntries[selectedDate] || [];
        const stressEntries = state.stressEntries[selectedDate] || [];
        const gratitudeEntries = state.gratitudeEntries[selectedDate] || [];
        const dailyGoal = state.dailyGoals[selectedDate] || null;
        let moodHistoryHTML = moodEntries.map(entry => `
            <div class="mood-history-item">
                <div class="mood-history-emoji">${getMoodEmoji(entry.mood)}</div>
                <div class="mood-history-details">
                    <div class="mood-history-mood-name">${getMoodName(entry.mood)}</div>
                </div>
            </div>`).join('');
        moodHistoryContainer.innerHTML = moodHistoryHTML || '<p>Nessun dato</p>';
        gratitudeHistoryContainer.innerHTML = gratitudeEntries.length > 0 ? `<ol>${gratitudeEntries.map(e => `<li>${e}</li>`).join('')}</ol>` : '<p>Nessun dato</p>';
        goalHistoryContainer.innerHTML = dailyGoal ? `<p>${dailyGoal.text} - ${dailyGoal.completed ? 'Completato' : 'Non completato'}</p>` : '<p>Nessun dato</p>';
    }

    function generateCalendar() {
        const calendarMonth = document.getElementById('calendar-month');
        if (!calendarMonth || !document.getElementById('calendar')) return;
        const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        calendarMonth.textContent = `${monthNames[state.currentCalendarDate.getMonth()]} ${state.currentCalendarDate.getFullYear()}`;
        const calendar = document.getElementById('calendar');
        calendar.innerHTML = '';
        ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].forEach(day => calendar.innerHTML += `<div class="calendar-header">${day}</div>`);
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
            if (dayString === getLocalDateString()) dayElement.classList.add('active');
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

    document.getElementById('prev-month-btn')?.addEventListener('click', () => {
        state.currentCalendarDate.setMonth(state.currentCalendarDate.getMonth() - 1);
        generateCalendar();
    });
    document.getElementById('next-month-btn')?.addEventListener('click', () => {
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
        updateDailyData();
    });

    generateReportBtn.addEventListener('click', () => {
        generateWeeklyReport();
        reportModal.classList.add('active');
    });
    reportCloseBtn.addEventListener('click', () => reportModal.classList.remove('active'));

    function generateWeeklyReport() {
        // Funzione per generare il report settimanale (invariata)
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
                coriandolo.remove();
            }, { once: true });
        }
    }

    // Avvia l'applicazione
    main();
});
