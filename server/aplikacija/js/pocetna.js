let url = "http://spider.foi.hr:12125";
let main;

window.addEventListener("load",async () => {
    main = document.getElementsByTagName("main")[0];
    let zanrovi = await dohvatiZanrove();
    sessionStorage.zanrovi = JSON.stringify(zanrovi);

    dajStavke(1);
});

async function dajStavke(str)
{
    let zanrovi = JSON.parse(sessionStorage.zanrovi);

    let appBrojStranica = await dajAppBrojStranica();

    let donjaGranica = (str-1)*appBrojStranica;
    let ostatak = zanrovi.length % appBrojStranica;
    let gornjaGranica = (appBrojStranica * str <= zanrovi.length) ? appBrojStranica * str : appBrojStranica * (str-1) + ostatak;
    
    let prikaz = "<ul>";
    for (let i = donjaGranica; i < gornjaGranica; i++)
    {
        prikaz+="<li>"+zanrovi[i].z_naziv;
        let filmovi = await dohvatiFilmove(zanrovi[i].z_tmdb_id);
        prikaz+="<ul>";
            prikaz+="<li>"+filmovi[0]["naziv"]+"</li>"
            if (filmovi[1]["naziv"] != null)
                prikaz+="<li>"+filmovi[1]["naziv"]+"</li>"
        prikaz+="</ul></li>"    
    }
    main.innerHTML = prikaz+"</ul>";


    let ukupno = Math.ceil(zanrovi.length/appBrojStranica);
    if (ukupno == 0) ukupno = 1;

    prikaziStranicenje(str, ukupno, "dajStavke");

}

async function dohvatiZanrove()
{
    let odgovor = await fetch(url+"/dajSveZanrove");
    let podaci = await odgovor.text();
    //console.log(podaci);
    let zanrovi = JSON.parse(podaci);
    return zanrovi;
}

async function dohvatiFilmove(zanr_id)
{
    let odgovor = await fetch(url+"/dajDvaFilma?zanr="+zanr_id);
    let podaci = await odgovor.text();
    let filmovi = JSON.parse(podaci);
    return filmovi;
}
