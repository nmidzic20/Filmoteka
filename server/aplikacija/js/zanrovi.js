let poruka;
let divGumbTMDB;
let divSkocni;

window.addEventListener("load", async () => {
    
    let gumbObrisiSve = document.getElementById("gumbObrisiSve");
    let gumbTMDB = document.getElementById("gumbTMDB");

    gumbObrisiSve.style = "display: none";
    gumbTMDB.style = "display: none";
    gumbTMDB.addEventListener("click", async function () {
        await dohvatiZanroveTMDB(1);
    });
    gumbObrisiSve.addEventListener("click", async function () {
        let params = { method: 'DELETE' }
        params = await dodajToken(params);
        let odg = await fetch("/obrisiSveZanrove", params);
        await odg.text();
        await dajZanrove(1);
        poruka.innerHTML = "Obrisani svi žanrovi za koje ne postoje filmovi u bazi";
    });

    poruka = document.getElementById("poruka");
    dajZanrove(1);
 
});

async function dajZanrove(str) 
{
    let params = { method: 'POST' }
    params = await dodajToken(params);
    let odg = await fetch("/dajSveZanroveAdmin", params);
    if (odg.status != 200) 
    {
        let podaci = await odg.text();
        podaci = JSON.parse(podaci);
        poruka.innerHTML = podaci.greska;
        return;
    }

    gumbTMDB.style = "";
    gumbObrisiSve.style = "";

    let zanrovi = await odg.text();
    zanrovi = JSON.parse(zanrovi);

    let parametri = { method: 'POST' }
    parametri = await dodajToken(parametri);
    let odgKonf = await fetch("/dajKonfiguraciju", parametri);
    let konf_string = await odgKonf.text();
    let konf = JSON.parse(konf_string);
    let appBrojStranica = parseInt(konf["app.broj.stranica"]);
    
    let ukupno = Math.ceil(zanrovi.length/appBrojStranica);
    if (ukupno == 0) ukupno = 1;

    prikaziStranicenje(str, ukupno, "dajZanrove");

    let pocniOdZanra = (str-1)*appBrojStranica;
    let ostatak = zanrovi.length % appBrojStranica;
    let gornjaGranica = (appBrojStranica * str <= zanrovi.length) ? appBrojStranica * str : appBrojStranica * (str-1) + ostatak;
    prikaziPopisZanrovaBaza(zanrovi, pocniOdZanra, gornjaGranica);
}

function prikaziPopisZanrovaBaza(zanrovi, donjaGranica, gornjaGranica)
{
    let glavna = document.getElementById("sadrzaj");
    let prikaz = "<ul id='listaZanrova'>";

    console.log("granice: " + donjaGranica+" "+gornjaGranica);
    for (let i = donjaGranica; i < gornjaGranica; i++)
    {
        prikaz += "<li><a id='" + zanrovi[i].z_tmdb_id + "' href=''>";
        prikaz += zanrovi[i].z_naziv;
        prikaz += "</a>&nbsp&nbsp&nbsp";
        prikaz += "<button onClick='azurirajSkocni(" + zanrovi[i].z_tmdb_id + ")'>Ažuriraj</button>";
        prikaz += "<button onClick='obrisi(" + zanrovi[i].z_tmdb_id + ")'>Obriši iz baze</button>";
        prikaz += "</li>";
   
    }
    prikaz += "</ul>";
    glavna.innerHTML = prikaz;

    sessionStorage.zanroviIzBaze = JSON.stringify(zanrovi);

    let listaZanrova = document.getElementById("listaZanrova");
    console.log(listaZanrova);
    for (li of listaZanrova.children) 
    {
        let id = li.children[0].id;
        console.log(id);
        let nazivZanra = document.getElementById(id);
        console.log(nazivZanra);
        dodajSlusac(nazivZanra);
    }

}


function dodajSlusac(element) {
    element.addEventListener("click", function (event) {
        event.preventDefault();
        skocni = "<dialog open id='dijaloski'><p id='tekstProzora'>";
        skocni += podaciZaZanr(element.id);
        skocni += "</p><button id='povratak'>Povratak</button></dialog>";
        divSkocni = document.getElementById('skocni');
        divSkocni.innerHTML = skocni;
        skocni = document.getElementById("dijaloski");
        skocni.style = "position: fixed; z-index: 10";
        let tekst = document.getElementById("tekstProzora");
        povratakGumb = document.getElementById("povratak");
        povratakGumb.addEventListener("click", function () {
            setTimeout(()=>zatvori(divSkocni), 0);
        });
    })
}

