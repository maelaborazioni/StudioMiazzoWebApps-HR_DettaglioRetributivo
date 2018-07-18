/**
 * @type {Array}
 *
 * @properties={typeid:35,uuid:"95C0924F-8D58-4321-84B2-8B3DE389C544",variableType:-4}
 */
var tabAllaData = new Array();

/**
 * @type {Date}
 * 
 * @private 
 *
 * @properties={typeid:35,uuid:"C937B616-1610-463D-96EA-6B0587B4B71F",variableType:93}
 */
var vAllaData = new Date();

/**
 * @type {Array}
 *
 * @properties={typeid:35,uuid:"D11E0E68-A4C6-40FC-B276-F6DEC26DE1A2",variableType:-4}
 */
var vForcedTabs = new Array();

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"6FEBB4B6-5B98-4A62-9990-F925F1C0534F"}
 */
function onLoad(event)
{
	_super.onLoad(event)
	foundset.loadAllRecords()
}

/**
 * @param {Boolean} _firstShow
 * @param {JSEvent} _event
 *
 * @properties={typeid:24,uuid:"B0B3C7FE-6F24-4A9C-9B76-907129183F0C"}
 */
function onShowForm(_firstShow, _event)
{
	_super.onShowForm(_firstShow,_event);
	
	elements.alla_data.readOnly = false;
	if(!createTabs())
		return;
	
	/** @type {Number} */
	var _currTabIdx = elements.scopi_panel.tabIndex;
	var _tipologia = elements.scopi_panel.getTabNameAt(_currTabIdx);
	
	refreshTree(_tipologia);
	if(idlavoratore && tabAllaData[idlavoratore.toString()])
		vAllaData = tabAllaData[idlavoratore.toString()];
	else
		vAllaData = new Date();
}

/**
 * @param {JSEvent} _event
 * @param {String} _form
 *
 * @properties={typeid:24,uuid:"4F4B28BE-DF4A-4030-9131-AEB794B02229"}
 */
function onRecordSelection(_event, _form)
{
	_super.onRecordSelection(_event,_form);
	
	/** @type {Number} */
	var currTabIdx = elements.scopi_panel.tabIndex
	var tipologia = elements.scopi_panel.getTabNameAt(currTabIdx);
	
	if(!createTabs())
		return;
	
	elements.scopi_panel.tabIndex = tipologia;
	
	// Non aggiornare l'albero alla prima chiamata dell'onRecordSelection o se non riesco
	// a recuperare la tipologia della tab corrente
	if(tipologia)
	{		
		refreshTree(tipologia);
	}
}

/**
 * Crea i tab relativi alle tipologie definite per lo scopo corrente.
 * (es.: Elementi/Voci/Ore)
 * 
 * @properties={typeid:24,uuid:"25218304-3069-4CF7-8DD8-0150C463F6C1"}
 * @AllowToRunInFind
 */
function createTabs()
{
	// Rimuovi tutti i tab definiti precedentemente
	if(elements.scopi_panel.getMaxTabIndex() > 0)
	{
		elements.scopi_panel.removeAllTabs();
	}
	
	// Controlla che almeno una tipologia sia associata allo scopo corrente
	/** @type {JSFoundSet<db:/ma_hr/tabtipologieelementi>} */
	var tipologiaFoundset = databaseManager.getFoundSet(globals.Server.MA_HR, 'tabtipologieelementi');
	
	// Escludi le tipologie che non hanno riclassificazioni associate per la ditta corrente
	if(tipologiaFoundset && tipologiaFoundset.find())
	{
		tipologiaFoundset.tipologieelementi_to_scopiriclassificazioni.idditta = idditta_sede;
		tipologiaFoundset.search();
	}
	
	tipologiaFoundset.sort('ordine asc')
	
	// Aggiungi un tab per ogni tipologia
	for(var i = 1; i <= tipologiaFoundset.getSize(); i++)
	{
		tipologiaFoundset.setSelectedIndex(i);
			
		var tipologia = tipologiaFoundset.getSelectedRecord();
		
		// Crea un form clone specifico per la tipologia, in modo da evitare che diversi tab condividano la stessa
		// maschera di dettaglio qualora questa esista
		var form = forms.hr_dr_scopiriclassificazioni_main.controller.getName();
		var cloneForm = [form, 'clone', tipologia.codice, idlavoratore].join('_');
		
		// Crea il clone solo se non esiste
		if(!forms[cloneForm])
		{
			solutionModel.cloneForm(cloneForm, solutionModel.getForm(form));
		}
		
		elements.scopi_panel.addTab(
			cloneForm,					// form
			tipologia.codice,			// name
			tipologia.descrizione,		// text
			null,						// tooltip
			null,						// iconurl
			null,						// fg
			null,						// bg
			null,						// relation/related foundset
			tipologia.ordine			// index
		);
	}
	
	// Se nessuna tipologia prevede riclassificazioni, visualizza un messaggio di errore
	if(elements.scopi_panel.getMaxTabIndex() === 0)
	{
		globals.ma_utl_showWarningDialog('Nessuna riclassificazione definita', 'i18n:ma.msg.warning');
		return false;
	}
	
	return true;
}

/**
 * @param {String} tipologia
 * @param {Array} [path]
 *
 * @properties={typeid:24,uuid:"44E982B6-4ACC-4B21-8425-09EB2624FD5C"}
 */
