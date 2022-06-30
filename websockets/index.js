import { WebSocketServer } from 'ws';

//WebsocketVariablen
let connections = [];

function wsServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });
  wss.on('connection', (ws) => {
    console.log('Neuer User hat sich verbunden');

    //Verbundenen User anpassen und in Array speichern
    let email = ws._protocol;
    email = email.replace('|', '@');
    connections.push({ ws, email });

    //Alle Aktiven User an alle User senden
    connections.forEach((elem) => {
      elem.ws.send(JSON.stringify({ type: 'newConnection', data: email }));
    });

    //Wenn der WebsocketServer Nachrichten bekommt
    ws.on('message', (data) => {
      const { daten: positionData, type, from, to } = JSON.parse(data);
      const abc = JSON.parse(data);
      //------ALARM------
      if (type == 'alarm') {
        console.log('ALARM----------------------------------------------------------------');
        connections.forEach((elem) =>
          elem.ws.send(JSON.stringify({ type: 'alarm', data: positionData })),
        );
      } else if (type == 'stopAlarmAsMitarbeiter') {
        //An WebSocketUser senden dass Alarm beendet wird, SW kümmert sich weiteres drum
        connections.forEach((elem) =>
          elem.ws.send(JSON.stringify({ type: 'stopAlarmAsClient', data: positionData })),
        ); //PositonData ist in dem Fall die Email, bei wessen Client der Alarm aufhören soll
      }

      //-------POSITION-TRACKING-------
      else if (type == 'sendPosition') {
        connections.forEach((elem) =>
          elem.ws.send(JSON.stringify({ type: 'getPosition', data: positionData })),
        );
      }
      //-----MESSAGE------
      else if (type == 'MessageUser') {
        console.log(type);
        console.log(positionData);

        connections.forEach((elem) =>
          elem.ws.send(JSON.stringify({ type: 'MessageUser', data: positionData, from: from })),
        );
      } else if (type == 'MessageMitarbeiter') {
        connections.forEach((elem) => {
          console.log('to: ' + to);
          console.log('EMAIL', elem.email);
          console.log(elem);
          if (elem.email == to) {
            elem.ws.send(JSON.stringify({ type: 'MessageMitarbeiter', data: positionData }));
          }
        });
      }
    });

    //Wenn sich der User vom Websocket trennt
    ws.on('close', () => {
      console.log(`User: ${connections.find((elem) => elem.ws == ws).email} left`);

      // den anderen Verbindeungen sagen das ein User gegangen ist
      connections.forEach((elem) =>
        elem.ws.send(
          JSON.stringify({
            type: 'userLeft',
            data: connections.find((elem) => elem.ws == ws).email,
          }),
        ),
      );

      // User aus dem Array löschen
      connections = connections.filter((elem) => elem.ws != ws);
    });
  });
}

//Testausgabe, damit man immer die Anzahl der aktiven User bekommt
// setInterval(() => {
//   console.log('Länge: ' + connections.length);
// }, 3000);

export default wsServer;
