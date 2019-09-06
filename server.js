'use strict';

var express = require("express");
var app = express();
var path = require("path")
var bodyParser = require("body-parser");
var querystring = require('querystring');
var http = require('http');
var request = require('request');
var favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, "assets/favicon.png")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Holds onto the authentication key for making requests through Spotify API
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var token = {};



// Home page
app.get('/',function(req,res){
  getCredentials(req);
  res.sendFile(path.join(__dirname, '/index.html'));
});



// Request for data when user submit an artist/album/track keyword
app.post('/submit', function(req, res) { 
  getTracks(req.body.input, req.body.option).then(
    function(tracks) {
      var trackIds = [];
      var trackInfo = [];
      var items = tracks.tracks.items;  

      for (var t in items) {
        // Congregate all track ids for audio analysis
        trackIds.push(items[t].id); 
      
        // Congregate track data, but leave color as hsl(0,0,0) by default
        var artists = [];
        for (var a in items[t].artists ) {
          artists.push(items[t].artists[a].name);
        }
        trackInfo.push({'id': items[t].id,
                        'image': items[t].album.images.slice(-1)[0].url,
                        'sound': items[t].preview_url,
                        'url': items[t].external_urls.spotify,
                        'name': items[t].name,
                        'popularity': items[t].popularity,
                        'album': items[t].album.name,
                        'artists': artists,
                        'color': { 'h': 0, 's': 0, 'l': 0 }});
      }
      
      // Do another request for track audio features
      getFeatures(trackIds.join(',')).then(
        function(features) {
          // Isolate audio features only 
          var trackAudioFeatures = features.audio_features;
          
          for (var i = 0; i < trackAudioFeatures.length; i += 1) {
            var colors = {'red': 0, 'orange': 25, 'yellow': 52,
              'green': 110, 'blue': 240, 'violet': 285 };
            var trackColor = trackInfo[i].color;
            var trackFeat = trackAudioFeatures[i];
            
            // Saturation is based on valence and mode
            // Lightness is based on energy and mode
            if (trackFeat.mode) { // Major modality  
              trackColor.s = 100 - (trackFeat.valence * 50.0);
              trackColor.l = 50 + (trackFeat.energy * 50.0);
              
              // Hue is based on key of song
              switch (trackFeat.key) {
                case 0: trackColor.s = 0; break; // C
                case 1: trackColor.h = colors['violet']; break; // C#
                case 2: trackColor.h = colors['violet']; break; // D
                case 3: trackColor.h = colors['green']; break; // D#
                case 4: trackColor.h = colors['green']; break; // E
                case 5: trackColor.h = colors['yellow']; break; // F
                case 6: trackColor.h = colors['yellow']; break; // F#
                case 7: trackColor.h = colors['orange']; break; // G
                case 8: trackColor.h = colors['red']; break; // G#
                case 9: trackColor.h = colors['red']; break; // A
                case 10: trackColor.h = colors['blue']; break; // A#
                case 11: trackColor.h = colors['blue']; break; // B
                default:
                  trackColor.h = 110; break; // Default green color
              }

            } else { // Minor modality
              trackColor.s = 50 - (trackFeat.valence * 50.0);
              trackColor.l = (trackFeat.energy * 50.0);
              
              // Hue is based on key of song
              switch (trackFeat.key) {
                case 0: trackColor.h = colors['red']; break; // Am
                case 1: trackColor.h = colors['blue']; break; // Bbm 
                case 2: trackColor.h = colors['blue']; break; // Bm 
                case 3: trackColor.s = 0; break; // Cm
                case 4: trackColor.s = 0; break; // Dbm
                case 5: trackColor.h = colors['violet']; break; // Dm
                case 6: trackColor.h = colors['violet']; break; // Ebm
                case 7: trackColor.h = colors['green']; break; // Em
                case 8: trackColor.h = colors['yellow']; break; // Fm
                case 9: trackColor.h = colors['yellow']; break; // Gbm
                case 10: trackColor.h = colors['orange']; break; // Gm
                case 11: trackColor.h = colors['orange']; break; // G#m
                default:
                  trackColor.h = 110; break; // Default green color
              }
            }
          

          }

        res.send(trackInfo); 
      }, function(err) { // For Audio Feature request
        console.log(err);
      }); 
    }, function(err) { // For track/artist search request
      console.log(err);
    });
});



// TODO: Create front end 404.html page to send
// 404 page
app.get('*', function(req, res) {
  res.status(404);
  console.log("ah");
  res.type('text/html');
  res.write('<!DOCTYPE html>');
    res.write('<html>');
      res.write('<body>');
        res.write("404: Page not found!");
      res.write('</body>');
    res.write('</html>');
  res.end();
});



// Start server
if (process.env.PORT)
  console.log(`Server is now listening, go to http:\/\/localhost:${process.env.PORT}`);
else
  console.log('Server is now listening, go to http://localhost:8080');
app.listen(process.env.PORT || 8080);





var getCredentials = function (req) {    
  // Get authentification for using Spotify API
   var authOptions = {
     method: 'POST',
     url: 'https://accounts.spotify.com/api/token',
     headers: { 'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')) },
     form: { grant_type: 'client_credentials' },
     json: true
   };

  request(authOptions, function (error, response, body) {
    if (error) {
      throw new Error(error);
    }
    
    token = body;
    console.log('The access token expires in ' + body['expires_in']);
    console.log('The access token is ' + body['access_token']);
  });
}



var getTracks = function(searchKey, searchOption) { 
  // Options for request 
  var options = {
    url: 'https://api.spotify.com/v1/search?q=' + searchOption + ':' + searchKey + '&type=track&limit=10',
    headers: {
      'Authorization': 'Bearer ' + token.access_token
    },
    json: true
  };
  
  // Do the request!
  var promise = new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body){
      resolve (body);
    })
  });  

  promise.then(function(data) {
    return data; 
  }, function(err) {
    console.log(err); 
    return [];
  });

  return promise;
   
}



var getFeatures = function(trackNames) {
  // Options for request 
  var options = {
    url: 'https://api.spotify.com/v1/audio-features/?ids=' + trackNames + '&type=track',
    headers: {
      'Authorization': 'Bearer ' + token.access_token
    },
    json: true
  };
  
  // Do the request!
  var promise = new Promise(function(resolve, reject) {
    request.get(options, function(error, response, body){
      resolve (body);
    })
  });  

  promise.then(function(data) {
    return data; 
  }, function(err) {
    console.log(err); 
    return [];
  });

  return promise;
   
}
