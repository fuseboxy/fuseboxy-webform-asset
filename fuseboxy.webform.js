$(function(){


	// number : realtime filter (only allow numeric & period)
	$(document).on('keyup', '.webform-input-number input', function(evt){
		var regex = new RegExp('[^0-9.]', 'g');
		var $field = $(this);
		var filtered = $field.val().replace(regex, '');
		if ( $field.val() != filtered ) $field.val(filtered);
	});


	// email : realtime filter (only allow alpha-numeric & certain symbols)
	$(document).on('keyup', '.webform-input-email input', function(evt){
		var regex = new RegExp('[^a-zA-Z0-9@._\-]', 'g');
		var $field = $(this);
		var filtered = $field.val().replace(regex, '').toLowerCase();
		if ( $field.val() != filtered ) $field.val(filtered);
	});


	// date : realtime filter (only allow numeric & dash)
	$(document).on('keyup', '.webform-input-date input', function(evt){
		var regex = new RegExp('[^0-9\-]', 'g');
		var $field = $(this);
		var filtered;
		// unify delimiter
		filtered = $field.val().replace('/', '-');
		if ( $field.val() != filtered ) $field.val(filtered);
		// auto-append delimiter
		var arr = $field.val().split('-');
		if ( arr.length == 1 && arr[0].length == 4 ) $field.val( $field.val()+'-' );
		if ( arr.length == 2 && arr[1].length == 2 ) $field.val( $field.val()+'-' );
		// remove duplicated delimiter
		filtered = $field.val().replace(/[\-]+/g, '-');
		if ( $field.val() != filtered ) $field.val(filtered);
		// remove illegal character
		filtered = $field.val().replace(regex, '').substring(0, 10);
		if ( $field.val() != filtered ) $field.val(filtered);
	});


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
		$field.datetimepicker({ format: 'Y-m-d', timepicker: false });
		$field.addClass('ready').focus();
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


	// ajax uploader : init
	$(document).on('mouseover focus', '.webform-input-file:has(.btn-upload):not(.ready),.webform-input-image:has(.btn-upload):not(.ready)', function(evt){
		var $container = $(this);
		var $containerInner = $container.find('label.form-control-file');
		var $btnUpload = $container.find('.btn-upload');
		var $btnRemove = $container.find('.btn-remove');
		var $hiddenField = $container.find('input[name^=data]');
		// create preview link (when necessary)
		var $previewLink = $container.find('.preview-link');
		if ( !$previewLink.length ) $previewLink = $('<a class="preview-link small" target="_blank"></a>').hide().appendTo($containerInner);
		// create error box (when necessary)
		var $err = $container.find('.form-text.text-danger');
		if ( !$err.length ) $err = $('<small class="form-text text-danger"></small>').hide().appendTo($containerInner);
		// create progress bar (when neccessary)
		var $progress = $container.find('.progress');
		if ( !$progress.length ) $progress = $('<div class="progress mt-4 mb-n4 mx-n4 rounded-0" style="height: 2px;"><div class="progress-bar"></div></div>').hide().appendTo($containerInner);
		// init ajax uploader
		var uploader = new ss.SimpleUpload({
			//----- essential config -----
			button: $btnUpload,
			name: $btnUpload.attr('id'),
			url: $btnUpload.attr('data-upload-handler'),
			//----- optional config -----
			progressUrl: $btnUpload.attr('data-upload-progress'),
			multiple: false,
			maxUploads: 1,
			debug: true,
			// number of KB (false for default)
			// ===> javascript use KB for validation
			// ===> server-side use byte for validation
			maxSize: parseInt($btnUpload.attr('data-filesize'))/1024,
			// allowed file types (false for default)
			// ===> server will perform validation again
			allowedExtensions: $btnUpload.attr('data-filetype').split(','),
			// control what file to show when choosing files
			hoverClass: 'btn-hover',
			focusClass: 'active',
			responseType: 'json',
			// show progress bar
			onSubmit: function(filename, extension, uploadBtn, fileSize) {
				$progress.show();
				this.setProgressContainer( $progress );
				this.setProgressBar( $progress.find('.progress-bar') );
				// toggle other elements
				$err.hide().html('');
				$previewLink.hide().html('');
				// additional parameter pass to upload-hanlder
				uploader._opts.data['originalName'] = encodeURI(filename);
			},
			// validate allowed extension
			onExtError: function(filename, extension) {
				var msg = $btnUpload.attr('data-filetype-error').replace('{FILE_TYPE}', $btnUpload.attr('data-filetype').toUpperCase());
				$err.show().html(msg);
			},
			// validate file size
			onSizeError: function(filename, fileSize) {
				var msg = $btnUpload.attr('data-filesize-error').replace('{FILE_SIZE}', parseInt($btnUpload.attr('data-filesize'))/(1024*1024)+'MB');
				$err.show().html(msg);
			},
			// show link of uploaded file
			onComplete: function(filename, response, uploadBtn, fileSize) {
				// when success
				// ===> change button text
				// ===> update hidden field (and trigger [onchange] event)
				// ===> display preview link
				// ===> display preview image (when necessary)
				if ( response.success ) {
					$btnUpload.html( $btnUpload.attr('data-button-alt-text') );
					$btnRemove.show();
					$hiddenField.val(response.fileUrl).trigger('change');
					$previewLink.show().attr('href', response.fileUrl);
					$previewLink.html( response.isWebImage ? '<img src="'+response.fileUrl+'" class="img-thumbnail d-block mt-2" alt="" />' : response.filename );
				// when failure
				// ===> show error message
				} else $err.show().html( response.msg ? response.msg : response );
			},
			// server error
			onError: function(filename, errorType, status, statusText, response, uploadBtn, fileSize) {
				alert('Error occurred while uploading file.\nPlease see console log for server response.');
			}
		}); // new-SimpleUpload
		// mark flag
		$container.addClass('ready');
	});


	// ajax upload : remove button
	$(document).on('click', '.webform-input-file.ready .btn-remove,.webform-input-image.ready .btn-remove', function(evt){
		var $btnRemove = $(this);
		var $container = $btnRemove.closest('.webform-input-file,.webform-input-image');
		var $btnUpload = $container.find('.btn-upload');
		var $hiddenField = $container.find('input');
		var $previewLink = $container.find('.preview-link');
		$btnRemove.hide();
		$btnUpload.html( $btnUpload.attr('data-button-text') );
		$hiddenField.val('').trigger('change');
		$previewLink.attr('href', '').html('').hide();
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


});