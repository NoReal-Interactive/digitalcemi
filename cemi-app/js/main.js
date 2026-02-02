/*!
 * Copyright (C) 2026 No Real Interactive
 * Licensed under GNU GPL v3
 * See LICENSE file for details.
 */

let inactivityTime;
let inactivityTimer;
let articleMediaPlaying = false;
let swiper;

// Session Params
const sessionModeItem = "MODE";
const sessionLanguageItem = "LANG";
const sessionTagetItem = "TARGET";
const sessionNodeItem = "NODE";
const sessionStartItem = "START";

// Content Service
const cemiContentService = new TazebaoServices.CemiContentService();

const loadOptions = {startAnimation: false};
const nodeOptions = {updateLight: false};

const cemiEsternoNodeId = "esterno";
const cemiEsternoUrl = "models/cemi-esterno/Zemi_esterno.gltf";
const cemiEsternoHotspotNodeId = "esterno-hotspots";
const cemiEsternoHotspotConfig = [
  {id: "H01", position: new THREE.Vector3(-0.036589,0.460728,-0.054054), radius: 0.008},
  {id: "H02", position: new THREE.Vector3(0.001985,0.38571,-0.028309), radius: 0.008},
  {id: "H03", position: new THREE.Vector3(0.005831,0.270009,-0.03595), radius: 0.008},
  {id: "H04", position: new THREE.Vector3(0.008475,0.194636,-0.013873), radius: 0.008},
  {id: "H05", position: new THREE.Vector3(0.060161,0.165002,-0.14742), radius: 0.008},
  {id: "H06", position: new THREE.Vector3(-0.016822,0.413825,-0.179356), radius: 0.008}
];
const cemiInternoNodeId = "interno";
const cemiInternoUrl = "models/cemi-interno/Zemi_interno.gltf";
const cemiInternoHotspotNodeId = "interno-hotspots";
const cemiInternoHotspotConfig = [
  {id: "H07", position: new THREE.Vector3(0.012092,0.278645,-0.035881), radius: 0.008},
  {id: "H08", position: new THREE.Vector3(0.003286,0.516783,-0.075272), radius: 0.008},
];


