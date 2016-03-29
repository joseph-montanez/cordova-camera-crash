(function () {
    "use strict";

    document.addEventListener( 'deviceready', onDeviceReady.bind( this ), false );
    
    function onDeviceReady() {
        // Handle the Cordova pause and resume events
        document.addEventListener( 'pause', onPause.bind( this ), false );
        document.addEventListener( 'resume', onResume.bind( this ), false );
        document.getElementById('get-photo').addEventListener( 'click', getPhoto.bind( this ), false );

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        var element = document.getElementById("deviceready");
        element.innerHTML = 'Device Ready';
        element.className += ' ready';
    };

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };

    function getPhoto() {
        var filename = '';
        var thumbnail = '';
        //-- Request photo
        var promise = util
        .askPhoto()
        .then(function (decision) {
            return decision == util.CAMERA ? util.fromCamera() : util.fromGallery();
        });

        //-- Copy or Move image from selected image
        if (device.platform === 'iOS') {
            promise = promise.then(util.moveImage);
        } else {
            promise = promise.then(util.copyImage);
        }

        promise.then(function (fileEntry) {
            document.getElementById('photo').setAttribute('src', fileEntry.toURL());
        }, function (err) {
            var errorMessage = util.getPrettyFileErrorMsg(err);
            console.trace('err: ' + JSON.stringify(err) + ' msg: ' + errorMessage);
        });
    }
} )();