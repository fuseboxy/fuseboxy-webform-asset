$(function(){


	// init signature-pad
	$('.webform-input-signature .signature-pad').each(function(){
		$parent = $(this).parent();
		$(this).jSignature({
			'height' : $parent.height() - 6,
			'width' : $parent.width() - 6,
		});
	});




	// init ajax uploader
	$(document).on('mouseover focus', '.webform-input-file .btn-upload:not(.simple-ajax-uploader-ready)', function(evt){
		var $btn = $(this);
		var $container = $btn.closest('.form-control-file');
		// create preview link (when necessary)
		var $previewLink = $container.find('.preview-link');
		if ( !$previewLink.length ) $previewLink = $('<a class="preview-link ml-2 small" target="_blank"></a>').hide().appendTo($container);
		// create error box (when necessary)
		var $err = $container.find('.form-text.text-danger');
		if ( !$err.length ) $err = $('<small class="form-text text-danger"></small>').hide().appendTo($container);
		// create progress bar (when neccessary)
		var $progress = $container.find('.progress');
		if ( !$progress.length ) $progress = $('<div class="progress mt-4 mb-n4 mx-n4 rounded-0" style="height: 2px;"><div class="progress-bar"></div></div>').hide().appendTo($container);
		// init ajax uploader
		var uploader = new ss.SimpleUpload({
			//----- essential config -----
			button: $btn,
			name: $btn.attr('id'),
			url: $btn.attr('data-upload-handler'),
			//----- optional config -----
			progressUrl: $btn.attr('data-upload-progress'),
			multiple: false,
			maxUploads: 1,
			debug: true,
			// number of KB (false for default)
			// ===> javascript use KB for validation
			// ===> server-side use byte for validation
			maxSize: parseInt($btn.attr('data-filesize'))/1024,
			// allowed file types (false for default)
			// ===> server will perform validation again
			allowedExtensions: $btn.attr('data-filetype').split(','),
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
				var msg = $btn.attr('data-filetype-error').replace('{FILE_TYPE}', $btn.attr('data-filetype').toUpperCase());
				$err.show().html(msg);
			},
			// validate file size
			onSizeError: function(filename, fileSize) {
				var msg = $btn.attr('data-filesize-error').replace('{FILE_SIZE}', parseInt($btn.attr('data-filesize'))/(1024*1024)+'MB');
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
					$btn.html( $btn.attr('data-button-alt-text') );
					$container.find('input').val(response.fileUrl);
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
		// mark completed
		$btn.addClass('simple-ajax-uploader-ready');
	}); // onMouseover-btnWebformUpload


});