setup = ()=> {

  // Modals init
  CemiModalUtils.init();

  // Swiper init
  swiper = new Swiper('#introSwiper', {
		effect: 'fade',
		fadeEffect: { crossFade: true },
		loop: true,
		speed: 2000,
		autoplay: {
			delay: 10000,
			disableOnInteraction: false
		},
		pagination: {
			enabled: false
		},
		navigation: {
			enabled: false
		},
		allowTouchMove: false,
		on: {
			slideChangeTransitionStart: function () {
				// applica animazione solo alla slide attiva
				const activeImg = document.querySelector('.swiper-slide-active img');
				activeImg.classList.add('kenburns');
			}
		}
	});
	// avvia animazione per la prima slide
	document.querySelector('.swiper-slide-active img').classList.add('kenburns');


  // Sounds
  const $clickSound = $('#click-sound')[0];
  const $sceneSound = $('#scene-sound')[0];
  $sceneSound.volume = 1;

  // Realize base ATON and add base UI events
  ATON.realize();
 
  // BASIC EVENTS
	addBasicEvents();

  // ENV
	ATON.setBackgroundColor(null);
  ATON.setAutoLP(true);
  ATON.setMainLightDirection( new THREE.Vector3(-0.1,-1,-1));
	ATON.setMainPanorama("pano/HDRI_Zemi_4.hdr");
	ATON.setMainPanoramaRotation(114);
  ATON.setExposure(1.3);
	
  // MODELS
  ATON.createSceneNode(cemiEsternoNodeId).load(cemiEsternoUrl, () => { console.log("cemi esterno loaded")}, loadOptions).attachToRoot().disablePicking();
  ATON.createSceneNode(cemiInternoNodeId).load(cemiInternoUrl, () => { console.log("cemi interno loaded")}, loadOptions).attachToRoot().disablePicking();

  // HOTSPOTS
  const hotSpotMaterialHL  = ATON.MatHub.getMaterial("semanticShapeHL");
  const hotSpotMaterial = new THREE.MeshBasicMaterial({color: 0xffff00, transparent: true, opacity: 0.9});
  gsap.to(hotSpotMaterial, {
    opacity: 0.1,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
  ATON.createSemanticNode(cemiEsternoHotspotNodeId).attachToRoot();
  cemiEsternoHotspotConfig.forEach(hotspot => {
    ATON.createSemanticNode(hotspot.id).attachTo(cemiEsternoHotspotNodeId);
	  ATON.SemFactory.createSphere(hotspot.id, hotspot.position, hotspot.radius).setMaterial(hotSpotMaterial).setDefaultAndHighlightMaterials(hotSpotMaterial, hotSpotMaterialHL);
  });
  ATON.createSemanticNode(cemiInternoHotspotNodeId).attachToRoot();
  cemiInternoHotspotConfig.forEach(hotspot => {
    ATON.createSemanticNode(hotspot.id).attachTo(cemiInternoHotspotNodeId);
	  ATON.SemFactory.createSphere(hotspot.id, hotspot.position, hotspot.radius).setMaterial(hotSpotMaterial).setDefaultAndHighlightMaterials(hotSpotMaterial, hotSpotMaterialHL);
    if(hotspot.id == 'H07') {
      const lineNode = ATON.createSceneNode("H07-line");
      const origin = hotspot.position.clone();
      const endPoint = new THREE.Vector3(origin.x, origin.y, origin.z - 0.047);
      const geom = new THREE.BufferGeometry().setFromPoints([origin, endPoint]);
      const line = new THREE.Line(geom, hotSpotMaterial);
      lineNode.add(line);
      lineNode.attachTo(cemiInternoNodeId);
    }
  });


  const throttledInactivityFunction = _.throttle(function() {
    //console.log("[throttledInactivityFunction]", "["+ATON._hoveredSemNode+"]", ATON._screenPointerCoords.x, ATON._screenPointerCoords.y);
    if (!$('#introOverlay').is(':visible') && !articleMediaPlaying)
      _resetInactivityTimer();
  }, 1000, { trailing: false });
  $(document).on('mousemove click keydown scroll touchstart', throttledInactivityFunction);

  /* BUTTONS */
   $('#startBtn').click(() => {
    ATON._screenPointerCoords.x = -1;
    ATON._screenPointerCoords.y = 1;
    _hideIntro();
    ATON.fire("onClickApp", {eventType: cemiEventTypes.SESSION, data: {action: "START"}});
    startSession();
    ATON.fire("playSceneSound");
  });

  $('#languagesBtn').click(() => {
      ATON.fire("onClickApp");
      $('#languagesBtn').attr('data-active', '');
      CemiModalUtils.showLanguages();
  });

  $('#targetsBtn').click(() => {
    ATON.fire("onClickApp");
    $('#targetsBtn').attr('data-active', '');
    CemiModalUtils.showTargets();
  });

  $('#xrayBtn').click(() => {
    const currentNode = sessionStorage.getItem(sessionNodeItem);
    if(currentNode) {
      if (currentNode === cemiEsternoNodeId) {
        ATON.fire("onClickApp", {eventType: cemiEventTypes.CHANGE, data: {action_type: "MODEL", action_value: cemiInternoNodeId}});
        changeNode(cemiInternoNodeId);
      }
      else if (currentNode === cemiInternoNodeId) {
        ATON.fire("onClickApp", {eventType: cemiEventTypes.CHANGE, data: {action_type: "MODEL", action_value: cemiEsternoNodeId}});
        changeNode(cemiEsternoNodeId);
      }
    }
  });

  $('#argsBtn').click(() => {
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CONTENT, data: {action_type: "SECTION", action_value: "ARGS"}});
    $('#argsBtn').attr('data-active', '');
    CemiModalUtils.showArgs();
  });

  $('#bibliographyBtn').click(() => {
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CONTENT, data: {action_type: "SECTION", action_value: "BIBLIOGRAPHY"}});
    $('#bibliographyBtn').attr('data-active', '');
    CemiModalUtils.showBibliography();
  });

  $('#creditsBtn').click(() => {
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CONTENT, data: {action_type: "SECTION", action_value: "CREDITS"}});
    $('#creditsBtn').attr('data-active', '');
    CemiModalUtils.showCredits();
  });

  $('#surveyBtn').click(() => {
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CONTENT, data: {action_type: "SECTION", action_value: "SURVEY"}});
    var surveySrc = $('#surveyBtn').attr('data-src');
    if(surveySrc)
      window.open(surveySrc, '_blank');
  });

  $('#idView3D').click(() => {
    var hoveredSemanticNode = ATON.getHoveredSemanticNode();
    //console.log("[idView3D]", "["+ATON._hoveredSemNode+"]");
    if(hoveredSemanticNode) {
      if(hoveredSemanticNode.nid) {
        ATON.fire("onClickApp");
        ATON._screenPointerCoords.x = -1;
	      ATON._screenPointerCoords.y = 1;
        CemiModalUtils.showArticle(hoveredSemanticNode.nid);
      }
    }
  });

  $('.lang-btn').click((event) => {
    var lang = $(event.currentTarget).attr("data-lang");
    var label = $(event.currentTarget).attr("data-label");
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CHANGE, data: {action_type: "LANG", action_value: lang}});
    changeLanguage(lang, label);
    CemiModalUtils.closeLanguages();
  });

  $('.target-btn').click((event) => {
    var target = $(event.currentTarget).attr("data-target");
    ATON.fire("onClickApp", {eventType: cemiEventTypes.CHANGE, data: {action_type: "TARGET", action_value: target}});
    changeTarget(target);
    CemiModalUtils.closeTargets();
  });
  
  ATON.on("onClickApp", (cemiEvent) => {
    if(cemiEvent)
      _mtmPushEvent(cemiEvent.eventType, cemiEvent.data);

    $clickSound.play().catch(error => { console.error('Errore durante la riproduzione audio:', error);});
  });

  ATON.on("onTraceAction", (cemiEvent) => {
      _mtmPushEvent(cemiEvent.eventType, cemiEvent.data);
  });

  ATON.on("pauseSceneSound", () => {
    $sceneSound.pause();
  });

  ATON.on("playSceneSound", () => {
    if($sceneSound.paused)
      $sceneSound.play().catch(error => { console.error('Errore durante la riproduzione audio:', error);});
  });

  ATON.on("toggleSceneSound", () => {
    if ($sceneSound.paused)
      $sceneSound.play().catch(error => { console.error('Errore durante la riproduzione audio:', error);});
    else
      $sceneSound.pause();
  });

  ATON.on("onClickSpeech", function(data) {
     const $audio = $("#"+data);
     const $audioElem = $audio.find('audio')[0];
     if ($audioElem.paused) {
          //ATON.fire("pauseSceneSound");
          const playPromise = $audioElem.play();
          if (playPromise !== undefined) {
              playPromise
              .then(() => { $audio.find('img').attr('src', 'assets/icons/pause.png');})
              .catch(error => {
                console.error('Errore durante la riproduzione audio:', error);
              });
          }
      } else {
          //ATON.fire("playSceneSound");
          $audioElem.pause();
          $audio.find('img').attr('src', 'assets/icons/volume.png');
      }
  });

  ATON.on("onPlayMedia", function(data) {
    _mtmPushEvent(cemiEventTypes.MEDIA, {action: "PLAY", action_type: data.mediaType, action_value: data.fileName});
    articleMediaPlaying = true;
    _pauseInactivityTimer();
  });

  ATON.on("onPauseMedia", function(data) {
    _mtmPushEvent(cemiEventTypes.MEDIA, {action: "PAUSE", action_type: data.mediaType, action_value: data.fileName});
    articleMediaPlaying = false;
    _resetInactivityTimer();
  });

  ATON.on("onEndedMedia", function(data) {
    _mtmPushEvent(cemiEventTypes.MEDIA, {action: data.ended == 'Y' ? "END" : "STOP", action_type: data.mediaType, action_value: data.fileName});
    articleMediaPlaying = false;
    _resetInactivityTimer();
  });


  ATON.on("LPsUpdated", () => {
    console.log("LPsUpdated");
    ATON._matMainPano.colorWrite=false;
    $('#idView3D').css("visibility","visible");
  });

  ATON.on("MobileLandscapeMode", () =>{
    setTimeout(() => { CemiModalUtils.adjustMediaThumbs();}, 100);
    
  });

  ATON.on("MobilePortraitMode", () =>{
    setTimeout(() => { CemiModalUtils.adjustMediaThumbs();}, 100);
  });

  $.getJSON("app.config.json", (data)=> {
      inactivityTime = data.inactivityTime || 120000;
      if(data.minDistanceControls)
        ATON.Nav._controls.minDistance = data.minDistanceControls;
      if(data.maxDistanceControls)
        ATON.Nav._controls.maxDistance = data.maxDistanceControls;
      if(data.rotateSpeed)
        ATON.Nav._controls.rotateSpeed = data.rotateSpeed;
      if(data.sceneSoundVolume)
        $sceneSound.volume = data.sceneSoundVolume;

      ATON.Nav._controls.enablePan = data.enablePan;
      ATON.SUI.showSelector(data.showSelector);
      ATON.toggleAdaptiveDensity(data.toggleAdaptiveDensity);

      if(data.mode == 'kiosk') {
        $('#cemi-header-right').css("display","flex");
      }

      if(data.surveyUrl)
        $('#surveyBtn').attr('data-src', data.surveyUrl);
      else
        $('#surveyBtn').hide();
      
      sessionStorage.setItem(sessionModeItem, data.mode);
      loadContent("it", "ITA");
      setTarget("generic");
  });

};

