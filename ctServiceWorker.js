// cloud script for persisting data to be used in clicked and viewed events (same is used for a.js)
import localforage from 'localforage'

if(typeof globalRedirectPath === "undefined"){
    // set up some variables we need gobally
    var globalNotificationData;
    //global redirect path for backward compatibility
    var globalRedirectPath; // when showing thr url; we need to log to LC before opening up the deep link
}


self.addEventListener('push', function(event) {

    var notificationData = JSON.parse(event.data.text());
    var title = notificationData.title;
    var notificationOptions = notificationData.notificationOptions;
    var data = notificationOptions.data;
    var key;
    if(typeof data !== 'undefined'){
        key = data.wzrk_id;
    }
    if(typeof key === 'undefined'){
        key = title;
    }
    console.log('Service worker Push event data: ', notificationData);

    localforage.setItem(key, event.data.text()).then(function(value){
        console.log("persisted data in localForage for key= "+ key +"data: "+ value);
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log("Error in persisting",err);
    });

    // two global variables for backward compatibility
    globalRedirectPath = notificationData.redirectPath;
    globalNotificationData = notificationData;

    var raiseNotificationViewedPath = notificationData.raiseNotificationViewedPath;
    if(typeof raiseNotificationViewedPath !== "undefined"){
        //raise notification viewed event
        fetch(raiseNotificationViewedPath, {'mode': 'no-cors'}); //ignore the response
    }
    event.waitUntil(self.registration.showNotification(title, notificationOptions));
});



self.addEventListener('install', function(event) {
    console.log('Service-Worker install Triggered: ', event);
});

self.addEventListener('activate', function(event) {
    console.log('Service-Worker activated: ', event);
});

function onClick(event, redirectPath, notificationData) {
    var finalDeepLink = redirectPath;
    console.log("Raising Clicked event, Notification Data:",notificationData);
    //   finalDeepLink += '&b=' + encodeURIComponent('button0');   // TODO is it really needed ?
    fireSilentRequest(finalDeepLink);
    event.notification.close();
}

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var data = notification.data;
    var key;
    if(typeof data !== 'undefined' && data !== null){
        key = data.wzrk_id;
    }
    if(typeof key === 'undefined'){
        key = notification.title;
    }
    var promise = localforage.getItem(key).then(function(value) {
        var notificationData = JSON.parse(value);
        var redirectPath = notificationData.redirectPath;
        console.log("event",event);
        console.log("redirect path for click : " + redirectPath);
        console.log("notification data: " + notificationData);
        onClick(event, redirectPath, notificationData);
    }).catch(function(err) {
        // This code runs if there were any errors
        // onClick below for backward compatibility
        onClick(event, globalRedirectPath, globalNotificationData);
        console.log(err);
    });
    event.waitUntil(promise);
});

var fireSilentRequest = function(url) {
    // add the silent parameter to the deeplink so that LC knows not to raise an error
    url += '&s=true';
    // use the fetch API to make a silent request (we don't care about the response here)
    fetch(url, {'mode': 'no-cors'});
};