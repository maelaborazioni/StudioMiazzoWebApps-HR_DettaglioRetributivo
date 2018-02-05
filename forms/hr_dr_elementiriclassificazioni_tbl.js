/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"56FEB384-C26A-4FDA-9D0F-1E1C6C5EDA24"}
 * @AllowToRunInFind
 */
function showHistory(event) 
{
	var codice = elementiriclassificazioni_to_sezioniriclassificazioni &&
				 elementiriclassificazioni_to_sezioniriclassificazioni.sezioniriclassificazioni_to_scopiriclassificazioni &&
				 elementiriclassificazioni_to_sezioniriclassificazioni.sezioniriclassificazioni_to_scopiriclassificazioni.scopiriclassificazioni_to_tipologieelementi.codice;
	
	var ds = null;
	if(codice == globals.codELEMENTI)
	{
		ds = globals.getStoricoElementiRetributivi(foundset.getSelectedRecord());
	}
	else if(codice == globals.codVOCI)
	{
		ds = globals.getStoricoVoci(foundset.getSelectedRecord());
	}
	
	if(!ds)
		globals.ma_utl_showInfoDialog('Storico non presente');
	
	forms.hr_dr_elementi_history_main.elements.history_tabless.removeAllTabs();
	
	var formObj = forms.hr_dr_elementi_history_tbl;
	var form = formObj.controller.getName();
	var formToDisplay = forms.hr_dr_elementi_history_main.controller.getName();
	
	var cloneForm = form + '_clone';
	if(ds)
	{
		if(!forms[cloneForm])
		{
			var elems = formObj.elements;

			var jsForm = solutionModel.cloneForm(cloneForm, solutionModel.getForm(form));
				jsForm.dataSource = ds;
				jsForm.getField(elems.fld_descrizione.getName()).dataProviderID = 'descrizione';
				jsForm.getField(elems.fld_decorrenza.getName()).dataProviderID = 'decorrenza';
				jsForm.getField(elems.fld_valore.getName()).dataProviderID = 'importo';
				jsForm.getField(elems.fld_valuta.getName()).dataProviderID = 'valuta';
		}
	}
	else
	{
		application.output('Nessuno storico presente', LOGGINGLEVEL.INFO);
		return;
	}
	
	forms.hr_dr_elementi_history_main.elements.history_tabless.addTab
	(
		 cloneForm ? cloneForm : form
		,'elementi_retributivi_tab'
	);
	
	globals.ma_utl_showFormInDialog(formToDisplay, 'Storico elementi retributivi');
}

/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"F6ED0627-744D-4D0B-B9D7-3E1CB8B35FD8"}
 */
function onRenderBtnHistory(event) 
{
	/** @type {JSRecord<{ammettestorico: Boolean, segno: Integer }>} */
	var record = event.getRecord();
	var renderable = event.getRenderable();
	
	// Disabilita il pulsante di storico se non ammesso
	if(record && (!record.ammettestorico || !record.segno))
		renderable.enabled = false;
}
