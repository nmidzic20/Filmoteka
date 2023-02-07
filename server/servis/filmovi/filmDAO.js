const { ADDRGETNETWORKPARAMS } = require("dns");
//const Baza = require("../baza.js");
const Baza = require("../build/baza.js");

module.exports = class FilmDAO 
{
	constructor() 
    {
		this.baza = new Baza();
	}

	dajBrojTrazenihFilmova = async function (upit)
	{
		this.baza.spojiSeNaBazu();
		let sql = upit.split(" LIMIT");
		sql = sql[0].replace("*", "COUNT(*)");
		console.log("DAJ BROJ TRAZENIH FILMOVA IZ FILM DAO " + sql);
		let broj = await this.baza.izvrsiUpitSelect(sql, []);
		this.baza.zatvoriVezu();
		return broj;
	}

	dajSve = async function() 
    {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM film;"
		let podaci = await this.baza.izvrsiUpitSelect(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	}

	dajPretrazivanje = async function(params) 
    {
		console.log(JSON.stringify(params));
		this.baza.spojiSeNaBazu();
		let sql = `SELECT * FROM film JOIN film_zanr ON film.tmdb_id=film_zanr.film_id 
		JOIN zanr ON zanr.z_tmdb_id=film_zanr.zanr_id`;

		if (params.datum != null && params.datum != "" && params.datum != 'undefined')
		{
			sql += " WHERE film.datum_dodan > '" + params.datum + "'";
		}
		if (params.zanr_id != null && params.zanr_id != "" && params.zanr_id != 'undefined')
		{
			sql += ` WHERE zanr.z_tmdb_id=` + params.zanr_id;
		}
		if (params.naziv != null && params.naziv != "" && params.naziv != 'undefined')
		{
			sql += " WHERE film.naziv LIKE '%" + params.naziv + "%'";
		}
		if (params.sortiraj != null  && params.sortiraj != "" && params.sortiraj != 'undefined' &&
		(params.sortiraj == 'd' || params.sortiraj == 'z' || params.sortiraj == 'n'))
		{
			sql += " ORDER BY";
			switch(params.sortiraj)
			{
				case 'd':
					sql += " film.datum_dodan";
					break;
				case 'z':
					if (params.zanr_id == "" || params.zanr_id == "undefined" || params.zanr_id == null || params.zanr_id == undefined) 
					{
						sql += " zanr.z_naziv"; 
						break;
					}
				case 'n':
					sql += " film.naziv";
					break;
			}
		}


		let brojSubstringova = (sql.match(/WHERE/g)) ? (sql.match(/WHERE/g)).length : 0;
		if (brojSubstringova > 1)
		{
			let podijeli = sql.split('WHERE');
			sql = podijeli[0] + 'WHERE' + podijeli.slice(1).join('AND');
		}

		var podaci = await this.baza.izvrsiUpitSelect(sql, [podaci]);
		this.baza.zatvoriVezu();
		return {"filmovi":podaci,"sql":sql};
	} 

	daj = async function(tmdb_id) 
	{
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM film WHERE tmdb_id=?;"
		let podaci = await this.baza.izvrsiUpitSelect(sql, [tmdb_id]);
		this.baza.zatvoriVezu();
		if(podaci.length == 1)
			return podaci[0];
		else 
			return null;
	}

	dajZanroveZaFilm = async function(id) 
    {
		this.baza.spojiSeNaBazu();
		let sql = `SELECT zanr.z_naziv FROM film JOIN film_zanr ON film.tmdb_id=film_zanr.film_id 
                    JOIN zanr ON zanr.z_tmdb_id=film_zanr.zanr_id
                    WHERE film.tmdb_id=?;`;
		let podaci = await this.baza.izvrsiUpitSelect(sql, [id]);
		this.baza.zatvoriVezu();
		return podaci;
	}


	dodaj = async function(film) 
	{
        
		let sql = `INSERT INTO film (tmdb_id,naziv,korisnik_dodao,datum_dodan,odobren,odrasli_film,putanja_pozadine,budzet,
			pocetna_stranica,imdb_id,originalni_jezik,originalni_naslov,sazetak,popularnost,
			putanja_postera,datum_izlaska,prihod,trajanje,status,slogan,video,prosjek_glasova,
			broj_glasova) 
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);`;
        let podaci = [film.id,film.title,film.korisnik_dodao,new Date().toISOString().slice(0, 19).replace('T', ' '),0,
			film.adult,film.backdrop_path,film.budget,film.homepage,
			film.imdb_id,film.original_language,film.original_title,film.overview,film.popularity,
			film.poster_path,film.release_date,film.revenue,film.runtime,film.status,film.tagline,
			film.video,film.vote_average,film.vote_count];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
        
	}

	dodajPoZanru = async function (film_id, zanr_id)
	{
		let sql = `INSERT INTO film_zanr
			(
				film_id, zanr_id
			)
			SELECT ?,?
			FROM
			zanr
			WHERE EXISTS
			(
				SELECT 1
				FROM zanr
				WHERE z_tmdb_id=?
			)
			LIMIT 1`;
		let podaci = [film_id, zanr_id, zanr_id];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

	obrisi = async function (id) 
	{
		let sql = "DELETE FROM film WHERE tmdb_id=?";
		console.log("sql delete " + sql + " " + id);
		await this.baza.izvrsiUpit(sql,[id]);
		this.baza.zatvoriVezu();

		return true;
	}

	azuriraj = async function (id, film) 
	{
		let sql = `UPDATE film 
			SET naziv=?,sazetak=?
			WHERE tmdb_id=?`;
        let podaci = [film.naziv, film.sazetak, id];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

	odobri = async function (id) 
	{
		let sql = `UPDATE film 
			SET odobren=1
			WHERE tmdb_id=?`;
        let podaci = [id];
		await this.baza.izvrsiUpit(sql,podaci);
		this.baza.zatvoriVezu();

		return true;
	}

}



