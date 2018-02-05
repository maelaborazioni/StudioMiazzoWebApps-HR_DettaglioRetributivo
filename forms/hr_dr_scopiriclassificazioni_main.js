/**
 * @private 
 * 
 * @properties={typeid:35,uuid:"1904D2EC-F605-4206-ADFB-B9FC9D721202",variableType:-4}
 */
var vLastComputedRiclassificazione = null;

/**
 * @private 
 * 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"BB5666E6-BF8C-4229-AA24-DC73057BF970",variableType:4}
 */
var vLastLevelShown = 0;

/**
 * @private 
 * @type {Number}
 *
 * @properties={typeid:35,uuid:"293B0655-7859-4385-8EFC-CDE106867A2C",variableType:8}
 */
var vTotale = 0.00000;

/**
 * @param {String} _dataSource
 * @param {String} _tipologia
 * @param {Boolean} [isDetail]
 * 
 * @properties={typeid:24,uuid:"4F704E05-4C42-4012-BFC6-0A907B32B721"}
 */
function updateTotale(_dataSource, _tipologia, isDetail)
{	
	var _fs = databaseManager.getFoundSet(_dataSource);
	if(_fs.loadRecords())
	{
		vTotale = globals._sum(globals.foundsetToArray(_fs, isDetail ? 'importo_con_segno' : 'importo'));
	}
	
	elements.fld_totale.format = _tipologia === globals.codEVENTI ? '#,##0.00' : '#,##0.00000';
}

/**
 * @param {String} func
 * @param {Number} idLavoratore
 * @param {Date} situazioneAl
 * @param {String} form
 * @param {Number} [idRiclassificazione]
 * @param {Boolean} [force]
 * @param {String} [tipologia]
 * @param {Boolean} [isDetail]
 *
 * @properties={typeid:24,uuid:"BEBB6F68-61DC-4C69-ADA5-9786EFB84973"}
 */
function updateRiclassificazioneDetails(func, idLavoratore, situazioneAl, form, idRiclassificazione, force, tipologia, isDetail)
{
	if(!idRiclassificazione)
		idRiclassificazione = vLastComputedRiclassificazione;
	else
		vLastComputedRiclassificazione = idRiclassificazione;
	
	doUpdate(func, idLavoratore, situazioneAl, form, idRiclassificazione, force, tipologia, isDetail);
}

/**
 * @param {String} func
 * @param {Number} idLavoratore
 * @param {Date} situazioneAl
 * @param {String} form
 * @param {Number} [idRiclassificazione]
 * @param {Boolean} [force]
 * @param {String} [tipologia]
 * @param {Boolean} [isDetail]
 *
 * @properties={typeid:24,uuid:"76D9B759-8B7D-4B91-8659-DB50981CA272"}
 */
