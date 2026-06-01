#!/usr/bin/env node
/* Wave Bite - Captain's Run · tools/leonardo-generate.js
 * Asset-Pipeline fuer die Leonardo-AI-API (Submit -> Collect, etappenfaehig).
 *
 *   export LEONARDO_API_KEY="..."        # Key kommt aus der Umgebung, nie aus dem Code
 *   node tools/leonardo-generate.js tools/shotlist.mvp.json
 *
 * Robust fuer kurze Ausfuehrungsfenster:
 *  - Zustandsdatei tools/.gen-state.json (welche generationId zu welchem Motiv gehoert)
 *  - Zeitbudget (GEN_BUDGET_MS, Default 38s) -> sauberer Abbruch, naechster Lauf macht weiter
 *  - Direkter Schreibzugriff (rename/unlink im Mount nicht erlaubt)
 *  - Resume: fertige Dateien werden uebersprungen
 * Mehrfach aufrufen, bis "ALLE ASSETS FERTIG" gemeldet wird.
 */
'use strict';
var fs = require('fs');
var path = require('path');

var API = 'https://cloud.leonardo.ai/api/rest/v1';
var KEY = process.env.LEONARDO_API_KEY;
var BUDGET = parseInt(process.env.GEN_BUDGET_MS || '38000', 10);
var SUBMIT_MAX = parseInt(process.env.GEN_SUBMIT_MAX || '8', 10);
var PROJECT = path.resolve(__dirname, '..');
var ASSETS = path.join(PROJECT, 'assets');
var MANIFEST = path.join(PROJECT, 'src', 'data', 'asset-manifest.json');
var STATE = path.join(__dirname, '.gen-state.json');

var STYLE = 'Premium maritime mobile game asset, realistic cinematic style, modern patrol boat cockpit, '
  + 'dark navy and gold color palette, elegant water reflections, high detail, atmospheric lighting, '
  + 'professional mobile game concept art, no cartoon, no childish look, no real police logo, '
  + 'fictional maritime patrol unit, clean composition, mobile game ready';
var NEGATIVE = 'cartoon, anime, childish, low quality, blurry, distorted, ugly, cheap browser game, '
  + 'oversaturated, unreadable text, watermark, real police logo, real government emblem, deformed faces, '
  + 'bad perspective, plastic look';
var PHOENIX = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3';

var CATEGORY_DIR = { cockpit:'cockpit', background:'backgrounds', backgrounds:'backgrounds', station:'backgrounds',
  character:'characters', characters:'characters', boat:'boats', boats:'boats', ui:'ui', icon:'icons', icons:'icons', fx:'backgrounds' };

var t0 = Date.now();
function timeLeft(){ return BUDGET - (Date.now() - t0); }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function log(m){ process.stdout.write(m + '\n'); }
function readJSON(f, d){ try { return JSON.parse(fs.readFileSync(f,'utf8')); } catch(e){ return d; } }
function writeJSON(f, o){ fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f, JSON.stringify(o,null,2)); }
function ensureDir(d){ fs.mkdirSync(d,{recursive:true}); }
function destFor(shot, n){ return path.join(ASSETS, CATEGORY_DIR[shot.category]||'misc', shot.id+'_'+n+'.png'); }
function filesExist(shot){ var c=shot.count||1; for(var n=1;n<=c;n++) if(!fs.existsSync(destFor(shot,n))) return false; return true; }

