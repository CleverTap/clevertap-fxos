importScripts('https://d2r1yp2w7bby2u.cloudfront.net/js/localforage.min.js');


if(typeof globalRedirectPath === "undefined"){
    // set up some variables we need gobally
    var globalNotificationData;
    //global redirect path for backward compatibility
    var globalRedirectPath; // when showing thr url; we need to log to LC before opening up the deep link
}


self.addEventListener('push', function(event) {
    //self.postMessage()
   // self.registration.active.postMessage("Hi service worker");
    // get all the notification data
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
    console.log('Service worker 1 Push event data: ', notificationData);
    localforage.setItem(key, event.data.text()).then(function(value){
         console.log("persisted",value);
    }).catch(function(err) {
        // This code runs if there were any errors
        console.log("Error in persisting:",err);
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
    console.dir('install', event);
    console.log("install mai aaya");

    // self.skipWaiting()
    //self.registration.showNotification('install', {
    //body: 'This is install',
    //});
});

self.addEventListener('activate', function(event) {
    //self.skipWaiting()
    console.log("activate mai aaya");

    console.dir('activate', event);
    //self.registration.showNotification('activate', {
    //  body: 'This is activate',
    //});
});

function onClick(event, redirectPath, notificationData){
    var finalDeepLink = redirectPath;
    var silentRequest = true; // are opening up a new window or sending a quiet get request from here?
    // if (event.action === 'action1') {
    //     // button 1 was clicked
    //     if (typeof notificationData['notificationOptions']['actions'][0]['deepLink'] !== 'undefined') {
    //         finalDeepLink += '&r=' +  encodeURIComponent(notificationData['notificationOptions']['actions'][0]['deepLink']);
    //         silentRequest = false;
    //     }
    //     finalDeepLink += '&b=' + encodeURIComponent('button1');
    // } else if (event.action === 'action2') {
    //     // the second button was clicked
    //     if (typeof notificationData['notificationOptions']['actions'][1]['deepLink'] !== 'undefined') {
    //         finalDeepLink += '&r=' + encodeURIComponent(notificationData['notificationOptions']['actions'][1]['deepLink']);
    //         silentRequest = false;
    //     }
    //     finalDeepLink += '&b=' + encodeURIComponent('button2');
    // } else {
        // general click
        if (typeof notificationData.deepLink !== 'undefined') {
            finalDeepLink += '&r=' + encodeURIComponent(notificationData.deepLink);
            silentRequest = false;
        }

        finalDeepLink += '&b=' + encodeURIComponent('button0');
    //}

    if (silentRequest) {
        fireSilentRequest(finalDeepLink);
    }
    // else {
    //     clients.openWindow(finalDeepLink);
    // }
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
        // console.log("event",event);
        // console.log("redirect path: " + redirectPath);
        // console.log("notification data: " + notificationData);
        onClick(event, redirectPath, notificationData);
    }).catch(function(err) {
        // This code runs if there were any errors
        //onClick below for backward compatibility
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

// TODO not needed for now can remove it..
// function getKaiosTokenUpdateUrl(endpoint, auth, p256dh, accountId, guid) {
//     // convert the subscription keys to strings; this sets it up nicely for pushing to LC
//     var subscription = {};
//     subscription['endpoint'] = endpoint;
//     subscription['browser'] = "Kaios";
//     subscription['keys'] = {} ;
//     subscription['keys']['auth'] = auth;
//     subscription['keys']['p256dh'] = p256dh;
//     subscription['browser'] = "Kaios";
//     var subscriptionData = JSON.parse(JSON.stringify(subscription));
//     // var sessionObj = wiz.getSessionCookieObject();
//     // var shouldSendToken = typeof sessionObj['p'] === STRING_CONSTANTS.UNDEFINED || sessionObj['p'] === 1
//     //     || sessionObj['p'] === 2 || sessionObj['p'] === 3 || sessionObj['p'] === 4 || sessionObj['p'] === 5;
//     var payload = subscriptionData;
//     payload = addSystemDataToObject(payload, true, accountId , guid);
//     payload = JSON.stringify(payload);
//     var domainURL = 'https://' + 'bd2e647fbb39.ngrok.io';
//     var pageLoadUrl = domainURL + '/a2?t=77';
//     pageLoadUrl = addToURL(pageLoadUrl, "type", "data");
//     pageLoadUrl = addToURL(pageLoadUrl, "d", compressData(payload));
//     console.log("pageloadurl=", pageLoadUrl);
// }