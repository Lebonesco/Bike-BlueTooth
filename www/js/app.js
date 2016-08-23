// Ionic Starter App

// discover BT device, setup RPI beacon, subscribe to RPI, simulate accelometer
angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform, $cordovaDevice) {
  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})


.controller('TestCtrl', ['$ionicPlatform', '$cordovaToast', '$scope', '$cordovaDeviceMotion', '$cordovaBluetoothSerial',
  function($ionicPlatform, $cordovaToast, $scope, $cordovaDeviceMotion, $cordovaBluetoothSerial) {
    $scope.bluetooth = 'no'

    $scope.options = { 
        frequency: 100, // Measure every 100ms
        deviation : 25  // We'll use deviation to determine the shake event, best values in the range between 25 and 30
    };
 
    // Current measurements
    $scope.measurements = {
        x : 1,
        y : 1,
        z : 4,
        timestamp : null
    }
 
    // Previous measurements    
    $scope.previousMeasurements = {
        x : null,
        y : null,
        z : null,
        timestamp : null
    }   
 
    // Watcher object
    $scope.watch = null;
    $ionicPlatform.ready(function() {

      // $cordovaBluetoothSerial.isEnabled()
      //   .then(function() {
      //     $scope.bluetooth = "Bluetooth LE is enabled";
      //   }, function() {
      //     $scope.bluetooth = "Bluetooth LE is NOT enabled";
      //   });

      $cordovaToast
        .show('Welcome to Bike BlueTooth!', 'long', 'center')
        .then(function(succcess) {
        }, function(error) {
          //error
        });
        
    });

    $scope.startWatching = function() {
        // Device motion configuration
        $scope.measurements.x = "calculating...";
        $scope.measurements.y = "calculating...";
        $scope.measurements.z = "calculating...";
        $scope.watch = $cordovaDeviceMotion.watchAcceleration($scope.options);
        // Initialization
        $scope.watch.then(null, function(error) {
          console.log('Error');
        }, function(result) {
          //set data
          $scope.measuremenets.x = result.x;
          $scope.measurements.y = result.y;
          $scope.measurenments.z = result.z;
          $scope.measurements.timestamp = result.timestamp;

          //Detect shake
          $scope.detectShake(result);
        });
      };

      //stop watching method
      $scope.stopWatching = function() {
        $scope.measurements.x = "stop calculating";
        $scope.measurements.y = "stop calculating";
        $scope.measurements.z = "stop calculating";
        $scope.watch.clearWatch();
      }

      $scope.detectShake = function(result) {
        var measurementsChange = {};

        if ($scope.previousMeasurements.x !== null) {
          measurementsChange.x = Math.abs($scope.previousMeasurements.x, result.x);
          measurementsChange.y = Math.abs($scope.previousMeasurements.y, result.y);
          measurementsChange.z = Math.abs($scope.previousMeasurements.z, result.z);
        }

        if (measurementsChange.x + measurementsChange.y + measurementsChange.z > $scope.options.deviation) {
          $scope.stopWatching();
          console.log('Shake detected');
          setTimeout($scope.startWatching(), 1000);

          $scope.previousMeasurements = {
            x: null,
            y: null,
            z: null
          }
        } else {
          $scope.previousMeasurements = {
            x: result.x,
            y: result.y,
            z: result.z
          }
        }
      }

      $scope.$on('$ionicView.beforeLeave', function() {
      $scope.watch.clearWatch(); // turn off motion detection watcher
    })
}]) // end of TestCtrl controller