/* update routine (executed continuously).*/
update = ()=>{

};

addBasicEvents = ()=> {

  ATON.on("NodeRequestFired", (url) =>{
    console.log("NodeRequestFired", url);
    ATON.UI.showCenteredOverlay();
  });

  ATON.on("NodeRequestCompleted", (url) =>{
    console.log("NodeRequestCompleted", url);
  });

  ATON.on("AllNodeRequestsCompleted", ()=> {
    ATON.UI.hideCenteredOverlay();
    // Handle home pov
    if (ATON.UI._bReqHome) return;
    if (!ATON.Nav.homePOV) ATON.Nav.computeAndRequestDefaultHome(0.5);
    ATON.Nav.requestHomePOV(0.2);
    ATON.UI._bReqHome = true;
    console.log("AllNodeRequestsCompleted homePOV:", ATON.Nav.homePOV);

    ATON.getSceneNode(cemiInternoNodeId).hide(nodeOptions);
    ATON.getSemanticNode(cemiInternoHotspotNodeId).hide(nodeOptions);
    if(window.electronAPI)
      window.electronAPI.notifyAssetsReady();
  });

  // Semantic
  ATON.on("SemanticNodeHover", (semid)=> {
    //console.log("[SemanticNodeHover]", "["+ATON._hoveredSemNode+"]", semid, ATON._screenPointerCoords.x, ATON._screenPointerCoords.y);
    let S = ATON.getSemanticNode(semid);
    if (S === undefined) return;
    S.highlight();
    document.querySelector('canvas').style.cursor = 'pointer';
    setTimeout(() => { 
      ATON._screenPointerCoords.x = -1;
      ATON._screenPointerCoords.y = 1; 
    }, 500);
  });

  ATON.on("SemanticNodeLeave", (semid)=> {
    //console.log("[SemanticNodeLeave]", "["+ATON._hoveredSemNode+"]", semid, ATON._screenPointerCoords.x, ATON._screenPointerCoords.y);
    let S = ATON.getSemanticNode(semid);
    if (S === undefined) return;
    S.restoreDefaultMaterial();
    document.querySelector('canvas').style.cursor = 'grab';
    //if (ATON.SUI.gSemIcons) ATON.SUI.gSemIcons.show();
  });

  ATON.addUpdateRoutine( ()=> {});
};