function doUpdate(func, idLavoratore, situazioneAl, form, idRiclassificazione, force, tipologia, isDetail)
{
	var detailTabless = elements.detail_tabless;
	
	var cloneForm = [form, 'clone', idRiclassificazione, idLavoratore].join('_');
	
	var dataSource = null;
	
	/**
	 * Ricalcola il datasource solo se forzato o non esistente
	 */
	if(force || !forms[cloneForm])
	{
		dataSource = globals[func](idLavoratore, situazioneAl, idRiclassificazione);
	}
	
	/**
	 * Crea la form di dettaglio se non esistente ed il datasource è presente
	 */
	if(!forms[cloneForm] && dataSource)
	{
		var jsForm = solutionModel.cloneForm(cloneForm, solutionModel.getForm(form));
		
			jsForm.dataSource = dataSource;
			jsForm.getField('fld_codice').dataProviderID = 'codice';
			jsForm.getField('fld_descrizione').dataProviderID = 'descrizione';
		
		if(jsForm.getField('fld_decorrenza'))
			jsForm.getField('fld_decorrenza').dataProviderID = 'decorrenza';
		
		var importoField = jsForm.getField('fld_importo');
		
		/**
		 * Considera il segno solo se in visualizzazione dettagliata, altrimenti
		 * visualizza direttamente quanto già calcolato
		 */
		if(isDetail)
		{
			var importo_con_segno = solutionModel.getDataSourceNode(dataSource).getCalculation('importo_con_segno');
			if(!importo_con_segno)
				importo_con_segno = solutionModel.getDataSourceNode(dataSource).newCalculation('function importo_con_segno(){ return importo * segno; }', JSColumn.NUMBER);
			
			importoField.dataProviderID = importo_con_segno.getName();
		}
		else
		{
			importoField.dataProviderID = 'importo';
		}
		
		/**
		 * Applica formati differenti a seconda della tipologia
		 */
		if(tipologia && tipologia === globals.codEVENTI)
		{			
			importoField.format = '#,##0.00';
			importoField.titleText = 'Ore';
		}
		else
		{
			importoField.format = '#,##0.00000';
			jsForm.getField('fld_valuta').dataProviderID = 'valuta';
		}
			
		detailTabless.addTab(
			 cloneForm
			,cloneForm
			,null
			,null
			,null
			,null
			,null
			,null
			,detailTabless.getMaxTabIndex() + 1
		);
	
		forms[cloneForm].foundset.loadAllRecords();
		
		/**
		 * Nascondi la decorrenza se sto visualizzando voci od eventi 
		 */
		if(tipologia && (tipologia === globals.codVOCI || tipologia === globals.codEVENTI))
		{
			// Nascondi anche la valuta per gli eventi
			if(tipologia === globals.codEVENTI)
				forms[cloneForm].elements['fld_valuta'].visible = false;
				
			if(forms[cloneForm].elements['fld_decorrenza'])
				forms[cloneForm].elements['fld_decorrenza'].visible = false;
		}
			
		if(isDetail && tipologia === globals.codEVENTI)
			forms[cloneForm].elements['btn_history'].enabled = false;
	} // FINE creazione form di dettaglio
	
	/**
	 * Mostra la form vuota quanto non ci sono dati da visualizzare. Altrimenti,
	 * aggiorna il totale ed imposta la form di dettaglio appena creata
	 */
	if(!dataSource && (force || !forms[cloneForm]))
	{
		resetDetails();
	}
	else
	{
		// Aggiorna la somma
		if(dataSource)
			updateTotale(dataSource, tipologia, isDetail);
		setDetailsTab(cloneForm)
	}
}

/**
 * Aggiorna il menu di selezione delle riclassificazioni, secondo la tipologia e la
 * ditta specificate.
 * 
 * @param {String} tipologia la tipologia degli elementi riclassificati (elementi, voci, eventi)
 * @param {Number} idDitta
 * @param {Array} [selectionPath] un array contenente gli id delle riclassificazioni con le quali
 * 								  impostare la selezione del menu, ordinate per livello.<p/>
 * 								  <code>selectionPath = [idScopo, idScopoRiclassificazione, idSezioneRiclassificazione]</code>
 *
 * @properties={typeid:24,uuid:"B3E9F397-8DF1-4920-B0CF-946D42CDAB58"}
 * @AllowToRunInFind
 */
