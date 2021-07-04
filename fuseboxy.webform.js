$(function(){


	// init signature pad
	$(document).on('mouseover mousedown', '.webform-input-signature:has(.signature-pad):not(.ready)', function(evt){
		var $container = $(this);
		var $pad = $container.find('.signature-pad');
		$pad.jSignature({
			'height' : $container.height() - 6,
			'width' : $container.width() - 6,
		});
		// mark flag
		$container.addClass('ready');
	});


	// reset upload field
	$(document).on('click', '.webform-input-file .btn-remove', function(evt){
		var $btnRemove = $(this);
		var $container = $btnRemove.closest('.webform-input-file');
		var $btnUpload = $container.find('.btn-upload');
		var $hiddenField = $container.find('input');
		var $previewLink = $container.find('.preview-link');
		$btnRemove.hide();
		$btnUpload.html( $btnUpload.attr('data-button-alt-text') );
		$hiddenField.val('');
		$previewLink.attr('href', '').html('').hide();
	});
	// init ajax uploader
	$(document).on('mouseover focus', '.webform-input-file:has(.btn-upload):not(.ready)', function(evt){
		var $container = $(this);
		var $containerInner = $container.find('label.form-control-file');
		var $btnUpload = $container.find('.btn-upload');
		var $btnRemove = $container.find('.btn-remove');
		var $hiddenField = $container.find('input');
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
				// ===> update hidden field
				// ===> display preview link
				// ===> display preview image (when necessary)
				if ( response.success ) {
					$btnUpload.html( $btnUpload.attr('data-button-alt-text') );
					$btnRemove.show();
					$hiddenField.val(response.fileUrl);
					$previewLink.show().attr('href', response.fileUrl);
					$previewLink.html( response.isWebImage ? '<img src="'+response.fileUrl+'" class="img-thumbnail mt-2" alt="" />' : response.filename );
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


});