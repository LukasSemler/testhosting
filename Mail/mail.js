// curl "https://api.postmarkapp.com/email/withTemplate" \
//   -X POST \
//   -H "Accept: application/json" \
//   -H "Content-Type: application/json" \
//   -H "X-Postmark-Server-Token: de6aef9d-4ce7-41bb-bd5d-c96688e0627d" \
//   -d '{
//   "From":"semler.l04@htlwienwest.at",
//    "To":"semler.l04@htlwienwest.at",
//    "TemplateAlias":"password-reset",
//    "TemplateModel":{
//       "product_url":"https://coming-home-safe.herokuapp.com",
//       "product_name":"Coming-Home-Safe",
//       "name":"Lukas Semler",
//       "operating_system":"operating_system_Value",
//       "browser_name":"browser_name_Value",
//       "support_url":"https://www.htlwienwest.at/",
//       "action_url":"https://www.htlwienwest.at/",
//       "company_name":"Coming-Home-Safe",
//       "company_address":"Thaliastraße 125",
//       "password":"TestTest123"
//    }
// }'

// import nodemailer from 'nodemailer';
// import { google } from 'googleapis';
// import hbs from 'nodemailer-express-handlebars';
// import path from 'path';
// import dotenv from 'dotenv';

// dotenv.config();

// const dirname = path.resolve();
// const OAuth2 = google.auth.OAuth2;

// //GoogleService für Email
// const oauth2Client = new OAuth2(
//   process.env.CLIENTID,
//   process.env.CLIENTSECRET,
//   'https://developers.google.com/oauthplayground',
// );

// oauth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN,
// });

// const accessToken = oauth2Client.getAccessToken();

// const smtpTransport = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     type: 'OAuth2',
//     user: 'benjamin.stauf11@gmail.com',
//     clientId: process.env.CLIENTID,
//     clientSecret: process.env.CLIENTSECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//     accessToken: accessToken,
//   },
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// export async function SendAuthCodePerMail(genCode, empfängerMail, vorname, nachname, res, user) {
//   //Nodemailer smtpTransport erstellen

//   //Configure Handlebar ------> PFAD MACHT PROBLEME!!!!!
//   const handlebarOptions = {
//     viewEngine: {
//       extName: '.handlebars',
//       partialsDir: path.resolve(dirname, 'controllers', 'templateViews'),
//       defaultLayout: false,
//     },
//     viewPath: path.resolve('./controllers/templateViews/'),
//     extName: '.handlebars',
//   };

//   //smtpTransport soll Handlebars verwenden
//   smtpTransport.use('compile', hbs(handlebarOptions));

//   // Mail options
//   let mailoptions = {
//     from: 'comingHomeSafe.HTLWW@gmail.com',
//     to: empfängerMail,
//     // to: "benjamin.stauf11@gmail.com",
//     subject: 'Verifizierung',
//     //Einbindung von Handlebars
//     template: 'authentification',
//     context: {
//       Name: `${vorname} ${nachname}`,
//       Code: genCode,
//     },
//   };

//   //Email senden
//   // smtpTransport.sendMail(mailoptions, (error, response) => {
//   //   error ? console.log(error) : console.log(response);
//   //   smtpTransport.close();
//   // });

//   smtpTransport.sendMail(mailoptions, (error, response) => {
//     if (error) {
//       console.log('Error beim Mail senden: ', error);
//       smtpTransport.close();
//       res.status(500).send('Error beim Mail senden');
//     } else {
//       if (user) {
//         console.log('Success beim Mail senden Admin Login');
//         res.status(200).send(JSON.stringify({ foundUser: user, genCode }));
//         smtpTransport.close();
//       } else {
//         console.log('Success beim Mail senden Register');
//         smtpTransport.close();
//         res.status(200).send(genCode);
//       }
//     }
//   });
// }

// export async function SendNewPasswordPerMail(genCode, empfängerMail, res) {
//   //Nodemailer smtpTransport erstellen

//   //Configure Handlebar ------> PFAD MACHT PROBLEME!!!!!
//   const handlebarOptions = {
//     viewEngine: {
//       extName: '.handlebars',
//       partialsDir: path.resolve(dirname, 'controllers', 'templateViews'),
//       defaultLayout: false,
//     },
//     viewPath: path.resolve('./controllers/templateViews/'),
//     extName: '.handlebars',
//   };

//   //smtpTransport soll Handlebars verwenden
//   smtpTransport.use('compile', hbs(handlebarOptions));

//   // Mail options
//   let mailoptions = {
//     from: 'comingHomeSafe.HTLWW@gmail.com',
//     to: empfängerMail,
//     // to: "benjamin.stauf11@gmail.com",
//     subject: 'Passwort vergessen',
//     //Einbindung von Handlebars
//     template: 'newPassword',
//     context: {
//       Passwort: genCode,
//     },
//   };

//   //Email senden
//   // smtpTransport.sendMail(mailoptions, (error, response) => {
//   //   error ? console.log(error) : console.log(response);
//   //   smtpTransport.close();
//   // });

//   smtpTransport.sendMail(mailoptions, (error, response) => {
//     if (error) {
//       console.log('Error beim Mail senden: ', error);
//       smtpTransport.close();
//       res.status(500).send('Error beim Mail senden');
//     } else {
//       console.log('Success beim Mail senden des neuen Passwortes');
//       smtpTransport.close();
//       res.status(200).send(genCode);
//     }
//   });
// }
