#!/usr/bin/env node
/* Wave Bite - Water Patrol · tools/leonardo-motion.js
 * Bild -> echtes Video (Leonardo SVD Motion). Upload init-image -> motion -> poll -> mp4.
 * Etappenfaehig via tools/.motion-state.json. Mehrfach aufrufen bis ALLE CLIPS FERTIG.
 *   export LEONARDO_API_KEY=...; node tools/leonardo-motion.js
 */
'use strict';
var fs = require('fs'), path = require('path');
var API = 'https://cloud.leonardo.ai/api/rest/v1';
var KEY = process.env.LEONARDO_API_KEY;
var BUDGET = parseInt(process.env.GEN_BUDGET_MS || '40000', 10);
var PROJECT = path.resolve(__dirname, '..');
var MANIFEST = path.join(PROJECT, 'src', 'data', 'asset-manifest.json');
var STATE = path.join(__dirname, '.motion-state.json');
var t0 = Date.now();
function left() { return BUDGET - (Date.now() - t0); }
function log(m) { process.stdout.write(m + '\n'); }
function rj(f, d) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return d; } }
function wj(f, o) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 2)); }
function api(p, opts) { opts = opts || {}; opts.headers = { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + KEY };
  return fetch(API + p, opts).then(function (r) { return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} if (!r.ok) throw new Error('HTTP ' + r.status + ' ' + p + ' -> ' + t.slice(0, 160)); return j; }); }); }

function uploadInit(shot) {
  return api('/init-image', { method: 'POST', body: JSON.stringify({ extension: 'png' }) }).then(function (r) {
    var u = r.uploadInitImage, fields = JSON.parse(u.fields);
    var fd = new FormData();
    Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
    var buf = fs.readFileSync(path.join(PROJECT, shot.src));
    fd.append('file', new Blob([buf], { type: 'image/png' }), 'image.png');
    return fetch(u.url, { method: 'POST', body: fd }).then(function (res) {
      if (!(res.status === 204 || res.status === 201 || res.ok)) throw new Error('S3 upload HTTP ' + res.status);
      return u.id;
    });
  });
}
function motion(imageId, strength) {
  return api('/generations-motion-svd', { method: 'POST', body: JSON.stringify({ imageId: imageId, isInitImage: true, motionStrength: strength || 4, isPublic: false }) })
    .then(function (r) { var id = r && r.motionSvdGenerationJob && r.motionSvdGenerationJob.generationId; if (!id) throw new Error('keine motion generationId: ' + JSON.stringify(r).slice(0, 160)); return id; });
}
function dl(url, dest) { return fetch(url).then(function (r) { if (!r.ok) throw new Error('dl HTTP ' + r.status); return r.arrayBuffer(); }).then(function (ab) { fs.writeFileSync(dest, Buffer.from(ab)); }); }

function main() {
  if (!KEY) { log('FEHLER: LEONARDO_API_KEY fehlt'); process.exit(1); return; }
  var shots = rj(path.join(__dirname, 'motion-shotlist.json'), []);
  var state = rj(STATE, {});
  var manifest = rj(MANIFEST, { version: 1, assets: [] });
  var have = {}; manifest.assets.forEach(function (a) { have[a.id] = true; });
  var dir = path.join(PROJECT, 'assets', 'video'); fs.mkdirSync(dir, { recursive: true });
  var chain = Promise.resolve(); var made = 0, subm = 0, fail = 0;

  shots.forEach(function (shot) {
    chain = chain.then(function () {
      if (left() < 6000) return;
      var dest = path.join(dir, shot.id + '.mp4');
      if (fs.existsSync(dest)) return;
      var st = state[shot.id] = state[shot.id] || {};
      // 1) init-image upload
      var step = Promise.resolve();
      if (!st.imageId) step = step.then(function () { return uploadInit(shot).then(function (id) { st.imageId = id; log('UP   ' + shot.id); }); });
      // 2) motion submit
      step = step.then(function () { if (st.imageId && !st.genId) return motion(st.imageId, shot.motionStrength).then(function (g) { st.genId = g; subm++; log('SUB  ' + shot.id); }); });
      // 3) poll + download
      step = step.then(function () {
        if (!st.genId) return;
        return api('/generations/' + st.genId, { method: 'GET' }).then(function (r) {
          var g = r && r.generations_by_pk; if (!g) return;
          if (g.status === 'COMPLETE') {
            var imgs = g.generated_images || []; var url = imgs[0] && (imgs[0].motionMP4URL || imgs[0].url);
            if (url) return dl(url, dest).then(function () {
              if (!have[shot.id]) { manifest.assets.push({ id: shot.id, category: 'video', src: 'assets/video/' + shot.id + '.mp4', status: 'ready' }); have[shot.id] = true; }
              made++; delete state[shot.id]; log('OK   ' + shot.id);
            });
          } else if (g.status === 'FAILED') { fail++; delete state[shot.id]; log('FAIL ' + shot.id); }
          else log('wait ' + shot.id + ' (' + g.status + ')');
        });
      });
      return step.catch(function (e) { fail++; log('ERR  ' + shot.id + ' -> ' + e.message); });
    });
  });

  return chain.then(function () {
    wj(STATE, state); wj(MANIFEST, manifest);
    var done = shots.filter(function (s) { return fs.existsSync(path.join(dir, s.id + '.mp4')); }).length;
    log('\nMotion: fertig=' + done + '/' + shots.length + ' neu=' + subm + ' geladen=' + made + ' fehler=' + fail);
    log(done >= shots.length ? 'STATUS: ALLE CLIPS FERTIG' : 'STATUS: nochmal aufrufen ...');
  });
}
main();
