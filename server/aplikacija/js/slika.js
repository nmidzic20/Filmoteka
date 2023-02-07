let poruka;

window.addEventListener("load", async () => {

    let selectFilmovi = document.getElementById("selectFilmovi");
    let selectFilmoviSadrzaj = "<select id='id_film' name='id_film'>";

    let parametri = { method: 'POST' };
    parametri = await dodajToken(parametri);
    let odg = await fetch("/filmoviPregled?stranica=1", parametri);
    let podaci = await odg.text();
    podaci = JSON.parse(podaci);
    console.log("filmovi " + podaci.filmovi);

    for (f of podaci.filmovi)
        if (f.odobren == 1)
            selectFilmoviSadrzaj += "<option value='" + f.tmdb_id + "|" + f.naziv + "'>" + f.naziv + "</option>";
    selectFilmoviSadrzaj += "</select>";

    selectFilmovi.innerHTML = selectFilmoviSadrzaj;

    poruka = document.getElementById("poruka");
   
});