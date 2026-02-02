(function(window) {

  let thumbsSwiper = null;
  let mediaSwiper = null;
  let articles = [];

  const displayTypes = Object.freeze({
    MAIN: 1,
    SECOND: 2,
    MEDIA: 3,
    HTML: 4
  });

  function init() {
    
    if (typeof MicroModal === 'undefined') {
      console.error("Micromodal non è disponibile.");
      return;
    }

    // MicroModal init
    MicroModal.init();
    console.log("Micromodal inizializzato");

  }

  function loadContent(cemiContent){
    articles = cemiContent.articles;
    $('#article-links').empty();
    $('#bibliography-list').empty();
    $('#credits-list').empty();

    // Args
    cemiContent.articles.forEach(link => {
      if(link.id.startsWith("G")){
        var $link = $(`<div data-click-audio class='article-link' data-arg-id='${link.id}-c.png'><img src="assets/images/args/${link.id}-c.png" alt="Immagine quadrata" class="immagine"><div>${link.title}</div></div>`);
        $link.click(function (event) {
          ATON.fire("onClickApp");
          MicroModal.close("args-modal");
          if(link.id == "G06"){
            showArticle(link.id, displayTypes.HTML);
          } else {
            showArticle(link.id, displayTypes.MAIN);
          }
        });
        $link.appendTo($('#article-links'));
      }
    });

    // Bibliography
    $('#bibliography-title').text(cemiContent.bibliographyTitle);
    cemiContent.bibliography.forEach(b => {
      var $li = $(`<li><span>${b}</span></li>`);
      $li.appendTo($('#bibliography-list'));
    });

    // Credits
    $('#credits-title').text(cemiContent.creditsTitle);
    cemiContent.credits.forEach(c => {
      var $li = $(`<li><span><strong>${c.area}</strong></span></li>`);
      c.contributors.forEach(co => {
        var $row = $(`</br><span>${co}</span>`);
        $row.appendTo($li);
      });
      $li.appendTo($('#credits-list'));
    });

  }

  function closeArticle(){
    $('.article-speech').each(function() {
      if (!this.paused) {
        let fileName = this.src.split('/').pop();
        ATON.fire("onEndedMedia", {mediaType: "SPEECH", fileName: fileName, ended:'N'});
        MicroModal.close("article-modal");
        return;
      }
    });
    $('.article-video').each(function() {
      if (!this.paused){
          let fileName = this.currentSrc.split('/').pop();
          ATON.fire("onEndedMedia", {mediaType: "VIDEO", fileName: fileName, ended:'N'});
          MicroModal.close("article-modal");
          return;
      }   
    });
    MicroModal.close("article-modal");
  }

  function closeLanguages(){
    MicroModal.close("languages-modal");
  }

  function closeTargets(){
    MicroModal.close("targets-modal");
  }

  function closeAll(){
    if ($('#article-modal').is(':visible'))
      closeArticle();
    if ($('#languages-modal').is(':visible'))
      closeLanguages();
    if ($('#targets-modal').is(':visible'))
      closeTargets();
    if ($('#args-modal').is(':visible'))
      MicroModal.close("args-modal");
    if($('#bibliography-modal').is(':visible'))
      MicroModal.close("bibliography-modal");
    if($('#credits-modal').is(':visible'))
      MicroModal.close("credits-modal");
  }

  function showLanguages() {
      const currentLang = sessionStorage.getItem(sessionLanguageItem);
      var btnPos = $('#languagesBtn').offset();
      var top = btnPos.top;
      var marginLeft = $('#cemi-toolbar').width() + 32;
      $('#languages-modal-container').css({'top': top+"px"});
      $('.lang-btn').each(function() {
          if(currentLang && currentLang == $(this).attr("data-lang"))
            $(this).addClass("modal__btn-disabled")
          else
            $(this).removeClass("modal__btn-disabled")
      });
      MicroModal.show("languages-modal", {
        onClose: () => {
          $('#languagesBtn').removeAttr("data-active");
          ATON.fire("onClickApp");
        }
      }); 
  }

  function showTargets() {
      const currentTarget = sessionStorage.getItem(sessionTagetItem);
      var btnPos = $('#targetsBtn').offset();
      var top = btnPos.top;
      $('#targets-modal-container').css({'top': top+"px"});
      $('.target-btn').each(function() {
          if(currentTarget && currentTarget == $(this).attr("data-target"))
            $(this).addClass("modal__btn-disabled")
          else
            $(this).removeClass("modal__btn-disabled")
      });
      MicroModal.show("targets-modal", {
        onClose: () => {
          $('#targetsBtn').removeAttr("data-active");
          ATON.fire("onClickApp");
        }
      });
  }

  function showArgs() {
      MicroModal.show("args-modal", {
        onClose: () => {
          $('#argsBtn').removeAttr("data-active");
          ATON.fire("onClickApp");
        }
      });
  }

  function showBibliography() {
      MicroModal.show("bibliography-modal", {
        onClose: () => {
          $('#bibliographyBtn').removeAttr("data-active");
          ATON.fire("onClickApp");
        }
      });
  }

  function showCredits() {
      MicroModal.show("credits-modal", {
        onClose: () => {
          $('#creditsBtn').removeAttr("data-active");
          ATON.fire("onClickApp");
        }
      });
  }

  function showArticle(articleId, displayType, articleParentId) {
    if(!articleId)
      return;

    const _isAlternativeTarget = sessionStorage.getItem(sessionTagetItem) === 'children';
    const _article =  articles.find(a => a.id === articleId);
    const _articleId = _article.id;
    const _displayType = displayType ? displayType : displayTypes.MAIN;
    const _parent = articleParentId ? articleParentId : "";
    var _articleOption = {
      article: _article,
      displayType: _displayType,
      parent: _parent
    }

    ATON.fire("onTraceAction", {eventType: 2, data: {
      action_type: _articleId.startsWith("G") ? "ARG" : "HOTSPOT",
      action_value: _articleId + "-" + (displayType == displayTypes.MEDIA ? "MEDIA" : (displayType == displayTypes.SECOND ? "SECOND" : "MAIN")),
    }});


    /* set content */
    $('#article-title').text(_article.title);
    switch (_displayType) {

      case displayTypes.MAIN:
        // secondary button
        if(_article.hasSecondaryText() && !_isAlternativeTarget) _addSecond(_articleOption);
        // audio
        _addSpeech(_articleOption);
        // close
        _addCloseButton(_articleOption);
        // text
        _addArticleText(_articleOption);
        // media gallery
        if(_article.media.length > 0) _addArticleMediaThumbs(_articleOption);
        break;
      case displayTypes.SECOND:
        // audio
        _addSpeech(_articleOption);
        // close
        _addCloseButton(_articleOption);
        // text
        _addArticleText(_articleOption);
        // media gallery
        if(_article.media.length > 0) _addArticleMediaThumbs(_articleOption);
        break;
      case displayTypes.MEDIA:
        // close
        _addCloseButton(_articleOption);
        if(_article.media.length > 0) {
          _addArticleMediaGallery(_articleOption);
          _addArticleMediaThumbs(_articleOption);
        }
        break;
      case displayTypes.HTML:
        // audio
        _addSpeech(_articleOption);
        // close
        _addCloseButton(_articleOption);
        _addArticleHTML(_articleOption);
        if(_article.media.length > 0) {
          _addArticleMediaThumbs(_articleOption);
        }
        break;
      default:
        console.log("article displayType", _displayType);
    }

    // SHOW MODAL
    MicroModal.show("article-modal", {
      onShow: (modal, activeElement, event) => {
        $('#argsBtn').attr('data-active', '');
        var $modal = $('#article-modal');
        $modal.attr("data-article-id", _articleId);
        $modal.attr("data-display-type", _displayType);
        $modal.attr("data-parent", _parent);
        /* MOUNT MEDIA GALLERY */
        if ($('#article-media-thumbs').is(':visible')) {
          const selectedMediaIndex = _article.getSelectedMediaIndex() || 0;

          // THUMBS
          const conL = $('#article-media-thumbs').width();
          const conH = $('#article-media-thumbs').height();
          const minNumSlides = Math.round(conL / conH);

          const slideL = (12 * 16 + 16);
          const numSlides = $('#article-media-thumbs .swiper-slide').length;
          const sliding = numSlides > (minNumSlides-1);

          thumbsSwiper = new Swiper("#thumbsSwiper", {
            loop: false,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            slidesPerView: minNumSlides-1,
            spaceBetween: 16,
            allowTouchMove: sliding,
            initialSlide: selectedMediaIndex
            /*
            allowSlideNext: sliding,
            allowSlidePrev: sliding,
            */
          });

          if(!sliding) {
            $('#thumbsSwiper').css("width", "90%");
            $('#article-media-previews').css("justify-content", "center");
          } else {
            let padding = $('.swiper-button-prev').width() + "px";
            //$(".slide-figure").css("padding-left", padding);
            //$(".slide-figure").css("padding-right", padding);  
          }
            
          
          // GALLERY
          if ($('#article-media').is(':visible')) {
            mediaSwiper = new Swiper("#mediaSwiper", {
              loop: false,
              spaceBetween: 16,
              thumbs: {
                swiper: thumbsSwiper,
              },
              slidesPerView: 1,
              allowTouchMove: false,
              initialSlide: selectedMediaIndex
            });

            mediaSwiper.on('slideChange', function () {
              ATON.fire("onClickApp");
              //console.log("mediaSwiper.slideChange", mediaSwiper.activeIndex);
              $('video').each(function () {
                  this.pause();
              });
              const $activeSlide = $(mediaSwiper.slides[mediaSwiper.activeIndex]);
              const $video = $activeSlide.find('video');
              if ($video.length) {
                $video.removeAttr("muted");
                $video.get(0).play().catch(err => {
                  console.log('Errore nella riproduzione:', err);
                });
              }
              const $image = $activeSlide.find('img');
              if ($image.length) {
                let fileName = $image[0].src.split('/').pop();
                ATON.fire("onTraceAction", {eventType: 4, data: {action: "VIEW", action_type: "IMAGE", action_value: fileName}});
              }
            });

            mediaSwiper.on('slideChangeTransitionEnd', function () {
              //console.log("slideChangeTransitionEnd", mediaSwiper.activeIndex);
              const $activeSlide = $(mediaSwiper.slides[mediaSwiper.activeIndex]);
              const $image = $activeSlide.find('img');
              if ($image.length) {
                  _addImagePanZoom($image[0]);
              }
            });

            const $initialSlide = $(mediaSwiper.slides[selectedMediaIndex]);
            const $initialImage = $initialSlide.find('img');
            const $video = $initialSlide.find('video');
            if ($initialImage.length) {
                let fileName = $initialImage[0].src.split('/').pop();
                ATON.fire("onTraceAction", {eventType: 4, data: {action: "VIEW", action_type: "IMAGE", action_value: fileName}});
                _addImagePanZoom($initialImage[0]);
            }

            if ($video.length) {
              $video.removeAttr("muted");
              $video.get(0).play().catch(err => {
                console.log('Errore nella riproduzione:', err);
              });
            }
          }
        }
      },
      onClose: (modal, activeElement, event) => { 
        $('#argsBtn').removeAttr("data-active");
        ATON.fire("onClickApp");
        ATON.fire("playSceneSound");
        /* EMPTY ARTICLE */
        var $modal = $('#article-modal');
        $modal.attr("data-article-id", "");
        $modal.attr("data-display-type", "");
        $modal.attr("data-parent", "");
        $('#article-title').empty();
        $('#article-tools').empty();
        $('#article-text').empty();$('#article-text').hide();
        $('#article-html').empty();$('#article-html').hide();
        // empty gallery
        $('.panzoom-img').each(function() {
          const elem = document.getElementById($(this).attr("id"));
          const panzoom = Panzoom(elem);
          panzoom.destroy();
          elem.parentElement.removeEventListener('wheel', panzoom.zoomWithWheel);
          //console.log("panzoom destroyed", $(this).attr("id"));
          $(this).removeClass("panzoom-img");
        });
        $('#article-media-gallery').empty();$('#article-media').hide();
        $('#article-media-previews').empty();$('#article-media-thumbs').hide();

        if (mediaSwiper) {
          try {
            mediaSwiper.destroy();
          } catch (e) {
            console.warn("Glide destroy error:", e);
          }
          mediaSwiper = null;
        }

        if (thumbsSwiper) {
          try {
            thumbsSwiper.destroy();
          } catch (e) {
            console.warn("Glide destroy error:", e);
          }
          thumbsSwiper = null;
        }
      },
      awaitCloseAnimation: false,
      awaitOpenAnimation: false,
      debugMode: true
    });
  }

  function _addSecond(_articleOption) {
    var $secondaryButton = $("<div class='modal__btn tools-btn' data-click-audio title=''><img src='assets/icons/plus.png'></div>");
    $secondaryButton.click(function (event) {
      ATON.fire("onClickApp");
      event.stopPropagation();
      closeArticle();
      showArticle(_articleOption.article.id, displayTypes.SECOND, _articleOption.article.id+"."+displayTypes.MAIN);
    });
    $secondaryButton.appendTo($('#article-tools'));
  }

  function _addSpeech(_articleOption) {
    const _isAlternativeTarget = sessionStorage.getItem(sessionTagetItem) === 'children';
    var $audio = $("<div id='audioT' data-click-audio class='modal__btn tools-btn' title=''><img src='assets/icons/volume.png'></div>");
    var audioUrl = null;
    if(_articleOption.displayType == displayTypes.MAIN || _articleOption.displayType == displayTypes.HTML)
      audioUrl = _articleOption.article.getUrlAudio(_isAlternativeTarget);
    else if(_articleOption.displayType == displayTypes.SECOND)
      audioUrl = _articleOption.article.getSecondaryUrlAudio();
    if(audioUrl) {
      var $audioElem = $("<audio class='article-speech' src='' preload='auto'></audio>");
      var fileName = audioUrl.split('/').pop();
      $audioElem.attr("src", audioUrl);
      $audioElem.on('play', () => ATON.fire("onPlayMedia", {mediaType: "SPEECH", fileName: fileName}));
      $audioElem.on('pause', () => ATON.fire("onPauseMedia", {mediaType: "SPEECH", fileName: fileName}));
      $audioElem.on("ended", function () {
        this.currentTime = 0;
        $audio.find('img').attr('src', 'assets/icons/volume.png');
        ATON.fire("onEndedMedia", {mediaType: "SPEECH", fileName: fileName, ended:'Y'});
      });
      $audio.append($audioElem);
      $audio.click(function () {
        ATON.fire("onClickApp");
        ATON.fire("onClickSpeech", 'audioT');
      });
      
    } else {
      $audio.addClass("modal__btn-disabled")
    }
    $audio.appendTo($('#article-tools'));
  }

  function _addCloseButton(_articleOption){
    var $close = $("<div class='modal__btn tools-btn close-btn' data-click-audio title=''><img src='assets/icons/close.png'></div>");
    $close.click(function(event) {
      if(_articleOption.parent) {
        event.stopPropagation();
        let parentArticleId = _articleOption.parent.split(".")[0];
        let parentDisplayType = _articleOption.parent.split(".")[1];
        if(parentDisplayType == displayTypes.MAIN){
          closeArticle();
          showArticle(parentArticleId, displayTypes.MAIN);
        }
        else if(parentDisplayType == displayTypes.SECOND){
          closeArticle();
          showArticle(parentArticleId, displayTypes.SECOND, parentArticleId+"."+displayTypes.MAIN);
        }
        else if(parentDisplayType == displayTypes.HTML){
          closeArticle();
          showArticle(parentArticleId, displayTypes.HTML);
        }
      }
      else {
        event.stopPropagation();
        closeArticle();
        if(_articleOption.article.id.startsWith("G"))
          showArgs();
      }
    });
    $close.appendTo($('#article-tools'));
  }

  function _addArticleText(_articleOption) {
    $('#article-text').show();
    if(_articleOption.article.media.length == 0)
      $('#article-text').css("max-height", "100%");

    const _isAlternativeTarget = sessionStorage.getItem(sessionTagetItem) === 'children';
    let htmlFormattedText = "";
    if(_articleOption.displayType == displayTypes.MAIN)
      htmlFormattedText = _articleOption.article.getText(_isAlternativeTarget);
    else if(_articleOption.displayType == displayTypes.SECOND)
      htmlFormattedText = _articleOption.article.getSecondaryText();

    if(_articleOption.article.hasKeywords()) {
      const keywords = _articleOption.article.getKeywords().map(k => k.normalize("NFC")).sort((a, b) => b.length - a.length);
      const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\p{L})(${keywords.map(escapeRegExp).join("|")})(?!\\p{L})`,"giu");
      htmlFormattedText = htmlFormattedText.normalize("NFC").replace(regex, '<span class="article-keyword">$1</span>');
    }
     $('#article-text').html(htmlFormattedText);
  }

  function _addArticleHTML(_articleOption) {
    $('#article-html').show();
    const _isAlternativeTarget = sessionStorage.getItem(sessionTagetItem) === 'children';
    const res = _articleOption.article.getText(_isAlternativeTarget);
    $("#article-html").load(res);
  }

  function _addArticleMediaGallery(_articleOption) {
    $('#article-media').show();
    _articleOption.article.media.forEach((media, index) => {
        var $media = $(`<div class="swiper-slide"></div>`);
        var fileName = media.url ? media.url.split('/').pop() : "";
        if(media.isVideo()) {
          const currentMode = sessionStorage.getItem(sessionModeItem);
          let $video;
          if(currentMode && currentMode == 'kiosk') {
            $video = $(`<video class='article-video' controls disablePictureInPicture controlsList="nodownload noremoteplayback noplaybackrate nofullscreen disablepictureinpicture"><source src="${media.url}" type="video/webm"><track src="${media.subUrl}" kind="subtitles" srclang="it" label="Italiano" default></video>`);        
            //$video.attr("disablePictureInPicture",true);
          }
          else
            $video = $(`<video class='article-video' controls controlsList="nodownload noremoteplayback noplaybackrate disablepictureinpicture"><source src="${media.url}" type="video/webm"><track src="${media.subUrl}" kind="subtitles" srclang="it" label="Italiano" default></video>`);        
          
          $video.on('play', () => {ATON.fire("onClickApp"); ATON.fire("onPlayMedia", {mediaType: "VIDEO", fileName: fileName})});
          $video.on('pause', () => {ATON.fire("onClickApp"); ATON.fire("onPauseMedia", {mediaType: "VIDEO", fileName: fileName})});
          $video.on('ended', () => ATON.fire("onEndedMedia", {mediaType: "VIDEO", fileName: fileName, ended:'Y'}));
          $video.appendTo($media);
          $media.appendTo($('#article-media-gallery'));
        }
        else {
          var $figure = $("<figure class='slide-figure'></figure>");
          var $imageContainer = $(`<div class="panzoom-container"><div class="panzoom-icon-overlay"><img src="assets/icons/zoom-pan.png" alt=""></div></div>`);
          var $image = $(`<img id='panzoom-${_articleOption.article.id}-${index}' src='${media.url}' alt=''>`);
          var $caption = $(`<figcaption>${media.desc}</figcaption>`);
          
          
          $image.prependTo($imageContainer);

          $imageContainer.appendTo($figure);
          $caption.appendTo($figure);
          $figure.appendTo($media);

          $media.appendTo($('#article-media-gallery'));
          
        }
        
    });
  }

  function _addArticleMediaThumbs(_articleOption) {
    $('#article-media-thumbs').show();
    _articleOption.article.media.forEach((media, index) => {
        var url = media.thumbUrl;
        var $previewMedia = $(`<div class="swiper-slide" data-click-audio></div>`);
        if(media.isVideo()) {
          $previewMedia.append(`<div class="poster-container"><img src='${url}' alt=""><div class="poster-overlay"></div></div>`);
        } else {
          $previewMedia.append(`<img src='${url}' />`);
        }

        if(_articleOption.displayType != displayTypes.MEDIA) {
          $previewMedia.click(function (event) {
            event.stopPropagation();
            _articleOption.article.setSelectedMediaIndex(index);
            if(_articleOption.displayType == displayTypes.MAIN){
              closeArticle();
              showArticle(_articleOption.article.id, displayTypes.MEDIA, _articleOption.article.id+"."+displayTypes.MAIN);
            }
            else if(_articleOption.displayType == displayTypes.SECOND) {
              closeArticle();
              showArticle(_articleOption.article.id, displayTypes.MEDIA, _articleOption.article.id+"."+displayTypes.SECOND);
            }
            else if(_articleOption.displayType == displayTypes.HTML) {
              closeArticle();
              showArticle(_articleOption.article.id, displayTypes.MEDIA, _articleOption.article.id+"."+displayTypes.HTML);
            }
          });
        }
        $previewMedia.appendTo($('#article-media-previews'));
    });
  }

  function _addImagePanZoom(img) {
    if (img.complete && img.naturalWidth !== 0) {
      initPanZoom(img);
    } else {
      img.addEventListener('load', () => initPanZoom(img));
    }
  }
  
  initPanZoom = (img) => {
    img.classList.add('panzoom-img');
    
    const container = img.parentElement;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const _scaleX = imgWidth / containerWidth;
    const _scaleY = imgHeight / containerHeight;
    const maxScale = Math.max(_scaleX, _scaleY).toFixed(2);
    
    const panzoom = Panzoom(img, {
        maxScale: maxScale,
        minScale: 1,
    });
    container.addEventListener('wheel', panzoom.zoomWithWheel, { passive: false });
  }

  function _addImagePan($imageContainer) {
    const $img = $imageContainer.find('img');
    let isDragging = false;
    let startX = 0, startY = 0;
    let currentX = 0, currentY = 0;

    function startDrag(x, y) {
      isDragging = true;
      startX = x - currentX;
      startY = y - currentY;
      $imageContainer.css('cursor', 'grabbing');

      $(window).on('mousemove.pan', function (e) {
        onDrag(e.clientX, e.clientY);
      }).on('mouseup.pan', stopDrag);
    }

    function onDrag(x, y) {
      if (!isDragging) return;
      let newX = x - startX;
      let newY = y - startY;

      const c = $imageContainer[0].getBoundingClientRect();
      const i = $img[0].getBoundingClientRect();

      const minX = Math.min(0, c.width - i.width);
      const maxX = 0;
      const minY = Math.min(0, c.height - i.height);
      const maxY = 0;

      currentX = Math.max(minX, Math.min(maxX, newX));
      currentY = Math.max(minY, Math.min(maxY, newY));

      $img.css('transform', `translate(${currentX}px, ${currentY}px)`);
    }

    function stopDrag() {
      isDragging = false;
      $imageContainer.css('cursor', 'grab');
      $(window).off('.pan');
    }

    $imageContainer.on('mousedown', function (e) {
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });

    $imageContainer.on('touchstart', function (e) {
      const touch = e.originalEvent.touches[0];
      startDrag(touch.clientX, touch.clientY);
    });

    $imageContainer.on('touchmove', function (e) {
      if (!isDragging) return;
      const touch = e.originalEvent.touches[0];
      onDrag(touch.clientX, touch.clientY);
    });

    $imageContainer.on('touchend touchcancel', function () {
      stopDrag();
    });
  }

  function isAnyArticleMediaPlaying() {
    $('.article-speech').each(function() {
      if (!this.paused && !this.ended) return true;
    });
    $('.article-video').each(function() {
      if (!this.paused && !this.ended) return true;
    });
    return false;
  }

  function adjustMediaThumbs(){
    if ($('#article-media-thumbs').is(':visible')) {
      const conL = $('#article-media-thumbs').width();
      const conH = $('#article-media-thumbs').height();
      const minNumSlides = Math.round(conL / conH);
      const numSlides = $('#article-media-thumbs .swiper-slide').length;
      const sliding = numSlides > (minNumSlides-1);

      thumbsSwiper.params.slidesPerView = minNumSlides-1;
      thumbsSwiper.params.allowTouchMove = sliding;

      if(!sliding) {
        $('#thumbsSwiper').css("width", "90%");
        $('#article-media-previews').css("justify-content", "center");
      }
      
      thumbsSwiper.update();
    }
  }

  window.CemiModalUtils = {
    init: init,
    isAnyArticleMediaPlaying: isAnyArticleMediaPlaying,
    adjustMediaThumbs: adjustMediaThumbs,
    loadContent: loadContent,
    closeAll: closeAll,
    closeArticle: closeArticle,
    closeLanguages: closeLanguages,
    closeTargets: closeTargets,
    showArticle: showArticle,
    showLanguages: showLanguages,
    showTargets: showTargets,
    showArgs: showArgs,
    showBibliography: showBibliography,
    showCredits: showCredits
  };

})(window);