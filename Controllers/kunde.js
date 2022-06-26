import {
  checkIfUserExists,
  registerUserDB,
  loginUser,
  changePasswordDB,
  sendPositionDB,
  patchUserDB,
  deleteUserDB,
} from '../Models/models.js';
import validator from 'is-my-json-valid';
// import { SendAuthCodePerMail, SendNewPasswordPerMail } from '../Mail/mail.js';
import postmark from 'postmark';
import dotenv from 'dotenv';

import fs from 'fs';
import path from 'path';

dotenv.config();

const dirname = path.resolve();
const emailClient = new postmark.ServerClient(process.env.postmarkToken);

const validateUser = validator({
  required: true,
  type: 'object',
  properties: {
    vorname: {
      required: true,
      type: 'string',
    },
    nachname: {
      required: true,
      type: 'string',
    },
    email: {
      required: true,
      type: 'string',
    },
    passwort: {
      required: true,
      type: 'string',
    },
    strasse: {
      required: true,
      type: 'string',
    },
    plz: {
      required: true,
      type: 'string',
    },
    ort: {
      required: true,
      type: 'string',
    },
    hobbysinteressen: {
      require: true,
      type: 'string',
    },
    geburtsdatum: {
      require: true,
      type: 'string',
    },
  },
});

//Generiert einen Code (Passwort vergessen + Auth-Code)
let makeAuthCode = (length) => {
  let code = '';
  let auswahl = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  //Auth-Code generieren wenn Kunde noch nicht vorhanden
  for (let index = 0; index < length; index++) {
    let rand = Math.round(Math.random() * (auswahl.length - 0));
    code += auswahl[rand];
  }
  return code;
};

//Authcode senden für Mitarbeiter & Registrierung
const sendCodeUser = async (req, res) => {
  console.log('Route wurde aufgerufen');
  const { email, vorname, nachname } = req.body;

  //Schauen ob der User schon in der DB vorhanden ist
  const vorhanden = await checkIfUserExists(email);
  console.log('Vorhanden: ', vorhanden);

  // Wenn der User schon vorhanden ist 400 zurückschicken
  if (vorhanden) return res.status(400).send('Der User ist bereits vorhanden');
  console.log('Vorhanden', vorhanden);

  // Code generieren
  const code = makeAuthCode(6);
  console.log(code);

  //Code an den User schicken
  //TODO postmark einbinden
  // emailClient.sendEmailWithTemplate({
  //   From: 'semler.l04@htlwienwest.at',
  //   To: email,
  //   TemplateAlias: 'faktor',
  //   TemplateModel: {
  //     vorname: vorname,
  //     nachname: nachname,
  //     product_name: 'Coming Home Safe',
  //     code: code,
  //     company_name: 'Coming Home Safe',
  //     company_address: 'Thaliastraße 125',
  //   },
  // });

  res.status(200).send(code);
};

//Thumbnail setzen und speichern
const sendThumbnail = async (req, res) => {
  try {
    const { titel, datentyp } = req.body;
    console.log(titel, datentyp);
    const uniqueImageName = path.join(dirname, `public/images/${titel}.${datentyp}`);
    //schauen ob das Bild schon existiert, wenn ja löschen und neu erstellen
    if (fs.existsSync(`${dirname}/public/images/${titel}.${datentyp}`)) {
      fs.unlinkSync(`${dirname}/public/images/${titel}.${datentyp}`);
    }

    fs.writeFileSync(`${uniqueImageName}`, req.files.image.data);

    res.status(200).send('Success');
  } catch (error) {
    console.log(error);
    res.status(404).send('Something went wrong');
  }
};

const sendDataRegister = async (req, res) => {
  console.log(req.body);
  const result = await registerUserDB(req.body);

  if (result) return res.status(200).send('Erfolgreich registriert');

  return res.status(500).send('Fehler beim Registrieren');
};

//Wenn sich User anmelden will
const login = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  const result = await loginUser(email, password);
  console.log('result: ', result);

  //Schauen ob der User ein Admin ist, wenn ja Mail schicken, sonst normal anmelden
  if (result) {
    if (result.isadmin) {
      const code = makeAuthCode(6);
      // SendAuthCodePerMail(code, email, `${result.vorname} ${result.nachname}`, code, res, result);
      //TODO postmark einbinden
      // emailClient.sendEmailWithTemplate({
      //   From: 'semler.l04@htlwienwest.at',
      //   To: email,
      //   TemplateAlias: 'faktor-mitarbeiter',
      //   TemplateModel: {
      //     vorname: result.vorname,
      //     nachname: result.nachname,
      //     product_name: 'Coming Home Safe',
      //     code: code,
      //     company_name: 'Coming Home Safe',
      //     company_address: 'Thaliastraße 125',
      //   },
      // });
      return res.status(200).send(JSON.stringify({ foundUser: result, code: code }));
    } else if (!result.isAdmin)
      return res.status(200).send(JSON.stringify({ foundUser: result, code: 'kein Admin' }));
  }

  return res.status(500).send('Fehler beim Login');
};

//Position in DB speichern
const sendPosition = async (req, res) => {
  const position = req.body;

  const result = await sendPositionDB(position);

  if (result) return res.status(200).send('Position successfully sent');

  res.status(500).send('Error when sending position');
};

//Wenn User sein Passwort vergessen hat
const sendNewPassword = async (req, res) => {
  //Daten holen
  const { email } = req.body;

  //Neues Passwort generieren
  const newPw = makeAuthCode(11);

  //Neues Passwort in DB schreiben
  const result = await changePasswordDB(email, newPw);

  if (result) {
    //Email an User senden + Serverfeedback zurückgeben
    //TODO postmark einbinden
    // emailClient.sendEmailWithTemplate({
    //   From: 'semler.l04@htlwienwest.at',
    //   To: email,
    //   TemplateAlias: 'passwort-reset',
    //   TemplateModel: {
    //     product_name: 'Coming-Home-Safe',
    //     company_name: 'Coming-Home-Safe',
    //     company_address: 'Thaliastraße 125',
    //     password: newPw,
    //   },
    // });

    res.status(200).send(newPw);
  } else {
    //ServerFeedback und Email an den User schicken
    res.status(210).send('Fehler beim Erstellen des neuen Passwortes');
  }
};

const patchUser = async (req, res) => {
  const { id } = req.params;

  const result = await patchUserDB(id, req.body);
  console.log(result);

  if (result) return res.status(200).json(result);

  return res.status(500).send('Fehler beim Ändern des User');
};

const deleteAccount = async (req, res) => {
  const { id } = req.params;

  await deleteUserDB(id);

  return res.status(200).send('Account erfolgreich gelöscht');
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const result = await changePasswordDB(id, password);

  if (result) return res.status(200).json(result);

  return res.status(500).send('Fehler');
};

export {
  sendCodeUser,
  sendThumbnail,
  sendDataRegister,
  login,
  sendPosition,
  sendNewPassword,
  patchUser,
  deleteAccount,
  changePassword,
};
