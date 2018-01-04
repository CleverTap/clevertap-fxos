// Loads angular js
var angular = require('angular')
var angularRoute = require('angular-route')
var clevertap = require('clevertap-fxos');

// Create the main module with the name "StartStop"
var mod = angular.module('StartStop', ['ngRoute'])
var mainTemplate = require('./main.html')

function padTwo(num) {
  /*
  *  Pad numbers two 2 chars with 0 to make numbers like
  *  01,02,03...09,10...59
  */
  num = num + ""
  if (num.length == 1) {
    return "0" + num
  } else {
    return num
  }
}

mod.filter('time', function () {
  /*
  *  Convert time delta to hours:minutes:seconds
  */
  var perMillis = 1000
    , perSecond = 60
    , perHour = 60 * 60

  return function (input) {
    var out = parseInt(input / perMillis)
    var seconds = padTwo(out % 60)
    var minutes = padTwo(parseInt(out / perSecond) % 60)
    var hours = padTwo(parseInt(out / perHour))
    return hours + ":" + minutes + ":" + seconds
  }
})

/*
*  Main controller of the application
*/
mod.controller('MainController',
['$scope', '$interval',
function ($scope, $interval) {

  $scope.start = function () {
    /*
    *  Set the time to the current time
    */
    $scope.startTime = new Date()
    $scope.stopTime = new Date()

    clevertap.event.push("timerStarted", {t:$scope.startTime});

    // Start an interval that will update the end time
    $scope.interval = $interval(function () {
      $scope.stopTime = new Date()
    }, 10)
  }

  $scope.stop = function () {
    /*
    *  Cancel the interval to stop any update
    */
    $interval.cancel($scope.interval)
    clevertap.event.push("timerStopped", {t:$scope.stopTime, duration:parseInt(($scope.stopTime-$scope.startTime)/1000, 10)});
  }

}])

// Configure the routes
mod.config(['$routeProvider',
function ($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: 'main/main.html',
      controller: 'MainController'
    }).
    otherwise({
      templateUrl: 'main/main.html',
      controller: 'MainController'
    })
}])

// Setup the template in the template cache
mod.run(['$templateCache', function ($templateCache) {
  $templateCache.put('main/main.html', mainTemplate)
  clevertap.setLogLevel(clevertap.logLevels.DEBUG);
  clevertap.setAppVersion("1.0.0");
  clevertap.init("WWW-WWW-WWRZ");
  console.log('Running')
}])

// Export the module
module.exports = mod