function startSession() {
  sessionStorage.setItem(sessionStartItem, new Date().toISOString());
  sessionStorage.setItem(sessionLanguageItem, "it");
  sessionStorage.setItem(sessionNodeItem, cemiEsternoNodeId);
  sessionStorage.setItem(sessionTagetItem, "generic");
}

function clearSession() {
  sessionStorage.removeItem(sessionStartItem, new Date().toISOString());
  sessionStorage.removeItem(sessionLanguageItem, "ITA");
  sessionStorage.removeItem(sessionNodeItem, cemiEsternoNodeId);
  sessionStorage.removeItem(sessionTagetItem, "generic");
  loadContent("it", "ITA");
  setTarget("generic");
}

function _resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {

    _showIntro();
    ATON.Nav.requestHome(1.0);
    setNode(cemiEsternoNodeId);
    CemiModalUtils.closeAll();
    _mtmPushEvent(cemiEventTypes.SESSION, {action: "EXPIRE"});
    clearSession();
    

  }, inactivityTime);
}

function _pauseInactivityTimer(){
  clearTimeout(inactivityTimer);
  inactivityTimer = null;
}

function _showIntro() {
  //_paq.push(['trackEvent', 'CemiSession', 'end', '']);
  if(swiper) {
    $('#introOverlay').css('display', 'block').css('opacity', '0').css('transition', 'opacity 0.5s ease');
    setTimeout(() => {
      $('#introOverlay').css('opacity', '1');
      swiper.update();
      swiper.autoplay.start();
    }, 10);
  } else {
    console.log("swiper not initialized")
  }
}

