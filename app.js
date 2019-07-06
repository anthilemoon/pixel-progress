const express = require('express');
const request = require('request');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get("/", function(req, res){

    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), pullData);
  });

  function pullData(auth) {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.batchGet({
      spreadsheetId: '1E1UruTlU6RhqtPkZq3McgbdnWJMATCBTfdHRk4J_f8E',
      ranges: ['2019!A2:A366', '2019!B2:B366', '2019!C2:C366', '2019!D2:D366']
    }, (err, response) => {
      if (err) return console.log('The API returned an error: ' + err);
      const date = response.data.valueRanges[0].values;
      const topic = response.data.valueRanges[1].values;
      const time = response.data.valueRanges[2].values;
      const level = response.data.valueRanges[3].values;

      const data = [date, topic, time, level];
  
    //   if (data.length) {
    //     console.log('Data:');
    //     // Print columns A to C, which correspond to indices 0 to 2.
    //     data.map((row) => {
    //       console.log(`${row[0]}, ${row[1]}, ${row[2]}`);
    //     });
    //   } else {
    //     console.log('No data found.');
    //   }

      res.render('home', {data: data});
 
    });
  }

  });

  // If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

app.listen(process.env.PORT || 3000, function() {
    console.log('Server running on port 3000.');
  });