function refreshTree(tipologia, idDitta, selectionPath)
{	
	// Some other execution could have disabled this
	elements.scopi_tree.enabled = true;
	
//	/** @type {JSFoundset<db:/ma_hr/tabscopi>} */
//	var scopiFs = databaseManager.getFoundSet(globals.Server.MA_HR, 'tabscopi');
//	globals.getScopiRiclassificati(tipologia, idDitta, scopiFs);

	/** @type {JSFoundset<db:/ma_hr/dittascopo>} */
	var scopiFs = databaseManager.getFoundSet(globals.Server.MA_HR, 'dittascopo');
	if(scopiFs && scopiFs.find())
	{
		scopiFs.idditta = idDitta;
		scopiFs.dittascopo_to_scopitipologieelementi.codtipologiaelemento = tipologia;
		scopiFs.search();
	}

	/**
	 * Disabilita l'albero se non è definito alcuno scopo. Altrimenti,
	 * popola i livelli secondo lo schema di riclassificazione definito.
	 */
	if(scopiFs.getSize() === 0)
	{
		elements.scopi_tree.enabled = false;
	}
	else
	{
		scopiFs.sort('dittascopo_to_tabscopi.ordine asc');
		
			/**
			 * Recupera gli scopi della ditta per il primo livello. Filtra il secondo
			 * livello in base alla tipologia ed alla ditta
			 */
		var binding = elements.scopi_tree.createBinding(scopiFs.getDataSource());
			binding.setImageURLDataprovider('scopi_icon');
			binding.setNRelationName('dittascopo_to_scopitipologieelementi' + (tipologia ? '_' + tipologia.toLowerCase() : '') + '.scopitipologieelementi_to_scopiriclassificazioni_filtered_by_ditta');
			binding.setTextDataprovider('descrizione');
			binding.setChildSortDataprovider('sort_order');
			
			/**
			 * Recupera le riclassificazioni degli scopi per il secondo livello.
			 */
			binding = elements.scopi_tree.createBinding(scopiFs.dittascopo_to_scopiriclassificazioni.getDataSource());
			binding.setImageURLDataprovider('scopiriclassificazioni_icon');
			binding.setNRelationName('scopiriclassificazioni_to_sezioniriclassificazioni_abilitate');
			binding.setTextDataprovider('descrizione');
			binding.setChildSortDataprovider('sort_order');
			binding.setMethodToCallOnClick(globals.openSezioneDetails, 'iddittascoporiclassificazione');
			
			/**
			 * Recupera le riclassificazioni delle sezioni per il terzo livello
			 */
			binding = elements.scopi_tree.createBinding(scopiFs.dittascopo_to_scopiriclassificazioni.scopiriclassificazioni_to_sezioniriclassificazioni.getDataSource());
			binding.setImageURLDataprovider('sezioniriclassificazioni_icon');
			binding.setTextDataprovider('descrizione');
			binding.setMethodToCallOnClick(globals.openElementiDetails, 'iddittasezionericlassificazione');
	}

	/**
	 * Pulisci l'albero
	 */
	elements.scopi_tree.removeAllRoots();
	elements.scopi_tree.addRoots(scopiFs)	
	
	/**
	 * Ripristina l'ultima selezione, se presente
	 */
	if(selectionPath && selectionPath.length > 0)
		elements.scopi_tree.selectionPath = selectionPath;
}

/**
 * @properties={typeid:24,uuid:"BFBFFBE9-B783-4FEE-A195-742D04BFF790"}
 */
function getSelectionPath()
{
	return elements.scopi_tree.selectionPath;
}

/**
 * @return {Number}
 * 
 * @properties={typeid:24,uuid:"334F8782-0B21-46D3-B46C-68AE82F00D58"}
 */
function getDetailsIndex()
{
	return elements.detail_tabless.tabIndex;
}

/**
 * @param {Object} index
 *
 * @properties={typeid:24,uuid:"37B4A396-CA3B-40A8-B1DF-A97CDEA3EED1"}
 */
function setDetailsTab(index)
{
	elements.detail_tabless.tabIndex = index;
}

/**
 * @properties={typeid:24,uuid:"EE1BA217-D809-43E5-A4C8-22959DDF9383"}
 */
function resetDetails()
{
	// Set the empty tab
	setDetailsTab(1)
	vTotale = 0
}

/**
 * @properties={typeid:24,uuid:"4BF87708-AC16-41FE-BB2F-99FA4675DC7C"}
 */
function getLastLevelShown()
{
	return vLastLevelShown;
}

/**
 * @param {Number} level
 *
 * @properties={typeid:24,uuid:"58B9FCD8-62A9-405D-8C6B-9D4DD65990AA"}
 */
function setLastLevelShown(level)
{
	vLastLevelShown = level
}
