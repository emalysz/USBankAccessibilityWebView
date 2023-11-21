$(document).ready(function () {
    /* Start - This is a temporary change and to be removed once Apply has implemented this change on their end */
     if(window.location.href.indexOf('?keyword=') > -1 ){
      var refURL=new URL(window.location.href);
      var key=refURL.searchParams.get('keyword');
      if ( key!= "" || key != null ||  key != undefined) {
       $.ajax({
       url:"/svt/usbank/ReferralBankingJapaneseServlet?keyword="+key,
       data:"", /*{keyword:${key}.val()},*/
       type: 'GET',
       datatype: 'json',
       success: function(data) {
         data = JSON.parse(JSON.stringify(data));
         if(data.expired === true){
             $(location).attr('href', "/content/usbank/splash/jp/referral-forms-expired.html");
         }
       },
       error: function (response) {
	    $(location).attr('href', "/content/usbank/splash/jp/referral-forms-expired.html");
       }
     });
     }
     }

 /*End - This is a temporary change and to be removed once Apply has implemented this change on their end */
  
 $("#manageCookies").prop("onclick", null).attr("onclick", null);
   $("#manageCookies")
   .on("click", function () {
       Modal("#cookiePopup", {
         entry_point: this,
         primaryAction: function (e) {
           document.getElementById('cookie-button').textContent = ("cookie banner is closed");
           const reg_match = /\d+$/;
           var inputs = modal.dialog.getElementsByClassName("input");
           let cats = {};
           for (var i = 0; i < inputs.length; i++) {
             var obj = inputs[i];
             cats[obj.id.match(reg_match)[0]] = obj.checked ? 1 : 0;
           }
           try {
             if (utag && utag.gdpr) {
               utag.gdpr.setPreferencesValues(cats);
             }
           } catch (e) {}
           modal.close();
         },
         secondaryAction: function (e) {
           modal.close();
         },
         tertiaryAction: function (e) {
           var href = e.target.value;
           var target = e.target.dataset.target
             ? e.target.dataset.target
             : "_blank";
           if (href == null || href == "") {
             modal.close();
           } else {
             setTimeout(function () {
               window.open(href, target);
             }, 500);
             modal.close();
           }
         },
       });
 
       var chBoxes = $(modal.dialog).find("input[type=checkbox]");
       try {
         if (utag && utag.gdpr) {
           var cookieValues = utag.gdpr.getCookieValues();
           if (cookieValues) {
             for (var obj in chBoxes) {
               cookieValues["c" + chBoxes[obj].id] == "1"
                 ? (chBoxes[obj].checked = true)
                 : (chBoxes[obj].checked = false);
             }
           }
         }
       } catch (e) {}
       chBoxes.on("keydown", function (e) {
         if (/(32|13)/.test(e.which)) {
           var checkmark = this.getAttribute("checked");
           var checked =
             checkmark == "checked" || checkmark == "true" || checkmark == true;
           if (checked) {
             this.removeAttribute("checked");
           } else {
             this.setAttribute("checked", "checked");
           }
         }
       });
     });


     /*Custom cookie modal code starts here*/

     function createCookie(name,value,days) {
      if (days) {
          var date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          var expires = "; expires="+date.toGMTString();
      }
      else var expires = "";
      document.cookie = name+"="+value+expires+"; path=/";
    }

    function getCookie(cname) {
      let name = cname + "=";
      let ca = document.cookie.split(';');
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }


    var modalDisplay = $("template").hasClass("customCookieModal");
    var editModeUrl = window.top.location.href;

    if (modalDisplay != '' && (editModeUrl.indexOf("editor.html"))==-1) {      
    let user = getCookie("cookiePolicyAccepted");
	var durationVar = $('#cookieDuration').html();
    if (user == "") {   
    Modal("#cookiePopup", {
      //** $ .on | .click => this | DomEl.addEventHandler => event.target
      entry_point: this,   
      closeAction: function(e) {        
      },
      primaryAction: function(e) {
        //e.preventDefault();
        //console.log('primary hi');
        createCookie("cookiePolicyAccepted", "true", durationVar);
        modal.close();
      }  

    });  
    $('.cookie-modal-hr').hide();
    $('.footer .cookie-modal-footer').css('flex-direction','row');
  }
  else if (user != "" && user != null) {
    createCookie("cookiePolicyAccepted", "true", durationVar);        
  }

   } 

   /*Custom cookie modal code ends here*/

 });

var speedBumpReader = speedBumpReader || {};
var testSpeedBump = false;
(function(){
  'use strict';

  var filters = {};
  var lists   = {};
  var urlgex  = /(http|https)\:(\/\/)([a-z0-9\-\.]+)/gi;

  speedBumpReader = {
    make: function() {
      usbUtils.selectNodes('.sb_domain').forEach( function(el){
        var key = Object.keys(el.dataset)[0];
        if(key && el.dataset[key]) {
          lists[key] = JSON.parse(el.dataset[key].trim());
          filters[key] = new RegExp (lists[key].join('|'));
        }
      });
      //add the local domain
      var domain = window.location.hostname.split('.').splice(-2).join('.');
      lists.domain = [domain];
      //provide default if not there yet
      if (lists.domain.indexOf('usbank.com')==-1) lists.domain.push('usbank.com');
      filters.domain = new RegExp( '('+lists.domain.join('|')+')$');

    },
    links: function() {
      return usbUtils.selectNodes('a[href^="https://"],a[href^="http://"], button[onclick^="javascript:window.open(\'http"]');
    },

    evaluate: function(link) {

      var url = link.nodeName=='A' && link.href   || ( typeof link.onclick=='function' && link.onclick.toString().match(urlgex)[0] ) || null;

      var firstpart   = url.replace(/(^https\:\/\/|^http\:\/\/)/,'').split('/')[0];
      var secure      = /(^https:\/\/)/.test(url);
      var indomain    = filters.domain.test(firstpart); 
      var considerin  = filters.whitelist && filters.whitelist.test(url) || false; 
      var considerout = filters.blacklist && filters.blacklist.test(url) || false; 

      var ffirstpart = firstpart.split('.').map(function(dp){ if(dp!='www') return dp;}).join('.');

      var subdomain   = indomain && !considerin && ffirstpart.split('.').length>2;

      var isExternal = (!indomain && !considerin ) || !secure || considerout || subdomain;

      return isExternal;

    },

    attach: function () {
      speedBumpReader.make();
      speedBumpReader.links().forEach(function (link) {

          var notdup   = !link.classList.contains('external-linked');
          if (notdup && speedBumpReader.evaluate(link)) {
            link.classList.add('external-linked');
            if(link.onclick) {
              link.linkmethod = link.onclick;
              link.onclick = null;
            } 
            link.dataset.entryPoint = link;
            usbUtils.listenTo(link,'click',speedBumpReader.activate)
          }

      });
    },

    activate: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var link = e.target.closest('button,a');
      Modal('#speedBump', {
        start_on_load: true,
        entry_point: link,
        primaryAction: function (e) {
          modal.close();
          if(link.href)
            usbUtils.targetedLinkOut(link.href, link.target);
          if(link.linkmethod)
            link.linkmethod(e);
        }
      });
    },
  }
})();

$(document).ready(function(){
  if(document.getElementById("#speedBump")){
    speedBumpReader.attach();
  }

});
var shield = shield || {modal: {}};
var Modals =  Modals || {};
var Modal  =  Modal || {};

var modal_options = modal_options ||{};
var template_settings = template_settings ||{};
var modal =  modal || null;

var ariaHides = [];

var isios = function(){return /(iphone|ipad)/.test(navigator.userAgent.toLowerCase());};
var ismobile = function(){return /(iphone|android|ipad)/.test(navigator.userAgent.toLowerCase());};
var isandroid = function() { return ismobile() && !isios();};
var isMsIE    = function() {return /(msie|trident)/.test(navigator.userAgent.toLowerCase());};
var isDesktop = function () { return !ismobile () && !isandroid(); };

shield.modal  = shield.modal || {};

/*
// HOW TO USE
example use case:

    Modal('#your_template_id',{
      entry_point: this, //**
      primaryAction: function(e) {
        modal.close();
      },
      secondaryAction: function(e) {
        alert('secondary hi');
      },
      tertiaryAction: function(e) {
        alert('tertiary hi');
      }
    });

    <or>

    Modal({
      //** $ .on | .click => this | DomEl.addEventHandler => event.target
      entry_point: this,

      heading: 'Your heading',
      body: 'body content which could include html string',
      firstButton: 'First Button',

      //optinal **
      secondButton: 'Second Button',

      //optional **
      thirdButton: 'Third Button',

      //optional **
      closeMessage: 'Close modal dialog',

      closeAction: function(e) {
        alert('close hi');
      },
      primaryAction: function(e) {
        alert('primary hi');
      },
      secondaryAction: function(e) {
        alert('secondary hi');
      },
      tertiaryAction: function(e) {
        alert('tertiary hi');
      }
    });

    . this results in the singleton global var modal
      .. default: modal gets hydrated from template on creation
      .. default: modal is to opened on instantiation
      .. build_on_start: false, option  can be used to delay modal while you set and then show
      ...modal.reuse({...template_options + actions}) to reuse same modal for some workflow
      .. you can access `modal` global from the console in dev tools once modal is created
      ** do not forget to pass in the entry_point from the link's call back where you create new Modal...

    . when you close
      .. modal is removed from DOM
      .. modal = null;

    . date-queue_seq: this attribute sets top level sequence
      .. these are given priority where other found focusable elements are inserted after data-queue_seq="0"

    . shield specification provides sequence of buttons as
        these
        0) close
        1) primary
        2) secondary
        3) tertiary

*/



( function () {
  'use strict';

  modal_options = {
    first_element: 0,
    button_handlers: true,
    build_on_start: true,
    open_on_start: true,
    namespace: 'shield-modals',
    entry_point: null,
    entry_id: null,
    tid: null,
    // close_selector: 'button.close',
    closeAction: null, //function() {console.log('closeAction not assigned...');},
    tertiaryAction: function() {console.log('Tertiary Action not assigned...');},
    primaryAction: function() {console.log('Primary Action not assigned...');},
    secondaryAction: function() {console.log('Secondary Action not assigned...');},
  };

  template_settings = {
    heading: 'not_set',
    body: 'not set',
    firstButton: 'not set',
    secondButton: null,
    thirdButton: null,
    closeMessage: 'Close modal dialog'
  };

  /*________________________________________ Static Singleto*/
  Modals = {
    trap: function(ke) {
      var allowed =
          /(TEXTAREA|INPUT)/.test(ke.target.tagName) || /(27|13|38|40|37|39|32)/.test(ke.keyCode);

      if ( allowed == false ) {
        ke.preventDefault();
        ke.stopImmediatePropagation();
      }
    },


    fetchArray: function (list) {
      if (list && list.length) {
        return Array.from ? Array.from(list) : Array.prototype.slice.call(list);
      }
      return [];

    },

    isFocusable:  function(el) {
      var isFE    = el.nodeName && /\b(button|a|input|textarea|select)\b/.test(el.nodeName.toLowerCase());
      var tab     = el.getAttribute && parseInt(el.getAttribute('tabindex'));
      var canTab  = (tab && tab>1) || false;
      var blocked = (el.style && el.style.display && el.style.display=='none') || el.disabled && el.disabled==true;
      var canadd  = !blocked && (isFE || ( ! isFE && canTab) );
      return canadd;
    },

    sequence : function (obj, callback) {

      var list = obj.list;

      if (!list) return false;

      var order = {};
      var seq = [];

      for (var i in list) {
        var el = list[i];
        if (el.dataset && el.dataset.queue_seq && ! el.disabled) {
          var item = parseInt(el.dataset.queue_seq);
          order[item] = el;
        } else {
          order[parseInt(i)+1] = el;
        }
      }
      Object.keys(order).forEach((key) => {
        return seq.push(order[key]);
      });

      obj.list = seq;

      if (typeof callback == 'function') callback();

      return seq;

    },

    jump_start: function (options) {
      shield.modal = Modal(options);
    },

    attach: function () {

      $('.'+modal_options.namespace+':not(".wait,.modal_linked")').each(function (el) {
        var ref = $(this).attr('id');
        var links = $('a[href="' + ref + '"], button[data-click="'+ref+'"],button[onclick="javascript:window.open(\''+ref+'\', \'_self\');"]');
        for (var _i=0; _i<links.length; _i++) {
          var link = links[_i];

          if ( !$(link).hasClass('modal_linked') && link.nodeType == 1 ) {
            $(link).addClass('modal_linked');
            Modals.trapAttachEvents(link);
            $(link).on('click mousedown', function (e) {
              //return if its not anchor or buttons
              if (!this.href && this.type !== "button") return false;
              if(/(click|mousedown)/.test(e.type) ) {
                e.preventDefault();
                e.stopImmediatePropagation();
              }
              modal_options.build_on_start = true;

              var code;
              if(this.href){
                //clean up inserted explicit refs
                this.href.replace(document.location.pathname, '');
				code = this.href ? this.href.split('#')[1]: null;
              } else if(this.type === "button"){
				//getting target link from the button onlcik attribute
				code = $(this).attr("onclick").split(/['"]/).filter(
							function(str) {
								return str.indexOf('#') > -1;
							});
                  code = code.length > 0 ? code[0] : code;
                  if(code && code.indexOf("#") !== -1){
                      code = code.split("#")[1];
                  }
              }

              var tid  = '#' + code;
              var did  = code + '_' + (new Date().getTime());

              this.setAttribute('id', did);

              modal_options.entry_point = this;
              modal_options.entry_id    = did;
              modal_options.tid         = tid;

              shield.modal = Modal(tid, modal_options);

            });
          }
        }

      });

      $('.shield-modals.wait').each(function (el) {
        document.querySelector('body').dispatchEvent(new CustomEvent('modals_load'));
      });


    },

    trapAttachEvents: function(link) {
      $(link).on('keydown mousedown keyup tap', function(e){
        var block = !e.keyCode || /(9|13|32)/.test(e.keyCode)===false;
        if (block) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
    },

    /**
     * Recursive parse for all elements that can
     * have focus in the modal
     *
     * @param {HTMLElement} el
     * @param {Modal} modal
     */
    parseForFocusable : function(el) {
      for (var index in el.childNodes) {
        var child   = el.childNodes[index];
        var oftype  = el.nodeType === 1;

        var blocked = /(modal-guard-top|modal-guard-bottom)/.test(child.className);
        var exclude = child.nodeName && /(svg|label|path| circle|ellipse)/.test(child.nodeName);
        var next    = child.nextSibling && child.nextSibling.nodeType == 1;

        var canadd  = ! exclude && ! blocked && oftype;


        if(exclude) continue;
        if(child.stored) continue;


        if ( canadd ) {
          this.tryAddElement(child);
        }

        if (child.childNodes && child.childNodes.length > 0) {

          for (var i in child.childNodes) {
            if (canadd && child.childNodes[i].nodeType===1) {
              this.parseForFocusable(child.childNodes[i]);
            }
          }

        }

        if ( canadd && next ) {
          this.parseForFocusable(child.nextSibling);
        }
      }
    },

    tryAddElement: function(el) {
      if (Modals.isFocusable(el) && !el.stored ) {
        modal.list.push(el);
        el.stored = true;
      }
    },


    // @Return string :HTMLString
    template: function(params)  {

      var settings = Object.assign(template_settings, params);

      var closeMessage = params.closeMessage ? params.closeMessage : 'close ' + settings.heading ;

      var tempt = {
        dialog_start:  '<dialog open class="dialog" role="dialog" >',
        content_start: '<div class="content">',
          close_button:
            '<button type="button" class="close" data-dismiss="modal" data-queue_seq="0">'
              +'<span class="text sr-only">'+closeMessage+'</span>'
              +'<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" data-name="Outline" viewBox="0 0 20 20">'
                +'<path d="M14 7l-3 3 3 3-1 1-3-3-3 3-1-1 3-3-3-3 1-1 3 3 3-3zm5.22 3A9.25 9.25 0 1 1 10 .75 9.26 9.26 0 0 1 19.25 10zm-1.5 0A7.75 7.75 0 1 0 10 17.75 7.76 7.76 0 0 0 17.75 10z" />'
              +'</svg>'
            +'</button>',

          heading: '<div class="heading large"><h2>'+settings.heading+'</h2></div>',
          body: '<div class="body">'+settings.body+'</div>',

          footer_start:'<div class="footer"><div class="button-container">',
            buttons_start: '<div class="buttons">',
              primary_button:
                '<button class="primary" data-queue_seq="1" data-action="direct">'
                + settings.firstButton
                +'</button>',
              secondary_button:
                '<button class="secondary" data-queue_seq="2" data-action="direct">'
                + settings.secondButton
                +'</button>',
            buttons_end: '</div>',
              tertiary_button:
                '<button class="tertiary" data-queue_seq="3" data-action="direct">'
                + settings.thirdButton
                +'</button>',
          footer_end: '</div></div>',
        content_end: '</div>',
        dialog_end: '</dialog>',
      };
      if(null===settings.secondButton)
        delete tempt.secondary_button;

      if(null===settings.thirdButton)
        tempt.tertiary_button = '<div class="tertiary" data-action="spacer" role="none"></div>';


      if(settings)

      return Object.keys(tempt).map(function(k) {return tempt[k];}).join(' ');
    }


  };


  /*________________________________________ Constructor  */
  /*
    Entry points:
      .link with href #templateId
      .call with obj.link , obj.tid {link: ... , tid: ....}
  */
  Modal = function (connect, options) {

    //// ** there should only be one...
    var modalCN = '.'+modal_options.namespace +'.background';
    var existing = document.querySelectorAll(modalCN);
    for(var zap in existing) {
      var zzap = existing[zap];
      if(zzap && zzap.nodeType===1) zzap.remove();
    }

    // tid =  template-id : either it is in link with object key of tid
    var tid  = connect && typeof connect.tid  !== 'undefined' ? connect.tid
      : (connect && typeof connect.href !=='undefined' ? connect.href: connect);
      // prevent another modal from overlapping

    if ( typeof connect !=='string' && typeof connect === 'object'){
      options = connect;
      tid = 'default_internal';
    }

    var bodyid = tid ?tid.concat('_modal_container') : 'default_modal_container';

    options = typeof options == 'object'
        ? Object.assign(modal_options, options)
        : modal_options;

    // will pick out any template setting that might be needed for tid==null
    template_settings = Object.assign(template_settings, options);

    modal = {
      tid: tid,
      bodyId: bodyid,
      buttonHandlers: options.button_handlers,
      options: options,
      entry_point: options.entry_point ? options.entry_point : null,
      current: 0,
      component: null,
      dialog:  null,
      list: [],
      swipe: null,
    };

    //public methods
    modal.close    = close;
    modal.first    = setFirst;
    modal.last     = setLast;
    modal.build    = build;
    modal.open     = open;
    modal.scroller = scroller;
    modal.setSwipe = setSwipe;

    modal.reuseModal    = reuseModal;
    modal.cloneTemplate = cloneTemplate;
    modal.buttonHandler = buttonHandlers;
    modal.slideDialog   = slideDialog;

    modal.closeButton   = null;
    modal.background    = null;
    modal.setPrimaryAction = primaryAction;
    modal.setSecondaryAction = secondaryAction;
    modal.setTertiaryAction  = tiertiaryAction;


    // set component and dialg if modal has been built on start
    if(options.build_on_start ) build(tid);

    //provide event to attach to for other dependent components
    var modalEvent  = new CustomEvent('modals_start');
    document.querySelector('body').dispatchEvent(modalEvent);


    // completes constructor and returns the new singleton global modal object
    // @note this modal global is also attached to window
    return modal;

  /*________________________________________ INSTANCE */
    // START of modal instance
    // Modal Private and methods public ones are provided thru the public methods part of the constructor

    function ariaHide() {
      var selectable = [];
      var toplevel = document.querySelectorAll('body >*:not(script)');
      var controls = document.querySelectorAll('button, input, select, textarea');
      var tabs     = document.querySelectorAll('[tabindex]');
      if(toplevel.length) selectable = selectable.concat(Modals.fetchArray(toplevel));
      if(controls.length) selectable = selectable.concat(Modals.fetchArray(controls));
      if(tabs.length)     selectable = selectable.concat(Modals.fetchArray(tabs));

      if (selectable.length) {
        for (var _i in selectable) {
          var el = selectable[_i];
          var switchable = el.nodeType == 1;
          if (switchable) {
            if (!el.getAttribute('aria-hidden')) {
              var tab = el.getAttribute && el.getAttribute('tabindex');
              var inModal = modal && modal.body ? modal.dialog.contains(el) : false;
              if(!inModal){
                el.setAttribute('aria-hidden', 'true');
                el.tabindexes = tab || null;
                el.setAttribute('tabindex', '-1');
                ariaHides.push(el);
              }
            }
          }
        }
      }
    }

    function ariaUnHide() {
      for (var _i in ariaHides) {
        var hidden = ariaHides[_i];
        // hidden.removeAttribute('aria-hidden');
        if(hidden.tabindexes)
          hidden.setAttribute('tabindex', hidden.tabindexes);
        else
          hidden.removeAttribute('tabindex');

        hidden.removeAttribute('aria-hidden');
      }
    }

    function primaryAction (action) {
      modal_options.primaryAction = action;
    }

    function secondaryAction (action) {
      modal_options.secondaryAction = action;
    }

    function tiertiaryAction (action) {
      modal_options.tertiaryAction= action;
    }

    function reuseModal (settings) {
      var skeys   = Object.keys(settings);
      var texts   = ['heading','body','firstButton','secondButton','thirdButton'];
      var actions = ['primaryAction', 'secondaryAction','tertiaryAction','closeAction'];
      var action  = null;
      var xref    = {
        primaryAction: modal.firstButton,
        secondaryAction: modal.secondButton,
        tertiaryAction: modal.thirdButton,
      };

      // var form    = modal.form && modal.form.cloneNode(true);

      slideDialog('up');

      //console.log('ModalUtils.reuseModal', settings);

      // actions can be directly to modal_options
      for (var _k in actions) {
        action = actions[_k];
        if (skeys.includes(action) && settings[action])  {
          modal_options[action] = settings[action];
        } else {
          var toremove = modal.list.indexOf(xref[action]);
          if(toremove>-1) delete modal.list[toremove];
        }
      }

      for ( var _w in texts ) {

        var tkey = texts[_w];

        if(skeys.includes(tkey)) {

          var node = modal[tkey];
          if(node) {
            if(null === settings[tkey] ) {
              node.style.display = 'none';
            } else {
              var dex = modal.list.indexOf(xref[action]);
              if (node.style.display)
                node.style.display = 'block';

              if(node.nodeName=='DIV') {
                node.innerHTML = settings[tkey];
              } else {
                if(node.nodeName=='BUTTON' && window.location.href.indexOf("/es") > -1) {
                  var enContent = settings[tkey]+' <span class="lang-badge"><span class="sr-only">&nbsp;solo en inglés</span><span aria-hidden="true">EN</span></span>';
                  node.innerHTML = enContent;
                }else{
                  node.textContent = settings[tkey];
                }
                
              }
            }
          }

        }
      }


      if(modal.form)  {
        modal.body.appendChild(modal.form);
      }

      if(!activeModal())
        modal.open();

      else
        setTimeout(modal.open, 1000);

    }


    // private methods
    function setFirst() {
      modal.current = 0;
      modal.dialog.style.visibility = 'visible';

      setSwipe();
      lockScreen();
      // delayed set again for something that has been cancelling this
      setTimeout(lockScreen, 500);

      var tap = function () {
        if (modal) {
          if (modal.list && modal.list.length)
            modal.list[0].setAttribute('tabindex', 0);
    	  modal.closeButton.focus();
          slideDialog('down');
          setTimeout(unlockModal, 1000);
        }
      };

      if(isios()){
        setTimeout(tap, 1000);
        setTimeout(function(){ if (modal && modal.dialog) modal.dialog.removeAttribute('role');},1500);
      } else if (isDesktop()) {
        setTimeout(tap, 80);
      } else if (isandroid() ) {
        setTimeout(tap, 1000);
      }


    }

    //@DEPRECATE in next version, March 2021
    function update (dir) {
      var next = parseFloat(dir) + parseFloat(modal.current);
      var end  = modal.list.length - 1;

      //
      if (next > -1 && next <= end)
        modal.current = next;

      if (next < 0 )
        modal.current = end;

      if (next > end)
        modal.current = 0;

      modal.list[modal.current].focus();

    }

    function setLast() {
      modal.current = modal.list.length-1;
      modal.list[modal.list.length -1].focus();
    }

    function activeModal() {
      var docBody = document.querySelector('body');
      if (modal)
        return docBody.contains(modal.background);
      return false;
    }

    function getCookie(key){
        var result;
        return result = (new RegExp((key || '=')+'=(.*?); ','gm').exec(document.cookie+'; ') || ['',null])[1] || '';
    }

    function cookieExist(element){
      let innerContent = modal.optOutMsg.querySelector('.optOutConfirmationMsg').innerHTML;
      element.closest('dialog').querySelector('.body').innerHTML = innerContent;
      element.setAttribute('disabled',true);
      element.setAttribute('class','disable');      
    }

    

    function modalDialogButton(){
      let srval = "solo en inglés";
      var languageIndicatorEN = "<span class='lang-badge blue'><span class='sr-only'>" +srval + "</span><span aria-hidden='true'>EN</span></span>";
      var windowPageUrl =  window.location.pathname;
        if(windowPageUrl.match("/es/") !='' && windowPageUrl.match("/es/") != null){
            if(modal.dialog){
                var ModalButtons = modal.dialog.querySelectorAll("button[data-action='link']");
                if(modal.component.id =='#speedBump_modal_container'){
                  let speedBumpModel = modal.dialog.querySelector("button.primary");
                  speedBumpModel.innerHTML +=languageIndicatorEN;
                }

                if(ModalButtons){
                    ModalButtons.forEach(element => {
                        if(element.dataset.link !='' && element.dataset.link !=undefined  && element.dataset.link !=null && element.dataset.link.includes("/es") == false){
                            element.innerHTML +=languageIndicatorEN;
                        }
                    });
                }
            }
        }
    }

    function slideDialog(dir) {
      if(modal.optOutMsg) modal.optOutMsg.style.display='none';
      if(dir=='up') {
        modal.dialog.classList.remove('in');
        modal.dialog.classList.add('up');
        modal.dialog.removeAttribute('open');
        modal.heading.style.opacity=0;
        modal.body.style.opacity=0;
      } else {
        modal.dialog.classList.remove('up');
        modal.dialog.classList.add('in');
        modal.dialog.setAttribute('open', true);
        modal.heading.style.opacity=1;
        modal.body.style.opacity=1;
        if(getCookie('privacy_optout') !=''){ 
          if(modal.firstButton && modal.firstButton.getAttribute('data-optout') == "true") cookieExist(modal.firstButton);
          if(modal.secondButton && modal.secondButton.getAttribute('data-optout') == "true") cookieExist(modal.secondButton);
        }
        modalDialogButton();


      }
    }

    function open () {

      if ( modal ) {
        if ( ! activeModal() ) {
          ariaHide();
          lockModal();
          document.body.appendChild(modal.background);
          buttonHandlers();
          listen();
        }

        modal.list   = modal.list && modal.list.length ?modal.list : [];
        Modals.parseForFocusable( modal.dialog);
        Modals.sequence(modal, setFirst);

      }
    }

    function lockScreen () {
      document.body.classList.add('modal-lock');
    }

    function unlockScreen () {
      document.body.classList.remove('modal-lock');
    }

    function lockModal () {
      if(modal) {
        modal.body.setAttribute('aria-hidden', 'true');
        modal.heading.setAttribute('aria-hidden', 'true');
        modal.firstButton.setAttribute('aria-hidden', 'true');
        if(modal.secondButton)
          modal.secondButton.setAttribute('aria-hidden', 'true');
        if(modal.thirdButton)
          modal.thirdButton.setAttribute('aria-hidden', 'true');
      }
    }

    function unlockModal () {
      if(modal) {
        modal.body.removeAttribute('aria-hidden');
        modal.firstButton.removeAttribute('aria-hidden');
        modal.heading.removeAttribute('aria-hidden');
        if(modal.secondButton)
          modal.secondButton.removeAttribute('aria-hidden');
        if(modal.thirdButton)
          modal.thirdButton.removeAttribute('aria-hidden');

      }
    }

    function setSwipe () {

      if (modal) {
        try {

          modal.swipe = new Motion(modal.background, { trap: false});

          modal.swipe.on('swipe', function (dir) {
            if (modal == null) return;
            if (dir.horizontal == 'left') update(-1);
            if (dir.horizontal == 'right') update(1);
            return true;
          });
        } catch(e){}
      }

    }

    function build (tid) {
      //clean copy with base handlers
      cloneTemplate(tid);
      if (modal_options.open_on_start)
        return open();
    }

    function cloneTemplate (tid) {

      var html;

      var template = document.getElementById(tid);

      var panel = document.createElement('div');
      var id    = tid + '_modal_container';

      panel.className = modal_options.namespace +' background';
      panel.id        = id;

      modal.background = panel;

      if( !template) {
        panel.innerHTML = Modals.template(template_settings);
     } else if(template.nodeName==='TEMPLATE') {
        html = template.content.cloneNode(true);
        panel.appendChild(document.importNode(html,true));
      } else if(template.nodeName==='SCRIPT') {
        panel.innerHTML = template.innerHTML;
      } else {
        panel.innerHTML = Modal.template(template_settings);
      }

      if(isios()) {
        guardRails(panel);
        listenTo(window, 'resize', guardRails);
      }

      modal_options.template  = template;
      modal_options.last_modal = panel;

      modal.dialog  = panel.querySelector('dialog');
      modal.heading = panel.querySelector('.heading *') || panel.querySelector('.heading');
      modal.optOutMsg    = panel.querySelector('.optOutMsg');
      modal.body    = panel.querySelector('.body');
      modal.footer  = panel.querySelector('.footer');
      modal.form    = panel.querySelector('.body form');
      modal.closeButton  = panel.querySelector('button.close');
      modal.firstButton  = panel.querySelector('button.primary');
      modal.secondButton = panel.querySelector('button.secondary');
      modal.thirdButton  = panel.querySelector('button.tertiary');
      modal.dialog.modal = modal;
      modal.component    = panel;

      modal.dialog.removeAttribute('open');
      modal.dialog.setAttribute('tabindex', '-1');
      modal.closeButton.setAttribute('aria-label', 'Close');

      return panel;
    }

    function keys (ke) {
      var entry_mode  = /(TEXTAREA|INPUT)/.test(ke.target.tagName);
      var out_mode    = /(13|32)/.test(ke.keyCode);
      var shifted     = isMsIE() ? ke.shiftKey===true : ke.shiftKey;

      ke.preventDefault();
      ke.stopImmediatePropagation();

      switch (ke.keyCode) {
        // case 'Escape':
        case 27:
          if(modal && modal.close) modal.close();
          break;

        // case 'Space':
        case 32:
          return true;


        // case 'ArrowDown':
        case 40:
          if(entry_mode)
            return true;

          update(1);
          break;

        // case 'ArrowRight':
        case 39:
          update(1);
          break;

        // case 'ArrowUp':
        case 38:
          if(entry_mode)
            return true;
          update(-1);
          break;

        // case 'ArrowLeft':
        case 37:
          update(-1);
          break;

        case 13:
          if(entry_mode)
            return modal_options.primaryAction(ke);

          break;

        case 9:
          update(shifted ? -1 : 1);
          break;
      }

      if (entry_mode || out_mode) return true;
    }

    function close (e) {

      if(modal_options.closeAction) {
        modal_options.closeAction(e);
      }

      ariaUnHide();

      modal_options.open_on_start=true;

      if ( modal ) {

        slideDialog('up');
        if (modal.swipe) modal.swipe.destroy();

        disconnect();

        var point =  modal.entry_point || document.querySelector('body nav') || document.querySelector('body');

        unlockScreen();

        //step into link seems to be only thing that works
        if(isDesktop()) {
          setTimeout(function(){
            clearModal();
            point.setAttribute('tabindex', 0);
            setTimeout(function(){
              point.focus();
            },800);
          }, 800);
        } else if(isios()) {
          setTimeout(function(){
            document.querySelector('body').focus();
          }, 500);
          setTimeout(function(){
            clearModal();
            unlockScreen();            
            point.focus();
          }, 1000);
        } else {
          setTimeout(function(){
            clearModal();
            unlockScreen();
            point.focus();
          }, 1000);
        }

      }

    }

    function clearModal () {
      if(modal && modal.component) {
        modal.component.remove();
        modal = null;
      } else {
        if(modal_options.last_modal) {
          modal_options.last_modal.style.display='none';
          modal_options.last_modal.remove();
        }
      }
    }

    function listenTo (node, evt, handler) {
      if(node.attachEvent)
        node.attachEvent('on'+evt, handler);
      else
        node.addEventListener (evt, handler, false);
    }

    function listen () {
      if ( !window.modal_listening) {
        $(window).unbind('keyup');
        listenTo(window,'keyup', keys);
        listenTo(window,'resize', scroller);
        listenTo(window,'keydown', Modals.trap);
        window.modal_listening = true;
      }
    }

    function detach(node,evt, handler) {
      if(node.detachEvent)
        node.detachEvent('on'+evt, handler);
      else
        node.removeEventListener (evt, handler, false);
    }

    function disconnect () {
      detach(window,'keyup', keys);
      detach(window,'keydown', Modals.trap);
      detach(window,'resize',scroller);
      detach(window,'resize',guardRails);
      window.modal_listening = null;
    }

    function scroller () {
      if (modal) {

        modal.body.style.height = '100%';
        modal.body.removeAttribute('style');

        var bodyTop   = parseFloat(modal.body.getBoundingClientRect().y);
        var footerTop = parseFloat(modal.footer.getBoundingClientRect().y);
        var bodyHeight = footerTop - bodyTop;

        if ( modal.body.clientHeight > bodyHeight ) {
          modal.body.style.height = bodyHeight.toString().concat('px');
        }

      }
    }

    function guardRails(panel) {

      var dialog  = panel.querySelector('dialog');
      if( !dialog.dataset.guardRails) {

        var close   = panel.querySelector('button.close');
        var primary = panel.querySelector('button.primary');

        var guardrail_top = document.createElement('button');
        var guardrail_bottom = document.createElement('button');

        guardrail_top.className = 'modal-guard-top';
        guardrail_bottom.className = 'modal-guard-bottom';

        if (isandroid()) {
          guardrail_top.innerText = 'top of modal';
          guardrail_bottom.innerText = 'bottom of modal';
        }

        listenTo(guardrail_top, 'focus', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          primary.focus();
        });

        listenTo(guardrail_bottom, 'focus', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          close.focus();
        });

        dialog.dataset.guardRails = true;

        dialog.insertBefore(guardrail_top, dialog.childNodes[0]);
        dialog.appendChild(guardrail_bottom);

      }
    }

    /**
     * supports dataset.link and dataset.target on e.target actions button 
     * @param {*} e 
     * @NOTE moved into usbUtils.targetedLinkOut(link, target) : leave commented here until next release
     */
    // function redirectLink(e) {
    //   var link   = e.target.dataset.link;
    //   var target = e.target.dataset.target;
    //   var href   = /^(http:)|(https:)/.test(link) 
    //     ? link : location.protocol + '//' + location.host + link;

    //   var redirect = usbUtils.createElement('a',{href: href, target: target || '_self'});
    //   document.body.appendChild(redirect);
    //   redirect.click();
    // }

    function buttonActions (e, action) {
        var override = modal_options[action];
        switch (e.target.dataset.action) {
          case 'link':

            if (e.target.dataset.link) {
              usbUtils.targetedLinkOut(e.target.dataset.link, e.target.dataset.target);
            } else {
              modal.close();
            }
            break;

          case 'direct':
          default:

            if (e.target.dataset.link) {
              usbUtils.targetedLinkOut(e.target.dataset.link, e.target.dataset.target);
            } else if (typeof override == 'function') {
              modal_options[action](e);
            } else {
              modal.close();
            }

        }
    }

    function optOutCookieSetUp(targetEl){
          var url = document.domain.split(".");
          var domain = "."+url[url.length-2]+"."+url[url.length-1];
          document.cookie = "privacy_optout=1; path=/; domain ="+domain+"; expires=Thu, 31 Dec 2099 12:00:00 UTC; ";
          
          let innerContent = modal.optOutMsg.querySelector('.optOutThankYouMsg').innerHTML;
          targetEl.closest('dialog').querySelector('.body').innerHTML = innerContent; 
          targetEl.setAttribute('disabled',true);
          targetEl.setAttribute('class','disable');
            try{
              window.dispatchEvent(new CustomEvent('privacy_optout'));
            }catch(err){
              var event = document.createEvent('Event');
              event.initEvent('privacy_optout',true,true);
              window.dispatchEvent(event);
            }
    }



    function buttonHandlers () {

      setTimeout(scroller, 1000);

      listenTo(modal.closeButton, 'click', function(e){
        modal.close();
      });

      listenTo(modal.firstButton, 'click', function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        
        if(e.target.getAttribute('data-optout') == "true"){ 
          optOutCookieSetUp(e.target);
        }else{
          buttonActions(e, 'primaryAction');
        }

      });


      if ( modal.secondButton ) {
        listenTo(modal.secondButton, 'click', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          if(e.target.getAttribute('data-optout') == "true"){ 
            optOutCookieSetUp(e.target);
          }else{
            buttonActions(e, 'secondaryAction');
          }
          
        });

      }

      if ( modal.thirdButton) {
        listenTo(modal.thirdButton, 'click', function(e){
          e.preventDefault();
          e.stopImmediatePropagation();
          buttonActions(e, 'tertiaryAction');
        });
      }

    }
  };

} () );

$(document).ready(function () {
  Modals.attach();
});


var Motions = Motions || {};
var Motion  = Motion  || function() {console.log('Motion not instantiated yet');};
var motion  = motion || {};

var motion_options = motion_options || {};

(function () {
  'use strict';

  motion_options = {
    tolerance: 25,
    trap: false,
    trapFor: [],
  };
  // statics
  Motions = {
    touches: function (e) {
      // console.log('Movement touches', e);
      return e.touches || e.originalEvent.touches;
      // ? safari fallback ?
      // e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]
    },
    coord: function (e) {
      var _touch = Motions.touches(e)[0];
      return {x: _touch.clientX, y: _touch.clientY}
    },
  };

  // instance
  Motion = function ( el_name, options ) {

    var el = typeof el_name == 'string'
      ? document.querySelector(el_name)
      : el_name;

    var timeout = null;

    motion = {
      el: el,
      options: Object.assign(motion_options, options),
      listeners: [],
      callback: null,
      start: null,
      direction: {horizontal: 'none', vertical: 'none'},
      destroy: destroy
    }

    motion.on = function (event_name, _function ) {
      switch (event_name) {
        case 'swipe':
          motion.listeners.push(event_name);
          motion.callback = _function;
          return swipe(motion.el, _function);

      }

    }

    return motion;

    function destroy () {
      if (motion && motion.listeners) {
        for( var _i in motion.listeners) {
          var ename = motion.listeners[_i];
          switch(ename) {
            case 'swipe':
              motion.el.removeEventListener('touchstart', handle_start, true);
              motion.el.removeEventListener('touchmove', movement, {passive: false});
              motion.el.removeEventListener('touchmove', endSwipe, true);

              motion = null;
              break;
          }
        }
      }
    }

    function swipe (el, _function ) {
      // console.log('Movement adding handlers: touchstart and touchmove ');
      motion.el.addEventListener('touchstart', handle_start, true);
      motion.el.addEventListener('touchmove', movement, {passive: false});
      motion.el.addEventListener('touchmove', function(){endSwipe(_function)}, true);
    }

    function handle_start (e) {
      motion.start = Motions.coord(e);
    }

    function endSwipe (_function) {
      // console.log('endSwipe timeout', timeout);

      if (timeout !==null ) {
        window.clearTimeout(timeout);
        timeout = null;
      }

      timeout = window.setTimeout(function () {
        return _function(motion.direction);
      }, 250);

    }

    function movement (e) {
      if (motion.options.trap) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
      if ( !motion.start) return;

      var dir      = {horizontal: 'none', vertical: 'none'};
      var _current = Motions.coord(e);

      var _xmove = _current.x - motion.start.x;
      var _ymove = _current.y - motion.start.y;

      var _sigx = Math.abs(_xmove) - motion.options.tolerance > 0;
      var _sigy = Math.abs(_ymove) - motion.options.tolerance > 0;

      if (_sigx) dir.horizontal = _xmove > 0 ? 'right' : 'left';
      if (_sigy) dir.vertical   = _ymove > 0 ? 'down' : 'up';

      if (motion.options.trapFor.length > 0) {
        var trap_vert  = motion.options.idexOf('vertical') > -1;
        var trap_horiz = motion.options.idexOf('horizontal') > -1;
        if (dir.vertical != 'none' && trap_vert) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        if (dir.horizontal != 'none' && trap_horiz ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }

      motion.direction = dir;

    }
  };
})();
/*
Styled Content Block JS.
*/
$(document).ready(function() {
    function resize() {
		if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
            $(".scb-image").each(function() {
                var imgSrc = $(this).attr('src');
                $(this).attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                $(this).css("background-image", "url(" + imgSrc + ")");
            });
		}
    }
    $(window).on("resize", resize);
    resize();

    usbUtils.arrowLinkLastWordInIcon('.styledContentBlock .arrow-link a');
});
(function fetchCreditCardRates() {
    'use strict';

    function referenceFoundFor(targetElement) {
        return Boolean(targetElement !== null && typeof targetElement !== 'undefined');
    }

    function referenceFoundForAll(targetElements) {
        return Boolean(targetElements.length > 0 && referenceFoundFor(targetElements));
    }

    function getResponse(url, ratetextcontainers) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                populateRateData(ratetextcontainers, JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function populateRateData(ratetextcontainers, response) {
        ratetextcontainers.forEach(function(ratetextcontainer, index) {
            if (ratetextcontainer.hasAttribute('data-offerid')) {
                var responseObj = response[index];
                var cardOfferId = ratetextcontainer.getAttribute('data-offerid');
                if (responseObj.map.requestData !== undefined) {
                    var responseOfferId = responseObj.map.requestData.map.OfferID;
                    if (cardOfferId == responseOfferId && responseObj.map.responseData.map.Offers !== undefined) {
                        var responseData = responseObj.map.responseData.map.Offers.myArrayList[0].map.productDetailData.map;
                        var apikeys = usbUtils.nodeListArray(ratetextcontainer.querySelectorAll('.apiKey'));
                        if (referenceFoundForAll(apikeys)) {
                            apikeys.forEach(function(apiKey) {
                                var spanText = apiKey.textContent;
                                var classKey = apiKey.getAttribute('class');
                                var noLinkFlag = classKey.search('noRates');
                                var minAPRFlag = classKey.search('calculatedMinAPR');
                                var maxAPRFlag = classKey.search('calculatedMaxAPR');
                                var annualFeeAmountFlag = classKey.search('annualFeeAmount');
                                var introCashAdvanceMaxRateFlag = classKey.search('introCashAdvanceMaxRate');
                                var lastWord = classKey.split("-").pop();
                                var apiKeyNode = noLinkFlag > 0 ? apiKey : apiKey.parentNode;
                                var apiValue, responseApiVal;
                                var minAPRValue = "",
                                    maxAPRValue = "";
                                if (minAPRFlag > 0 || maxAPRFlag > 0) {
                                    minAPRValue = minAPRFlag > 0 ? parseFloat(responseData.calculatedMinAPR) : '';
                                    maxAPRValue = maxAPRFlag > 0 ? parseFloat(responseData.calculatedMaxAPR) : '';
                                    if ((minAPRValue.toString()).length > 0 && (maxAPRValue.toString()).length > 0) {
                                        if(minAPRValue === maxAPRValue){
                                            responseApiVal = maxAPRValue + "%";
                                        } else {
                                            responseApiVal = minAPRValue + "%" + " - " + maxAPRValue + "%";
                                            apiKeyNode.setAttribute("aria-label", minAPRValue + "%" + " to " + maxAPRValue + "%");
                                        }
                                    } else { //if only one flag exist
                                        responseApiVal = parseFloat(responseData[lastWord]) + "%";
                                    }
                                    apiValue = responseApiVal;
                                } 
                                else if(introCashAdvanceMaxRateFlag > 0) {
                                    responseApiVal =  parseFloat(responseData.productVariableData.myArrayList[0].map[lastWord]) + "%";
                                    apiValue = responseApiVal;
                                } else {
                                    responseApiVal = annualFeeAmountFlag > 0 ? responseData.productVariableData.myArrayList[0].map.riskTierInformation.myArrayList[0].map.annualFeeInformation.map[lastWord] :
                                        responseData.productVariableData.myArrayList[0].map[lastWord];
                                    apiValue = spanText.indexOf("$") >= 0 ? spanText + parseInt(responseApiVal) : parseInt(responseApiVal) + spanText;
                                }
                                apiKeyNode.textContent = apiValue;
                                if(apiKeyNode.classList.contains("apiKey")) apiKeyNode.removeAttribute("class");
                            });
                        }
                    }
                }
            }
        });
    }

    function DOMContentLoaded() {
        var ratetextcontainers = usbUtils.nodeListArray(document.querySelectorAll('.styledContentBlock[data-offerid]'));
        if (referenceFoundForAll(ratetextcontainers)) {
            var reqData = "";
            var count = 0;
            var requestcount = 0;
            var containers = [];
            var blockwithrates = ratetextcontainers.length;
            var num = Math.floor(blockwithrates / 5);
            ratetextcontainers.forEach(function(ratetextcontainer, index) {
                if (ratetextcontainer.hasAttribute('data-offerid')) {
                    var reqStr =
                        ratetextcontainer.getAttribute('data-requestcode') + "_" +
                        ratetextcontainer.getAttribute('data-requestsourcecode') + "_" +
                        ratetextcontainer.getAttribute('data-locationnumber') + "_" +
                        ratetextcontainer.getAttribute('data-offerid') + ".";
                    reqStr = reqStr.replace(/undefined_undefined_undefined./gi, "");
                    reqData = reqData + reqStr;
                    containers.push(ratetextcontainer);
                    count++;
                }
                //making a new request for every 5 cards as dispatcher blocks lengthy requests
                if (reqData && (count == 5 || ((requestcount == num) && (index == (ratetextcontainers.length - 1))))) {
                    var datetime = new Date().valueOf();
                    var requestURL = "/svt/usbank/rateapi.param-" + reqData + datetime + "USB.json";
                    getResponse(requestURL, containers);
                    requestcount++;
                    count = 0;
                    reqData = "";
                    containers = [];
                }
            });
        }
    }

    if (referenceFoundFor(window && document)) {
        document.addEventListener = document.addEventListener || document.attachEvent;
        document.addEventListener('DOMContentLoaded', DOMContentLoaded, {
            'passive': true
        } || false);
    }
})();

$(document).ready(function() {
let personalBanking = $('[id^="appiontmentScheduleForPB"]'),
    relationID = usbUtils.getCookieItem("riblpid");

if(personalBanking.length>0) {
  let data = {
    bankingType: "pb"
  }
  if(relationID)
    data["external_id"] = relationID;
  appointmentAPI(data);
}

let businessBanking = $('[id^="appiontmentScheduleForBB"]');

if(businessBanking.length>0) {
  let data = {
   bankingType: "bb"
  }
  if(relationID)
    data["external_id"] = relationID;
  appointmentAPI(data);
}

function appointmentAPI(data) {
  $.ajax({
    url: "/svt/usbank/appointmentScheduling",
    data: data,
    success: function(response) {
      response = JSON.parse(response);
      if(data.bankingType == "pb")
        $('[id^="appiontmentScheduleForPB"]').attr("href",response.data.attributes.url);
      else if(data.bankingType == "bb")
        $('[id^="appiontmentScheduleForBB"]').attr("href",response.data.attributes.url);
    }
  });
}

});
$(document).ready(function (e) {
  "use strict";

  var isSingleColumn = function (){return window.innerWidth > 671;};

  var bottom_margin = 0;

  adjust();
  $(window).on('resize', adjust);

  usbUtils.arrowLinkLastWordInIcon('.iconList .arrow-link a');

  //clean up svg after it loads
  setTimeout(function(){
    var icons = document.querySelectorAll('.shield-iconlist .gutter .icon svg');
    for (var _i in icons) {
      var icon = icons[_i];
      if (icon.nodeType && icon.nodeType == 1) {
        icon.removeAttribute('aria-label');
        icon.removeAttribute('role');
        icon.removeAttribute('id');
        icon.setAttribute('aria-hidden','true');
        // icon.querySelector('[id]');
      }
    }

    // ids in svg break unique id requirement
    if($('.shield-iconlist svg [id]').attr('id')){
    if(!$('.shield-iconlist svg [id]').attr('id').includes('avvance')) $('.shield-iconlist svg [id]').removeAttr('id');}
  },800);

  function adjust() {
    var iconLists = document.querySelectorAll('.shield-iconlist.gc-2-lg');
    for (var _l in iconLists) {
      var list = iconLists[_l];

      if (list.nodeType == 1) {

        var iconItems = list.querySelectorAll('.iconlist-item');
        if (iconItems.length > 0 && isSingleColumn() ) {

          reset(iconItems);

          for(var i = 0; i< iconItems.length; i+=2) {

            var ci   = iconItems[i];
            var item = ci.querySelector('.content-group');
            var cis  = [ci];

            var batch = [item]; 
            if (iconItems[i+1]) {
              ci   = iconItems[i+1];
              item = ci.querySelector('.content-group');
              cis.push(ci);
              batch.push(item);
            }
            var _cheight = groupHeight(batch);

            for (var _c in batch) {
              $(batch[_c]).height(_cheight);
            }

            for (var __c in cis) {
              cis[__c].classList.add('adjusted');
            }
          }

        } else {
          reset(iconItems);
        }
      }
    }

  }

  function reset (iconItems) {
    for (var _ii in iconItems) {
      var item = iconItems[_ii];
      if (item.nodeType == 1) {
        var _cg = item.querySelector('.content-group');
        //item.classList.remove('adjusted');
        _cg.removeAttribute('style');
      }
    }

  }

  function groupHeight (nodes) {
    var _h = 0;
    for (var _l in nodes) {
      var __c = nodes[_l];
      if(__c.nodeType === 1){
        _h = $(__c).height() >_h ? $(__c).height() : _h; 
      }
    }
    return _h+bottom_margin;
  }

});

$(document).ready(function(e){
  "use strict";

  var ctaLists = document.querySelectorAll('.shield-cta .list');
  isChattingOn();

  ///shorts the chat buttons to first one
  // @NOTE if this assumption holds true then iterations for all present ones
  // .. can be simplified...
  
  usbUtils.arrowLinkLastWordInIcon('.callToAction .arrow-link a:not(a[href*="tel"])');

  function isChattingOn () {
    try{
      for (var _l in ctaLists) {
        var list = ctaLists[_l];

        if (list.nodeType == 1) {
          var chat = list.querySelector('.chat');
          if ( chat ) {
            var isChatty = chat.style.display != 'none';
            if (isChatty)
              chatOnOff(true);
          }
        }
      }
      ctaChatHandlers();
    }catch(e){
  		let err = new Error();
  		console.error(e+" - Chat is not working "+ err.stack);
	  }
  }

  function ctaChatHandlers () {

    for (var _l in ctaLists ) {

      var list = ctaLists[_l];
      if ( list.nodeType == 1) {

        var chatWatch = new MutationObserver(chattyChange);

        var chatty = list.querySelector('.chat');

        if (chatty) {
          chatWatch.observe(chatty, {
            attributes: true,
            subtree: false,
            childList: true
          });
        }
      }
    }
  }

  function chattyChange (chatters, observer) {
    for (var _c in chatters) {
      var chat = chatters[_c];
      if (chat.target.style.display == 'block' ) {
        chatOnOff(true);
      } else {
        chatOnOff(false);
      }

    }
  }

  function chatOnOff(on) {
    for ( var _c in ctaLists ) {
      var list = ctaLists[_c];
      if (list.nodeType == 1) {
        var chat = list.querySelector('.chat');
        if ( chat ) {
          var items = list.querySelectorAll('.cta');
          chat.style.display = on ? 'block' : 'none';
          if (items.length === 5 && on) list.classList.add('chat-expand');
          if (!on) list.classList.remove('chat-expand');
        }
      }
    }
  }


});
jQuery(document).ready(function() {

    $("span.USB__Text--shield-arrow-Link > a").each(function(index) {
        $(this).addClass("textDecorationNone");
        $("<img src='/content/dam/usbank/images/svg1/shield-right-arrow.svg' height='8px' width='4px' alt='' />").appendTo(this);
    });
    $("a > span.USB__Text--shield-arrow-Link").each(function(index) {
        $(this).parent("a").addClass("textDecorationNone");
        $("<img src='/content/dam/usbank/images/svg1/shield-right-arrow.svg' height='8px' width='4px' alt='' />").appendTo(this);
    });


    $("span.USB__Text--shield-basic-Link > a").each(function(index) {
        $(this).addClass("textDecorationLine");
    });
    $("a > span.USB__Text--shield-basic-Link").each(function(index) {
        $(this).parent("a").addClass("textDecorationLine");

    });

    $("span.USB__Text--shield-Inline-Link > a").each(function(index) {
        $(this).addClass("textDecorationLine");
    });
    $("a > span.USB__Text--shield-Inline-Link").each(function(index) {
        $(this).parent("a").addClass("textDecorationLine");

    });

    $("span.USB__Text--shield-subtle-Link > a").each(function(index) {
        $(this).addClass("textDecorationLine");
    });
    $("a > span.USB__Text--shield-subtle-Link").each(function(index) {
        $(this).parent("a").addClass("textDecorationLine");

    });


    $("a>span.USB__Text--Shield-Btn").each(function(obj) {
        var $span = $(this);
        var $class = $span.attr("class");
        var $link = $span.parent();
        var $href = $link.attr("href");
        var $ariaLabel = $link.attr("aria-label");
        if (!$ariaLabel) {
            $ariaLabel = $link.attr("title");
        }
        if ($ariaLabel) {
            $ariaLabel = " aria-label = '" + $ariaLabel + "' ";
        }

        $link.replaceWith(function() {
            return $("<button onclick=location.href=" + "'" + $href + "'" +
                "; class='" + $class + "'" + $ariaLabel + "><span class='pAlternative'>" +
                $(this).text() +
                "</span></button>");
        });
    });

    $("span.USB__Text--Shield-Btn>a").each(function(obj) {
        var $link = $(this);
        var $span = $link.parent();
        var $class = $span.attr("class");
        var $href = $link.attr("href");
        var $ariaLabel = $link.attr("aria-label");
        if (!$ariaLabel) {
            $ariaLabel = $link.attr("title");
        }
        if ($ariaLabel) {
            $ariaLabel = " aria-label = '" + $ariaLabel + "' ";
        }
        $span.replaceWith(function() {
            return $("<button onclick=location.href=" + "'" + $href + "'" +
                "; class='" + $class + "'" + $ariaLabel + "><span class='pAlternative'>" +
                $(this).text() +
                "</span></button>");
        });
    });

    $(".shield-text .inline-image").each(function(e) {
        let captionText = $(this).text().trim();
        let captionTag = $("<span/>");
        let imgTag = $(this).find("img");
        if ($(this).hasClass("decorative")) {
            imgTag.attr("aria-hidden", "true");
        }
        $(this).empty();
        captionTag.addClass("caption").text(captionText);
        $(this).append(imgTag).append(captionTag);
    });
});
/*
	Full Span Content Block JS.
*/
$(document).ready(function() {
    function resize() {
       $(".fsb-container").each(function(container) {
            $(this).find('.fsb-block').each(function() {
                $(this).find('.fsb-content-container').css('max-height', 'none');
            });
        });
        
        //TODO: The scope of this method must be global since it have the potential for reusability
        //TODO: To make it global this must be refactored to a generic wrapper. 
        (function focusEntireLinkMobile(){
            var elem  = $(".fullSpanContentBlock p a");
            elem.each(function( index,item){
                var _usbTrademarkel =  $(item).find('span.shield_dontBreakWord');
                const regex = /U\.S\.(\s*)Bank/g;
                if(_usbTrademarkel.length > 0 && (item.text).indexOf("U.S. Bank") != -1 && regex.test(item.text)){
                    _usbTrademarkel.attr("aria-hidden","true");
                    $(item).attr("aria-label",item.text);
                }
            })
        })();

        //@NOTE needs review the fsb-image-container has now been normalized to site css image-container
        // new grid may now also not require these DOM manipulations
        if ($(window).width() >= 768) {
            $(".fsb-container").each(function(container) {
                var blockCount = $(this).attr("data-blockcount");
                //when block count is more than 1, changing the aspect ratio of the image to the smallest ratio configured in the blocks
                if (!(blockCount == null) && (blockCount != '1-one')) {
                    var aspectRatio;
                    $(this).find(".fsb-block").each(function() {
                        if (($(this).has(".aspectratio-1x1").length > 0) && (aspectRatio == null)) {
                            aspectRatio = "aspectratio-1x1";
                        }
                        else if (($(this).has(".aspectratio-3x2").length > 0) && ((aspectRatio == null) ||(aspectRatio=="aspectratio-1x1"))) {
                            aspectRatio = "aspectratio-3x2";
                        } 
                        else if (($(this).has(".aspectratio-16x9").length > 0)) {
                            aspectRatio = "aspectratio-16x9";
                        } 
                    });
                    $(this).find(".fsb-block").each(function() {
                        if ($(this).has(".aspectratio-3x2").length > 0) {
                            $(this).find('.fsb-image-block').removeClass('aspectratio-3x2').addClass(aspectRatio);
                        } else if ($(this).has(".aspectratio-1x1").length > 0) {
                            $(this).find('.fsb-image-block').removeClass('aspectratio-1x1').addClass(aspectRatio);
                        }
                    });
                }
            });
        }
        
        if (/MSIE \d|Trident.*rv:/.test(navigator.userAgent)) {
            $(".fsb-image").each(function() {
                var imgSrc = $(this).attr('src');
                $(this).attr("src", "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
                $(this).css("background-image", "url(" + imgSrc + ")");
            });
		}
		
    }
    $(window).on("resize", resize);
    resize();


  usbUtils.arrowLinkLastWordInIcon('.fullSpanContentBlock .arrow-link a');
 
});
$(window).on('load', function() {
    var mediumimage = $('.article-image-header').hasClass('medium-image');
    var smallimage = $('.article-image-header').hasClass('small-image');
    if (mediumimage == true || smallimage == true) {
        $('.right-rail .styledContentBlock').find('.component-container').addClass("scb-class-rightrail").removeClass('vpad-64-md vpad-64-sm');
    }
});
$(window).resize(function() {
    var mediumIeGrid = $('.mediumImageie').hasClass('ie-gridder-row');
    var smallIeGrid = $('.smallImageie').hasClass('ie-gridder-row');
    if (mediumIeGrid && smallIeGrid) {
        $('.smallImageie').removeAttr("style").addClass("iegridimage");
        $('.mediumImageie').removeAttr("style").addClass("iegridimage");
    } else {
        $('.smallImageie').removeClass("iegridimage");
        $('.mediumImageie').removeClass("iegridimage");
    }
});
/* Article Share component JS. */
$(document).ready(function() {
    $('#copy').on('click keydown', function(event) {
        var toolTip2 = $("#toolTip2").val();
        if ((event.type === "keydown" && event.keyCode == 13) || event.type === 'click') {
            event.preventDefault();
            event.stopPropagation();
            var content = document.createElement('input'),
                text = window.location.href;
            document.body.appendChild(content);
            content.value = text;
            content.select();
            content.setSelectionRange(0, 99999); /* For mobile devices */
            document.execCommand('copy');
            navigator.clipboard.writeText(content.value);
            document.body.removeChild(content);
            var copyLink = this;
            var iconTip = document.getElementById("myTooltip");
            this.setAttribute("aria-live", "assertive");
            iconTip.setAttribute("aria-label", toolTip2);
            iconTip.innerHTML = toolTip2;
            this.focus();
            setTimeout(function() {
                copyLink.setAttribute("aria-live", "off");
                iconTip.removeAttribute("aria-label");
            }, 300);
        }
    });
});
$(function() {
	let accordions = $('.accordions-item');
    let isMobile = window.outerWidth < 672;
    let defaultcont = $(".img_content").find("img.accordionImageCustom");
	let defaultsrc = defaultcont.attr("data-defaultImgsrc");
	let defaultalt = defaultcont.attr("data-defaultimgalt");
    if(!defaultsrc){
    $(".img-container").addClass("hide");
    }
    else{
      $(".img-container").removeClass("hide");
     } 


	if (accordions && accordions.length>0) {
		//tag each button with unique id
		accordions.each(function(i, btn) {
			//NOTE add unique id for accordions v. button item
			let open = this.dataset.start === 'showOnLoad';
			let button_id = 'shield_accordion_toggle_' + i;
			let body_id = 'shield_accordion_content_' + i;
			let button = this.querySelector('.heading button');
			let body = this.querySelector('.body');
			button.setAttribute('id', button_id);
			button.setAttribute('aria-controls', body_id);
			button.setAttribute('aria-expanded', open);
			body.setAttribute('id', body_id);
			body.setAttribute('aria-labelledby', button_id);
			body.setAttribute('role', 'region');
			body.setAttribute('aria-hidden', !open);
		});
		accordions.find('.heading button')
				.on(
						'click keydown',
						function(e) {
							let can_toggle = /(click)/.test(e.type) || /(32)/.test(e.keyCode) || e.key && /(Enter|Escape)/.test(e.key);
							let button = $(this);
							let list = $(this).parents('.accordions-item');
							if(list && list.length>0){
								if (can_toggle && this.id) {
									e.preventDefault();
									let body_id = button.attr('aria-controls');
									let open = list.hasClass('open');
									open ? list.removeClass('open') : list.addClass('open');
									button.attr('aria-expanded', !open);
									$('#' + body_id).attr('aria-hidden', open);
									list.siblings().find(".icon-arrow-right").attr('aria-expanded', false);
										list.siblings().removeClass('open');
										let cont, src, alt;
										if(!open){
											cont = list.find(".acc-inner-img img"); 
											src = cont.attr("src");
											alt = cont.attr("alt");
                                           list.parent().parent().siblings(".img_content").find("img").attr({"src":src,"alt":alt});
                                           if(!defaultsrc){
                                                list.parent().parent().siblings(".img_content").addClass("hide");
                                            }
                                            else{
                                                 list.parent().parent().siblings(".img_content").removeClass("hide");
                                            } 
                                            if(!src || src==" "){
                                                if(defaultsrc){
                                                    list.parent().parent().siblings(".img_content").removeClass("hide");
                                                list.find("img").attr({"src":defaultsrc,"alt":defaultalt});
                                                list.parent().parent().siblings(".img_content").find("img").attr({"src":defaultsrc,"alt":defaultalt});
                                                }
                                                else{
                                                list.parent().parent().siblings(".img_content").addClass("hide");
                                                }
                                            }
                                            else{
                                                 list.parent().parent().siblings(".img_content").removeClass("hide");
                                                 list.parent().parent().siblings(".img_content").find("img").attr({"src":src,"alt":alt});
                                            }
											if(isMobile) {
                                                if(!src || src==" "){
                                                    list.parent().find(".img_content").addClass("hide");
                                                }
                                                else{
                                                 list.parent().find(".img_content").removeClass("hide");
                                                }
											}
										} else {
                                             if(!defaultsrc){
                                                list.parent().parent().siblings(".img_content").addClass("hide");
                                            }
                                            else{
                                                 list.parent().parent().siblings(".img_content").removeClass("hide");
                                            } 

											cont = $(".img_content img.accordionImageCustom");
											src = cont.attr("data-defaultImgsrc");
											alt = cont.attr("data-defaultImgAlt");
                                            list.parent().parent().siblings(".img_content").find("img").attr({"src":src,"alt":alt});
										}
										
								}
							}
						});
	}
	let deepLinkId = window.location.hash;
	let deepLinkAccordion = $(deepLinkId).closest(".accordions-item").find("button");
	if(deepLinkAccordion){
		deepLinkAccordion.click().focus();
	}
	$(window).on("resize", resize);
	function resize() {
		
			let openList = $(".accordions-item.open");
			if(openList.length>0) {
				if(isMobile) {
					openList.parent().parent().siblings(".img-container").addClass("hide");
				} else {
					openList.parent().parent().siblings(".img-container").removeClass("hide");
				}
			}
			else {
				if(isMobile) {
					openList.parent().parent().siblings(".img-container").removeClass("hide");
				} else {
					openList.parent().parent().siblings(".img-container").addClass("hide");
				}
			}

	}
});

var usbUtils = usbUtils || {};

var sizes = {
  small: 672,
  medium: 1056,
};

(function() {
  usbUtils = {
    /**
     * @returns nodeList as array or empty array
     */
    nodeListArray: function(list) {
        if (list.length && list.length > 0) {
            return Array.from ? Array.from(list) : Array.prototype.slice.call(list);
        }
        return [];
    },

    /**
     * Provide a query string and options parent to get Plain Array of HTMLElements 
     * @param {*} elstring 
     * @param {*} parent 
     * @returns Array<HTMLElement>
     */
    selectNodes: function(elstring,parent) {
      var nodes = parent && parent.nodeType==1 ? parent.querySelectorAll(elstring) : document.querySelectorAll(elstring);
      return usbUtils.nodeListArray(nodes);
    },

    
    /**
     * 
     * Provide a query string and options parent to get Plain Array of VISIBLE HTMLElements 
     * @param {*} elstring 
     * @param {*} parent 
     * @returns Array<HTMLElement>
     * @returns 
     */
    selectVisibleNodes: function(elstring,parent) {
      return usbUtils.visibleNodes(usbUtils.selectNodes(elstring, parent));
    },

    /**
     * Provide HTML collection or Array of nodes to get the visible ones returned 
     * @param {*} nodes 
     * @returns Array<HTMLElement> || []
     */
    visibleNodes: function(nodes) {
      return usbUtils.nodeListArray(nodes).filter(function(el){
        return el && null!==el && (!!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
      });
    },

    /**
     * Provide aggregate compilation of boundingClientRects in array of nodes
     * From query string returns Object of aggregate params for a Array<HTML> list of the query result 
     * @param {*} elstring 
     * @returns Object {left:number,top:number,height:number,width:number,length:numbe} 
     */
    nodesBoundary: function(elstring) {
      var boundaries = usbUtils.selectNodes(elstring).map(function(el) {
        if (el.getBoundingClientRect) return el.getBoundingClientRect(el);
      });
      var count = boundaries.length;
      if (boundaries && boundaries.length) {
        var first = boundaries.shift();
        var combine = {
          left: first.x,
          top: first.y,
          height: first.height,
          width: first.width,
          length: count
        };
        for (var i = 0; i < boundaries.length; i++) {
          combine.height += boundaries[i].height;
          combine.width +=  boundaries[i].width;
        }
        return Object.assign(combine,{averages:{width: combine.width/count, height: combine.height/count}});
      }
      return {left: 0, top: 0, height: 0, width:0, length: 0, averages:{width:0, height:0}};
    },

    /**
     * @return number | null
     */
    minInArray: function(arr) {
        if (arr && arr.length) {
            if (arr.indexOf(0)) return 0;

            return arr.reduce(function(a, b) {
                return Math.min(parseFloat(a), parseFloat(b));
            }, 100000);

        }
        return null;
    },


    /**
     * @return number | null
     */
    maxInArray: function(arr) {
        if (arr && arr.length) {
            return arr.reduce(function(a, b) {
                return Math.max(parseFloat(a), parseFloat(b));
            }, 0);
        }
        return null;
    },

    /**
     *  
     * @returns string | number
     * : (formatted string) => returns number
     * : (pattern, number) => return formatted string 
     * : (pattern, number, delimiter) => return formatted string using the delimiter to split
     */
    numberMask: function () {
      var _s,_p;
      var regex = /#/g; 
      var it    = 0;

      if(arguments.length == 1) return arguments[0].replace(/[^\d]/g,'');
      if(arguments.length > 1) {
        _p = arguments[0];
        //string of numbers only
        _s = String(arguments[1]).replace(/[^\d]/g,'');
      }
      if(arguments.length == 3) {
        regex = new RegExp(arguments[2], 'g');
      }


      return _p.replace(regex, function(match){
        if( !_s[it]) return match;
        return _s[it++];
      });

    },

    windowSize: function() {
        var _w = document.body.offsetWidth;
        if (_w < sizes.small) return 'sm';
        if (_w > sizes.small && _w < sizes.medium) return 'md';
        return 'lg';
    },

     /* Returns value for the cookie key */
     getCookieItem: function(val){
      var name = val+ "=";
      var decodedCookie = decodeURIComponent(document.cookie);
      var ca = decodedCookie.split(';');
      for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return null;
  },

    arrowLinkLastWordInIcon: function(selector) {
      var arrows = usbUtils.nodeListArray(document.querySelectorAll(selector));
      for (var _a in arrows) {
        var arrow     = arrows[_a];
        var icon      = arrow.querySelector('.icon');
        var ariaLabel = arrow.getAttribute('aria-label');

        var words = arrow.textContent.split(' ').filter(function (_w, i) {
          // @TODO -Regex can be improved for more specific input masking
          var _word = _w.replace(/[^ -ÿ]/gi, '');
          return _word.length > 0;
        });
        if (icon && words.length) {
          arrow.setAttribute('aria-label', ariaLabel || words.join(' '));

          var word = words.pop();
          var tl   = document.createElement('span');

          tl.setAttribute('aria-hidden','true');
          tl.innerHTML=words.join(' ');

          arrow.insertBefore(tl, arrow.firstChild);
          icon.textContent = word;
          icon.setAttribute('aria-hidden','true');
          icon.classList.add('nowrap');
        }
      }
    },

    ucFirst: function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    },

    /**
     * barrowed from https://jonisalonen.com/2012/from-utf-16-to-utf-8-in-javascript/ 
     * may change to meet our needs
     * @param {*} str: char | string 
     * @returns String
     */
    utf8: function(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);

        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6), 
          0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12), 
          0x80 | ((charcode>>6) & 0x3f), 
          0x80 | (charcode & 0x3f));
        } else {
        // surrogate pair
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10) | (str.charCodeAt(i) & 0x3ff))
        
          utf8.push(0xf0 | (charcode >>18), 
          0x80 | ((charcode>>12) & 0x3f), 
          0x80 | ((charcode>>6) & 0x3f), 
          0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    },

    /**
     * supports dataset.link and dataset.target on e.target actions button 
     * @param {*} e 
     */
     targetedLinkOut: function (link, target) {
      var target = target || '_self';
      var href   = /^http(:|s:)/.test(link) 
        ? link : location.protocol + '//' + location.host + link;

      var redirect = usbUtils.createElement('a',{href: href, target: target || '_self'});
      document.body.appendChild(redirect);
      redirect.click();
    },



    createElement: function (tag,options) {
      var el = document.createElement(tag);
      for(var o in options) {
        var attr = typeof options[o] =='object' ? JSON.stringify(options[o]) : options[o];
        el.setAttribute(o,attr);
      }
      return el;
    },

    listenTo: function(node, evt, handler) {
        if (node && node.attachEvent)
            node.attachEvent('on' + evt, handler);
        else if (node)
            node.addEventListener(evt, handler, false);
    },

    detach : function (node, evt, handler) {
      if (node.detachEvent)
        node.detachEvent('on' + evt, handler);
      else
        node.removeEventListener(evt, handler, false);
    },

    isIOS:  function() { return navigator.userAgent.toLowerCase().match(/(iphone|ipod|ipad)/) != null;},
    isAndroid: function() { return  navigator.userAgent.toLowerCase().match(/(android)/) != null;},
    isWin: function() { return navigator.userAgent.toLowerCase().match(/(windows\sphone)/) != null;},  
    isIE: function() { return navigator.userAgent.indexOf("MSIE ") > -1 || navigator.userAgent.indexOf("Trident/") > -1;},  
    isSafari: function() { return  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);},
    isMobile: function() { return this.isIOS() || this.isAndroid()}


  };
})();

/**
 * 
HTML elements that might not be supported for any given agent
.onpageload
  .agent
  .elements to convert by agent
 */
//addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function (win, doc) {
  if (win.addEventListener) return;		//No need to polyfill

  function docHijack(p) { var old = doc[p]; doc[p] = function (v) { return addListen(old(v)) } }
  function addEvent(on, fn, self) {
    return (self = this).attachEvent('on' + on, function (e) {
      var e = e || win.event;
      e.preventDefault = e.preventDefault || function () { e.returnValue = false }
      e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true }
      fn.call(self, e);
    });
  }
  function addListen(obj, i) {
    if (i = obj.length) while (i--) obj[i].addEventListener = addEvent;
    else obj.addEventListener = addEvent;
    return obj;
  }

  addListen([doc, win]);
  if ('Element' in win) win.Element.prototype.addEventListener = addEvent;			//IE8
  else {		//IE < 8
    doc.attachEvent('onreadystatechange', function () { addListen(doc.all) });		//Make sure we also init at domReady
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(doc.all);
  }
})(window, document);


/**
 * Conversion of template elements in IE only
 * 
 * 
 */
(function () {

  if(/(msie|trident)/.test(navigator.userAgent.toLowerCase())) {
    $(document).ready(function(){
      console.log('Converters: converting TEMPLATES');

      $('template').each( function(templ){
        var id = this.id;
        var container = $('<script type="template"/>');
        container.attr('id', id);
        var template = $(this).detach();
        container.append(template.html());
        $('body').append(container);
        // OK IE is weird had have it in DOM before this applies
        document.getElementById(id).className=this.className;
      });
    });
  }

})();

// Create Element.remove() function if not exist
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function () {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}


/**
 * Object.assign() polyfill for IE11
 * @see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign>
 */
if (typeof Object.assign != "function") {
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) {
      "use strict";
      if (target == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource != null) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

// Polyfill IE9+ closest
(function () {


  if (!Element.prototype.matches) {
    Element.prototype.matches =
      Element.prototype.msMatchesSelector ||
      Element.prototype.webkitMatchesSelector;
  }

  if (!Element.prototype.closest) {
    Element.prototype.closest = function (s) {
      var el = this;

      do {
        if (Element.prototype.matches.call(el, s)) return el;
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }

})();

//in i.e. grid does not support autoplacement this resolves the issue
var ieGridder = ieGridder || {};
; (function () {
  'use strict';

  var child_pad = 18;
  ieGridder = {
    /**
     * provides array of grid elements
     * @return [gridElements]
     */
    gridElements: function () {
      var grids = usbUtils.nodeListArray(document.querySelectorAll('body [class*="gc-"]'));
      return grids && grids.length ? usbUtils.nodeListArray(grids) : [];
    },

    offsetElements: function () {
      return usbUtils.nodeListArray(document.querySelectorAll('.component>.offset>[class*="gc-"]'));
    },


    fullspanElements: function () {
      return usbUtils.nodeListArray(document.querySelectorAll('.component>.fullspan>[class*="gc-"]'));
    },

    /**
     * @return number
     */
    childrenWidth: function (el) {
      if (el.children) {
        var cels = usbUtils.nodeListArray(el.children);
        return cels.map(function (_c) {
          return _c.offsetWidth;
        }).reduce(function (a, b) {
          return a + b;
        }, 0);
      }
      return 0;
    },

    ieRowCells: function (el) {
      var accum = 0;
      var childwidth = ieGridder.childrenWidth(el);
      var cir = usbUtils.nodeListArray(el.children).filter(function (_v) {
        accum += _v.offsetWidth - child_pad;
        return accum <= el.offsetWidth;
      });

      return {
        columns: cir.length,
        iscount: childwidth == el.offsetWidth,
        cw: childwidth,
        pw: el.offsetWidth,
        re: cir[cir.length - 1]
      };

    },

    spanRows: function () {

      var spanrows = usbUtils.nodeListArray(document.querySelectorAll('.offset, .fullspan'));
      for (var r in spanrows) {
        var row = spanrows[r];
        row.style['-ms-grid-row'] = r + 1;
      }

    },

    /**
   * In IE we can count columns to match parent width
      . there is no gap or auto placement in IE
      . the first rows match parent width
        . we first move each into its correct row

   * transforms each child gets -ms-grid-row assigned
   * @return void
   */
    setRows: function () {

      var gridEls = ieGridder.gridElements();
      var cr = 0;

      ieGridder.spanRows();


      for (var i in gridEls) {
        var range = gridEls[i];
        if (range && !ieGridder.isHidden(range)) {
          var sizing = ieGridder.ieRowCells(range);
          var childs = usbUtils.nodeListArray(range.children);

          cr = 1;

          // determine childs in row
          var cir = sizing.columns;
          if (!sizing.columns && sizing.cw > sizing.pw) cir = sizing.columns + 1;

          /*
            sizing ~= object with:
              cw: 2222
              iscount: false
              pw: 1432
              re: div.demo.bordered
              columns: 2
           */

          // set rows for each parent grid block
          var i = 1;
          while (childs.length) {
            var ci = childs.shift();
            ci.style['-ms-grid-row'] = cr;

            if (i != 1) ci.classList.add('ie-gap');

            if (i == cir) {
              cr++;
              i = 1;
            } else {
              i++;
            }
          }
        }
      }
    },


    isHidden: function (el) {
      var style = window.getComputedStyle(el);
      return style.display === 'hidden' || el.offsetWidth === 0;

    },


  };

})();

if (/(msie|trident)/.test(navigator.userAgent.toLowerCase())) {
  ieGridder.setRows();
  window.addEventListener('resize', ieGridder.setRows, false);
  window.addEventListener('visibilitychange', ieGridder.setRows, false);
}

var interactions = interactions || {};
(function(){
  
  'use strict';
  var forms      = usbUtils.nodeListArray(document.querySelectorAll('.shield-forms form'));
  var textareas  = usbUtils.nodeListArray(document.querySelectorAll('.shield-forms textarea'));
  var dropdown_toggles = usbUtils.nodeListArray(document.querySelectorAll('form button.dropdown-toggle'));
  var selects = usbUtils.nodeListArray(document.querySelectorAll('.shield-forms select'));
  var measurediv = null;
  var lineheight = 28;
  var body       =  function() { return document.querySelector('body');};


  interactions= {

    formElementFocus: function(e) {
      var el = e.target;
      var parent = el.closest('.fieldset');
      if(parent && parent.nodeType ==1){
        var input  = parent.querySelector('input,textarea,select');
        input.focus();
        parent.classList.add('active');
        parent.classList.add('focused');
      }
      return false;
    },

    formLabelSelectListeners: function() {
      var labelSelects = usbUtils.selectNodes('label input');

      var reset = function(e) {
        var el = e.target;
        var parent = el.closest('form');
        var labelSelects = usbUtils.selectNodes('label input',parent);
        if(labelSelects.length){
          for(var l in labelSelects) {
            var label  = labelSelects[l].closest('label');
            var parent = label.closest('.fieldset');
            label.classList.remove('focused');
            parent.classList.remove('focused');
          }
        }
      };

      labelSelects.forEach( function(el) {
        var label = el.closest('label');
        usbUtils.listenTo(el,'focus',function(e){
          var label  = e.target.closest('label');
          var parent = e.target.closest('.fieldset');
          reset(e);
          label.classList.add('focused');
          parent.classList.add('focused');
          el.focus();
        });
        usbUtils.listenTo(el,'blur',function(e){
          reset(e);
        });
        usbUtils.listenTo(label,'mousedown',function(e){
          reset(e);

          var label = e.target.closest('label');
          var parent = e.target.closest('.fieldset');
          var input = label.querySelector('input');
          parent.classList.add('focused');

          setTimeout(function(){
            if(label) label.classList.add('focused');
          },200);

          if ( e.target!==input) {
            if(input.checked) input.checked=false; 
            else input.checked=true;
            input.focus();
            e.stopImmediatePropagation();
          }
            
        });
      });

    },

    formElementState: function(e) {
      var el = e.target;
      var type = e.type;
      // console.log(type);
      if(el && el.nodeType ==1){
        var parent = el.closest('.fieldset');
        var label  = el.closest('label');
        var unchecked = /(checkbox|radio)/.test(this.type) && this.checked == false;
        if (parent) {
          //console.log('value', el.value);
          //console.log('is value', !el.value);
          //console.log('is value', el.value=='');
          if ( el.value=='' || unchecked){
            parent.classList.remove('active');
          }
          if (el !== document.activeElement) {
            parent.classList.remove('focused');
            if (label)
              label.classList.remove('focused');
          }
        }
      }
      return false;
    },

    filterForNumber: function(e) {
      var el = e.target;
      var parent = el.closest('.fieldset');
      if(parent && parent.nodeType ==1 && el){
        el.value = el.value.replace(/\D/g,'');
      }
      return false;
    },

    clearmeasurer: function (e) {
      var el = e.target;
      usbUtils.detach(el, 'blur', interactions.clearmeasurer);
      usbUtils.detach(el, 'keyup', interactions.formElementFocus);
      if (measurediv) measurediv.remove();
    },

    setmeasurer: function (e) {
      var el = e.target;
      if (!measurediv) {
        measurediv = document.createElement('div');
        measurediv.style.cssText ='position: absolute; left: -200%; visibilty: hidden;line-height: 1.5;';
        measurediv.classList.add('body');
        body().appendChild(measurediv);
      }
      usbUtils.listenTo(el, 'keyup', interactions.sizeTA);
      usbUtils.listenTo(el, 'blur', interactions.clearmeasurer);
    },

    sizeTA: function (e) {
      var el = e.target;

      // reset measure div width
      if( ! body().contains(measurediv)) body().appendChild(measurediv);
      measurediv.style.width=el.clientWidth+'px';

      // get line height on one word
      measurediv.textContent='word';
      lineheight = measurediv.clientHeight;

      // set measure div with current textarea content
      var text = el.value;
      measurediv.textContent = text;

      // get height and carriage returns of text
       var height = measurediv.clientHeight;
       var crs    = text.split(/\n/).length;

       var rows = height>0 && height>lineheight ? Math.round( (height / lineheight) + crs) :crs;

       if (rows > 1) el.setAttribute('rows', rows);

      // console.log('lineHeigth: ' + lineheight + ' height: ' + height + ' rows: ' + rows  + 'carriages: ' + crs);

    },

    formElementHandler: function (form) {
    
      interactions.formLabelSelectListeners();
      var inputs = usbUtils.nodeListArray(form.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea, select'));

      for(var i in inputs) {
        var el = inputs[i];
        if(el.nodeType==1 && ! el.classList.contains('active-input')) {
          var parent = el.closest('.fieldset:first-child');
          el.classList.add('active-input');
          usbUtils.listenTo(el, 'blur', interactions.formElementState);
          usbUtils.listenTo(el, 'change', interactions.formElementState);
          usbUtils.listenTo(el, 'focus', interactions.formElementFocus);
          //usbUtils.listenTo(parent, 'click', interactions.formElementFocus);
          // usbUtils.listenTo(el, 'hover', interactions.formElementFocus);
          if(el.value && el.value!==''){
            if(parent) parent.classList.add('active');
          }
        }
      }
    },

    /**
     * 
     * @param {*} e : Event 
     * descript: provides toggle control for divs that have pattern
     * button.dropdown-toggle
     * div.aria-hidden (style="positon: relative; overflow:hidden;")
     *  div [element that slides up and down] (style="transform: translateY(0 | 180deg)")
     */
    attachDropdownToggle: function (button) {
      // console.log('attaching toggle to ', button);
      if (! button.classList.contains('dd-active') ) {
        button.classList.add('dd-active');
        //sibling should contain sliding button and is the control in this context
        var control = button.nextElementSibling || {};
        // first child of the control will have the slide transition in css
        var slide = control.firstElementChild;
        if(slide && control ) {
          button.control = control;
          button.slide   = slide;

          var input = control.querySelector('select,input,textarea'); 
          input.vcontainer =  button.querySelector('.value') || button;
          button.input = input;

          if( !button.ariaExpanded) {
            button.setAttribute('aria-expanded','false');
          }
          if( !button.getAttribute('aria-control')) {
            var id = 'dropdown-control-' + Math.round(Math.random()*9000);
            control.setAttribute('id',id);
            button.setAttribute('aria-control',id);
          }

          // usbUtils.listenTo(button, 'focus', interactions.dropdownToggle);
          usbUtils.listenTo(button, 'mousedown', interactions.dropdownToggle);
          usbUtils.listenTo(button, 'mouseup', function(e){
            e.preventDefault();
            if(e.target.input) e.target.input.focus();
          });

          if(input && input.value) {
            input.vcontainer.textContent = input.value;
            usbUtils.listenTo(input, 'change', function(e){ 
              var multiple = e.target.getAttribute('multiple');
              var value = input.value;
              // console.log('setting toggle value',input.value);
              // console.log('container for the value',e.target.vcontainer);
              if(multiple && multiple=='mulitple' || true) {
                var values = usbUtils.nodeListArray(input).filter(function(opt){
                  return opt.selected==true;
                }).map(function(el) {return el.value;}); 
                value = values.join(', ');
              }
              e.target.vcontainer.textContent = value;
            });
          }

        }
      }
    },
    dropdownToggle: function(e) {
      e.preventDefault();
      var el = e.target;
      // console.log('dropdown toggle triggered',e.type);

      if(el.slide && el.control){
        var open = el.classList.contains('open');
        if(open) {
          el.setAttribute('aria-expanded','false');
          el.classList.remove('open');
          el.control.setAttribute('aria-hidden','true');
          el.focus();
        } else {
          el.setAttribute('aria-expanded','true');
          el.classList.add('open');
          el.control.setAttribute('aria-hidden','false');
          el.slide.focus();
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        // if(e.input) input.focus();
        return true;
      }

      if(/SELECT/.test(e.target.nodeName)){ 
        var parent = el.closest('.fieldset');
          var open = parent.classList.contains('open');
          if(open) {
            el.setAttribute('aria-expanded','false');
            parent.classList.remove('open');
          } else {
            el.setAttribute('aria-expanded','true');
            parent.classList.add('open');
          }
       }

    },

    filterFormClick: function(e) {
      // console.log(e.target);
      // console.log(e.target.nodeName);
      if( /(form|button|span|svg)/.test(e.target.nodeName.toLowerCase())) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

    },

    attach: function () {
      if(forms.length > 0) {
        for (var f in forms ) {
          var form = forms[f];
          //event on form are breaking interactions
          usbUtils.listenTo(form, 'click', interactions.filterFormClick);
          if ( !form.dataset || !form.dataset.form_activated ){
            form.dataset.form_activated=true;
            interactions.formElementHandler(form);

            //@NOTE provide selection for which validators applies...
            Validators.attach(form);
          }
        }
      }
      if(textareas.length > 0) {
        for (var ta in textareas) {
          var el = textareas[ta];
          usbUtils.listenTo(el, 'focus', interactions.setmeasurer);
          usbUtils.listenTo(el, 'click', interactions.setmeasurer);
        }

      }
      if(selects.length > 0) {
        for (var s in selects) {
          var el = selects[s];
         
          usbUtils.listenTo(el, 'click', interactions.dropdownToggle);

        }

      }
      if(dropdown_toggles.length > 0) {
        for (var d in dropdown_toggles) {
          interactions.attachDropdownToggle( dropdown_toggles[d]);
        }

      }
    }

  };

  $(document).ready(function(){
    interactions.attach();
  });

  //This is for footer landmark to adding a role
  if(document.querySelector("footer"))
    document.querySelector("footer").setAttribute("role","contentinfo");

})();

$(document).ready(function() {
    $("a[title]").each(function(e){
		let title=$(this).attr("title");
		let ariaLabel=$(this).attr("aria-label");
			if(!ariaLabel && title){
				$(this).attr("aria-label",title);
				$(this).removeAttr("title");
			}
	});
});


/**
 * Validators, Filters, Validator are global static singletons
 * Validators: are just that... the validators for the el / input field that it gets called with
 *  .returns validation object
 * Filters: when validation is true then content is filtered to preset to  er before they send
 *
 * Validators.attach method attaches the validation listerners for a form element
 */

 /**
  ELAN Scenarios :
  1. PDF Download if PDF path is configured. - Redirect to Thank you page and PDF open / download the pdf depends on browser default behavior
  2. OnPage error/success confirmation messages
  3. OnPage confirmation and PDF Download
 */

 var Validators = Validators || {};
 var Filters = Filters || {};
 var Validator = Validator || {};
 var formSubmitted = null;
 var successRedirect = null;
 var tempSsn = null;
 jformHideOnLoad();
 
 // activated forms form.dataset.formkey is used as window.forms index
 /**
  * form.dataset.formkey // is set to track
  *  window.forms = {
  *  [String:key]: {
  *    actions: () {methods for el}
  *  }
  * }
  *
  */
 
 // @TODO merge wit feature/SALE-25031
 
 // @TODO remove jQuey dependency
 
 // @TODO integrate with the reCaptcha component... => Validations.transforms
 
 window.forms = window.forms || {};
 
 //base validation object which each Validator returns
 var validation = validation || {
     name: null,
     message: null,
 };
 
 var formState = {
     form: null, //HTMLElement: form element
     submitted: false, //boolean: has been submitted to service
     validated: false, //boolean:  has form been submitted received succcess response
     complete: {} //Function:  when complete optional function for
 };
 var defaults = {
     checkedable: '.checkboxes',
     mintext: 20,
     maxtext: 200,
     zipsize: 5,
     phone: 10,
	 currency: 9,
     ssn:9,
     japanPhoneMin:7,
     japanPhoneMax:11
 };
 
 var postage = {
     type: 'POST',
     url: function() { alert('provide url in call: \n...usually it is the form action'); },
     dataType: 'JSON',
     data: {},
     success: function() { alert('attach.success callback'); },
     error: function() { alert('attach.error callback'); },
 };
 
 var formkeys = [
     'id',
     'name',
     'type',
     'minlength',
     'maxlength',
     'placeholder',
     'readonly',
     'required',
     'value',
 
     'errorConstraint',
     'errorDaterange',
     'errorFormat',
     'errorMaxlength',
     'errorMinlength',
     'errorMismatch',
     'errorTypeof',
     'errorRequired',
 
     'valueConfirmField',
     'valueConfirmSelected',
     'valueDescription',
     'valueLabelcolor',
     'valueTitle',
     //@note this should usually be 'valueTypeof'
     'valueRegexType',
 
 ];
 var textTypes = {
 
     "regexType": [
         "noRegex",
         "alphbetsOnly",
         "alphaNumericwithSpace",
     ],
 
 
     "dateType": [
         "futureDates",
         "pastDates",
         "noDateCons",
     ],
 
     "numberType": [
         "positive",
         "negative",
         "noCons",
     ],
 
     "type": [
         "textarea",
         "text",
         "email",
         "tel",
         "date",
         "number",
         "password",
         "hidden",
         "zipcode",
         "select-one",

     ],
 
 };
  window.onload = function () {
    // getting the URL parameters used to prepopulate the form elements
    var queryString = window.location.search;
    if (queryString) {
      var paramPairs = decodeURI(queryString).substr(1).split('&');
      var params = {};
      for (var i = 0; i < paramPairs.length; i++) {
        var parts = paramPairs[i].split('=');
        params[parts[0]] = parts[1];
      }
      if (Object.keys(params).length) {
        Validators.preFillFormElements(params);
      }
    }
    Validators.taxpayerLoader();
    Validators.taxTypeSelection();
    Validators.usNonUsphoneNumberLoader();
  };

 Validators = {
     message: function(key, el) {
         el = el || this;
         return el && el.dataset && el.dataset[key] ||
             el && el.form && el.form.words && el.form.words[key] ||
             null;
 
     },
     not_empty: function(el) {
         var _v = el.value;
         var _valid = _v && _v !== '' && _v != null ? true : false;
 
         if (/(radio|checkbox)/.test(el.type)) {
             var selectables = el.closest(defaults.checkedable);
             var checkables = selectables && selectables.querySelectorAll('[type="' + el.type + '"]');
             var list = usbUtils.nodeListArray(checkables);
 
             //if checkable and event type == blur wait until last
             var selected = list.filter(function(v, i) {
                 return v.checked == true;
             });
 
             _valid = selected.length > 0;
         }
 
         return {
             valid: _valid,
             name: 'not_empty',
             message: el.message('errorRequired') || el.name + ' is Required'
         };
     },
     zip_code: function(el) {
         var _v = el.value;
         var _n = String(_v.replace(/[^0-9]/g, ''));
         var _s = el.validates.maxcount || el.validates.mincount || defaults.zipsize;
 
         var _valid = /([\d]{5}|[\d]{9})/.test(_n);
 
         var _m = el.name + ' does not appear to be a zipcode';
 
         if (_n.length == 0)
             _m = el.message('errorRequired') || _m;
 
         if (_n.length < _s)
             _m = el.message('errorFormat') || el.message('errorConstraint') || _m;
  
        if(el.message('valueConfirmSelected') =="true"){  
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var el_type = document.getElementById(el.id).getAttribute('type');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                        let previousComponent= domElements.value;
                            if(previousComponentType == el_type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorMismatch');
                _valid = false;
            }
        }
				
         return {
             valid: _valid,
             name: 'zip_code',
             message: _m
         };
     },
     phone_number: function(any) {
         var el = any.target || any;
         el.value = el.value.trim();
         var _v = el.value;
         var _n = _v.replace(/[^0-9]/g, '');
         var _req = el.validates.mincount || defaults.phone;
         var _valid = _n && _n.length == _req;
 
         var _m = el.message('errorRequired');
         if ((_n === '0000000000') || (_n.startsWith('000'))){
            _m = el.message('errorFormat');
            _valid = false;
        }

        if (_n.length < 10) {
              _m = el.message('errorMinlength');
              _valid = false;
         }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                        let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }
             
            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }
			
         return {
             valid: _valid,
             name: 'phone_number',
             message: _m
         };
     },
     japanese_phone_number: function(any) {
        var el = any.target || any;
        el.value = el.value.trim();
        var _v = el.value;
        var _n = _v.replace(/[^0-9]/g, '');

        var _reqMin = el.validates.mincount || defaults.japanPhoneMin;
        var _reqMax = el.validates.mincount || defaults.japanPhoneMax;
        var _valid = _n && _n.length > (_reqMin-1) && _n.length < (_reqMax+1);

        var _m = el.message('errorRequired');
        if ((_n === '0000000000000000') || (_n.startsWith('000'))){
           _m = el.message('errorFormat');
           _valid = false;
       }

       if (_n.length < defaults.japanPhoneMin || _n.length > defaults.japanPhoneMax) {
             _m = el.message('errorMinlength');
             _valid = false;
        }

       if(el.message('valueConfirmSelected') =="true"){
           var count_for_ifexist = 0;
           var confirmFieldName = el.message('valueConfirmField');
           var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
           if(elementsFromDom){
               elementsFromDom.forEach(function(domElements) {
                   let previousComponentType= domElements.getAttribute('type');
                       let previousComponent= domElements.value;
                           if(previousComponentType == el.type){
                               if(el.name != confirmFieldName && previousComponent != el.value){
                                   count_for_ifexist++;
                               }
                           }
               });
           }
            
           if(count_for_ifexist != 0){
               _m = el.message('errorTypeof')
               _valid = false;
           }
       }
           
        return {
            valid: _valid,
            name: 'japanese_phone_number',
            message: _m
        };
    },

     ssn_number: function(any) {
        var el = any.target || any;
        el.value = el.value.trim();
        if (!el.hasAttribute("data-ssnvalue") || el.getAttribute("data-ssnvalue") !== el.value) {
            el.setAttribute("data-ssnvalue", el.value);
        }
        var _n = el.getAttribute("data-ssnvalue").replace(/[-]/g, '');
        var _req = el.validates.mincount || defaults.ssn;
        var _valid = _n && _n.length == _req;

        var _m = el.message('errorRequired');
        if ((_n === '000000000') || (_n.startsWith('000'))){
           _m = el.message('errorFormat');
           _valid = false;
       }

       if (_n.length < 9) {
             _m = el.message('errorMinlength');
             _valid = false;
        }

       if(el.message('valueConfirmSelected') =="true"){
           var count_for_ifexist = 0;
           var confirmFieldName = el.message('valueConfirmField');
           var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
           if(elementsFromDom){
               elementsFromDom.forEach(function(domElements) {
                   let previousComponentType= domElements.getAttribute('type');
                       let previousComponent= domElements.value;
                           if(previousComponentType == el.type){
                               if(el.name != confirmFieldName && previousComponent != el.value){
                                   count_for_ifexist++;
                               }
                           }
               });
           }
            
           if(count_for_ifexist != 0){
               _m = el.message('errorTypeof')
               _valid = false;
           }
       }
       Validators.taxpayerLoader(); 
        return {
            valid: _valid,
            name: 'ssn_number',
            message: _m
        };
    },
 
	  currency: function(any) {
         var el = any.target || any;
         el.value = el.value.trim();
         var _v = el.value;
         var _n = _v.replace(/[^0-9]/g, '');
         var _req = el.validates.mincount || defaults.currency;
         var _valid = _n && _n !='0'&&_n.length <= _req;
         var _m = el.message('errorRequired');
        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                        let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }

         return {
             valid: _valid,
             name: 'currency',
             message: _m
         };
     },
	 
     password: function(any) {

          var el = any.target || any;
          var _v = el.value;
          var _req = el.validates.mincount ;
          var _valid = _req;
          var _m = el.message('errorRequired');

          if (_v.length < el.validates.mincount) {
            let password_min_error = el.message('errorMinlength').split("|");
            _m = password_min_error[1];
            _valid = false;
          }

          if (_v.length > el.validates.mincount) {
            _valid = true;
          }
          var _maxlen = el.message('maxlength');
          if (_v.length > _maxlen && _maxlen != null) {
            _m = el.message('errorMaxlength');
            _valid = false;
          }
          
        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                        let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }
            
            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }

          return {
              valid: _valid,
              name: 'password',
              message: _m
          };
      },

      number: function(any) {

         var el = any.target || any;
         var _v = el.value;
         var _vlen = el.value.replace("-","");
         var _req = el.validates.mincount ;
         var _valid = _req;
         var _m = el.message('errorRequired');
         
         if (_vlen.length < el.validates.mincount) {
             _m = el.message('errorMinlength');
             _valid = false;
         }

         if (_vlen.length > el.validates.mincount) {
             _valid = true;
         } 

		 var _maxlen = el.message('maxlength');
         if (_vlen.length > _maxlen && _maxlen != null) {
            _m = el.message('errorMaxlength');
            _valid = false;
         }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                    let previousComponent= domElements.value; 
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }
            
            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }
		
         return {
             valid: _valid,
             name: 'number',
             message: _m
         };
     },
    text: function(any) {
        var el = any.target || any;
        var _v = el.value;
        var _req = el.validates.mincount ;
        var _valid = _req;
        var _m = el.message('errorRequired');
        if (_v.length < el.validates.mincount) {
            _m = el.message('errorMinlength');
            _valid = false;
        }

        if (_v.length > el.validates.mincount) {
            _valid = true;
        }
        
        var _maxlen = el.message('maxlength');
        if (_v.length > _maxlen && _maxlen != null) {
            _m = el.message('errorMaxlength');
            _valid = false;
        }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));           
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                    let previousComponent= domElements.value; 
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++; 
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }
        Validators.taxpayerLoader();
        return {
            valid: _valid,
            name: 'text',
            message: _m
        };
   },
   selectbox: function(el) {
    var _v = el.value.toLowerCase();
    var _valid = true;
    var _m = "";
     if (_v == '' && el.message('valueConstraint') == 'true') {
         _m = el.message('errorRequired');
         _valid = false;
     }

    if(el.className.includes('countryField')){
        Validators.stateHideAndShowByCountry(el.closest('form'),el.closest('.form-container'));
    }
    if (el.id == 'japaneseTaxType') Validators.taxTypeSelection();
    if (el.id == 'japanesePhoneType') Validators.usNonUsphoneNumberLoader();
    return {
        valid: _valid,
        name: 'selectbox',
        message: _m
    };
   },
   radioButton: function(any) {
    var el = any.target || any;
    var _valid = true;
    var _m = el.message('errorRequired');
    let nodeList = el.closest('.fieldset').querySelectorAll("input[type='radio']");
    let radioButtonsArray = Array.from(nodeList);
    radioButtonsArray.some(function(element){
        element.setAttribute('aria-checked','false');
    });
    if(any.checked == true){
      el.setAttribute("aria-checked","true");
    }

    Validators.taxpayerLoader();
     return {
        valid: _valid,
        name: 'radioButton',
        message: _m
    };
   },
   checkboxButton: function(any) {
    var el = any.target || any;
    var _valid = true;
    var _m = el.message('errorRequired');
    if(any.checked == true){
      el.setAttribute("aria-checked","true");
    }else{
      el.setAttribute("aria-checked","false");
    }

     return {
        valid: _valid,
        name: 'checkboxButton',
        message: _m
    };
   },
   textarea: function(any) {
        var el = any.target || any;
        var _v = el.value;
        var _req = el.validates.mincount ;
        var _valid = _req;
        var _m = el.message('errorRequired');
        if (_v.length < el.validates.mincount) {
            _m = el.message('errorMinlength');
            _valid = false;
        }

        if (_v.length > el.validates.mincount) {
            _valid = true;
        }
        var _maxlen = el.message('maxlength');
        if (_v.length > _maxlen && _maxlen != null) {
            _m = el.message('errorMaxlength');
            _valid = false;
        }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("textarea[name='"+confirmFieldName+"']",el.closest('form'));
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.tagName.toLowerCase();
                    let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorTypeof')
                _valid = false;
            }
        }

        return {
            valid: _valid,
            name: 'textarea',
            message: _m
        };
    },
     email: function(el) {
         var _v = el.value;
         var _valid = /^[A-Z0-9._%+-]+@([A-Z0-9][A-Z0-9.-]*[A-Z0-9])+\.[A-Z]{2,}$/gi.test(_v);
         var _m = el.message('errorConstraint') || el.name + ' does not appear to be an email address';
         var restrictedDomian = el.getAttribute('data-restricted-domain');
         if (_v !== ''){
             _m = el.message('errorFormat') || el.message('errorRequired') || _m;

         if(restrictedDomian !== null){
            if(restrictedDomian !== ''){
                let emailSplitArray =  _v.split('@');
                let rejectList = restrictedDomian.split(',');
                if(rejectList.indexOf(emailSplitArray[1]) >= 0)
                    {
                        _m = el.getAttribute('data-restricted-domain-message');
                        _valid = false;
                    }
                }
         }

        }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                    let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorMismatch');
                _valid = false;
            }
        }


        return {
            valid: _valid,
            name: 'email',
            message: _m
        };
     },
     confirm: function(el) {
         var _el2 = el.confirmation;
         var _v1 = el.value.toLowerCase();
         var _v2 = _el2.value.toLowerCase();
         var _valid = _v1 === _v2;
         console.log('Validation confirming:', _v1 + ' ?= ' + _v2 + 'result: ' + (_valid));
         return {
             valid: _valid,
             name: 'confirm',
             message: el.message('errorMismatch') || el.name + ' does not match ' + _el2.name
         };
     },
     max_length: function(el) {
         var _v = el.value;
         var _max = el.validates.maxcount || defaults.maxtext;
         var _valid = _v.length && _v.length > _max ? false : true;
         el.dataset.reqdmsg = el.dataset.maxlength;
         return {
             valid: _valid,
             name: 'max_length',
             message: el.name + ' is too long'
         };
     },
     min_length: function(el) {
         var _v = el.value;
         var _min = el.validates.mincount || defaults.mintext;
         var _valid = _min && _v.length && _v.length < _min ? false : true;
         return {
             valid: _valid,
             name: 'min_length',
             message: el.message('errorMinlength') || el.message('errorRequired') || el.name + ' is not long enough'
         };
     },
     date: function(el) {
         var _v = new Date(el.value);
         var _valid = typeof _v.getDate === 'function' && _v.toString() !== 'Invalid Date';
         var _m = el.message('errorDaterange') ||
             el.message('errorMismatch') ||
             el.message('errorRequired') ||
             el.name + ' value: ' + el.value + ' does not convert to date';

         if (_valid && el.dataset.valueTypeof && el.dataset.valueTypeof == 'futureDates') {
             _valid = Date.now() < _v.getTime();
             var _m = el.message('errorDaterange') || el.message('errorMismatch') || _m;
         }

         if (_valid && el.dataset.valueTypeof && el.dataset.valueTypeof == 'pastDates') {
             _valid = Date.now() > _v.getTime();
             var _m = el.message('errorDaterange') || el.message('errorMismatch') || _m;
         }

        if(el.message('valueConfirmSelected') =="true"){
            var count_for_ifexist = 0;
            var confirmFieldName = el.message('valueConfirmField');
            var elementsFromDom = usbUtils.selectNodes("input[name='"+confirmFieldName+"']",el.closest('form'));
            if(elementsFromDom){
                elementsFromDom.forEach(function(domElements) {
                    let previousComponentType= domElements.getAttribute('type');
                    let previousComponent= domElements.value;
                            if(previousComponentType == el.type){
                                if(el.name != confirmFieldName && previousComponent != el.value){
                                    count_for_ifexist++;
                                }
                            }
                });
            }

            if(count_for_ifexist != 0){
                _m = el.message('errorMismatch');
                _valid = false;
            }
        }

         return {
             valid: _valid,
             name: 'date',
             message: _m
         };
     },
     regex: function(el) {
         var _v = el.value;
         var _valid = false;
         var _form = '';
         switch (el.getAttribute("data-value-typeof")) {
                     case 'alphbetsOnly':
                         _valid = /^[a-z]+$/ig.test(_v);
                         _form =el.getAttribute("data-validation-alphbetsonly");
                             break;
                     case 'alphaNumericwithSpace':
                         _valid = /^[a-z0-9\s]+$/gi.test(_v);
                        _form = el.getAttribute("data-validation-alphanumericwithspace");
                            break;
                     case 'alphawithSpace':
                         _valid = /^[a-z\s]+$/gi.test(_v);
                        _form = el.getAttribute("data-validation-alphawithspace");
                         break;
                 }
         return {
             valid: _valid,
             name: 'regex.' + el.regularexptype,
             message: el.getAttribute('data-value-title') + ' ' + _form
         };
     },
     error_response_no_record: function(el) {
         var noRecordMessage = AcxiomForm.noMatchingRecord;
         var _valid = !(formSubmitted && el.dataset.errResponseMsg && el.dataset.errResponseMsg.trim() == noRecordMessage);
         if (!_valid) {
             AcxiomForm.isNoRecordRes = true;
         }
         return {
             valid: _valid,
             name: 'error_response_no_record',
             message: el.message('errorAcxiomincorrectfirst') + ' ' + el.getAttribute('data-value-title') + ' ' + el.message('errorAcxiomincorrectlast')
         };
     },
     error_response_record_present: function(el) {
         var recordPresentMessage = AcxiomForm.leadAlreadySubmitted;
         var _valid = !(formSubmitted && el.dataset.errResponseMsg && el.dataset.errResponseMsg.trim() == recordPresentMessage);
         if (!_valid) {
             AcxiomForm.isRecordPresent = true;
         }
         return {
             valid: _valid,
             name: 'error_response_record_present',
             message: el.message('errorAcxiomincorrectfirst') + ' ' + el.getAttribute('data-value-title') + ' ' + el.message('errorAcxiomincorrectlast')
         };
     },
 };

 Filters = {
     clean_keys: function(any) {
         var el = any.target || any;
         var _v = el.value;
         var nook = /([#0-9]\u20E3)|[\xA9\xAE\u203C\u2047-\u2049\u2122\u2139\u3030\u303D\u3297\u3299][\uFE00-\uFEFF]?|[\u2190-\u21FF][\uFE00-\uFEFF]?|[\u2300-\u23FF][\uFE00-\uFEFF]?|[\u2460-\u24FF][\uFE00-\uFEFF]?|[\u25A0-\u25FF][\uFE00-\uFEFF]?|[\u2600-\u27BF][\uFE00-\uFEFF]?|[\u2900-\u297F][\uFE00-\uFEFF]?|[\u2B00-\u2BF0][\uFE00-\uFEFF]?|(?:\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDEFF])[\uFE00-\uFEFF]?/g;
         el.value = _v.replace(nook, '');
         return el.value;
     },
     number: function(any) {
        var el = any.target || any;
        if(el.getAttribute("date-value-typeof") == "positive" ){
            el.value = el.value.replace(/[^0-9]+/g, '');
        }else{
            let elementKey = any.key.toLowerCase();
            if (/(e)/.test(elementKey)) {
                el.value = el.value.replace(elementKey,'');
            }
        }

        return el.value;
     },
     textarea: function(any) {
         var el = any.target || any;
         let maxcount = el.getAttribute('data-maxlength');
         let characterLeft = el.getAttribute('data-text-charctersleft');
         let characterTooMany = el.getAttribute('data-text-charactersTooMany');
         let lengthOfValue = el.value.length;
         let countField = el.closest('.fieldset').querySelector('.count');
         countField.textContent = "# "+characterLeft;
         countField.style.display = "block";
         if(maxcount){
            if(lengthOfValue <= maxcount){
                countField.textContent = (maxcount - lengthOfValue) +" "+ characterLeft;
                countField.classList.add('characterLeft');
                countField.classList.remove('characterTooMany');
            }else{
                countField.textContent = (lengthOfValue - maxcount)+" "+ characterTooMany;
                countField.classList.remove('characterLeft');
                countField.classList.add('characterTooMany');
            }
         }
        return el.value;
     },
     zip_code: function(any) {
         var el = any.target || any;
         var _v = el.value;
         var _s = el.message('maxlength') || defaults.zipsize;
         var numstring = _v.replace(/[^\d]/g, ''); // + String.fromCharCode(any.keyCode);
         el.value =  numstring.substring(0, _s);
         return el.value;
     },
     /**
      *
      * @param {*} _date:Date
      * @returns string formatted to work in widgets
      */
     widgetDate: function(_date) {
         return '_y-_m-_d'
             .replace('_m', ('0' + (_date.getMonth() + 1)).slice(-2))
             .replace('_d', ('0' + (_date.getDate() + 1)).slice(-2))
             .replace('_y', _date.getFullYear());
     },
     //provides existing to correct format or a formatted valid base date
     date: function(any) {
         var el = any.target || any;
         var _v = el.value;
         var _entered = new Date(_v);
         var _now = new Date();
         var _dt = el.validates.dateType;

         var _d = _entered != 'Invalid Date' && _entered || _now;

         if (_d.getTime() > Date.now() && _dt == 'pastDates')
             _d = _now.setDate(_now.getDate() - 1);

         if (_d.getTime() < Date.now() && _dt == 'futureDates')
             _d = _now.setDate(_now.getDate() + 1);



         return Filters.widgetDate(_d);

     },
     phone_number: function(e) {

         if ((e.keyCode != '40') && (e.keyCode != '38') && (e.keyCode != '9')) {

             var el = e.target || e;
             var key = e.keyCode || e.charCode || 0;
             var backstep = key == 8 || key == 46 || false;
             var numstring = el.value.replace(/[^\d]/g, '');
             var lastone = numstring.length == 1;
             var pattern;

             var _v = backstep && String(numstring.slice(0)) || el.value;
             if(numstring.length == 0){
                 pattern = el.getAttribute('placeholder') || '';
             }
             else if((numstring.length > 0) && (numstring.length < 4)){
		 		 pattern = el.getAttribute('placeholder') || '    ';
             }else if((numstring.length >= 4) && (numstring.length < 7)){
				 pattern = el.getAttribute('placeholder') || '   -    ';
             }else if(numstring.length >= 7){
				 pattern = el.getAttribute('placeholder') || '   -   -    ';
             }
			el.value = lastone && backstep && pattern || usbUtils.numberMask(pattern, _v, ' ');

			 if(numstring.length <= 3){
			el.setSelectionRange(numstring.length ,numstring.length);
             }else if((numstring.length > 3) && (numstring.length <= 6)){
				el.setSelectionRange(numstring.length + 1,numstring.length + 1);
             }else if(numstring.length > 6){
				el.setSelectionRange(numstring.length + 2,numstring.length + 2);
             }
             return el.value.trim();
         }

     },
     japanese_phone_number: function(e) {
        if ((e.keyCode != '40') && (e.keyCode != '38') && (e.keyCode != '9')) {

            var el = e.target || e;
            var key = e.keyCode || e.charCode || 0;
            var backstep = key == 8 || key == 46 || false;
            var numstring = el.value.replace(/[^\d]/g, '');
            var lastone = numstring.length == 1;
            var pattern;

            var _v = backstep && String(numstring.slice(0)) || el.value;
            if(numstring.length == 0){
                pattern = el.getAttribute('placeholder') || '';
            }
            else if((numstring.length > 0) && (numstring.length < 4)){
                 pattern = el.getAttribute('placeholder') || '    ';
            }else if(numstring.length >= 4){
                pattern = el.getAttribute('placeholder') || '   -          ';
            }

           el.value = lastone && backstep && pattern || usbUtils.numberMask(pattern, _v, ' ');

            if(numstring.length <= 3){
           el.setSelectionRange(numstring.length ,numstring.length);
            }else if(numstring.length > 3){
               el.setSelectionRange(numstring.length + 1,numstring.length + 1);
            }
            return el.value.trim();
        }

    },

     ssn_number: function(e) {

        if ((e.keyCode != '40') && (e.keyCode != '38') && (e.keyCode != '9') && (e.key != 'ArrowRight')) {
            var el = e.target || e;
            var key = e.keyCode || e.charCode || 0;
            var backstep = key == 8 || key == 46 || false;

            var starCount= el.value.slice(0, 6);
            if(starCount == "***-**"){
                el.value = el.getAttribute("data-ssnvalue").substr(0,el.value.length);
            }
            var displayVal = el.value.replace(/[^0-9]/g, '');
            displayVal = displayVal.substr(0, 9);

            if (displayVal.length >= 4) {
              displayVal = displayVal.slice(0, 3) + '-' + displayVal.slice(3);
            }

            if (displayVal.length >= 7) {
              displayVal = displayVal.slice(0, 6) + '-' + displayVal.slice(6);
            }
            el.value = displayVal;
            var unMasking = Validators.ssnUnMasking(el.value);
            el.setAttribute("data-ssnvalue",(unMasking!=undefined)?unMasking:'');

            if(el.value.length == 11){
               var len = el.value.length;
               var stars ='';
               if(len==1){ stars='*'; }
               else if(len==2){ stars='**'; }
               else if(len==3){ stars='***-'; }
               else if(len==5){ stars='***-*'; }
               else if(len==6){ stars='***-**-'; }
               else if(len>=8){ stars='***-**-'+el.value.slice(7,11); }
			   tempSsn = el.value;	
               el.value = stars;
           }

           return el.value;
        }

    },
currency: function(e) {

         if ((e.keyCode != '40') && (e.keyCode != '38') && (e.keyCode != '9')) {
        	 var el = e.target || e;
         	 el.value = el.value.replace(/[^0-9.,\$]+/g, '');
             var key = e.keyCode || e.charCode || 0;
             var backstep = key == 8 || key == 46 || false;
             var numstring = el.value.replace(/[^0-9]+/g, '');
             numstring = numstring.replace(/^0+/, '');
             var _s = el.message('maxlength') || defaults.currency;
             numstring =  numstring.substring(0, _s);
             var lastone = numstring.length == 1;
             var pattern;
             var _v = backstep && String(numstring.slice(0)) || el.value;
         	 if((numstring.length == 0)){
		 		 pattern = el.getAttribute('placeholder') || '';
            }else if((numstring.length > 0) && (numstring.length <= _s)){
		 		 pattern = el.getAttribute('placeholder') || '$'+ new Array(numstring.length+1).join(' ');

           }
         	var aftermask = lastone && backstep && pattern || usbUtils.numberMask(pattern, numstring, ' ');
         	el.value=aftermask.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
               return el.value.trim();
         }

     },
     regex: function(any) {
         var el = any.target || any;
         var _v = el.value;
         var type = el.regexType;

         switch (type) {
             case 'alphbetsOnly':
                 return _v.replace(/[^a-z]/gi, '');

             case 'alphaNumericwithSpace':
                 return _v.replace(/[^a-z0-9\s]/gi, '');

             case 'alphawithSpace':
                 return _v.replace(/[^a-z\s]/gi, '');

             case 'positive':
                 return parseFloat(_v.replace(/[^0-9]/gi, ''));

             case 'negative':
                 return parseFloat('-' + _v.replace(/[^0-9]/gi, ''));

         }
     }
 };

 // method is separated from Validators as convenience in locating the instatiator for validation / filter listeners on a p
 /**
  *
  * @param {*} form
  *
  * .attach handlers and set validator dataset flag to prevent duplicate handlers being set
  *
  * .attach validators and filters to each element
  *  each el has actions for validation and filtering methods
  *    el => el.actions.validate() || el.actions.filter()
  *
  * .form has .isValid, .filter , submit methods attached
  *    form => form.actions.validate() | form.actions.filter() | form.actions.submit( Function:success, Function:failure)
  *
  * .onChange and onBlur triggers the elements validation / filter chain
  */
 Validators.attach = function(form, completed) {
     if (form && !form.dataset.formkey) {

         Validators.transforms(form);
         var id = (typeof form.id == 'string' && form.id != '' && form.id) ||
             (form.name && typeof form.name === 'string' && form.name) ||
             'form';

         id += '_' + (Math.round(Math.random() * 9000));

         form.dataset.formkey = id;
         form.id = id;

         //initialize its formState
         form.formState = formState;
         //if complete callback is provided attach it now
         if (completed) {
             form.formState.complete = completed;
         }

        //aria live elements are created when form is first rendered
        // :. we provide support to turn them off and on here
        form.ariaLives = usbUtils.selectNodes('[aria-live]',form);

         //attach fallback messages
         var container = form.closest('.form-container');
         var rossetta = container && container.querySelector('.usb-rossetta-stone');
         form.words = rossetta && rossetta.dataset || null;
         // attach validation chain to each el
         // triggered from onchange and blur events

         var inputs = usbUtils.nodeListArray(form.querySelectorAll('input, textarea, select'));
         var button = form.querySelector('button.cmp-form-button');
         var submitbtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
         var fields = {};
         for (var f in inputs) {
             fields[inputs[f].name] = inputs[f];
         }

         // X-references these things to support for external queries for state
         form.fields = fields;
         window.forms[id] = form;

         for (var i in inputs) {
             var input = inputs[i];
             if (input && input.type != 'hidden') {

                 input.validators = {};
                 input.filters = {};
                 input.message = Validators.message;

                 input.form = form;

                 var label = input.id && document.querySelector('[for="' + input.id + '"]');
                 var labeltext = label && label.textContent.replace('\n', '').trim() || '';
                 var hint =
                     input.type +
                     ' ' + input.dataset.fieldType || '';

                 var _d = hint && hint.match(/(date)/ig);
                 var _z = hint && hint.match(/(zip)/ig);
                 var _p = hint && hint.match(/(tel|telephone)/ig);
                 var _jp = hint && hint.match(/(japaneseNum)/ig);
                 var _e = hint && hint.match(/(email|e\-mail)/ig);
                 var _n = hint && hint.match(/(number)/ig);
                 var _c = hint && hint.match(/(amount)/ig);
                 var _m = hint && hint.match(/(ssn|itin)/ig);

                 var dataset = input.dataset || {};
                 var name = input.name;
                 var type = input.type;

                 var zipped = _z && _z.length && _z.length > 0;
                 var phoned = _p && _p.length && _p.length > 0;
                 var j_phoned = _jp && _jp.length && _jp.length > 0;
                 var emailed = _e && _e.length && _e.length > 0;
                 var numbered = _n && _n.length && _n.length > 0;
                 var dated = _d && _d.length && _d.length > 0;
                 var currencyfield = _c && _c.length && _c.length > 0 && /text/gi.test(type);
                 var ssn = _m && _m.length && _m.length > 0 && /number|text/gi.test(type);

                 var confirm = input.dataset.valueConfirmField && input.dataset.valueConfirmField == 'true';
                 var required = input.required ||
                     dataset.valueConstraint && dataset.valueConstraint == 'mandatory' ||
                     false;

                 //normalize message for this input

                 var mincount = input.getAttribute('minlength') && parseInt(input.getAttribute('minlength')) || null;
                 var maxcount = input.getAttribute('maxlength') && parseInt(input.getAttribute('maxlength')) || null;

                 //normalize messages and validation states / conditions
                 input.validates = {
                     confirm: confirm,
                     required: required,
                     checkable: type == 'radio' || type == 'checkbox',

                     datetype: type == 'date' && input.dataset.valueTypeof || null,
                     numbertype: type == 'number' && input.dataset.valueTypeof || null,
                     texttype: type == 'text' && input.dataset.valueTypeof || null,
                     phonetype: type == 'phone' && mincount || null,
                     textareatype: type == 'textarea' && (mincount || maxcount) ? 'constrained' : 'nolimits',
                     //date

                     mincount: mincount,
                     maxcount: maxcount,
                 };



                 //initialize validations if needed
                 form.validations = form.validations || {};
                 form.validations[name] = form.validations[name] || [];

                 form.filter = form.filter || {};
                 form.filter[name] = form.filter[name] || [];
                 //** we can push multiple validators for each element */

                 if (required) {
                     form.validations[name].not_empty = Validators.not_empty;
                     input.validators.not_empty = Validators.not_empty;
                 }

                 if (zipped) {
                     form.validations[name].zip_code = Validators.zip_code;
                     form.filter[name].zip_code = Filters.zip_code;

                     input.validators.zip_code = Validators.zip_code;
                     input.filters.zip_code = Filters.zip_code;
                 }

                 if (numbered && type !== 'tel') {

                     form.validations[name].number = Validators.number;
                     form.filter[name].number = Filters.number;

                     input.validators.number = Validators.number;
                     input.filters.number = Filters.number;

                 }

                if ( type == 'password') {
                    form.validations[name].password = Validators.password;
                    form.filter[name].password = Filters.password;
                    input.validators.password = Validators.password;
                    input.filters.password = Filters.password;
                }

                if (type == 'text') {
                    form.validations[name].text = Validators.text;
                    input.validators.text = Validators.text;
                }
                if (type == 'textarea') {
                    form.validations[name].textarea = Validators.textarea;
                    input.validators.textarea = Validators.textarea;
                    form.filter[name].textarea = Filters.textarea;
                    input.filters.textarea = Filters.textarea;
                }

                if (type == 'select-one') {
                    form.validations[name].selectbox = Validators.selectbox;
                    input.validators.selectbox = Validators.selectbox;
                }
                if(type == 'checkbox'){
                    form.validations[name].checkboxButton = Validators.checkboxButton;
                    input.validators.checkboxButton = Validators.checkboxButton;
                }
                if(type == 'radio'){
                    form.validations[name].radioButton = Validators.radioButton;
                    input.validators.radioButton = Validators.radioButton;
                }
                 if ((type == 'textarea' || type == 'text') && maxcount) {
                     form.validations[name].max_length = Validators.max_length;
                     input.validators.max_length = Validators.max_length;
                 }

                 if (type == 'tel' || phoned) {
                     form.validations[name].phone_number = Validators.phone_number;
                     form.filter[name].phone_number = Filters.phone_number;
                     input.validators.phone_number = Validators.phone_number;
                     input.filters.phone_number = Filters.phone_number;
                 }

                 if (type == 'japanPhoneNumber' || j_phoned) {
                    form.validations[name].japanese_phone_number = Validators.japanese_phone_number;
                    form.filter[name].japanese_phone_number = Filters.japanese_phone_number;
                    input.validators.japanese_phone_number = Validators.japanese_phone_number;
                    input.filters.japanese_phone_number = Filters.japanese_phone_number;
                 }

                 if (type == 'ssn' || ssn) {
                    form.validations[name].ssn_number = Validators.ssn_number;
                    form.filter[name].ssn_number = Filters.ssn_number;

                    input.validators.ssn_number = Validators.ssn_number;
                    input.filters.ssn_number = Filters.ssn_number;
                }
				 if (type == 'currency' || currencyfield) {
                     form.validations[name].currency = Validators.currency;
                     form.filter[name].currency = Filters.currency;

                     input.validators.currency = Validators.currency;
                     input.filters.currency = Filters.currency;
                 }

                 // required method could already apply
                 if (type == 'date') {
                     form.validations[name].date = Validators.date;
                     input.validators.date = Validators.date;
                 }

                 if (confirm) {
                     // X-ref in both directions...
                     var _name = input.dataset.valueConfirmField;
                     input.confirmation = fields[_name];
                     fields[_name].confirmation = input;
                     form.validations[_name].confirm = Validators.confirm;

                     input.validators.confirm = Validators.confirm;
                 }

                 if (input.validates.texttype && input.validates.texttype != 'noRegex') {
                     form.validations[name].regex = Validators.regex;
                     input.validators.regex = Validators.regex;
                 }

                 if (input.validates.numbertype && input.validates.numbertype != 'noCons') {
                     form.validations[name].number = Validators.number;
                     form.filters[name].number = Filters.number;

                     input.filters.number = Filters.number;
                     input.validators.number = Validators.number;
                 }

                 if (type == 'email' || emailed) {
                     form.validations[name].email = Validators.email;
                     input.validators.email = Validators.email;
                 }

                 if ((type == 'text') && (name == 'acxiomCode' || name == 'zipCode')) {
                     form.validations[name].error_response_no_record = Validators.error_response_no_record;
                 }

                 if ((type == 'text') && (name == 'acxiomCode')) {
                     form.validations[name].error_response_record_present = Validators.error_response_record_present;
                 }

                 usbUtils.listenTo(input, 'change', Validators.validate);
                 usbUtils.listenTo(input, 'blur', Validators.validate);
                 //usbUtils.listenTo(button, 'click', Validators.validate);
                 //@TODO add form submit handler
                 Validators.filtering(input);
                 input.actions = Validators.inputActions(input);
             }
         }
         Validators.stateHideAndShowByCountry(form,container);
         var windowErrorUrl = window.location.pathname;
         var lastErrorItem = windowErrorUrl.substring(windowErrorUrl.lastIndexOf('/') + 1)
         if (lastErrorItem.includes(".error")) {
             var errwrap = document.querySelector('.form-errors');
             var heading = errwrap.querySelector('.heading');
             heading.textContent = form.words.errorFormerroronsubmission;
             errwrap.style.display = "block";
             var formCloseButton = errwrap.querySelector('.formclose-button')
             usbUtils.listenTo(formCloseButton, 'click', Validators.formAlertClose);
             usbUtils.listenTo(formCloseButton, 'keydown', Validators.formAlertClose);
         }
		 Validators.sessionStorageForUrlParams(form);
         if (submitbtn) {
             submitbtn.addEventListener('click', function(e) {
                 e.preventDefault();
                 var form = e.target.form;
                 var ssnText = document.getElementById('jform-ssn-itin');
                 if(ssnText){
                 ssnText.value=tempSsn;}
                 Validators.formReset(form);
                 form.submitEvent = e;
                 console.log('validating form', form);
                 Validators.formSubmit(form);
             });
             //submitbtn.addEventListener('click', Validators.submit(form));
         }
         if (button) {
             button.addEventListener('click', function(e) {
                 e.preventDefault();
                 var form = e.target.form;
                 var ssnText = document.getElementById('jform-ssn-itin');
                 if(ssnText){
                 ssnText.value=tempSsn;}
                 Validators.formReset(form);
                 form.submitEvent = e;
                 console.log('validating form', form);
                 Validators.formSubmit(form);
                 //button.addEventListener('click', Validators.submit(form));
             });
         }
         return form;
     }
     return null;
 };

Validators.getCookie = function(key) {
     var name = key + "=";
                var ca = document.cookie.split(';');
                for(var i=0; i<ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0)==' ') c = c.substring(1);
                    if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
                }
                return "";
 };

Validators.downloadPDF = function() {
    const queryParam = window.location.search;
	const params = new URLSearchParams(queryParam);
	const pdf = params.get("pdfPath");
    var fname = Validators.getCookie("firstname");
    fname=fname.replace(/%20/g, " ");
            //Download PDF cookie for ELAN PDF Download flow
            if (pdf && pdf.startsWith("/content/dam/") && pdf.endsWith(".pdf")) {
                window.open(pdf);
            }
            var inputs = $(".shield-text").find('.textContainer .body');
            for (var i = 0; i < inputs.length; i++) {
                var textvalue = $(inputs[i]).html();
                if (textvalue.indexOf('{firstname}') !== -1) {
                    var updated = textvalue.replace('{firstname}', (fname||''));
                    $(inputs[i]).html(updated);
                }
            }
};
///After thankyou page navigation firstname
if (document.referrer != "" && document.referrer != window.location.href) {
    Validators.downloadPDF();
    //Getting Text Component Value & updating values for ELAN PDF download flow.

}
 /**
  *
  * @param {*} event
  *  . passes element from event to validations of that element
  */
 Validators.validate = function(e) {
     e.target.callEvent = e;
     return Validators.validation(e.target);
 };


 Validators.filtering = function(input) {
     for (var _f in input.filters) {
         var filter = input.filters[_f];

         if (typeof filter == 'function') {
             if (/(zip_code|phone_number|number|password|textarea|currency|ssn|japanese_phone_number)/.test(filter.name)) {
                 usbUtils.listenTo(input, 'keyup', filter);
             } else {
                 usbUtils.listenTo(input, 'change', filter);
             }
         }

     }
 };

 // ______ Form Actions ------------start
 Validators.formActions = function(form) {
     return {
         validate: function() { return Validators.formValidate(form); },
         filter: function(form) { return Validations.formFilter(form); },
         submit: function(form) { return {}; },
     };
 };

 Validators.formData = function(form) {
     var data = {};
     Object.keys(form.fields).forEach(function(f) {
         var field = form.fields[f];
         return data[field.name] = field.value;
     });
     return data;
 };

 Validators.submitSuccess = function(data) {
     //provides redirect
     /**
      * parse response on success
      * . validation against actual service still pending
      * . redirect after success mechanism is still needed
      */
     if (formSubmitted) {
         var container = formSubmitted.closest('.form-container');
         var formRedirectEl = container.querySelector("input[name='redirect']");
         var state = data.msgType;
         if (state == undefined) {
             Validators.attachFormError(container, formSubmitted.words.errorBackend);
         }
         switch (state.toLowerCase()) {
             case 'success':
                 //redirect on success
                 if (successRedirect) {
                     document.location = successRedirect;
                 } else if (formRedirectEl && formRedirectEl.value) {
                     document.location = formRedirectEl.value;
                 } else {
                     // slide form up and remove
                     // container.classList.add('remove');
                     // setTimeout(function(){container.remove();},500);
                 }
                 break;
             case 'error':

                 Validators.initPostResponseError(data, container);
                 Validators.formValidate(formSubmitted);
                 Validators.setFormErrorsPostResponse(container);

                 Validators.scrollToViewErrors(formSubmitted);
                 break;
         }
     }
 };

  Validators.beforeSend = function () {
    // provides functionality before ajax call
    var container = formSubmitted.closest('.form-container');
    var formId = container.querySelector("input[name='form-id']").value;
    switch (formId) {
      case 'acxiom-form':
	  case 'mortgage-leadform':
        if (formSubmitted) {
          var submitbtn = formSubmitted.querySelector('button[type="submit"]') || formSubmitted.querySelector('input[type="submit"]');
          submitbtn.disabled = true;
        }
      break;
    }
  };

  Validators.complete = function (data) {
    // provides functionality after ajax call is complete
    var container = formSubmitted.closest('.form-container');
    var formId = container.querySelector("input[name='form-id']").value;
    switch (formId) {
      case 'acxiom-form':
	  case 'mortgage-leadform':
        if (formSubmitted) {
          var submitbtn = formSubmitted.querySelector('button[type="submit"]') || formSubmitted.querySelector('input[type="submit"]');
          submitbtn.disabled = false;
        }
      break;
    }
  };

 Validators.initPostResponseError = function(data, container) {
     var formId = container.querySelector("input[name='form-id']").value;
     switch (formId) {
         case 'acxiom-form':
             var axiomInput = container.querySelector("input[name='acxiomCode']");
             var axiomZip = container.querySelector("input[name='zipCode']");
             axiomInput.dataset.errResponseMsg = data.msgDescription;
             axiomZip.dataset.errResponseMsg = data.msgDescription;
             break;
     }
 };

 Validators.setFormErrorsPostResponse = function(container) {
     Validators.clearFormErrors();
     var formId = container.querySelector("input[name='form-id']").value;
     switch (formId) {
         case 'acxiom-form':
             if (AcxiomForm.isNoRecordRes) {
                 Validators.attachFormError(container, formSubmitted.words.errorAcxiomnomatch);
             } else if (AcxiomForm.isRecordPresent) {
                 Validators.attachFormError(container, formSubmitted.words.errorAcxiomcodeused);
             }
             break;
     }
 };

 Validators.formReset = function(form) {
     formSubmitted = null;

     var container = form.closest('.form-container');
     var formId = container.querySelector("input[name='form-id']").value;
     switch (formId) {
         case 'acxiom-form':
             AcxiomForm.isNoRecordRes = false;
             AcxiomForm.isRecordPresent = false;
             break;
     }
 };

 Validators.submitError = function(data) {
     console.log('service error', data);
     var errdiv = document.querySelector('.form-errors');
     Validators.attachMessage(formSubmitted, errdiv, [{ message: formSubmitted.words['errorSubmit'] }]);
     Validators.scrollToViewErrors(formSubmitted);
 };

  Validators.myOfferForm = function(form) {
     var container = form.closest('.form-container');
     var formId = container.querySelector("input[name='form-id']").value;
     var confirmationCode = container.querySelector("input[name ^='Confirmation'] ") || container.querySelector("input[name ^='confirmation'] ");
     var zipCode = container.querySelector("input[name = 'zipCode']") || container.querySelector("input[name = 'zipcode']");
     if(formId == "myoffer-form"){
         form.action = form.action + "/" + confirmationCode.value + "/" + zipCode.value;
     }
  };

 Validators.formSubmit = function(form) {
	 Validators.clearFormErrors();
     var validated = Validators.formValidate(form);
	 var useAjax = form.words.useAjax == 'true';
     form.dataset.useAjax = useAjax;
     console.log('validated', validated);
     var isAuthor = (document.cookie.indexOf('cq-authoring-mode') >=0);
     if (validated.valid) {

         Validators.clearAllErrors();
         formSubmitted = form;
         var captchaComp = document.getElementsByClassName('g-recaptcha');
         Validators.dateFormatingForSalesForce(form);
          Validators.myOfferForm(form);
         if (!useAjax) {
            if (captchaComp && captchaComp.length > 0 && !isAuthor) {
                form.id = "recaptcha-form";
                validate(form.submitEvent);
            }else{
                form.submit();
            }
         } else {
             if (captchaComp && captchaComp.length > 0 && !isAuthor) {
                form.id = "recaptcha-form";
                validate(form.submitEvent);
             }else{
                Validators.success(form);
             }
         }
     } else {
         // @NOTE: generalize and move to reusable lib such as usbUtils
         var errwrap = document.querySelector('.form-errors');
         var heading = errwrap.querySelector('.heading');
         var errmess = errwrap.querySelector('.error.messages');
         var successmess = document.querySelector('.form-success');
         errwrap.style.display = "block";
         var formCloseButton = errwrap.querySelector('.formclose-button')
         usbUtils.listenTo(formCloseButton,'click', Validators.formAlertClose);
         usbUtils.listenTo(formCloseButton,'keydown', Validators.formAlertClose);

         Validators.scrollToViewErrors(form);
         successmess.style.display = "none";        // Validators.attachMessage(form, errdiv, [{message: form.words.errorForm}]);
         heading.textContent = form.words.errorForm;

         //@NOTE Page Errors Provides ul list of all existing errors
         var container = form.closest('.form-container');
         var formId = container.querySelector("input[name='form-id']").value;
         var finalHtml = '';
         switch (formId) {
             case 'acxiom-form':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
             case 'email-form':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
			case 'mortgage-leadform':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
            case 'salesforce-form':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
            case 'marketo-form':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
            case 'marketing-automation-form':
                 finalHtml = Validators.generateFormErrorsList(form, false, true);
                 break;
             default:
                 finalHtml = Validators.generateFormErrorsList(form, true, false);
                 break;
         }
         errmess.appendChild(finalHtml);
         Validators.taxpayerLoader();
         Validators.taxTypeSelection();
         Validators.usNonUsphoneNumberLoader();
         Validators.stateHideAndShowByCountry(form,container);
     }

 };
 Validators.success = function(form) {
    postage = Object.assign(postage, {
              url: form.action,
              action: form.action,
              data: Validators.formData(form),
              error: Validators.submitError,
              success: Validators.submitSuccess,
              beforeSend: Validators.beforeSend,
              complete: Validators.complete
          });
          Validators.formAriaLiveOn(form);
          Validators.service(postage);

         var successmessage = document.querySelector('.form-success');
       	 var successheading  = successmessage.querySelector('.success-heading')
         var onpageconfirmation = successmessage.getAttribute('data-onpageConfirmation');
         var container = form.closest('.form-container');
         var pdfpath = container.querySelector("input[name='pdfpath']").value;
          var onpagecta = document.querySelector('.onpage-success-placeholder');
         if(onpageconfirmation == "true"){
             setTimeout(() => {
                var windowErrorUrl = window.location.pathname;
                var lastErrorItem = windowErrorUrl.substring(windowErrorUrl.lastIndexOf('/') + 1)
                if (lastErrorItem.includes(".error")) {
                   successmessage.style.display = "none";
                }else{
                    successmessage.classList.remove('hide');
                    successmessage.style.display = "block";
                    if(onpagecta){onpagecta.classList.remove('hide');form.classList.add('hide');}
                }
                var formCloseButton = successmessage.querySelector('.formclose-button')
                usbUtils.listenTo(formCloseButton,'click', Validators.formAlertClose);
                usbUtils.listenTo(formCloseButton,'keydown', Validators.formAlertClose);
             }, "1000");
        //a11y focus for success message
        setTimeout(function() {
            successheading.focus();
            successmessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 2000);
        Validators.clearAllValue(form);
            if(pdfpath != ""){
                Validators.downloadPDF();
            }
         }
 };

 Validators.generateFormErrorsList = function(form, isTagRequired, isLinksRequired) {
     var html = usbUtils.createElement('ul');
     for (var _e in form.errors) {
         var elerros = form.errors[_e];
         if (elerros.length > 0) {
             var li = usbUtils.createElement('li');
             var messages = elerros.map(function(v) {
                 return v.message;
             });

             if (isTagRequired) {
                 var eltag = usbUtils.createElement('span', { class: 'bold' });
                 eltag.textContent = elerros[0].inputlabel + ': ';
                 li.appendChild(eltag);
             }

             var messpan = usbUtils.createElement('span', { class: 'text' });
             var finalMsgStr = messages.join(', ');

             if (isLinksRequired) {
                 // Split the message string based on input label and add hyperlink to the input label.
                 var inputLabel = elerros[0].inputlabel.toLowerCase();
                 var inputId = elerros[0].inputid;
                 var subs = finalMsgStr.split(new RegExp('(' + inputLabel.replace('?','\\?') + ')', "gi"));
                 for (var sub in subs) {
                     if (subs[sub].toLowerCase() != inputLabel && subs[sub] != "") {
                         var textTag = usbUtils.createElement('span');
                         textTag.textContent = subs[sub];
                         messpan.appendChild(textTag);
                     } else if (subs[sub].toLowerCase() == inputLabel && subs[sub] != "") {
                         var linkTag = usbUtils.createElement('a', { href: '#' + inputId });
                         linkTag.textContent = subs[sub];
                         linkTag.form = form;
                         usbUtils.listenTo(linkTag,'click', Validators.inPageHandler);
                         usbUtils.listenTo(linkTag,'click', Validators.errorFieldFocusing);
                         usbUtils.listenTo(linkTag,'keydown', Validators.errorFieldFocusing);
                         messpan.appendChild(linkTag);
                     }
                 }
             } else {
                 messpan.textContent = finalMsgStr;
             }

             li.appendChild(messpan);
             html.appendChild(li);
         }
     }
     return html;
 };

 Validators.formFilter = function(form) {
     for (var input in form.fields) {
         for (var filter in input.getFilters) {
             filter.filter(input);
         }
     }
 };

 Validators.formValidate = function(form) {
     var valid = true;
     var messages = {};
     var validform = true;
     for (var i in form.fields) {
         var input = form.fields[i];
         if (input.type != 'hidden' && input.type != "submit" && input.required != false) {

             var validated = input.actions && input.actions.validate();
             valid = validated && validated.valid || false;

             if (!validated.valid)
                 validform = false;
             messages[input.name] = validated.message;

         }
     }
     return { valid: validform, messages: messages };
 };

// _______ Form Error Navigation ______start
// @NOTE: this may be just an iOS only shim for a bug in iOS where the anchor link puts focus on a input
// fix for https://jira.us.bank-dns.com/browse/SHOPPLAT-3390
 Validators.inPageHandler= function (e) {
     e.preventDefault();
     var selected = e.target;
     //as long as its within the form then things should announce as expected
     var messageBox = document.querySelector('.form-message-container');
     if (selected && selected.getAttribute('href')) {
         var refparts = selected.getAttribute('href').split('#');
         var destref  = refparts[refparts.length-1];
         if(destref) {
             let dest = document.getElementById(destref);
             setTimeout(function() {
                dest.focus();
                 dest.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);

             if(usbUtils.isIOS()) {
                 //when we are piping messages to the messageBox aria-live during error nav,
                 //results in the error above the destination input getting read as well
                 Validators.formAriaLiveOff(selected.form);
                 e.stopImmediatePropagation();
                 var span = usbUtils.createElement('span',{class:'sr-only'});
                 span.textContent = dest.name +': '.concat(dest.getAttribute('aria-label') || dest.name);
                 messageBox.innerHTML = '';
                 messageBox.appendChild(span);
             }

         }
     }
 };

 /**
  *
  * @param {HTMLElment} form
  */
 Validators.formAriaLiveOn= function (form) {
     if(form && form.ariaLives) {
        form.ariaLives.forEach( function(el){el.setAttribute('aria-live','polite')});
     }
 };

 /**
  *
  * @param {HTMLElement} form:
  */
 Validators.formAriaLiveOff= function (form) {
     var messageBox = document.querySelector('.form-message-container');
     if (form && form.ariaLives ) {
        form.ariaLives.forEach(function (input){ input.removeAttribute('aria-live')});
     }
     if(messageBox) messageBox.setAttribute('aria-live','polite');
 };

// _______ Form Error Navigation ______end


 // ______ Form Actions ------------end

 // @TODO replace with something like usbUtils.service when that gets created
 /**
  *
  * @param {*} postage: default Object for service parameters
  * @returns aSync methods of success or error are called on response
  */
 Validators.service = function(postage) {

     var result = null;
     $.ajax({
         type: postage.type, // POST | GET
         url: postage.url,
         data: postage.data,
         dataType: postage.dataType,
         beforeSend: postage.beforeSend,
         complete: postage.complete,
         success: function(data) {
             postage.success(data);
             result = data;
         },
         error: function(data) {
             if (typeof postage.error == 'function') {
                 postage.error(data);
             }
             result = data;
         }
     });
     return result;

 };

 // ______ Input Actions ------------start
 /**
  *
  * @param {*} input
  * @returns list of methods for that element
  */
 Validators.inputActions = function(input) {
     return {
         validate: function() { return Validators.validation(input); },
         getValidators: function() { return input.validators; },
         getFilters: function() { return input.filters; },
     };
 };

 Validators.attachMessage = function(el, error_div, messages) {
     Validators.clearErrors(error_div);
     var message = error_div.querySelector('.messages') || error_div;
     var err_content = Validators.messages(messages);
     var wrapper = el.closest('.fieldset') || el.closest('.form-container');
     var id = error_div.getAttribute('id');

     message.appendChild(err_content);
     error_div.classList.remove('hide');
     error_div.setAttribute('aria-hidden', 'false');
     if (/(radio|checkbox)/.test(el.type)) {
        el.setAttribute("aria-checked","false");
     }
     el.setAttribute('aria-describedby', id);
     wrapper.classList.add('error');

 };

 Validators.attachFormError = function(container, errorMessage) {
     var formErrDiv = container.querySelector('.form-errors');
     var successDiv = container.querySelector('.form-success');
     var formHeading = formErrDiv.querySelector('.heading');
     formErrDiv.style.display = "block";
     successDiv.style.display = "none";
     formHeading.textContent = errorMessage;
 };

 Validators.validation = function(input) {
     var form = input.form;
     var validators = form.validations[input.name];
     var error_div = document.getElementById('field-error-' + input.id);
     if (/(radio|checkbox)/.test(input.type)) {
        if(input.closest('.checkboxes').id !=''){
            var error_div_id = input.closest('.checkboxes').id;
            var error_div = document.getElementById('field-error-' + error_div_id);
        }
     }
    if (/(select)/.test(input.type)) {
      Validators.employmentStatus(form, input);
      Validators.foreignAddress(form, input);
	  Validators.statePrefecture(form, input); //To hide state when user select country as USA.
    }
     if (/(radio|checkbox)/.test(input.type)) {
       Validators.incomeDescription(form, input);
     }
     var valid = false;
     var messages = [];

     form.errors = form.errors || {};
     form.errors[input.name] = [];
     if (Object.keys(validators).length > 0) {
         if ("not_empty" in validators) {
             var validated = Validators.constructErrorMsg(input, validators['not_empty'], form.errors);
             valid = validated.valid;
             messages = validated.messages;

         }
         if (input.value && ((validated != undefined && validated.valid) || !("not_empty" in validators))) {
             var flag = true;
             for (var i in validators) {
                 var validated = Validators.constructErrorMsg(input, validators[i], form.errors);
                 if (!validated.valid) flag = false;
             }
             valid = flag;
             messages = validated.messages;
         }


         if (form.errors[input.name].length > 0)
             Validators.attachMessage(input, error_div, form.errors[input.name]);
         else if (error_div)
             Validators.clearErrors(error_div);
     } else {
         valid = true;
     }
     return {
         valid: valid,
         messages: messages
     };

 };

 // ______ Input Actions ------------end

 Validators.constructErrorMsg = function(input, validator, errors) {
     var validated = validator && validator(input);
     if (typeof validated == 'object') {
         if (!validated.valid) {
             var label = input.labels[0];
             if (label) label.textContent.replace('\n', '').trim().split(' ').join('-');
             errors[input.name].push({
                 message: validated.message,
                 label: label,
                 inputlabel: input.getAttribute('data-value-title'),
                 inputid: input.getAttribute('id')
             });
         }
     }
     return {
         valid: validated.valid,
         messages: validated.message
     };
 };

Validators.clearAllValue= function(form) {
    document.getElementById(form.id).reset();
    var fieldset = document.querySelectorAll('.fieldset');
    fieldset.forEach(function(e) {
    e.classList.remove('active');
    });
    if(document.querySelector('.textarea')){
        var textareaCount = document.querySelector('.textarea .count');
        textareaCount.style.display = "none";
    }
};

 Validators.clearAllErrors = function() {
     document.querySelectorAll('.errors').forEach(function(el) {
         Validators.clearErrors(el);
     });
     Validators.clearFormErrors();
 };

 Validators.clearFormErrors = function() {

     var errwrap = document.querySelector('.form-errors');
     var heading = errwrap.querySelector('.heading');
     var errmess = errwrap.querySelector('.error.messages');

     if (errwrap) {
         errwrap.classList.add('hide');
         errwrap.style.display = 'none';
     }

     if (heading) heading.innerHTML = null;
     if (errmess) errmess.innerHTML = null;


 };

 Validators.clearErrors = function(errdiv) {
     var message = errdiv.querySelector('.messages') || errdiv;
     var id = errdiv.getAttribute('id');
     if (message) {
         // console.log('clear error', errdiv);
         var fieldset = errdiv.closest('.fieldset') || errdiv.parentElement.querySelector('.fieldset');
         if (fieldset)
             var input = fieldset.querySelector('[aria-describedby="' + id + '"]');
         if (input) {
             input.removeAttribute('aria-describedby');
         }
         fieldset.classList.remove('error');

         errdiv.classList.add('hide');
         errdiv.setAttribute('aria-hidden', 'true');
         message.innerHTML = '';
     }
 };

 /** builds html error element to fill the aria-live errors of the input that is being proocessed
  *
  * @param {*} errors [{valid:boolean, messages: Array({valid:boolean, message: string})}]
  * @returns HTMLElement
  */
Validators.messages = function(errors) {
    if(errors.length==1) {
        var singleerror = document.createElement('span');
        singleerror.className = 'message ' + errors[0].label;
        singleerror.setAttribute('aria-live','polite');
        singleerror.textContent = errors[0].message;
        return singleerror;
    } else {
     var ul = document.createElement('ul');
     for (var e in errors) {
         var li = document.createElement('li');
         li.className = 'message ' + errors[e].label;
         li.setAttribute('aria-live','polite');
         li.textContent = errors[e].message;
         ul.appendChild(li);
     }
     return ul;
    }
 };


 //@NOTE not called .. evaluates its usefulness
 Validators.dating = function(stat) {
     var date = new Date(date);
     if (stat.days)
         date.setDate(date.getDate() + stat.days);
     if (stat.months)
         date.setDate(date.getMonth() + 1 + stat.months);
     if (stat.years)
         date.setDate(date.getYear() + stat.years);
     return Filters.widgetDate(result);
 };

 Validators.transforms = function(form) {
    successRedirect = $(form).find("input[name=':redirect']") ? $(form).find("input[name=':redirect']").val() : null;
    var cpagePath = $('meta[data-cpagepath]') ? $('meta[data-cpagepath]').attr('data-cpagepath') : false;
    var formId = Math.floor(Math.random() * 1000);
    var formIdElement = document.querySelector("input[name='form-id']");
    if (formIdElement) {
       if (formIdElement.value === 'marketo-form' || formIdElement.value === 'marketing-automation-form') {
           (function (d, b, a, s, e) {
               var t = b.createElement(a),
                   fs = b.getElementsByTagName(a)[0];
               t.async = 1;
               t.id = e;
               t.src = s;
               fs.parentNode.insertBefore(t, fs);
           })
               (window, document, 'script', 'https://tag.demandbase.com/aa89efc69efa3cdb.min.js', 'demandbase_js_lib');
       } else {
           form.appendChild(usbUtils.createElement('input', { type: 'hidden', name: 'formId', value: formId }));
       }
    }
    if (cpagePath) {
        form.appendChild(usbUtils.createElement('input', { type: 'hidden', name: 'cpagepath', value: cpagePath }));
    }
};

 Validators.scrollToViewErrors = function(form) {
     var body = document.querySelector('body');
     //var first = form.querySelector('div.fieldset.error');
     var errsection = body.querySelector('.form-errors');
     var errheading = errsection.querySelector('.error-heading');
     errheading.focus();
     //old code removed not focusing field error now only we have error container

 };
 if (performance.navigation.type == 2) {
     location.reload(true);
 }

 var AcxiomForm = {
     noMatchingRecord: "No matching record found with the entered Acxiom and Zip combination.",
     leadAlreadySubmitted: "Lead already submitted with this Acxiom Id.",
     isNoRecordRes: false,
     isRecordPresent: false
 };


 Validators.errorFieldFocusing = function (event){
    if ((event.type === "keydown" && event.keyCode == 13) || event.type === 'click') {
        event.preventDefault();
        var selected = event.target;
        var targetElementHref = selected.getAttribute('href');
            if (targetElementHref) {
            var refparts = targetElementHref.split('#');
            var targetElementId  = refparts[refparts.length-1];
            var targetElement = document.getElementById(targetElementId);
                if (targetElement) {
                    setTimeout(function() {
                        targetElement.focus();
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 500);
                }
            }
    }
 };

 Validators.formAlertClose = function (event) {
    if ((event.type === "keydown" && event.keyCode == 13) || event.type === 'click') {
        event.preventDefault();
         document.querySelector('.form-errors').style.display = "none";
         document.querySelector('.form-success').style.display = "none";
        var submitbtn =  document.querySelector('button[type="button"]') || document.querySelector('button[type="submit"]') || document.querySelector('input[type="submit"]');
        submitbtn.focus();
    }
};
Validators.preFillFormElements = function (urlParams) {
    var formIdElement = document.querySelector("input[name='form-id']");
    if (formIdElement) {
        var formId = formIdElement.value;
        switch (formId) {
            case 'acxiom-form':
                if (urlParams && urlParams.USERCHAR1) {
                    var axiomInput = formIdElement.form.querySelector("input[name='acxiomCode']");
                    axiomInput.value = urlParams.USERCHAR1;
                    axiomInput.focus();
                }
                break;
            case 'mortgage-leadform':
                var dynamicTextNode = document.querySelector(".formheading .consultant-name");
                var goalsCoachNode = formIdElement.form.querySelector("input[name='goalscoach-name']");
                if (dynamicTextNode && urlParams && urlParams.FirstName && urlParams.LastName && urlParams.Email) {
                    dynamicTextNode.textContent = urlParams.FirstName + ' ' + urlParams.LastName;
                    var mloEmailField = formIdElement.form.querySelector("input[name='MLO']");
                    mloEmailField.value = urlParams.Email;
                }
                else if (goalsCoachNode && urlParams && urlParams.FirstName && urlParams.LastName && urlParams.Email){
                    var goalsCoachnameInput = formIdElement.form.querySelector("input[name='Goals_coach_name']");
                    goalsCoachnameInput.value = urlParams.FirstName + ' ' + urlParams.LastName;
                    goalsCoachnameInput.focus();
                    var goalscoachEmailField = formIdElement.form.querySelector("input[name='goalsCoachEmail']");
                    goalscoachEmailField.value = urlParams.Email;
                }
                break;
        }
    }
}

/*
THIS IS FOR JAPANIES UNION BANK FORM VALIDATION.
*/
function referenceFoundFor(element) { return element !== null && typeof element !== 'undefined'; }
/*
 * japaneseFieldHideAndShow() This method for hide and show the japanese form input fields
 * there are three parameters
 * inputField - is element,
 * passing the boolean for behaviour to hide and show the field,
 * passing the boolean for valueRemover to remove the value
 * usNonUsphoneNumberLoader() this method for load the US and Non-US Phone number
 * taxTypeSelection() this method for load the SSN and ITIN number
*/
Validators.japaneseFieldHideAndShow = function(inputField,behaviour,valueRemover){
    if(behaviour == true){
    inputField.closest('.form-element').style.display='block';
    inputField.setAttribute('required','required');
    }else{
    inputField.closest('.form-element').style.display='none';
    inputField.removeAttribute('required');
    inputField.closest('.form-element').querySelectorAll('.errors').forEach(function(el) { Validators.clearErrors(el);});
        if(valueRemover == true){ inputField.value = ''; }

        if(inputField.id !=''){
            var pagelevelErrMsg = document.querySelector("a[href='#"+inputField.id+"']");
            if(referenceFoundFor(pagelevelErrMsg)){
                pagelevelErrMsg.closest('li').remove();
            }
        }
    }
};

Validators.usNonUsphoneNumberLoader = function(){
    var phoneNumberType = document.querySelector('#japanesePhoneType');
    var UsNumber = document.querySelector('#UsNumber');
    var NonUsNumber = document.querySelector("#NonUsNumber");
    if(referenceFoundFor(phoneNumberType && UsNumber && NonUsNumber)){
        var valueOfPhoneType = phoneNumberType.value.toLowerCase();
        if(valueOfPhoneType =="us"){
            Validators.japaneseFieldHideAndShow(UsNumber,true,false);
            Validators.japaneseFieldHideAndShow(NonUsNumber,false,true);
        }else if(valueOfPhoneType =="nonus" || valueOfPhoneType =="japan"){
            Validators.japaneseFieldHideAndShow(NonUsNumber,true,false);
            Validators.japaneseFieldHideAndShow(UsNumber,false,true);
        }
        else if(valueOfPhoneType =="both"){
            Validators.japaneseFieldHideAndShow(UsNumber,true,false);
            Validators.japaneseFieldHideAndShow(NonUsNumber,true,false);
        }else{
            Validators.japaneseFieldHideAndShow(UsNumber,false,true);
            Validators.japaneseFieldHideAndShow(NonUsNumber,false,true);
        }
    }
};

Validators.taxTypeSelection = function(){
    var taxIdType = document.querySelector('#japaneseTaxType');
    var ssnNumber = document.querySelector("#japaneseSsnNumber");
    if(referenceFoundFor(taxIdType && ssnNumber)){
        var taxIdValue = taxIdType.value.toLowerCase();
        if(taxIdValue =="ssn"){
            Validators.japaneseFieldHideAndShow(ssnNumber,true,false);
            var disclaimerOption = document.querySelectorAll("input[type='radio'][name='japaneseDisclaimer']");
            if(referenceFoundFor(disclaimerOption)){
                disclaimerOption.forEach(function(el) {
                   el.removeAttribute("disabled");
                   el.removeAttribute("checked");
                });
            }
        }else{
            Validators.japaneseFieldHideAndShow(ssnNumber,false,true);
            var disclaimerOption = document.querySelectorAll("input[type='radio'][name='japaneseDisclaimer']");
            if(referenceFoundFor(disclaimerOption)){
                disclaimerOption.forEach(function(el) {
                   if(el.value !='' && el.value.toLowerCase() == 'no'){
                        el.checked=true;
                        el.closest('.form-element').querySelectorAll('.errors').forEach(function(elErr) { Validators.clearErrors(elErr);});
                    }
                   el.setAttribute("disabled","disabled");
                   Validators.taxpayerLoader();
                   el.closest('label').addEventListener('mousedown', function(event) {
                    event.stopImmediatePropagation();
                   }, true);
                });

            }
        }
    }
};

Validators.taxpayerLoader = function(){
    var element = document.querySelectorAll("input[type='radio'][name='japaneseDisclaimer']");
    var TaxpayerRTE = document.querySelector('#japaneseTaxPayerRte');
    var taxpayer = document.querySelector("input[type='checkbox'][name='japaneseTaxPayerInfo']");
    if(referenceFoundFor(TaxpayerRTE && taxpayer && element)){
        var list = Array.from(element);
        var selected = list.filter(function(v, i) {
             return v.checked == true;
        });
        var taxpayerNextSibling = taxpayer.getAttribute('data-label-text')?taxpayer.getAttribute('data-label-text').replace('I,',''):'';
        TaxpayerRTE.closest('.component-container').classList.remove('vpad-24');
        TaxpayerRTE.closest('.component-container').classList.add('vpad-0');

        if(selected.length > 0 && selected[0].value.toLowerCase() == 'yes'){
            TaxpayerRTE.closest('section').style.display='block';
            var ssnNumber = document.getElementById("japaneseSsnNumber");
            if(referenceFoundFor(ssnNumber)){
                document.getElementById("japaneseSsnAndItinLoader").innerHTML= ssnNumber.getAttribute('data-ssnvalue');
            }

            var Fname = document.getElementById('japaneseFirstName');
            var Lname = document.getElementById('japaneseLastName');
            var firstName = Fname?Fname.value+' ':' ';
            var lastName = Lname?Lname.value+', ':' ';
            var taxpayerLabelContent = 'I, '+firstName+lastName+taxpayerNextSibling;
            taxpayer.nextElementSibling.innerHTML= taxpayerLabelContent;
            taxpayer.setAttribute('aria-label',taxpayerLabelContent);
            Validators.japaneseFieldHideAndShow(taxpayer,true,false);
        }
        else{
            TaxpayerRTE.closest('section').style.display='none';
            Validators.japaneseFieldHideAndShow(taxpayer,false,false);
        }
}

};

Validators.ssnUnMasking = function(val){
    String.prototype.replaceAt=function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
    }

    if (typeof value !== 'string') {
        value = "";
    }

    if (!val) {
        value = null;
        return;
    }

    var cleanVal = val.replace(/[^0-9|\\*]/g, '');
    cleanVal = cleanVal.substr(0, 9);
    for (let i = 0, l = cleanVal.length; i < l; i++) {
        if (/[0-9]/g.exec(cleanVal[i])) {
            value = value.replaceAt(i, cleanVal[i]);
        }
    }

    value = value.substr(0, cleanVal.length);
    var displayVal = value.substr(0, 9);
    if (displayVal.length >= 4) {
      displayVal = displayVal.slice(0, 3) + '-' + displayVal.slice(3);
    }

    if (displayVal.length >= 7) {
      displayVal = displayVal.slice(0, 6) + '-' + displayVal.slice(6);
    }

    return displayVal;
  };

  Validators.stateHideAndShowByCountry = function(form,container){
    if(form && form.querySelector('.countryField') && form.querySelector('.stateField') && (form.querySelector("input[name='form-id']").value == "marketo-form" || form.querySelector("input[name='form-id']").value == "marketing-automation-form")){
        const stateField = form.querySelector('.stateField');
        const countryField = form.querySelector('.countryField');
        if(countryField.value == 'United States'){
           stateField.closest('.form-element.state').style.display='block';
           stateField.setAttribute('required',true);
           stateField.setAttribute('data-value-constraint',true);
        }else{
           stateField.closest('.form-element.state').style.display='none';
           stateField.value = "";
           stateField.removeAttribute('required');
           stateField.removeAttribute('data-value-constraint');
           if(stateField.id !=''){
                stateField.closest('.form-element').querySelectorAll('.errors').forEach(function(el) { Validators.clearErrors(el);});
                var pagelevelErrMsg = container?container.querySelector("a[href='#"+stateField.id+"']"):'';
                if(referenceFoundFor(pagelevelErrMsg)){
                    pagelevelErrMsg.closest('li').remove();
                }
            }
        }
    }
  };
  
  /* 
   Validators.dateFormatingForSalesForce(form) 
   * This is for Sales Force form. 
   * It will use to change the date format as mm/dd/yyyy and send the formated date to the backend
   * Also here once date formated that value will be assigned for a hidden input.
   * And will be removed the name of existing date type input. 
   * it will prevent the duplication of field, sent to the backend.
   * And this method will be executed after the submit button trigged and all the form level validation completed 
  */
  Validators.dateFormatingForSalesForce = function(form){
    var formIdElement = form.querySelector("input[name='form-id']");
    if (formIdElement.value == 'salesforce-form'){
        var newDate = function(_date){
            return '_m/_d/_y'
                .replace('_m', ('0' + (_date.getMonth() + 1)).slice(-2))
                .replace('_d', ('0' + _date.getDate()).slice(-2))
                .replace('_y', _date.getFullYear());
        }
        
        var dateOfForm = form.querySelectorAll("input[type=date]");
        if(dateOfForm){
            dateOfForm.forEach(function(el){
                if(el.hasAttribute('data-name') && el.dataset.name !='' && el.value !='' && el.value != undefined){
                     var _n = el.value;
                    var elValue = new Date(_n.replace(/-/g, '\/'));
                    if(form.querySelector("input[type=hidden][name='"+el.dataset.name+"']")){
                        form.querySelector("input[type=hidden][name='"+el.dataset.name+"']").value = newDate(elValue);
                    }else{
                        form.appendChild(usbUtils.createElement('input', { type: 'hidden', name: el.dataset.name, value: newDate(elValue) }));
                    }
                    el.name = '';
                }
            });
        }
    }
};

/*session Storage creation for salesforce form*/
 Validators.sessionStorageForUrlParams = function(form){
     let url = window.location.search;
     let valid = false;      
     if(url.length > 0){
        const n = new URLSearchParams(url);
        const entries = n.entries();
         for(const entry of entries) {
            let hiddenInputs = form.querySelectorAll("input[id^='form-hidden']");
             for(let hiddenInput of hiddenInputs) {
              if(hiddenInput.value.toLowerCase() == entry[0].toLowerCase()){                  
                  const params = Object.fromEntries(n);
                  sessionStorage.setItem( hiddenInput.value.toLowerCase() , entry[1]);
                  sessionStorage.setItem('sessionValues' , JSON.stringify(params));
                  let obj = (sessionStorage.getItem('sessionValues')).replace(/['"]+/g, '');
                  valid = true;
                }
            }
         }        
       }else{
        if(sessionStorage.getItem('sessionValues') != null){
            let obj = (sessionStorage.getItem('sessionValues')).replace(/['"]+/g, '');
            let hiddenInputs = form.querySelectorAll("input[id^='form-hidden']");
            for(let hiddenInput of hiddenInputs) {
                if(obj.includes(hiddenInput.value.toLowerCase())){  
                    valid = true;
                }
            }
        }
      }  
      if(valid == true){        
      document.getElementById("urlParams").value = (sessionStorage.getItem('sessionValues')).replace(/['"]+/g, '').toString();
     }
     var formType = form.querySelector("input[name='form-id']").value;
        if (formType == 'salesforce-form'){
            let leadFormInput = form.querySelector('input[id="leadFormId"]');  
                if(leadFormInput != null){
                    leadFormInput.value = form.getAttribute('data-salesforceleadid');
                }
        }  
        else{
            form.removeAttribute('data-salesforceleadid');
        }
    };

Validators.employmentStatus = function(form, input) {
    if (input.id == 'jform-emp-status') {

        var employer =document.querySelector('#jform-employer-name');
        var employmentDate =document.querySelector('#jform-emp-start-date');
        if (input.value == 'FTEMP' || input.value == 'PTEMP' || input.value == 'SELF') {
            if(employer){
            	fieldvalidationsCheck(form, employer)
            }
            if(employmentDate){
            	fieldvalidationsCheck(form, employmentDate)
            }
        } else {
            if(employer){
            	fieldvalidationsClear(form, employer)
            }
            if(employmentDate){
            	fieldvalidationsClear(form, employmentDate)
            }
            }
        }
};

Validators.incomeDescription  = function(form, input) {
    if (input === form.querySelector('#jform-income-sources input[value="OTHR"]')) {
        var incomeDesc = form.querySelector("#jform-income-source-desc");
        if (input.value == 'OTHR') {
            if(input.checked){
                if(incomeDesc){    
                    fieldvalidationsCheck(form, incomeDesc);
                    var sourceOfIncomeDescName = form.querySelector("#jform-income-source-desc");
                    var sourceOfIncomeDescDiv = sourceOfIncomeDescName.parentElement.parentElement.parentElement.parentElement;
                    sourceOfIncomeDescDiv.style.display = 'block';
                }
            }else {
                if(incomeDesc){    
                    fieldvalidationsClear(form, incomeDesc);
                    var sourceOfIncomeDescName = form.querySelector("#jform-income-source-desc");
                    var sourceOfIncomeDescDiv = sourceOfIncomeDescName.parentElement.parentElement.parentElement.parentElement;
                    sourceOfIncomeDescDiv.style.display = 'none';
                }
        	} 
        }
      }
};

function fieldvalidationsCheck(form, inputField){
    inputField.required = true;
    inputField.ariaRequired = 'true';
    form.validations[inputField.name].not_empty = Validators.not_empty;
}
function fieldvalidationsClear(form, inputField){
    inputField.required = false;
    inputField.ariaRequired = 'false';
    delete form.validations[inputField.name].not_empty;
    var error_div = document.getElementById('field-error-' + inputField.id);
    if (error_div) {
        Validators.clearErrors(error_div);
    }
}

Validators.foreignAddress  = function(form, input) {
    if (input.id == 'jform-w-8ben-select') {
        var elgibleE8BEN = form.querySelector("#jform-tax-id-number");
        var needSelect = form.querySelector("#jpForm-permanentCountry");
        var streetAddress1 = form.querySelector("#jform-streetAddress1");
        var permanentCity = form.querySelector("#jform-permanentCity");
        var permanentPostalCode = form.querySelector("#jform-permanentPostalCode");
        if (input.value == 'Yes') {
            if(elgibleE8BEN){
                fieldvalidationsCheck(form, elgibleE8BEN)
            }
            if(needSelect){
            	fieldvalidationsCheck(form, needSelect)
            }
            if(streetAddress1){
            	fieldvalidationsCheck(form, streetAddress1)
            }
            if(permanentCity){
            	fieldvalidationsCheck(form, permanentCity)
            }
            if(permanentPostalCode){
            	fieldvalidationsCheck(form, permanentPostalCode)
            }
        } else {
            if(elgibleE8BEN){
				fieldvalidationsClear(form, elgibleE8BEN)
            }
            if(needSelect){
            	fieldvalidationsClear(form, needSelect)
            }
            if(streetAddress1){
            	fieldvalidationsClear(form, streetAddress1)
            }
            if(permanentCity){
            	fieldvalidationsClear(form, permanentCity)
            }
            if(permanentPostalCode){
            	fieldvalidationsClear(form, permanentPostalCode)
            }
            }
        }
};

////Hide prefectures on page loading 
function jformHideOnLoad(){
    var prefectureName1 = document.getElementById("jform-address-prefecture");
    var prefectureName2 = document.getElementById("jform-mailing-prefecture");
    var prefectureName3 = document.getElementById("jform-8ben-prefecture");
    var sourceOfIncomeDesc = document.getElementById("jform-income-source-desc");
    var avvanceZip = document.getElementById("avvance-zip-code");
    var avvanceMid = document.getElementById("avvance-mid");
    var avvanceIndustry = document.getElementById("avvance-industry-selector");

        if(prefectureName1){
        prefectureName1.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(prefectureName2){
        prefectureName2.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(prefectureName3){
        prefectureName3.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(sourceOfIncomeDesc){
        sourceOfIncomeDesc.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(avvanceZip){
            avvanceZip.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(avvanceMid){
            avvanceMid.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
        if(avvanceIndustry){
            avvanceIndustry.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
        }
}

function showHidePrefecture(form, input, addressStatesName, addressStatesDiv, addressPrefectureName, addressPrefectureDiv){
    if (input.value == 'US') {
        if(addressStatesName && addressPrefectureName){
            
            fieldvalidationsCheck(form, addressStatesName)
            addressStatesDiv.style.display = 'block';
            addressPrefectureDiv.style.display = 'none';
            addressPrefectureName.value = '';
            fieldvalidationsClear(form, addressPrefectureName)

        }
        
    } else {
    if (input.value != ''){
        if(addressStatesName && addressPrefectureName){

            fieldvalidationsCheck(form, addressPrefectureName)
            addressPrefectureDiv.style.display = 'block';
            addressStatesDiv.style.display = 'none';
            addressStatesName.selectedIndex = 0;
            fieldvalidationsClear(form, addressStatesName)
            
        }
    }    
    }
    
}
Validators.statePrefecture = function(form, input) {

    if (input.id == 'jform-address-country') {
        var addressStatesName = form.querySelector("#jform-address-state");
        var addressPrefectureName = form.querySelector("#jform-address-prefecture");

        if(form && input && addressStatesName && addressPrefectureName){
            var addressStatesDiv = addressStatesName.parentElement.parentElement.parentElement.parentElement;
            var addressPrefectureDiv = addressPrefectureName.parentElement.parentElement.parentElement.parentElement;
            showHidePrefecture(form, input, addressStatesName, addressStatesDiv, addressPrefectureName, addressPrefectureDiv)
        }
    }

    ////Mailing Country state and prefecture hide show

    if (input.id == 'jform-mailing-country') {
        var mailingStatesName = form.querySelector("#jform-mailing-state");
        var mailingPrefectureName = form.querySelector("#jform-mailing-prefecture");

        if(form && input && mailingStatesName && mailingPrefectureName){
            var mailingStatesDiv = mailingStatesName.parentElement.parentElement.parentElement.parentElement;
            var mailingPrefectureDiv = mailingPrefectureName.parentElement.parentElement.parentElement.parentElement;
            showHidePrefecture(form, input, mailingStatesName, mailingStatesDiv, mailingPrefectureName, mailingPrefectureDiv)
        }
    }

    ///////W-8BEN Country state and prefecture hide show 

    if (input.id == 'jpForm-permanentCountry') {
        var w8benStatesName = form.querySelector("#jform-permanentState");
        var w8benPrefectureName = form.querySelector("#jform-8ben-prefecture");

        if(form && input && w8benStatesName && w8benPrefectureName){
            var w8benPrefectureDiv = w8benPrefectureName.parentElement.parentElement.parentElement.parentElement;
            var w8benStatesDiv = w8benStatesName.parentElement.parentElement.parentElement.parentElement;
            showHidePrefecture(form, input, w8benStatesName, w8benStatesDiv, w8benPrefectureName, w8benPrefectureDiv)
        }
    }
    //// To show/hide fields for avvance.com merchent form.
    if (input.id == 'avvance-new-customer') {
        var zipAvvance = form.querySelector("#avvance-zip-code");
        var midAvvance = form.querySelector("#avvance-mid");
        var industryAvvance = form.querySelector("#avvance-industry-selector");
        if(form && input && zipAvvance && midAvvance && industryAvvance){
            var zipAvvanceParent = zipAvvance.parentElement.parentElement.parentElement.parentElement;
            var midAvvanceParent = midAvvance.parentElement.parentElement.parentElement.parentElement;
            var industryAvvanceParent = industryAvvance.parentElement.parentElement.parentElement.parentElement;
            if (input.value == 'new customer') {
                zipAvvanceParent.style.display = 'block';
                midAvvanceParent.style.display = 'none';
                industryAvvanceParent.style.display = 'block';
                fieldvalidationsCheck(form, zipAvvance)
                fieldvalidationsCheck(form, industryAvvance);
            }
            else if(input.value == 'integrated partner'){
                fieldvalidationsCheck(form, zipAvvance);
                fieldvalidationsClear(form, industryAvvance);
                zipAvvanceParent.style.display = 'block';
                midAvvanceParent.style.display = 'none';
                industryAvvanceParent.style.display = 'none';
            }
            else if(input.value == 'existing customer'){
                fieldvalidationsClear(form, zipAvvance);
                fieldvalidationsClear(form, industryAvvance);
                zipAvvanceParent.style.display = 'none';
                midAvvanceParent.style.display = 'block';
                industryAvvanceParent.style.display = 'none';
            }
        }
    }

};
/* Below code is to save a cookie on user consent. When user re-visit the page it will redirect to union-bank page after checking the cookie */
if(document.cookie.indexOf('jp_cookie_consent=accepted') != -1){
    window.location= "https://www.usbank.com/customer-service/global-transition-solutions/welcome.html";
}

var jpButton1 = document.querySelector("#jp-button-yes-1");
var jpButton2 = document.querySelector("#jp-button-no-1");
var jpButton3 = document.querySelector("#jp-button-yes-2");
var jpButton4 = document.querySelector("#jp-button-no-2");

if(jpButton1){
    jpButton1.addEventListener("click", setJPConsent);}
if(jpButton2){
    jpButton2.addEventListener("click", eraseJPCookie);}
if(jpButton3){
    jpButton3.addEventListener("click", setJPConsent);}
if(jpButton4){
    jpButton4.addEventListener("click", eraseJPCookie);}

function setJPConsent() {
        document.cookie = "jp_cookie_consent=accepted; expires=Sun, 31 Dec 2023 12:00:00 UTC;path="+window.location.pathname+";";
}
function eraseJPCookie() {   
        document.cookie = "jp_cookie_consent=notAccepted; expires=Sun, 31 Dec 2023 12:00:00 UTC;path="+window.location.pathname+";";
}
/*   end of union-bank changes */

/*mobile App Changes Hide header and footer*/

if (/(md|sm)/.test(usbUtils.windowSize())) {
   let mobileAppHide = document.querySelectorAll('.mobile-app-nav-hide');
   if (sessionStorage.getItem('Channel') == 'USBAPP') {
	  mobileAppHide.forEach(function (e) {
		 e.style.display = "none";
	  });
   } else {
	  mobileAppHide.forEach(function (e) {
		 e.style.display = "block";
	  });
   }
}
var usbAutocomplete = usbAutocomplete || {};

(function(){

  'use strict';
  
  var search_term    ='';
  // var component      = document.querySelector('.globalNavigation');
  var domain         = document.querySelector('input[name="autosuggestion"]');
  var notify         = document.querySelector('.navigation-messages');
  var profile        = usbUtils.selectNodes('[data-searchProfile]')[0];
  var vale_menu      = usbUtils.selectNodes('.menu-vale');
  var search_lists   = usbUtils.selectNodes('[role=search] .search-autocomplete-list');
  var clear_buttons  = usbUtils.selectNodes('[role=search] .clear-search');
  var inputs         = usbUtils.selectNodes('[role=search] input[type=text]');
  var globalnavIndex  = document.querySelector('.global-nav .navigation');



  // var keys  = usbnavigator.keycodes();
  var keys = Object.freeze({
    'TAB': 9,
    'BACKSPACE': 8,
    'DELETE': 46,
    'RETURN': 13,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'COMMAND': 91,
    'CONTROL': 17,
    'RIGHT': 39,
    'DOWN': 40
  });


  var listaction = null;
  var last_term  = null;
  var list       = search_lists[0];
  var input      = inputs[0];

  // ubnavigator definition of mobile is set by size
  var ismobileSize = function() { return /(sm|md)/.test(usbUtils.windowSize()); };

  usbAutocomplete = {

    query: function(term){
      var profile_string;
       var elem, checkClass, queryValue, isNavSearch = false;
      if (term.className) {
        elem = document.querySelector("." + term.className);
        checkClass = elem.closest('form')[0].form.classList;
        if (checkClass.contains('navbar-form-nav'))
          isNavSearch = true;
      }
      if (isNavSearch) {
        if(document.querySelector('.menu-search-input')){ 
              queryValue = document.querySelector('.menu-search-input').dataset.suggestQueryVal;
              profile_string = document.querySelector('.menu-search-input').dataset.searchProfileVal;
          }
      } else {
        queryValue = domain.value;
        if(profile && profile.dataset.searchprofile)
          profile_string =profile.dataset.searchprofile;
      }
      return {
        domain: "sinequa",
        method: "search.suggest",
        profile: profile_string,

        suggestionQuery: queryValue,
        text: term.value
      }
    },

    /**
     *
     * @returns
        label: "Search"
        plug_available: "No results available for keyword {searchTerm}"
        plug_noresult: "Search cleared"
        plug_of: "of"
        plug_resultbelow: "{searchTerm}, options display below as you type"
        plug_summary: "There are currently {maxLength} options starting with {searchTerm}"

     */
    params: function() {
      var _params = {};
      var _els = usbUtils.selectNodes('.globalnav-search');
      for(var _i in _els) {
        var item = _els[_i];
        _params[item.name] = item.value;
      }
       return _params;
    },

    setListaction: function(_func) {
      listaction = _func;
    },

    service: function(query, success, fail) {
      var _this = usbAutocomplete;
      var params = _this.params();
      last_term = query.text;
      $.ajax({
        type: "POST",
        url: params.url,
        dataType: "json",
        data: JSON.stringify(query),
        cache: false,
        success: function(data) {
          return success(data);
        },
        error: function(data) {
          return fail(data);
        }
      });
    },

    errors: function(errors) {
    },

    /**
     *
     * @param {*} data
     * data.Suggests {
        ACL: "{public}",
        Category: "concepts",
        Display: "Checking Accounts",
        Frequency: "7120",
        Id: "25769803783120",
      }

      => generates list such as...

        <ul id="search-autocompletelist" role="listbox" style="display: block;">
          <li tabindex="0" role="option" aria-selected="false" aria-label="Checking Accounts 1 of 6"><b>Checking</b> Accounts</li>
          <li tabindex="0" role="option" aria-selected="false" aria-label="Military checking benefits 2 of 6">Military <b>checking</b> benefits</li>
          ...
        /ul>

     */
    build: function(data) {
      var _this      = usbAutocomplete;
      var params     = _this.params();
      var content    = data.Suggests;
      var hascontent = content && content.length && content.length>0;
      if(hascontent && data.Status && data.Status=="ok") {
        var regex = new RegExp(search_term,'gi');
        var size    = content.length;
        list        = input.parentElement.querySelector('.search-autocomplete-list');

        if( data.Suggests) {

          list.innerHTML = null;
          list.closest('form').classList.add('active-search');

          var listBoxId,listId = '';     
          input.setAttribute("aria-controls", input.dataset.ariacontrols); 
          input.setAttribute("aria-expanded", true);  
          if(list.closest('section').classList.contains('topbar-background') || list.closest('section').classList.contains('global-nav')){
              listBoxId = 'globalNavSuggestionListBox';
              listId = 'globalNavSuggestionListItem_';
          }
          if(list.closest('section').classList.contains('searchfilter')){  
              listBoxId = 'searchFilterSuggestionListBox';
              listId = 'searchFilterSuggestionListItem_';
          }

          var ul      = usbUtils.createElement('ul',{
            class: 'search-list',
            role: 'listbox',
            id:(listBoxId!='' && listBoxId != undefined)?listBoxId:''
          });

          var count   = 0;
          for(var _i in content) {

            count++;
            var _d    = content[_i];
            var label = _d.Display;
            var bold  = usbUtils.createElement('span',{class:'bold'});

            bold.innerHTML = usbUtils.ucFirst(search_term);

            var text  = _d.Display.replace(regex, bold.outerHTML);
            var li      = usbUtils.createElement('li',{
              role: 'option',
              'aria-label': label,
              'aria-selected': 'false',
              'data-index': _i,
              'id':(listId!='' && listId != undefined)?listId+_i:''
            });

            li.innerHTML = text;

            if(listaction && typeof listaction=='function') 
              usbUtils.listenTo(li,'click',listaction)

            ul.appendChild(li);

            usbUtils.listenTo(li,'click',_this.selected);

          }

        var droid = usbUtils.isAndroid();
        var top_boundary    = usbUtils.createElement('button',{class: 'search-list-boundary sr-only', 'data-position':'start'})
        if ( ! droid ) 
          var bottom_boundary = usbUtils.createElement('button',{class: 'search-list-boundary sr-only', 'data-position':'start'})

        list.appendChild(ul);

        if ( ! droid ) 
          list.appendChild(bottom_boundary);

        list.search_items   = usbUtils.nodeListArray(ul.children);
        list.search_current = null;
        list.search_index   = 0;

        if ( ! droid ) {
          usbUtils.listenTo(bottom_boundary,'focus', function(e){
            var _c = usbUtils.selectNodes('ul li',list);
            list.search_current = _c[0];
            list.search_current.focus();
            if ( !ismobileSize() ) {
              list.search_current.focus();
              usbAutocomplete.scrollist(list);
            }
          });
        }

          inputs.forEach(function(_input){
            var msg = usbAutocomplete.params().plug_resultbelow.replace('{searchTerm}', last_term);
            usbAutocomplete.setmessage(_input, msg)
          });
        }
      } else {

        for ( var sl in search_lists ) {

          var list = search_lists[sl];
          list.innerHTML = null;

          var ul      = usbUtils.createElement('ul',{
            class: 'search-list',
            role: 'listbox',
          });

          var bold  = usbUtils.createElement('span',{class:'bold'});
          bold.innerHTML = last_term;

          var li      = usbUtils.createElement('li',{
            role: 'option',
            'aria-label': label,
            'aria-selected': 'false',
            'data-index': _i,
          });
          
          li.innerHTML = usbAutocomplete.params().plug_noresult.replace('{searchTerm}', bold.outerHTML);

          ul.appendChild(li);
          list.appendChild(ul);
        }


        inputs.forEach( function(_input){
          var msg = usbAutocomplete.params().plug_noresult.replace('{searchTerm}', last_term);
          usbAutocomplete.setmessage(_input, msg);
        });
      }
    },

    open: function(e) {

      var _this = usbAutocomplete;
      list.closest('form').classList.add('active-search');

      var clearbutton = _this.list(e).parentElement.querySelector('.clear-search');
      clearbutton.style.display = 'block';
      clearbutton.removeAttribute('disabled');
      clearbutton.setAttribute('aria-hidden',false);

      _this.openVale(e);

    },

    openVale: function (e){
      var _this = usbAutocomplete;
      var vale = _this.vale(e); 
      var searchInput =  document.getElementById('shield-search-input'); // searchFilter in-page search

      if(!vale.classList.contains('open')) {
        var position = 'below';
        var top = 0;
        if (ismobileSize() ) {
          position = input.dataset.bgPositionMobile  || input.dataset.bgPosition || position;
        } else {
          position = input.dataset.bgPositionDesktop || input.dataset.bgPosition || position;
        }
        switch (position) {
          case 'below':
            var component = input.closest('.component-container');
            var offset =component && component.getBoundingClientRect();
            top = offset && offset.height || 0; 
            break;
        }

        if(vale.id =='topbar-vale'){
          var searchVale =  document.getElementById('search-vale');
          if(searchVale){
            searchVale.style.opacity=0;
            if(searchInput){
              searchInput.closest('.input-field').querySelector('.search-autocomplete-list').innerHTML ="";
            }
          }
        }

        if (!ismobileSize() && globalnavIndex) globalnavIndex.style.zIndex = '-1';

        if (e.target.isSameNode(searchInput)) return;
      
        document.body.classList.add('menu-lock');
        vale.style.display='block';
        vale.style.opacity=0;
        vale.style.top= top.toString().concat('px');
        setTimeout(function(){vale.style.opacity=1;}, 300);
      }
    },

    vale: function(e) {

      input = usbAutocomplete.input(e);
      if(input && input.dataset) {

        var mvale = input.dataset.bgMobile || input.dataset.bg || input.closest('.menu-vale');
        var dvale = input.dataset.bgDesktop || input.dataset.bg || input.closest('.menu-vale');
        var vale  = input.closest('section').querySelector('.menu-vale');
        if (ismobileSize()) {
          return mvale && document.getElementById(mvale) || vale;
        }

        return dvale && document.getElementById(dvale) || vale;
      }
      return vale_menu[0];
    },

    clearVale: function (e) {
      if(ismobileSize() && e.type!='resize' && e.target != 'window'){
        (e.target.closest('nav')!="")?document.body.classList.add('menu-lock'):document.body.classList.remove('menu-lock');
      }
      if(globalnavIndex){ globalnavIndex.style.zIndex = '50'; }
      var _this = usbAutocomplete;
      var vale = _this.vale(e); 
      if (vale){ 
		    vale.classList.remove('open');
      	if(vale.id =="topbar-vale" && ismobileSize()){
        	vale.style.opacity = 1;
      	}else{
        	vale.style.opacity = 0;
        	if(e.currentTarget.id == "nav-vale") {
          		e.stopImmediatePropagation();
        		document.getElementById("nav-vale").removeAttribute('style');
      		}
        	setTimeout(function(){
          		vale_menu.forEach(function(el) {
            		el.removeAttribute('style');
            		if(ismobileSize()){
              			var emergencyBanner= document.querySelector('.emergency-banner');
              			el.style.position = (emergencyBanner)? 'absolute' : 'fixed';
            		}
          		});
        	},300); 
        	document.body.classList.remove('menu-lock');      
      	}  
	  }    
    },

    list: function(e) {
      var el = e.target;
      if( el && el.nodeType==1) {
        var parent = el.closest('.input-field');
        if(parent) return parent.querySelector('.search-autocomplete-list');
      }
      return list;
    },

    input: function(e) {
      var _this = usbAutocomplete;
      var list_select = e.target && !e.target.Window && _this.list(e) && _this.list(e).contains(e.target);
      var input_field = e.target && e.target.closest && e.target.closest('.input-field');
      if(input_field && !list_select) {
        input = ( e.target.nodeName=='INPUT' && e.target)
          || /(li|span|button|svg)/i.test(e.target.nodeName)  
          && input_field.querySelector('input[type=text]');
      }
      return input;
    },

    resetlist: function (list) {
      for( var _l in list.search_items){
        list.search_items[_l].classList.remove('active');
      }
    },

    scrolllist: function(list) {
      var toord = list.getBoundingClientRect();
      var boord = list.search_current.getBoundingClientRect();
      list.scrollTo({top: boord.top - toord.top,left:0, behavior: 'smooth'});
    },

    selected: function (e) {
      var _this = usbAutocomplete;
      var input = _this.input(e);

      _this.setitem(e);

      var list = _this.list(e);

      if(list.search_current)
        _this.input(e).value = list.search_current.textContent;

      input.focus();


    },

    setitem: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      var scrollist = false;
      var _this   = usbAutocomplete;
      var list    = _this.list(e);
      if(list){

        var tabup   = e.shiftKey && e.keyCode == keys.TAB;
        var tabdown = !e.shiftKey && e.keyCode == keys.TAB;
        _this.resetlist(list);

        var size = list.search_items && list.search_items.length || 0;
        var hascurrent = null !== list.search_current;
        if (!e.keyCode) {
          var selected = e.target.closest('li');
          var index = selected.dataset.index;
          var input = _this.input(e);
          list.search_index = parseInt(index)>-1 && index || list.search_index;
          input.value = selected.textContent;
        }
        if(e.keyCode== keys.UP || tabup ) {
          if(hascurrent && list.search_index-1 > -1) {
            list.search_index -= 1;
          } else {
            list.search_index = size-1;
          }
          scrollist = true;
        }
        if(e.keyCode== keys.DOWN ||  tabdown ) {
          if(hascurrent && list.search_index+1 < size) {
            list.search_index += 1;
          } else {
            list.search_index = 0;
          }
          scrollist = true;
        }

        if(list.search_items && list.search_items[list.search_index]) {

          list.search_current= list.search_items[list.search_index];

          list.search_current.classList.add('active');
          if(list.search_current.id !=''){ _this.input(e).setAttribute('aria-activedescendant',list.search_current.id); }
          // list.search_current.focus();
          if ( scrollist)
            _this.scrolllist(list);
        }
      }

    },

    clearlist: function (e) {
      var _this = usbAutocomplete;
      input = _this.input(e);
      if (input) {
        input.removeAttribute("aria-controls"); 
        input.setAttribute("aria-expanded", false); 
      }
      _this.clearVale(e);
      if(list)
      list.closest('form').classList.remove('active-search');
      search_lists.forEach(function(_el){
        _el.innerHTML = null;
        _el.search_items   = [];
        _el.search_current = null;
        _el.search_index   = 0;
      });
    },

    setmessage: function(input,key) {
      var keyed = usbAutocomplete.params()[key];
      var msg  = keyed && typeof keyed =='string' ? keyed : key;
      notify.textContent = msg;

    },

    clearinput: function (e) {

      var _this = usbAutocomplete;

      if(e && e.preventDefault) e.preventDefault();

      usbAutocomplete.hideClearbutton();
      var input = _this.input(e);
      if(input.hasAttribute("aria-activedescendant")) input.setAttribute('aria-activedescendant','');

      inputs.forEach(function(_input){
        _input.value=null;
        usbAutocomplete.setmessage(_input,'plug_cleared')
      });

      usbAutocomplete.clearlist(e);
      if(ismobileSize())
          document.querySelector('.mobile .menu-search-input').focus();
        else
			    document.querySelector('.menu-search-input').focus();
    },

    hideClearbutton: function () {
      clear_buttons.forEach(function(_b){
        _b.style.display = 'none';
        _b.setAttribute('disabled',true);
        _b.setAttribute('aria-hidden',true);
      });
    },

    resolve: function (query) {
      var _this = usbAutocomplete;
      var regexes = [];
      var url = null;

      var alternates = usbUtils.selectNodes('.search-redirect-links .search-redirect').map(function (_ul,_i){
        var key = _ul.dataset.redirecturl || 'mising_url'+_i;
        var words = usbUtils.selectNodes('.data-word',_ul).map(function(el){ return el.textContent.trim().replace(/!^[a-z\s]+$/i,'');});
       return { [key]: words};
      });

      for(var _i in alternates) {
        for(var dest in alternates[_i]) {
          var wordex = alternates[_i][dest].map(function(word){
            return '('+word+')';
          });
          regexes[dest] = new RegExp(wordex.join('|'), 'gi');
        }
      }

      for(var path in regexes){
        if(regexes[path].test(query)) url = document.location.origin + path;
      }

      return url;
    },

    submit: function (e) {
      e.preventDefault();
      var _this = usbAutocomplete;
      var input = _this.input(e);
      var form = input.closest('form');
      var redirect = input.dataset.redirect=='true';
      // var url = usbAutocomplete.params().url;
      if (input && input.value !='') {
        var query = input.value;
        var match_url   = _this.resolve(query)
        if (match_url) {
          document.location = match_url;
        } else {
          // form.action = url;
          if(redirect){
            form.submit();
          } else {
            _this.clearlist(e);
          }
        }
      }
    },

    keycapture: function (e) {
      var _this = usbAutocomplete;
      var code  = e.keyCode || e.which;

      list         = _this.list(e) || null;
      input        = e.target;
      input.value  = input.value.trimStart();
      var trap  = /\b(8|9|13|27|37|38|39|40|46|47)\b/;
      var isinput  =  !trap.test(e.keyCode);
      var hasitems = list.search_items && list.search_items.length;

      e.stopImmediatePropagation();
      
      if( e.metaKey) return;

      switch(code) {
        case keys.RETURN:
          _this.clearVale(e);
          _this.clearlist(e);
          if(input.dataset.redirect=="true")
            _this.submit(e);
          // if(input.dataset.redirect=="false") {
          //   return false;
          // }
          break;
        case keys.TAB:
          if ( ! hasitems) return;
        case keys.UP:
        case keys.DOWN:
          if (hasitems) {
            _this.setitem(e);

          if(hasitems)
            input.value = list && list.search_current && list.search_current.textContent;
          };
          break;
        case keys.ESC:
          _this.clearlist(e);
          break;
        case 'Backspace':
        case keys.DELETE:
        case keys.BACKSPACE:
          if(input.value.length>0)
            _this.sendQuery(e);
          else {
            if (input.value.length == 0) {
              _this.hideClearbutton();
              _this.clearlist(e);
            }
          }
          return;
        default:
          if ( isinput ) {

            if ( input.value.length>0 ) {
              //clear the Login widget if open
              var topbar = document.querySelector('.globalNavigation .top-bar');
              if (topbar && topbar.classList.contains('login-open'))
                topbar.classList.remove('login-open');
              _this.sendQuery(e);
            }
            search_term = input.value;
            return;

          }

      }
      e.preventDefault();

    },

    sendQuery: function(e) {
      var _this = usbAutocomplete;
        _this.open(e);
        _this.service(
          //query
          _this.query(e.target),
          //success: Function
          _this.build,
          //error: Function
          _this.errors
        );
    },

    directentry: function ( e) {

      var _this = usbAutocomplete;

      input = e.target;

      if ( input.value.length>1 ) {
        _this.sendQuery(e);
        _this.open(e);
      }

      search_term = input.value;

    },

    attach: function () {


      usbUtils.selectNodes('.clear-search').forEach( el => {el.style.display='none';})
      vale_menu.forEach( function(_v){usbUtils.listenTo(_v,'click',usbAutocomplete.clearlist)});
      usbUtils.listenTo(window,'resize', usbAutocomplete.clearlist);
      usbUtils.selectNodes('[role=search] input[type=text]').forEach( function (input){
        if (ismobileSize() && usbUtils.isAndroid()){
          usbUtils.listenTo(input,'keyup', usbAutocomplete.keycapture);
        }
        else
          usbUtils.listenTo(input,'keyup', usbAutocomplete.keycapture);

        usbUtils.listenTo(input.parentElement.querySelector('button.clear-search'), 'click', usbAutocomplete.clearinput);
        usbUtils.listenTo(input.parentElement.querySelector('button.search'), 'click', usbAutocomplete.submit);
        if(!input.classList.contains("shield-search-input"))
        input.placeholder = usbAutocomplete.params().label;
      });
    }
  };

  usbAutocomplete.attach();

  function trapFocus() {
        if(ismobileSize()){
            var elementList = getElementsList(".navigation .menu-item.mobile");
            if((elementList && elementList.length) && (elementList[1])){
                elementList[1].addEventListener('keydown', function(e) {
                var activeSearch = document.querySelector(".active-search");
                if (activeSearch != null && e.keyCode === 9 && !e.shiftKey) { // when focus reaches last focusable element then move focus to first focusable element after pressing tab                
                    e.preventDefault();
                    elementList[0].focus(); // add focus for the first focusable element
                }  
            })
            }
        } 
        else {
            var elementList = getElementsList(".top-bar .desktop");
            if(elementList && elementList[1]){
            elementList[1].onkeydown = function(e) {
                var activeSearch = document.querySelector(".active-search");
                if(activeSearch != null && !e.shiftKey && e.keyCode === 9) { // when focus reaches last focusable element then move focus to first focusable element after pressing tab
                    e.preventDefault();
                    elementList[0].focus(); // add focus for the first focusable element
                }   
            }  
          }
        }
    }
    
    function getElementsList(element1) { 
        const  focusableElements =
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';     // add all the elements inside modal that are focusable       
        const modal = document.querySelector(element1); // select the modal by it's id/class     
        if(modal){
        const firstFocusableElement = modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal
        const focusableContent = modal.querySelectorAll(focusableElements);
        const lastFocusableElement = focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal       
        return [firstFocusableElement, lastFocusableElement]; 
        }       
        else 
        return;
    }
    trapFocus();

}());

$(function() {
	// Replaces "currentDate" RTE span class with Current Date
	function getTodaysDate(date) {
		date = date || new Date();
		var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		var monthName = months[date.getMonth()];
		var day = ((date.getDate().toString().length > 1) ? date.getDate() : ('0' + date.getDate()));
		var today =  String(monthName + ' ' + day + ', ' + parseInt(date.getFullYear()));
		return String(today); // Returns "September 24, 2020" formatted date
	}
	$('p .currentDate').replaceWith(getTodaysDate());
	
	// Replaces "currentZipcode" RTE span class with Current Zipcode
	var zipcode = getCookie('zipcode');
	var validFormat = zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5);
	function referenceFoundFor(targetElement) { return Boolean(targetElement !== null && typeof targetElement !== 'undefined'); }
	function getCookie(name) {
		var symbols = /([\.$?*|{}\(\)\[\]\\\/\+^])/g,
		matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(symbols, '\\$1') + "=([^;]*)"));
		return referenceFoundFor(matches) ? decodeURIComponent(matches[1]) : undefined;
	}
	if (zipcode == undefined) {
		$(".tableBlock p.enterYourZipcode").show();
		$(".tableBlock .body p").hide();
		$(".tableBlock table").hide();
		$(".tableBlock div.mobile").hide();
	}
	$('p .currentZipcode').replaceWith(validFormat ? zipcode : '');
});
(function fetchCreditCardRates() {
    'use strict';

    function referenceFoundFor(targetElement) {
        return Boolean(targetElement !== null && typeof targetElement !== 'undefined');
    }

    function referenceFoundForAll(targetElements) {
        return Boolean(targetElements.length > 0 && referenceFoundFor(targetElements));
    }

    function getResponse(url, ratetextcontainer) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                populateRateData(ratetextcontainer, JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function populateRateData(ratetextcontainer, response) {
                var responseObj = response[0];
                var cardOfferId = ratetextcontainer.getAttribute('data-offerid');
                if (responseObj.map.requestData !== undefined) {
                    var responseOfferId = responseObj.map.requestData.map.OfferID;
                    if (cardOfferId == responseOfferId && responseObj.map.responseData.map.Offers !== undefined) {
                        var responseData = responseObj.map.responseData.map.Offers.myArrayList[0].map.productDetailData.map;
                         var apikeys=usbUtils.nodeListArray(document.querySelectorAll('.apiKey')).filter(el => !el.closest('.card-details, .compareBoard, .comparisonCard, .disclosure[data-offerid], .styledContentBlock[data-offerid], .disclosureItem [data-offerid]'));
                        if (referenceFoundForAll(apikeys)) {
                            apikeys.forEach(function(apiKey) {
                                var spanText = apiKey.textContent;
                                var classKey = apiKey.getAttribute('class');
                                var noLinkFlag = classKey.search('noRates');
                                var minAPRFlag = classKey.search('calculatedMinAPR');
                                var maxAPRFlag = classKey.search('calculatedMaxAPR');
                                var annualFeeAmountFlag = classKey.search('annualFeeAmount');
                                var introCashAdvanceMaxRateFlag = classKey.search('introCashAdvanceMaxRate');
                                var lastWord = classKey.split("-").pop();
                                var apiKeyNode = noLinkFlag > 0 ? apiKey : apiKey.parentNode;
                                var apiValue, responseApiVal;
                                var minAPRValue = "",
                                    maxAPRValue = "";
                                if (minAPRFlag > 0 || maxAPRFlag > 0) {
                                    minAPRValue = minAPRFlag > 0 ? parseFloat(responseData.calculatedMinAPR) : '';
                                    maxAPRValue = maxAPRFlag > 0 ? parseFloat(responseData.calculatedMaxAPR) : '';
                                    if ((minAPRValue.toString()).length > 0 && (maxAPRValue.toString()).length > 0) {
                                        if(minAPRValue === maxAPRValue){
                                            responseApiVal = maxAPRValue + "%";
                                        } else {
                                            responseApiVal = minAPRValue + "%" + " - " + maxAPRValue + "%";
                                            apiKeyNode.setAttribute("aria-label", minAPRValue + "%" + " to " + maxAPRValue + "%");
                                        }
                                    } else { //if only one flag exist
                                        responseApiVal = parseFloat(responseData[lastWord]) + "%";
                                    }
                                    apiValue = responseApiVal;
                                }
                                else if(introCashAdvanceMaxRateFlag > 0) {
                                    responseApiVal =  parseFloat(responseData.productVariableData.myArrayList[0].map[lastWord]) + "%";
                                    apiValue = responseApiVal;
                                } else {
                                    responseApiVal = annualFeeAmountFlag > 0 ? responseData.productVariableData.myArrayList[0].map.riskTierInformation.myArrayList[0].map.annualFeeInformation.map[lastWord] :
                                        responseData.productVariableData.myArrayList[0].map[lastWord];
                                    apiValue = spanText.indexOf("$") >= 0 ? spanText + parseInt(responseApiVal) : parseInt(responseApiVal) + spanText;
                                }
                                apiKeyNode.textContent = apiValue;
                                if(apiKeyNode.classList.contains("apiKey")) apiKeyNode.removeAttribute("class");
                            });
                        }
                    }
                }
    }

    function DOMContentLoaded() {
        var ratetextcontainers = usbUtils.nodeListArray(document.querySelectorAll('[data-offerid]')).filter(el => !el.closest('.card-details, .compareBoard, .comparisonCard, .disclosure, .styledContentBlock, .disclosureItem'));
        if (referenceFoundForAll(ratetextcontainers)) {
            var reqData = "";
            var count = 0;
            var requestcount = 0;
            var containers = [];
            var blockwithrates = ratetextcontainers.length;
            var num = Math.floor(blockwithrates / 5);
            ratetextcontainers.forEach(function(ratetextcontainer, index) {
                if (ratetextcontainer.hasAttribute('data-offerid')) {
                    var reqStr =
                        ratetextcontainer.getAttribute('data-requestcode') + "_" +
                        ratetextcontainer.getAttribute('data-requestsourcecode') + "_" +
                        ratetextcontainer.getAttribute('data-locationnumber') + "_" +
                        ratetextcontainer.getAttribute('data-offerid') + ".";
                    reqStr = reqStr.replace(/undefined_undefined_undefined./gi, "");
                    reqData = reqData + reqStr;
                }
            });
            var datetime = new Date().valueOf();
            var requestURL = "/svt/usbank/rateapi.param-" + reqData + datetime + "USB.json";
                    getResponse(requestURL, ratetextcontainers[0]);
        }
    }

    if (referenceFoundFor(window && document)) {
        document.addEventListener = document.addEventListener || document.attachEvent;
        document.addEventListener('DOMContentLoaded', DOMContentLoaded, {
            'passive': true
        } || false);
    }
})();

var cdRateAPIResponseCache = [];
var cdApiInvoked = false;
var personlaizedRateFlag;


function depositRatesAPICall(data, zipcode, CustomizedRateFlag, tstoken) {
    personlaizedRateFlag = "false";
    var headers = {};
    if (CustomizedRateFlag == "false" && tstoken && tstoken !== '') {
        headers['tstoken'] = tstoken;
        personlaizedRateFlag = "true";
    }
    var urlCache = "/svt/usbank/rateApi?zipcode=" + zipcode + "&rateType=CD&personlaizedRateFlag=" + personlaizedRateFlag;
    var filterRateApiCache = cdRateAPIResponseCache.filter((element) => element.url == urlCache);
    if (filterRateApiCache.length > 0) {
        return Promise.resolve(filterRateApiCache[0].rateDetails);
    } else if (cdApiInvoked) {
        return new Promise(function (resolve) {
            var checkRateCache = function () {
                filterRateApiCache = cdRateAPIResponseCache.filter((element) => element.url == urlCache);
                if (filterRateApiCache.length > 0 && filterRateApiCache[0].url == urlCache) {
                    resolve(filterRateApiCache[0].rateDetails);
                } else {
                    setTimeout(checkRateCache, 10);
                }
            };
            checkRateCache();
        });
    } else {
        cdApiInvoked = true;
        return new Promise(function (resolve, reject) {
            $.ajax({
                url: "/svt/usbank/rateApi",
                headers: headers,
                data: data,
                success: function (json) {
                    cdApiInvoked = false;
                    cdRateAPIResponseCache.push({ url: urlCache, rateDetails: json });
                    resolve(json);
                },
                error: function() {
                    reject();
                }
            }).done(function () {
                cdApiInvoked = false;
            });
        });
    }
}
$(document).ready(function () {
    let maxTerm = 84,
        minFlag = true,
        maxFlag = true;
    let minRateContainer = $(".personalRatesAPIData.minRates"),
        maxRateContainer = $(".personalRatesAPIData.maxRates");

    function minRateHandler(item) {
        let minRateAutoPay = $(item).attr("data-minRateAutoPayAdjustmentInd"),
            minRateEmployeeAdjustment = $(item).attr("data-minRateEmployeeAdjustmentInd"),
            minRateFico = $(item).attr("data-minRateFico").trim(),
            minRateLoanAmount = $(item).attr("data-minRateLoanAmount").trim(),
            minRateTermInMonths = $(item).attr("data-minRateTermInMonths").trim(),
            minRateZipcode = $(item).attr("data-minRateZipcode").trim(),
            minRateHomeImprovement = $(item).attr("data-minRateHomeImprovementAdjustmentInd"),
            minRateAutoAdjustment = $(item).attr("data-minRateAutoAdjustmentInd");

        if (!minRateFico || isNaN(minRateFico) || !minRateLoanAmount || isNaN(minRateLoanAmount) || !minRateTermInMonths || (minRateTermInMonths < 12 || minRateTermInMonths > maxTerm) || isNaN(minRateTermInMonths) || !minRateZipcode || minRateZipcode.length < 5 || minRateZipcode.length > 5 || isNaN(minRateZipcode)) {
            minFlag = false;
        }

        if (minFlag) {
            const minDataObject = {
                "checkboxSelected": minRateAutoPay,
                "employeeAdjustment": minRateEmployeeAdjustment,
                "creditScore": minRateFico,
                "depositAmount": minRateLoanAmount,
                "timePeriod": minRateTermInMonths,
                "zipcode": minRateZipcode,
                "homeImprovementAdjustment": minRateHomeImprovement,
                "autoAdjustment": minRateAutoAdjustment
            }
            $.ajax({
                url: "/svt/usbank/calculateLoanPayment",
                type: "GET",
                async: "false",
                data: minDataObject,
                success: function (response) {
                    $(item).closest("section").find(".personalLoanRates-error").hide();
                    if ($(item).closest("section").find(".pl-min-rate").length > 0) {
                        $(item).closest("section").find(".pl-min-rate").text(response.apr + "%");
                    }
                    else {
                        $(item).closest("section").siblings('section').find(".pl-min-rate").text(response.apr + "%");
                    }
                },
                error: function () {
                    $(item).closest("section").find(".personalLoanRates-error").show();
                }
            });
        }
    }

    function maxRateHandler(item) {
        let maxRateAutoPay = $(item).attr("data-maxRateAutoPayAdjustmentInd"),
            maxRateEmployeeAdjustment = $(item).attr("data-maxRateEmployeeAdjustmentInd"),
            maxRateFico = $(item).attr("data-maxRateFico").trim(),
            maxRateLoanAmount = $(item).attr("data-maxRateLoanAmount").trim(),
            maxRateTermInMonths = $(item).attr("data-maxRateTermInMonths").trim(),
            maxRateZipcode = $(item).attr("data-maxRateZipcode").trim(),
            maxRateHomeImprovement = $(item).attr("data-maxRateHomeImprovementAdjustmentInd"),
            maxRateAutoAdjustment = $(item).attr("data-maxRateAutoAdjustmentInd");

        if (!maxRateFico || isNaN(maxRateFico) || !maxRateLoanAmount || isNaN(maxRateLoanAmount) || !maxRateTermInMonths || (maxRateTermInMonths < 12 || maxRateTermInMonths > maxTerm) || isNaN(maxRateTermInMonths) || !maxRateZipcode || maxRateZipcode.length < 5 || maxRateZipcode.length > 5 || isNaN(maxRateZipcode)) {
            maxFlag = false;
        }

        if (maxFlag) {
            const maxDataObject = {
                "checkboxSelected": maxRateAutoPay,
                "employeeAdjustment": maxRateEmployeeAdjustment,
                "creditScore": maxRateFico,
                "depositAmount": maxRateLoanAmount,
                "timePeriod": maxRateTermInMonths,
                "zipcode": maxRateZipcode,
                "homeImprovementAdjustment": maxRateHomeImprovement,
                "autoAdjustment": maxRateAutoAdjustment
            }

            $.ajax({
                url: "/svt/usbank/calculateLoanPayment",
                type: "GET",
                async: "false",
                data: maxDataObject,
                success: function (response) {
                    $(item).closest("section").find(".personalLoanRates-error").hide();
                    if ($(item).closest("section").find(".pl-max-rate").length > 0) {
                        $(item).closest("section").find(".pl-max-rate").text(response.apr + "%");
                    }
                    else {
                        $(item).closest("section").siblings('section').find(".pl-max-rate").text(response.apr + "%");
                    }
                },
                error: function (response) {
                    $(item).closest("section").find(".personalLoanRates-error").show();
                }
            });
        }
    }

    minRateContainer.each(function (index, item) {
        minRateHandler(item);
    })

    maxRateContainer.each(function (index, item) {
        maxRateHandler(item);
    })
});
var zafinEmmResponseCache = [];
var zafinEmmApiInvoked = false;

function fetchZafinEMMRates(zipcode, productKey, tstoken) {
  var personlaizedRateFlag;
  var data;
  var headers = {};
  data = {
    "zipcode": zipcode,
    "output": "json",
    "productKeys": productKey,
    "requestType": "NEW"
  }
  if (tstoken) {
    personlaizedRateFlag = true;
    headers['jwtToken'] = tstoken;
    data.rateTableType = "consumerCheckingandSavings";
    data.isbusiness = true;
  } else {
    personlaizedRateFlag = false;
    data.rateTableType = "checkingAndSavings";
  }

  var filterzafinResponseCache = zafinEmmResponseCache.filter((element) => ((element.personlaizedRates == personlaizedRateFlag) && (element.zipcode == zipcode)));
  if (filterzafinResponseCache.length > 0) {
    return Promise.resolve(filterzafinResponseCache[0].rateDetails);
  } else if (zafinEmmApiInvoked) {
    return new Promise(function (resolve) {
      var checkZafinRatesCache = function () {
        filterzafinResponseCache = zafinEmmResponseCache.filter((element) => ((element.personlaizedRates == personlaizedRateFlag) && (element.zipcode == zipcode)));
        if (filterzafinResponseCache.length > 0) {
          resolve(filterzafinResponseCache[0].rateDetails);
        } else {
          setTimeout(checkZafinRatesCache, 10);
        }
      };
      checkZafinRatesCache();
    });
  } else {
    zafinEmmApiInvoked = true;
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "/svt/usbank/zafinRateApi",
        headers: headers,
        data: data,
        type: "POST",
        success: function (json) {
          zafinEmmApiInvoked = false;
          zafinEmmResponseCache.push({ zipcode: zipcode, personlaizedRates: personlaizedRateFlag, rateDetails: json });
          resolve(json);
        },
        error: function () {
          reject();
        }
      }).done(function () {
        zafinEmmApiInvoked = false;
      });
    });
  }
}

$('blockquote').attr("role", "none");
$(function () {
    //Image Rendition correction - SIASP-8385
    $('.banner-cards.three-cards .horizontal .frame .image-container').removeClass('ratio-3x2-lg ');

    //Banner card Fully Clickable - SIASP-9642
    $('.clickableCard .arrow-link').attr("tabindex", '-1');
    $('.clickableCard .content >:first-child').attr("role", 'link');
    $('.clickableCard').on('click', function (e) {
        window.open($(this).find('.arrow-link').attr('href'),  $(this).find('.arrow-link').attr('target'))
        return false;
    });

$('.clickableCard').keyup(function(e){
     switch(e.keyCode) {
        case 27:
                return;
        case 32:
        case 13:
                window.open($(this).find('.arrow-link').attr('href'),  $(this).find('.arrow-link').attr('target'))
        		return false;
        case 9:
             //$(this).removeAttr('role');
                return;


        }
}); 

  if (($('.l2BannerEmmRates .emmZafin_Apy').length > 0) || ($('.l2BannerEmmRates .emmZafin_Apr').length > 0)) {
    var productKey = 'DDA86';

    var zipcode = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem('zipcode');
    if (zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5)) {
      populateBannerEMMRates(zipcode, productKey);
    }

    document.addEventListener("inpagezipfound", function (e) {
      zipcode = e.detail;
      if (zipcode) {
        populateBannerEMMRates(zipcode, productKey);
      }
    });

    function populateBannerEMMRates(zipcode, productKey) {
      var tstoken = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem("apply_jwt");
      $('.banner-error-container').css('display', 'none');
      fetchZafinEMMRates(zipcode, productKey, tstoken).then(function (json) {
        if (json.rateGrids) {
          $.each(json.rateGrids, function (i, rateGrid) {
            var productRegExp = new RegExp(/^(DDA86)/gi);
            if ((rateGrid.rates) && productRegExp.test(rateGrid.productKey)) {
              $.each(rateGrid.rates, function (j, rate) {
                $(".l2BannerEmmRates").each(function () {
                  var standardApr = rate.apr ? Number.parseFloat(rate.apr).toFixed(2) : null;
                  var standardApy = rate.apy ? Number.parseFloat(rate.apy).toFixed(2) : null;
                  var tier = rate.tierDescription ? rate.tierDescription : null;
                  var tierValue = $(this).find('.banner-tier-value').val();
                  if (standardApr && standardApy && tier && tierValue && tier == tierValue) {
                    var dynamicApyEle = $(this).find('.emmZafin_Apy');
                    var dynamicAprEle = $(this).find('.emmZafin_Apr');
                    dynamicApyEle.each(function () {
                      if ($(this).parents('.zafinEmmRates').length == 0) {
                        $(this).text($(this).text().replace('X.XX', standardApy));
                      }
                    })

                    dynamicAprEle.each(function () {
                      if ($(this).parents('.zafinEmmRates').length == 0) {
                        $(this).text($(this).text().replace('X.XX', standardApr));
                      }
                    })
                  }
                });
              })
            }
          });
        } else {
          $('.banner-error-container').css('display', 'block');
        }

      }).catch(function (error) {
        $('.banner-error-container').css('display', 'block');
      });;;
    }
  }
})
$(document).ready(function() {
	let campusFindUsLink = $("#campusFindUsLink").val();
	let campusCardLink = $("#campusCardLink").val();
	if(campusFindUsLink){
		$("a[href*='#campusFindUs']").attr("href", campusFindUsLink);
	}
	if(campusCardLink){
		$("a[href*='#campusCard']").attr("href", campusCardLink);
	}
});
function getCookieZipcode() {
		var name = "FN=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
			}
		}
		return "";
}

$(document).ready(function() {
    if ($('.dynamicMessage').length) {
        let firstName=getCookieZipcode();
        if(!firstName.length){
            $(".dynamicMessage div.content.trigger-display>div").toggleClass("hide");
        }
        else{
            $(".dynamicMessage .dynamic-message-wrap .display").each(function() {
                var str= $(this).text();
                str=str.replace('{fname}',firstName);
                $(this).text(str);
            });
        }
        var array = [];
        var messages = $('.dynamicMessage .messages');
        var show = Math.floor(Math.random() * messages.length);
        if(messages[show]) {
            messages[show].style.display='block';
        }
        deleteCookie();
    }
});

function deleteCookie() {
    document.cookie = "FN=; expires=" +new Date().toUTCString()+ "; path=/; domain=.usbank.com";
}
$(document).ready(function () {
  var state = "";
  var existingState = true;
  var lastSearchedState = localStorage.getItem("stateNameSelected");
  if (lastSearchedState) {
    state = lastSearchedState;
  } else {
    existingState = false;
    state = "Maine";
  }
  if (existingState) {
    $(".showing-state").removeClass("hide");
    $(".showing-state .dynamic-state").text(state);
    $(".mortgageRateTemplate .mortgage-localrates").addClass("hide");
  }
  $(".mortgageRateTemplate").each(function (index, element) {
	  var rateType = $(this).find(".rates-type").val();
    var ratesURL=getRatesUrl(rateType);
    getRatesFromJsonUrl(ratesURL, element);
  });

  function getRatesFromJsonUrl(url, element) {
    var findResultSet = "";
    jQuery.ajax({
      url: url,
      success: function (result) {
        if (result) {
          findResultSet = result.mortgageRateList.find(function (o) {
            var key = Object.keys(o)[0];
            return key && key.toLowerCase() === state.toLowerCase() && o[key];
          });
          $(element).each(function () {
            $(this).find(".mortgage-rate-apr").each(function () {
              var rateAprClass = $(this).attr("class").split(" ")[0];
              if (findResultSet[state][rateAprClass]) {
                $(this).closest(".rateapr-parent").find("." + rateAprClass).html(getFixedDecimalVal(parseFloat(findResultSet[state][rateAprClass]),3) + "%");
                $(this).closest(".rateapr-parent").removeClass("hide");
              }
            });
          });
        }
      },
      async: false
    });
  }
});

$(document).ready(function () {
    $(".smartRefinanceRateTemplate").each(function (index, element) {
    var productRefiTerms = $(this).find(".product-refiterm").val();
    var templateType = $(this).find(".template-type").val();    
    getSmartRefiRatesFromJsonUrl(productRefiTerms, element, templateType);
  });

  function getSmartRefiRatesFromJsonUrl(productRefiTerms, element, templateType) {
    jQuery.ajax({
      type: "GET",
      dataType: 'json',
      url: '/svt/usbank/rateApi',
      async: false,
      cache: false,
      data: { termsInYears: productRefiTerms, rateType: templateType },
      success: function (data) {
        if (data && data.rateGrids) {
          var aprResult;
          var aprString;
          $.each(data.rateGrids, function (i, rateGrid) {
        	aprString = rateGrid.apr.toString();          
          });
          aprResult = parseFloat(aprString).toFixed(2);
          $(element).each(function () {
            $(this).find(".mortgage-rate-apr").each(function () {
              var rateAprClass = $(this).attr("class").split(" ")[0];
              $(this).closest(".rateapr-parent").find("." + rateAprClass).html(roundOffAmtAPR(parseFloat(aprResult),2) + "%");

            });
            
          });
        }
      }

    });

  }
});
function getRatesUrl(rateType)
{
	var domainPath;
	var ratesURL;
	if (location.hostname.includes(".com")) {
	    domainPath = location.protocol + '//' + location.hostname;
	  }
	  else {
	    domainPath = location.protocol + '//' + location.hostname + ':' + location.port;
	  }
	if (rateType == "purchase") {
	      ratesURL = "/content/content/en-us/rates/purchase.json";
	    } else {
	      ratesURL = "/content/content/en-us/rates/refinance.json";
	    }
	    var url = domainPath + ratesURL;
	    return url;
}
function roundOffAmtAPR(num,numberofdecimals){
    return (Math.round((num + Number.EPSILON) * 100) / 100).toFixed(numberofdecimals);
  }
function getFixedDecimalVal(val, fractionalDigits) {
    if (val) {
      var actualValue = val.toString();
      return (actualValue) ? parseFloat(actualValue).toFixed(fractionalDigits) : null;
    }
    return null;
  }


$(function() {
    var	zipcode = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem('zipcode');
	
	if($('.cdCardTemplate').length > 0 ){
		if( zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5) ) {
			fetchAllproductCDRatesAPI(zipcode);
		}
	}

	//adding the ID's for radio button in cd special dynamically.
	$('.superCardRates input[type=radio][name="cdSpecialtermapy"]').each(function(index) {
		$(this).attr({"id":"cd-rate-"+index,"aria-labelledby":"cd-rate-label-"+index});
		$(this).closest(".superCardAPYTerm").find("label.superCardAPYTermSection").attr({"for":"cd-rate-"+index,"id":"cd-rate-label-"+index});
	});
    //Binding event to the button which has apply link
	$('.superCard a[href*="onboarding.usbank.com"]').on("click",function(e){
        var cdSelectionRadios = $(this).closest(".comparison-card-content").find("input[name='cdSpecialtermapy']");
        if( cdSelectionRadios && cdSelectionRadios.length > 0 ){
         e.preventDefault();
         var selectedcard = $("input[name='cdSpecialtermapy']:checked").val();
                if(selectedcard || selectedcard !== undefined){
                    var termAPY = selectedcard.split("-");
                    var applyLink = $(this).attr('href');
                    window.open(applyLink+"&term="+termAPY[0]+"&rate="+termAPY[1],"_self");
                }else{
                    $(".superCardAPYError").removeClass("hide");
                }
        }
    });
    //binding event to the radio remove the error message
    $('.superCardRates').change('input[type=radio][name="cdSpecialtermapy"]',function() {
         $(".superCardAPYError").addClass("hide");
    });
	
});
function fetchAllproductCDRatesAPI(zipcode) {
    if( $(".comparisonCard").length > 0 ) {
        var productKey = 'allRates';
        fetchCardRatesAPI(productKey,zipcode);
    }
}

function fetchCardRatesAPI(productKey,zipcode) {

    function createFootnoteElement(footNotes) {
        let footnote= "<sup>";
        footNotes.forEach(function(number){
            footnote = footnote + "<a href='#"+number+"'>"+number+"</a>";
        });
        footnote+="<sup>";
        var footnoteElem = document.createRange().createContextualFragment(footnote);
        return footnoteElem;
    }
    var removeCustomizedRate = $(".superCard .superCardRates").attr("data-zafinResults");
    var tstoken = usbUtils.getCookieItem("apply_jwt");
    rateApiCall(removeCustomizedRate);
    function rateApiCall(CustomizedRateFlag) {
        var data = { "zipcode": zipcode, "rateType": "CD", "output": "json" };
        depositRatesAPICall(data,zipcode,CustomizedRateFlag, tstoken).then(function(json){
            if (json.rateGrids !== undefined && json.rateGrids !== null) {
        		displayRateApi(json);
            } else {
		    	if(personlaizedRateFlag == "false"){
        		    depositRatesAPICall(data,zipcode,"true", tstoken).then(function(json){
                        displayRateApi(json);
                    });
              	}
            }
        });
        function displayRateApi(json) {
            if( productKey =='CD' || productKey =='allRates' ) {
                var cdSpecialsRegExp = new RegExp(/^(CD)/gi);
                $.each(json.rateGrids, function(i, rateGrid) {
                    if ( (rateGrid.rates !== undefined || rateGrid.rates !== null) && cdSpecialsRegExp.test(rateGrid.productKey) ) {
                        //console.log("CD Specials productKey "+i+" : "+rateGrid.productKey);
                        var footnotevalues = [];
                        $('.supercard-footnote-multifieldResults li').each(function() {
                            footnotevalues.push($(this).attr('data-footnote-property'));
                        });
                        $.each(rateGrid.rates, function(j, rate) {
                            var termInMonths, apy;
                            termInMonths = rate.termInMonths;
                            apy = parseFloat(rate.apy).toFixed(2);
                            var terms = 'for ' + termInMonths+(Number(termInMonths) === 1 ? ' month' : ' months');
                            $($(".cdCardTemplate .superCardRates .superCardAPYTerm")[j]).addClass('displaySuperCardResults');
                            $($(".cdCardTemplate .superCardRates .superCardAPYTerm")[j]).find(".termapy-selection input").attr("value",termInMonths+"-"+apy);
                            $($(".cdCardTemplate .superCardRates .superCardAPYTerm .superCardAPYTermSection ")[j]).children("span.superCardAPY").html(apy+'%');
                            $($(".cdCardTemplate .superCardRates .superCardAPYTerm .superCardAPYTermSection")[j]).children("span.superCardTerm").html(terms);
                        });
                    }
                });
            }

            //Trade Up CD
            if( productKey =='TU' || productKey =='allRates' ) {
                var tradeUpRegExp = new RegExp(/^(TU)/gi);
                $.each(json.rateGrids, function(i, rateGrid) {
                    if ( (rateGrid.rates !== undefined || rateGrid.rates !== null) && tradeUpRegExp.test(rateGrid.productKey) ) {
                        //console.log("Trade Up productKey "+i+" : "+rateGrid.productKey);
                        var maxAPY = 0.00;
                        var tradeMonth = "";
                        $.each(rateGrid.rates, function(j, rate) {
                            var termInMonths, apy;
                            termInMonths = rate.termInMonths;
                            apy = parseFloat(rate.apy).toFixed(2);
                            if( apy >= maxAPY ) {
                                maxAPY = apy;
                                tradeMonth = rate.termInMonths;
                            }
                        });
                        var terms = tradeMonth+(Number(tradeMonth) === 1 ? ' month' : ' months');
                        $('.tradeUpMaxAPY').html(parseFloat(maxAPY).toFixed(2) + '%').addClass('removeLoadingDataIcon');
                        $('.tradeUpMaxAPYTerms').html(terms);
                    }
                });
            }

            //Step Up CD
            if( productKey =='STEP' || productKey =='allRates' ) {
                var stepUpRegExp = new RegExp(/^(STEP)/gi);
                $.each(json.rateGrids, function(i, rateGrid) {
                    if ( (rateGrid.rates !== undefined || rateGrid.rates !== null) && stepUpRegExp.test(rateGrid.productKey) ) {
                        //console.log("Step Up productKey "+i+" : "+rateGrid.productKey);
                        // To implement in future.
                    }
                });
            }

            //Certificates of Deposit
            if( productKey =='TMTX' || productKey =='allRates' ) {
                var codRegExp = new RegExp(/^(TMTX)/gi);
                var maxAPY = 0.00;
                var tradeMonth = 0;
                $.each(json.rateGrids, function(i, rateGrid) {
                    if ( (rateGrid.rates !== undefined || rateGrid.rates !== null) && codRegExp.test(rateGrid.productKey) ) {
                        //console.log("COD productKey "+i+" : "+rateGrid.productKey);
                        $.each(rateGrid.rates, function(j, rate) {
                            var termInMonths, apy;
                            termInMonths = rate.termInMonths;
                            apy = parseFloat(rate.apy).toFixed(2);
                            if( apy >= maxAPY ) {
                                maxAPY = apy;
                                tradeMonth = (rate.termInMonths>tradeMonth) ? rate.termInMonths : tradeMonth;
                            }
                        });
                        var terms = tradeMonth + (Number(tradeMonth) === 1 ? ' month' : ' months');
                        $('.codMaxAPY').html(parseFloat(maxAPY).toFixed(2) + '%').addClass('removeLoadingDataIcon');
                        $('.codMaxAPYTerms').html(terms);
                    }
                });
            }
        }
    }
    let footNotes = $(".superCard [data-footnotes]").attr('data-footnotes');
    if(footNotes) {
        footNotes=footNotes.split(',');
        $(".superCardAPYTerm span.superCardTerm").after(createFootnoteElement([...footNotes.sort((a,b)=>{return a>b?1:-1})]));
    }
}
(function fetchCreditCardRates() {
    'use strict';

    function referenceFoundFor(targetElement) {
        return Boolean(targetElement !== null && typeof targetElement !== 'undefined');
    }

    function referenceFoundForAll(targetElements) {
        return Boolean(targetElements.length > 0 && referenceFoundFor(targetElements));
    }

    function getResponse(url, ratetextcontainers) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                populateRateData(ratetextcontainers, JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function populateRateData(ratetextcontainers, response) {
        ratetextcontainers.forEach(function(ratetextcontainer, index) {
            if (ratetextcontainer.hasAttribute('data-offerid')) {
                var responseObj = response[index];
                var cardOfferId = ratetextcontainer.getAttribute('data-offerid');
                if (responseObj.map.requestData !== undefined) {
                    var responseOfferId = responseObj.map.requestData.map.OfferID;
                    if (cardOfferId == responseOfferId && responseObj.map.responseData.map.Offers !== undefined) {
                        var responseData = responseObj.map.responseData.map.Offers.myArrayList[0].map.productDetailData.map;
                        var apikeys = usbUtils.nodeListArray(ratetextcontainer.querySelectorAll('.apiKey'));
                        if (referenceFoundForAll(apikeys)) {
                            apikeys.forEach(function(apiKey) {
                                var spanText = apiKey.textContent;
                                var classKey = apiKey.getAttribute('class');
                                var noLinkFlag = classKey.search('noRates');
                                var minAPRFlag = classKey.search('calculatedMinAPR');
                                var maxAPRFlag = classKey.search('calculatedMaxAPR');
                                var annualFeeAmountFlag = classKey.search('annualFeeAmount');
                                var introCashAdvanceMaxRateFlag = classKey.search('introCashAdvanceMaxRate');
                                var lastWord = classKey.split("-").pop();
                                var apiKeyNode = noLinkFlag > 0 ? apiKey : apiKey.parentNode;
                                var apiValue, responseApiVal;
                                var minAPRValue = "",
                                    maxAPRValue = "";
                                if (minAPRFlag > 0 || maxAPRFlag > 0) {
                                    minAPRValue = minAPRFlag > 0 ? parseFloat(responseData.calculatedMinAPR) : '';
                                    maxAPRValue = maxAPRFlag > 0 ? parseFloat(responseData.calculatedMaxAPR) : '';
                                    if ((minAPRValue.toString()).length > 0 && (maxAPRValue.toString()).length > 0) {
                                        if(minAPRValue === maxAPRValue){
                                            responseApiVal = maxAPRValue + "%";
                                        } else {
                                            responseApiVal = minAPRValue + "%" + " - " + maxAPRValue + "%";
                                            apiKeyNode.setAttribute("aria-label", minAPRValue + "%" + " to " + maxAPRValue + "%");
                                        }
                                    } else { //if only one flag exist
                                        responseApiVal = parseFloat(responseData[lastWord]) + "%";
                                    }
                                    apiValue = responseApiVal;
                                }
                                else if(introCashAdvanceMaxRateFlag > 0) {
                                    responseApiVal =  parseFloat(responseData.productVariableData.myArrayList[0].map[lastWord]) + "%";
                                    apiValue = responseApiVal;
                                } else {
                                    responseApiVal = annualFeeAmountFlag > 0 ? responseData.productVariableData.myArrayList[0].map.riskTierInformation.myArrayList[0].map.annualFeeInformation.map[lastWord] :
                                        responseData.productVariableData.myArrayList[0].map[lastWord];
                                    apiValue = spanText.indexOf("$") >= 0 ? spanText + parseInt(responseApiVal) : parseInt(responseApiVal) + spanText;
                                }
                                apiKeyNode.textContent = apiValue;
                                if(apiKeyNode.classList.contains("apiKey")) apiKeyNode.removeAttribute("class");
                            });
                        }
                    }
                }
            }
        });
    }

    function DOMContentLoaded() {
        var ratetextcontainers = usbUtils.nodeListArray(document.querySelectorAll('.content-container[data-offerid]'));
        if (referenceFoundForAll(ratetextcontainers)) {
            var reqData = "";
            var count = 0;
            var requestcount = 0;
            var containers = [];
            var blockwithrates = ratetextcontainers.length;
            var num = Math.floor(blockwithrates / 5);
            ratetextcontainers.forEach(function(ratetextcontainer, index) {
                if (ratetextcontainer.hasAttribute('data-offerid')) {
                    var reqStr =
                        ratetextcontainer.getAttribute('data-requestcode') + "_" +
                        ratetextcontainer.getAttribute('data-requestsourcecode') + "_" +
                        ratetextcontainer.getAttribute('data-locationnumber') + "_" +
                        ratetextcontainer.getAttribute('data-offerid') + ".";
                    reqStr = reqStr.replace(/undefined_undefined_undefined./gi, "");
                    reqData = reqData + reqStr;
                    containers.push(ratetextcontainer);
                    count++;
                }
                //making a new request for every 5 cards as dispatcher blocks lengthy requests
                if (reqData && (count == 5 || ((requestcount == num) && (index == (ratetextcontainers.length - 1))))) {
                    var datetime = new Date().valueOf();
                    var requestURL = "/svt/usbank/rateapi.param-" + reqData + datetime + "USB.json";
                    getResponse(requestURL, containers);
                    requestcount++;
                    count = 0;
                    reqData = "";
                    containers = [];
                }
            });
        }
    }

    if (referenceFoundFor(window && document)) {
        document.addEventListener = document.addEventListener || document.attachEvent;
        document.addEventListener('DOMContentLoaded', DOMContentLoaded, {
            'passive': true
        } || false);
    }
})();

$(document).ready(function () {
  var productKey = 'DDA86';

  var zipcode = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem('zipcode');
  if ($('.emmZafinTemplate').length > 0) {
    if (zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5)) {
      populateCardEMMRates(zipcode, productKey);
    }
  }

  function populateCardEMMRates(zipcode, productKey) {
    var tstoken = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem("apply_jwt");
    $('.cc-error-container').css('display', 'none');
    fetchZafinEMMRates(zipcode, productKey, tstoken).then(function (json) {
      if (json.rateGrids) {
        $.each(json.rateGrids, function (i, rateGrid) {
          var productRegExp = new RegExp(/^(DDA86)/gi);
          if ((rateGrid.rates) && productRegExp.test(rateGrid.productKey)) {
            $.each(rateGrid.rates, function (j, rate) {
              $(".emmZafinTemplate").each(function () {
                var standardApr = rate.apr ? Number.parseFloat(rate.apr).toFixed(2) : null;
                var standardApy = rate.apy ? Number.parseFloat(rate.apy).toFixed(2) : null;
                var tier = rate.tierDescription ? rate.tierDescription : null;
                var tierValue = $(this).find('.tier-value').val();
                if (standardApr && standardApy && tier && tierValue && tier == tierValue) {
                  var dynamicApyEle = $(this).find('.emmZafin_Apy');
                  var dynamicAprEle = $(this).find('.emmZafin_Apr');
                  dynamicApyEle.text(dynamicApyEle.text().replace('X.XX', standardApy));
                  dynamicAprEle.text(dynamicAprEle.text().replace('X.XX', standardApr));
                }
              });
            })
          }
        });
      } else {
        $('.cc-error-container').css('display', 'block');
      }

    }).catch(function (error) {
      $('.cc-error-container').css('display', 'block');
    });;
  }

});

"use strict";
$(document).ready(function(){
	var moreArticles = "<a class='moreArticles'>&hellip;</a>";
	
	$("section.featuredArticle").each(function(index,value){
		var article = $(this);
		var articleBodyContainer = article.find('.featured-articleBody-container');
		var articlesBlock = article.find('.featured-article-card-block');
		var articlesOnPage = articlesBlock.length;
		var viewMoreSection = article.find('.view-more-section');
		var viewmoreButton = article.find('.viewmore-btn');
		var userAgentAndroid = navigator.userAgent || navigator.vendor || window.opera;
		var isAndroidMode = /android/i.test(userAgentAndroid);
		var iOSMode = (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)) || (navigator.userAgent.match(/(iPad)/) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
		var rowsPerPage = articleBodyContainer.attr("data-rows");
		var colsPerPage = articleBodyContainer.attr("data-cols");
		var totalArticles = articleBodyContainer.attr("data-articles");
		var viewmode = viewMoreSection.attr("data-view-mode");
		var redirectPage = viewmoreButton.attr("data-redirect-page");
		var itemsInSection = null;
		var currentArticle = null;
		var viewMoreItemsIndex = null;
		
		if(totalArticles){
			if(articlesOnPage < totalArticles){
				totalArticles = articlesOnPage
			}
		}
		else{
			totalArticles = articlesOnPage;
		}
		article.attr("data-totalarticles",totalArticles);
		article.find(".pagination-focus").attr("id","featured-articles_"+index);
		if(viewmode && rowsPerPage && colsPerPage){
			itemsInSection = rowsPerPage*colsPerPage;
			article.attr("data-itemsinsection",itemsInSection);
			if(viewmode == "pagination"){
				paginationView(1,article);
			}
			else if(viewmode == "viewMoreButton"){
				articlesBlock.addClass("inactive-articles");
				viewMoreArticles(article);
			}
			else if(viewmode == "none"){
				articlesBlock.addClass("inactive-articles");
				for(var i = 1;i <= totalArticles;i++){
					article.find(".featured-article-card-block.article-"+i).addClass("active-articles");
				}
			}
		}
		
	});
	
	$(".featuredArticles-pagination").off().on("click","a",function(e){
		e.preventDefault();
		e.stopPropagation();
		var target=$(this).closest(".featuredArticle");
		var articleNumber = $(this).text();
		if(isNaN(articleNumber)){
			return false;
		}
		paginationView(parseInt(articleNumber),target,true);
	});
	
	$(".viewmore-btn").click(function(e){
		var target=$(this).closest(".featuredArticle");
		var viewMoreItemsIndex = target.attr("data-viewmoreitemsindex"); 
		var redirectPage = target.find('.viewmore-btn').attr("data-redirect-page");
		if(redirectPage){
			window.location.href = redirectPage+".html";
		}
		else{
			viewMoreArticles(target);
		}
	});
	
	function populatePagination(index,max,articlePagination,target){
		var currentArticle = target.attr("data-currentarticle");
		for(var i = index;i <= max;i++){
			articlePagination.append("<a>"+i+"</a>");
			if(i == currentArticle){
				articlePagination.find("a:last-child").addClass('current-article').removeAttr("href");
			}
		}
	}
	
	$(".featuredArticles-pagination").find("button").off().on("click",function(e){
		e.preventDefault();
		e.stopPropagation();
		var target=$(this).closest(".featuredArticle");
		var currentArticle = target.attr("data-currentarticle");
		if($(this).attr("class") == "prev"){
			paginationView(parseInt(currentArticle)-1,target,true);
		}
		if($(this).attr("class") == "next"){
			paginationView(parseInt(currentArticle)+1,target,true);
		}
	});
	
	function paginationView(index,target,clicked){
		var articlePagination = target.find('.articleNumbers');
		var currentArticle = parseInt(index);
		var paginationTarget = "#"+target.find(".pagination-focus").attr("id");
		target.attr("data-currentarticle",currentArticle);
		var articlesBlock = target.find('.featured-article-card-block');
		var itemsInSection = target.attr("data-itemsinsection");
		var totalArticles = target.attr("data-totalarticles");
		articlesBlock.addClass("inactive-articles").removeClass("active-articles");
		var itemsInSecionDisplayStart = (currentArticle-1)*itemsInSection + 1;
		var itemsInSecionDisplayEnd = parseInt(itemsInSecionDisplayStart) + parseInt(itemsInSection) - 1;
		if(itemsInSecionDisplayEnd >= totalArticles){
			itemsInSecionDisplayEnd = totalArticles;
		}
		for(var i = itemsInSecionDisplayStart;i <= itemsInSecionDisplayEnd;i++){
			target.find(".featured-article-card-block.article-"+i).addClass("active-articles");
		}
		var paginationRequired = Math.ceil(totalArticles/itemsInSection);
		articlePagination.empty();
		if(paginationRequired <= 5){
			populatePagination(1,paginationRequired,articlePagination,target);
		}
		else if(currentArticle>paginationRequired-3){
			articlePagination.append("<a>1</a>"+moreArticles);
			populatePagination(paginationRequired-3,paginationRequired,articlePagination,target);
		}
		else if(currentArticle <= 3){
			populatePagination(1,4,articlePagination,target);
			articlePagination.append(moreArticles+"<a>"+paginationRequired+"</a>");
		}
		else{
			var prevArticle = currentArticle-1;
			var nextArticle = currentArticle+1;
			articlePagination.append("<a>1</a>"+moreArticles);
			articlePagination.append("<a>"+prevArticle+"</a><a class = 'current-article'>"+currentArticle+"</a><a>"+nextArticle+"</a>");
			articlePagination.append(moreArticles+"<a>"+paginationRequired+"</a>");
		}
		target.find(".moreArticles").attr("aria-hidden","true");
		target.find(".current-article").attr("aria-hidden","true");
		target.find('.next').removeAttr("disabled").removeAttr("aria-hidden");
		target.find('.prev').removeAttr("disabled").removeAttr("aria-hidden");
		var articlePaginationContainer = target.find('.featuredArticles-pagination'); 
		if(clicked){
			var announcementMessage = target.find('.featured-articleBody-container').data("announcementtext").replace("{currentPage}",currentArticle).replace("{totalPage}",paginationRequired); 
			if(announcementMessage){
				target.find('.pagination-focus').attr("tabindex","0").text(announcementMessage).focus();
			}
		}
		articlePaginationContainer.addClass("active");
		articlePagination.find("a:not(.moreArticles,.current-article)").attr("href",paginationTarget);
		if(currentArticle == 1){
			articlePaginationContainer.find('.prev').attr("disabled","disabled").attr("aria-hidden","true");
		}
		if(currentArticle == paginationRequired){
			articlePaginationContainer.find('.next').attr("disabled","disabled").attr("aria-hidden","true");
		}
	}
	
	function viewMoreArticles(target){
		var viewMoreItemsIndex = target.attr("data-viewmoreitemsindex");
		var itemsInSection = target.attr("data-itemsinsection");
		var totalArticles = target.attr("data-totalarticles");
		var viewmoreButton = target.find('.viewmore-btn');
		if(viewMoreItemsIndex){
			viewMoreItemsIndex = parseInt(itemsInSection) + parseInt(viewMoreItemsIndex);
			if(viewMoreItemsIndex >= totalArticles){
				viewmoreButton.addClass("hide");
				viewMoreItemsIndex = totalArticles;
			}
		}
		else{
			viewMoreItemsIndex = itemsInSection;
		}
		target.attr("data-viewmoreitemsindex",viewMoreItemsIndex);
		for(var i = 1;i <= viewMoreItemsIndex;i++){
			target.find(".featured-article-card-block.article-"+i).addClass("active-articles");
		}
	}
	
	$(".pagination-focus").focusout(function(e){
			$(this).removeAttr("tabindex").empty();
	});
	
});
$(document).ready(function() {
    var comparisonChart = $(".comparison-table");
    //keyboard navigation for cards dropdown
    function addKeyPressEventHandler() {
        $("[role=combobox]").each(function(comboboxIndex, combobox) {
            var listbox = $(combobox).siblings("[role=listbox]"),
                listoptions = listbox.find("[role=option], a[href^=https]").not('[class*=" selected-product-"]'),
                thenFocusButton = function() {
                    return combobox.focus();
                },
                thenFocusListbox = function() {
                    return listbox.focus();
                },
                thenFocusFirstOption = function() {
                    return listoptions.not(":hidden").first().focus();
                },
                thenFocusLastOption = function() {
                    return listoptions.not(":hidden").last().focus();
                };
  
            $(combobox).on("keydown", function(event) {
                if (event.type === "keydown") {
                    if (listbox.is(":hidden")) {
                        if (event.key.match(/Spacebar/gi) || event.which === (27 || 32) && listbox.is(":hidden")) {
                            $(this).attr("aria-expanded", "true");
                            $(this).siblings(".product-dropdown-items").toggleClass("expanded");
                            $(this).children(".product-dropdown-icon").toggleClass("icon-chevron-up");
                            thenFocusButton();
                        }
  
                    }
                    if (listbox.is(":visible")) {
                        listbox.attr({
                            "tabindex": "-1"
                        });
                        if (event.key.match(/\w/gi)) {
                            focusFirstMatchedItem(event.key, listoptions);
                        }
                        if (event.key.match(/Escape|Spacebar/gi) || event.which === (27 || 32)) {
                            closeDropdownList(thenFocusButton);
                        }
                        if (event.key.match(/ArrowUp/gi) || event.which === 38) {
                            return event.preventDefault();
                        }
                        if (event.key.match(/ArrowDown/gi) || event.which === 40) {
                            event.preventDefault();
                            return thenFocusListbox();
                        }
                        if (event.key.match(/End/gi) || event.which === 35) {
                            return thenFocusLastOption();
                        }
                        if (event.key.match(/Home/gi) || event.which === 36) {
                            return thenFocusFirstOption();
                        }
                        if (event.key.match(/Tab/gi) || (event.which === 9 || event.which === 16)) {
                            event.preventDefault();
                            return closeDropdownList(thenFocusButton);
                        }
                    }
                }
            });
  
            listbox.on("keydown", function(event) {
                if (event.type === "keydown" && listbox.is(":focus")) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    var blurListbox = function(fn) {
                        if (typeof fn === "function") return fn();
                    };
                    if (event.key.match(/\w/gi)) {
                        focusFirstMatchedItem(event.key, listoptions);
                    }
                    if (event.key.match(/ArrowUp/gi) || event.which === 38) {
                        return blurListbox(thenFocusButton);
                    }
                    if (event.key.match(/ArrowDown/gi) || event.which === 36) {
                        return blurListbox(thenFocusFirstOption);
                    }
                    if (event.key.match(/Home/gi) || event.which === 36) {
                        return blurListbox(thenFocusFirstOption);
                    }
                    if (event.key.match(/End/gi) || event.which === 35) {
                        return blurListbox(thenFocusLastOption);
                    }
                    if (event.key.match(/Escape|Tab/gi) || event.which === (27 || 16)) {
                        event.preventDefault();
                        return closeDropdownList(thenFocusButton);
                    }
                }
            });
        });
  
        $("[role=listbox]").each(function(listboxIndex, listbox) {
            var combobox = $(listbox).siblings("[role=combobox]"),
                listoptions = $(listbox).find("[role=option]").not('[class*=" selected-product-"]'),
                thenFocusButton = function() {
                    return combobox.focus();
                },
                thenFocusFirstOption = function() {
                    return listoptions.not(":hidden").first().focus();
                },
                thenFocusLastOption = function() {
                    return listoptions.not(":hidden").last().focus();
                };
  
            listoptions.each(function(listoptionIndex, listoption) {
                var prevOption = $(listoptions.get(listoptionIndex - 1)),
                    currOption = $(listoptions.get(listoptionIndex)),
                    nextOption = $(listoptions.get(listoptionIndex + 1));
  
                $(listoption).on("keydown", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    $(listbox).attr({
                        "tabindex": "-1"
                    });
                    if (event.type === "keydown") {
                        if (event.key.match(/\w/gi)) {
                            focusFirstMatchedItem(event.key, listoptions);
                        }
                        if (event.key.match(/ArrowUp/gi) || event.which === 38) {
                            return listoptions.first().is(":focus") ? thenFocusButton() : prevOption.focus();
                        }
                        if (event.key.match(/ArrowDown/gi) || event.which === 40) {
                            return listoptions.last().is(":focus") ? false : nextOption.focus();
                        }
                        if (event.key.match(/Home/gi) || event.which === 36) {
                            return thenFocusFirstOption();
                        }
                        if (event.key.match(/End/gi) || event.which === 35) {
                            return thenFocusLastOption();
                        }
                        if (event.key.match(/Enter/gi) || event.which === 13) {
                            return currOption.click();
                        }
                        if (event.key.match(/Escape|Tab/gi) || event.which === (27 || 16)) {
                            return closeDropdownList(thenFocusButton);
                        }
                        if (event.key.match(/Spacebar/gi) || event.which === 32) {
                            return currOption.click();
                        }
                    }
                });
            });
        });
    }
  
    function closeDropdownList(fn) {
        $(".product-dropdown-items.expanded").removeAttr("tabindex").stop().slideUp(200, function() {
            $(".product-dropdown-items.expanded").removeClass("expanded").removeAttr("tabindex").siblings(".product-dropdown-button").removeAttr("tabindex").attr({
                "aria-expanded": "false"
            }).children(".product-dropdown-icon").toggleClass("icon-chevron-up");
            if (typeof fn === "function") return fn();
        });
    }
  
    function focusFirstMatchedItem(keyPressed, $elements) {
        function byFirstLetter($element) {
            return $element.toLowerCase().startsWith(keyPressed.toLowerCase());
        }
        var options = $elements.toArray(),
            letterFoundInOptions = options.some(function(option) {
                return byFirstLetter(option.textContent.trim());
            });
        if (letterFoundInOptions) {
            var focused = options.indexOf(document.activeElement),
                match = void 0;
            if (focused === -1) {
                match = options.findIndex(function(option) {
                    return byFirstLetter(option.textContent.trim());
                });
            } else {
                var start = focused += 1;
                var items = [].concat(options.slice(start), options.slice(0, start));
                match = options.indexOf(items.find(function(item) {
                    return byFirstLetter(item.textContent.trim());
                }));
            }
            if (match !== -1) options[match].focus();
        }
    }
  
  
    function resize() {
        var product;
        if ($(window).width() < 1056) {
            //$(".compare-row-header div[role='cell']").attr("aria-colspan", "2");
            if (comparisonChart.attr("data-productcount") <= 2) {
                comparisonChart.find(".sticky").addClass("show-sticky-product-content");
            } else {
                product = $(".product-dropdown-1 .product-dropdown-items .dropdown-item.selected-product-3").attr("data-content");
                comparisonChart.find(".sticky").removeClass("show-sticky-product-content");
                $(".dropdown-item").removeClass("selected-product-3");
                $(".compare-cell[data-content=" + product + "]").removeClass("compare-cell-3");
            }
            
            $(".product-name").each(function() {
                var childTag = $(this).children().first();
                if (childTag.is(':header')) {
                    var level = childTag.prop('tagName').split("H")[1];
                    $(this).attr({
                        "role": "heading",
                        "aria-level": level
                    });
                }
            });
        } else {
            $(".product-name").removeAttr("role aria-level");
            if (comparisonChart.attr("data-productcount") <= 3) {
                comparisonChart.find(".sticky").addClass("show-sticky-product-content");
            } else {
                comparisonChart.find(".sticky").removeClass("show-sticky-product-content");
            }
            if (comparisonChart.attr("data-productcount") >= 3) {
                //$(".compare-row-header div[role='cell']").attr("aria-colspan", "3");
                if (!$(".dropdown-item").hasClass("selected-product-3")) {
                    var selectedProduct, previouslySelectedProduct = $(".compare-header .compare-cell-3 .product-content").attr("data-content");
                    $(".product-dropdown-1 .product-dropdown-items .dropdown-item").each(function() {
                        if (!$(this).is('[class*=" selected-product-"]')) {
                            selectedProduct = $(this).attr("data-content");
                            return false;
                        }
                    });
  
                    $(".product-dropdown-3 .product-dropdown-button").attr("aria-label", $(".compare-header .product-dropdown-3 .product-dropdown-items .dropdown-item[data-content=" + selectedProduct + "]").html()).find(".product-title").html($(".compare-header .product-dropdown-3 .product-dropdown-items .dropdown-item[data-content=" + selectedProduct + "]").html());
                    $(".dropdown-item[data-content=" + selectedProduct + "]").addClass("selected-product-3");
                    $(".compare-cell[data-content=" + selectedProduct + "]").addClass("compare-cell-3");
                    $(".product-content[data-content=" + selectedProduct + "]").each(function() {
                        var selectedProductContainer = $(this).closest(".compare-cell");
                        $(this).closest(".compare-row").find(".product-content[data-content=" + previouslySelectedProduct + "]").before($(this));
                        selectedProductContainer.append($(this).closest(".compare-row").find(".product-content[data-content=" + previouslySelectedProduct + "]"));
            var previouslySelectedProductButton = $(this).closest(".compare-row").find(".product-button-container[data-content=" + previouslySelectedProduct + "]");
            var selectedProductButton = $(this).closest(".compare-row").find(".product-button-container[data-content=" + selectedProduct + "]");
            previouslySelectedProductButton.before(selectedProductButton);
                    selectedProductContainer.append(previouslySelectedProductButton);
                    });
                    $(".compare-cell[data-content=" + selectedProduct + "]").each(function() {
                        $(this).siblings(".compare-cell[data-content=" + previouslySelectedProduct + "]").before($(this));
                    });
                }
  
                $(".compare-body").each(function() {
                    $(this).children(".compare-cell-2").after($(this).find(".compare-cell-3"));
                });
                $(".compare-footer").each(function() {
                    $(this).children(".compare-cell-2").after($(this).find(".compare-cell-3"));
                });
  
                if (comparisonChart.attr("data-productcount") == 3) {
                    comparisonChart.find(".sticky .sticky-product-name-1").html($(".compare-header .product-dropdown-1 .product-dropdown-items .dropdown-item.selected-product-1").html());
                    comparisonChart.find(".sticky .sticky-product-name-2").html($(".compare-header .product-dropdown-1 .product-dropdown-items .dropdown-item.selected-product-2").html());
                    comparisonChart.find(".sticky .sticky-product-name-3").html($(".compare-header .product-dropdown-1 .product-dropdown-items .dropdown-item.selected-product-3").html());
                }
            }
        }
  
        $(".cc-text-container").css("padding-top", "");
        if ($(window).width() < 672) {
            $(".cc-icon-container:visible").siblings(".cc-text-container").css("padding-top", "18px");
        }
        let ua = window.navigator.userAgent || window.navigator.platform,
            height = parseInt(screen.height * window.devicePixelRatio), // screen.height works with iPad
            width = parseInt(screen.width * window.devicePixelRatio), // screen.width works on iPad
            isAppleTablet = /ipad/gi.test(ua) || (/apple|mac|safari/gi.test(ua) && ('ontouchend' in window || navigator.maxTouchPoints > 0) && (width >= 1536 && width <= 2048) && (height >= 2048 && height <= 2732)); // iPadOS 13 workaround, sizing for iPad Mini 2 to iPad Pro 12.9
       
        if ((navigator.userAgent.match(/(iPod|iPhone|iPad)/)|| isAppleTablet)) {
            $(".product-dropdown .product-dropdown-button").removeAttr("aria-label");
        }
    }
  
    // Make sure the Comparison Chart Table is on the page.
    if (comparisonChart.length > 0) {
        addKeyPressEventHandler();
        resize();
        $(".product-name").on("keydown", function(event) {$(".product-name").removeAttr("tabindex");});
        $(".dropdown-item").click(function(e) {
            e.preventDefault();
            let ua = window.navigator.userAgent || window.navigator.platform,
                height = parseInt(screen.height * window.devicePixelRatio), // screen.height works with iPad
                width = parseInt(screen.width * window.devicePixelRatio), // screen.width works on iPad
                isAppleTablet = /ipad/gi.test(ua) || (/apple|mac|safari/gi.test(ua) && ('ontouchend' in window || navigator.maxTouchPoints > 0) && (width >= 1536 && width <= 2048) && (height >= 2048 && height <= 2732)); // iPadOS 13 workaround, sizing for iPad Mini 2 to iPad Pro 12.9
       
            $(this).closest(".product-dropdown-items").removeClass("expanded");
            $(this).closest(".product-dropdown").find(".product-dropdown-icon").removeClass("icon-chevron-up");
            var selectedProduct = $(this).attr("data-content");
            var selectedDropdown = $(this).attr("data-dropdown");
            var previouslySelectedProduct = $(".selected-product-" + selectedDropdown + "[data-dropdown=" + selectedDropdown + "]").attr("data-content");
            $(".dropdown-item[data-content=" + previouslySelectedProduct + "]").removeClass("selected-product-" + selectedDropdown);
            $(".dropdown-item[data-content=" + selectedProduct + "]").addClass("selected-product-" + selectedDropdown);
            $(".product-dropdown-" + selectedDropdown + " .product-dropdown-button").find(".product-title").html($(this).html());
            if (!(navigator.userAgent.match(/(iPod|iPhone|iPad)/)|| isAppleTablet)) {
                $(".product-dropdown-" + selectedDropdown + " .product-dropdown-button").attr({"aria-label": $(this).html()});
            }
            $(".product-dropdown-" + selectedDropdown + " .product-dropdown-button").attr({"aria-expanded": "false"});
            $(".compare-cell[data-content=" + previouslySelectedProduct + "]").removeClass("compare-cell-" + selectedDropdown);
            $(".compare-cell[data-content=" + selectedProduct + "]").addClass("compare-cell-" + selectedDropdown);
  
            $(".product-content[data-content=" + selectedProduct + "]").each(function() {
                var selectedProductContainer = $(this).closest(".compare-cell");
                $(this).closest(".compare-row").find(".product-content[data-content=" + previouslySelectedProduct + "]").before($(this));
                selectedProductContainer.append($(this).closest(".compare-row").find(".product-content[data-content=" + previouslySelectedProduct + "]"));
                var previouslySelectedProductButton = $(this).closest(".compare-row").find(".product-button-container[data-content=" + previouslySelectedProduct + "]");
                var selectedProductButton = $(this).closest(".compare-row").find(".product-button-container[data-content=" + selectedProduct + "]");
                previouslySelectedProductButton.before(selectedProductButton);
                selectedProductContainer.append(previouslySelectedProductButton);
            });
  
            $(".compare-cell[data-content=" + selectedProduct + "]").each(function() {
                $(this).siblings(".compare-cell[data-content=" + previouslySelectedProduct + "]").before($(this));
            });
  
  
            if ($(window).width() < 672) {
                $(".cc-text-container").css("padding-top", "");
                $(".cc-icon-container:visible").siblings(".cc-text-container").css("padding-top", "18px");
            }
            $("[role=combobox]").unbind("keydown");
            $("[role=listbox]").unbind("keydown");
            $("[role=option]").unbind("keydown");
            addKeyPressEventHandler();
  
            //to bring the focus back to selection box after selection
            $(this).closest(".product-dropdown-items").removeAttr("tabindex", "-1").attr({
                "aria-hidden": "true",
                "inert": "true"
            }).blur();
            $(this).closest(".product-dropdown").parent().find(".product-name").attr("tabindex", "0").focus();
        });
  
        $(".product-dropdown-button").click(function(e) {
            var ua = window.navigator.userAgent || window.navigator.platform,
                height = parseInt(screen.height * window.devicePixelRatio), // screen.height works with iPad
                width = parseInt(screen.width * window.devicePixelRatio), // screen.width works on iPad
                isAppleTablet = /ipad/gi.test(ua) || (/apple|mac|safari/gi.test(ua) && ('ontouchend' in window || navigator.maxTouchPoints > 0) && (width >= 1536 && width <= 2048) && (height >= 2048 && height <= 2732)); // iPadOS 13 workaround, sizing for iPad Mini 2 to iPad Pro 12.9
                //To fix dropdown not expanding issue in VO
            if ((navigator.userAgent.match(/(iPod|iPhone|iPad)/)|| isAppleTablet) && e.detail != "1") return;
            $(this).siblings(".product-dropdown-items").removeAttr("aria-hidden").removeAttr("inert");
            if ($(".product-dropdown-items").hasClass('expanded') && !$(this).siblings(".product-dropdown-items").hasClass("expanded")) {
                $(".product-dropdown-items").removeClass('expanded');
                $(".product-dropdown-icon").removeClass("icon-chevron-up");
                $(".product-dropdown-button").attr("aria-expanded", "false");
                $(".product-dropdown-items").removeAttr("tabindex");
                $(".product-dropdown-button").removeAttr("tabindex");
            }
            if ($(this).siblings(".product-dropdown-items").hasClass("expanded")) {
                $(this).attr({ "aria-expanded": "false" }).focus();
                $(this).removeAttr("tabindex");
  
            } else {
                $(this).attr("aria-expanded", "true");
            }
            $(this).siblings(".product-dropdown-items").toggleClass("expanded");
            $(this).children(".product-dropdown-icon").toggleClass("icon-chevron-up");
            if ($(this).attr("aria-expanded") == "true") {
                $(this).siblings(".product-dropdown-items").attr("tabindex", "0").focus();
            }
        });
  
        $(window).on('click', function(event) {
            if (!$(event.target).hasClass('product-dropdown-button') && ($(event.target).closest('.product-dropdown-button').length === 0)) {
                if ($(".product-dropdown-items").hasClass('expanded')) {
                    $(".product-dropdown-items").removeClass('expanded');
                    $(".product-dropdown-icon").removeClass("icon-chevron-up");
                    $(".product-dropdown-button").attr("aria-expanded", "false");
                    $(".product-dropdown-items").removeAttr("tabindex");
                    $(".product-dropdown-button").removeAttr("tabindex");
                }
            }
        });
  
        $(window).on("resize", resize);
  
        $(window).on("scroll", function(event) {
            event.preventDefault();
            event.stopPropagation();
            var comparisonChartStart = comparisonChart.offset().top,
                comparisonChartEnd = comparisonChart.find(".row-container:nth-last-child(1)").offset().top - 88,
                scrollDistanceFromTop = $(document).scrollTop();
            // If the scroll position is above the start of the sticky header start position, remove sticky header logic
            if (scrollDistanceFromTop < comparisonChartStart) {
                comparisonChart.find(".sticky").removeClass("show-sticky");
                $(".compare-header .product-dropdown-container").removeAttr("inert", "true").removeAttr("aria-hidden", "true");
            }
            // If the scroll position is between the start and end of the sticky header positions, add sticky header logic and show
            if (scrollDistanceFromTop >= comparisonChartStart && scrollDistanceFromTop < comparisonChartEnd && !comparisonChart.find(".sticky").hasClass("show-sticky")) {
                $(window).trigger("click");
                comparisonChart.find(".sticky").addClass("show-sticky");
                $(".compare-header .product-dropdown-container").attr("inert", "true").attr("aria-hidden", "true");
            }
            // If the scroll position is below the end of the sticky header end position, hide the sticky header above the viewport
            if (scrollDistanceFromTop >= comparisonChartEnd) {
                comparisonChart.find(".sticky").removeClass("show-sticky");
                $(".compare-header .product-dropdown-container").removeAttr("inert", "true").removeAttr("aria-hidden", "true");
            }
        });
    }
  });
function populateAsOfDate() {
  var ratesAsOfDate;
  var domainPath = getDomainPath();
  var url = getUrl(domainPath);
  $.getJSON(url, function (result) {
    if (result && result.date) {
      ratesAsOfDate = result.date;
      var asOfDateComponent = $(".mortgageAsOfDate");
      asOfDateComponent.each(function () {
        var ratesdateString = $(this).find('.mortgage-as-of-date-rte').html().replace("$date", ratesAsOfDate);
        $(this).find('.mortgage-as-of-date-rte').html(ratesdateString);
      });
    }
  }).fail(function () {
    console.log("Error in accessing Mortgage As Of Date service and get AsOfDate");
  });
}
function getDomainPath() {
  var domainPath = "";
  if (location.hostname.includes(".com")) {
    domainPath = location.protocol + '//' + location.hostname;
  } else {
    domainPath = location.protocol + '//' + location.hostname + ':' + location.port;
  }
  if (domainPath == undefined || domainPath.length == 0) {
    domainPath = "https://www.usbank.com";
  }
  //domainPath = "https://it2.usbank.com";
  return domainPath;
}

function getUrl(domainPath) {
  var url = "";
  if (domainPath) {
    var ratesURL = "/content/content/en-us/rates/purchase.json";
    var ratesTypeCheck = $('#ratesType').val();
    if (ratesTypeCheck == "refinance") {
      ratesURL = "/content/content/en-us/rates/refinance.json";
    }
    url = domainPath + ratesURL;
  }
  return url;
}

$(document).ready(function () {
  if ($(".mortgageAsOfDate").length > 0) {
    populateAsOfDate();
  }
});
$(document).ready(function () {
  'use strict';
  var links = [];
  var isIos = function () { return navigator.platform && /(ipad|iphone)/i.test(navigator.userAgent.toLowerCase()); };
  var isAndroid = function () { return navigator.platform && /(android)/.test(navigator.userAgent.toLowerCase()); };
  var id_root = 'returnto_bodynotes_';
  var id_dest = 'footnote_region_';

  var isSelected = function (e) {
    return e.type == 'keydown' && e.keyCode == 13 || /(click|touchstart|mousedown)/.test(e.type);
  };

  var numbered_disclosures = $('li.disclosure');

  fetchDisclosureData();

  //creating ramdom key to set the footnote id
  function randomKey(len) {
    var gather = [];
    var chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    for (var i = 0; i < len; i++) {
      gather.push(chars[Math.floor(Math.random() * 16)]);

    }
    return gather.join('');

  }

  $(window).resize(returnHandler);

  //@footnote linking start
  function tagFootnotes() {
    var sups = $('sup a, a sup');
    numbered_disclosures = $('li.disclosure');

    for (var _i = 0; _i < sups.length; _i++) {

      var wrapped = sups[_i].nodeName === 'SUP'

      var link = wrapped ? sups[_i].parentElement : sups[_i];
      if (wrapped) {
        sups[_i].classList.add('disc_footnote');
      } else {
        sups[_i].parentElement.classList.add('disc_footnote');
      }
      setFootnoteLink(link, wrapped);
    }

    //when foonotes are configured as text.ex: <a href="#2">Refer the disclosure2</a>
    var footnotelinks = Array.from(document.querySelectorAll('a[href^="#"]'));
    var regex = new RegExp("^\\d+$");
    footnotelinks = footnotelinks.filter(function (link) {
      var href = link.getAttribute("href").replace('#', '');
      return regex.test(href) && link.parentElement.nodeName !== 'SUP' && !link.firstElementChild;
    });
    footnotelinks.forEach(function (link) {
      setFootnoteLink(link, false);
    });

    setFootnotes();
    setFirstEntryNotice();
  }
  function setFootnoteLink(link, wrapped) {
    var index = parseInt(link.getAttribute("href").replace('#', ''));

    var footnote = numbered_disclosures[index - 1];
    var link_id = id_root + randomKey(4);

    //@note each link generates unique id
    // => footnote elements are generated for each to support re-use of a footnote link #

    /// prevents errors when there is not footnote the coorelates to the link's #
    if (footnote) {
      var hasReturnlink = footnote.querySelectorAll('a.disclosureReturn');
      link.return_link = hasReturnlink[0];

      try {
        link.dest = footnote;
        link.focal = footnote.querySelector('.disclose_message');//$(footnote).find('p')[0];

        //first paragraph of footnote
        link.setAttribute('id', link_id);
        link.removeAttribute('title');
        link.return_link = returnEl(index, link_id);

        if(/\/es\//.test(window.location.href)){
            link.setAttribute('aria-label', 'Nota a pie de página ' + index);
            link.footnote_label = footnoteLabel('Nota a pie de página ' + index);
        } else {
            link.setAttribute('aria-label', 'Footnote ' + index);
            link.footnote_label = footnoteLabel('Footnote ' + index);
        }

        // first in is default dest and focal
        if (hasReturnlink.length === 0) {
          footnote.appendChild(link.return_link);
          footnote.insertBefore(link.footnote_label, footnote.children[0]);
        }

        // set destination .. footnote region, with unique id if not done so already
        var dest_id_unique = id_dest + randomKey(4);
        if (link.focal) {
          link.focal.setAttribute('id', dest_id_unique);
          link.focal.parentElement.setAttribute('aria-labelledby', dest_id_unique);
        }

        link.href = '#' + dest_id_unique;
        link.return_link.dest = wrapped ? link.parentElement : link.parentElement.parentElement;
        link.return_link.focal = link;
        linkHandlers(link);
        links.push(link);

      }
      catch (err) {
        console.log("Error in tagFootnotes in disclosure");
      }
    }
  }

  function setFirstEntryNotice() {
    //set first disclosure entry message visible and hide all else
    var notices = document.querySelectorAll('.disclosure_entry_notice');
    if (notices.length > 0) {
      notices[0].style.display = 'block';
      for (var _i = 1; _i < notices.length; _i++) {
        notices[_i].style.display = 'none';
      }
    }
  }

  // global polyfills should be used to make this not necessary
  function linkHandlers(link) {
    if (window.addEventListener) {

      link.return_link.addEventListener('click', returnHandler, false);
      link.return_link.addEventListener('mousedown', returnHandler, false);
      link.return_link.addEventListener('keydown', returnHandler, false);
      if ('ontouchstart' in document.documentElement)
        link.return_link.addEventListener('touchstart', returnHandler, false);

      link.addEventListener('click', navigate, false);
      link.addEventListener('keydown', navigate, false);

    }
    if (window.attachEvent) {

      link.return_link.attachEvent('click', returnHandler, false);
      link.return_link.attachEvent('keydown', returnHandler, false);
      if ('ontouchstart' in document.documentElement)
        link.return_link.attachEvent('touchstart', returnHandler, false);

      link.attachEvent('click', navigate, false);
      link.attachEvent('keydown', navigate, false);

    }
  }

  function footnoteLabel(descript) {
    var label = document.createElement('div');
    label.className = 'sr-only footnote-label';
    label.textContent = descript;

    return label;

  }

  //@footnote linking end

  //@footnote switch footnotes regions per target device
  function setFootnotes() {


    for (var _l = 0; _l < links.length; _l++) {
      var link = links[_l];
      if (isIos()) {
        link.return_link.setAttribute('role', 'link');
        link.focal.setAttribute('tabindex', '0');
      } else if (isAndroid()) {
        link.return_link.removeAttribute('role');
        link.focal.setAttribute('tabindex', '0');
      } else {
        link.return_link.removeAttribute('role');
        link.focal.setAttribute('tabindex', '-1');
      }

    }

  }

  function returnEl(index, tag) {
    var footNoteContent = $("#returnToContentFootnote").val();
    var a = document.createElement('a');

    a.href = "#" + tag;
    a.text = footNoteContent + index;

    a.className = 'disclosureReturn sr-only';
    a.dataset.target = '_self';

    return a;
  }

  // @navigation handlers start
  function navigate(event) {

    if (isSelected(event)) {
      //check for existing link to be replaced with this link's return to anchor
      var link = event.target.nodeName === 'SUP' ? event.target.parentElement : event.target;
      if (link.dest) {

        event.preventDefault();
        event.stopImmediatePropagation();

        var rl = link.dest.querySelector('a.disclosureReturn')
        if (rl)
          link.dest.replaceChild(link.return_link, rl);

        scroll(link, 'footnote');

      }
    }

  }

  function returnHandler(e) {
    var link = e.target;

    if (link && isSelected(e)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      scroll(link, 'returnto');
    }
  }

  function scroll(link, context) {
    if (link.dest) {

      var _ittr = 0;
      //results in 2 iteractions for some reason this is what is needed for full amimation
      $("html, body").stop().animate(
        { scrollTop: $(link.dest).offset().top - (($(".globalComparisonChart .comparison-table").length && context == 'returnto') ? (100 + ($(link.dest.closest(".compare-row")).length ? $(link.dest).offset().top - $(link.dest.closest(".compare-row")).offset().top : 0)) : 0) }, {
        complete: function () {
          _ittr++;
          link.focal.focus();
        }
      }
      );
    }
  }
  // @navigation handlers end

  //Load Footnote Disclosures
   function fetchDisclosureData() {
    tagFootnotes();
    rates.fetchRates(); //  to fetch dynamic rates
    zafinEmmRates.fetchRates(); // to fetch zafin elite money market rates
    // Externally calling the speedBumpReader as the links are not loading because of the ajax call, at the beginning of the page load..
    speedBumpReader.attach();
  }


// Hide return to footnote links from the Disclosures for the footnotes that are not present on the page 

   (function activeMutationObserver() {
    var config = { childList: true, subtree: true };
    
    var handleFootnoteVisibility = function() {
      var disclosures = usbUtils.nodeListArray(document.querySelectorAll('[href*=returnto]'));

      var footnotes = usbUtils.visibleNodes(document.querySelectorAll('[href*=footnote_'));

      disclosures.forEach(function(disclosure, index) {

        var footnote = document.querySelector(disclosure.getAttribute('href'));

        if (footnotes.indexOf(footnote) > -1) {
          disclosure.style = null;
        } else {
          disclosure.style.display = 'none';
        }
      });
    };

    var callback = (mutationList, observer) => {
      for (const mutation of mutationList) {

        switch (mutation.type) {
          case 'childList':
            setTimeout(function() {
              handleFootnoteVisibility(); 
            }, 150);
            break;

           case 'subtree':
              setTimeout(function() {
              handleFootnoteVisibility(); 
            }, 150)
             break;

          default:
            break;
        }
      }
    };

    var observer = new MutationObserver(callback);

    if (usbUtils.nodeListArray(document.querySelectorAll('[href*=footnote_').length > 0)) {
      var observer = new MutationObserver(callback);
      observer.observe(document.body, config);      
    }

  })();

});

var rates = rates || {};
(function fetchCreditCardRates() {
    'use strict';

    function referenceFoundFor(targetElement) {
        return Boolean(targetElement !== null && typeof targetElement !== 'undefined');
    }

    function referenceFoundForAll(targetElements) {
        return Boolean(targetElements.length > 0 && referenceFoundFor(targetElements));
    }

    function getResponse(url, ratetextcontainers) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                populateRateData(ratetextcontainers, JSON.parse(this.responseText));
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    }

    function populateRateData(ratetextcontainers, response) {
        ratetextcontainers.forEach(function(ratetextcontainer, index) {
            if (ratetextcontainer.hasAttribute('data-offerid')) {
                var responseObj = response[index];
                var cardOfferId = ratetextcontainer.getAttribute('data-offerid');
                if (responseObj.map.requestData != undefined) {
                    var responseOfferId = responseObj.map.requestData.map.OfferID;
                    if (cardOfferId == responseOfferId && responseObj.map.responseData.map['Offers'] != undefined) {
                        var responseData = responseObj.map.responseData.map.Offers.myArrayList[0].map.productDetailData.map;
                        var apikeys = usbUtils.nodeListArray(ratetextcontainer.querySelectorAll('.apiKey'));
                        if (referenceFoundForAll(apikeys)) {
                            apikeys.forEach(function(apiKey) {
                                var spanText = apiKey.textContent;
                                var classKey = apiKey.getAttribute('class');
                                var noLinkFlag = classKey.search('noRates');
                                var minAPRFlag = classKey.search('calculatedMinAPR');
                                var maxAPRFlag = classKey.search('calculatedMaxAPR');
                                var annualFeeAmountFlag = classKey.search('annualFeeAmount');
                                var introCashAdvanceMaxRateFlag = classKey.search('introCashAdvanceMaxRate');
                                var lastWord = classKey.split("-").pop();
                                var apiKeyNode = noLinkFlag > 0 ? apiKey : apiKey.parentNode;
                                var apiValue, responseApiVal;
                                var minAPRValue = "",
                                    maxAPRValue = "";
                                if (minAPRFlag > 0 || maxAPRFlag > 0) {
                                    minAPRValue = minAPRFlag > 0 ? parseFloat(responseData["calculatedMinAPR"]) : '';
                                    maxAPRValue = maxAPRFlag > 0 ? parseFloat(responseData["calculatedMaxAPR"]) : '';
                                    if ((minAPRValue.toString()).length > 0 && (maxAPRValue.toString()).length > 0) {
                                        if(minAPRValue === maxAPRValue){
                                            responseApiVal = maxAPRValue + "%";
                                        } else {
                                            responseApiVal = minAPRValue + "%" + " - " + maxAPRValue + "%";
                                            apiKeyNode.setAttribute("aria-label", minAPRValue + "%" + " to " + maxAPRValue + "%");
                                        }
                                    } else { //if only one flag exist
                                        responseApiVal = parseFloat(responseData[lastWord]) + "%";;
                                    }
                                    apiValue = responseApiVal;
                                }
                                else if(introCashAdvanceMaxRateFlag > 0) {
                                    responseApiVal =  parseFloat(responseData.productVariableData.myArrayList[0].map[lastWord]) + "%";
                                    apiValue = responseApiVal;
                                } else {
                                    responseApiVal = annualFeeAmountFlag > 0 ? responseData.productVariableData.myArrayList[0].map.riskTierInformation.myArrayList[0].map.annualFeeInformation.map[lastWord] :
                                        responseData.productVariableData.myArrayList[0].map[lastWord];
                                    apiValue = spanText.indexOf("$") >= 0 ? spanText + parseInt(responseApiVal) : parseInt(responseApiVal) + spanText;
                                }
                                apiKeyNode.textContent = apiValue;
                                if(apiKeyNode.classList.contains("apiKey")) apiKeyNode.removeAttribute("class");
                            });
                        }
                    }
                }
            }
        });
    }

    rates = {
        fetchRates: function() {
            var ratetextcontainers = usbUtils.nodeListArray(document.querySelectorAll('.disclosure .dynamic-rates, .disclosureItem [data-offerid]'));
            var disclosureswithrates = ratetextcontainers.length;
            if (referenceFoundForAll(ratetextcontainers)) {
                var reqData = "";
                var count = 0;
                var requestcount = 0;
                var containers = [];
                var num = Math.floor(disclosureswithrates / 5);
                ratetextcontainers.forEach(function(ratetextcontainer, index) {
                    if (ratetextcontainer.hasAttribute('data-offerid')) {
                        var reqStr =
                            ratetextcontainer.getAttribute('data-requestcode') + "_" +
                            ratetextcontainer.getAttribute('data-requestsourcecode') + "_" +
                            ratetextcontainer.getAttribute('data-locationnumber') + "_" +
                            ratetextcontainer.getAttribute('data-offerid') + ".";
                        reqStr = reqStr.replace(/undefined_undefined_undefined./gi, "");
                        reqData = reqData + reqStr;
                        containers.push(ratetextcontainer);
                        count++;

                    }
                    //making a new request for every 5 elements as dispatcher blocks lengthy requests
                    if (reqData && (count == 5 || ((requestcount == num) && (index == (ratetextcontainers.length - 1))))) {
                        var datetime = new Date().valueOf();
                        var requestURL = "/svt/usbank/rateapi.param-" + reqData + datetime + "USB.json";
                        getResponse(requestURL, containers);
                        requestcount++;
                        count = 0;
                        reqData = "";
                        containers = [];
                    }
                });
            }
        }
    }
})();

var zafinEmmRates = zafinEmmRates || {};
(function fetchZafinEmmRatesDisclosure() {
  'use strict';

  var apiRateTierPair = {
    "emmZafin_Range10000": "$0 - $9,999.99",
    "emmZafin_Range10000-24999": "$10,000 - $24,999.99",
    "emmZafin_Range25000-49999": "$25,000 - $49,999.99",
    "emmZafin_Range50000-99999": "$50,000 - $99,999.99",
    "emmZafin_Range100000-499999": "$100,000 - $499,999.99",
    "emmZafin_Range1500000-9999999999": "$500,000 and above",
  };

  function referenceFoundFor(targetElement) {
    return Boolean(targetElement !== null && typeof targetElement !== 'undefined');
  }

  function referenceFoundForAll(targetElements) {
    return Boolean(targetElements.length > 0 && referenceFoundFor(targetElements));
  }

  function fetchEmmDisclosure(zafinDisclosureContainer, zipcode, productKey) {
    var tstoken = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem("apply_jwt");

    fetchZafinEMMRates(zipcode, productKey, tstoken).then(function (json) {
      var disclosureKeysArr = [];
      if (json.rateGrids) {
        $.each(json.rateGrids, function (i, rateGrid) {
          var productRegExp = new RegExp(/^(DDA86)/gi);
          if ((rateGrid.rates) && productRegExp.test(rateGrid.productKey)) {
            $.each(rateGrid.rates, function (j, rate) {
              if (rate.disclosureKey && (disclosureKeysArr.indexOf(rate.disclosureKey) === -1)) {
                disclosureKeysArr.push(rate.disclosureKey);
              }
            })
          }
        });
      }
      if (json.disclosures && json.disclosures.productSpecificDisclosures) {
        var disclosure = json.disclosures.productSpecificDisclosures
        if (disclosure && disclosureKeysArr.length) {
          populateEmmDisclosure(zafinDisclosureContainer, disclosure, disclosureKeysArr);
        }
      }
    })
  }

  function fetchEmmRates(ratetextcontainersApy, ratetextcontainersApr, zipcode, productKey) {
    var tstoken = usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem("apply_jwt");
    fetchZafinEMMRates(zipcode, productKey, tstoken).then(function (json) {
      if (json.rateGrids) {
        $.each(json.rateGrids, function (i, rateGrid) {
          var productRegExp = new RegExp(/^(DDA86)/gi);
          if ((rateGrid.rates) && productRegExp.test(rateGrid.productKey)) {
            $.each(rateGrid.rates, function (j, rate) {
              var standardApr = rate.apr ? Number.parseFloat(rate.apr).toFixed(2) : 'X.XX';
              var standardApy = rate.apy ? Number.parseFloat(rate.apy).toFixed(2) : 'X.XX';
              var tier = rate.tierDescription ? rate.tierDescription : null;
              ratetextcontainersApy.forEach(function (ratetextcontainer, index) {
                var rateTierClass = ratetextcontainer.nextSibling ? ratetextcontainer.nextSibling.className : null;
                if (apiRateTierPair[rateTierClass] == tier) {
                  ratetextcontainer.textContent = standardApy + '%';
                }
              });
              ratetextcontainersApr.forEach(function (ratetextcontainer, index) {
                var rateTierClass = ratetextcontainer.nextSibling ? ratetextcontainer.nextSibling.className : null;
                if (apiRateTierPair[rateTierClass] == tier) {
                  ratetextcontainer.textContent = standardApr + '%';
                }
              });
            })
          }
        });
      }

    })
  }

  function populateEmmDisclosure(zafinDisclosureContainer, productSpecificDisclosures, disclosureKeysArr) {
    $.each(productSpecificDisclosures, function (i, disclosure) {
      if (disclosureKeysArr.includes(disclosure.key)) {
        var disclosureContent = disclosure.richText;
        var disclosureBody = (disclosureContent.includes("<body>")) ? disclosureContent.substring(disclosureContent.indexOf("<body>") + 6, disclosureContent.indexOf("</body>")) : disclosureContent;
        zafinDisclosureContainer.forEach(function (container, index) {
          container.textContent = '';
          container.insertAdjacentHTML( 'beforeend', '<div>' + disclosureBody + '</div>' );
        });
      }
    });
  }

  document.addEventListener("inpagezipfound", function (e) {
    zipcode = e.detail;
    if (zipcode) {
      zafinEmmRates.fetchRates(zipcode);
    }
  });

  zafinEmmRates = {
    fetchRates: function (zip) {
      var zafinDisclosureContainer = usbUtils.nodeListArray(document.querySelectorAll('.disclosure .emmZafin_Disclosure'));
      if (referenceFoundForAll(zafinDisclosureContainer)) {
        var productKey = 'DDA86';
        var zipcode = zip ? zip : usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem('zipcode');
        if (zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5)) {
          fetchEmmDisclosure(zafinDisclosureContainer, zipcode, productKey);
        }
      }

      var ratetextcontainersApy = usbUtils.nodeListArray(document.querySelectorAll('.disclosure .emmZafin_Apy'));
      var ratetextcontainersApr = usbUtils.nodeListArray(document.querySelectorAll('.disclosure .emmZafin_Apr'));
      if (referenceFoundForAll(ratetextcontainersApy) || referenceFoundForAll(ratetextcontainersApr)) {
        var productKey = 'DDA86';
        var zipcode = zip ? zip : usbUtils && typeof usbUtils.getCookieItem === 'function' && usbUtils.getCookieItem('zipcode');
        if (zipcode && (zipcode != undefined) && (!isNaN(parseInt(zipcode))) && (zipcode.length == 5)) {
          fetchEmmRates(ratetextcontainersApy, ratetextcontainersApr, zipcode, productKey);
        }
      }

    }
  }
})();

var usbnavigator = usbnavigator || {};
/**
 * usbnavigator:
 * 
 * This implementation has 2 different schemes for:
    a)	Desktop: a click thru horizontal menubar that supports tabbing and arrow key inputs for navigation, it has 3 levels with a) primary as alway visible menubar b) secondary which has direct links or provides buttons for the optional tertiary level for link groupings
    b)	Mobile: a touch based navigation that runs at the top level of the view when open where in normal mode swiping for scroll, tap for navigating to links and secondary and tertiary levels is supported. In screen reader modes, swipe and double taps are used to advance and select.
•	The usbNavigator also provides a search form with autocomplete for customer query based navigation… This form will redirect the customer to search results view when they select an area of interest…

  activateNode: sets active states on layers on menubar that can be seen
  currentNodes: uses curent activelayer to provide the selectable nodes of that layer
  windowkeys: determines if event is within navigator and provides keyboard navigation
    when not inside navigator resets are checked for and event is not trapped
    when inside navigator keystrokes are trapped to provide stepwise navigation 
 * 
    general functonal description: GlobalNavigation uses the className='active' to determine visibility
      -> usbUtils.selectNodes method is used to determine current nodes in the visual state
      mobile pattern: 
       . follows floating tabindex=0 where only the active node has this atribute / value
       . only the active level is in view 
      desktop pattern: 
       . uses display: none of hidden elements to drive what SR reads
       . primary secondary and tertiary elements may be visible in desktop mode 

  navigational methods
    next: sets state and focus for the next element in currentNodes
    previous: sets state and focus for the perviout element in currentNodes
    buttonSelect: steps state / focus into the next level and follow rules for mobile v. desktop current element that is set
    backstep: steps state / focus into the prevous level down from the currentNodes and put focus on the parent element of the active level


 */
(function(){
  'use strict';
  //expose api for usbnavigator
  usbnavigator = function() {

    return {
      mobile_nodes: function(){return mobile_items_opened;},
      keycodes: function(){return keycodes;},
      activeLevel: activeLayer,
      clearVale: clearVale,
      clearButtons: clearButtons,
      isopen: isopen,
      level: level,
      currentItem: current,
      first: firstItem,
      last: lastItem,
      selectFirst: selectFirst,
      selectLast: selectLast,
      next: selectNext,
      previous: selectPrevious,
      backstep: selectBackstep,
      nodes: currentNodes,
      snapshot: snapshot,
      resize: resizeActions
    }

  }();


  // ____________________________ Variables

  var b            = 0;//button iteractor var
  var gap          = 32; // grid gap
  var total_levels = 3;
  var skiptocontent= document.querySelector('.skiptocontent-box');
  var topbar       = document.querySelector('.globalNavigation .top-bar');
  var notify       = document.querySelector('.navigation-messages');
  var desktop      = document.querySelector('.top-bar .desktop, .navigation .desktop');
  var navigation   = document.querySelector('.navigation');
  var navigations  = usbUtils.selectNodes('.navigation');
  var vale         = document.querySelector('.globalNavigation .menu-vale');
  var top_vale     = document.querySelector('.globalNavigation .menu-vale');
  var vales        = usbUtils.selectNodes('.menu-vale, .menu-vale-search');
  var vale_search  = document.querySelector('.globalNavigation .menu-vale-search');
  var component    = document.querySelector('.globalNavigation');
  if(component) var top = component.querySelector('.global-nav');
  var menu_buttons = usbUtils.selectNodes('.navigation button.menu-link');
  var menu_links   = usbUtils.selectNodes('.navigation a');
  var mobilesearch = usbUtils.selectNodes('.navigation .mobile .menu-search-input');
  var menu_items   = usbUtils.selectNodes('.menu-item');
  var backbuttons  = usbUtils.selectNodes('.navigation .menu-return');
  var menuends     = usbUtils.selectNodes('.menu-redirect');
  var lists        = usbUtils.selectNodes('.navigation .menu-list');
  var toggles      = usbUtils.selectNodes('.menu-button');
  var hamburger    = document.getElementById('navigation-menu-button');
  var currenttoggle= hamburger;
  var mobilelogin  = document.querySelector('.global-nav .mobile .loginButton');
  var mobilelogo   = document.querySelector('.global-nav .mobile a.homepage.logo'); 
  var loginbuttons = usbUtils.selectNodes('.global-nav .login-toggle');

  var mobile_items_opened = usbUtils.selectNodes('.navigation button,.navigation a,.navigation input[type=text],.navigation menu-title h3,.top-bar a,.top-bar button:not(.menu-button),.skipToContent,.fiqlink');
  var mobile_items_closed = usbUtils.selectNodes('.top-bar a,.top-bar button,.fiqlink');

  // var login_dropdown  = document.querySelector('.global-nav .top-bar .login-dropdown');

  var currentlist  = document.querySelector('.global-nav .menu-list');

  var topsofdom    = usbUtils.nodeListArray(usbUtils.selectNodes('.root.responsivegrid >.aem-Grid')[0].children);

  //top of dom is devided into navs and body for toggling what ish
  var topofdom     = function() {
    var _tod = {navs:[],body:[]};
    topsofdom.map(function(el){
      var _anav = el.querySelector('nav[role="menubar"]');
      if(_anav && _anav.nodeName=='NAV') _tod.navs.push(el);
      else(_tod.body.push(el));
    })
    return _tod;
  };

  var toplinks     = usbUtils.selectVisibleNodes('.top-bar a,.top-bar button');

  var desktop_top     = usbUtils.selectVisibleNodes('.navigation .menu-primary >li >button,.navigation >.menu-primary >li >a');
  var desktop_top_all = usbUtils.selectVisibleNodes('.menu-item.primary >.menu-link');

  var toplevel_primary   = document.querySelector('.global-nav.primary .navigation >.menu-list');
  var toplevel_secondary = document.querySelector('.global-nav.secondary .navigation >.menu-list');

  var dims = Object.freeze({
    LISTPAD: 24,
    TOP_DESKTOP: 40,
    TOP_MOBILE: 56,
  });

  var keycodes = Object.freeze({
    'TAB': 9,
    'BACKSPACE': 8,
    'DELETE': 46,
    'RETURN': 13,
    'ESC': 27,
    'SPACE': 32,
    'PAGEUP': 33,
    'PAGEDOWN': 34,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'COMMAND': 91,
    'CONTROL': 17,
    'RIGHT': 39,
    'DOWN': 40
  });

  var levelcodes = Object.freeze({
    'PRIMARY': 1,
    'SECONDARY': 2,
    'TERTIARY': 3,
  });

  var next_level    = levelcodes.PRIMARY;

  // ubnavigator definition of mobile is set by size
  function ismobileSize() { return /(md|sm)/.test(usbUtils.windowSize()); };

  function mobile_top_primary() { return usbUtils.selectVisibleNodes('.globalNavigation .menu-button,.global-nav.primary .menu-primary >li >button,.global-nav.primary .menu-primary >li >a,.global-nav.primary .menu-item .input-field >input, .global-nav.primary .menu-item .input-field button'); }

  function isopen () {
    var activity = usbUtils.selectNodes('.active >.menu-list',navigation);
    if(navigation)return navigation.classList.contains('open') || activity.length >0;
  };

  var current_element = (ismobileSize() && usbUtils.visibleNodes(mobile_top_primary())[2]) || usbUtils.visibleNodes(desktop_top)[0];

  // ____________________________ listeners: initialize
  usbUtils.listenTo(window,'keydown', windowkeys);
  usbUtils.listenTo(window,'click', windowkeys);
  usbUtils.listenTo(window,'load', resizeActions);  
  usbUtils.listenTo(window,'resize', resizeActions);

  if(mobilelogo)
    usbUtils.listenTo(mobilelogo,'focus', redirect);

  if(mobilelogin)
    usbUtils.listenTo(mobilelogin,'focus', redirect);

  if(menu_links.length) {
    menu_links.forEach( function(_l){
      usbUtils.listenTo(_l,'click', linkAction);
    });
  }
  //trap the input field select where outside scripts seem to be glomming on to the bubbled events
  if(mobilesearch.length) {
    mobilesearch.forEach( function(_i){
      usbUtils.listenTo(_i,'click', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
      });
      usbUtils.listenTo(_i,'keydown', function(e) {
        var noResults = e.target.parentElement.querySelector('.search-autocomplete-list:empty');   
        if (ismobileSize() && noResults) {
          switch(e.keyCode) {
            case keycodes.DOWN: next(e); break;
            case keycodes.UP: previous(e); break;
            case keycodes.TAB:
              e.preventDefault();
              e.stopImmediatePropagation();
              e.shiftKey ? previous(e) : next(e); break;
            default: break;
          }
        }
      });
      if (_i.previousElementSibling.nodeName.toLowerCase() === 'button') {
        usbUtils.listenTo(_i.previousElementSibling,'keydown', function(e) {
          if (ismobileSize() && e.target.isSameNode(document.activeElement)) {
            switch(e.keyCode) {
              case keycodes.DOWN: next(e); break;
              case keycodes.UP: hamburger.focus(); break;
              case keycodes.TAB: 
                e.preventDefault();
                e.stopImmediatePropagation();
                e.shiftKey ? hamburger.focus() : next(e); break;
              default: break;
            }
          }
        });
      }
      if (_i.nextElementSibling.nodeName.toLowerCase() === 'button') {
        usbUtils.listenTo(_i.nextElementSibling,'keydown', function(e) {
          if (ismobileSize() && e.target.isSameNode(document.activeElement)) {
            switch(e.keyCode) {
              case keycodes.DOWN: next(e); break;
              case keycodes.UP: prev(e); break;
              case keycodes.TAB: 
                e.preventDefault();
                e.stopImmediatePropagation();
                e.shiftKey ? _i.focus()  : next(e); break;
              default: break;
            }
          }
        });
      }
    });
  }

  if(vales.length) {
    vales.forEach( function(_v){
      usbUtils.listenTo(_v,'click', clearNav);
    });
  }

  if(toggles.length) {
    for(b in toggles) {
      usbUtils.listenTo(toggles[b],'click', menutoggle);
    }
  }

  if (hamburger) {
    usbUtils.listenTo(hamburger, 'keydown', menukeys);
  }

  if(menu_buttons) {
    for(b in menu_buttons) {
      buttonActions(menu_buttons[b]);
    }
  }

  if(backbuttons) {
    for(b in backbuttons) {
      usbUtils.listenTo(backbuttons[b],'click', backstep);
    }
  }

  if(loginbuttons) {
    loginbuttons.forEach(function(lb){
      lb.removeAttribute('href');
      usbUtils.listenTo(lb,'click', logintoggle);
      usbUtils.listenTo(lb,'keydown', logintoggle);
    });
  }

  /**
   * A listener action to setup listeners
   * @param {*} el: HTMLElement
   */
  function buttonActions (el) {
    usbUtils.listenTo(el,'click', buttonSelect);
    menuends.forEach( function(_el){
      usbUtils.listenTo(_el,'focus', redirect);
    });
  }

  markCurrentPath();

  resizeActions();

  //@NOTE Interim fix for the bodyContent being located in the wrong place
  // this should be removed once that part of the templates is fixed...
  var tod = topofdom();
  if (tod.body) {
    var contentBody = document.getElementById('bodyContent');
    var responsiveGrid = document.getElementsByClassName('responsivegrid')[document.getElementsByClassName('responsivegrid').length === 3 ? 2 : 1]; 
    var bodyContent = tod.body.length >= 2 ? responsiveGrid : tod.body[0];
  
    if(contentBody) {
      contentBody.removeAttribute('id');
      bodyContent.setAttribute('id','bodyContent');
	}
	  bodyContent.setAttribute('role','main');
    bodyContent.setAttribute('tabindex','-1');
  }
  // ____________________________ functions

  /**
   *
   * @param {*} e
   * @returns
   */
  function eventAction(e) {
    var el = e.target;
    var type = el.nodeName;
    if(type=='BUTTON'){
      if (el.classList.contains('menu-return')) return backstep;
      else return buttonSelect;
    }
    return linkAction;

  }

  /**
   * Trap keystrokes if the target is within the menu
   * ...do not trap keys / events outside of navigation
   *
   * @param {*} e: MouseEvent
   */
  function windowkeys(e) {

    var ii     = usbUtils.selectNodes('.input-field').filter(function(el) { return el.contains(e.target)});
    var an     = navigations.filter( function(el){ return el.contains(e.target);});
    var in_nav = an && an.length>0 && ii.length==0;

    if(e.type=='click') return;
    // logic for closing login modal when esc is pressed
    if(e.keyCode == keycodes.ESC) {
      if (ismobileSize()) {
        closeMobile();
      } else {
        closeLogin();
      }
    }
    if(in_nav) {
      var l = level();
      var trap   = /(9|27|37|38|39|40|47)/;
      var action = eventAction(e);
      var nodes  = currentNodes();
      var el     = current();
      var isactive = el && el.parentElement.classList.contains('active');
      var islast   = el && el == lastItem();
      var isfirst  = el && el == nodes[0];
      var top      = (an && an.querySelector && an.querySelector('.menu-item.primary.active > button')) || firstItem();
      var activebutton = document.querySelector('.menu-item.primary.active > button');
      var snap     = snapshot();
      switch(e.keyCode) {
        case keycodes.ESC:
          // var top = navigation.querySelector('.menu-item.primary.active button');
          if(!ismobileSize()) {
            if ( l.tertiary) {
              backstep(e);
              next_level = 2;
            } else {
              clearNav();
              tab(activebutton);
              next_level = 1;
            }
            // tab(current_element);
          }
          // setVale();
          break;
        case keycodes.SPACE:
          action(e);
          break;
        case keycodes.TAB:
          if (ismobileSize()) {
            if (e.shiftKey) previous(e);
            else next(e);
            //desktop
          } else {
            if(l.primary) {
              return;
            }
            if(l.secondary) {
              //shifted
              if (e.shiftKey) {
                if ( snap.tertiary.hasList ) {
                  levelUp();
                  nodes = currentNodes();
                  tab(nodes[nodes.length-1]);
                } else if (isfirst) {
                  previousPrimary(e,top);
                  clearVale();
                } else {
                  previous(e);
                } 
              // unshifted
              } else if ( snap.tertiary.hasList ) {
                levelUp();
                tab(currentNodes()[0]);
              } else if (islast) {
                nextPrimary(e,top);
              } else {
                next(e);
              }
            }
            if(l.tertiary) {
              if(e.shiftKey) {
                if(isfirst) {
                  if(snap.secondary.isfirst) {
                    previousPrimary(e,top);
                  } else {
                    previousSecondary(e);
                  }
                }else {
                  previous(e);
                }
              } else if(islast) {
                if(snap.secondary.islast){
                  nextPrimary(e,top);
                } else {
                  nextSecondary(e);
                }
              } else {
                next(e);
              }
            }
          }

          break;
        case keycodes.RETURN:
          if( ( !ismobileSize()) && l.secondary) {
            levelUp();
            tab(currentNodes[0]);
          } else {
            return;
          }
          break;
        case keycodes.RIGHT:
          if( !ismobileSize() ) {
            if (l.secondary) {
              if(isactive) {
                levelUp();
                tab(currentNodes[0]);
              } else {
                buttonSelect(e);
              }
            }
            if (l.primary) {
                next(e);
            }
          } else if(ismobileSize()) {
            action(e);
          }
          break;
        case keycodes.DOWN:
          if( !ismobileSize() ){
            if(l.primary) {
                buttonSelect(e);
            } else {
                next(e);
            }
          } else {
            next(e);
          }
          break;
        case keycodes.LEFT:
          if ( !l.primary) {
            backstep(e);
            if( !ismobileSize() && l.secondary) {
              clearVale();
            }
          } 
          else previous(e);
          break;
        case keycodes.UP:
          if (!ismobileSize() && l.primary) {
            buttonSelect(e);
          } else {
            previous(e);
          }
          break;
        case keycodes.HOME:
          selectFirst();
          break;
        case keycodes.END:
          selectLast();
          break;
        default:
          var char  = String.fromCharCode(e.keyCode);
          var key   = null;
          var nodes = currentNodes();
          //map and filter alpha keydown characters
          if(/[a-z]/i.test(char) ) {
            var match = nodes.map( function(el){
                return {[el.textContent.trim()]: el}; }
            ).filter( function (obj) {
                key = Object.keys(obj)[0];
                var wordex = new RegExp('(^'+char+')', 'i');
                return wordex.test(key);
            });

            //
            if( match.length ){
              key = Object.keys(match[0])[0];
              selectButton(match[0][key]);
            }
          }
          if ( /[0-9]/.test(parseInt(char) ) ) {
            var num = parseInt(char)
            if( nodes[num-1] )
              selectButton(nodes[num-1]);
          }



      }
      if (trap.test(e.keyCode) ) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }

    } else {
      if (isopen() && ! ismobileSize())
        clearNav();
    }
  }
  /** shorcut steps for tabbing  */

  /**
   * provides aggregate method calls to handle complex tabbing functionality  
   * @param {*} e 
   * @param {*} top 
   */
  function nextPrimary(e, top) {

    var snap = snapshot();
    clearVale();
    next_level = 1;
    clearButtons();
    tab(top);
    setVale();
    if ( !snap.primary.islast || !snap.secondary.islast || !snap.tertiary.islast ) {
      next(current());
    }

  }

  /**
   * provides aggregate method calls to handle complex tabbing functionality  
   * @param {*} e 
   * @param {*} top 
   */
  function previousPrimary(e, top) {

    clearVale();
    next_level = 1;
    clearButtons();
    tab(top);

  }

  /**
   * provides aggregate method calls to handle complex tabbing functionality  
   * @param {*} e 
   */
  function nextSecondary(e) {

    backstep(e);
    next(current);
    boundaries();

  }
 
  function previousSecondary(e) {
   /**
   * provides aggregate method calls to handle complex tabbing functionality  
   * 
   */

    backstep(e);
    previous(current());
    boundaries();

  }


  function levelUp () {
    if(ismobileSize()) next_level = level().level;
    else {
      next_level = next_level+1 < total_levels+1 && next_level+1 || level().level;
    }
  }

  function levelDown() {
    if(ismobileSize()) next_level = level().level;
    else {
      next_level = next_level-- > 0 && next_level-- || level().level;
    }
  }

  /**
   * Provide indicators for menu-items that are within the current location
   *  adds className .menu-current-path and [data-current-menu] (for existing Elan styling)
   */
  function markCurrentPath () {
    var depth = 3;

    // seed is hash to match with
    var seed = location.pathname.split('/').slice(-depth).join('_'); 

    // current list of matching links to current location
    var cl = usbUtils.selectNodes('.navigation .menu-item a').filter( function(_link){
      //target is hash of link within navigation tree
      var target = _link.href.split('/').slice(-depth).join('_');
      return target == seed;
    });

    //for each match link we set current path attributes for menu items that contain the links
    usbUtils.selectNodes('.navigation .menu-item').forEach( function(mi){
      // for each current link that matches the current location
      for ( var c in cl ) {
        if( mi.contains(cl[c])) {
          // for most target verticals
          mi.classList.add('menu-current-path');
          //for Elan's styling...
          mi.setAttribute('data-current-menu', true);
        } 
      }
    });
  }

  /**
   * A utilitiy method for determining sections that are active
   * @returns Object: {level: number, primary: boolean, secondary: boolean, tertiary: boolean, priamrynav: boolean, secondarynav: boolean }
   */
  function level(){
    var active_layers = usbUtils.selectNodes('.menu-primary',component).concat(usbUtils.selectNodes(' .menu-item.active >.menu-list',component));
    var parent        = current().closest('.menu-list') || component.querySelector('.menu-primary');

    // DOM based detection from current active node
    var primary   = parent && parent.classList.contains('menu-primary');
    var secondary = parent && parent.classList.contains('menu-secondary');
    var tertiary  = parent && parent.classList.contains('menu-tertiary');
    var navbar    = component.classList.contains('secondary-nav') ? 'secondary' : 'primary'


    //code if bump level+=1 || detected
    // var clevel = (primary && levelcodes.PRIMARY) || (secondary && levelcodes.SECONDARY) || (tertiary && levelcodes.TERTIARY);

    return {
      level: active_layers.length,
      primary: primary,
      secondary: secondary,
      tertiary: tertiary,
      primarynav: navbar == 'primary',
      secondarynav: navbar == 'secondary',
    };
  }

  /**
   * Snapshot of current navigator state 
   * @returns Object foreach key[primary,secondary,teriary] => {current: HTMLElement,isfirst:boolean,issecond:bolean}
   */
  function snapshot () {
    var primary_list    = usbUtils.selectVisibleNodes('.menu-item.primary >.menu-link');
    var secondary_list  = usbUtils.selectVisibleNodes('.menu-item.primary.active .menu-list >.menu-item.secondary >.menu-link'); 
    var tertiary_list   = usbUtils.selectVisibleNodes('.menu-item.secondary.active .menu-list >.menu-item.tertiary >.menu-link'); 

    var active_primary   = document.querySelector('.menu-item.primary.active >.menu-link');
    var active_secondary = document.querySelector('.menu-item.primary.active .menu-list .menu-item.active >.menu-link');
    // var active_secondary = secondary_list.indexOf(document.activeElement)>-1 && document.activeElement;
    var active_tertiary  = tertiary_list.indexOf(document.activeElement)>-1 && document.activeElement;

    var primary_dex = primary_list.indexOf(active_primary);
    var secondary_dex = secondary_list.indexOf(active_secondary);
    var tertiary_dex = tertiary_list.indexOf(active_tertiary);

    return {
      primary:  {hasList: primary_list && primary_list.length>0, isnode:typeof active_primary!='boolean' && typeof active_primary=='object', current:active_primary,    isfirst: primary_dex==0,  islast:primary_dex==(primary_list.length-1)},
      secondary:{hasList: secondary_list && secondary_list.length>0, isnode:typeof active_secondary!='boolean' && typeof active_secondary=='object', current:active_secondary,isfirst: secondary_dex==0,islast:secondary_dex==(secondary_list.length-1)},
      tertiary: {hasList: tertiary_dex && tertiary_list.length>0, isnode:typeof active_tertiary!='boolean' && typeof active_tertiary=='object', current:active_tertiary,  isfirst: tertiary_dex==0, islast:tertiary_dex==(tertiary_list.length-1)},
    }
  }



  /**
   * In css the x & y attributes are deemed not valid and get filtered out
   *  :. we need to provide manual switching of these values as part of the toggle
   * @param {*} open
   */
  function setMenuButton(open) {
    var line1 = document.querySelector('svg .line-1');
    var line2 = document.querySelector('svg .line-2');
    var line3 = document.querySelector('svg .line-3');
    if (open) {
      line1.setAttribute('x', 1);
      line1.setAttribute('y', -1);
      line3.setAttribute('x', -21);
      line3.setAttribute('y', 21);

      line1.style.transform = 'rotate(45deg)';
      line2.style.transform = 'translateY(-3rem)';
      line3.style.transform = 'rotate(-45deg)';
    } else {
      line1.setAttribute('x', 1);
      line1.setAttribute('y', 4);
      line3.setAttribute('x', 1);
      line3.setAttribute('y', 25);

      line1.style.transform = 'rotate(0deg)';
      line2.style.transform = 'translateY(0)';
      line3.style.transform = 'rotate(0deg)';
    }
  }


  /**
   * Redirects focus when the menu boundary button gets focus
   * .. this works for iOS but not android
   *
   * @param {*} e: MouseEvent
   */
  function redirect(e) {
    var position = e.target.dataset.position;
    var _level = level();
    var el = _level.primary==true && _level.primarynav==true ? currentNodes()[2] : currentNodes[0];
    if( !ismobileSize()) return;
    switch (position) {
      case 'logo':
      case 'toggle':
      case 'end':
        tab(el);
        break;
      // case 'login':
      case 'search':
        el = component.querySelector('input[type=text]');
        tab(el);
        currentlist.scrollTo(0,0);
        break;
      case 'start':
        el = component.querySelector('.menu-button');
        tab(el);
        currentlist.scrollTo(0,0);
        break;
      default:
        if(/getstarted/gi.test(e.target.href)) return;
        tab(el);
    }
    setTimeout(function() {
      if(el) tab(el);
    }, 500);
  }

  /**
   * resets vale top for when things move
   */
  function setVale () {
    // clearVale();
    // var _current = current();
    // var component = _current && _current.closest('.component-top');
    var active = document.querySelector('.active >.menu-secondary');

    if (component) {
      
      var searching = component.querySelector('.active-search');
      // var vale = component.parentElement.querySelector('.menu-vale');

      if (ismobileSize()) {
        vale.style.display  = 'block';
        vale.style.height   = null;
        vale.style.opacity  = 1;
        vale.style.position = 'absolute';  
        vale.style.top      = 0;

        if ( searching ) {
          vale_search.style.display='block';          
          vale_search.style.visibility='hidden';
          setTimeout(function() {
            vale_search.style.visibility='visible'
          },300);
        }
      } else if (isopen() && active) {
        var compotop        = component.getBoundingClientRect().top;
        var activetop       = active.getBoundingClientRect().top;
        vale.classList.add('open');

        if (vale.style.opacity==0) {
          vale.style.display='block';          
          vale.style.opacity = 0;
          setTimeout(function(){
            vale.style.opacity=1
          },400);
        }

        vale.style.height = document.body.scrollHeight - activetop + 'px';        
        vale.style.top = (activetop-compotop).toString().concat('px');

      } 

    } else {
      clearVale();
    }
  }

  /**
   * clear any all vales that may be active
   */
  function clearVale() {

    var nullify = function(_v){ _v.removeAttribute('style'); };
    
    for(var _v in vales) {
      var _vale = vales[_v];
      _vale.classList.remove('open');
      _vale.style.opacity = 0;
      setTimeout(function(){nullify(_vale);},300);
    }
  }


  /**
   * Set the Open Submenu Heights: desktop
   */
  function setOpenHeights () {
    if( !ismobileSize()) {

      //for desktop submenus have matching height
      var openlists = usbUtils.selectNodes('.navigation .active >.menu-list');
      //reset heights
      openlists.forEach(function(el) { el.style.height = null;});

      //set new heights
      var max = usbUtils.maxInArray(openlists.map(function(el){return el.offsetHeight;}));
      if (openlists.length>1) {
        var th  = openlists[0].offsetHeight < openlists[1].offsetHeight
          ? max+dims.LISTPAD : max;

        for (var ol in openlists) {
          openlists[ol].style.height = (th).toString().concat('px');
        }

      }
    }
  }

  /**
   * Sets / resets active state on menu-items 
   * entry points 
   *  windowkeys keyboard entry |or| click on button
   *
   * @param {*} e: MouseEvent
   * @returns HTMLElement : selected button or levelUp button gets returned
   */
  function buttonSelect(e) {

    if(e && e.preventDefault) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    //normalize event to button selected
    var button = e.target.nodeName =='BUTTON' ? e.target : e.target.closest('button');

    var isOpen = topbar.classList.contains('login-open');
      if(isOpen)
      closeLogin();

    //if desktop => set the current component, navigation, ... etc 
    if ( button && !ismobileSize()) setGlobals(button);

    // if click on button set that as current button
    if (e.type=='click') {
      var ci = usbUtils.nodeListArray(button.closest('.menu-item').classList)
        .filter( function(_c)  {  return /(primary|secondary|tertiary)/.test(_c);})
        .map( _m => { return ['','primary','secondary','tertiary'].indexOf(_m);});

        next_level = typeof ci != 'string' && ci.length>0 && ci[0] || 1; 
        tab(button);
    }

    //active state in DOM determines
    if (button) {
      var parent = current_element.closest('.menu-item') ? current_element.closest('.menu-item') : current_element;

      //deselects an active parent element => show | hide its list
      if (parent.classList.contains('active')) {
        parent.classList.remove('active');
        button.ariaExpanded = false;
        if(level().primary) clearVale();
      } else { //or activates it to show its list 
        activateNode(button);
      }
    }

    //primary node results in selection of 1st el of secondary list 
    if(ismobileSize() || level().primary) {
      levelUp();
      button = currentNodes()[0];
    }

    current_element = button;
    boundaries();
    
    if (!ismobileSize())
      setVale();  

    setScroll();

    if (button) {
      tab(button);
      return button;      
    }

  }

  /**
   * Steps back to the parent menu-item in the **active** path
   * @param {*} e: MouseEvent
   */
  function backstep (e) {
    if(e && e.preventDefault) {
      e.preventDefault();
      e.stopImmediatePropagation();
    } 
    var list   = e.target.closest('.menu-list');
    var active = list.closest('.active');
    var top    = navigation.querySelector('.menu-item.primary.active button');

    if(active) {
      var button = active.querySelector('button');
      var isexpandable = button.ariaExpanded !== null;
      if(isexpandable) button.ariaExpanded = false;

      active.classList.remove('active');
    }

    levelDown();
    boundaries();
    tab(button||top);
    setScroll();

    //realign next_level with level() results
    // next_level = level().level;

  }

  /**
   * Toggles mobile menu open and close
   * called from the mobile menu button
   * @param {*} e: Event 
   */
  function menutoggle(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    var isOpen = top.classList.contains('open');
    if ( isOpen  ){
      closeMobile();
    } else {
      if (topbar.classList.contains('login-open')) {
        closeLogin();
        setTimeout(function() {openMobile(e.target);},500);
      } else {
        openMobile(e.target);
      }
    }
  }

  function menukeys(e) {
    if (!e || !e.keyCode) return;
    var children = usbUtils.visibleNodes(usbnavigator.activeLevel().children);
    var isOpen = top.classList.contains('open');
    if (children && isOpen) {
      var first = children[0];
      var last = children[children.length - 1];
      switch(e.keyCode) {
        case keycodes.UP:
          last.querySelector('a, button, input').focus();
          break;
        case keycodes.DOWN:
          first.querySelector('a, button, input').focus();
          break;
        case keycodes.TAB:
          e.preventDefault();
          if (e.shiftKey) {
            last.querySelector('a, button, input').focus()
          } else {
            first.querySelector('a, button, input').focus();
          }
      }
    }
  }

  /**
   * Toggles the login-dropdown 
   * @param {*} e: Event 
   */
  function logintoggle(e) {
    if(e.type=='keydown' && !/(32|13)/.test(e.keyCode)) return false;
    e.preventDefault();
    var button = e.target.closest('button, a');
    var isOpen = topbar.classList.contains('login-open');
    clearNav();
    if ( isOpen  ){
      document.querySelector('.global-nav .login-toggle').removeAttribute('aria-hidden');
      document.querySelector('.global-nav .login-toggle').ariaExpanded = false;
      document.querySelector('.login-buttons span.closeLogin').classList.add("hide");
      if(document.querySelector('.login-buttons span.lang-badge')){
          document.querySelector('.login-buttons span.lang-badge').style.display='inline-flex';
      }
      closeLogin();
    } else {
     // document.querySelector('.global-nav .login-toggle').ariaHidden = true;
      document.querySelector('.global-nav .login-toggle').ariaExpanded = true;
      document.querySelector('.login-buttons span.closeLogin').classList.remove("hide");
      if(document.querySelector('.login-buttons span.lang-badge')){
          document.querySelector('.login-buttons span.lang-badge').style.display='none';
      }
      topbar.classList.add('login-open');
      if(button.classList.contains('widgetLoading') && topbar.classList.contains('login-open')){
        button.disabled = true;
        button.setAttribute("aria-label", "login section loading");
      }
      //provide support for mobile and desktop where it can be different
      topbar.classList.remove('widget');
      topbar.classList.remove('iframe');
      if (button.classList.contains('widget')) {topbar.classList.add('widget');}
      if (button.classList.contains('iframe')) {topbar.classList.add('iframe');}

      top_vale.style.top = dims.TOP_DESKTOP.toString().concat('px');
      top_vale.style.display = 'block';
      top_vale.style.zIndex  = 51; 
      top_vale.style.opacity = 1; 
      top_vale.style.height = document.body.scrollHeight + 'px';
      setTimeout(function() { document.querySelector('.global-nav .login-toggle').focus();},2500);
    }

  }

  /**
   * close the login dropdown
   */
  function closeLogin (e) {
    if ( ! /(button|checkbox|select|text|select-one|password)/.test(document.activeElement.type)) {
      if(topbar)topbar.classList.remove('login-open');
        if(top_vale){
            top_vale.style.opacity = 0;
      		top_vale.style.zIndex  = null; 
        }
    }
  }

  /**
   * self explaining
   */
  function closeMobile() {
    document.body.classList.remove('menu-lock');  
    next_level = 1;
    if(top)top.classList.remove('open');

    if(navigation)navigation.classList.remove('open');
      if(vale){
        vale.classList.remove('open');
    	vale.style.display = "none";
      }    
    if(currenttoggle)currenttoggle.ariaExpanded = false;

    blockAccess(mobile_items_opened);
    activeAccess(toggles.concat(mobile_items_closed));

    lists.forEach(function (ul){ ul.removeAttribute('style'); });
    navigations.forEach(function (nav){
      nav.ariaHidden = true;
    });

    //hamburger needs js as x y attributes get filtered out of css
    if(component)if(component.contains(hamburger)) setMenuButton(false);

    clearButtons();

    //clear top of DOM treatment for all selectable buttons from mobile
    topofdom().body.forEach(function(el){ el.removeAttribute('aria-hidden'); });
    toplinks.forEach(function(el){ el.removeAttribute('tabindex'); });

    clearVale();
  }

  /**
   * self explaining
   */
  function openMobile(selected) {
    //globals
    document.body.classList.add('menu-lock');

    currenttoggle = selected.nodeName !='BUTTON' ? selected.closest('button') : selected;
    setGlobals(currenttoggle);

    next_level = 1;
    top.classList.add('open');
    navigation.classList.add('open');
    vale.classList.add('open');
    currenttoggle.ariaExpanded = true;

    topofdom().body.forEach(function(el){ el.contains(navigation) ? el.removeAttribute('aria-hidden') : el.ariaHidden = true; });
    setForMobile();
    if(component.contains(hamburger)) setMenuButton(true);
    setScroll();
    setVale();
    currenttoggle.focus();
  
  }

  /**
   * mobile switch mechanisms in one place 
   * @param {*} button 
   */
  function setForMobile (){
    navigation.removeAttribute('aria-hidden');
    if (!desktop.contains(navigation)); desktop.ariaHidden = true;

    //lock the menu to prevent scrolling at the body level
    activeAccess(currentNodes());
    if(level().primarynav)
      blockAccess(usbUtils.selectNodes('.secondary-nav .fiqlink,.secondary-nav .menu-button'))
    else {
      blockAccess(usbUtils.selectNodes('.global-nav.primary .menu-button'))
    }
    if ( ismobileSize() && usbUtils.isAndroid() ) {
      menuends.forEach(function(btn){
        btn.style.display = 'none';
      });
    } else if ( ismobileSize() ) {
      menuends.forEach(function(btn){
        btn.removeAttribute('style');
      });
    }

  }

  /**
   * desktop switch mechanisms in one place 
   */
  function setForDesktop () {

    if(desktop)desktop.removeAttribute('aria-hidden');

    activeAccess(mobile_items_opened);

    navigations.forEach(function (_nav) {_nav.removeAttribute('aria-hidden'); });
    lists.forEach(function (_nav) { _nav.removeAttribute('aria-hidden'); });
    //desktop floating index pattern collides with native tabbing we take a light touch here for that
    mobile_items_opened.forEach(function(el){
      el.removeAttribute('aria-hidden');
      el.hidden = false;
      el.removeAttribute('tabindex');
      
    });

    //clear top of DOM treatment for all selectable buttons from mobile
    topofdom().body.forEach(function(el){ el.removeAttribute('aria-hidden')});

    //hide the boundary iOS buttons for desktop
    menuends.forEach(function(el){ el.style.display='none'});


  }


  /**
   * In Desktop multiple navigation groups may exist each with its own DOM scope 
   * .. this method reset the needed globals for activity with each of these DOM scopes
   * @param {*} button 
   */
  function setGlobals (button) {
    top        = button.closest('.component-top');
    navigation = top.querySelector('nav.navigation') || navigation;
    vale       = top.querySelector('.menu-vale') || vale;
    component  = top;
  }

  /**
   * desktop: changes alignment of open submenus
   * sets background blocking overlay => .menu-vale
   * if the submenus extend beyond boundaries
   * .menubar acts as the visible boundary
   */
  function boundaries () {

    //set the background vale state
    // setVale();

    if (!ismobileSize()) {


      setOpenHeights();

      //reset left attribute on secondary
      document.querySelectorAll('.menu-secondary').forEach(function(el) { el.style.right= null;});
      //calculate boundaries for offset when menus extend beyond the offset move it to left
      var active_secondary = document.querySelector('.active .menu-secondary');
      //provide the offset that has this active_seconary with the current component :=> this is needed for when top-bar gets hidden
      var offset      = usbUtils.selectNodes('.component-offset',component).filter(el=>{return el.contains(active_secondary); })[0];
      var active      = usbUtils.nodesBoundary('.active >.menu-list');
      var boundright  = offset ? offset.getBoundingClientRect().left + offset.offsetWidth : document.body.offsetWidth;
      var activeright = active.left + active.width;
      var setright    = usbUtils.selectNodes('.active >.menu-tertiary').map( function(el) {return el.offsetWidth} ).reduce( function(a, b ) { return a+b;},0);

      if (activeright > boundright) {
        active_secondary.style.right = setright.toString().concat('px');
      }
    
    }
  
  }

  /**
   * Sets the active scrolling: mobile
   */
  function setScroll () {      
    var isParsys = document.querySelector('.cmp-experiencefragment--header').parentElement.previousElementSibling;
    var scrollToView = false;
    if (isParsys) scrollToView = isParsys.classList.contains('responsivegrid');
    scrollToView ? top.scrollIntoView() : window.scrollTo({top: 0, behavior: 'smooth'});     
    var current = activeLayer();
    var _top    = level().primarynav ? toplevel_primary : toplevel_secondary;

    //mobile only
    if(ismobileSize()) {

      current.removeAttribute('style');

      var height = window.innerHeight - topbar.getBoundingClientRect().bottom;

      var shim   = 140 + window.pageYOffset; 


      var height_setting  = (height+shim).toString().concat('px');
      var cheight_setting = current.offsetHeight.toString().concat('px');
      var set_padding     = current.offsetHeight <= height-shim ? 0 : shim.toString().concat('px');

      //set all selectables ( buttons & links ) to no access 
      blockAccess(mobile_items_opened);
      

      //reset all lists (ul elements) visibility if in path of current
      for (var _l in lists) {
        var ul = lists[_l];
        ul.removeAttribute('style');
        // var _li = ul && ul.closest('li')
        if( ul.contains(current)) {
          ul.removeAttribute('aria-hidden');
          ul.hidden = false;
          ul.style.height = height_setting;
        } else {
          ul.ariaHidden = true;
          ul.hidden = true;
        } 
        ul.classList.remove('scrolling');
        ul.scrollTo(0,0);
      };

      if ( level().primary) {
        _top.style = null;
        current.style.paddingBottom = shim.toString().concat('px');
        _top.style.height = height_setting; 
      } else {
        _top.style.height = height_setting; 
        current.style.paddingBottom = set_padding;
        current.style.height = usbUtils.isSafari() ? height_setting : cheight_setting; 
      }

      current.classList.add('scrolling');

      //set the current nodes to have access
      var active_nodes = usbUtils.selectNodes('.menu-redirect,.menu-button',component);
      activeAccess(currentNodes().concat(active_nodes));

      tab(current_element);
    //desktop only
    } else {

      lists.forEach(function(el){
        el.hidden = false;
        el.removeAttribute('tabindex');
      });
    }
  }

  /**
   * mobile: sets the active nodes of menubar as reachable
   * desktop: sets all nodes as reachable (called from resizeActions method)
   * @param {*} selections: Array<HTMLElements>
   */
  function activeAccess(selections) {
    for ( b in selections) {
      var selectable = selections[b];
      selectable.removeAttribute('aria-hidden');
      selectable.disabled = false;
    }
  }

  /**
   * blocks access to buttons and links for array of elements 
   * @param {*} selections: Array<HTMLElements>
   */
  function blockAccess(selections) {
    for(b in selections) {
      var selectable = selections[b];
      selectable.ariaHidden = true;
      selectable.disabled = true;
      selectable.tabIndex = '-1';
    }
  }

  /**
   * => current_layer:number is set in level:Function; level(true) bumps to next level
   * @returns HTMLElement of the current active nodes
   * next_level supports where in desktop there are up to 2 levels visibile
   *  .levelUp and levelDown set the next level so that focus can be set between visible levels
   */
  function activeLayer () {

    //get ative layers within the current component
    var active_layers = usbUtils.selectNodes('.menu-primary',component).concat(usbUtils.selectNodes(' .menu-item.active >.menu-list',component));

    if (active_layers.length>0) {

      /*
       next_level is used to set next level 
       .which can be up or down from present
       */
      switch(next_level) {
        case levelcodes.PRIMARY:
          return active_layers[0];
        case levelcodes.SECONDARY:
          return active_layers[1];
        case levelcodes.TERTIARY:
          return active_layers[2];
      }
    }
    if (level().secondarynav) return toplevel_secondary; 
    return toplevel_primary;
  }

  /**
   *
   * @returns Array<HTMLElement> of the active nodes with buttons and links
   */
  function currentNodes() {
    currentlist = activeLayer();
    // var _level  = level().level;

    /*
      next_level is used to set next level 
      .which can be up or down from present
    */
    if (! ismobileSize() && next_level==1 ) {
      return usbUtils.visibleNodes( desktop_top_all );
    } 

    if ( ismobileSize() && level().primarynav && next_level==1 ) {
      return mobile_top_primary();
    }

    if ( !ismobileSize() && next_level==1) {
      return desktop_top_all;
    }

    var list = currentlist && currentlist.children
      && usbUtils.nodeListArray(currentlist.children).map(function (el) { return el.querySelector('a,button,input'); })
      || [];

    return usbUtils.visibleNodes(list);
  }

  //External API & Concat of actions ---> start
  function targetedClick(el){
    var evt = new MouseEvent('click', { view: window, bubbles: true, cancellable: true });
    Object.defineProperty(evt, 'target', { value: el, enumberable: true });
    return evt;
  }

  function current() {
    return ismobileSize() && navigation && navigation.querySelector('[tabindex="0"]') || document.activeElement;
  }

  function firstItem() {
    var first = (level().primary && ! ismobileSize() && currentNodes()[1]) || (currentNodes()[0]);
    return first;
  }

  function lastItem() {
    var nodes = currentNodes();
    return nodes[nodes.length-1];
  }

  function selectFirst() {
    buttonSelect(targetedClick(firstItem()));
    return current();
  }

  function selectLast() {
    buttonSelect(targetedClick(lastItem()));
    return current();
  }

  function selectNext() {
    return buttonSelect(targetedClick(next(current())));
  }

  function focusNext() {
    return tab(targetedClick(next(current())).target);
  }

  function selectPrevious() {
    return buttonSelect(targetedClick(previous(current())));
  }

  function focusPrevious() {
    return tab(targetedClick(previous(current())).target);
  }

  function selectBackstep(){
    return backstep(targetedClick(current()));
  }

  function selectButton(el) {
    return buttonSelect(targetedClick(el));
  }

  //External API & Concat of actions ---> end

  /**
   * set active class within selection path
   * @param {*} node
   */
  function activateNode(node) {
    if (node) {
      var top     = node.closest('.menu-item.primary');
      var parent  = node.closest('.menu-item');
      var first   = node.parentElement.querySelector('.menu-item.secondary button.menu-link');
      var isopen  = parent.classList.contains('active');
      var btn     = node;

      notify      = component.querySelector('.navigation-messages');

      if (ismobileSize()) {
        notify.textContent = node.textContent.trim().replace(/[^a-z][\s]{2}/gi,'') + ' expanded'; 
        setTimeout(function(){notify.textContent='';}, 1500);
      }

      clearButtons();
      expandButton(btn);

      // setTimeout(function(){},500);
      if (parent) {
        parent.classList.add('active');
        expandButton(parent);
      }
      if (top) {
        top.classList.add('active');
        expandButton(top);
      }
      if (!ismobileSize() && !isopen && first) {
        first.parentElement.classList.add('active');
        expandButton(first);
      }

      setOpenHeights();
    }
  }

  /**
   * find closest button and set aria-expanded if it has aria-expanded attribute 
   *
   * @param {*} node : HTMLElement
   *
   */
  function expandButton (node) {

    var btn    = node.nodeName=='BUTTON' ? node : node.querySelector('button.menu-link');
    var expand = btn && btn.ariaExpanded !== null;
    if (expand) btn.ariaExpanded = true;

  }

/**
 * Simple link action to support the EvenAction pattern
 * @param {*} e
 */
  function linkAction(e) {
    e.preventDefault();
    if(!this.classList.contains("modal_linked")){
      e.stopImmediatePropagation();
    }
    var link = e.target.href ? e.target : e.target.closest('a');
    if(link) {
		      if((link.href.includes('#') && window.location.href.includes(link.href.split('#')[0])) && window.innerWidth < 1024){
              var div_id_bookmark = document.getElementById(link.href.split('#')[1]);
              clearNav();
              if(div_id_bookmark) div_id_bookmark.scrollIntoView(); 
          }else{
              document.location= link.href;
          }
  }
  }

  /**
   * advances to next actionable element in active layer
   * @param {*} el HTMLElement
   * @returns HTMLElement of the actionable element that has focus
   */
  function next (e) {
    var el    = e.target || current();
    var nodes = currentNodes();
    if (hamburger && ismobileSize()) nodes.unshift(hamburger);
    var dex   = nodes.indexOf(el);
    var node  = el;
    if (dex>-1 && (dex+1)<nodes.length) {
      node = nodes[dex+1];
    } else {
      node = nodes[0];
    }

    if( !ismobileSize() && level().secondary)
      activateNode(node||el);

    tab(node||el);
    return node||el;
  }

  /**
   *
   * advances to previous actionable element in active layer
   * @param {*} el HTMLElement
   * @returns HTMLElement of the actionable element that has focus
   */
  function previous(e) {
    var el    = e.target || current();
    var nodes = currentNodes();
    if (hamburger && ismobileSize()) nodes.unshift(hamburger);
    var dex   = nodes.indexOf(el);
    var node  = el;
    // if (el===first || dex===0 ) {
    if (dex===0) {
      //node = nodes[nodes.length-1];
      node = lastItem();
    } else if (dex>-1 && (dex)<=nodes.length-1) {
      node = nodes[dex-1];
    }

    if( !ismobileSize() && level().secondary)
      activateNode(node||el);

    tab(node||el);
    return node||el;
  }

  /** floating tabindex pattern
   * set tabindex=0 to only one element in menubar
   * which is the actionable element that has focus
   * @param {*} el HTMLElement
   */
  function tab(el){
    el = el || currentNodes()[0];
    if(ismobileSize()) {
      usbUtils.visibleNodes(mobile_items_opened).forEach(function (_el){
        _el.tabIndex = -1;
        if ((_el.classList.contains("logo") || _el.classList.contains("loginButton")) && !isopen()) {
          _el.removeAttribute('tabindex');
        }
        //Commenting these lines jus to check the issue on global nav focus is resolved and not creating any regression - If the fix is not creating regressing issues we can remove the commented lines and rewrite appropriately.
      });
      el.removeAttribute('tabindex');
    }
    current_element = el;
   el.focus();
  }

  // _______________________________ reset methods

  /**
   * Handles resets between desktop and mobile modes of menubar
   */
  function resizeActions () {
    if ( ismobileSize() ) {
      if ( isopen() ) {
        activeAccess(currentNodes());
        navigations.forEach(function(nav) { nav.removeAttribute('aria-hidden'); });
      } else {
        blockAccess(mobile_items_opened);
        activeAccess(toggles.concat(mobile_items_closed));
        navigations.forEach(function(nav) { nav.ariaHidden = true; });
      }
      toplinks.forEach(function(el){ el.removeAttribute('tabindex'); });
    } else {
      closeMobile();
      setForDesktop();
      lists.forEach(function (ul){ ul.removeAttribute('style'); });
    }
    closeLogin();

  }

  /**
   * Clears active element.classList active class from all buttons
   */
  function clearButtons(){

    for(var b in menu_items ) {
      menu_items[b].classList.remove('active');
    }

    menu_buttons.forEach(function(_btn) {
      if(_btn.ariaExpanded !== null) {
        _btn.ariaExpanded = false;
      }
    });


  }

  /**
   * clears buttons and collapse the background vale
   */
  function clearNav (){
    clearButtons();
    setVale();
    clearVale();
    topbar.classList.remove('login-open');
    if(document.querySelector('.login-buttons span.lang-badge')){
      document.querySelector('.login-buttons span.lang-badge').style.display='inline-flex';
    }
    top_vale.style.zIndex  = null; 
    if(ismobileSize() && isopen()) {
      closeMobile();
    }
    if (document.querySelector('.global-nav .login-toggle')) document.querySelector('.global-nav .login-toggle').ariaExpanded = false;
  }

  let loginLink_default = document.getElementById('onlinebankingURL');
  if (loginLink_default) {
    if(usbUtils.isMobile()) {
      let olbTux_url_value = loginLink_default.getAttribute('data-tuxLogin');   
      function setLoginLink() {       
        if (olbTux_url_value !== null) {
            loginLink_default.setAttribute('href', olbTux_url_value);        
        } 
      }
      setLoginLink();	
    }    
  }

}());

"use strict";

const getInteractionId = sessionStorage.getItem("interactionID");
const getToken = () => { return generateToken("", getInteractionId, "SmartAssistant", "COM", getInteractionId)};
const getTokenSA = () => {return generateToken(storageKey,interactionId,featureId,"web",interactionId) };
const getSessionInteractionId = () => {return sessionStorage.getItem("interactionID") };
let manifestUrlDomain = $("input[name='manifestURL'").val();
var timestamp = new Date().getTime();
let manifestUrl = manifestUrlDomain + "/digital/servicing/smart-assistant/manifest.json?ver=" + timestamp;
let saSearchStatus = $("input[name='smartAssistantStatus'").val();
let screenSize = window.innerWidth;
let saElement;
let smartAsst;


if (sessionStorage.interactionID === undefined) {
    // generate guid for user
    sessionStorage.interactionID = create_UUID();
}

const interactionId = sessionStorage.interactionID;
const storageKey = "SAAccessToken";
const featureId = "SmartAssistant";


function create_UUID() {
  var dt = new Date().getTime();
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}

// this code checks to see if the token already exists, if not it populates the session
const accessToken = generateToken(
        storageKey,
        interactionId,
        featureId,
        "web",
        interactionId
);


sessionStorage.setItem("AccessToken", accessToken);


function buildTokenPayload(featureId, channelId, userGUID, sessionToken) {
  const payload = {
    channelId: channelId,
    featureId: featureId,
    userId: userGUID,
    sessionToken: sessionToken,
  };

  return JSON.stringify(payload);
}

function getServletURL() {
  const queryURL = "/svt/ecm/smartassistant";

  return queryURL;
}

function checkSessionToken(storageKey){
   let results = "";
   const tokenValue  = sessionStorage.getItem(storageKey);
   if (tokenValue !== undefined) {
     results = tokenValue;
   }
   return results;
}

function setSessionToken(storageKey, tokenValue){
  if (tokenValue !== undefined) {
    sessionStorage.setItem(storageKey,tokenValue);
  }
}

function checkTimeStampedSessionToken(storageKey){
  let results = "";
  const tokenValue  = checkSessionToken(storageKey);
  if (tokenValue !== undefined && tokenValue !== null && tokenValue !== "") {
    // check the timestamp
    const { token, timestamp } = JSON.parse(tokenValue);
    const sessionValue = new Date(timestamp).getTime();
    const currentTimeStamp = new Date().getTime();
    // if the current timestamp is less than 10 minutes old then use the current token else return empty
    const timeLapse = currentTimeStamp - sessionValue;
    if(timeLapse < 600000){
       results =  token;
    }
  }
  return results;
}

function setTimeStampedSessionToken(storageKey, tokenValue){
  if (tokenValue !== undefined) {
    const dtTimeStamp = new Date();
    const sessionPayload ={
      token: tokenValue,
      timestamp: dtTimeStamp.toUTCString()
    }
    setSessionToken(storageKey,JSON.stringify(sessionPayload));
  }
}

function generateToken(storageKey, userGUID, featureId, channelId, sessionToken) {
  // if(token)is in session storage return that else generate new token.
  let results = checkTimeStampedSessionToken(storageKey);
  if (results === null || results === "") {
    const tokenServiceURL = getServletURL();

    const payload = buildTokenPayload(
      featureId,
      channelId,
      userGUID,
      sessionToken
    );

    $.ajax({
      type: "POST",
      url: tokenServiceURL,
      // added flag to not send CORS Option
      cors: false,
      crossDomain: true,
      beforeSend: function (request) {
        request.setRequestHeader("Content-Type", "application/json");
      },
      async:false,
      dataType: "json",
      data: payload,
      success: function (data) {
        if (data != undefined) {
          let token = data.access_token;
          setTimeStampedSessionToken(storageKey, token);
          results = token;
          return results;
        }
      },
      error: function (data) {
        console.log("Error calling Token Generator");
      },
    });
  }
  return results;
}


if(saSearchStatus){

    if(screenSize >= 1057){
        smartAsst = document.getElementById('smartAssistantLarge');
    }else{
        smartAsst = document.getElementById('smartAssistantSmall');
    }

    smartAsst.addEventListener("click", saDispatchFunction);

    function saDispatchFunction() {
        const openSAEvent = new CustomEvent('OPEN_SMART_ASSISTANT', { detail: { initiator: 'COM' }})
        window.dispatchEvent(openSAEvent)
    }

    require.config({
      paths: {
        "react": "/content/usbank/LoginModuleHelpers/react.production.min",
        "react-dom": "/content/usbank/LoginModuleHelpers/react-dom.production.min",
        "babel": "/content/usbank/LoginModuleHelpers/babel.6.15.0.min",
        "DS": "https://onlinebanking.usbank.com/auth/login/wmf/micro-app-loader/dist/umd/index"
      }
    });

    require(["react", "react-dom", "babel", "DS"],
              function (React, ReactDOM, babel, DS) {
                ReactDOM.render(
                React.createElement(
                DS, {
                id: "smartAssistant",
                elementRef: React.createRef(null),
                manifestPath: manifestUrl,
                isDomainPrefixedToManifestPath:false,
                namespace: "SmartAssistant",
                    appProps: {
                        channelId: "COM",
                        getAccessToken: getTokenSA,
                        getSessionID: getSessionInteractionId,
                        isAuthSpace: false,
                        locale: "en-us",
                        modalVariant: "wider",
                        channelVersion: "1.0",
                        operatingSystem: "DOTCOM",
                        participantToken: getInteractionId,
                        externalUserId: getInteractionId,
                        operatingSystemVersion: "1.0"
                    }
                }),
                document.getElementById('smart-assistant')
                );
              }
    );
}

document.addEventListener("DOMContentLoaded", function(){
    "user strict";
    var currentlocale;
    var langToggle = $("#langIndicatorToggleButton , #langIndicatorToggleButtonMobileNav"),
        toggleModal = "languageIndicatorModal";

    langToggle.each(function (){
        var dataUrlValue = $(this).attr("data-url");
        $(this).attr("href", dataUrlValue);
    });
    
    var pageUrl = $(langToggle).attr("href");
    var srval = "solo en inglés";
    var nbsp = " &nbsp;";

    var isDesktop = function () {
        return document.body.clientWidth >= 700;
    };

    var languageIndicatorModal = (function () {
        const _regex = /^(#.*|.*facebook|twitter|instagram|javascript:void|tel:).*$/i;
        const isInternalLink = new RegExp("^(.*((.|/)usbank(/|.com)).*)$");
        const whiteTextColor = ["rgb(255, 255, 255)"];
        const BG_COLOURS = ["rgb(10, 65, 197)", "rgb(222, 22, 43)", "rgb(0, 124, 190)", "rgb(216, 59, 72)", "rgb(10, 65, 207)"];
        const indicators = [".lang-badge.transparent" , ".lang-badge.blue"];
        var modalElemList = {
            header: ".langindicator-modal.background .heading",
            body: ".langindicator-modal.background .body",
            footer: ".langindicator-modal.background .modalfooter",
        };
        
        var langIndicatorModalUtils = {
            setOtherModalsVisibility: function (propertyVal) {
                var modal = $("div.modal");
                if (propertyVal == "hide") {
                    modal.css("opacity", "-1");
                } else if (propertyVal == "show") {
                    modal.css("opacity", "1");
                }
            },
        };
        var Toggle = {
            preventAutoScreenReading: function () {
                for (var item in modalElemList) {
                    $(modalElemList[item]).attr("aria-hidden", "true");
                }
                setTimeout(function () {
                    for (var index in modalElemList) {
                        $(modalElemList[index]).removeAttr("aria-hidden");
                        console.log("removing " + index);
                    }
                }, 1000);
            }, isLocalSessionActive: function () {
                if (localStorage.getItem("activeSession") != null) {
                    return localStorage.getItem("activeSession");
                } else {
                    localStorage.setItem("activeSession", "true");
                    return false;
                }
            },
            isSessionActive: function () {
                if (sessionStorage.getItem("activeSession") != null) {
                    return sessionStorage.getItem("activeSession");
                } else {
                    sessionStorage.setItem("activeSession", "true");
                    return false;
                }
            },
            displayModalOnNewSession: function (spanishModal) {
                //zipcode modal disappear
                langIndicatorModalUtils.setOtherModalsVisibility("hide");
                Modal(spanishModal, {
                    namespace: "shield-modals langindicator-modal",
                    primaryAction: function (e) {
                        modal.close();
                        //display zipcode modal
                        langIndicatorModalUtils.setOtherModalsVisibility("show");
                    },
                });
            },
            displayModal: function (spanishModal, routingUrl, locale, sessionStatus) {
                if (locale === "EN") {
                    Modal(spanishModal, {
                        namespace: "shield-modals langindicator-modal",
                        primaryAction: function (e) {
                            window.location.pathname = routingUrl;
                        },
                        secondaryAction: function (e) {
                            modal.close();
                        },
                    });
                    Toggle.preventAutoScreenReading();
                } else if (locale == "ES") {
                    if (sessionStatus == false && document.referrer == "" && document.referrer.indexOf("usbank") == -1) {
                        Toggle.displayModalOnNewSession(spanishModal);
                        $(".langindicator-modal button.close").hide();
                    }
                }
            },indicatorAlreadyExist(indicators , link){
            	var found ={
            		    indicator:null
        			}
                $.each(indicators, function (key, indicator) {
                    if ($(link).find(indicator).length == 0) {
                        found.indicator = indicator;
        			}	
                });
        	return found;
            },
            iconizeGlbalNavigator: function () {
                var neglectMenuLinks = [".login-button", ".homepage.logo", ".homepage.logo.keycell.menu-link" , ".login-button.loginButton"];
                var globalNav = $(".globalNavigation");
                var links = globalNav.find("a");
                $.each(links, function (key, link) {
                    if(link.hasAttribute("aria-label") && (link.id == "langIndicatorToggleButton" || link.id == "langIndicatorToggleButtonMobileNav") ){
                        var ariaLabel = link.getAttribute("aria-label").concat(" ");
                        link.setAttribute("aria-label",ariaLabel+srval);
                    }
                    if (neglectMenuLinks.some(className => link.matches(className)) != true && link.id != "langIndicatorToggleButton" && link.id != "langIndicatorToggleButtonMobileNav" && link.href != "#" && ($(link).find(".lang-badge.blue").length == 0)) {
                        if (link.href.indexOf("/es") == -1) {
                            link.innerHTML += '<span class="lang-badge blue"><span class="sr-only">' + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                        }
                    }
                });
            },
            createIconElement: function (className) {
                var icon = "<span class='" + className + "'><span class='sr-only'>" + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                var iconElem = document.createRange().createContextualFragment(icon);
                return iconElem;
            },
            hasCheveron: function (el, className) {
                if ($(el).find("." + className.replace(" ",".")).length < 1 && $(el).find(".blueSolidButton").length == 0) {
                    var cheveronClassList = [".USBOmniChannel__ChannelChevron", ".USBHero__StoryChevron", ".USBRatesAndCalculator__Chevron", ".USBNewsroom__Chevron", ".readmore_arrow", ".USBCallToAction__Chevron", ".chevron"];
                    cheveronClassList.forEach(function (item) {
                        if ($(el).find(item).length > 0) {
                            var Cheveron = $(el).find(item);
                            if ($(Cheveron).hasClass("nowrap") || $(Cheveron).hasClass("after") ) {
                                Toggle.appendIconOnPageLinks(Cheveron[0], "lang-badge blue", "inner");
                            } else {
                                Cheveron.before(Toggle.createIconElement(className));
                            }
                        }
                    });
                }
            },
            appendIconforTextElem: function (el, className) {
                if ($(el).find("." + className.replace(" ",".")).length < 1 && $(el).find(".blueSolidButton").length == 0) {
                    var elemList = ["span", "p"];
                    elemList.forEach(function (item) {
                        if ($(el).find(item).length > 0) {
                            if ($(el).find(".redArrowLink").length > 0) {
                                //TODO this need to be removed since iconizeButtons takes care  of this
                                
                                $(el).after(Toggle.createIconElement(className));
                            } else if ($(el).find(".sr-only").length == 0) {
                                // does not have sr-only

                                var htmlTagNames = el.getElementsByTagName(item);
                                if(el.hasAttribute("aria-label")){
                                    var ariaLabel = el.getAttribute("aria-label").concat(" ");
                                    el.setAttribute("aria-label",ariaLabel+srval);
                                }
                                
                                var innerContent = '<span class="' + className + '"><span class="sr-only">' + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                                if(htmlTagNames[0] && htmlTagNames[0].getAttribute('aria-hidden') == "true"){
                                    htmlTagNames[0].outerHTML += innerContent;
                                }else{
                                    htmlTagNames[0].innerHTML += innerContent;
                                }
                                
                            }
                        }
                    });
                }
            },
            appendIconOnPageLinks: function (el, className, position) {
                if (typeof el !== "undefined" && $(el).find("." + className.replace(" ",".")).length < 1) {
                    if(el.hasAttribute("aria-label")){
                        var ariaLabel = el.getAttribute("aria-label").concat(" ");
                        el.setAttribute("aria-label",ariaLabel+srval);
                    }
                    if (el.classList.contains("nowrap") || el.classList.contains("after") ) {
                        if(el.closest('a').hasAttribute("aria-label")){
                            var ariaLabel = el.closest('a').getAttribute("aria-label").concat(" ");
                            el.closest('a').setAttribute("aria-label",ariaLabel+srval);
                        }
                    }


                    if (position == "inner") {
                        var innerContent = "<span class='" + className + "'><span class='sr-only'> " + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                        el.innerHTML += (el.children.length == 1 && el.querySelector('sup'))?"":innerContent;
                    } else if (position == "after") {
                        $(el).after(Toggle.createIconElement(className));
                    }
                }
            },
            appendIconOnRemainingLinks: function (el) {
                if ($(el).find(".lang-badge.blue").length < 1 && $(el).find(".lang-badge.transparent").length < 1 && $(el.parentElement).find(".blueSolidButton").length == 0 && $(el).closest("footer .socialMedia").length == 0) {
                    if(el.hasAttribute("aria-label")){
                        var ariaLabel = el.getAttribute("aria-label").concat(" ");
                        el.setAttribute("aria-label",ariaLabel+srval);
                    }
                    
                    if (BG_COLOURS.indexOf($(el).css("background-color")) > -1) {
                        el.innerHTML += '<span class="lang-badge transparent"><span class="sr-only">' + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                    } else {
                        el.innerHTML += '<span class="lang-badge blue"><span class="sr-only">' + nbsp+srval + "</span><span aria-hidden='true'>EN</span></span>";
                    }
                }
            },
            iconizeHeaderDiscalmer: function () {
                var links = $(".messageOverlay a");
                for (var link = 0; link < links.length; link++) {
                    if (!_regex.test(links[link].getAttribute("href"))) {
                        if (links[link].href.indexOf("/es") == -1) {
                            Toggle.appendIconOnPageLinks(links[link], "lang-badge blue", "inner");
                        }
                    }
                }
            },
            iconizeThePage: function () {
                var links = $(
                    ".bodyContent a:not(.globalNavigation a):not(.footerSection a):not(a[role=button]):not(.footer ul a):not(.navbar a.navbar-brand):not(.footerPrimary a),body a:not(.globalNavigation a):not(a[role=button]):not(.footerSection a):not(.footer ul a):not(.navbar a.navbar-brand):not(.footerPrimary a)"
                );
                for (var link = 0; link < links.length; link++) {
                    if (links[link].hasAttribute("href") && !_regex.test(links[link].href) && isInternalLink.test(links[link].href)) {
                        if (links[link].href.indexOf("/es/") == -1) {
                            if (whiteTextColor.indexOf($(links[link]).css("color")) == -1) {
                                Toggle.hasCheveron(links[link], "lang-badge blue");
                                Toggle.appendIconforTextElem(links[link], "lang-badge blue");
                            } else {
                                Toggle.hasCheveron(links[link], "lang-badge transparent");
                                Toggle.appendIconforTextElem(links[link], "lang-badge transparent");
                            }

                            Toggle.appendIconOnRemainingLinks(links[link]);
                        }
                    }
                }
            },
            iconizeFooter: function () {
                var links = $(".footerSection a,.footer a,.footerLinks a,.footer ul a,.footerPrimary a");
                for (var link = 0; link < links.length; link++) {
                    if (links[link].hasAttribute("href") && !_regex.test(links[link].href) && !_regex.test($(links[link]).attr("href")) && isInternalLink.test(links[link].href)) {
                        if (links[link].href.indexOf("/es") == -1) {
                            Toggle.appendIconOnPageLinks(links[link], "lang-badge transparent", "inner");
                        }
                    }
                }
            },
            iconizeCobrowse: function(){
    			var cobrowser = document.getElementById('cobrowseDesktop')
    			cobrowser.innerHTML += '<span class="lang-badge transparent"><span class="sr-only">'+nbsp+srval+'</span><span aria-hidden="true">EN</span> </span>';
            },

            iconizeButtons: function () {
                    var links = $("button[onclick],a[role=button],a[role=link],.button-group a,a:not(sup a):not(.footerPrimary a):not(.socialMedia a):not(.homepage.logo),.button-group button");
                    for (var link = 0; link < links.length; link++) {
                        try{
                            var linkattr;
                            //let linkTest =  (!_regex.test(links[link].href) && isInternalLink.test(links[link].href)); TODO need to add regex check 
                            var linkRegex = true;
                            if (links[link].hasAttribute("href")) {
                                linkattr = links[link].getAttribute("href");
                                linkRegex = !linkattr.startsWith('tel:');
                            } else if (links[link].hasAttribute("onclick")) {
                                linkattr = links[link].getAttribute("onclick");
                                linkRegex = true;
                            }
                            if (linkattr.indexOf("/es") == -1 && linkRegex == true ) {
                                $(links[link]).removeAttr("style"); // TODO this must be removed once(USB_RPS_L3Banner) component is refactored
                                if (BG_COLOURS.indexOf($(links[link]).css("background-color")) > -1) {
                                    Toggle.appendIconforTextElem(links[link], "lang-badge transparent");
                                    Toggle.appendIconOnPageLinks(links[link], "lang-badge transparent", "inner");
                                } else {
                                    Toggle.appendIconforTextElem(links[link], "lang-badge blue");
                                    Toggle.appendIconOnPageLinks(links[link], "lang-badge blue", "inner");
                                }
                            }
                        }catch(e){
                            let err = new Error();
                            console.error(err.stack);
                        }
                    }
                    
                
                
            },
            appendIconOnLoginButton: function () {
                Toggle.appendIconOnPageLinks($("button.login-button")[0], "lang-badge transparent", "inner");
                Toggle.appendIconforTextElem($("a.login-button")[0], "lang-badge blue");
            },
        };
        return {
            iconizeHeaderDiscalmer: Toggle.iconizeHeaderDiscalmer,
            iconizeThePage: Toggle.iconizeThePage,
            iconizeFooter: Toggle.iconizeFooter,
            iconizeCobrowse: Toggle.iconizeCobrowse,
            iconizeButtons: Toggle.iconizeButtons,
            appendIconOnLoginButton: Toggle.appendIconOnLoginButton,
            isSessionActive: Toggle.isSessionActive,
            displayModal: Toggle.displayModal,
            iconizeGlbalNavigator: Toggle.iconizeGlbalNavigator,
            isLocalSessionActive:Toggle.isLocalSessionActive,
        };
    })();

     currentlocale = $("#" + toggleModal).attr("data-currentlocale");
        if (currentlocale == "ES") {
            //languageIndicatorModal.iconizeHeaderDiscalmer(); // call this on dotcom pages with covid banner
            //languageIndicatorModal.iconizeGlbalNavigator();
            languageIndicatorModal.iconizeFooter();
            languageIndicatorModal.iconizeCobrowse();
            languageIndicatorModal.appendIconOnLoginButton();
            languageIndicatorModal.iconizeGlbalNavigator();
 			setTimeout(function () {
                if (currentlocale == "ES") {
                    languageIndicatorModal.iconizeThePage();
                    languageIndicatorModal.iconizeButtons();
                }
            }, 3000);
            if (isDesktop() == true) {
                var session = languageIndicatorModal.isLocalSessionActive();
                languageIndicatorModal.displayModal(toggleModal, pageUrl, currentlocale, session);
            }
        }

    langToggle.click(function (e) {
        e.preventDefault();
        var currentlocale = $("#" + toggleModal).attr("data-currentlocale");
        if (currentlocale === "EN" && isDesktop() && languageIndicatorModal.isLocalSessionActive() == false) {
            try {
                languageIndicatorModal.displayModal(toggleModal, pageUrl, currentlocale, true);
            } catch (err) {
                console.log(err + "----> Route directly to spanish in IE");
                window.location.pathname = pageUrl;
            }
        } else if (currentlocale === "ES" || !isDesktop() || languageIndicatorModal.isLocalSessionActive()) {
            window.location.pathname = pageUrl;
        } 
    });
});


(function(){
  'use strict';

  var overlaps = usbUtils.selectNodes('[class*="-overlap-"]');
  setMargins();

  if(overlaps && overlaps.length>0) {
    usbUtils.listenTo(window,'resize',setMargins);
  }


  function setMargins() {
    overlaps.forEach(function(component){
      if (/(lg|md)/.test(usbUtils.windowSize())) {

        var classname = component.className.match(/(c\d-overlap-\d+)/)[0];
        var margin    = classname.match(/\d+$/)[0];
        var colnum    = classname.match(/^c\d+/)[0].match(/\d+/)[0];
        var section   = component.parentElement;

        if(parseInt(colnum) && parseInt(margin)>=0) {
          var column = component.querySelector('.column'.concat(colnum));
          var diff = column.offsetHeight - section.offsetHeight;
          if(diff>0) {
            var adj =  parseInt(margin).toString();
            component.style.marginTop    = (adj).concat('px');
            component.style.marginBottom = (adj).concat('px');
          }
        }
      } else {
        component.removeAttribute('style');
      }
    });
  }



})();
$(document).ready(function(){
    $('.articleTag .tagButton').on('click', function(){
      $(this).siblings().removeClass('pressed');
      $(this).addClass('pressed')
    })
  })
var stickyCtaSection = document.querySelector(".stickyCtaSection");
if (stickyCtaSection) {
    stickyCtaSection.classList.add("drop-shadow-up");
    var headerDiv = document.querySelector(".cmp-experiencefragment--header");
    var bannerDiv = document.querySelector(".banner") ? document.querySelector(".banner") : document.querySelector(".checkingAnimatedBanner");
    var footerDiv = document.querySelector(".cmp-experiencefragment--footer");
    var disclosureDiv = document.querySelector('.disclosure');
    var headerBottom = headerDiv ? (headerDiv.offsetTop + headerDiv.offsetHeight) : undefined;
    var bannerBottom = bannerDiv ? (bannerDiv.offsetTop + bannerDiv.offsetHeight) : undefined;
    var displayStickyCTA;
    var footerPos;
    var sticky;
    displayStickyCTA = bannerDiv ? bannerBottom : headerBottom;

    usbUtils.listenTo(document.body, 'touchmove', onScroll);
    usbUtils.listenTo(window, 'scroll', onScroll);
}

// callback
function onScroll() {
    var currentScrollPos = window.pageYOffset;

    //Fix static position above the disclaimer / footer

    if (disclosureDiv) {
        footerPos = disclosureDiv.getBoundingClientRect().top;
    } else {
        if (footerDiv) {
            footerPos = footerDiv.getBoundingClientRect().top;
        }
    }

    if (stickyCtaSection && currentScrollPos >= displayStickyCTA) {
        stickyCtaSection.classList.add("is-showing-block");
        stickyCtaSection.classList.remove("is-hidden");
    } else {
        stickyCtaSection.classList.add("is-hidden");
        stickyCtaSection.classList.remove("is-showing-block");
    }

        if (stickyCtaSection.getBoundingClientRect().bottom > footerPos) {
            stickyCtaSection.classList.add("is-static");
            sticky = document.querySelector('.stickyCTA').getBoundingClientRect().top + stickyCtaSection.offsetHeight;

        } else {
            if(currentScrollPos < stickyCtaSection.offsetTop-stickyCtaSection.offsetHeight){
                if (!isDesktop() && window.matchMedia("(max-width: 480px)").matches) {
                    if(sticky && sticky < footerPos)
                        stickyCtaSection.classList.remove("is-static");
                }else{
            	stickyCtaSection.classList.remove("is-static");
                }
        }
        }

        if (stickyCtaSection.classList.contains('is-static')) {
            stickyCtaSection.classList.remove("drop-shadow-up");
        }else{
            stickyCtaSection.classList.add("drop-shadow-up");
        }

}


$(document).ready(function() {
    let pageurl = location.href;

	if(pageurl.includes('/credit-cards/') || pageurl.includes('/business-banking/')){
		    let src_code = new URL(pageurl).searchParams.getAll('sourcecode').toString();

    let url_boarding = ['https://onboarding.usbank.com/consumer/cards/','https://onboarding.usbank.com/gateway/consumer','https://onboarding.usbank.com/usl/consumer/','https://onboarding.usbank.com/business/cards/'];
    let url_application = ['https://applications.usbank.com/oad','https://applications.usbank.com/pdap'];

     if (src_code  != null && src_code != ''){
    	 $('a').each(function(i, val) {
            let url = val.href;
            if(url!=null && url!=''){
                        let urlObj = new URL(val.href);
                        url_boarding.forEach(function(url1,index){
                            if (url.indexOf(url1) > -1) {
                                if (urlObj.pathname.indexOf('intro') > 0 || urlObj.pathname.indexOf('business-information') > 0 || urlObj.pathname.indexOf('start') > 0 || urlObj.pathname.indexOf('login') > 0) {
                                    let pathnamearr = pathnameadd(urlObj.pathname);
                                    if (pathnamearr) {
                                        urlObj.pathname = pathnamearr;
                                        val.href = urlObj.toString();

                        }
                    }
                }
            })
            url_application.forEach(function(url2,index){
             if (url.indexOf(url2) > -1) {

                if (urlObj.searchParams.getAll('sourceCode')) {
                    urlObj.searchParams.set('sourceCode', src_code);
                    val.href = urlObj.toString();
                }

            }
        });
	}
      })
 }

    function pathnameadd(pathname) {
        let pathnamearr = pathname.split('/');
        pathnamearr[pathnamearr.length - 2] = src_code;
        pathnamearr = pathnamearr.join('/');
        return pathnamearr
    }
	}
});

let dsDynamicRatesApi = (function() {

    let checkIfDSDynamicRatesClassPresent = function(className,loanType) {
        if ($(className) && $(className).length > 0) {
            updateDynamicRates(className,loanType);
        }
    }

    let updateDynamicRates = function(className, loanType) {
        let newDate = currentDateCheck("5","30");
        let requestURL = "/svt/usbank/dealerServicesDirectRates";
        let configuredParams =getRequestParams(loanType);
        if(configuredParams){
            let requestParams = configuredParams+ "." + newDate + "_ds" + ".json";
             $.ajax({
                url: requestURL + requestParams,
                type: 'GET',
                success: function(data) {
                    let selectedTerm = getSelectedTerm(loanType);
                    if(selectedTerm){
                        for (let key in data) {
                           if (data.hasOwnProperty(key) && data[key].termInMonths == selectedTerm ) {
                                 $(className).html(data[key].apr.toFixed(2));
                           }
                        }
                    } else { // auto refinance case
                         $(className).html(data['apr'].toFixed(2));
                    }
                },
                error: function() {
                    $(className).html('');
                }
            })
        }

    };
    let getSelectedTerm = function(loanType){
        if("AUTO_NEW_PURCHASE" == loanType){
          return  $('body').attr("data-autopurchaseterm");
        }
    }
    let getRequestParams = function(loanType){
            if("AUTO_NEW_PURCHASE" == loanType){
              return  $('body').attr("data-dsdynamicratesautopurchase");
            }else if("AUTO_REFINANCE" == loanType){
              return  $('body').attr("data-dsdynamicratesautorefinance");
            }
    }
    let currentDateCheck = function(execHour, execMinutes) {
       let systemDate = new Date();
       const  standardDateTime = systemDate.getTime() + (systemDate.getTimezoneOffset() * 60000);
       let currentCSTDateTime = new Date(standardDateTime + (3600000 * -6));
        let resultDate = currentCSTDateTime.toISOString().slice(0, 10).replace(/-/g, "");
        if (currentCSTDateTime.getHours() <= execHour && currentCSTDateTime.getMinutes() <= execMinutes ) {
            resultDate = resultDate - 1;
        }
        return resultDate;
    }

    return {
        updateDynamicRates: updateDynamicRates,
        checkIfDSDynamicRatesClassPresent: checkIfDSDynamicRatesClassPresent
    };
})();

dsDynamicRatesApi.checkIfDSDynamicRatesClassPresent(".ds-directrates-auto-new-purchase","AUTO_NEW_PURCHASE");
dsDynamicRatesApi.checkIfDSDynamicRatesClassPresent(".ds-directrates-auto-refinance","AUTO_REFINANCE");
$(document).ready(function() {

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        let regexS = "[\\?&]" + name + "=([^&#]*)";
        let regex = new RegExp(regexS);
        let results = regex.exec(window.location.href);
        if (results == null) return "";
        else return results[1];
    }

    let paralet = getParalet();

    function getParalet() {
        let url = window.location.href;
        let str1 = 'ReferrerID';
        let str2 = 'referrerId';
        if (url.indexOf(str1) != -1) {
            return str1;
        } else {
            return str2;
        }

    }

    let paraUrl = getUrlParameter(paralet);

    if (paraUrl != null && paraUrl != '' && paraUrl != undefined) {
        createCookie(paralet, paraUrl, 30);
        appendCookieUrl(paraUrl);

    } else if (readCookie(paralet) != null && readCookie(paralet) != '' && readCookie(paralet) != undefined) {
        let email = readCookie(paralet);
        appendCookieUrl(email);

    }

    function createCookie(name, value, days) {
        let expires;

        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
    }

    function readCookie(name) {
        let nameEQ = encodeURIComponent(name) + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0)
                return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
        return null;
    }

    function appendCookieUrl(name) {
        let emailName = name;
        let matchBridgeUrl1 = 'home-loans/mortgage/apply.html';
        let bridgeSignInBtnId = 'aem-bridge-sign-in-start';
        let bridgeStartGuest = 'aem-bridge-start-guest';
        $('button').each(function() {
            let matchUrl = 'mortgageapply.usbank.com/#/signup?referrerId=PortalDotCom%40usbank.com';
            let matchUrl1 = 'onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&amp;referrerid=PortalDotCom@usbank.com';
            let matchUrl2 = 'onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&referrerid=PortalDotCom@usbank.com';
            let onclickHref = $(this).attr('onclick');
            if (onclickHref != undefined && onclickHref.includes(matchUrl)) {

                let latest = "location.href='https://mortgageapply.usbank.com/#/signup?referrerId=" + emailName + "'";

                $(this).attr('onclick', latest);
            } else if (onclickHref != undefined && (onclickHref.includes(matchUrl1) || onclickHref.includes(matchUrl2))) {

                let latest = "location.href='https://onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&referrerId=" + emailName + "'";

                $(this).attr('onclick', latest);
            } else if (onclickHref && (onclickHref.includes(matchBridgeUrl1))) {
                let btnHref = decodeURIComponent(onclickHref);
                btnHref = btnHref.replace("location.href='", "").replace(";", "").replace("'", "");
                if (btnHref) {
                    let newBtnHref = formulateBtnHref(btnHref, emailName);
                    if (newBtnHref) {
                        $(this).attr('onclick', "location.href='" + newBtnHref + "'");
                    }
                }
            } else if (window.location.href.indexOf(matchBridgeUrl1) > -1) {
                //DotCom Bridge Page
                let btnId = $(this).attr('id');
                let btnHref = decodeURIComponent(onclickHref);
                btnHref = btnHref.replace("location.href='", "").replace(";", "").replace("'", "");
                if (btnId && btnHref && (btnId.indexOf(bridgeSignInBtnId) >= 0 || btnId.indexOf(bridgeStartGuest) >= 0)) {
                    let newBtnHref = formulateBtnHref(btnHref, emailName);
                    if (newBtnHref) {
                        $(this).attr('onclick', "location.href='" + newBtnHref + "'");
                    }
                }
            }

        });

        $('a').each(function() {
            let matchUrl = 'mortgageapply.usbank.com/#/signup?referrerId=PortalDotCom%40usbank.com';
            let matchUrl1 = 'onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&amp;referrerid=PortalDotCom@usbank.com';
            let matchUrl2 = 'onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&referrerid=PortalDotCom@usbank.com';
            let onclickHref = $(this).attr('href');
            if (onclickHref != undefined && onclickHref.includes(matchUrl)) {

                let latest = "https://mortgageapply.usbank.com/#/signup?referrerId=" + emailName;

                $(this).attr('href', latest);
            } else if (onclickHref != undefined && (onclickHref.includes(matchUrl1) || onclickHref.includes(matchUrl2))) {

                let latest = "https://onlinebanking.usbank.com/Auth/SSOLogin?client=Blend&referrerId=" + emailName;

                $(this).attr('href', latest);
            } else if (onclickHref && (onclickHref.includes(matchBridgeUrl1))) {
                let btnHref = decodeURIComponent(onclickHref);
                if (btnHref) {
                    let newBtnHref = formulateBtnHref(btnHref, emailName);
                    if (newBtnHref) {
                        $(this).attr('href', newBtnHref);
                    }
                }
            } else if (window.location.href.indexOf(matchBridgeUrl1) > -1) {
                //DotCom Bridge Page
                let btnId = $(this).attr('id');
                let btnHref = decodeURIComponent(onclickHref);
                if (btnId && btnHref && (btnId.indexOf(bridgeSignInBtnId) >= 0 || btnId.indexOf(bridgeStartGuest) >= 0)) {
                    let newBtnHref = formulateBtnHref(btnHref, emailName);
                    if (newBtnHref) {
                        $(this).attr('href', newBtnHref);
                    }
                }
            }


        });




    }
    
    let cokieData = document.cookie, cokieSortedData,responseHeaderCookie = ['aid','mid','riblpid','apptype'],
    setResponseHeaderCookie = ['omniiphoneaid','omniiphonemid','omniiphonelpid','omniapptype'], positionMatchedHeader = [];
    cokieSortedData = cokieData.split(';');

   
    for(let i = 0; i < cokieSortedData.length; i++){
        for(let j = 0; j < responseHeaderCookie.length; j++){
			 if(cokieSortedData[i].indexOf(responseHeaderCookie[j]) != -1){
                let splitCharCookie = cokieSortedData[i].split('=');
				localStorage.setItem(setResponseHeaderCookie[j],splitCharCookie[1]);
        	}
        }

    }

    function getUrlParameters() {
        let search = window.location.search;
        let params = new URLSearchParams(search);
        let paramObj = {};
        for (let value of params.keys()) {
            paramObj[value] = params.get(value);
        }
        return paramObj;
    }

    function formulateBtnHref(btnHref, emailName) {
        // Update referrerId in button href
        let updatedBtnHref = btnHref.replace('referrerid', 'referrerId').replace('PortalDotCom@usbank.com', emailName);
        let btnHrefArr = updatedBtnHref.split("?");
        let btnBaseString = btnHrefArr[0];
        let btnParamString = btnHrefArr[1];
        let btnParams = new URLSearchParams("");
        if (btnParamString) {
            btnParams = new URLSearchParams(btnParamString);
        }

        // Add other url parameters to button href
        let paramObj = getUrlParameters();
        for (let key in paramObj) {
            if (paramObj.hasOwnProperty(key)) {
                if (key.toLowerCase() == 'referrerid' && !btnParams.has('referrerId')) {
                    btnParams.set('referrerId', emailName)
                } else if (key.toLowerCase() != 'referrerid' && key.toLowerCase() != 'wcmmode') {
                    btnParams.set(key, paramObj[key]);
                }
            }
        }
        if (!btnParams.has('referrerId')) {
            btnParams.set('referrerId', emailName);
        }
        if (btnParams.has('referrerId') && (btnParams.get('referrerId') != 'PortalDotCom@usbank.com')) {
            btnParams.delete('journeyoption');
        }

        return btnBaseString + '?' + decodeURIComponent(btnParams.toString());
    }

});
function formatNumber(n) {
    // format number 1000000 to 1,234,567
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function formatInterestRate(input, blur) {
    // appends $ to value, validates decimal side
    // and puts cursor back in right position.
    let input_val = input.val();
    if (input_val === "") { return; }

    // check for decimal
    if (input_val.indexOf(".") >= 0) {
        let decimal_pos = input_val.indexOf(".");
        let left_side = input_val.substring(0, decimal_pos);
        let right_side = input_val.substring(decimal_pos);
        left_side = formatNumber(left_side);
        right_side = formatNumber(right_side);
        if (blur === "blur") {
            right_side += "00";
        }
        right_side = right_side.substring(0, 2);
        input_val =  left_side + "." + right_side + "%";

    } else {
        // no decimal entered
        input_val = formatNumber(input_val);
        input_val = input_val + "%";
        if (blur === "blur") {
            input_val += ".00";
        }
    }
    input.val(input_val);    
}
function formatNumber(n) {
    // format number 1000000 to 1,234,567
    return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}


function formatCurrency(input, blur) {
    // appends $ to value, validates decimal side
    // and puts cursor back in right position.
    let input_val = input.val();
    if (input_val === "") { return; }

    // check for decimal
    if (input_val.indexOf(".") >= 0) {
        let decimal_pos = input_val.indexOf(".");
        let left_side = input_val.substring(0, decimal_pos);
        let right_side = input_val.substring(decimal_pos);
        left_side = formatNumber(left_side);
        right_side = formatNumber(right_side);
        if (blur === "blur") {
            right_side += "00";
        }
        right_side = right_side.substring(0, 2);
        input_val = "$" + left_side + "." + right_side;

    } else {
        // no decimal entered
        input_val = formatNumber(input_val);
        input_val = "$" + input_val;
        if (blur === "blur") {
            input_val += ".00";
        }
    }
    input.val(input_val);
}
$(document).ready(function () {

    let interestRateErrorFlag = false,
        lengthOfTermErrorFlag = false,
        amountToFinanceErrorFlag = false;

    $(".simpleGeneralFinancingCalculator .infoIcon").click(function () {
        $(".simpleGeneralFinancingCalculator .interestRateInfo").toggle();
    });
 // Calculate button Click function
    $('.simpleGeneralFinancingCalculator .calculate').on('click', function (e) {
        $(".simpleGeneralFinancingCalculator .interestRateInfo").hide();
        $('.simpleGeneralFinancingCalculator .interestRate-input').blur();
        $('.simpleGeneralFinancingCalculator .lengthOfTerm-input').blur();
        $('.simpleGeneralFinancingCalculator .finance-input').blur();
        e.preventDefault();
        pageValidation();
        monthlyPaymentCalc();
    }).on('mousedown', function(event){event.preventDefault(); });


    let monthlyPaymentCalc = () => {                    
       let loanAmount = $('.simpleGeneralFinancingCalculator .finance-input').val().replace(/[$,]/g, "");
       let lengthOfTerm = $('.simpleGeneralFinancingCalculator .lengthOfTerm-input').val();
       let interestRate =  $('.simpleGeneralFinancingCalculator .interestRate-input').val().replace(/%/g, "");
       
       let r = (interestRate / 100 ) / 12;
       let N = lengthOfTerm;
       let P = parseFloat(loanAmount);
       let monthlyPayment = (r * P) / (1 - Math.pow( (1 + r),(-N) ) );
       if(loanAmount!==''&&lengthOfTerm!==''&&interestRate!==''){
        $(".simpleGeneralFinancingCalculator .initialContent").hide();
        $(".simpleGeneralFinancingCalculator .paymentTablewrap").show();
        $(".simpleGeneralFinancingCalculator .tableContent").html('$'+monthlyPayment.toFixed(2));
        $('.simpleGeneralFinancingCalculator .resultsection').focus();
       }
    }
     
    $('.simpleGeneralFinancingCalculator .startApp').on('click', function (e) {
        let startMyappLink = $(this).attr("data-myAppButtonLink");
        if(startMyappLink){
             window.open(startMyappLink, "_self");
        }
    });
    
    $('.simpleGeneralFinancingCalculator .interestRate-input').on('focus', function (e) {
        $(this).attr("placeholder","");
    });    
    $('.simpleGeneralFinancingCalculator .interestRate-input').on('blur', function (e) {
    let interestRateElement = $(this);
    displayInterestRateError(interestRateElement);
    if(!interestRateErrorFlag){
            //it does not have any error formatting the interest rate
            formatInterestRate($(this));
        }
    });
  
    $(".simpleGeneralFinancingCalculator .infoIcon").on("keydown", function(event) {
        if(event.which == 13)
        $(".simpleGeneralFinancingCalculator .interestRateInfo").show();
    });
    $(".simpleGeneralFinancingCalculator .infoIcon").on("blur", function(e) {
        $(".simpleGeneralFinancingCalculator .interestRateInfo").hide();
    });
    let ValidateIntRateValue = (str) => {
        let x = parseFloat(str);
           let decimalSeparator=".";
           let val=""+x;
           return (val.indexOf(decimalSeparator)<val.length-3) ? false : true;
    };
let displayInterestRateError = (element) => {
    let interestRateVal =  $(element).val().replace(/[%a-zA-Z]/g, "");
    let intRateVal = ValidateIntRateValue(interestRateVal);
    let regex = /^[%0-9.-]+$/;
    let checkExceptNumber = !interestRateVal.match(regex);

      if (interestRateVal == "" || interestRateVal > 10 || !intRateVal || checkExceptNumber) {
        interestRateErrorFlag = true;
        let emptyAmountErrorMsg = $('.simpleGeneralFinancingCalculator .interestRateErrorMsgs').attr('data-emptyAmountErrorMsg');
        let interestRateErrormsg = $('.simpleGeneralFinancingCalculator .interestRateErrorMsgs').attr('data-interestRateErrorMsg');
        let charAmountErrorMsg = $('.simpleGeneralFinancingCalculator .interestRateErrorMsgs').attr('data-charAmountErrorMsg');
        let decimalInterestRateErrorMsg = $('.simpleGeneralFinancingCalculator .interestRateErrorMsgs').attr('data-decimalInterestRateErrorMsg');
  
		  
          //Changing the error msg based on error            
            $(element).parents('.filedWrap').find('.errorMsg').html('');
            if (interestRateVal == '') {
                $(element).parents('.filedWrap').find('.errorMsg').html(emptyAmountErrorMsg);
            }
            else if (!intRateVal) {
                $(element).parents('.filedWrap').find('.errorMsg').html(decimalInterestRateErrorMsg);
            }
           else if (interestRateVal > 10) {
               $(element).parents('.filedWrap').find('.errorMsg').html(interestRateErrormsg);
           } 
            else if (checkExceptNumber) {
                $(element).parents('.filedWrap').find('.errorMsg').html(charAmountErrorMsg);
            }

           $(element).val('');
           $(element).parents('.filedWrap').removeClass('error');
           $(element).parents('.filedWrap').addClass('error');
           $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'false');
           $(element).parents('.filedWrap').find('.errorMsg').insertAfter($(element).parents('.filedWrap').find('.errorIcon'));
           $(element).parents('.filedWrap').find('.interestRateInput').attr({ "aria-invalid": "true" });
           $(element).parents('.filedWrap').find('.label').addClass('hide');   
           $(element).attr("placeholder",$(element).parents('.filedWrap').find('.label').text().trim());        
        }

      else {
        interestRateErrorFlag = false;
        $(element).parents('.filedWrap').removeClass('error');
        $(element).parents('.filedWrap').removeClass('focus');
        $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'true');
        $(element).parents('.filedWrap').find('.interestRateInput').attr({ "aria-invalid": "false" });
        $(element).parents('.filedWrap').find('.label').removeClass('hide');
    }

}

$('.simpleGeneralFinancingCalculator .lengthOfTerm-input').on('focus', function () {
   $(this).attr("placeholder","");
});
$('.simpleGeneralFinancingCalculator .lengthOfTerm-input').on('blur', function (e) {
    let lengthOfTermElement = $(this);
    lengthOfTermError(lengthOfTermElement);
});

    let lengthOfTermError = (element) => {
    let lengthOfTermVal =  $('.simpleGeneralFinancingCalculator .lengthOfTerm-input').val();
    let regex = /^[0-9.-]+$/;
    let checkExceptNumber = !lengthOfTermVal.match(regex);
           
           if (lengthOfTermVal == "" || lengthOfTermVal < 12 || lengthOfTermVal > 72 || checkExceptNumber) {
           lengthOfTermErrorFlag = true;
           let emptyAmountErrorMsg = $('.simpleGeneralFinancingCalculator .lengthOfTermErrorMsgs').attr('data-emptyAmountErrorMsg');
           let termErrorMsg = $('.simpleGeneralFinancingCalculator .lengthOfTermErrorMsgs').attr('data-termErrorMsg');
           let charAmountErrorMsg = $('.simpleGeneralFinancingCalculator .lengthOfTermErrorMsgs').attr('data-charAmountErrorMsg');
            //Changing the error msg based on error            
            $(element).parents('.filedWrap').find('.errorMsg').html('');
            if (lengthOfTermVal == '') {
                $(element).parents('.filedWrap').find('.errorMsg').html(emptyAmountErrorMsg);
            }
            else if (lengthOfTermVal < 12) {
               $(element).parents('.filedWrap').find('.errorMsg').html(termErrorMsg);
             } 
             else if (lengthOfTermVal > 72) {
                $(element).parents('.filedWrap').find('.errorMsg').html(termErrorMsg);
              } 
            else if (checkExceptNumber) {
                $(element).parents('.filedWrap').find('.errorMsg').html(charAmountErrorMsg);
            }
           
           $(element).val('');
           $(element).parents('.filedWrap').removeClass('error');
           $(element).parents('.filedWrap').addClass('error');
           $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'false');
           $(element).parents('.filedWrap').find('.errorMsg').insertAfter($(element).parents('.filedWrap').find('.errorIcon'));
           $(element).parents('.filedWrap').find('.lengthOfTerm-input').attr({ "aria-invalid": "true" });
           $(element).parents('.filedWrap').find('.label').addClass('hide');
           $(element).attr("placeholder",$(element).parents('.filedWrap').find('.label').text().trim());
        } else {
        lengthOfTermErrorFlag = false;
        $(element).parents('.filedWrap').removeClass('error');
        $(element).parents('.filedWrap').removeClass('focus');
        $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'true');
        $(element).parents('.filedWrap').find('.lengthOfTerm-input').attr({ "aria-invalid": "false" });
        $(element).parents('.filedWrap').find('.label').removeClass('hide');
    }

}
$('.simpleGeneralFinancingCalculator .finance-input').on('focus', function (e) {
   $(this).attr("placeholder","");
});

$('.simpleGeneralFinancingCalculator .finance-input').on('blur', function (e) {
    let amountToFinanceElement = $(this);
    amountToFinanceError(amountToFinanceElement);
    if(!amountToFinanceErrorFlag){
            //it does not have any error formatting the currency
            formatCurrency($(this));
        }
});

           let amountToFinanceError = (element) => {
           let amountToFinanceVal = ($(element).val()).replace(/[$,]/g, "");
           let regex = /^[0-9.-]+$/;
           let checkExceptNumber = !amountToFinanceVal.match(regex);
           amountToFinanceVal = Number(amountToFinanceVal.replace(/[^0-9.-]+/g, ""));

           if (amountToFinanceVal == 0 || checkExceptNumber || amountToFinanceVal < 5000 || amountToFinanceVal > 9999999 ) {
           amountToFinanceErrorFlag = true;
           let emptyAmountErrorMsg = $('.simpleGeneralFinancingCalculator .financeErrorMsgs').attr('data-emptyAmountErrorMsg');
           let minFinanceErrorMsg = $('.simpleGeneralFinancingCalculator .financeErrorMsgs').attr('data-minFinanceErrorMsg');
           let maxFinanceErrorMsg = $('.simpleGeneralFinancingCalculator .financeErrorMsgs').attr('data-maxFinanceErrorMsg');
           let charAmountErrorMsg = $('.simpleGeneralFinancingCalculator .financeErrorMsgs').attr('data-charAmountErrorMsg');
             //Changing the error msg based on error            
             $(element).parents('.filedWrap').find('.errorMsg').html('');
             if ($(element).val() == '') {
                 $(element).parents('.filedWrap').find('.errorMsg').html(emptyAmountErrorMsg);
             }
             else if (amountToFinanceVal < 5000) {
                $(element).parents('.filedWrap').find('.errorMsg').html(minFinanceErrorMsg);
            } 
            else if (amountToFinanceVal > 9999999) {
                $(element).parents('.filedWrap').find('.errorMsg').html(maxFinanceErrorMsg);
            } 
             else if (checkExceptNumber) {
                 $(element).parents('.filedWrap').find('.errorMsg').html(charAmountErrorMsg);
             }
           $(element).val('');
           $(element).parents('.filedWrap').removeClass('error');
           $(element).parents('.filedWrap').addClass('error');
           $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'false');
           $(element).parents('.filedWrap').find('.errorMsg').insertAfter($(element).parents('.filedWrap').find('.errorIcon'));
           $(element).parents('.filedWrap').find('.finance-input').attr({ "aria-invalid": "true" });
           $(element).parents('.filedWrap').find('.label').addClass('hide');
           $(element).attr("placeholder",$(element).parents('.filedWrap').find('.label').text().trim());
        }

      else {
        amountToFinanceErrorFlag = false;
        $(element).parents('.filedWrap').removeClass('error');
        $(element).parents('.filedWrap').removeClass('focus');
        $(element).parents('.filedWrap').find('.errorMsg').attr('aria-hidden', 'true');
        $(element).parents('.filedWrap').find('.finance-input').attr({ "aria-invalid": "false" });
        $(element).parents('.filedWrap').find('.label').removeClass('hide');
    }

}
    

    let pageValidation = () => {
    let errorContainer = $('.simpleGeneralFinancingCalculator .pageLevelError');
    if (interestRateErrorFlag || lengthOfTermErrorFlag || amountToFinanceErrorFlag) {
        errorContainer.removeClass('error');
        errorContainer.attr('tabindex', '0').addClass('error').focus();
    } else {
        errorContainer.attr('tabindex', '-1').removeClass('error');
    }

if (interestRateErrorFlag) {
        errorContainer.find('.interstRateError').removeClass('hide');
    } else {
        errorContainer.find('.interstRateError').removeClass('hide');
        errorContainer.find('.interstRateError').addClass('hide');
    }

    if (lengthOfTermErrorFlag) {
        errorContainer.find('.lengthOfTermError').removeClass('hide');
    } else {
        errorContainer.find('.lengthOfTermError').removeClass('hide');
        errorContainer.find('.lengthOfTermError').addClass('hide');
    }

    if (amountToFinanceErrorFlag) {
        errorContainer.find('.financeError').removeClass('hide');
    } else {
        errorContainer.find('.financeError').removeClass('hide');
        errorContainer.find('.financeError').addClass('hide');
    }

};

$('.simpleGeneralFinancingCalculator .interstRateError a').click(function (event) {
    event.preventDefault();
    $('.simpleGeneralFinancingCalculator .interestRate-input').focus();
});
$('.simpleGeneralFinancingCalculator .lengthOfTermError a').click(function (event) {
    event.preventDefault();
    $('.simpleGeneralFinancingCalculator .lengthOfTerm-input').focus();
});
$('.simpleGeneralFinancingCalculator .financeError a').click(function (event) {
    event.preventDefault();
    $('.simpleGeneralFinancingCalculator .finance-input').focus();
});
$(".simpleGeneralFinancingCalculator .infoIcon").click(function(){
    $(".simpleGeneralFinancingCalculator .interestRateInfo").show();
    $(document.body).click(function(e) {
        if ($(e.target).closest(".simpleGeneralFinancingCalculator .interestRateInfo").length == 0)
            $(".simpleGeneralFinancingCalculator .interestRateInfo").hide();     
    });
    return false;   
});
});

(function () {
	"use strict";

	function DOMContentLoaded() {
		var gridTable = document.querySelector(".benefits-grid");
		if (gridTable) {
			var dropdown_btns = usbUtils.nodeListArray(gridTable.querySelectorAll(".dropdown")),
				dropdown_items = usbUtils.nodeListArray(gridTable.querySelectorAll(".dropdown-list-item")),
				tableBody = usbUtils.nodeListArray(gridTable.querySelectorAll(".rowBody")),
				rowHeader = usbUtils.nodeListArray(gridTable.querySelectorAll(".rowHeader")),
				prev_expanded_dd;

			const isMobile = function () {
				return window.outerWidth < 1056;
			};
			const isIOS = function () {
				return [
					'iPad Simulator',
					'iPhone Simulator',
					'iPod Simulator',
					'iPad',
					'iPhone',
					'iPod'
				].includes(navigator.platform)
					// iPad on iOS 13 detection
					||
					(navigator.userAgent.includes("Mac") && "ontouchend" in document)
			};

			const table = {
				updateRowHeader: function (colspan) {
					rowHeader.forEach(function (row) {
						row.firstElementChild.setAttribute("aria-colspan", colspan);
					});
				},
				updateBody: function (dd, content) {
					tableBody.forEach(function (row) {
						let currColumn = row.querySelector(".column-" + dd + " .rowContent"),
							selectedContent = row.querySelector(".rowContent[data-content=" + content + "]");
						currColumn.innerHTML = selectedContent.innerHTML;

					});
				},
				update: function (dd, content, title) {
					dropdown.update_btn(dd, title);
					dropdown.update_items(dd, content);
					table.updateBody(dd, content);
				},
				init: function () {
					table.update(1, "benefits_1", gridTable.querySelector('.dropdown-list-item[data-content="benefits_1"] .benefits-title'));
					table.update(2, "benefits_2", gridTable.querySelector('.dropdown-list-item[data-content="benefits_2"] .benefits-title'));
					table.updateRowHeader(isMobile() ? "2" : "3");
				}
			};

			const dropdown = {
				update_btn: function (dd, title) {
					let dd_btns = usbUtils.nodeListArray(gridTable.querySelectorAll(".dropdown[data-dropdown='" + dd + "']"));
					dd_btns.forEach(function (dd_btn) {
						if (!isIOS()) dd_btn.setAttribute("aria-label", title.textContent.replace(/\s+/g, ' ').trim());
						dd_btn.querySelector(".benefits-title").innerHTML = title.innerHTML;
					});
				},
				update_items: function (dd, currContent) {
					let prev_list = usbUtils.nodeListArray(gridTable.querySelectorAll(".dropdown-list .selected-item-" + dd));
					prev_list.forEach(function (item) {
						item.classList.remove("selected-item-" + dd);
					});
					let curr_list = usbUtils.nodeListArray(gridTable.querySelectorAll(".dropdown-list [data-content=" + currContent + "]"));
					curr_list.forEach(function (item) {
						item.classList.add("selected-item-" + dd);
					});
				},
				expand: function (dd_btn) {
					dropdown.collapse(prev_expanded_dd);
					dd_btn.setAttribute("aria-expanded", "true");
					dd_btn.nextElementSibling.setAttribute("tabindex", "-1");
					prev_expanded_dd = dd_btn;
				},
				collapse: function (dd_btn) {
					if (dd_btn) {
						dd_btn.setAttribute("aria-expanded", "false");
						dd_btn.nextElementSibling.removeAttribute("tabindex");
					}
				}
			};

			const events = {
				handleDropdown_Btn: function (event) {
					if (event.currentTarget.getAttribute("aria-expanded") == "false") {
						dropdown.expand(event.currentTarget);
					}
					else {
						dropdown.collapse(event.currentTarget);
					}
				},
				handleDropdown_Items: function (event) {
					event.preventDefault();
					let item = event.currentTarget,
						list = item.closest(".dropdown-list"),
						dd_btn = list.previousElementSibling,
						dd = item.getAttribute("data-dropdown"),
						content = item.getAttribute("data-content"),
						title = item.querySelector(".benefits-title");
					dropdown.collapse(dd_btn);
					table.update(dd, content, title);
					dd_btn.focus();
					setTimeout(function () { !dd_btn.isSameNode(document.activeElement) && dd_btn.focus(); }, 200);
				},
				window: {
					click: function (event) {
						if (!event.target.classList.contains("dropdown-container") && !event.target.closest(".dropdown-container")) {
							dropdown.collapse(prev_expanded_dd);
						}
					}
				}
			};

			(function initialize() {
				dropdown_btns.forEach(function (dd) {
					if (isIOS()) {
						dd.removeAttribute("aria-label");
					}
					dd.addEventListener("click", events.handleDropdown_Btn);
				});
				dropdown_items.forEach(function (dd) {
					dd.addEventListener("click", events.handleDropdown_Items);
				});
				window.addEventListener("click", events.window.click);
				window.onpageshow = function (event) {
					if (event.persisted) {
						window.location.reload();
					}
				};
				table.init();
			})();
		}
	}
	document.addEventListener("DOMContentLoaded", DOMContentLoaded);
})();


(function (document) {
    "use strict";

    const CFOComponent = {
        load: function (json, dropdownList, container) {
            let cfoContainer = document.querySelectorAll(".cfo-component");
            cfoContainer.forEach(function (cfo) {
                let barType = cfo.getAttribute("data-barType");
                let disableAnimation = cfo.getAttribute("data-disableAnimation");
                let max = 0;
                let maxBarLimit = 0;
                switch (barType) {
                    case "progressBar":
                        CFOComponent.loadProgressBar(cfo, max, maxBarLimit, disableAnimation);
                        break;
                    case "colorProgressBar":
                        CFOComponent.loadProgressBar(cfo, max, maxBarLimit, disableAnimation);
                        break;
                    case "comparisonBar":
                        CFOComponent.loadComparisonBar(cfo, max, maxBarLimit, disableAnimation);
                        break;
                }

            });
        },
        loadProgressBar: function (cfo, max, maxBarLimit, disableAnimation) {
            let allBars = cfo.querySelectorAll(".chart-bar-percentage");
            let charLimit = cfo.querySelectorAll(".chart-bar-text");
            max = CFOComponent.setMax(allBars, max);
            maxBarLimit = CFOComponent.setMaxBarLimit(charLimit, maxBarLimit);
            let rigtMarginElemColor = cfo.querySelector(".rightPad");
            if (rigtMarginElemColor) {
                rigtMarginElemColor.style.marginRight = (maxBarLimit * 0.55) + 'rem';
            }
            let singleChartNode = cfo.querySelectorAll(".singleChartNode");
            singleChartNode.forEach(function (target) {
                let bar = target.querySelector(".progressPercentage");
                CFOComponent.displayBar(bar, target, disableAnimation, "chart-bar-text", max, 40);
            });
        },
        loadComparisonBar: function (cfo, max, maxBarLimit, disableAnimation) {
            let allBars = cfo.querySelectorAll(".data-progress-text");
            let charLimit = cfo.querySelectorAll(".data-bar-text");
            var result = cfo.querySelectorAll(".animated-progress");
            max = CFOComponent.setMax(allBars, max);
            maxBarLimit = CFOComponent.setMaxBarLimit(charLimit, maxBarLimit);
            result.forEach(function (target) {
                let bar = target.querySelector(".progress-bar");
                let nextYr = target.querySelector('.nextYear');
                let year2 = nextYr ? nextYr.innerHTML : "";
                if (nextYr && (!(year2) || year2 == 0)) nextYr.parentElement.style.display = 'none';
                CFOComponent.displayBar(bar, target, disableAnimation, "data-bar-text", max, 20)
            });

        },
        setMax: function (divs, max) {
            divs.forEach(function (bar) {
                let curr = parseInt(bar.innerHTML);
                if (curr > max) {
                    max = curr;
                }
            });
            return max;
        },
        setMaxBarLimit: function (maxDivs, maxBarLimit) {
            maxDivs.forEach(function (bar) {
                let curr = (bar.innerHTML).length;
                if (curr > maxBarLimit) {
                    maxBarLimit = curr;
                }
            });
            return maxBarLimit;
        },
        displayBar: function (bar, target, disableAnimation, selector, max, seconds) {
            let offset = 100 / max;
            let percentVal = target.querySelector(".data-progress-text")?.innerHTML || target.querySelector(".chart-bar-percentage")?.innerHTML;
            var rightLabel = target.querySelector(".chartPercentage");
            let displayText = (target.querySelector("." + selector)?.innerHTML)?.slice(0, 15);
            if (disableAnimation) {
                bar.style.width = (percentVal * offset) + "%";
                let extractedNum = parseInt(displayText?.replace(/^\D+|\D+$/g, ''))
                rightLabel.innerHTML = isNaN(extractedNum) ? `${percentVal}%` : displayText.replaceAll(" ", "&nbsp;");
            } else {
                CFOComponent.displayAnimatedBar(bar, displayText, rightLabel, percentVal, offset, seconds);
            }
        },
        displayAnimatedBar: function (bar, displayText, rightLabel, percentVal, offset, seconds) {
            let extractedNum = parseInt(displayText?.replace(/^\D+|\D+$/g, '')); // Numbers extracted from strings
            let stringOnly = displayText?.replace(/[0-9]+/i, ''); //string remaining after removing Numbers from text
            let numIndex = displayText?.search(/\d/);
            let multiplier = extractedNum / percentVal;
            let i = 0;
            if (i == 0) {
                i = 1;
                let width = 1;
                let intervals = setInterval(frame, seconds);

                function frame() {
                    if (width >= percentVal) {
                        clearInterval(intervals);
                        i = 0;
                    } else {
                        width++;
                        bar.style.width = (width * offset) + "%";
                        let valToDisplay = CFOComponent.concatText(numIndex, 0, parseInt(width * multiplier), stringOnly);
                        valToDisplay = isNaN(extractedNum) ? `${width}%` : valToDisplay.replaceAll(" ", "&nbsp;");
                        rightLabel.innerHTML = valToDisplay;
                    }

                }
            }
        },
        concatText: function (idx, rem, str, fullStr) {
            return fullStr.slice(0, idx) + str + fullStr.slice(idx + Math.abs(rem));
        }
    };


    document.addEventListener("DOMContentLoaded", CFOComponent.load);
})(document);



(function(){
  'use strict';

    const bgContainer = document.querySelectorAll(".bg-component");

    function initBgcontainer(bgContainer){
      for(let elem of bgContainer){
        addClassOnbgContainer(elem.children[0].children,elem);
      }
    };
    function addClassOnbgContainer(elems,itemGap){
      for(let elem of elems){
        elem.classList.add(itemGap.dataset.gap);
      }
    }
    initBgcontainer(bgContainer);

})();
let selectElement = document.querySelector('.select-wrapper'); //select field wrapper element
let pulseDot = document.querySelector('.dot-container'); // blinking circle element
let bubbleCloseBtn = document.querySelector('.closeBtn'); // blinking circle element
const regionsItems = document.querySelectorAll(".regionData-item"); //getting all regions in a variable
let span = document.getElementsByClassName("close")[0]; //getting span to close the modal
let regionModal = document.getElementById("myModal"); //Modal element
let currentIndex = 0; // index of modal page
let map = document.getElementById("map-svg");
if (regionModal) {
  const longFunc = {

    addEventToClass:
      (elementName, querySelectorName, classToAdd, eventName, doc) => {
        elementName.addEventListener(eventName, function () {
          if (this.querySelector(querySelectorName).classList.contains(classToAdd)) {
            document.querySelector(querySelectorName).classList.remove(classToAdd);
          } else {
            doc = doc ? document : this;
            doc.querySelector(querySelectorName).classList.add(classToAdd);
          }
        }, true)
      },
    removeEventToClass:
      (elementName, querySelectorName, classToRemove, eventName, doc) => {
        elementName.addEventListener(eventName, function () {
          document.querySelector(querySelectorName).classList.remove(classToRemove);
        }, true)
      },
    getIndex:
      (val) => {
        let idx;
        switch (val) {
          case "west":
            idx = 5;
            break;
          case "midwest":
            idx = 3;
            break;
          case "mid-atlantic":
            idx = 1;
            break;
          case "new-england":
            idx = 0;
            break;
          case "southwest":
            idx = 4;
            break;
          case "south":
            idx = 2;
            break;
        }
        return idx;
      },
    showRegions:
      (index) => {
        regionModal.style.display = "block";
        // Hide all  items
        regionsItems.forEach((item) => {
          item.style.display = "none";
        });
        // Show the at the specified index
        regionsItems[index].style.display = "block";
      },
    changeRegion:
      (operator) => {
        currentIndex = (operator == "plus" ? (currentIndex + 1) : (currentIndex - 1 + regionsItems.length)) % regionsItems.length;
        longFunc.showRegions(currentIndex);
      }
  }

  longFunc.addEventToClass(selectElement, ".select", "open", "click");// function to open select box

  longFunc.removeEventToClass(selectElement, ".select", "open", "blur"); // function to close select box

  longFunc.addEventToClass(pulseDot, ".textBubble", "open", "click");// function to open dialog box
  longFunc.removeEventToClass(bubbleCloseBtn, ".textBubble", "open", "click", true); // function to close dialog box

  //function to select options starts here
  for (const option of document.querySelectorAll(".custom-option")) {
    option.addEventListener('click', function () {
      currentIndex = longFunc.getIndex(this.getAttribute('data-value'));
      longFunc.showRegions(currentIndex);
    })
  }
  //function to select options ends here

  //function to take action when clicked on map starts here
  document.querySelector('.map-wrapper div').addEventListener("click", function (e) {
    if (e.target.parentNode.tagName == 'svg') {
      currentIndex = longFunc.getIndex(e.target.parentNode.id); //get index of region clicked on
      longFunc.showRegions(currentIndex); //show region
    }
    else if (e.target.parentNode.tagName == 'g') {
      currentIndex = longFunc.getIndex(e.target.parentNode.parentNode.id); //get index of region clicked on
      longFunc.showRegions(currentIndex); //show region
    }
  });
  //function to take action when clicked on map ends here

  document.getElementById("nextBtn").addEventListener("click", () => longFunc.changeRegion("plus")); // change modal to next region
  document.getElementById("prevBtn").addEventListener("click", () => longFunc.changeRegion("minus")); // change modal to previous region

  // click events to close moda starts here
  window.onclick = (event) => {
    if (event.target == regionModal) {
      modal.style.display = "none";
    }
  };
  span.onclick = () => regionModal.style.display = "none";
  // click events to close moda starts here

  //self invoked function for comparison bar starts here
}
(function (document) {
  "use strict";
  function loadComparisonBar() {
    let singleChartNode = document.querySelectorAll(".progressSub-div");
    singleChartNode.forEach(function (elemt) {
      let chartPercentageVal = elemt.querySelector(
        ".chart-bar-percentage"
      ).innerHTML;
      let displayVal = elemt.querySelector(".chartPercentage");
      let elem = elemt.querySelector(".progressPercentage");
      elem.style.width = chartPercentageVal + "%";
      displayVal.innerHTML = chartPercentageVal + "%";
    });
  }
  document.addEventListener("DOMContentLoaded", loadComparisonBar());
})(document);
//self invoked function for comparison bar ends here
var carouselV2 = (function () {

   let load = function () {
        document.querySelectorAll(".takeOverParsysContainer").forEach(function (item) {
            item.querySelector(".aem-Grid").classList.add("carousel-slides");
        });
        updateSlideCount();
        const tnsCarousel = document.querySelectorAll('.multiCarousel.preview');
        tnsCarousel.forEach(function (element, index) {
            let carouselType = element.getAttribute("data-carousel-type");
            let slider = tns({
                "slideBy": 1,
                "speed": 400,
                "startIndex": 0,
                container: element.querySelector('.carousel-slides'),
                prevButton: element.querySelector('.previous'),
                nextButton: element.querySelector('.next'),
                nav: true,
                navPosition: "bottom",
                mouseDrag: true,
                useLocalStorage: false,
                "responsive": carouselType == 'threeCardsCarousel' ? {
                    0: {
                        items: 1
                    },
                    672: {
                        items: 2
                    },
                    1056: {
                        items: 3
                    }
                } : {
                    0: {
                        items: 1
                    }
                },
                "loop": true
            });
            updateCarouselLive(slider.getInfo());
            slider.events.on('indexChanged', updateCarouselLive);
            element.classList.remove("hide");
        });
        document.querySelectorAll(".control-button").forEach(function (button) {
            button.setAttribute("tabindex", "0");
        });
   };
   let updateCarouselLive =  function (info) {
        let sliderLive = info.container.closest(".carousel-container").querySelector(".slideLive"),
            visibleSlideList = " ",
            count = 0;
        info.container.querySelectorAll(".tns-slide-active").forEach(function (slide, index) {
            visibleSlideList += ((index > 0) ? ", " : " ") + slide.getAttribute("data-slideCount");
            count++;
        });
        if (count == info.slideCount) {
            sliderLive.innerHTML = "";
            sliderLive.setAttribute("aria-hidden", "true");
        }
        else {
            sliderLive.innerHTML = "Showing slide " + visibleSlideList + " of " + info.slideCount + " slides";
            sliderLive.setAttribute("aria-live", "polite");
            sliderLive.setAttribute("aria-atomic", "true");
        }
        updateLinks(info);
    };
   let updateSlideCount =  function () {
        document.querySelectorAll(".carousel-slides").forEach(function (slide) {
            Array.from(slide.children).forEach(function (child, index) {
                let spanNode = document.createElement("span");
                spanNode.classList.add("slideCount", "sr-only");
                let textEle = document.createTextNode("slide " + (index + 1));
                spanNode.appendChild(textEle);
                child.insertBefore(spanNode, child.children[0]);
                child.setAttribute("data-slideCount", (index + 1));
            });
        });
    };
   let updateLinks = function (slides) {
        Array.from(slides.slideItems).forEach(function (item, index) {
            if (item.classList.contains('tns-slide-active'))
                Array.from(item.getElementsByTagName("a")).forEach(function (link, item) {
                    link.removeAttribute("tabindex");
                });
            else
                Array.from(item.getElementsByTagName("a")).forEach(function (link, item) {
                    link.setAttribute("tabindex", "-1");
                });
        });
        slides.navContainer.setAttribute("aria-hidden","true");
        Array.from(slides.navItems).forEach(function (navButton, index) {
            navButton.setAttribute("tabindex", "-1");
            navButton.setAttribute("aria-hidden", "true");
        });
    };
    return {
        load:load
    };
})();
(function (window, document) {
    "use strict";
   if (window && document) {
        document.addEventListener = document.addEventListener || document.attachEvent;
        document.addEventListener("DOMContentLoaded", carouselV2.load, {
            'passive': false
        });
    }
})(window, document);
