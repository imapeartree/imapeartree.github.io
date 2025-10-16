// INCOLLA QUI L'URL DELLA TUA APP WEB DI GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxXsFAE5ZxkejC_yZ328PBRBrON0LXCYDONdUaR_l0bAdCEJsCuVKQ2UPHWFnneIQHh/exec';

function toggleState(buttonName, luceId, statusId, testoVerde, testoRosso) {
    const luce = document.getElementById(luceId);
    const status = document.getElementById(statusId);
    let isVerde, nuovoTesto;

    if (luce.classList.contains('rossa')) {
        // Passa a VERDE
        luce.classList.replace('rossa', 'verde');
        status.textContent = testoVerde;
        isVerde = true;
        nuovoTesto = testoVerde;
    } else {
        // Passa a ROSSO
        luce.classList.replace('verde', 'rossa');
        status.textContent = testoRosso;
        isVerde = false;
        nuovoTesto = testoRosso;
    }

    // Invia i dati al foglio Google
    logOperation(buttonName, isVerde, nuovoTesto);
}

function logOperation(bottone, isVerde, stato) {
    const timestamp = new Date().toUTCString();

    const data = {
        bottone: bottone,
        isVerde: isVerde,
        stato: stato,
        timestamp: timestamp
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Importante per evitare errori CORS da chiamate client-side
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => console.log("Dati inviati con successo"))
    .catch(error => console.error('Errore durante l\'invio:', error));
}
