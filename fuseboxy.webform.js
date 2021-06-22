$(function(){


	// init ajax uploader
	$(document).on('mouseover focus', '.btn-webform-upload:not(.simple-ajax-uploader-ready)', function(evt){
		var $btn = $(this);
		var $container = $btn.closest('.form-control-file');
		// create error box (when necessary)
		var $err = $container.find('.form-text.text-danger');
		if ( !$err.length ) $err = $('<small class="form-text text-danger"></small>').hide().appendTo($container);
		// create progress bar (when neccessary)
		var $progress = $container.find('.progress');
		if ( !$progress.length ) $progress = $('<div class="progress mt-4 mb-n4 mx-n4" style="border-radius: 0; height: 2px;"><div class="progress-bar"></div></div>').hide().appendTo($container);
		// create preview link (when necessary)
		var $preview = $container.find('.preview');
		if ( !$preview.length ) $preview = $('<small class="preview ml-2"></small>').appendTo($container);
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
			maxSize: $btn.is('[data-filesize]') ? (parseInt($btn.attr('data-filesize'))/1024) : false,
			// allowed file types (false for default)
			// ===> server will perform validation again
			allowedExtensions: $btn.is('[data-filetype]') ? $btn.attr('data-filetype').split(',') : false,
			// control what file to show when choosing files
			hoverClass: 'btn-hover',
			focusClass: 'active',
			responseType: 'json',
			// show progress bar
			onSubmit: function(filename, extension, uploadBtn, fileSize) {
				$err.html('').hide();
				$progress.show();
				this.setProgressBar( $progress.find('.progress-bar') );
				this.setProgressContainer( $progress );
				// additional parameters pass to upload-hanlder
				uploader._opts.data['originalName'] = encodeURI(filename);
				uploader._opts.data['fieldName'] = $btn.attr('data-field');
			},
			// validate allowed extension
			onExtError: function(filename, extension) {
				var msg = $btn.attr('data-filetype-error').replace('{FILE_TYPE}', $btn.attr('data-filetype').toUpperCase());
				$err.show().html(msg);
			},
			// validate file size
			onSizeError: function(filename, fileSize) {
				var msg = $btn.attr('data-filesize-error').replace('{FILE_SIZE}', $btn.attr('data-filesize'));
				$err.show().html(msg);
			},
			// show link of uploaded file
			onComplete: function(filename, response, uploadBtn, fileSize) {
				// when success
				// ===> display preview link
				// ===> update hidden field
				// ===> change button text
				if ( response.success ) {
					$preview.html('<a href="'+response.fileUrl+'" target="_blank">'+response.filename+'</a>');
					$container.find('input').val(response.fileUrl);
					$btn.html( $btn.attr('data-button-alt-text') );
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