var util = {
	//-- Constants
	CAMERA: 1,
	GALLERY: 2,

	empty: function (e) {

	},

	uuid: function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = crypto.getRandomValues(new Uint8Array(1))[0]%16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},

	alert: function (message) {
		navigator.notification.alert(
			message,  // message
			util.empty,         // callback
			'Alert',            // title
			'Done'                  // buttonName
		);
	},

	debug: function (message) {
		/*
		navigator.notification.alert(
			JSON.stringify(message),  // message
			util.empty,         // callback
			'Debug',            // title
			'Done'                  // buttonName
		);
		*/
	},

	toUrl: function (filename) {
		if (device.platform === 'iOS') {
			return wrn.documentsUrl + filename + '?cdvToken=' + wrn.cdvToken;
		} else {
			return wrn.documentsUrl + filename;
		}
	},

	fileSystem: function () {
		return new Promise(function (resolve, reject) {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (filesystem) {
				resolve(filesystem);
			}, function (err) {
				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
				reject(err);
			});
		});
	},

	tmpFileSystem: function () {
		return new Promise(function (resolve, reject) {
			window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (filesystem) {
				resolve(filesystem);
			}, function (err) {
				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
				reject(err);
			});
		});
	},

	getTempFile: function (filename) {
		return new Promise(function (resolve, reject) {
			window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function (filesystem) {
				filesystem.root.getFile(filename, { create: false }, function (handle) {
					console.trace('got tmp file: ' + JSON.stringify(handle));
					resolve(filename);
				}, function (err) {
					console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
					reject(err);
				});
			}, function (err) {
				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
				reject(err);
			});
		});
	},

	getFile: function (handle) {
		return new Promise(function (resolve, reject) {
			handle.file(function (file) {
				resolve(file);
			}, function (err) {
    			console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
				reject(err);
			});
		});
	},

	getFileHandleFromURL: function (url) {
		// url = url.replace("%", "%25");
		return new Promise(function (resolve, reject) {
			if (device.platform === 'iOS') {
				url = url.replace('http://localhost:12344/local-filesystem', 'file://');
			}
			window.resolveLocalFileSystemURL(url, function (file) {
				console.trace('resolved file: ' + JSON.stringify(file));
				resolve(file);
			}, function (err) {
				var errorMessage = util.getPrettyFileErrorMsg(err);
				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage + ' parameter:' + url);
				reject(err);
			});
		});
	},

	getFileHandle: function (filename, options) {
		if (options == null) {
			options = { create: false };
		}
		return function (filesystem) {
			return new Promise(function (resolve, reject) {
				filesystem.root.getFile(filename, options, function (handle) {
					resolve(handle);
				}, function (err) {
					var errorMessage = util.getPrettyFileErrorMsg(err);
    				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
					reject(err);
				});
			});
		};
	},

	getDirectoryHandle: function (filename, options) {
		if (options == null) {
			options = { create: false };
		}
		return function (filesystem) {
			return new Promise(function (resolve, reject) {
				filesystem.root.getDirectory(filename, options, function (handle) {
					resolve(handle);
				}, function (err) {
    				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
					reject(err);
				});
			});
		};
	},

	readFile: function (file) {
		return new Promise(function (resolve, reject) {
			var reader = new FileReader();

			reader.onloadend = function (e) {
				console.log('onloadend: ' + JSON.stringify(e));
				resolve(this.result);
			};
			reader.onerror = function (err) {
				console.log('onerror: ' + JSON.stringify(err));
				reject(err);
			};
			reader.loadstart = function (e) {
				console.log('loadstart: ' + JSON.stringify(e));
			};
			reader.progress = function (e) {
				console.log('progress: ' + JSON.stringify(e));
			};
			reader.abort = function (e) {
				console.log('abort: ' + JSON.stringify(e));
			};
			reader.load = function (e) {
				console.log('load: ' + JSON.stringify(e));
			};

			reader.readAsDataURL(file);
		});
	},

	deleteFile: function (file) {
		return new Promise(function (resolve, reject) {
			file.remove(function (e) {
				resolve(e);
			}, function (err) {
    			console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
				reject(err);
			})
		});
	},

	getPrettyFileErrorMsg: function (err) {
		var errorMessage = '';
		if (err.code === FileError.NOT_FOUND_ERR) {
			errorMessage = 'File not found';
		}
		else if (err.code === FileError.SECURITY_ERR) {
			errorMessage = 'Unable to access file due to security';
		}
		else if (err.code === FileError.ABORT_ERR) {
			errorMessage = 'The file operation was aborted';
		}
		else if (err.code === FileError.NOT_READABLE_ERR) {
			errorMessage = 'The file is not readable';
		}
		else if (err.code === FileError.ENCODING_ERR) {
			errorMessage = 'There was an error encoding the file';
		}
		else if (err.code === FileError.NO_MODIFICATION_ALLOWED_ERR) {
			errorMessage = 'The file cannot be modified';
		}
		else if (err.code === FileError.INVALID_STATE_ERR) {
			errorMessage = 'The file is in the wrong state';
		}
		else if (err.code === FileError.SYNTAX_ERR) {
			errorMessage = 'The files has a syntax error';
		}
		else if (err.code === FileError.INVALID_MODIFICATION_ERR) {
			errorMessage = 'The modification is incorrect for this file';
		}
		else if (err.code === FileError.QUOTA_EXCEEDED_ERR) {
			errorMessage = 'The device quota for space has been reached';
		}
		else if (err.code === FileError.TYPE_MISMATCH_ERR) {
			errorMessage = 'This is not a file, maybe its a folder, or link';
		}
		else if (err.code === FileError.PATH_EXISTS_ERR) {
			errorMessage = 'This path already exists';
		}
		else if (err.code === 1000) {
			errorMessage = 'An unknown has occurred';
		}

		return errorMessage;
	},

	moveFile: function (file, newFileName) {
		return function (directory) {
			new Promise(function (resolve, reject) {
				file.moveTo(directory, newFileName,  function (fileEntry) {
					resolve(fileEntry);
				}, function (err) {
					var errorMessage = util.getPrettyFileErrorMsg(err);
    				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
					reject(err);
				});
			});
		};
	},

	share: function (msg) {
		return function (imageData) {
			return new Promise(function (resolve, reject) {
				window.plugins.socialsharing.share(
					/* Message */ msg,
					/* Subject */ null,
					/* Image */ imageData,
					/* URL */ null,
					/* Success */ function (msg) {
						resolve(msg);
					},
					/* Error */ function (err) {
						console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
						reject(err);
					}
				);
			});
		}
	},

	shareApp: function (msg) {
		return function () {
			return new Promise(function (resolve, reject) {
				window.plugins.socialsharing.share(
					/* Message */ msg,
					/* Subject */ null,
					/* Image */ null,
					/* URL */ null,
					/* Success */ function (msg) {
						resolve(msg);
					},
					/* Error */ function (err) {
						reject(err);
					}
				);
			});
		}
	},


	askPhoto: function (e) {
		var _model = this;
		return new Promise(function (resolve, reject) {
			function onConfirm(buttonIndex) {
				if (buttonIndex == 3) {
					reject();
				} else {
					resolve(buttonIndex);
				}
			}

			navigator.notification.confirm(
				'Do you want to use an existing photo or take a picture?',
				onConfirm,
				'Add Image',
				['Camera', 'Gallery', 'Cancel']
			);
		});
	},

	moveImage: function(fileUrl) {
		return new Promise(function (resolve, reject) {
			var newFileName = (new Date()).getTime() + ".jpg";

			var p1 = util.getFileHandleFromURL(fileUrl);

			if (device.platform === 'iOS') {
				var p2 = util.fileSystem();
			} else {
				var p2 = util.fileSystem().then(util.getDirectoryHandle('HelloTaco', {create: true, exclusive: false}));

			}

			Promise.all([p1, p2])
			.then(function (values) {
				var imageFileHandle = values[0];
				var directoryFileHandle = values[1];
    			console.trace('moving ' + fileUrl + ' to ' + JSON.stringify(directoryFileHandle));

    			imageFileHandle.moveTo(directoryFileHandle.root, newFileName,  function (fileEntry) {
	            	console.trace('moved fileEntry: ' + JSON.stringify(fileEntry));
	    			resolve(fileEntry);
				}, function (err) {
					var errorMessage = util.getPrettyFileErrorMsg(err);
					console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
					reject(err);
				});
			}, function (err) {
    			console.trace('err: ' + JSON.stringify(err) + ' msg: ' + err.message);
    			reject(err);
			});
		});
	},

	copyImage: function(fileUrl) {
		console.trace('copyImage: ' + fileUrl);
		return new Promise(function (resolve, reject) {
			var newFileName = (new Date()).getTime() + ".jpg";

			if (fileUrl.indexOf('file://') === -1 && fileUrl.indexOf('content://') === -1) {
				fileUrl = 'file://' + fileUrl;
			}

			var p1 = util.getFileHandleFromURL(fileUrl);
			var p2 = util.fileSystem();

			Promise.all([p1, p2])
			.then(function (values) {
				var imageFileHandle = values[0];
				var directoryFileHandle = values[1];
    			console.trace('copying ' + fileUrl + ' to ' + JSON.stringify(directoryFileHandle));

    			imageFileHandle.copyTo(directoryFileHandle.root, newFileName,  function (fileEntry) {
	            	console.trace('copying fileEntry: ' + JSON.stringify(fileEntry));
	    			resolve(fileEntry);
				}, function (err) {
					var errorMessage = util.getPrettyFileErrorMsg(err);
					console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
					reject(err);
				});
			}, function (err) {
				var errorMessage = util.getPrettyFileErrorMsg(err);
				console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
    			reject(err);
			});
		});
	},

    fromCamera: function() {
        return new Promise(function (resolve, reject) {
            function onSuccess(imageData) {
                resolve(imageData);
            }

            function onFail(message) {
                reject(message);
            }

            navigator.camera.getPicture(onSuccess, onFail, {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
				correctOrientation: true
            });
        });
    },

    fromGallery: function() {
        return new Promise(function (resolve, reject) {
            function onSuccess(imageData) {
        		resolve(imageData);
            }

            function onFail(message) {
                reject(message);
            }

            navigator.camera.getPicture(onSuccess, onFail, {
                destinationType: Camera.DestinationType.FILE_URI,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                targetWidth: 1000,
                targetHeight: 1000,
				correctOrientation: true
            });
        });
    },

	correctOrientation: function (options, newFileName) {
		return new Promise(function (resolve, reject) {
			window.ImageResizer.correctOrientation(options, function(image) {
				console.trace(image);
				var promises = [];
				if (device.platform === 'iOS') {
					promises.push(util.tmpFileSystem().then(util.getFileHandle(image.split('/').pop())));
				} else {
					promises.push(util.getFileHandleFromURL(image));
				}
				promises.push(util.fileSystem());

				try {
					Promise.all(promises).then(function (values) {
						var imageFileEntry = values[0];
						var documentsDirectoryEntry = values[1];
						console.log('moving image', documentsDirectoryEntry.root, newFileName.split('/').pop());
						imageFileEntry.moveTo(documentsDirectoryEntry.root, newFileName.split('/').pop(),  function (fileEntry) {
							console.trace('moved fileEntry: ' + JSON.stringify(fileEntry));
							resolve(fileEntry);
						}, function (err) {
							console.trace(err);
							reject(err);
						});
					}, function (err) {
						console.trace(err);
						reject(err);
					});
				} catch (err) {
					console.trace(err);
					reject(err);
				}
			}, function(err) {
				console.trace(err);
				reject(err);
			});
		});
	},

	resizeImage: function (options, newFileName) {
		return new Promise(function (resolve, reject) {
			window.ImageResizer.resize(options, function(image) {
				var promises = [];
				if (device.platform === 'iOS') {
					promises.push(util.tmpFileSystem().then(util.getFileHandle(image.split('/').pop())));
				} else {
					promises.push(util.getFileHandleFromURL(image));
				}
				promises.push(util.fileSystem());

				try {
					Promise.all(promises).then(function (values) {
						var imageFileEntry = values[0];
						var documentsDirectoryEntry = values[1];
						imageFileEntry.moveTo(documentsDirectoryEntry.root, newFileName,  function (fileEntry) {
							console.trace('moved fileEntry: ' + JSON.stringify(fileEntry));
							resolve(fileEntry);
						}, function (err) {
							console.trace(err);
							reject(err);
						});
					}, function (err) {
						console.trace(err);
						reject(err);
					});
				} catch (err) {
					console.trace(err);
					reject(err);
				}
			}, function(err) {
				console.trace(err);
				reject(err);
			});
		});
	}
};