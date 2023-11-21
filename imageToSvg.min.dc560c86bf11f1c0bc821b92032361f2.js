/*
 * Replace all SVG images with inline SVG
 * Courtesy: Drew Baker
 * Refactored By: Todd Magnusson 09/27/19 => 02/03/20 => 10/19/20
 */
;(function imagesToSVG() {
	// Helper Functions: DOM Manipulation
  function referenceFoundFor(element) { return element !== null && typeof element !== 'undefined'; }
  function referenceFoundForAll(elements) { return referenceFoundFor(elements) && elements.length > 0; }
  function getArrayFrom(element) { return referenceFoundFor(Array.from) ? Array.from(element) : Array.prototype.slice.call(element); }
  function removeElement(element) {
    if (referenceFoundFor(element.remove)) return element.remove(); // Newer browsers
    referenceFoundFor(element.parentElement) && element.parentElement.removeChild(element) && (element = null); // IE11 and below
  }
  function replaceElement(element, replacement) {
    if (referenceFoundFor(element.replaceWith)) return element.replaceWith(replacement); // Directly replace the <img> with an <svg> tag
    element.insertAdjacentElement('beforebegin', replacement); // Copy the <svg> right before the <img> tag
    removeElement(element); // Then remove the <img> tag.
  }
  function requestAnimationFrameIfPresent(fn) { return typeof fn === 'function' && (referenceFoundFor(requestAnimationFrame) ? requestAnimationFrame(fn) : fn()); }
  // Component or feature being loaded after DOM Content is loaded
  function DOMContentLoaded() {
    // Convert the <img> tags to inline <svg> after loading them in an AJAX call.
    (function convertImagesToSVG() {
      var selectors = 'img.svgImage', // Ideally we'd use 'img[src$=".svg"], img[data-src$=".svg"]', but this will break parts of the site at the current moment.
          images = getArrayFrom(document.querySelectorAll(selectors)),
          parser = new DOMParser(); // Handles conversion of would-be HTML string templates to HTML Node/Elements
      if (referenceFoundForAll(images)) {
        images.forEach(function(image) {
          var src = ((image.hasAttribute('data-src') || image.hasAttribute('src')) && (image.getAttribute('data-src') || image.getAttribute('src'))),
              attributes = { classes: null, id: null, label: null, style: null };
              fails = /(^false$)|(^null$)|(^true$)|(^undefined$)/gi,
              classlist = ['class', 'data-class', ]
              ids = ['id', 'data-id'],
              labels = ['alt', 'aria-label', 'data-alt', 'data-aria-label', 'data-title', 'title'],
              styles = ['data-style', 'style'];
          classlist.forEach(function(attribute) {
            if (!image.hasAttribute(attribute) || fails.test(image.getAttribute(attribute))) return image.removeAttribute(attribute);
            attributes.classes = image.getAttribute(attribute).trim();
          });
          ids.forEach(function(attribute) {
            if (!image.hasAttribute(attribute) || fails.test(image.getAttribute(attribute))) return image.removeAttribute(attribute);
            attribute.id = image.getAttribute(attribute);
          });
          labels.forEach(function(attribute) {
            if (!image.hasAttribute(attribute) || fails.test(image.getAttribute(attribute))) return image.removeAttribute(attribute);
            attributes.label = image.getAttribute(attribute).trim();
          });
          styles.forEach(function(attribute) {
            if (!image.hasAttribute(attribute) || fails.test(image.getAttribute(attribute))) return image.removeAttribute(attribute);
            attributes.style = image.getAttribute(attribute);
          });
          if (!referenceFoundFor(attributes.label)) image.setAttribute('aria-hidden', 'true'); // Before <svg> conversion, if no label is found, slap an aria-hidden on it so it doesn't read the src as the title.
          request = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP.3.0'); // IE9+ with IE8 ActiveXObject fallback, doubt we'll use the latter, but lets keep it there.
          request.open('GET', src, true);
          request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
          request.addEventListener('load', function() {
            var response, svg, descElement, titleElement, groupedElements;
            if (this.status >= 200 && this.status < 400) {
              response = this.response;
              svg = parser.parseFromString(response, 'image/svg+xml').querySelector('svg');
              if (referenceFoundFor(svg)) {
                descElement = svg.querySelector('desc');
                titleElement = svg.querySelector('title');
                groupedElements = getArrayFrom(svg.querySelectorAll('g'));
                if (referenceFoundFor(attributes.label) && attributes.label !== '') {
                  svg.removeAttributeNS(null, 'aria-hidden'); // Remove the svg from being hidden from screenreaders
                  svg.setAttributeNS(null, 'aria-label', attributes.label); // Add an aria-label (equivalent of an alt tag on <img>)
                  svg.setAttributeNS(null, 'role', 'img'); // img (or graphic-symbol once we drop IE11) => https://www.w3.org/TR/graphics-aria-1.0/
                } else {
                  svg.removeAttributeNS(null, 'aria-label'); // If there is no label, remove any existing label tag
                  svg.removeAttributeNS(null, 'role'); // If there is no label, then it's not an image or graphics-symbol
                  svg.setAttributeNS(null, 'aria-hidden', 'true'); // Set the svg to be hidden from screenreaders
                }
                svg.setAttributeNS(null, 'focusable', 'false'); // Stops IE from allowing focus on the SVG inside of interactive elements
                svg.removeAttributeNS(null, 'data-name'); // Illustrator/Sketch data attribute, can be removed.
                svg.removeAttributeNS(null, 'xmlns:a'); // Deprecated SVG xmlns value
                referenceFoundFor(attributes.classes) ? svg.setAttributeNS(null, 'class', attributes.classes + ' js-inline-svg-loaded') : svg.removeAttributeNS(null, 'class'); // Attach classes plus completion via 'js-inline-svg-loaded'
                referenceFoundFor(attributes.id) ? svg.setAttributeNS(null, 'id', attributes.id) : svg.removeAttributeNS(null, 'id'); // Allow id's on the top level <svg> in the case they are being referenced.
                referenceFoundFor(attributes.style) ? svg.setAttributeNS(null, 'style', attributes.style) : svg.removeAttributeNS(null, 'style');
                referenceFoundFor(descElement) && removeElement(descElement); // Remove <desc> attribute from <svg> XML, usually generated by Illustrator/Sketch
                referenceFoundFor(titleElement) && removeElement(titleElement); // Remove <title> attribute from <svg> XML, usually generated by Illustrator/Sketch
                referenceFoundForAll(groupedElements) && groupedElements.forEach(function(groupedElement) { return groupedElement.removeAttribute('id'); }); // Remove all id attributes on <g> for WCAG 4.1.1
                requestAnimationFrameIfPresent(function() { // Cut down on any visual delay for the image conversion using requestAnimationFrame where present
                  replaceElement(image, svg);
                });
              }
            }
          }, { 'passive': true } || false);
          request.addEventListener('error', function(error) {
            console.warn(src, '\n' + 'It looks like we encountered an error trying to load the image: ' + '\n' + 'The request returned: ' + error);
          }, { 'passive': true } || false);
          request.send();
        });
      }
    })();
  }

  function attributeAssigningToSVG() {
    var svgIconList = usbUtils.nodeListArray(document.querySelectorAll('svg.svgImageIcon'));
    if(svgIconList){
      svgIconList.forEach(function(svgIcon) {
        svgIcon.classList.add('svgImage');
        svgIcon.classList.add('js-inline-svg-loaded');
        svgIcon.removeAttribute('id');
        svgIcon.removeAttribute('data-name');
        svgIcon.removeAttribute('xmlns:a');
        let label = svgIcon.parentElement.hasAttribute('data-value-ariaLabelForSvg') ? svgIcon.parentElement.getAttribute('data-value-ariaLabelForSvg') : "" ;
        if (label && label !== "") {
          svgIcon.setAttribute('aria-label', label);
          svgIcon.setAttribute('role','img');
        } else {
          svgIcon.setAttribute('aria-hidden', true);
        }
        svgIcon.setAttribute('focusable','false');
        let title = svgIcon.querySelector('title');
        let desc = svgIcon.querySelector('desc');
        if (referenceFoundFor(title)) title.remove();
        if (referenceFoundFor(desc)) desc.remove();
      });
    }
  }

  if (window && document) {
    document.addEventListener = document.addEventListener || document.attachEvent;
    document.addEventListener('DOMContentLoaded', DOMContentLoaded, { 'passive': false } || false);
    document.addEventListener('DOMContentLoaded', attributeAssigningToSVG, { 'passive': false } || false);
  }
})();