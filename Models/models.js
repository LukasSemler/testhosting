import { query, pool } from '../DB/index.js';

const checkIfUserExists = async (id) => {
  const { rows } = await query('SELECT * FROM kunde WHERE email = $1', [id]);

  if (rows[0]) return true;
  return false;
};

const registerUserDB = async (user) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `insert into kunde (vorname, nachname, email, passwort, strasse, ort, plz, hobbysinteressen, geburtsdatum, isadmin,
                   suser, link_thumbnail)
values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning *;`,
      [
        user.vorname,
        user.nachname,
        user.email,
        user.password,
        user.strasse_hnr,
        user.stadt,
        user.plz,
        'Noch einbauen',
        '2004-12-01',
        false,
        false,
        user.link_thumbnail,
      ],
    );

    await client.query(
      'INSERT INTO coordinates (lat, lng, uhrzeit, fk_kunde) values ($1, $2, $3, $4)',
      [null, null, null, rows[0].k_id],
    );

    await client.query('COMMIT');

    return rows;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Fehler beim Registrieren');
    throw error;
  } finally {
    client.release();
  }
};

const loginUser = async (email, password) => {
  console.log('email: ' + email);
  console.log('password: ' + password);
  const { rows } = await query('SELECT * FROM kunde WHERE email = $1', [email]);

  console.log('rows: ' + rows);

  if (rows[0].passwort == password) return rows[0];

  return false;
};

const changePasswordDB = async (id, password) => {
  const client = await pool.connect();

  //Passwort changen
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM kunde WHERE email = $1', [id]);

    if (!rows[0]) false;

    const { rows: change } = await client.query(
      'UPDATE kunde SET passwort = $1 where email= $2 returning *; ',
      [password, id],
    );

    await client.query('COMMIT');
    return change[0];
  } catch (error) {
    await client.query('ROLLBACK');
    console.log(error);
    throw error;
  } finally {
    client.release();
  }
};

async function sendPositionDB(position) {
  const { rows } = await query(
    'UPDATE coordinates SET lat = $1, lng = $2, uhrzeit = $3, fk_kunde = $4 returning *;',
    [position.lat, position.lng, position.dateTime, position.user.k_id],
  );

  console.log('rows Send position', rows[0]);

  return rows;
}
async function patchUserDB(id, user) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM kunde WHERE k_id = $1 and email = $2', [
      id,
      user.email,
    ]);

    if (!rows[0]) return false;

    const { rows: changeData } = await client.query(
      'UPDATE kunde SET vorname = $1, nachname = $2, email = $3, strasse = $4, ort = $5, plz = $6 where k_id = $7 returning *; ',
      [user.vorname, user.nachname, user.email, user.strasse_hnr, user.stadt, user.plz, id],
    );

    await client.query('COMMIT');

    if (changeData[0]) return changeData[0];
    return false;
  } catch (error) {
    await client.query('ROLLBACK');
    console.log('Error beim Account ändern');
    throw error;
  } finally {
    client.release();
  }
}

const deleteUserDB = async (id) => {
  await query('DELETE FROM kunde where k_id = $1', [id]);
};

export {
  checkIfUserExists,
  registerUserDB,
  loginUser,
  changePasswordDB,
  sendPositionDB,
  patchUserDB,
  deleteUserDB,
};
