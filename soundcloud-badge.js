// Forked because the original relied on require('fs'), which works ok in Bundler
// but requires shenanigans in Webpack. It's easier just to inline the files as
// backtick strings.
//
// We still keep soundcloud-badge as a package.json requirement so we
// don't have to add its dependencies (lazy).

var resolve = require('soundcloud-resolve')
var fonts = require('google-fonts')
var minstache = require('minstache')
var insert = require('insert-css')

var icons = {
    black: 'https://developers.soundcloud.com/assets/logo_black.png'
  , white: 'https://developers.soundcloud.com/assets/logo_white.png'
}

const template = minstache.compile(`
<div class="npm-scb-wrap">
  <div class="npm-scb-inner">
    <a target="_blank" href="{{!urls.song}}">
      <img class="npm-scb-icon" src="{{!icon}}">
      <img class="npm-scb-artwork" src="{{!artwork}}">
    </a>
    <div class="npm-scb-info">
      <a target="_blank" href="{{!urls.song}}">
        <p class="npm-scb-title">{{!title}}</p>
      </a>
      <a target="_blank" href="{{!urls.artist}}">
        <p class="npm-scb-artist">{{!artist}}</p>
      </a>
    </div>
  </div>
  <div class="npm-scb-now-playing">
    Now Playing:
    <a href="{{!urls.song}}">{{!title}}</a>
    by
    <a href="{{!urls.artist}}">{{!artist}}</a>
  </div>
</div>
`)

const css = `
.npm-scb-wrap {
  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-weight: 200;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
}

.npm-scb-wrap a {
  text-decoration: none;
  color: #000;
}
.npm-scb-white
.npm-scb-wrap a {
  color: #fff;
}

.npm-scb-inner {
  position: absolute;
  top: -120px; left: 0;
  padding: 8px;
  width: 100%;
  height: 150px;
  z-index: 2;
  -webkit-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;
     -moz-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;
      -ms-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;
       -o-transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;
          transition: width 0.5s cubic-bezier(1, 0, 0, 1), top 0.5s;
}
.npm-scb-wrap:hover
.npm-scb-inner {
  top: 0;
}

.npm-scb-artwork {
  position: absolute;
  top: 16px; left: 16px;
  width: 104px; height: 104px;
  box-shadow: 0 0 8px -3px #000;
  outline: 1px solid rgba(0,0,0,0.1);
  z-index: 2;
}
.npm-scb-white
.npm-scb-artwork {
  outline: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 10px -2px rgba(255,255,255,0.9);
}

.npm-scb-info {
  position: absolute;
  top: 16px;
  left: 120px;
  width: 300px;
  z-index: 1;
}

.npm-scb-info > a {
  display: block;
}

.npm-scb-now-playing {
  font-size: 12px;
  line-height: 12px;
  position: absolute;
  width: 500px;
  z-index: 1;
  padding: 15px 0;
  top: 0; left: 138px;
  opacity: 1;
  -webkit-transition: opacity 0.25s;
     -moz-transition: opacity 0.25s;
      -ms-transition: opacity 0.25s;
       -o-transition: opacity 0.25s;
          transition: opacity 0.25s;
}

.npm-scb-wrap:hover
.npm-scb-now-playing {
  opacity: 0;
}

.npm-scb-white
.npm-scb-now-playing {
  color: #fff;
}
.npm-scb-now-playing > a {
  font-weight: bold;
}

.npm-scb-info > a > p {
  margin: 0;
  padding-bottom: 0.25em;
  line-height: 1.35em;
  margin-left: 1em;
  font-size: 1em;
}

.npm-scb-title {
  font-weight: bold;
}

.npm-scb-icon {
  position: absolute;
  top: 120px;
  padding-top: 0.75em;
  left: 16px;
}
`

module.exports = badge
function noop(err){ if (err) throw err }

var inserted = false
var gwfadded = false

function badge(options, callback) {
  if (!inserted) insert(css), inserted = true

  if (!gwfadded && options.getFonts) {
    fonts.add({ 'Open Sans': [300, 600] })
    gwfadded = true
  }

  options = options || {}
  callback = callback || noop

  var div   = options.el || document.createElement('div')
  var icon  = !('dark' in options) || options.dark ? 'black' : 'white'
  var id    = options.client_id
  var song  = options.song

  resolve(id, song, function(err, json) {
    if (err) return callback(err)
    if (json.kind !== 'track') throw new Error(
      'soundcloud-badge only supports individual tracks at the moment'
    )

    div.classList[
      icon === 'black' ? 'remove' : 'add'
    ]('npm-scb-white')

    div.innerHTML = template({
        artwork: json.artwork_url || json.user.avatar_url
      , artist: json.user.username
      , title: json.title
      , icon: icons[icon]
      , urls: {
          song: json.permalink_url
        , artist: json.user.permalink_url
      }
    })

    document.body.appendChild(div)

    callback(null, json.stream_url + '?client_id=' + id, json, div)
  })

  return div
}
