//const Baza = require("../baza.js");
const Baza = require("../build/baza.js");

module.exports = class ZanrDAO 
{

	constructor() 
    {
		this.baza = new Baza();
	}

	dajSve = async function() 
    {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM zanr;"
		var podaci = await this.baza.izvrsiUpitSelect(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	daj = async function(id) 
	{
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM zanr WHERE z_tmdb_id=?;"
		var podaci = await this.baza.izvrsiUpitSelect(sql, [id]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else 
			return null;
	}

	dodaj = async function(zanr) 
	{
		console.log(zanr)
		let sql = `INSERT INTO zanr (z_tmdb_id,z_naziv,originalni_naziv) VALUES (?,?,?);`;
        let podaci = [zanr.id,zanr.name, zanr.name];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

	obrisi = async function (id) 
	{
		let sql = `DELETE FROM zanr WHERE z_tmdb_id=? AND NOT EXISTS (SELECT 1 FROM film_zanr WHERE zanr_id=?);`;
		let podaci = [id, id];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

	obrisiSveBezFilmova = async function () 
	{

		let sql = `DELETE FROM zanr WHERE NOT EXISTS (SELECT 1 FROM film_zanr WHERE film_zanr.zanr_id=zanr.z_tmdb_id);`;
		await this.baza.izvrsiUpit(sql);
		this.baza.zatvoriVezu();

		return true;
	}

	azuriraj = async function (id, zanr) 
	{

		let sql = `UPDATE zanr SET z_naziv=? WHERE z_tmdb_id=?;`;
        let podaci = [zanr.z_naziv, id];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

}

