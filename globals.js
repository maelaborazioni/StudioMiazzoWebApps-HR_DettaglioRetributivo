/**
 * Ritorna il data source contenente gli scopi per i quali è definta almeno una
 * riclassificazione completa (sino al penultimo livello) per la tipologia specificata.
 * Il foundset passato come parametro è popolato con gli scopi di cui sopra.
 * 
 * @param {String} tipologia
 * @param {Number} idDitta
 * @param {JSFoundset} fs
 * @return {String} the data source
 *
 * @properties={typeid:24,uuid:"06328083-0F86-42C7-ABC0-FBC1E595ED95"}
 */
function getScopiRiclassificati(tipologia, idDitta, fs)
{
	var sqlQuery = "SELECT TS.idScopo \
	 				FROM TabScopi TS \
						INNER JOIN DitteScopiRiclassificazioni DscR ON TS.idScopo = DscR.idScopo \
						INNER JOIN DitteSezioniRiclassificazioni DSeR ON DScR.idDittaScopoRiclassificazione = DSeR.idDittaScopoRiclassificazione \
					WHERE DscR.idTipologiaElemento = (SELECT idTipologiaElemento FROM TabTipologieElementi WHERE Codice = ?) \
						AND DscR.idditta = ? \
					ORDER BY TS.Ordine";
	
	fs && fs.loadRecords(sqlQuery, [tipologia, idDitta]);
	return fs && fs.getDataSource();
}

/**
 * Ritorna il data source contenente le riclassificazioni degli scopi per le quali è
 * presente la riclassificazione di almeno un elemento, per la tipologia specificata.
 * Il foundset passato come parametro è popolato con i dati recuperati.
 * 
 * @param {String} tipologia
 * @param {Number} idDitta
 * @param {JSFoundset} fs
 * 
 * @return {String} the data source
 *
 * @properties={typeid:24,uuid:"27696004-348E-447A-9ACD-E9702F0E5891"}
 */
function getScopiRiclassificazioniWithElements(tipologia, idDitta, fs)
{
	var sqlQuery = "SELECT DScR.idDittaScopoRiclassificazione \
					FROM DitteScopiRiclassificazioni DScR \
						INNER JOIN DitteSezioniRiclassificazioni DSeR ON DScR.idDittaScopoRiclassificazione = DSeR.idDittaScopoRiclassificazione \
						INNER JOIN DitteElementiRiclassificazioni DER ON DSeR.idDittaSezioneRiclassificazione = DER.idDittaSezioneRiclassificazione \
					WHERE DScR.idTipologiaElemento = (SELECT idTipologiaElemento FROM TabTipologieElementi WHERE Codice = ?) \
						AND DScR.idditta = ? \
					GROUP BY DScR.idDittaScopoRiclassificazione, DscR.idScopo, DScR.Codice, DScR.Descrizione, DscR.Ordine";
	
	fs && fs.loadRecords(sqlQuery, [tipologia, idDitta]);
	return fs && fs.getDataSource();
}

/**
 * Ritorna il data source contenente le riclassificazioni delle sezioni per le quali è
 * presente la riclassificazione di almeno un elemento, per la tipologia specificata.
 * Il foundset passato come parametro è popolato con i dati recuperati.
 * 
 * @param {String} tipologia
 * @param {JSFoundset} fs
 * @return {String} the data source
 *
 * @properties={typeid:24,uuid:"3DB5A751-69F4-4062-A8C1-CB57FAE7D2A9"}
 */
function getSezioniRiclassificazioniWithElements(tipologia, fs)
{		
	var _sql = "SELECT DISTINCT DSeR.idDittaSezioneRiclassificazione \
				FROM DitteSezioniRiclassificazioni DSeR \
					INNER JOIN DitteScopiRiclassificazioni DScR ON DSeR.idDittaScopoRiclassificazione = DScR.idDittaScopoRiclassificazione \
					INNER JOIN DitteElementiRiclassificazioni DER ON DSeR.idDittaSezioneRiclassificazione = DER.idDittaSezioneRiclassificazione \
				WHERE DScR.idTipologiaElemento = (SELECT idTipologiaElemento FROM TabTipologieElementi WHERE Codice = ?)";
			
	fs && fs.loadRecords(_sql, [tipologia]);
	return fs && fs.getDataSource();
}

/**
 * @properties={typeid:24,uuid:"D74AFB7F-D466-4527-AE09-F70D458072AF"}
 * @AllowToRunInFind
 */
function openSezioneDetails(returnDataProvider, tableName, mouseX, mouseY)
{
	forms.hr_dettaglioretributivo_main.updateSezioniDetails(returnDataProvider, true);
}

/**
 * @properties={typeid:24,uuid:"F4557FCD-A810-4423-9B20-298652E9555E"}
 * @AllowToRunInFind
 */
function openElementiDetails(returnDataProvider, tableName, mouseX, mouseY) 
{
	forms.hr_dettaglioretributivo_main.updateElementiDetails(returnDataProvider, true);
}

/**
 * @AllowToRunInFind
 * 
 * @param {String} code
 *
 * @properties={typeid:24,uuid:"345B11DD-A22B-4B85-BD42-1F1469189940"}
 */
function getTipologiaElemento(code) 
{
	var fs = databaseManager.getFoundSet(globals.Server.MA_HR, 'tabtipologieelementi');	
	if(fs && fs.find())
	{
		fs['codice'] = code
		if(fs.search(true) > 0)
			return fs.getSelectedRecord();
	}
	
	return null;
}
