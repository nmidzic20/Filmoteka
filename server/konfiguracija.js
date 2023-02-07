
const fsPromise = require("fs/promises");
module.exports = class Konfiguracija
{

    constructor()
    {
        this.konf={}
    };

    dajKonf()
    {
        return this.konf;
    }

    async ucitajKonfiguraciju() 
    {
        var podaci = await fsPromise.readFile(process.argv[2], "UTF-8");
        this.konf = this.pretvoriJSONkonfig(podaci);
        console.log(this.konf);
    }

    pretvoriJSONkonfig(podaci) 
    {
        let konf = {};
        var nizPodataka = podaci.split("\n");
        for (let podatak of nizPodataka) 
        {
            var podatakNiz = podatak.split("=");
            var naziv = podatakNiz[0];
            var vrijednost = podatakNiz[1];
            konf[naziv] = vrijednost;
        }
        return konf;
    }

    provjeriPodatkeKonfiguracije(podaci, server)
    {
        let restKorime = podaci["rest.korime"];
        let restLozinka = podaci["rest.lozinka"];
        let apiKeyV3 = podaci["tmdb.apikey.v3"];
        let apiKeyV4 = podaci["tmdb.apikey.v4"];
        let appBrojStranica = podaci["app.broj.stranica"];
        let greske = [];

        switch (server)
        {
            case "app":
                let regexAppBrojStranica = /^([5-9]|[1-9][0-9]|100)$/;
                greske.push(regexAppBrojStranica.test(appBrojStranica) ? "" : "app.broj.stranica: Broj od 5-100");
            
            case "rest":
                let regexKorime = /^(?=(.*[A-Za-z]){2,})(?=(.*[0-9]){2,})[a-zA-Z0-9]{15,20}$/;
                greske.push(regexKorime.test(restKorime) ? "" : "rest.korime: Veličina: 15-20 znakova. Dozvoljena slova i brojke. Obavezno: 2 slova, 2 broja");

                let regexLozinka = /^(?=(.*[A-Za-z]){3,})(?=(.*[0-9]){3,})(?=(.*[\W_]){3,}).{20,100}$/;
                greske.push(regexLozinka.test(restLozinka) ? "" : "rest.lozinka: Veličina: 20-100 znakova. Dozvoljen bilo koji znak. Obavezno: 3 slova, 3 brojke i 3 specijalna znaka");

                if (server == "app") break;

                if (apiKeyV3 == undefined || apiKeyV3 == "")
                    greske.push("Unesite tmdb.apikey.v3");

                if (apiKeyV4 == undefined || apiKeyV4 == "")
                    greske.push("Unesite tmdb.apikey.v4");
        }
            
        for (let greska of greske) 
            if (greska != "") 
                throw new Error(greska);
    }
}