function zatvori(divSkocni) {
    divSkocni.innerHTML = "";
}

function podaciZaZanr(id)
{
    let podaci = "";
    let zanrovi = JSON.parse(sessionStorage.zanroviIzBaze);

    let zanr;
    for (z of zanrovi)
    {
        if (z.z_tmdb_id == id)
        {
            zanr = z;
            break;
        }
    }
    podaci += "<ul>";
    for (z in zanr)
    {
        podaci += "<li>" + z + ": " + zanr[z] + "</li>";
    }
    podaci += "</ul>";
    return podaci;
}

function azurirajSkocni(id)
{
    let skocni = "<dialog open id='azurirajSkocni'><p id='tekstSkocni2'>Novi naziv žanra: </p><input type='text' id='noviNazivZanra'>";
    skocni += "<button id='azurirajGumb'>Ažuriraj</button><button id='povratak2'>Povratak</button></dialog>";
    divSkocni = document.getElementById('skocni');
    divSkocni.innerHTML = skocni;
    skocni = document.getElementById("azurirajSkocni");
    skocni.style = "position: fixed; z-index: 10";
    let tekst = document.getElementById("tekstSkocni2");
    let noviNazivZanra = document.getElementById("noviNazivZanra");

    let azurirajGumb = document.getElementById("azurirajGumb");
    azurirajGumb.addEventListener("click", function () {
        if (noviNazivZanra != "" && noviNazivZanra != null)
        {
            azuriraj(id, noviNazivZanra.value);
            setTimeout(()=>zatvori(divSkocni), 0);
        }
        else
        {
            tekst.innerHTML = "Unesite željeni naziv!";
        }
    });
    povratak = document.getElementById("povratak2");
    povratak.addEventListener("click", function () {
        setTimeout(()=>zatvori(divSkocni), 0);
    });
}

