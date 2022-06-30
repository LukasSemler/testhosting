// import * as PusherPushNotifications from '@pusher/push-notifications-web';
// importScripts('@pusher/push-notifications-web');
// const beamsClient = new PusherPushNotifications.Client({
//   instanceId: '0f727861-6f36-4cc6-810e-ab9e4a5acf75',
// });
// beamsClient
//   .start()
//   .then(() => beamsClient.addDeviceInterest('hello'))
//   .then(() => console.log('Successfully registered and subscribed!'))
//   .catch(console.error);

// Notification.requestPermission().then((result) => {
//   console.log('Notification permission status:', result);
// });

// const options = {
//   body: 'Simple Chrome Desktop Notification',
//   dir: 'ltr',
//   // image: 'image.jpg',
// };
// const notification = new Notification('Notification', options);
// notification.onclick = function () {
//   window.open('https://www.google.com');
// };

//Variablen
var swUserMail = null;
var latestTrackingPackage = null;
var trackingTimer = null;
var chsWebSocket = null;
var chsWebSocketConnectionURL = null;

//Message-Funktion
self.addEventListener('message', (event) => {
  //An den Client eine message senden!
  let { type, userId, payload } = JSON.parse(event.data);

  //Message-Switch
  switch (type) {
    //Wenn sich User mit dem Websocket verbinden will
    case 'userConnect':
      //Test-Message
      event.source.postMessage('Hallo User mit der ID ' + userId);

      //Payload beinhaltet diesmal zwei Daten
      let { email, ws_devMode } = payload;

      console.log('DEVMODE: ' + ws_devMode);

      //ServiceWorker-Usermail setzen
      swUserMail = email;

      //Je nach Mode den Websocket-URL bestimmen
      if (ws_devMode) chsWebSocketConnectionURL = ' ws://localhost:2410';
      else chsWebSocketConnectionURL = 'wss://coming-home-safe.herokuapp.com';

      //Verbindung mit WS herstellen
      chsWebSocket = new WebSocket(chsWebSocketConnectionURL, email.replace('@', '|'));

      break;

    //Wenn das Tracking gestartet wird
    case 'startTracking':
      event.source.postMessage('User mit der ID ' + userId + ' startet Tracking');
      break;

    case 'tracking':
      event.source.postMessage('User mit der ID ' + userId + ' wird getracked');

      //Letztes Postions-Objekt abspeichern
      latestTrackingPackage = payload;

      //TODO Tracking-Timer erstellen, um user zu informieren wenn er schon länger im sleepmode ist

      //WebSocket Positionspaket schicken
      chsWebSocket.send(JSON.stringify({ type: 'sendPosition', daten: payload }));

      break;

    //Wenn das Tracking beendet wird
    case 'endTracking':
      event.source.postMessage('User mit der ID ' + userId + ' beendet Tracking');

      //Timer beenden
      clearInterval(trackingTimer);

      break;

    //Wenn der User den Alarm-Button drückt
    case 'setAlarm':
      event.source.postMessage('User mit der ID ' + userId + ' meldet Alarm!');

      //WebSocket Alarmpaket schicken
      chsWebSocket.send(JSON.stringify({ type: 'alarm', daten: payload }));

      //Es wird drauf gewartet bis über WS die nachricht kommt, dass Alarm aufhören kann
      let stopAlarmListener = chsWebSocket.addEventListener('message', (wsEvent) => {
        //Mitgeschickte Daten
        const { type, data } = JSON.parse(wsEvent.data);

        //Client schicken dass er Alarm stoppen soll
        if (type == 'stopAlarmAsClient' && data == swUserMail) {
          //Useralarm-Stoppen an alle User schicken, der mit der identen Mail schaltet dann ab.
          event.source.postMessage(
            JSON.stringify({ type: 'alarmStopped', data: 'Useralarm abschalten' }),
          );

          //StopAlarm-Listener wieder entfernen für den Client
          chsWebSocket.removeEventListener(stopAlarmListener);
        }
      });

      break;

    //Wenn sich der User vom Websocket trennen will
    case 'userDisconnect':
      //Wenn sich der User mit dem Websocket trennen will
      event.source.postMessage('Auf Wiedersehen User mit der ID ' + userId);

      //swUserMail entfernen
      swUserMail = null;

      //Verbindung mit WS trennen
      chsWebSocket.close();

      break;
  }
});
