/* Připojení modulu frameworku Express (https://expressjs.com/) */
const express = require("express");
/* Připojení externího modulu body-parser (https://www.npmjs.com/package/body-parser) - middleware pro parsování těla požadavku */
const bodyParser = require("body-parser");
/* Připojení externího modulu csvtojson (https://www.npmjs.com/package/csvtojson) - knihovna usnadňující načtení dat z CSV do formátu JSON */
const csv = require('csvtojson');
/* Připojení vestavěných  modulů fs (práce se soubory) a path (cesty v adresářové struktuře) */
const fs = require("fs");
const path = require("path");

/* Vytvoření základního objektu serverové aplikace */
const app = express();
/* Nastavení portu, na němž bude spuštěný server naslouchat */
const port = 3000;

/* Identifikace složky obsahující statické soubory klientské části webu */
app.use(express.static("public"));
/* Nastavení typu šablonovacího engine na pug*/
app.set("view engine", "pug");
/* Nastavení složky, kde budou umístěny šablony pug */
app.set("views", path.join(__dirname, "views"));

/* Využití modulu body-parser pro parsování těla požadavku */
const urlencodedParser = bodyParser.urlencoded({extended: false});
/* Ošetření požadavku poslaného metodou POST na adresu <server>/savedata
   Ukládá data poslaná z webového formuláře do souboru CSV */
app.post('/savedata', urlencodedParser, (req, res) => {
    /* Vytvoření řetězce z dat odeslaných z formuláře v těle požadavku (req.body) a obsahu proměnné date.
       Data jsou obalena uvozovkami a oddělená čárkou. Escape sekvence \n provede ukončení řádku. */
    let str = `"${req.body.email}","${req.body.nickname}","${req.body.psw}"\n`;
    /* Pomocí modulu fs a metody appendFile dojde k přidání připraveného řádku (proměnná str) do uvedeného souboru */
    fs.appendFile(path.join(__dirname, 'data/data.csv'), str, function (err) {
        /* Když byla zaznamenána chyba při práci se souborem */
        if (err) {
            /* Vypsání chyby do konzole NodeJS (na serveru). */
            console.error(err);
            /* Odpovědí serveru bude stavová zpráva 400 a v hlavičce odpovědi budou odeslány upřesňující informace. */
            return res.status(400).json({
                success: false,
                message: "Nastala chyba během ukládání souboru"
            });
        }
    });
    /* Přesměrování na úvodní stránku serverové aplikace včetně odeslání stavové zprávy 301. */
    res.redirect(301, '/results');
});

app.get('/results', (req, res) => {
    csv().fromFile('./data/data.csv')
    .then(data => {
        console.log(data);
        // res.send(data);
        res.render('index.pug', {'datas':data, 'nadpis': 'Dates'});
    })
    .catch(err => {
        console.log(err);
    })
});

/* Spuštění webového serveru */
app.listen(port, () => {
    console.log(`Server naslouchá na portu ${port}`);
}); 