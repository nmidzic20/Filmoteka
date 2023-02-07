const konst = require("../konstante.js");
const mysql = require(konst.dirModula + "mysql2");
const ds = require("fs");

class Baza {

    constructor() {
        this.ucitajPodatkeZaBazu();
        this.vezaDB = mysql.createConnection({
            host: this.podaciBaza.bazaServer,
            user: this.podaciBaza.bazaKorime,
            password: this.podaciBaza.bazaLozinka,
            database: this.podaciBaza.bazaNaziv
        });
    }

    spojiSeNaBazu(){
         this.vezaDB.connect((err) => {
            if (err) {
                console.log("Greška: ", err);
                this.vezaDB.end();
            }
        });
    }

    ucitajPodatkeZaBazu() {
        let podaciTekst = ds.readFileSync(konst.podaciZaBazu, "UTF-8");
        this.podaciBaza = JSON.parse(podaciTekst);
    }

    izvrsiUpit(sql, podaciZaSQL, povratnaFunkcija) {
        this.vezaDB.query(sql, podaciZaSQL, povratnaFunkcija);
    }
    izvrsiUpit(sql, podaciZaSQL){
        return new Promise((uspjeh, neuspjeh)=>{
            this.vezaDB.query(sql, podaciZaSQL, (greska,rezultat)=>{
                if(greska)
                    neuspjeh(greska);
                else
                    uspjeh(rezultat);
            })
        })
    }

    zatvoriVezu() {
        this.vezaDB.close();
    }
}

module.exports = Baza;
