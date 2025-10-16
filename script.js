function toggleState(luceId, statusId, testoVerde, testoRosso) {
    const luce = document.getElementById(luceId);
    const status = document.getElementById(statusId);

    // Controlla se la luce è attualmente rossa
    if (luce.classList.contains('rossa')) {
        // Se sì, cambiala in verde
        luce.classList.remove('rossa');
        luce.classList.add('verde');
        status.textContent = testoVerde;
    } else {
        // Altrimenti, cambiala in rossa
        luce.classList.remove('verde');
        luce.classList.add('rossa');
        status.textContent = testoRosso;
    }
}
