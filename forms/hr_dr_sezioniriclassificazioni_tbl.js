/**
 * Perform the element default action.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"211A5835-2095-4A6B-B8E5-C128F8920149"}
 * @AllowToRunInFind
 */
function _showHistory(event) {
	
// TODO _showHistory : verificare se da eliminare	
//	var _ds = globals.getStoricoElementiRetributivi(foundset.getSelectedRecord())
//	forms.dipendenti_elementiretributivi_history.elements.history_tabless.removeAllTabs()
//	
//	var _formObj = forms.dipendenti_elementiretributivi_tbl_history
//	var _form = _formObj.controller.getName()
//	var _formToDisplay = forms.dipendenti_elementiretributivi_history.controller.getName()
//	
//	if(_ds)
//	{
//		var _cloneForm = _form + '_clone'
//		
//		if(forms[_cloneForm])
//		{
//			history.removeForm(_cloneForm)
//			solutionModel.removeForm(_cloneForm)
//		}
//		var _elems = _formObj.elements
//		var _jsForm = solutionModel.cloneForm(_cloneForm, solutionModel.getForm(_form))
//		
////		if(_ds.getMaxRowIndex() < 8)
////			_jsForm.getPart(JSPart.BODY).height = 20 * _ds.getMaxRowIndex()
////		
//		_jsForm.dataSource = _ds.createDataSource
//		(
//				'elementi_retributivi_history',
//				[
//				 JSColumn.INTEGER		// CodContratto
//				,JSColumn.TEXT			// CodLivello
//				,JSColumn.DATETIME		// Decorrenza
//				,JSColumn.NUMBER		// Importo
//				,JSColumn.TEXT			// Descrizione
//				,JSColumn.TEXT			// Codice
//				]
//		)
//		_jsForm.getField(_elems.descrizione.getName()).dataProviderID = 'descrizione'
//		_jsForm.getField(_elems.codice.getName()).dataProviderID = 'codice'
//		_jsForm.getField(_elems.decorrenza.getName()).dataProviderID = 'decorrenza'
//		_jsForm.getField(_elems.valore.getName()).dataProviderID = 'importo'
//	}
//	
//	forms.dipendenti_elementiretributivi_history.elements.history_tabless.addTab(_cloneForm ? _cloneForm : _form, 'elementi_retributivi_tab')
//	globals._showFormInDialog(_formToDisplay,'Storico elementi retributivi')
}
