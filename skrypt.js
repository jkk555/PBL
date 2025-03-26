
// Ustawienia timera
let czasStartowy = 30; // Czas startowy w sekundach
let czas = czasStartowy; // Obecny czas 
let timerLeci = false; // Flaga czy timer jest aktywny

// Zmienne do gry
let zapamietaneKolory = []; // Kolory które użytkownik ma zapamiętać
let wybraneKolory = []; // Kolory które użytkownik wybiera
let krok = 0; // Który kolor użytkownik wybiera

// Tworzy boczny panel wtyczki
function stworzPomocnik() {
    if (document.getElementById("pomocnik-adhd")) return; // Nie tworzy jeżeli już wtyczka istnieje

    const panel = document.createElement("div");
    panel.id = "pomocnik-adhd";

    // HTML wtyczki (ze względu na manifest 3.0 HTML musi być w skrypcie JS)
    panel.innerHTML = `
        <h2>ADHD Helper</h2>
        <p>Timer: <span id="timer">${czas}</span>s</p>
        <button id="start-timera">Start</button>
        <button id="przycisk-gra">Mini gra</button>
        <button id="minimalizuj">Minimalizuj</button>
        <div id="gra-kolory" style="display:none;"></div>
        <div id="wynik-gry"></div>
    `;
    document.body.appendChild(panel);

    // Przycisk do przywracania panelu
    const przywroc = document.createElement("button");
    przywroc.id = "przywroc-btn";
    przywroc.innerText = "Pokaż wtyczkę";
    document.body.appendChild(przywroc);

    // Obsługa przycisków
    przywroc.onclick = () => {
        panel.classList.remove("zminimalizowany");
        przywroc.style.display = "none";
    };

    document.getElementById("start-timera").onclick = uruchomTimer;
    document.getElementById("przycisk-gra").onclick = uruchomGre;
    document.getElementById("minimalizuj").onclick = () => {
        panel.classList.add("zminimalizowany");
        przywroc.style.display = "block";
    };

    // Odświeża timer przy załadowaniu
    odswiezTimer();
}

// Startuje timer i zapisuje czas zakończenia w chrome.storage
function uruchomTimer() {
    if (timerLeci) return;
    timerLeci = true;

    const czasKoncowy = Date.now() + czas * 1000;
    chrome.storage.local.set({czasKoncowy});
    odswiezTimer();
}

// Odświeża timer i aktualizuje co sekundę
function odswiezTimer() {
    chrome.storage.local.get(["czasKoncowy"], (dane) => {
        if (!dane.czasKoncowy) return;

        const interwal = setInterval(() => {
            const teraz = Date.now();
            const pozostalo = Math.max(0, Math.floor((dane.czasKoncowy - teraz) / 1000));
            const wyswietlacz = document.getElementById("timer");

            if (wyswietlacz) wyswietlacz.textContent = pozostalo;

            if (pozostalo <= 0) {
                clearInterval(interwal);
                timerLeci = false;
                chrome.storage.local.remove("czasKoncowy");
                czas = czasStartowy;
            }
        }, 1000);
    });
}

// Minigra z zapamiętywaniem kolorów
function uruchomGre() {
    const gra = document.getElementById("gra-kolory");
    const wynik = document.getElementById("wynik-gry");
    gra.style.display = "block";
    wynik.textContent = "";
    gra.innerHTML = "";
    wybraneKolory = [];
    krok = 0;

    const kolory = ["red", "green", "blue", "yellow", "purple", "orange"];
    zapamietaneKolory = [];

    // Losujemy 3 różne kolory
    while (zapamietaneKolory.length < 3) {
        const losowy = kolory[Math.floor(Math.random() * kolory.length)];
        if (!zapamietaneKolory.includes(losowy)) zapamietaneKolory.push(losowy);
    }

    // Pokazujemy je użytkownikowi
    zapamietaneKolory.forEach(kolor => {
        const kwadrat = document.createElement("div");
        kwadrat.style.width = "50px";
        kwadrat.style.height = "50px";
        kwadrat.style.background = kolor;
        kwadrat.style.display = "inline-block";
        kwadrat.style.margin = "5px";
        gra.appendChild(kwadrat);
    });

    // Po 5 sekundach ukrywamy i dajemy opcje wyboru
    setTimeout(() => {
        gra.innerHTML = "";
        zapamietaneKolory.concat().sort(() => 0.5 - Math.random()).forEach(kolor => {
            const przycisk = document.createElement("button");
            przycisk.textContent = kolor;
            przycisk.onclick = () => {
                wybraneKolory.push(kolor);
                krok++;
                if (krok === 3) {
                    const wynikTekst = JSON.stringify(wybraneKolory) === JSON.stringify(zapamietaneKolory)
                        ? "Gratulacje, wybrałeś poprawnie!"
                        : "Niestety, wybrałeś złą kolejność.";
                    wynik.textContent = wynikTekst;
                    gra.style.display = "none";
                }
            };
            gra.appendChild(przycisk);
        });
    }, 5000);
}

// Uruchom pomocnik po załadowaniu strony
window.addEventListener("load", () => {
    setTimeout(stworzPomocnik, 500);
});
