// --- CONFIGURAZIONE ---
// INCOLLA QUI IL TUO URL DI GOOGLE APPS SCRIPT
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHUTAYnagn6A9IBfw2u32oylj85Nxnut7LrFaXe0j-DBWeHdLqgX0CTJETBecTNy0/exec'; 
// --------------------

// Oggetto per mappare i dati dei controlli
const CONTROLS = {
    'CHILLER': {
        luceId: 'luce-0',
        statusId: 'status-0',
        testoVerde: 'ACCESO',
        testoRosso: 'SPENTO'
    },
    'VENTOLE': {
        luceId: 'luce-1',
        statusId: 'status-1',
        testoVerde: 'ACCESE',
        testoRosso: 'SPENTE'
    },
    'PORTONE INTERNO': {
        luceId: 'luce-2',
        statusId: 'status-2',
        testoVerde: 'APERTO',
        testoRosso: 'CHIUSO'
    },
    'PORTONE ESTERNO': {
        luceId: 'luce-3',
        statusId: 'status-3',
        testoVerde: 'APERTO',
        testoRosso: 'CHIUSO'
    },
    'OPERAZIONI NELLA HALL': {
        luceId: 'luce-4',
        statusId: 'status-4',
        testoVerde: 'IN CORSO',
        testoRosso: 'TERMINATE'
    }
};

// Esegui al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
    loadInitialState();
    setupButtonListeners();
    setupResetListener();
});

// 1. CARICAMENTO STATO INIZIALE (GET)
async function loadInitialState() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        if (!response.ok) throw new Error('Errore di rete nel caricamento');
        
        const result = await response.json();
        if (result.result !== 'success') throw new Error(result.message);

        // Applica lo stato caricato all'interfaccia
        for (const controlID in result.data) {
            const state = result.data[controlID]; // es. { isVerde: false, stato: 'SPENTO' }
            const config = CONTROLS[controlID];
            updateControlUI(config.luceId, config.statusId, state.isVerde, state.stato);
        }
        
    } catch (error) {
        console.error('Impossibile caricare lo stato:', error);
        alert('Errore: impossibile caricare lo stato dal server. La pagina potrebbe non funzionare correttamente.');
    } finally {
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// 2. IMPOSTAZIONE LISTENER BOTTONI
function setupButtonListeners() {
    document.querySelectorAll('.control-row button').forEach(button => {
        button.addEventListener('click', () => {
            const controlID = button.closest('.control-row').id.replace('control-', '');
            const config = CONTROLS[controlID];
            
            toggleState(
                controlID,
                config.luceId,
                config.statusId,
                config.testoVerde,
                config.testoRosso
            );
        });
    });
}

// 3. IMPOSTAZIONE LISTENER RESET
function setupResetListener() {
    document.getElementById('reset-button').addEventListener('click', () => {
        // Pop-up di conferma
        if (confirm("Sei sicuro di voler resettare tutti gli stati a zero?")) {
            resetAllStates();
        }
    });
}

// Funzione principale per cambiare stato
function toggleState(controlID, luceId, statusId, testoVerde, testoRosso) {
    const luce = document.getElementById(luceId);
    let isVerde, nuovoTesto;

    // Determina il nuovo stato
    if (luce.classList.contains('rossa')) {
        isVerde = true;
        nuovoTesto = testoVerde;
    } else {
        isVerde = false;
        nuovoTesto = testoRosso;
    }
    
    // Aggiorna la UI
    updateControlUI(luceId, statusId, isVerde, nuovoTesto);
    
    // Logga l'operazione singola (Foglio "Log")
    logOperation(controlID, isVerde, nuovoTesto);
    
    // Salva lo stato *completo* (Foglio "Stato")
    saveCurrentState();
}

// Funzione per il RESET
function resetAllStates() {
    const logPromises = [];
    
    for (const controlID in CONTROLS) {
        const config = CONTROLS[controlID];
        const isVerde = false;
        const testoRosso = config.testoRosso;

        // Aggiorna UI
        updateControlUI(config.luceId, config.statusId, isVerde, testoRosso);
        
        // Logga l'operazione di reset (Foglio "Log")
        logPromises.push(logOperation(controlID, isVerde, testoRosso));
    }
    
    // Attendi che tutti i log siano inviati prima di salvare lo stato finale
    Promise.all(logPromises).then(() => {
        // Salva lo stato di reset (Foglio "Stato")
        saveCurrentState();
    });
}

// Helper per aggiornare la UI
function updateControlUI(luceId, statusId, isVerde, testo) {
    const luce = document.getElementById(luceId);
    const status = document.getElementById(statusId);
    
    if (isVerde) {
        luce.classList.remove('rossa');
        luce.classList.add('verde');
    } else {
        luce.classList.remove('verde');
        luce.classList.add('rossa');
    }
    status.textContent = testo;
}

// --- FUNZIONI API (POST) ---

// Invia un log singolo al Foglio "Log"
function logOperation(bottone, isVerde, stato) {
    const payload = {
        action: "log",
        payload: {
            bottone: bottone,
            isVerde: isVerde,
            stato: stato,
            timestamp: new Date().toUTCString()
        }
    };
    // Restituisce la promessa fetch per il Promise.all nel reset
    return fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    }).catch(console.error);
}

// Salva lo stato *completo* di tutti i controlli sul Foglio "Stato"
function saveCurrentState() {
    const currentState = {};
    
    for (const controlID in CONTROLS) {
        const config = CONTROLS[controlID];
        const luce = document.getElementById(config.luceId);
        const status = document.getElementById(config.statusId);
        
        currentState[controlID] = {
            isVerde: luce.classList.contains('verde'),
            stato: status.textContent
        };
    }

    const payload = {
        action: "saveState",
        payload: currentState
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
    }).catch(console.error);
}
