//const Baza = require("../baza.js");
const Baza = require("../build/baza.js");


class KorisnikDAO {

	constructor() {
		this.baza = new Baza();

	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik;"
		var podaci = await this.baza.izvrsiUpitSelect(sql, []);
		console.log(podaci);
		this.baza.zatvoriVezu();
		return podaci;
	}

	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik WHERE korime=?;"
		var podaci = await this.baza.izvrsiUpitSelect(sql, [korime]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else 
			return null;
	}

	dodaj = async function (korisnik) {
		console.log(korisnik)
		let sql = `INSERT INTO korisnik (korime,ime,prezime,lozinka,email,tip_korisnika_id,aktivan, blokiran,
			datum_registracije, aktivacijski_kod, totp) VALUES (?,?,?,?,?,?,?,?,?,?,?)`;
        let podaci = [korisnik.korime,korisnik.ime,korisnik.prezime,
                      korisnik.lozinka,korisnik.email,2,
					  korisnik.aktivan, korisnik.blokiran,
					  korisnik.datum_registracije, korisnik.aktivacijskiKod, korisnik.TOTPkljuc];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return izvrseno;
	}

	obrisi = async function (korime) 
	{

		let sql = "DELETE FROM korisnik WHERE korime=?";
		await this.baza.izvrsiUpit(sql,[korime]);
		this.baza.zatvoriVezu();

		return true;
	}

	azuriraj = async function (korime, korisnik) 
	{
		let sql = `UPDATE korisnik SET ime=?, prezime=? WHERE korime=?`;
        let podaci = [korisnik.ime,korisnik.prezime,korime];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

	aktiviraj = async function (korime)
	{
		let sql = `UPDATE korisnik SET aktivan=1 WHERE korime=?`;
		let podaci = [korime];
		await this.baza.izvrsiUpit(sql, podaci);
		this.baza.zatvoriVezu();

		return true;
	}
}

module.exports = KorisnikDAO;