async function azuriraj(id, noviNaziv) 
{
    let zanrovi = JSON.parse(sessionStorage.zanroviIzBaze);
    for (let zanr of zanrovi) 
    {
        if (id == zanr.z_tmdb_id) 
        {  
            let tijelo = {};
            tijelo.z_naziv = noviNaziv;
            tijelo.z_tmdb_id = id;

            let parametri = { method: 'PUT', body: JSON.stringify(tijelo) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/azurirajZanr", parametri);
            let podaci = await odgovor.text();

            if (odgovor.status == 200) 
            {
                poruka.innerHTML = "Žanr " + id + " ažuriran!";
            } 
            else 
            {
                poruka.innerHTML = JSON.parse(podaci).greska;
            }
            break;
        }
    }
    dajZanrove(1); 
}


async function obrisi(id) 
{
    if (divSkocni != null) divSkocni.innerHTML = "";

    let zanrovi = JSON.parse(sessionStorage.zanroviIzBaze);
    for (let zanr of zanrovi) 
    {
        if (id == zanr.z_tmdb_id) 
        {  
            let parametri = { method: 'DELETE', body: JSON.stringify(zanr) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/obrisiZanr", parametri);
            let podaci = await odgovor.text();

            break;
        }
    }
    await dajZanrove(1); 

    zanrovi = JSON.parse(sessionStorage.zanroviIzBaze);
    console.log(sessionStorage.zanroviIzBaze);

    for (let zanr of zanrovi) 
    {
        if (id == zanr.z_tmdb_id) 
        {  
            poruka.innerHTML = "Ovaj žanr se ne može obrisati jer ima filmova pod njime";
            return;
        }
    }
    poruka.innerHTML = "Žanr obrisan iz baze!";
}

async function dohvatiZanroveTMDB(str)
{
    let parametri = { method: 'POST' }
    parametri = await dodajToken(parametri);
    let odgovor = await fetch("/dajZanroveTMDB", parametri);
    let podaci = await odgovor.text();
    podaci = JSON.parse(podaci);

    if (odgovor.status == 200) 
    {
        console.log(JSON.stringify(podaci));

        let parametri = { method: 'POST' }
        parametri = await dodajToken(parametri);
        let odg = await fetch("/dajKonfiguraciju", parametri);
        let konf_string = await odg.text();
        let konf = JSON.parse(konf_string);
        let appBrojStranica = parseInt(konf["app.broj.stranica"]);
        console.log(appBrojStranica + " " + parseInt(appBrojStranica));
        
        let ukupno = Math.ceil(podaci.genres.length/appBrojStranica);
        if (ukupno == 0) ukupno = 1;

        prikaziStranicenjeTMDB(str, ukupno, "dohvatiZanroveTMDB"); 

        let pocniOdZanra = (str-1)*appBrojStranica;
        let ostatak = podaci.genres.length % appBrojStranica;
        let gornjaGranica = (appBrojStranica * str < podaci.genres.length) ? appBrojStranica * str : appBrojStranica * (str-1) + ostatak;
        prikaziPopisZanrovaTMDB(podaci.genres, pocniOdZanra, gornjaGranica);
    } 
    else 
    {
        poruka.innerHTML = podaci.greska;
    }
}


function prikaziStranicenjeTMDB(str,ukupno,funkcijaZaDohvat)
{
	let prikaz = document.getElementById("stranicenje2");
	html="";
	str=parseInt(str);
	if(str>1){
		html="<button onClick=\""+funkcijaZaDohvat+"(1)\"><<</button>";
		html+="<button onClick=\""+funkcijaZaDohvat+"("+(str-1)+")\"><</button>";
	}
	html+="<button onClick=\""+funkcijaZaDohvat+"("+(str)+")\">"+str+"/"+ukupno+"</button>";
	if(str<ukupno){
		html+="<button onClick=\""+funkcijaZaDohvat+"("+(str+1)+")\">></button>";
		html+="<button onClick=\""+funkcijaZaDohvat+"("+ukupno+")\">>></button>";
	}
	prikaz.innerHTML=html;
}

function prikaziPopisZanrovaTMDB(zanrovi, donjaGranica, gornjaGranica)
{
    let glavna = document.getElementById("sadrzaj2");
    let prikaz = "<button id='dodajSve'>Dodaj sve</button><br>";
    prikaz += "<ul id='listaTMDBZanrova'>";

    for (let i = donjaGranica; i < gornjaGranica; i++)
    {
        prikaz += "<li><a id='" + zanrovi[i].id + "' href=''>";
        prikaz += zanrovi[i].name;
        prikaz += "</a>&nbsp&nbsp&nbsp";
        prikaz += "<button onClick='dodajZanr(" + zanrovi[i].id + ")'>Dodaj u bazu</button>";
        prikaz += "</li>";
   
    }
    prikaz += "</ul>";
    glavna.innerHTML = prikaz;

    sessionStorage.zanroviTMDB = JSON.stringify(zanrovi);

    document.getElementById("dodajSve").addEventListener("click", async function () {
        await dodajSve();
    });

}

async function dodajSve()
{
    let postojeciZanrovi = [];
    let zanroviTMDB = JSON.parse(sessionStorage.zanroviTMDB);
    for (let zanr of zanroviTMDB) 
    {
        await dodajZanr(zanr.id, postojeciZanrovi, false);
    }
    console.log("DODAJ SVE postojeci zanrovi: " + postojeciZanrovi);
    let imena = [];
    for (let p of postojeciZanrovi) 
    {
        imena.push(p.name);
    }
    poruka.innerHTML = "Žanrovi koji već postoje u bazi: " + imena;

}

async function dodajZanr(id, postojeciZanrovi = [], dodavanjeJednogZanra = true)
{
    let zanroviTMDB = JSON.parse(sessionStorage.zanroviTMDB);
    let zanroviuBazi = JSON.parse(sessionStorage.zanroviIzBaze);

    for (let zanr of zanroviTMDB) 
    {
        if (id == zanr.id && !zanroviuBazi.some(el => el.z_tmdb_id == id)) 
        {
            console.log("USAO " + id + zanr.id + zanroviuBazi.some(el => el.z_tmdb_id == id));
            let parametri = { method: 'POST', body: JSON.stringify(zanr) };
            parametri = await dodajToken(parametri);
            parametri.headers.set("Content-Type", "application/json"); 

            let odgovor = await fetch("/dodajZanr", parametri);

            if (odgovor.status == 200) 
            {
                let podaci = await odgovor.text();
                if (dodavanjeJednogZanra)
                    poruka.innerHTML = "Žanr " + zanr.name + " dodan u bazu!";
                await dajZanrove(1);
            } 
            else 
            {
                let podaci = await odgovor.text();
                poruka.innerHTML = JSON.parse(podaci).greska;
            }
            break;
        }
        else if (id == zanr.id && zanroviuBazi.some(el => el.z_tmdb_id == id))
        {
            if (dodavanjeJednogZanra)
                poruka.innerHTML = "Žanr " + zanr.name + " već postoji u bazi";
            postojeciZanrovi.push(zanr);
            break;
        }
    }
}