function refreshTree(tipologia, path)
{
	/** @type {Number} */
	var currTabIdx = elements.scopi_panel.tabIndex;
	forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].refreshTree(tipologia, idditta_sede, path);
}

/**
 * @param {Number} idScopoRiclassificazione
 * @param {Boolean} [force] se il calcolo va forzato
 * 
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"1C21A6C4-4382-482D-9009-6160F7DC48F1"}
 */
function updateSezioniDetails(idScopoRiclassificazione, force)
{
	try
	{
		checkAllaData(vAllaData);
			
		/** @type {Number} */
		var currTabIdx = elements.scopi_panel.tabIndex;
		var tipologia = elements.scopi_panel.getTabNameAt(currTabIdx);
		var func = 'getTotaleSezioni' + globals.getTipologiaElemento(tipologia)['descrizione'] + 'DataSource';
		forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].setLastLevelShown(1);
		forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].updateRiclassificazioneDetails(func, idlavoratore, vAllaData, forms.hr_dr_sezioniriclassificazioni_tbl.controller.getName(), idScopoRiclassificazione, force, tipologia);
	}
	catch(ex)
	{
		globals.ma_utl_showWarningDialog(ex.message, 'i18n:ma.msg.warning');
	}
}

/**
 * @param {Number} idSezioneRiclassificazione
 * @param {Boolean} [force] se il calcolo va forzato
 * 
 * @AllowToRunInFind
 *
 * @properties={typeid:24,uuid:"3864ABDF-07DE-4667-AF56-C4943456B44A"}
 */
function updateElementiDetails(idSezioneRiclassificazione, force)
{
	try
	{
		checkAllaData(vAllaData);
		
		/** @type {Number} */
		var currTabIdx = elements.scopi_panel.tabIndex; 
		var tipologia = elements.scopi_panel.getTabNameAt(currTabIdx);
		var func = 'getRiclassificazione' + globals.getTipologiaElemento(tipologia)['descrizione'] + 'DataSource';
		forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].setLastLevelShown(2);
		forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].updateRiclassificazioneDetails(func, idlavoratore, vAllaData, forms.hr_dr_elementiriclassificazioni_tbl.controller.getName(), idSezioneRiclassificazione, force, tipologia, true);
	}
	catch(ex)
	{
		globals.ma_utl_logError(ex);
		globals.ma_utl_showErrorDialog('i18n:ma.err.generic_error');
	}
}

/**
 * Callback method when the user changes tab in a tab panel or divider position in split pane.
 *
 * @param {Number} previousIndex index of tab shown before the change
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A06D3498-4AEC-4C14-8724-59C3ADCDEEA4"}
 */
function onTabChange(previousIndex, event)
{	
	/** @type {Number} */
	var currTabIdx = elements.scopi_panel.tabIndex;
	var tipologia = elements.scopi_panel.getTabNameAt(currTabIdx);
	
	if(vForcedTabs[tipologia])
	{
		vForcedTabs[tipologia] = false;
		forceUpdateDetails(event);
	}
	
//	// Memorizza la selection path attuale e imposta quella precedente
//	_selectionPath[previousIndex-1] = forms[elements.scopi_panel.getTabFormNameAt(previousIndex)].getSelectionPath()
	forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].refreshTree(tipologia, idditta_sede);
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"A81D7673-0757-428F-A46B-2E951ABFF581"}
 */
function forceUpdateElementiDetails(event) 
{
	updateElementiDetails(null, true);	// use the last computed value
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"1D48EDBE-D767-4AE3-A16B-4E1564A27F3D"}
 */
function forceUpdateSezioniDetails(event) 
{
	updateSezioniDetails(null, true);	// use the last computed value
}

/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F5C3AC79-84DF-4F86-AE6F-10C6B267FA62"}
 */
function forceUpdateDetails(event) 
{
	try
	{
		if(checkAllaData(vAllaData))
		{
			var currTabIdx = elements.scopi_panel.tabIndex;
			var lastLevelShown = forms[elements.scopi_panel.getTabFormNameAt(currTabIdx)].getLastLevelShown();

			switch(lastLevelShown)
			{
				case 1:
					forceUpdateSezioniDetails(event);
					break;
				case 2:
					forceUpdateElementiDetails(event);
					break;
			}
		}
	}
	catch(ex)
	{
		globals.ma_utl_showWarningDialog(ex.message,'i18n:ma.msg.warning');
	}
}

/**
 * @param {Number} index
 *
 * @properties={typeid:24,uuid:"77697198-ADFE-44BC-9770-DA362CC07236"}
 */
function resetDetails(index)
{
	forms[elements.scopi_panel.getTabFormNameAt(index)].resetDetails();
}

/**
 * Handle changed data.
 *
 * @param {Date} date
 *
 * @returns {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"6379B3E6-FFFA-4A5E-B46E-05D5C2A331B3"}
 */
function checkAllaData(date)
{
	// Cut off hours
	date.setHours(0,0,0,0);
	
	if(date < utils.parseDate('20080101', globals.ISO_DATEFORMAT))
		throw 'La data inserita deve essere posteriore al 01/01/2008';
	else if(date < assunzione || (cessazione && date > cessazione))
		throw 'Dipendente non in forza nel periodo richiesto';
	
	return true;
}

/**
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"37088C58-E422-4625-88A1-ADAE5C0FC199"}
 */
function onHide(event)
{
	if(_super.onHide(event))
	{
		if(idlavoratore)
			tabAllaData[idlavoratore.toString()] = vAllaData;
		return true;
	}
	
	return false;
}