function _hideIntro() {
  //_paq.push(['trackEvent', 'CemiSession', 'start', '']);
  if(swiper) {
    $('#introOverlay').css('transition', 'opacity 0.5s ease').css('opacity', '0');
    setTimeout(() => {
      $('#introOverlay').css('display', 'none');
      swiper.autoplay.stop();
      _resetInactivityTimer();
    }, 500);
  } else {
    console.log("swiper not initialized")
  }
}

function changeLanguage(lang, label){
  sessionStorage.setItem(sessionLanguageItem, lang);
  loadContent(lang, label);
}

function loadContent(lang, label) {
  $('#languagesBtn img').attr("src", "assets/icons/"+label.toUpperCase()+".png");
  cemiContentService.loadContent(lang).then((cemiContent) => {
    console.log("content loaded", lang);
    $('#title').text(cemiContent.title);
    $('#subtitle').text(cemiContent.subtitle);
    CemiModalUtils.loadContent(cemiContent);
    /* hotspots
    const nodes = ATON.getRootSemantics().children;
    Object.entries(nodes).forEach(([index, node]) => {
      if(node.name.startsWith("H")){
        const article = cemiContent.getArticle(node.name);
        node.setDescription(article.title);
      }
    });
    */
  });
}


function changeTarget(target) {
  sessionStorage.setItem(sessionTagetItem, target);
  setTarget(target);
}

function setTarget(target) {
  $('#targetsBtn img').attr("src", "assets/icons/"+(target == 'children' ? "target-kid" : "target-adult")+".png");
  $('body').css('background-image', target == 'children' ? 'url("assets/images/background-color.jpg")' : 'url("assets/images/background.jpg")');
}

function changeNode(nid) {
  setNode(nid);
  sessionStorage.setItem(sessionNodeItem, nid);
}

function setNode(nid) {
  if (nid === cemiInternoNodeId) {
    ATON.getSceneNode(cemiEsternoNodeId).hide(nodeOptions);
    ATON.getSemanticNode(cemiEsternoHotspotNodeId).hide(nodeOptions);
    ATON.getSceneNode(cemiInternoNodeId).show(nodeOptions);
    ATON.getSemanticNode(cemiInternoHotspotNodeId).show(nodeOptions);
  }
  else if (nid === cemiEsternoNodeId) {
    ATON.getSceneNode(cemiInternoNodeId).hide(nodeOptions);
    ATON.getSemanticNode(cemiInternoHotspotNodeId).hide(nodeOptions);
    ATON.getSceneNode(cemiEsternoNodeId).show(nodeOptions);
    ATON.getSemanticNode(cemiEsternoHotspotNodeId).show(nodeOptions);
  }
}


const cemiEventTypes = Object.freeze({
    CHANGE: 1,
    CONTENT: 2,
    SESSION: 3,
    MEDIA: 4
});
function _mtmPushEvent(eventType, data){
  if(!window._mtm)
    return;

  let _event = {
    context_lang: sessionStorage.getItem(sessionLanguageItem), 
    context_target: sessionStorage.getItem(sessionTagetItem), 
    context_model: sessionStorage.getItem(sessionNodeItem),
    context_start: sessionStorage.getItem(sessionStartItem),
    context_mode: sessionStorage.getItem(sessionModeItem),
    action: data.action ? data.action : "",
    action_type: data.action_type ? data.action_type : "",
    action_value: data.action_value ? data.action_value : "",
  }

  switch (eventType) {
      case cemiEventTypes.CHANGE:
        _event.event = "CHANGE";
        _event.action = "CHANGE";
        break;
      case cemiEventTypes.CONTENT:
        _event.event = "CONTENT";
        _event.action = "VIEW";
        break;
      case cemiEventTypes.MEDIA:
        _event.event = "MEDIA";
        break;
      case cemiEventTypes.SESSION:
        _event.event = "SESSION";
        break;
      default:
        console.log("_mtmPushEvent", "UNKNOWN");
  }

  //console.log("_mtm.push", _event);
  window._mtm.push(_event);

}

// Realize the app
let APP = ATON.App.realize(setup, update);
window.APP = APP;

// Tell ATON to configure paths and resources as standalone
ATON.setAsStandalone();
ATON.setPathCollection("/data/");