function api(p, opts){
  opts = opts || {};
  opts.headers = { 'accept':'application/json','content-type':'application/json','authorization':'Bearer '+KEY };
  return fetch(API+p, opts).then(function(res){
    return res.text().then(function(txt){
      var j=null; try{ j=txt?JSON.parse(txt):null; }catch(e){}
      if(!res.ok) throw new Error('HTTP '+res.status+' '+p+' -> '+txt.slice(0,200));
      return j;
    });
  });
}
function submit(shot){
  var body = { prompt:(shot.prompt+', '+STYLE).slice(0,1490), negative_prompt:NEGATIVE,
    modelId: shot.modelId||PHOENIX, width:shot.width||1024, height:shot.height||1024,
    num_images:shot.count||1, contrast:shot.contrast||3.5, alchemy: shot.alchemy!==false };
  return api('/generations',{ method:'POST', body:JSON.stringify(body) }).then(function(r){
    var id = r && r.sdGenerationJob && r.sdGenerationJob.generationId;
    if(!id) throw new Error('keine generationId: '+JSON.stringify(r).slice(0,160));
    return id;
  });
}
function download(url, dest){
  return fetch(url).then(function(res){
    if(!res.ok) throw new Error('dl HTTP '+res.status);
    return res.arrayBuffer();
  }).then(function(ab){ fs.writeFileSync(dest, Buffer.from(ab)); });
}

function main(){
  if(!KEY){ log('FEHLER: LEONARDO_API_KEY nicht gesetzt.'); process.exit(1); return; }
  var shotfile = process.argv[2] || path.join(__dirname,'shotlist.mvp.json');
  var shots = readJSON(shotfile, null);
  if(!shots){ log('Shotlist nicht lesbar: '+shotfile); process.exit(1); return; }
  var state = readJSON(STATE, {});
  var manifest = readJSON(MANIFEST, { version:1, generatedAt:null, assets:[] });
  var haveAsset = {}; manifest.assets.forEach(function(a){ haveAsset[a.id]=true; });
  var submitted=0, downloaded=0, failed=0;

  // COLLECT zuerst, dann SUBMIT - sequenziell als Promise-Kette
  var chain = Promise.resolve();

  shots.forEach(function(shot){
    chain = chain.then(function(){
      if(timeLeft()<4000) return;
      if(filesExist(shot)) return;
      var st = state[shot.id];
      if(!(st && st.generationId)) return;
      return api('/generations/'+st.generationId,{method:'GET'}).then(function(r){
        var g = r && r.generations_by_pk;
        if(g && g.status==='COMPLETE'){
          ensureDir(path.dirname(destFor(shot,1)));
          var imgs = g.generated_images||[];
          var dl = Promise.resolve();
          imgs.forEach(function(img, idx){
            dl = dl.then(function(){
              var dest = destFor(shot, idx+1);
              return (fs.existsSync(dest)?Promise.resolve():download(img.url,dest)).then(function(){
                var aid = shot.id+'_'+(idx+1);
                if(!haveAsset[aid]){ manifest.assets.push({ id:aid, category:shot.category,
                  src:path.relative(PROJECT,dest).replace(/\\/g,'/'), variant:shot.variant||'', seed:img.seed||'', status:'ready' }); haveAsset[aid]=true; }
                downloaded++;
              });
            });
          });
          return dl.then(function(){ delete state[shot.id]; log('OK   '+shot.id); });
        } else if(g && g.status==='FAILED'){ delete state[shot.id]; failed++; log('FAIL '+shot.id); }
      }).catch(function(e){ log('poll '+shot.id+' -> '+e.message); });
    });
  });

  shots.forEach(function(shot){
    chain = chain.then(function(){
      if(timeLeft()<6000 || submitted>=SUBMIT_MAX) return;
      if(filesExist(shot)) return;
      if(state[shot.id] && state[shot.id].generationId) return;
      return submit(shot).then(function(id){ state[shot.id]={ generationId:id, ts:Date.now() }; submitted++; log('SUB  '+shot.id); })
        .catch(function(e){ failed++; log('xSUB '+shot.id+' -> '+e.message); })
        .then(function(){ return sleep(400); });
    });
  });

  return chain.then(function(){
    writeJSON(STATE, state);
    writeJSON(MANIFEST, Object.assign(manifest,{ generatedAt:new Date().toISOString() }));
    var total = shots.length;
    var finished = shots.filter(filesExist).length;
    log('\nEtappe: fertig='+finished+'/'+total+' offen='+(total-finished)+' neu='+submitted+' geladen='+downloaded+' fehler='+failed);
    if(finished>=total) log('STATUS: ALLE ASSETS FERTIG');
    else log('STATUS: nochmal aufrufen (Generierungen laufen) ...');
  });
}
main();
