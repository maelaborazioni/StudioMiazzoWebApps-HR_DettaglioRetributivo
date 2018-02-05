/**
 * Called before the form component is rendered.
 *
 * @param {JSRenderEvent} event the render event
 *
 * @private
 *
 * @properties={typeid:24,uuid:"0A950DD6-1FEA-45F4-94D8-9E64EB92CCC8"}
 */
function onRenderValore(event)
{
	var record = event.getRecord();
	if(record && record['valuta'] === 'Lire')
	{
		event.getRenderable()['format'] = '#,##0';
	}
	else
	{
		event.getRenderable()['format'] = '#,##0.00000';
	}
}