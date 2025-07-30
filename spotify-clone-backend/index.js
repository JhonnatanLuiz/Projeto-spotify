const express = require('express');
const cors = require('cors');
const axios = require('axios');
const querystring = require('querystring');

const app = express();
app.use(cors());

const port = 3001;

const CLIENT_ID = 'ec8f1fadc6924058a977b84e6d2bf776';
const CLIENT_SECRET = 'f417409093fc4ae4b7805573eb9f8230';
const REDIRECT_URI = `http://localhost:${port}/callback`;

app.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played user-top-read streaming';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
    }));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });

    const { access_token, refresh_token } = response.data;
    res.redirect(`http://localhost:3000?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    res.redirect('/#error=invalid_token');
  }
});

app.get('/refresh_token', async (req, res) => {
  const { refresh_token } = req.query;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`
      }
    });

    res.send(response.data);
  } catch (error) {
    res.send(error);
  }
});

app.get('/api/*', async (req, res) => {
  const { authorization } = req.headers;
  const url = `https://api.spotify.com/v1${req.path.replace('/api', '')}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': authorization
      }
    });
    res.send(response.data);
  } catch (error) {
    res.send(error);
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
