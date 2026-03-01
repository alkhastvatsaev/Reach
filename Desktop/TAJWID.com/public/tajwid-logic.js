
      // DUO MODE LOGIC
      let peer = null;
      let duoRole = null;
      let duoConnection = null;

      function openDuoSelector() {
        document.getElementById("duo-selector-overlay").style.display = "flex";
      }

      function closeDuoSelector() {
        document.getElementById("duo-selector-overlay").style.display = "none";
      }

      async function selectDuoRole(role) {
        duoRole = role;
        closeDuoSelector();

        // Hide overlay immediately
        const startOverlay = document.getElementById("start-overlay");
        startOverlay.style.opacity = "0";
        setTimeout(() => (startOverlay.style.display = "none"), 500);

        // Show duo UI
        document.getElementById("duo-panels-container").style.display = "flex";

        // Highlights local panel
        const roleId = role === "User 1" ? "user1" : "user2";
        document.getElementById(`panel-${roleId}`).classList.add("active");

        initDuoMode(role);
      }

      async function initDuoMode(role) {
        console.log("Initializing Duo Mode for:", role);

        // Request micro first for both PeerJS and standard recognition
        try {
          if (!currentStream) {
            currentStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
            });
            console.log("Microphone access granted:", currentStream.id);
          }
        } catch (e) {
          console.error("Microphone access error:", e);
          alert("Erreur micro: " + e.message);
          return;
        }

        const roleId = role === "User 1" ? "user1" : "user2";
        const targetRoleId = role === "User 1" ? "user2" : "user1";
        const peerId = `vatsaev-tajwid-${roleId}`;
        const targetId = `vatsaev-tajwid-${targetRoleId}`;

        peer = new Peer(peerId);

        peer.on("open", (id) => {
          console.log("Connecté avec PeerID:", id);
          updateDuoStatus(role, "online");

          // Local mic feedback
          monitorAudio(currentStream, role);

          // Try to connect to other peer
          setTimeout(() => {
            // Audio Call
            const call = peer.call(targetId, currentStream);
            if (call) {
              console.log("Appel sortant vers", targetId);
              handleCall(call);
            }
            // Data Connection
            const conn = peer.connect(targetId);
            if (conn) {
              setupDuoConnection(conn);
            }
          }, 3000);
        });

        peer.on("connection", (conn) => {
          console.log("Connexion data reçue");
          setupDuoConnection(conn);
        });

        peer.on("call", (call) => {
          console.log("Appel entrant reçu");
          call.answer(currentStream);
          handleCall(call);
        });

        peer.on("error", (err) => {
          console.warn("PeerJS warning:", err);
        });

        // Also start standard recognition
        startRecognition();
      }

      function handleCall(call) {
        call.on("stream", (stream) => {
          console.log("Flux audio distant reçu");
          let audio = document.getElementById("duo-audio-player");
          if (!audio) {
            audio = document.createElement("audio");
            audio.id = "duo-audio-player";
            audio.setAttribute("autoplay", "true");
            audio.setAttribute("playsinline", "true");
            audio.style.display = "none";
            document.body.appendChild(audio);
          }
          audio.srcObject = stream;
          audio.play().catch((e) => {
            console.warn("Autoplay bloqué, ajout du bouton de déblocage");
            let btn = document.getElementById("duo-unmute-btn");
            if (!btn) {
              btn = document.createElement("button");
              btn.id = "duo-unmute-btn";
              btn.innerHTML = "🔊 ACTIVER LE SON DU DUO";
              btn.className = "btn-duo";
              btn.style.position = "fixed";
              btn.style.top = "20px";
              btn.style.left = "50%";
              btn.style.transform = "translateX(-50%)";
              btn.style.zIndex = "12000";
              btn.onclick = () => {
                audio.play();
                btn.remove();
              };
              document.body.appendChild(btn);
            }
          });

          const otherRole = duoRole === "User 1" ? "User 2" : "User 1";
          updateDuoStatus(otherRole, "online");
          monitorAudio(stream, otherRole);
        });
      }

      function updateDuoStatus(role, status) {
        const roleId =
          role === "User 1"
            ? "user1"
            : role === "User 2"
              ? "user2"
              : role.toLowerCase();
        const dot = document.getElementById(`status-${roleId}`);
        if (dot) dot.classList.add("online");
      }

      async function monitorAudio(stream, role) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContext();

        // Mobile Fix: Resume context on user action if needed (but selectDuoRole is a click)
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const roleId =
          role === "User 1"
            ? "user1"
            : role === "User 2"
              ? "user2"
              : role.toLowerCase();
        const micIndicator = document.getElementById(`mic-${roleId}`);

        function check() {
          if (!micIndicator) return;
          analyser.getByteFrequencyData(dataArray);
          let avg = dataArray.reduce((p, c) => p + c, 0) / dataArray.length;

          if (avg > 10) micIndicator.classList.add("active");
          else micIndicator.classList.remove("active");

          requestAnimationFrame(check);
        }
        check();
      }

      const SURAHS_LIST = [
        "Al-Fatihah",
        "Al-Baqarah",
        "Ali 'Imran",
        "An-Nisa'",
        "Al-Ma'idah",
        "Al-An'am",
        "Al-A'raf",
        "Al-Anfal",
        "At-Tawbah",
        "Yunus",
        "Hud",
        "Yusuf",
        "Ar-Ra'd",
        "Ibrahim",
        "Al-Hijr",
        "An-Nahl",
        "Al-Isra'",
        "Al-Kahf",
        "Maryam",
        "Ta-Ha",
        "Al-Anbiya'",
        "Al-Hajj",
        "Al-Mu'minun",
        "An-Nur",
        "Al-Furqan",
        "Ash-Shu'ara'",
        "An-Naml",
        "Al-Qasas",
        "Al-'Ankabut",
        "Ar-Rum",
        "Luqman",
        "As-Sajdah",
        "Al-Ahzab",
        "Saba'",
        "Fatir",
        "Ya-Sin",
        "As-Saffat",
        "Sad",
        "Az-Zumar",
        "Ghafir",
        "Fussilat",
        "Ash-Shura",
        "Az-Zukhruf",
        "Ad-Dukhan",
        "Al-Jathiyah",
        "Al-Ahqaf",
        "Muhammad",
        "Al-Fath",
        "Al-Hujurat",
        "Qaf",
        "Adh-Dhariyat",
        "At-Tur",
        "An-Najm",
        "Al-Qamar",
        "Ar-Rahman",
        "Al-Waqi'ah",
        "Al-Hadid",
        "Al-Mujadilah",
        "Al-Hashr",
        "Al-Mumtahanah",
        "As-Saff",
        "Al-Jumu'ah",
        "Al-Munafiqun",
        "At-Taghabun",
        "At-Talaq",
        "At-Tahrim",
        "Al-Mulk",
        "Al-Qalam",
        "Al-Haqqah",
        "Al-Ma'arij",
        "Nuh",
        "Al-Jinn",
        "Al-Muzzammil",
        "Al-Muddaththir",
        "Al-Qiyamah",
        "Al-Insan",
        "Al-Mursalat",
        "An-Naba'",
        "An-Nazi'at",
        "'Abasa",
        "At-Takwir",
        "Al-Infitar",
        "Al-Mutaffifin",
        "Al-Inshiqaq",
        "Al-Buruj",
        "At-Tariq",
        "Al-A'la",
        "Al-Ghashiyah",
        "Al-Fajr",
        "Al-Balad",
        "Ash-Shams",
        "Al-Layl",
        "Ad-Duha",
        "Ash-Sharh",
        "At-Tin",
        "Al-'Alaq",
        "Al-Qadr",
        "Al-Bayyinah",
        "Az-Zalzalah",
        "Al-'Adiyat",
        "Al-Qari'ah",
        "At-Takathur",
        "Al-'Asr",
        "Al-Humazah",
        "Al-Fil",
        "Quraysh",
        "Al-Ma'un",
        "Al-Kawthar",
        "Al-Kafirun",
        "An-Nasr",
        "Al-Masad",
        "Al-Ikhlas",
        "Al-Falaq",
        "An-Nas",
      ];

      const VERSES_LIBRARY = []; // Sera rempli dynamiquement
      let verseData = [];
      let activeVerseIdx = 0;
      let currentLang = "fr";
      let currentIdx = 0;
      let isRecording = false;
      let recognition = null;
      let mediaRec = null;
      let audioChunks = [];
      let currentStream = null;
      let sessionDiagnostics = {
        ref: "",
        expected: [],
        heard: [],
        matches: [],
        errors: [],
        startTime: null,
      };
      let audioCtx = null;
      let analyser = null;
      let lastVolumeUpdate = 0;
      let favorites =
        JSON.parse(localStorage.getItem("tajwid_favorites")) || [];
      let completedRefs =
        JSON.parse(localStorage.getItem("tajwid_completed")) || [];

      const translations = {
        fr: {
          start: "Touchez pour commencer",
          download: "Télécharger ma récitation",
          legMadd: "Allonger",
          legGhunnah: "Nez",
          legIkhfa: "Cacher",
          warnMadd: "Allongez ! 2 temps",
          warnGhunnah: "Nez ! (Ghunnah)",
          warnIkhfa: "Cacher ! (Ikhfā’)",
          warnQalqalah: "Rebond ! (Qalqalah)",
          statusListen: "L'IA vous écoute",
          statusMic: "Veuillez autoriser le micro",
          restart: "Recommencer",
          dailyLabel: "Verset du Jour",
          dailySub: "Appuyez pour découvrir",
          browserTitle: "Choisir une Sourate",
          browserSearch: "Chercher une sourate...",
          browserClose: "Fermer",
          statsTitle: "Tableau de Bord",
          statsVerses: "Versets",
          statsFavs: "Favoris",
          statsGoal: "Objectif Coran",
          statsContinue: "Continuer l'apprentissage",
          importTitle: "Nouveau Verset",
          importDesc: "Tapez la référence (ex: 2:255)",
          importPlaceholder: "Surah:Ayah (ex: 18:10)",
          importCancel: "Annuler",
          importBtn: "Importer",
          modalUnderstood: "Compris",
          reportBtn: "Rapport Technique",
          reportSent: "Rapport envoyé au serveur !",
          assistantTitle: "Analyse en direct",
          assistantTarget: "Cible",
          assistantHeard: "Vous dites",
          hintRepeat: "Réessayez : la prononciation est différente.",
          hintAlmost: "Presque ! Articulez un peu plus.",
          summaryTitle: "Bilan de Récitation",
          summaryFluidity: "Fluidité",
          summaryMistakes: "Alertes",
          maddMissed: "Madd oublié",
          expertTitle: "Analyse Tajwid",
          expertLegend: "Légende des Règles",
          legend: {
            madd: "Prolongations (ا و ي)",
            noon: "Noun Sakinah & Tanween",
            ghunnah: "Nasalisation (نّ مّ)",
            qalqalah: "Rebond (ق ط ب ج د)",
            ikhfa: "Dissimulation",
            idgham: "Fusion (ي ر م ل و ن)",
            izhar: "Clarification",
            iqlab: "Ciel (ب)",
          },
          rules: {
            "madd-tabii": {
              tag: "Madd Tabī‘ī",
              title: "Madd Tabī‘ī",
              desc: "Prolongation naturelle de 2 temps sur les lettres Alif, Waw ou Ya.",
            },
            "madd-munfasil": {
              tag: "Madd Munfaṣil",
              title: "Madd Munfaṣil",
              desc: "Prolongation de 4 ou 5 temps quand la Hamza est dans le mot suivant.",
            },
            "madd-muttasil": {
              tag: "Madd Muttaṣil",
              title: "Madd Muttaṣil",
              desc: "Prolongation obligatoire de 4 ou 5 temps quand la Hamza est dans le même mot.",
            },
            "madd-lazim": {
              tag: "Madd Lāzim",
              title: "Madd Lāzim",
              desc: "Prolongation obligatoire de 6 temps due à un Soukoun originel.",
            },
            ikhfa: {
              tag: "Ikhfā’",
              title: "Ikhfā’",
              desc: 'Dissimulation légère du son "N" devant certaines lettres.',
            },
            ghunnah: {
              tag: "Ghunnah",
              title: "Ghunnah",
              desc: "Nasalisation de 2 temps produite par le nez sur les lettres Noun et Mim.",
            },
            "idgham-ghunnah": {
              tag: "Idghām",
              title: "Idghām avec Ghunnah",
              desc: "Fusion du N avec la lettre suivante en passant par le nez.",
            },
            "idgham-no-ghunnah": {
              tag: "Idghām",
              title: "Idghām sans Ghunnah",
              desc: "Fusion complète du N sans nasalisation.",
            },
            izhaar: {
              tag: "Iẓhār",
              title: "Iẓhār",
              desc: "Clarification totale du son N sans aucune nasalisation.",
            },
            iqlab: {
              tag: "Iqlāb",
              title: "Iqlāb",
              desc: 'Transformation du son N en un son "M" devant la lettre Ba.',
            },
            qalqalah: {
              tag: "Qalqalah",
              title: "Qalqalah",
              desc: "Effet de rebond ou de vibration sur les lettres Qof, To, Ba, Jim, Dal.",
            },
          },
        },
        en: {
          start: "Tap to Start",
          download: "Download Recitation",
          legMadd: "Prolong",
          legGhunnah: "Nasal",
          legIkhfa: "Hide",
          warnMadd: "Prolong! 2 counts",
          warnGhunnah: "Nose! (Ghunnah)",
          warnIkhfa: "Hide! (Ikhfā’)",
          warnQalqalah: "Bounce! (Qalqalah)",
          statusListen: "AI is listening",
          statusMic: "Please allow microphone",
          restart: "Restart",
          dailyLabel: "Verse of the Day",
          dailySub: "Tap to discover",
          browserTitle: "Choose a Surah",
          browserSearch: "Search surah...",
          browserClose: "Close",
          statsTitle: "Dashboard",
          statsVerses: "Verses",
          statsFavs: "Favorites",
          statsGoal: "Quran Goal",
          statsContinue: "Continue Learning",
          importTitle: "New Verse",
          importDesc: "Type reference (ex: 2:255)",
          importPlaceholder: "Surah:Ayah (ex: 18:10)",
          importCancel: "Cancel",
          importBtn: "Import",
          modalUnderstood: "Understood",
          reportBtn: "Technical Report",
          reportSent: "Report sent to server!",
          assistantTitle: "Live Analysis",
          assistantTarget: "Target",
          assistantHeard: "You say",
          hintRepeat: "Try again: pronunciation is different.",
          hintAlmost: "Almost! Articulate a bit more.",
          summaryTitle: "Recitation Summary",
          summaryFluidity: "Fluidity",
          summaryMistakes: "Mistakes",
          maddMissed: "Madd missed",
          expertTitle: "Tajwid Analysis",
          expertLegend: "Rule Legend",
          legend: {
            madd: "Prolongations (ا و ي)",
            noon: "Noon Sakinah & Tanween",
            ghunnah: "Nasalization (نّ مّ)",
            qalqalah: "Bounce (ق ط ب ج د)",
            ikhfa: "Hiding",
            idgham: "Merging (ي ر م ل و ن)",
            izhar: "Clarification",
            iqlab: "Conversion (ب)",
          },
          rules: {
            "madd-tabii": {
              tag: "Madd Tabī‘ī",
              title: "Madd Tabī‘ī",
              desc: "Natural prolongation of 2 counts on Alif, Waw, or Ya.",
            },
            "madd-munfasil": {
              tag: "Madd Munfaṣil",
              title: "Madd Munfaṣil",
              desc: "Extension of 4 or 5 counts when Hamza is in the next word.",
            },
            "madd-muttasil": {
              tag: "Madd Muttaṣil",
              title: "Madd Muttaṣil",
              desc: "Mandatory extension of 4 or 5 counts when Hamza is in the same word.",
            },
            "madd-lazim": {
              tag: "Madd Lāzim",
              title: "Madd Lāzim",
              desc: "Mandatory extension of 6 counts due to a permanent Sukun.",
            },
            ikhfa: {
              tag: "Ikhfā’",
              title: "Ikhfā’",
              desc: 'Light hiding of the "N" sound before specific letters.',
            },
            ghunnah: {
              tag: "Ghunnah",
              title: "Ghunnah",
              desc: "Deep nasalization of 2 counts produced from the nose.",
            },
            "idgham-ghunnah": {
              tag: "Idghām",
              title: "Idghām with Ghunnah",
              desc: "Merging the N into the next letter with nasalization.",
            },
            "idgham-no-ghunnah": {
              tag: "Idghām",
              title: "Idghām without Ghunnah",
              desc: "Complete merging of the N without nasalization.",
            },
            izhaar: {
              tag: "Iẓhār",
              title: "Iẓhār",
              desc: "Total clarification of the rule without nasalization.",
            },
            iqlab: {
              tag: "Iqlāb",
              title: "Iqlāb",
              desc: 'Transformation of the N sound into an "M" sound before Ba.',
            },
            qalqalah: {
              tag: "Qalqalah",
              title: "Qalqalah",
              desc: "Bouncing the sound on letters Qof, To, Ba, Jim, Dal.",
            },
          },
        },
        ru: {
          start: "Нажмите, чтобы начать",
          download: "Скачать чтение",
          legMadd: "Тянуть",
          legGhunnah: "Нос",
          legIkhfa: "Скрыть",
          warnMadd: "Тяните! 2 счета",
          warnGhunnah: "В нос! (Гунна)",
          warnIkhfa: "Скрывайте! (Ихфа)",
          warnQalqalah: "Толчок! (Калькаля)",
          statusListen: "ИИ слушает",
          statusMic: "Разрешите микрофон",
          restart: "Начать сначала",
          dailyLabel: "Аят дня",
          dailySub: "Нажмите, чтобы узнать",
          browserTitle: "Выберите суру",
          browserSearch: "Поиск суры...",
          browserClose: "Закрыть",
          statsTitle: "Панель приборов",
          statsVerses: "Аяты",
          statsFavs: "Избранное",
          statsGoal: "Цель Коран",
          statsContinue: "Продолжить обучение",
          importTitle: "Новый аят",
          importDesc: "Введите ссылку (напр: 2:255)",
          importPlaceholder: "Сура:Аят (напр: 18:10)",
          importCancel: "Отмена",
          importBtn: "Импорт",
          modalUnderstood: "Понятно",
          reportBtn: "Технический отчет",
          reportSent: "Отчет отправлен!",
          assistantTitle: "Анализ в реальном времени",
          assistantTarget: "Цель",
          assistantHeard: "Вы говорити",
          hintRepeat: "Попробуйте еще раз: произношение отличается.",
          hintAlmost: "Почти! Артикулируйте немного четче.",
          summaryTitle: "Итоги чтения",
          summaryFluidity: "Беглость",
          summaryMistakes: "Ошибки",
          maddMissed: "Мадд пропущен",
          expertTitle: "Анализ Таджвида",
          expertLegend: "Легенда Правил",
          legend: {
            madd: "Удлинения (ا و ي)",
            noon: "Нун Сакина и Танвин",
            ghunnah: "Гунна (نّ مّ)",
            qalqalah: "Калькаля (ق ط ب ج д)",
            ikhfa: "Ихфа",
            idgham: "Идгам (ي ر م ل و ن)",
            izhar: "Изхар",
            iqlab: "Икляб (ب)",
          },
          rules: {
            "madd-tabii": {
              tag: "Мадд Табии",
              title: "Мадд Табии",
              desc: "Естественное удлинение на 2 счета (буквы Алиф, Вав, Йа).",
            },
            "madd-munfasil": {
              tag: "Мадд Мунфасиль",
              title: "Мадд Мунфасиль",
              desc: "Удлинение на 4 или 5 счетов, когда Хамза находится в следующем слове.",
            },
            "madd-muttasil": {
              tag: "Мадд Муттасиль",
              title: "Мадд Муттасиль",
              desc: "Обязательное удлинение на 4 или 5 счетов, когда Хамза в том же слове.",
            },
            "madd-lazim": {
              tag: "Мадд Лязим",
              title: "Мадд Лязим",
              desc: "Обязательное удлинение на 6 счетов из-за постоянного сукуна.",
            },
            ikhfa: {
              tag: "Ихфа",
              title: "Ихфа",
              desc: "Скрытие звука «Н» перед определенными буквами.",
            },
            ghunnah: {
              tag: "Гунна",
              title: "Гунна",
              desc: "Назализация (2 счета), выходящая из носа.",
            },
            "idgham-ghunnah": {
              tag: "Идгам",
              title: "Идгам с гунной",
              desc: "Слияние звука Н со следующей буквой с назализацией.",
            },
            "idgham-no-ghunnah": {
              tag: "Идгам",
              title: "Идгам без гунны",
              desc: "Полное слияние звука Н без назализации.",
            },
            izhaar: {
              tag: "Изхар",
              title: "Изхар",
              desc: "Четкое произношение звука Н без назализации.",
            },
            iqlab: {
              tag: "Икляб",
              title: "Икляб",
              desc: "Превращение звука Н в звук «М» перед буквой Ба.",
            },
            qalqalah: {
              tag: "Калькаля",
              title: "Калькаля",
              desc: "Вибрация или «толчок» звука для букв Каф, Та, Ба, Джим, Даль.",
            },
          },
        },
      };

      function setLanguage(lang) {
        currentLang = lang;
        const t = translations[lang];

        if (document.getElementById("txt-start"))
          document.getElementById("txt-start").innerText = t.start;
        if (document.getElementById("txt-download"))
          document.getElementById("txt-download").innerText = t.download;
        if (document.getElementById("txt-daily-label"))
          document.getElementById("txt-daily-label").innerText = t.dailyLabel;
        if (document.getElementById("txt-daily-sub"))
          document.getElementById("txt-daily-sub").innerText = t.dailySub;
        if (document.getElementById("restart-btn"))
          document.getElementById("restart-btn").innerText = t.restart;
        if (document.getElementById("next-verse-btn"))
          document.getElementById("next-verse-btn").innerText = t.nextVerse;

        if (document.getElementById("txt-browser-title"))
          document.getElementById("txt-browser-title").innerText =
            t.browserTitle;
        if (document.getElementById("surah-search"))
          document.getElementById("surah-search").placeholder = t.browserSearch;
        if (document.getElementById("txt-browser-close"))
          document.getElementById("txt-browser-close").innerText =
            t.browserClose;

        if (document.getElementById("txt-stats-title"))
          document.getElementById("txt-stats-title").innerText = t.statsTitle;
        if (document.getElementById("txt-stats-verses"))
          document.getElementById("txt-stats-verses").innerText = t.statsVerses;
        if (document.getElementById("txt-stats-favs"))
          document.getElementById("txt-stats-favs").innerText = t.statsFavs;
        if (document.getElementById("txt-stats-goal"))
          document.getElementById("txt-stats-goal").innerText = t.statsGoal;
        if (document.getElementById("txt-stats-continue"))
          document.getElementById("txt-stats-continue").innerText =
            t.statsContinue;

        if (document.getElementById("txt-import-title"))
          document.getElementById("txt-import-title").innerText = t.importTitle;
        if (document.getElementById("txt-import-desc"))
          document.getElementById("txt-import-desc").innerText = t.importDesc;
        if (document.getElementById("import-ref"))
          document.getElementById("import-ref").placeholder =
            t.importPlaceholder;
        if (document.getElementById("txt-import-cancel"))
          document.getElementById("txt-import-cancel").innerText =
            t.importCancel;
        if (document.getElementById("btn-import-exec"))
          document.getElementById("btn-import-exec").innerText = t.importBtn;
        if (document.getElementById("report-btn-text"))
          document.getElementById("report-btn-text").innerText = t.reportBtn;
        if (document.querySelector(".close-modal"))
          document.querySelector(".close-modal").innerText = t.modalUnderstood;

        if (document.getElementById("txt-assistant-title"))
          document.getElementById("txt-assistant-title").innerText =
            t.assistantTitle;
        if (document.getElementById("txt-assistant-target"))
          document.getElementById("txt-assistant-target").innerText =
            t.assistantTarget;
        if (document.getElementById("txt-assistant-heard"))
          document.getElementById("txt-assistant-heard").innerText =
            t.assistantHeard;
        if (document.getElementById("txt-expert-title")) {
          const icon =
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 17L12 22L22 17"/><path d="M2 12L12 17L22 12"/><path d="M12 2L2 7L12 12L22 7L12 2Z"/></svg>';
          document.getElementById("txt-expert-title").innerHTML =
            icon + t.expertTitle;
        }

        // Populate Legend
        const legendContainer = document.getElementById("expert-legend");
        if (legendContainer) {
          legendContainer.innerHTML = `
                <div class="legend-title">${t.expertLegend}</div>
                <div class="legend-grid">
                    <div class="legend-item">
                        <div class="legend-label" style="background:#64D2FF">Madd</div>
                        <div class="legend-letters">ا و ي</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label" style="background:#34C759">Ghunnah</div>
                        <div class="legend-letters">نّ مّ</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label" style="background:#FF9F0A">Ikhfa</div>
                        <div class="legend-letters">ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label" style="background:#AF52DE">Idgham</div>
                        <div class="legend-letters">ي ر م ل و ن</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label" style="background:#FF3B30">Qalqalah</div>
                        <div class="legend-letters">ق ط ب ج د</div>
                    </div>
                    <div class="legend-item">
                        <div class="legend-label" style="background:#8E8E93">Izhar</div>
                        <div class="legend-letters">أ هـ ع ح غ خ</div>
                    </div>
                </div>
            `;
        }

        if (document.getElementById("txt-summary-title"))
          document.getElementById("txt-summary-title").innerText =
            t.summaryTitle;
        if (document.getElementById("txt-summary-fluidity"))
          document.getElementById("txt-summary-fluidity").innerText =
            t.summaryFluidity;
        if (document.getElementById("txt-summary-mistakes"))
          document.getElementById("txt-summary-mistakes").innerText =
            t.summaryMistakes;

        const btns = document.querySelectorAll(".lang-btn");
        btns.forEach((btn) => {
          const isActive = btn.innerText.toLowerCase() === lang;
          btn.classList.toggle("active", isActive);
        });

        localStorage.setItem("tajwid_lang", lang);
      }

      function toggleFavoriteCurrent() {
        const ref = VERSES_LIBRARY[activeVerseIdx]?.ref || "";
        const idx = favorites.indexOf(ref);
        if (idx === -1) favorites.push(ref);
        else favorites.splice(idx, 1);
        localStorage.setItem("tajwid_favorites", JSON.stringify(favorites));
        updateFavoriteUI();
      }

      function updateFavoriteUI() {
        const btn = document.getElementById("header-heart");
        const isActive = favorites.includes(
          VERSES_LIBRARY[activeVerseIdx]?.ref,
        );
        btn?.classList.toggle("active", isActive);
      }

      function markAsCompleted(ref) {
        if (!completedRefs.includes(ref)) {
          completedRefs.push(ref);
          localStorage.setItem(
            "tajwid_completed",
            JSON.stringify(completedRefs),
          );
        }
        updateStatsUI();
      }

      function updateStatsUI() {
        document.getElementById("stat-completed").innerText =
          completedRefs.length;
        document.getElementById("stat-favorites").innerText = favorites.length;
        const percent = ((completedRefs.length / 6236) * 100).toFixed(1);
        document.getElementById("progress-percent").innerText = percent + "%";
        document.getElementById("progress-label").innerText = percent + "%";
        document.getElementById("profile-progress-bar").style.width =
          percent + "%";
      }

      function transliterateToCyrillic(text) {
        if (!text) return "";
        const mapping = {
          sh: "ш",
          kh: "х",
          gh: "г",
          th: "с",
          dh: "з",
          ḥ: "х",
          ā: "а",
          ī: "и",
          ū: "у",
          ṣ: "с",
          ḍ: "д",
          ṭ: "т",
          ẓ: "з",
          a: "а",
          b: "б",
          t: "т",
          j: "дж",
          h: "х",
          d: "д",
          r: "р",
          z: "з",
          s: "с",
          f: "ф",
          q: "к",
          k: "к",
          l: "л",
          m: "м",
          n: "н",
          w: "в",
          y: "й",
          u: "у",
          i: "и",
        };
        let result = text.toLowerCase();
        const sortedKeys = Object.keys(mapping).sort(
          (a, b) => b.length - a.length,
        );
        for (const key of sortedKeys) {
          result = result.split(key).join(mapping[key]);
        }
        return result;
      }

      function toArabicNumerals(num) {
        const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
        return num
          .toString()
          .split("")
          .map((digit) => arabicDigits[digit] || digit)
          .join("");
      }

      // === API Quran.com avec tajwid natif ===
      async function fetchVerseFromAPI(surah, ayah) {
        let ref = "";
        let isFullSurah = false;

        if (typeof surah === "string") {
          ref = surah;
          if (!ref.includes(":")) isFullSurah = true;
        } else if (surah && ayah) {
          ref = `${surah}:${ayah}`;
        } else if (surah && !ayah) {
          ref = `${surah}`;
          isFullSurah = true;
        } else {
          ref = document.getElementById("import-ref")?.value.trim();
          if (ref && !ref.includes(":")) isFullSurah = true;
        }

        if (!ref) return;
        if (ref.includes("-") && !isFullSurah) ref = ref.split("-")[0];

        const loader = document.getElementById("import-loader");
        if (loader) loader.style.display = "block";

        try {
          // Updated to support full surah fetching
          let url = "";
          let chapterId = "";

          if (isFullSurah) {
            chapterId = ref;
            url = `https://api.quran.com/api/v4/verses/by_chapter/${chapterId}?words=true&fields=text_uthmani_tajweed&per_page=286`;
          } else {
            chapterId = ref.split(":")[0];
            url = `https://api.quran.com/api/v4/verses/by_key/${ref}?words=true&fields=text_uthmani_tajweed`;
          }

          const response = await fetch(url);
          if (!response.ok) throw new Error("API quran.com non joignable");

          const data = await response.json();
          const chapterRes = await fetch(
            `https://api.quran.com/api/v4/chapters/${chapterId}`,
          );
          const chapter = await chapterRes.json();
          const chapterName = chapter.chapter.name_simple;

          let newEntry = {};

          if (isFullSurah) {
            let combinedText = "";
            let combinedWords = [];
            data.verses.forEach((v) => {
              let text = v.text_uthmani_tajweed.trim();

              // On supprime agressivement tous les chiffres isolés et caractères spéciaux de fin
              // qui ne sont pas dans l'ornement ﴿...﴾
              text = text
                .replace(
                  /[\s\u00A0\u200B-\u200D\uFEFF]*[0-9\u0660-\u0669\u06F0-\u06F9]+[\s\u00A0\u200B-\u200D\uFEFF]*$/g,
                  "",
                )
                .trim();

              if (!text.includes("﴿")) {
                combinedText +=
                  text +
                  ` <span class="end">﴿${toArabicNumerals(v.verse_number)}﴾</span> `;
              } else {
                text = text.replace(
                  /﴿[0-9\u0660-\u0669\u06F0-\u06F9]+﴾/g,
                  (match) => `<span class="end">${match}</span>`,
                );
                combinedText += text + " ";
              }

              const wordsForVerse = v.words
                .filter((w) => w.char_type_name === "word")
                .map((w) => ({
                  en: w.transliteration.text,
                  ru: transliterateToCyrillic(w.transliteration.text),
                }));
              combinedWords = combinedWords.concat(wordsForVerse);
            });

            newEntry = {
              title: chapterName,
              ref: `${chapterName} [1-${data.verses.length}]`,
              text: combinedText,
              words: combinedWords,
            };
          } else {
            const verse = data.verse;
            newEntry = {
              title: chapterName,
              ref: `${chapterName} [${chapterId}:${verse.verse_number}]`,
              text: verse.text_uthmani_tajweed,
              words: verse.words
                .filter((w) => w.char_type_name === "word")
                .map((w) => ({
                  en: w.transliteration.text,
                  ru: transliterateToCyrillic(w.transliteration.text),
                })),
            };
          }

          VERSES_LIBRARY.push(newEntry);
          await switchVerse(VERSES_LIBRARY.length - 1);
          closeImportModal();
          closeQuranBrowser();
        } catch (err) {
          console.error("Erreur API Quran:", err);
          alert("Erreur de chargement : " + err.message);
        } finally {
          if (loader) loader.style.display = "none";
        }
      }

      // === Rendu ultra-optimisé des mots ===
      async function switchVerse(index) {
        activeVerseIdx = index;
        const verse = VERSES_LIBRARY[index];
        loadVerse(index);
        updateFavoriteUI();
        initVerseSelector();

        // Si on est en train d'enregistrer, on force le redémarrage pour synchroniser l'IA
        if (isRecording) {
          recognition?.stop();
          // Le onend se chargera de relancer, mais on peut forcer pour être sûr
          setTimeout(() => {
            if (isRecording) startRecognition();
          }, 300);
        }
      }

      function loadVerse(index) {
        const container = document.getElementById("verse-container");
        const ghostContainer = document.getElementById("ghost-word-container");
        if (!container) return;
        container.innerHTML = "";
        if (ghostContainer) ghostContainer.innerText = "";
        currentIdx = 0;

        const verse = VERSES_LIBRARY[index];
        if (!verse) return;

        const wordsMeta = verse.words || [];
        // SPLIT ROBUSTE : On sépare par n'importe quel type d'espace (standard ou insécable)
        const parts = verse.text
          .split(/[\s\u00A0]+(?![^<]*>)/g)
          .filter((p) => p.trim() !== "");

        let metaIdx = 0;
        const newVerseData = [];
        let lastWasMarker = false;

        parts.forEach((part) => {
          // Nettoyage complet : on vire le HTML ET les caractères invisibles corrupteurs
          const cleanText = part
            .replace(/<[^>]*>/g, "")
            .replace(/[\u200B-\u200D\uFEFF\s\u00A0]/g, "")
            .trim();
          if (!cleanText) return;

          // 1. Détection robuste des marqueurs de verset (avec ou sans ornement, split ou non)
          const isMarker =
            /﴿|﴾/.test(cleanText) ||
            part.includes('class="end"') ||
            part.includes("verse-marker");

          // 2. Détection des chiffres seuls (Arabes ou Latins)
          const isDigitOnly = /^[0-9\u0660-\u0669\u06F0-\u06F9]+$/.test(
            cleanText,
          );

          // 3. Validation de sécurité : s'il n'y a aucune lettre arabe, on ne l'affiche pas (évite les cases vides)
          const hasArabicLetters = /[\u0621-\u064A\u0671]/.test(cleanText);

          if (isMarker || (isDigitOnly && !hasArabicLetters)) {
            // Pour éviter les doublons, on ne rend le marqueur que s'il contient les ornements complets
            // ou si c'est la version officielle wrapée.
            if (
              !lastWasMarker &&
              (cleanText.includes("﴿") || part.includes("end") || isDigitOnly)
            ) {
              const marker = document.createElement("div");
              marker.className = "verse-marker";

              let content = cleanText;
              const match = cleanText.match(/[0-9\u0660-\u0669\u06F0-\u06F9]+/);
              if (match) content = `﴿${match[0]}﴾`;

              marker.innerHTML = content;
              container.appendChild(marker);
              lastWasMarker = true;
            }
            return;
          }

          if (!hasArabicLetters) return;
          lastWasMarker = false;

          const box = document.createElement("div");
          box.className = "word-box";
          box.id = `box-${metaIdx}`;
          if (metaIdx === 0) box.classList.add("active");

          let ruleType = "";
          if (part.includes("madda_normal")) ruleType = "madd-tabii";
          else if (part.includes("madda_permissible"))
            ruleType = "madd-munfasil";
          else if (part.includes("madda_necessary")) ruleType = "madd-muttasil";
          else if (
            part.includes("madda_compulsory") ||
            part.includes("madda_long")
          )
            ruleType = "madd-lazim";
          else if (part.includes("ghunnah")) ruleType = "ghunnah";
          else if (part.includes("idgham_with_ghunnah"))
            ruleType = "idgham-ghunnah";
          else if (part.includes("idgham_without_ghunnah"))
            ruleType = "idgham-no-ghunnah";
          else if (part.includes("ikhfa")) ruleType = "ikhfa";
          else if (part.includes("iqlab")) ruleType = "iqlab";
          else if (part.includes("izhar")) ruleType = "izhaar";
          else if (part.includes("qalqalah")) ruleType = "qalqalah";

          const dotsCount =
            ruleType === "madd-tabii"
              ? 2
              : ruleType === "madd-munfasil" || ruleType === "madd-muttasil"
                ? 4
                : ruleType === "madd-lazim"
                  ? 6
                  : 0;
          const dotsHtml = dotsCount
            ? `<div class="madd-dots-guide">${Array(dotsCount).fill('<div class="dot-pip"></div>').join("")}</div>`
            : "";

          const ruleTag = ruleType
            ? translations[currentLang].rules[ruleType]?.tag || "Tajwid"
            : "";
          const meta = wordsMeta[metaIdx] || { en: "", ru: "" };

          box.innerHTML = `
                ${dotsHtml}
                <div class="arabic-word">${part}</div>
                <div class="translit-container">
                    <div class="translit-en">${meta.en}</div>
                    <div class="translit-ru">${meta.ru}</div>
                </div>
                <div class="manual-validate-btn" onclick="manualValidateWord(${metaIdx}, event)" title="Valider manuellement">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="stt-feedback" id="stt-${metaIdx}"></div>
                <div class="tajwid-warning" id="warn-${metaIdx}">${ruleTag}</div>
            `;
          box.dataset.hasRule = ruleType ? "true" : "false";
          box.dataset.ruleType = ruleType ? ruleType.split("-")[0] : "";
          container.appendChild(box);

          newVerseData.push({ ar: cleanText });
          metaIdx++;
        });

        verseData = newVerseData;
        sessionDiagnostics.expected = verseData.map((w) => normalize(w.ar));
        sessionDiagnostics.ref = verse.ref;

        document
          .getElementById("box-0")
          ?.scrollIntoView({ behavior: "smooth", block: "center" });

        // Mettre à jour le panneau expert
        updateExpertPanel();
        document.getElementById("expert-panel")?.classList.add("visible");
      }

      function toggleExpertPanel() {
        document.getElementById("expert-panel")?.classList.toggle("open");
      }

      function updateExpertPanel() {
        const list = document.getElementById("expert-rules-list");
        if (!list) return;
        list.innerHTML = "";

        // Récupérer toutes les règles uniques du verset actuel
        const detectedRules = [];
        const seen = new Set();

        verseData.forEach((word) => {
          const parts = VERSES_LIBRARY[activeVerseIdx].text.split(
            /[\s\u00A0]+(?![^<]*>)/g,
          );
          const rawPart = parts.find((p) => p.includes(word.ar));
          if (!rawPart) return;

          let type = "";
          if (rawPart.includes("madda_normal")) type = "madd-tabii";
          else if (rawPart.includes("madda_permissible"))
            type = "madd-munfasil";
          else if (rawPart.includes("madda_necessary")) type = "madd-muttasil";
          else if (
            rawPart.includes("madda_compulsory") ||
            rawPart.includes("madda_long")
          )
            type = "madd-lazim";
          else if (rawPart.includes("ghunnah")) type = "ghunnah";
          else if (rawPart.includes("idgham_with_ghunnah"))
            type = "idgham-ghunnah";
          else if (rawPart.includes("idgham_without_ghunnah"))
            type = "idgham-no-ghunnah";
          else if (rawPart.includes("ikhfa")) type = "ikhfa";
          else if (rawPart.includes("iqlab")) type = "iqlab";
          else if (rawPart.includes("izhar")) type = "izhaar";
          else if (rawPart.includes("qalqalah")) type = "qalqalah";

          if (type && !seen.has(word.ar + type)) {
            detectedRules.push({ type, word: word.ar });
            seen.add(word.ar + type);
          }
        });

        if (detectedRules.length === 0) {
          list.innerHTML = `<div style="text-align:center; color:var(--subtext); padding:20px; font-size:0.8rem;">Aucune règle complexe détectée sur ce passage.</div>`;
          return;
        }

        detectedRules.forEach((item, i) => {
          const ruleInfo = translations[currentLang].rules[item.type];
          const div = document.createElement("div");
          div.className = "rule-item";
          div.style.animationDelay = i * 0.1 + "s";
          div.onclick = () => showRuleModal(item.type);
          div.innerHTML = `
                <div class="rule-header">
                    <div class="rule-badge" style="background:${getRuleColor(item.type)}">${ruleInfo.tag}</div>
                    <div class="rule-word">${item.word}</div>
                </div>
                <div class="rule-inst">${ruleInfo.desc}</div>
            `;
          list.appendChild(div);
        });
      }

      function getRuleColor(type) {
        if (type === "madd-tabii") return "#64D2FF"; // Sky Blue
        if (type === "madd-munfasil") return "#007AFF"; // iOS Blue
        if (type === "madd-muttasil") return "#5856D6"; // Indigo
        if (type === "madd-lazim") return "#AF52DE"; // Purple
        if (type === "ghunnah") return "#34C759"; // Green
        if (type === "idgham-ghunnah") return "#FF2D55"; // Pink
        if (type === "idgham-no-ghunnah") return "#8E8E93"; // Grey
        if (type === "ikhfa") return "#FF9F0A"; // Orange
        if (type === "iqlab") return "#FF375F"; // Rose
        if (type === "izhaar") return "#C7C7CC"; // Silver
        if (type === "qalqalah") return "#FF3B30"; // Red
        return "var(--accent)";
      }

      function showRuleModal(type) {
        const rule = translations[currentLang].rules[type];
        if (!rule) return;
        document.getElementById("rule-tag").innerText = rule.tag;
        document.getElementById("rule-title").innerText = rule.title;
        document.getElementById("rule-desc").innerText = rule.desc;
        document.getElementById("modal-overlay").style.display = "flex";
        setTimeout(
          () =>
            document.getElementById("modal-overlay").classList.add("visible"),
          10,
        );
      }

      function openTajweedModal(e) {
        const span = e.target.closest("span");
        if (!span) return;

        const className = span.className;
        let ruleKey = "";

        if (className.includes("madda_normal")) ruleKey = "madd-tabii";
        else if (className.includes("madda")) ruleKey = "madd-fari";
        else if (className.includes("ghunnah")) ruleKey = "ghunnah";
        else if (className.includes("ikhfa")) ruleKey = "ikhfa";
        else if (className.includes("qalqalah")) ruleKey = "qalqalah";
        else if (className.includes("idgham")) ruleKey = "idgham";
        else if (className.includes("izhar")) ruleKey = "izhar";
        else if (className.includes("iqlab"))
          ruleKey = "idgham"; // Iqlab is often grouped with idgham colors
        else if (className.includes("ham_wasl")) ruleKey = "madd-tabii"; // or generic

        const rule = translations[currentLang]?.rules[ruleKey];
        if (rule) {
          document.getElementById("rule-tag").innerText = rule.tag;
          document.getElementById("rule-title").innerText = rule.title;
          document.getElementById("rule-desc").innerText = rule.desc;
          document.getElementById("modal-overlay").style.display = "flex";
        }
      }

      // === Daily Verse Logic ===
      let dailyVerse = null;
      function getDailyVerseRef() {
        const d = new Date();
        const seed =
          d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
        const random = (s) => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        const sIdx = Math.floor(random(seed) * 114) + 1;
        return { sNum: sIdx, aNum: 1, name: SURAHS_LIST[sIdx - 1] };
      }

      async function initDailyVerse() {
        const ref = getDailyVerseRef();
        dailyVerse = ref;
        const el = document.getElementById("daily-ref-text");
        if (el) el.innerText = `${ref.name} [${ref.sNum}:${ref.aNum}]`;
      }

      async function loadDailyVerse() {
        if (!dailyVerse) return;
        // On change le texte pour indiquer l'action
        const startTxt = document.getElementById("txt-start");
        if (startTxt) startTxt.innerText = "Chargement...";

        // On récupère le verset d'abord, mais on s'assure que l'appel est rapide
        await fetchVerseFromAPI(dailyVerse.sNum, dailyVerse.aNum);
        // Puis on lance la reconnaissance (le geste utilisateur est généralement conservé si < 1-2s)
        startRecognition();
      }

      // === Reconnaissance vocale + audio optimisés ===
      let isInitializingMicrophone = false;

      async function startRecognition() {
        console.log("startRecognition invoked");

        if (isRecording || isInitializingMicrophone) return;
        isInitializingMicrophone = true;

        const overlay = document.getElementById("start-overlay");
        const startTxt = document.getElementById("txt-start");

        // Removing strict HTTP restriction during testing to allow Dev Server IPs


        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          alert(
            "Votre navigateur ne supporte pas la reconnaissance vocale. Utilisez Chrome ou Safari.",
          );
          return;
        }

        if (startTxt)
          startTxt.innerText =
            translations[currentLang]?.statusMic || "Autorisation micro...";

        try {
          console.log("Demande micro...");
          let stream = currentStream;
          if (!stream) {
            if (
              !navigator.mediaDevices ||
              !navigator.mediaDevices.getUserMedia
            ) {
              throw new Error("L'API MediaDevices n'est pas disponible.");
            }
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            currentStream = stream;
          }
          console.log("Stream prêt pour la reconnaissance");

          // Initialisation diagnostic
          sessionDiagnostics = {
            ref: VERSES_LIBRARY[activeVerseIdx]?.ref || "Inconnu",
            expected: verseData.map((w) => normalize(w.ar)),
            heard: [],
            matches: [],
            errors: [],
            startTime: performance.now(),
          };

          // Succès : on cache l'overlay et on marque comme enregistrant
          isRecording = true;
          if (overlay) overlay.style.display = "none";
          const appLayout = document.getElementById("app-layout");
          if (appLayout) appLayout.style.display = "flex";
          document.getElementById("live-assistant")?.classList.add("visible");
          resetUI();
          updateAssistantWords();

          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) {
            console.error("AudioContext not supported");
          } else {
            audioCtx = new AudioContext();
            if (audioCtx.state === "suspended") {
              await audioCtx.resume();
            }
            const source = audioCtx.createMediaStreamSource(stream);
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            lastVolumeUpdate = 0;
            trackVolume();
          }

          // MediaRecorder pour sauvegarde optionnelle
          try {
            const formats = [
              "audio/webm",
              "audio/mp4",
              "audio/aac",
              "audio/ogg",
            ];
            let mimeType = "";
            for (const f of formats) {
              if (MediaRecorder.isTypeSupported(f)) {
                mimeType = f;
                break;
              }
            }

            mediaRec = new MediaRecorder(
              stream,
              mimeType
                ? { mimeType, audioBitsPerSecond: 64000 }
                : { audioBitsPerSecond: 64000 },
            );
            audioChunks = [];
            mediaRec.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunks.push(e.data);
            };
            mediaRec.start(1000);
          } catch (mrErr) {
            console.warn("MediaRecorder non supporté:", mrErr);
          }

          // Speech Recognition
          if (recognition) {
              try { recognition.stop(); } catch (e) {}
          }
          recognition = new SpeechRecognition();
          recognition.lang = "ar-SA";
          recognition.continuous = true;
          recognition.interimResults = true;

          if (verseData && verseData.length > 0) {
            const normalizedWords = verseData
              .map((w) => w.ar)
              .filter(Boolean)
              .join(" | ");
            const grammar = `#JSGF V1.0; grammar quran; public <ayah> = ${normalizedWords} ;`;
            const SpeechGrammarList =
              window.SpeechGrammarList || window.webkitSpeechGrammarList;
            if (SpeechGrammarList) {
              const list = new SpeechGrammarList();
              list.addFromString(grammar, 1);
              recognition.grammars = list;
            }
          }

          recognition.onresult = (event) => {
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcript += event.results[i][0].transcript;
            }
            const cleanTranscript = transcript.trim();
            if (cleanTranscript) {
              const result = checkWordStream(cleanTranscript);
              updateAssistantHeard(cleanTranscript, result);
            }
          };

          recognition.onerror = (e) => {
            if (e.error !== 'aborted') {
              console.error("Erreur Recognition:", e.error);
              sessionDiagnostics.errors.push({
                time: new Date().toISOString(),
                type: e.error,
              });
              if (e.error === "not-allowed")
                alert("Microphone bloqué par le navigateur.");
            }
          };

          recognition.onend = () => {
            if (isRecording) {
              try {
                recognition.start();
              } catch (err) {
                console.error("Relance impossible", err);
              }
            }
          };

          try {
            recognition.start();
          } catch (startErr) {
            console.warn("Speech recognition already started:", startErr);
          }

          // Update ghost word for the first word
          const ghost = document.getElementById("ghost-word-container");
          if (ghost && verseData[currentIdx]) {
            ghost.innerText = verseData[currentIdx].ar;
          }
          isInitializingMicrophone = false;
        } catch (err) {
          isInitializingMicrophone = false;
          console.error("Microphone Error:", err);
          let userMsg = "Erreur micro : " + err.message;
          if (err.name === "NotAllowedError") {
            userMsg =
              "L'accès au micro a été refusé. Veuillez cliquer sur l'icône de cadenas dans la barre d'adresse pour l'autoriser.";
          } else if (err.name === "NotFoundError") {
            userMsg = "Aucun microphone détecté sur cet appareil.";
          }
          alert(userMsg);
          if (startTxt)
            startTxt.innerText =
              translations[currentLang]?.start || "Touchez pour commencer";
          isRecording = false;
          
          // Show the layout and hide overlay even if mic fails so user isn't stuck
          const overlay = document.getElementById("start-overlay");
          if (overlay) overlay.style.display = "none";
          const appLayout = document.getElementById("app-layout");
          if (appLayout) appLayout.style.display = "flex";
        }
      }

      let easedVol = 0;

      function trackVolume() {
        if (!isRecording || !analyser) return;
        const now = performance.now();
        if (now - lastVolumeUpdate < 16) {
          requestAnimationFrame(trackVolume);
          return;
        }
        lastVolumeUpdate = now;

        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let v of data) sum += v;
        const targetVol = sum / data.length;

        // Let's smooth the movement (easing)
        easedVol += (targetVol - easedVol) * 0.2;

        const aura = document.getElementById("voice-aura");
        const ghost = document.getElementById("ghost-word-container");

        if (aura) {
          aura.style.transform = `translate(-50%, -50%) scale(${0.8 + easedVol / 45})`;
          aura.style.opacity =
            easedVol > 5 ? Math.min(0.2 + easedVol / 30, 0.7) : 0;

          // Always Emerald Nebula
          aura.style.background = `radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.05) 50%, transparent 70%)`;
          if (ghost) ghost.style.color = "var(--accent)";
        }

        if (ghost) {
          ghost.style.transform = `translate(-50%, -50%) scale(${1 + easedVol / 180})`;
          // Bumped opacity slightly for another 5% visibility
          ghost.style.opacity =
            easedVol > 5 ? Math.min(0.02 + easedVol / 300, 0.08) : 0;
        }

        requestAnimationFrame(trackVolume);
      }

      function normalize(text) {
        if (!text) return "";
        // 1. Nettoyage HTML et codes invisibles
        let clean = text
          .replace(/<[^>]*>/g, "")
          .replace(
            /[\u200B-\u200D\uFEFF\u200E\u200F\u061C\u202A-\u202E\u2066-\u2069]/g,
            "",
          );

        // 2. Décomposition et suppression des diacritiques coraniques
        let normalized = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // 3. Suppression de TOUT ce qui n'est pas une lettre de base
        // Inclut voyelles, signes de pause, tajwid, et Alif Khanjariyah
        normalized = normalized.replace(
          /[\u064B-\u065F\u0670\u0671\u06D6-\u06ED\u08D4-\u08E2\u0640]/g,
          "",
        );

        // 4. Standardisation totale des Alifs et graphies
        normalized = normalized
          .replace(/[أإآٱءٲٳٴۥۦ]/g, "ا")
          .replace(/ى/g, "ي")
          .replace(/ة/g, "ه");

        return normalized.replace(/\s+/g, "").trim().toLowerCase();
      }

      function getRootSkeleton(text) {
        // 1. On retire les lettres de prolongations (Madd)
        let root = text.replace(/[اوي]/g, "");
        // 2. On réduit les lettres doublées (l'IA écrit parfois 'aa' ou 'nn' quand on insiste)
        return root.replace(/(.)\1+/g, "$1");
      }

      async function goToNextVerse() {
        const currentRef = VERSES_LIBRARY[activeVerseIdx].ref;
        const match = currentRef.match(/\[(\d+):(\d+)\]/);
        if (match) {
          const surah = parseInt(match[1]);
          const nextAyah = parseInt(match[2]) + 1;
          document.body.classList.remove("celebration-mode");
          document.getElementById("next-verse-btn").style.display = "none";
          document.getElementById("restart-btn").classList.remove("visible");
          await fetchVerseFromAPI(surah, nextAyah);
          startRecognition();
        }
      }

      function checkWordStream(transcript) {
        const rawHeard = transcript.toLowerCase();
        const cleanRaw = rawHeard.replace(
          /[\u200B-\u200D\uFEFF\u200E\u200F]/g,
          " ",
        );
        const heard = cleanRaw.split(/\s+/).filter((w) => w.length > 0);

        let matched = 0;
        let tempIdx = currentIdx;

        // Diagnostic log
        sessionDiagnostics.heard.push({
          time:
            ((performance.now() - sessionDiagnostics.startTime) / 1000).toFixed(
              2,
            ) + "s",
          raw: transcript,
          currentIdx: currentIdx,
          normalizedExpected: verseData[currentIdx]
            ? normalize(verseData[currentIdx].ar)
            : "FIN",
        });

        for (let i = 0; i < heard.length && tempIdx < verseData.length; i++) {
          const hWord = heard[i];
          const hNorm = normalize(hWord);
          const hRoot = getRootSkeleton(hNorm);

          const target = normalize(verseData[tempIdx].ar);
          const tRoot = getRootSkeleton(target);

          // LOGIQUE DE LIAISON ET DE SQUELETTE :
          // 1. Correspondance exacte (Alhamdulillah)
          // 2. Correspondance racine (Ihdina == Ihdiyna) car les Alifs/Yas varient en STT
          // 3. Correspondance de liaison (Al-Hamdu == Hamdu)

          const isExact = hNorm === target;
          const isRootMatch = hRoot === tRoot && hRoot.length > 0;

          // Flexibilité sur l'article défini (Liaison)
          const hNoAl = hNorm.startsWith("ال") ? hNorm.substring(2) : hNorm;
          const tNoAl = target.startsWith("ال") ? target.substring(2) : target;
          const isLiaisonMatch =
            hNoAl.length > 1 &&
            tNoAl.length > 1 &&
            getRootSkeleton(hNoAl) === getRootSkeleton(tNoAl);

          // Tolérances spécifiques pour les mots difficiles
          const isAnamtaTolerance =
            target === "انعمت" && (hNorm === "ان" || hNorm === "انعم");
          const isDhallinTolerance =
            target === "لضالين" && (hNorm === "الدال" || hNorm === "الضال");

          if (
            isExact ||
            isRootMatch ||
            isLiaisonMatch ||
            isAnamtaTolerance ||
            isDhallinTolerance
          ) {
            // Détection d'un Madd "oublié"
            // Si le squelette matche mais pas le mot exact, et qu'il y a un Madd attendu
            const box = document.getElementById(`box-${tempIdx}`);
            const isMaddMissed = !isExact && box?.dataset.ruleType === "madd";

            sessionDiagnostics.matches.push({
              expected: target,
              expectedRaw: verseData[tempIdx].ar,
              heard: hWord,
              index: tempIdx,
              time:
                (
                  (performance.now() - sessionDiagnostics.startTime) /
                  1000
                ).toFixed(2) + "s",
              maddMissed: isMaddMissed,
            });

            processMatchedWord(tempIdx, isMaddMissed);
            tempIdx++;
            matched++;
          }
        }

        if (matched > 0) {
          currentIdx = tempIdx;
          updateAssistantWords();
          hideAssistantFeedback();

          // Re-adding the completion check
          if (currentIdx >= verseData.length) finishVerse();

          const progress = (currentIdx / verseData.length) * 100;
          const progressEl = document.getElementById("session-progress");
          if (progressEl) progressEl.style.width = progress + "%";

          return { matched: true, text: transcript };
        }

        // If we heard something but no match, it might be an error
        return { matched: false, text: transcript };
      }

      function hideAssistantFeedback() {
        const fb = document.getElementById("assistant-feedback-box");
        if (fb) fb.style.display = "none";
      }

      function showAssistantFeedback(msg) {
        const fb = document.getElementById("assistant-feedback-box");
        if (fb) {
          fb.innerText = msg;
          fb.style.display = "block";
        }
      }

      function updateAssistantWords() {
        const targetEl = document.getElementById("assistant-target-word");
        const translitEl = document.getElementById("assistant-target-translit");
        if (!targetEl || !verseData[currentIdx]) return;

        const target = verseData[currentIdx].ar;
        targetEl.innerText = target;

        // Get transliteration from the current verse's meta
        const verse = VERSES_LIBRARY[activeVerseIdx];
        if (verse && verse.words && verse.words[currentIdx]) {
          const meta = verse.words[currentIdx];
          translitEl.innerText = currentLang === "ru" ? meta.ru : meta.en;
        } else {
          translitEl.innerText = "";
        }
      }

      function updateAssistantHeard(transcript, result) {
        const heardEl = document.getElementById("assistant-heard-word");
        if (!heardEl) return;

        const words = transcript.split(/\s+/);
        const lastWords = words.slice(-3).join(" ");
        heardEl.innerText = lastWords;

        if (result && result.matched) {
          heardEl.classList.add("match");
          hideAssistantFeedback();
        } else if (transcript.length > 5) {
          heardEl.classList.remove("match");

          // Analyser l'erreur pour donner un conseil
          const target = normalize(verseData[currentIdx]?.ar || "");
          const latestHeard = normalize(words[words.length - 1] || "");

          // On ne montre pas d'erreur si le squelette (consonnes) match
          const isSkeletonMatch =
            getRootSkeleton(latestHeard) === getRootSkeleton(target);

          if (latestHeard && latestHeard !== target && !isSkeletonMatch) {
            // Si la différence est petite
            const diffLength = Math.abs(latestHeard.length - target.length);
            if (diffLength <= 2) {
              showAssistantFeedback(translations[currentLang].hintAlmost);
            } else {
              showAssistantFeedback(translations[currentLang].hintRepeat);
            }

            // On ajoute l'erreur au diagnostic
            sessionDiagnostics.errors.push({
              time: new Date().toISOString(),
              type: "pronunciation_mismatch",
              expected: target,
              heard: latestHeard,
            });
          }
        }
      }

      function processMatchedWord(idx, maddMissed = false) {
        const box = document.getElementById(`box-${idx}`);
        if (box?.classList.contains("correct")) return;
        box?.classList.remove("active");
        box?.classList.add("correct");

        // --- GHOST WORD TRANSITION ---
        const nextGhostIdx = idx + 1;
        const ghost = document.getElementById("ghost-word-container");
        if (ghost) {
          ghost.style.opacity = "0";
          setTimeout(() => {
            if (verseData[nextGhostIdx]) {
              ghost.innerText = verseData[nextGhostIdx].ar;
            } else {
              ghost.innerText = "";
            }
          }, 150);
        }

        // Si le Madd a été oublié, on ajoute le petit mot discret
        if (maddMissed) {
          const hint = document.createElement("div");
          hint.className = "madd-missed-hint";
          hint.innerText =
            translations[currentLang].maddMissed || "Madd missed";
          box.appendChild(hint);
        }

        // On affiche le mot arabe original comme feedback pour confirmer la validation
        const feedbackEl = document.getElementById(`stt-${idx}`);
        if (feedbackEl) {
          feedbackEl.innerHTML = verseData[idx].ar;
          feedbackEl.style.opacity = "1";
        }

        // Duo Mode Sync
        if (typeof peer !== "undefined" && peer && duoConn && duoConn.open) {
          duoConn.send({ type: "sync_match", idx: idx });
        }

        const nextBox = document.getElementById(`box-${idx + 1}`);
        if (nextBox) {
          nextBox.classList.add("active");
          nextBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }

      function manualValidateWord(idx, event) {
        if (event) event.stopPropagation();

        // On récupère ce que l'IA entendait à ce moment précis pour le rapport
        const heardAtMoment =
          document.getElementById("assistant-heard-word")?.innerText ||
          "NON_CAPTE";

        // 1. SIGNAL D'ERREUR EXPLICITE POUR LE RAPPORT
        // On enregistre cela comme un échec de détection automatique
        sessionDiagnostics.errors.push({
          time: new Date().toISOString(),
          type: "validation_failure_manual_override",
          expected: normalize(verseData[idx].ar),
          expectedRaw: verseData[idx].ar,
          heard: heardAtMoment,
          reason:
            "User manually validated because AI failed to detect correct pronunciation",
        });

        // 2. On ajoute l'info au diagnostic dans les matches pour la progression
        sessionDiagnostics.matches.push({
          expected: normalize(verseData[idx].ar),
          expectedRaw: verseData[idx].ar,
          heard: `MANUAL_VALIDATION (Heard: ${heardAtMoment})`,
          index: idx,
          time:
            ((performance.now() - sessionDiagnostics.startTime) / 1000).toFixed(
              2,
            ) + "s",
        });

        processMatchedWord(idx);

        currentIdx = idx + 1;
        updateAssistantWords();
        hideAssistantFeedback();

        if (currentIdx >= verseData.length) finishVerse();

        const progress = (currentIdx / verseData.length) * 100;
        const progressEl = document.getElementById("session-progress");
        if (progressEl) progressEl.style.width = progress + "%";
      }

      function finishVerse() {
        // Sauvegarder la transcription finale complète
        const finalRaw =
          sessionDiagnostics.heard.length > 0
            ? sessionDiagnostics.heard[sessionDiagnostics.heard.length - 1].raw
            : "";
        sessionDiagnostics.final_transcription = finalRaw;
        sessionDiagnostics.endTime = new Date().toISOString();

        isRecording = false;
        recognition?.stop();
        mediaRec?.stop();
        cleanupMic();
        document.getElementById("live-assistant")?.classList.remove("visible");
        markAsCompleted(VERSES_LIBRARY[activeVerseIdx].ref);
        document.body.classList.add("celebration-mode");
        const restartBtn = document.getElementById("restart-btn");
        if (restartBtn) {
          restartBtn.classList.add("visible");
        }
      }

      function restartRecitation() {
        document.body.classList.remove("celebration-mode");
        document.getElementById("restart-btn")?.classList.remove("visible");

        // On recharge le verset proprement (reset l'UI et le currentIdx)
        loadVerse(activeVerseIdx);

        audioChunks = [];
        setTimeout(startRecognition, 300);
      }

      function downloadFullAudio() {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "recitation_tajwid.webm";
        a.click();
      }

      function cleanupMic() {
        currentStream?.getTracks().forEach((t) => t.stop());
        audioCtx?.close();
      }

      function manualReport() {
        const btn = document.getElementById("report-diag-btn");
        const oldText = btn.innerHTML;
        btn.innerText = "Génération...";

        generateEnhancedReport().then((report) => {
          // Trigger download for user visibility
          const blob = new Blob([JSON.stringify(report, null, 2)], {
            type: "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `rapport_technique_${new Date().getTime()}.json`;
          a.click();

          // Attempt to send to local server if it exists
          sendDiagnosticReport(report).finally(() => {
            btn.innerText = "Rapport Prêt !";
            setTimeout(() => {
              btn.innerHTML = oldText;
            }, 2000);
          });
        });
      }

      async function generateEnhancedReport() {
        // 1. Analyse des blocages
        const blockers = sessionDiagnostics.errors.filter(
          (e) => e.type === "validation_failure_manual_override",
        );
        const analysis = {
          total_words: verseData.length,
          words_completed: currentIdx,
          manual_validations: blockers.length,
          blocker_details: blockers.map((b) => ({
            word_index: b.index,
            expected: b.expectedRaw,
            heard_by_stt: b.heard,
            timestamp: b.time,
          })),
        };

        // 2. Conversion de l'audio en Base64
        let audioBase64 = null;
        if (audioChunks.length > 0) {
          try {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            audioBase64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(audioBlob);
            });
          } catch (err) {
            console.error("Audio encoding failed:", err);
          }
        }

        // 3. Rapport final consolidé
        return {
          ...sessionDiagnostics,
          analysis_summary: analysis,
          vocal_recording_base64: audioBase64,
          generated_at: new Date().toISOString(),
          browser: navigator.userAgent,
        };
      }

      async function sendDiagnosticReport(fullReport) {
        try {
          await fetch("http://localhost:8000/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fullReport),
          });
          console.log("Rapport envoyé au serveur local.");
        } catch (e) {
          console.warn(
            "Serveur local non disponible. Rapport téléchargé uniquement.",
          );
        }
      }

      function resetUI() {
        document.querySelectorAll(".word-box").forEach((b) => {
          b.className = "word-box";
          const feedback = b.querySelector(".stt-feedback");
          if (feedback) feedback.innerHTML = "";
        });
        document.getElementById("box-0")?.classList.add("active");
      }

      function openStatsModal() {
        updateStatsUI();
        const modal = document.getElementById("stats-modal");
        if (modal) modal.style.display = "flex";
      }

      function closeStatsModal() {
        const modal = document.getElementById("stats-modal");
        if (modal) modal.style.display = "none";
      }

      function openImportModal() {
        const modal = document.getElementById("import-modal");
        if (modal) {
          modal.style.display = "flex";
          document.getElementById("import-ref").focus();
        }
      }

      function closeImportModal() {
        const modal = document.getElementById("import-modal");
        if (modal) modal.style.display = "none";
      }

      function openQuranBrowser() {
        const modal = document.getElementById("quran-modal");
        if (modal) {
          modal.style.display = "flex";
          filterSurahs();
        }
      }

      function closeQuranBrowser() {
        const modal = document.getElementById("quran-modal");
        if (modal) modal.style.display = "none";
      }

      function filterSurahs() {
        const query =
          document.getElementById("surah-search")?.value.toLowerCase() || "";
        const grid = document.getElementById("surah-grid");
        if (!grid) return;

        grid.innerHTML = SURAHS_LIST.map((name, i) => {
          const sNum = i + 1;
          const isFav = favorites.some((ref) => ref.startsWith(`${sNum}:`));
          if (name.toLowerCase().includes(query) || sNum.toString() === query) {
            return `
                    <div class="surah-card" onclick="fetchVerseFromAPI('${sNum}:1')">
                        <div class="surah-num">${sNum}</div>
                        <div class="surah-name">${name}</div>
                        <button class="v-btn" style="padding: 4px 8px; font-size: 0.5rem; margin-top: 5px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: var(--subtext); width: 100%; border-radius: 6px;" onclick="event.stopPropagation(); fetchVerseFromAPI('${sNum}')">Tout lire</button>
                        ${isFav ? '<div class="fav-indicator"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></div>' : ""}
                    </div>
                `;
          }
          return "";
        }).join("");
      }

      function initVerseSelector() {
        const container = document.getElementById("v-btns-container");
        const verse = VERSES_LIBRARY[activeVerseIdx];
        if (!verse || !container) return;

        // Bouton fusionné : Livre + Texte du verset
        container.innerHTML = `
            <button class="v-btn active" onclick="openQuranBrowser()" style="display:flex; align-items:center; gap:8px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                ${verse.ref || verse.title}
            </button>
        `;
      }

      function toggleLangMenu(event) {
        if (event) event.stopPropagation();
        document.getElementById("lang-options").classList.toggle("active");
      }

      // Fermer les menus au clic ailleurs
      window.addEventListener("click", () => {
        document.getElementById("lang-options")?.classList.remove("active");
      });

      function closeModal() {
        document
          .querySelectorAll(".modal-overlay")
          .forEach((m) => (m.style.display = "none"));
      }

      // === Initialisation ===
      async function initializeApp() {
        console.log("App Initialization Started");
        const savedLang = localStorage.getItem("tajwid_lang") || "fr";
        setLanguage(savedLang);
        updateStatsUI();
        initDailyVerse();

        // Listeners robustes
        const startOverlay = document.getElementById("start-overlay");
        if (startOverlay) {
          startOverlay.addEventListener("click", () => {
            console.log("Overlay clicked");
            startRecognition();
          });
        }

        const dailyCard = document.getElementById("daily-verse-card");
        if (dailyCard) {
          dailyCard.addEventListener("click", (e) => {
            e.stopPropagation();
            console.log("Daily card clicked");
            loadDailyVerse();
          });
        }

        // Chargement initial (Fatihah + dernières Sourates)
        try {
          await fetchVerseFromAPI("112"); // Al-Ikhlas
          await fetchVerseFromAPI("113"); // Al-Falaq
          await fetchVerseFromAPI("114"); // An-Nas
          await fetchVerseFromAPI("1"); // Al-Fatihah (en dernier pour être l'active)
          console.log("Initial surahs loaded: 1, 112, 113, 114");
        } catch (e) {
          console.error("Initial load failed:", e);
        }
      }

      if (document.readyState === "loading") {
        window.addEventListener("DOMContentLoaded", initializeApp);
      } else {
        // En Next.js, le script peut charger après le DOMContentLoaded
        initializeApp();
      }

      // === NEW DUO MODE LOGIC (User 1 & User 2) ===
      let duoConn = null;
      let duoCall = null;

      // The logic is moved to the top of the script (where I added it previously)
      // but I will add the necessary overrides here to sync recitation.

      const originalProcessMatchedWord =
        typeof processMatchedWord !== "undefined" ? processMatchedWord : null;
      if (originalProcessMatchedWord) {
        window.processMatchedWord = function (idx, maddMissed = false) {
          originalProcessMatchedWord(idx, maddMissed);
          if (peer && duoConn && duoConn.open) {
            duoConn.send({ type: "sync_match", idx: idx });
          }
        };
      }

      const originalSwitchVerse =
        typeof switchVerse !== "undefined" ? switchVerse : null;
      if (originalSwitchVerse) {
        window.switchVerse = async function (index) {
          await originalSwitchVerse(index);
          if (peer && duoConn && duoConn.open) {
            duoConn.send({ type: "sync_verse", verseIdx: index });
          }
        };
      }

      // Add connection handling to the initDuoMode flow if needed
      // This part ensures that Peer Data Connection is also established for syncing UI
      function setupDuoConnection(conn) {
        duoConn = conn;
        conn.on("data", (data) => {
          if (data.type === "sync_match") {
            // Visualize other's progress
            console.log("Partner matched word:", data.idx);
            const wordBox = document.getElementById(`box-${data.idx}`);
            if (wordBox) {
              wordBox.classList.add("partner-active");
              // Optional: add a small visual indicator like a dot
              if (!wordBox.querySelector(".partner-dot")) {
                const dot = document.createElement("div");
                dot.className = "partner-dot";
                wordBox.appendChild(dot);
              }
            }
          }
          if (data.type === "sync_verse") {
            if (activeVerseIdx !== data.verseIdx) {
              activeVerseIdx = data.verseIdx;
              loadVerse(activeVerseIdx);
            }
          }
        });
      }

      // Inject CSS for partner highlighting
      const duoStyle = document.createElement("style");
      duoStyle.textContent = `
        .word-box.partner-active {
            border-bottom: 3px solid #007AFF !important;
            background: rgba(0, 122, 255, 0.05) !important;
            position: relative;
        }
        .partner-dot {
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background: #007AFF;
            border-radius: 50%;
            box-shadow: 0 0 8px #007AFF;
        }
        .duo-panel.active {
            border: 2px solid var(--accent);
            box-shadow: 0 0 15px rgba(5, 150, 105, 0.3);
        }
    `;
      document.head.appendChild(duoStyle);

      // --- ALPHABET LOGIC ---
      const arabicAlphabet = [
        { char: 'ا', name: 'Alif', type: 'norm' },
        { char: 'ب', name: 'Ba', type: 'qalqalah' },
        { char: 'ت', name: 'Ta', type: 'norm' },
        { char: 'ث', name: 'Tha', type: 'norm' },
        { char: 'ج', name: 'Jiim', type: 'qalqalah' },
        { char: 'ح', name: 'Ha', type: 'norm' },
        { char: 'خ', name: 'Kha', type: 'norm' },
        { char: 'د', name: 'Dal', type: 'qalqalah' },
        { char: 'ذ', name: 'Dhal', type: 'norm' },
        { char: 'ر', name: 'Ra', type: 'norm' },
        { char: 'ز', name: 'Zay', type: 'norm' },
        { char: 'س', name: 'Siin', type: 'norm' },
        { char: 'ش', name: 'Shiin', type: 'norm' },
        { char: 'ص', name: 'Saad', type: 'norm' },
        { char: 'ض', name: 'Daad', type: 'norm' },
        { char: 'ط', name: 'Ta', type: 'qalqalah' },
        { char: 'ظ', name: 'Za', type: 'norm' },
        { char: 'ع', name: 'Ayn', type: 'norm' },
        { char: 'غ', name: 'Ghayn', type: 'norm' },
        { char: 'ف', name: 'Fa', type: 'norm' },
        { char: 'ق', name: 'Qaaf', type: 'qalqalah' },
        { char: 'ك', name: 'Kaaf', type: 'norm' },
        { char: 'ل', name: 'Laam', type: 'norm' },
        { char: 'م', name: 'Miim', type: 'ghunnah' },
        { char: 'ن', name: 'Nuun', type: 'ghunnah' },
        { char: 'ه', name: 'Ha', type: 'norm' },
        { char: 'و', name: 'Waw', type: 'norm' },
        { char: 'ي', name: 'Ya', type: 'norm' },
      ];

      function speakLetter(char, name) {
        if (!window.speechSynthesis) return alert("Synthèse vocale non supportée par votre navigateur.");
        window.speechSynthesis.cancel(); // Stop any currently playing audio
        const utterance = new SpeechSynthesisUtterance(char);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.5; // slow speed for clear pronunciation
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      }

      function openAlphabetModal() {
        const wrap = document.getElementById("alphabet-grid");
        if (wrap && wrap.innerHTML.trim() === "") {
          wrap.innerHTML = arabicAlphabet.map(l => `
            <div 
              onclick="speakLetter('${l.char}', '${l.name}')"
              style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 15px; padding: 20px 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s all" 
              onmouseenter="this.style.background='rgba(52,199,89,0.1)'; this.style.borderColor='var(--success)'; this.style.transform='scale(1.1)'" 
              onmouseleave="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)'; this.style.transform='scale(1)'">
              <span style="font-family: var(--font-arabic); font-size: 3rem; color: #fff;">${l.char}</span>
              <span style="font-size: 0.6rem; text-transform: uppercase; color: #aaa; margin-top: 10px; font-weight: 600;">${l.name}</span>
            </div>
          `).join('');
        }
        document.getElementById("alphabet-modal").style.display = "flex";
      }

      function closeAlphabetModal() {
        document.getElementById("alphabet-modal").style.display = "none";
      }

      window.startRecognition = startRecognition;
    

      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker
            .register("/sw.js")
            .then((registration) => {
              console.log(
                "ServiceWorker registration successful with scope: ",
                registration.scope,
              );
            })
            .catch((err) => {
              console.log("ServiceWorker registration failed: ", err);
            });
        });
      }
    
      window.arabicAlphabet = arabicAlphabet;
      window.allSurahs = SURAHS_LIST;
      window.SURAHS_LIST = SURAHS_LIST;
      window.openAlphabetModal = openAlphabetModal;
      window.closeAlphabetModal = closeAlphabetModal;
      window.speakLetter = speakLetter;
      window.toggleLangMenu = toggleLangMenu;
      window.setLanguage = setLanguage;
      window.openStatsModal = openStatsModal;
      window.closeStatsModal = closeStatsModal;
      window.toggleFavoriteCurrent = toggleFavoriteCurrent;
      window.fetchVerseFromAPI = fetchVerseFromAPI;
      window.restartRecitation = restartRecitation;
      window.manualReport = manualReport;
      window.openQuranBrowser = openQuranBrowser;
      window.closeQuranBrowser = closeQuranBrowser;
      window.closeModal = closeModal;
      window.downloadFullAudio = downloadFullAudio;
