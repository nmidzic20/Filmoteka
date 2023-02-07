import { Database } from 'sqlite3';

class Baza {

    db : Database | null = null;

    constructor() 
    {
        /*if (Baza.db == null)
        {
            console.log("Kao null: " + Baza.db);
            Baza.db = new Database('../baza.sqlite');
            Baza.db.exec("PRAGMA foreign_keys = ON;");
            console.log("Invoked only with the first instantiated Baza " + Baza.db);
        }
        console.log("Invoked " + Baza.db);*/

        this.db = new Database('../baza.sqlite');
        this.db.exec("PRAGMA foreign_keys = ON;");      
    }


    spojiSeNaBazu()
    {
        
    }

    izvrsiUpit2(sql : string, podaciZaSQL : Array<string>, povratnaFunkcija : any) 
    {
        let upit = this.db?.prepare(sql);

        upit?.run(podaciZaSQL, povratnaFunkcija);
        upit?.finalize();
    }

    izvrsiUpit(sql : string, podaciZaSQL : Array<string>)
    {

        return new Promise(async (uspjeh, neuspjeh)=>{
           
                let upit = this.db?.prepare(sql);
    
                upit?.run(podaciZaSQL, (greska : any,rezultat : any)=>{
                    if(greska)
                    {
                        console.log("Greska:"  + greska);
                        neuspjeh(greska);
                    }
                    else
                    {
                        console.log("Uspjesno izvrsavanje ");
                        uspjeh(rezultat);
                    }
                });
                upit?.finalize();
        });

    }

    async izvrsiUpitSelect(sql : string, podaciZaSQL : Array<string>)
    {
        let podaci = new Array<any>();

        podaciZaSQL.forEach(el => {
            sql = sql.replace("?","'" + el + "'");
        });
        console.log("UPIT: " + sql);

        await new Promise(async (uspjeh, neuspjeh)=>{


            this.db?.all(sql, (greska, rez) => {

    
                if (greska) 
                {
                    console.log("Greska " + greska);
                    neuspjeh(greska);
                }
                else 
                {
                    console.log("Uspjeh " /*+ JSON.stringify(rez)*/);
                    uspjeh(rez);
                }
            });
        }).then((rezultat : any) => {podaci = rezultat});

        return podaci;
    }

    zatvoriVezu() {
        this.db?.close();
    }

}

module.exports = Baza;
