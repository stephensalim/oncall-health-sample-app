/*global BlueCarHealth _config*/

var BlueCarHealth = window.BlueCarHealth || {};
BlueCarHealth.map = BlueCarHealth.map || {};

(function rideScopeWrapper($) {
    var authToken;
    BlueCarHealth.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
    function requestCarunit(pickupLocation) {
        $.ajax({
            method: 'POST',
            url: _config.api.invokeUrl + '/ride',
            headers: {
                Authorization: authToken
            },
            data: JSON.stringify({
                PickupLocation: {
                    Latitude: pickupLocation.latitude,
                    Longitude: pickupLocation.longitude
                }
            }),
            contentType: 'application/json',
            success: completeRequest,
            error: function ajaxError(jqXHR, textStatus, errorThrown) {
                console.error('Error requesting ride: ', textStatus, ', Details: ', errorThrown);
                console.error('Response: ', jqXHR.responseText);
                alert('An error occured when requesting your carunit:\n' + jqXHR.responseText);
            }
        });
    }

    function completeRequest(result) {
        var carunit;
        console.log('Response received from API: ', result);
        carunit = result.Carunit;
        carunit.Year 
        displayUpdate(carunit.Name + ', your ' + carunit.Color + ' carunit, Year ' + carunit.Year  + 'is on it\'s way.');
        animateArrival(function animateCallback() {
            displayUpdate(carunit.Name + ' has arrived.');
            BlueCarHealth.map.unsetLocation();
            $('#request').prop('disabled', 'disabled');
            $('#request').text('Set Pickup');
        });
    }

    // Register click handler for #request button
    $(function onDocReady() {
        $('#request').click(handleRequestClick);
        $('#signOut').click(function() {
            BlueCarHealth.signOut();
            alert("You have been signed out.");
            window.location = "signin.html";
        });
        $(BlueCarHealth.map).on('pickupChange', handlePickupChanged);

        BlueCarHealth.authToken.then(function updateAuthMessage(token) {
            if (token) {
                displayUpdate('You are authenticated. Click to see your <a href="#authTokenModal" data-toggle="modal">auth token</a>.');
                $('.authToken').text(token);
            }
        });

        if (!_config.api.invokeUrl) {
            $('#noApiMessage').show();
        }
    });

    function handlePickupChanged() {
        var requestButton = $('#request');
        requestButton.text('Request Carunit');
        requestButton.prop('disabled', false);
    }

    function handleRequestClick(event) {
        var pickupLocation = BlueCarHealth.map.selectedPoint;
        event.preventDefault();
        requestCarunit(pickupLocation);
    }

    function animateArrival(callback) {
        var dest = BlueCarHealth.map.selectedPoint;
        var origin = {};

        if (dest.latitude > BlueCarHealth.map.center.latitude) {
            origin.latitude = BlueCarHealth.map.extent.minLat;
        } else {
            origin.latitude = BlueCarHealth.map.extent.maxLat;
        }

        if (dest.longitude > BlueCarHealth.map.center.longitude) {
            origin.longitude = BlueCarHealth.map.extent.minLng;
        } else {
            origin.longitude = BlueCarHealth.map.extent.maxLng;
        }

        BlueCarHealth.map.animate(origin, dest, callback);
    }

    function displayUpdate(text) {
        $('#updates').append($('<li>' + text + '</li>'));
    }
}(jQuery));
