console.log('dev');
$(function(){


	// dataAllowed : realtime filter
	$(document).on('keyup', '.webform-input [data-allowed]', function(evt){
		var $field = $(this);
		var allowed = $field.attr('data-allowed');
		var original = $field.val();
		var filtered = '';
		for ( i=0; i<original.length; i++ ) if ( allowed.indexOf(original[i]) !== -1 ) filtered += original[i];
		if ( $field.val() != filtered ) $field.val(filtered);
	});


	// dataDisallowed : realtime filter
	$(document).on('keyup', '.webform-input [data-disallowed]', function(evt){
		var $field = $(this);
		var disallowed = $field.attr('data-disallowed');
		var filtered = $field.val();
		for ( i=0; i<disallowed.length; i++ ) filtered = filtered.replace(disallowed[i], '');
		if ( $field.val() != filtered ) $field.val(filtered);
	});


	// toggleAttr : behavior
	$(document).on('change', '.webform-input [data-toggle-attr]', function(evt){
		var $thisField = $(this);
		var toggleConfig = JSON.parse($thisField.attr('data-toggle-attr'));
		var $targetField = $thisField.closest('form').find(toggleConfig.targetSelector);
		// retain original value of each relevant attribute
		// ===> (only do it once even if this event is triggered again)
		for ( var targetScope of ['field', 'element', 'wrapper', 'column'] ) {
			for ( var ruleType of ['when', 'whenNot'] ) {
				if ( typeof toggleConfig[targetScope] !== 'undefined' && typeof toggleConfig[targetScope][ruleType] !== 'undefined' ) {
					for ( var ruleValue in toggleConfig[targetScope][ruleType] ) {
						for ( var attrName in toggleConfig[targetScope][ruleType][ruleValue] ) {
							if ( typeof $targetField.data('orig-'+targetScope+'-'+attrName) === 'undefined' ) {
								if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.data('orig-'+targetScope+'-'+attrName, $targetField.attr(attrName) || false);
								else if ( targetScope == 'wrapper' ) $targetField.data('orig-'+targetScope+'-'+attrName, $targetField.closest('.webform-input').attr(attrName) || false);
								else if ( targetScope == 'column'  ) $targetField.data('orig-'+targetScope+'-'+attrName, $targetField.closest('.webform-col').attr(attrName) || false);
							}
						}
					}
				}
			}
		}
		// go through each action type
		for ( var targetScope of ['field', 'element', 'wrapper', 'column'] ) {
			// go through each rule type
			for ( var ruleType of ['when', 'whenNot'] ) {
				var oppositeRuleType = ( ruleType == 'when' ) ? 'whenNot' : 'when';
				// check if config exists
				if ( typeof toggleConfig[targetScope] !== 'undefined' && typeof toggleConfig[targetScope][ruleType] !== 'undefined' ) {
					// go through each specified value in rules
					for ( var ruleValue in toggleConfig[targetScope][ruleType] ) {
						var isRuleMatched = ( ruleType == 'when' && $thisField.val() == ruleValue ) || ( ruleType == 'whenNot' && $thisField.val() != ruleValue );
						// modify each specified attribute
						for ( var attrName in toggleConfig[targetScope][ruleType][ruleValue] ) {
							var attrNewValue = toggleConfig[targetScope][ruleType][ruleValue][attrName];
							var attrOldValue = $targetField.data('orig-'+targetScope+'-'+attrName);
							// set attribute to null to remove attribute
							if ( attrNewValue === false ) attrNewValue = null;
							if ( attrOldValue === false ) attrOldValue = null;
							// see if attribute has any opposite rule
							var hasOppositeRule = (
								typeof toggleConfig[targetScope][oppositeRuleType] !== 'undefined' &&
								typeof toggleConfig[targetScope][oppositeRuleType][ruleValue] !== 'undefined' &&
								typeof toggleConfig[targetScope][oppositeRuleType][ruleValue][attrName] !== 'undefined'
							);
							// apply new attribute value to target (when rule matched)
							if ( isRuleMatched ) {
								if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.attr(attrName, attrNewValue);
								else if ( targetScope == 'wrapper' ) $targetField.closest('.webform-input').attr(attrName, attrNewValue);
								else if ( targetScope == 'column'  ) $targetField.closest('.webform-col').attr(attrName, attrNewValue);
							// restore to original attribute value (when rule not matched & no opposite rule)
							// ===> when there is opposite rule
							// ===> we simply let the value of opposite rule applied (instead of restore to original value)
							} else if ( !hasOppositeRule ) {
								if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.attr(attrName, attrOldValue);
								else if ( targetScope == 'wrapper' ) $targetField.closest('.webform-input').attr(attrName, attrOldValue);
								else if ( targetScope == 'column'  ) $targetField.closest('.webform-col').attr(attrName, attrOldValue);
							} // if-matched
						} // for-attrName
					} // for-ruleValue
				} // if-defined
			} // for-ruleType
		} // for-targetScope
	});


	// toggleValue : behavior
	$(document).on('change', '.webform-input [data-toggle-value]', function(evt){
		var $thisField = $(this);
		var toggleConfig = JSON.parse($thisField.attr('data-toggle-value'));
		var $targetField = $thisField.closest('form').find(toggleConfig.targetSelector);
		// go through each action type
		for ( var targetScope of ['field', 'element', 'wrapper', 'column'] ) {
			// go through each rule type
			for ( var ruleType of ['when', 'whenNot'] ) {
				// check if config exists
				if ( typeof toggleConfig[targetScope] !== 'undefined' && typeof toggleConfig[targetScope][ruleType] !== 'undefined' ) {
					// go through each specified value in rules
					for ( var ruleValue in toggleConfig[targetScope][ruleType] ) {
						var isRuleMatched = ( ruleType == 'when' && $thisField.val() == ruleValue ) || ( ruleType == 'whenNot' && $thisField.val() != ruleValue );
						var newValue = toggleConfig[targetScope][ruleType][ruleValue];
						// apply new value (when rule matched)
						// ===> (simply do nothing when rule not matched)
						// ===> (because it doesn't make sense to toggle to original value)
						if ( isRuleMatched ) {
							if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.val(newValue);
							else if ( targetScope == 'column'  ) $targetField.closest('.webform-col').attr('value', newValue);
							else if ( targetScope == 'wrapper' ) $targetField.closest('.webform-input').attr('value', newValue);
						} // if-matched
					} // for-ruleValue
				} // if-defined
			} // for-ruleType
		} // for-targetScope
	});


	// toggleClass : behavior
	$(document).on('change', '.webform-input [data-toggle-class]', function(evt){
		var $thisField = $(this);
		var toggleConfig = JSON.parse($thisField.attr('data-toggle-class'));
		var $targetField = $thisField.closest('form').find(toggleConfig.targetSelector);
		// go through each action type
		for ( var targetScope of ['field', 'element', 'wrapper', 'column'] ) {
			// go through each rule type
			for ( var ruleType of ['when', 'whenNot'] ) {
				// check if config exists
				if ( typeof toggleConfig[targetScope] !== 'undefined' && typeof toggleConfig[targetScope][ruleType] !== 'undefined' ) {
					// go through each specified value in rules
					for ( var ruleValue in toggleConfig[targetScope][ruleType] ) {
						var isRuleMatched = ( ruleType == 'when' && $thisField.val() == ruleValue ) || ( ruleType == 'whenNot' && $thisField.val() != ruleValue );
						var $className = toggleConfig[targetScope][ruleType][ruleValue];
						// add class (when rule matched)
						if ( isRuleMatched ) {
							if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.addClass($className);
							else if ( targetScope == 'wrapper' ) $targetField.closest('.webform-input').addClass($className);
							else if ( targetScope == 'column'  ) $targetField.closest('.webform-col').addClass($className);
						// remove class (when rule not matched)
						} else {
							if      ( targetScope == 'field' || targetScope == 'element' ) $targetField.removeClass($className);
							else if ( targetScope == 'wrapper' ) $targetField.closest('.webform-input').removeClass($className);
							else if ( targetScope == 'column'  ) $targetField.closest('.webform-col').removeClass($className);
						} // if-matched
					} // for-ruleValue
				} // if-defined
			} // for-ruleType
		} // for-targetScope
	});


	// datepicker : init
	$(document).on('focus', '.webform-input-date .datepicker:not(.ready)', function(evt){
		var $field = $(this);
		$field.datetimepicker({
			// custom or default date format
			format : ( $field.attr('data-datepicker-format') || 'Y-m-d' ),
			// no time allowed
			timepicker: false,
			// avoid the plugin fixes it into default date when custom format is not full date (e.g. year & month)
			validateOnBlur: !$field.is('[data-datepicker-format]')
		});
		$field.addClass('ready').focus();
	});
	// datepicker : locale
	// ===> dynamically change global locale (because [lang] options does not work)
	$(document).on('focus', '.webform-input-date .datepicker.ready', function(evt){
		var $field = $(this);
		$.datetimepicker.setLocale( $field.attr('data-datepicker-locale') || 'en' );
	});


	// signature pad : init
	$(document).on('mouseover mousedown', '.webform-input-signature:has(.signature-pad):not(.ready)', function(evt){
		var $container = $(this);
		var $btnClear = $container.find('.btn-clear');
		var $hiddenField = $container.find('input[name^=data]');
		var $pad = $container.find('.signature-pad');
		// tranform
		$pad.jSignature({
			'height' : $container.height() - 6,
			'width' : $container.width() - 6,
		// sync to field
		}).bind('change', function(evt){
			var $data = $pad.jSignature('getData', 'svg');
			$hiddenField.val($data[1]).trigger('change');
			$btnClear.show();
		});
		// mark flag
		$container.addClass('ready');
	});


	// signature pad : clear button
	$(document).on('click', '.webform-input-signature.ready .btn-clear', function(evt){
		var $btnClear = $(this);
		var $container = $btnClear.closest('.webform-input-signature');
		var $hiddenField = $container.find('input[name^=data]');
		var $signaturePad = $container.find('.signature-pad');
		var $signatureImage = $container.find('.signature-image');
		$signatureImage.remove();
		$signaturePad.show().jSignature('reset');
		$hiddenField.val('').trigger('change');
		$btnClear.hide();
	});


	// autosave : timer
	$('.webform-autosave').each(function(){
		var $container = $(this);
		window.setInterval(function(){
			// IMPORTANT : only get the last timer
			// ===> there could be two same elements on the screen during ajax-submit
			var $timer = $container.filter(':last').find('.timer input');
			// transform timer (when necessary)
			if ( !$container.is('.ready') ) $timer.knob();
			// countdown...
			var max = parseInt($timer.attr('data-max'));
			var val = parseInt($timer.val());
			if ( val < max ) $timer.val(val+1).trigger('change');
			else $timer.closest('form').submit();
			// mark flag
			$container.addClass('ready');
		}, 1000);
	});


	// ajax uploader : init
	$(document).on('mouseover focus', '.webform-input-file:has(.btn-choose):not(.uploader-ready),.webform-input-image:has(.btn-choose):not(.uploader-ready)', function(evt){
		// elements
		var $container = $(this);
		var $field     = $container.find('[data-toggle=ajax-upload]');
		var $chooseBtn = $( $field.attr('data-choose-button') ).first();
		var $preview   = $( $field.attr('data-preview') ).first();
		// create hidden form
		var ajaxFormID = $container.attr('id')+'-ajax-upload';
		var $ajaxForm = $('<form class="d-none"><input type="file" name="file" /><button type="submit">Upload</button></form>').attr({
			'id'              : ajaxFormID,
			'action'          : $field.attr('data-form-action'),
			'method'          : 'post',
			'enctype'         : 'multipart/form-data',
			'data-toggle'     : 'ajax-submit',
			'data-target'     : $field.attr('data-target'),
			'data-callback'   : "$('#"+ajaxFormID+"').remove();",
			'data-transition' : 'none',
		}).appendTo('body');
		// hidden file field
		// ===> choose file & auto-submit
		var $hiddenFileField = $ajaxForm.find('[type=file]');
		$hiddenFileField.on('change', function(evt){
			evt.preventDefault();
			if ( $(this).val().length ) $ajaxForm.find(':submit').click();
		});
		// choose button
		// ===> open file select dialog
		$chooseBtn.on('click', function(evt){
			evt.preventDefault();
			$hiddenFileField.click();
		}).removeClass('disabled');
		// preview link
		// ===> open link & avoid opening file select dialog
		$preview.on('click', function(evt){
			evt.stopPropagation();
		});
		// mark complete
		$container.addClass('uploader-ready');
	});


});