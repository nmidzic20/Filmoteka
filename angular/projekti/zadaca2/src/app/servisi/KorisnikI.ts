export interface KorisnikI
{
    korime : string;
    ime? : string;
    prezime? : string;
    lozinka? : string;
    email? : string;
    tip_korisnika_id? : number;
    aktivan? : boolean;
    blokiran? : boolean;
    datum_registracije? : Date;
    aktivacijski_kod? : string;
    totp? : string;
}