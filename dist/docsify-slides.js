(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = "/* Reduce spacing on sides, o.g. 800px */\n.markdown-section {\n\tmax-width: 90%;\n}\n\n/* Reduce spacing on top, o.g. 60px */\n.content {\n\tpadding-top: 0;\n}\n\n/* Make Pagination Bottom Sticky */\n@media screen and (min-width: 768px) {\n\t.pagination-item {\n\t\tmargin-top: 0;\n\t}\n\n\t.markdown-section {\n\t\tpadding-bottom: 5em;\n\t}\n\n\t.docsify-pagination-container {\n\t\tposition: fixed;\n\t\tbottom: 0;\n\t\tleft: 0;\n\t\tright: 0;\n\t\theight: 4em;\n\t\tbackground-color: #ffffff;\n\t\tpadding-left: 40px;\n\t\tpadding-right: 10px;\n\t\tmargin-bottom: 0px;\n\t}\n\tbody .pagination-item--previous {\n\t\ttransform: translateX(300px);\n\t\ttransition: transform .25s ease-out;\n\t}\n\tbody.close .pagination-item--previous {\n\t\ttransform: translateX(0px);\n\t\ttransition: transform .25s ease-out;\n\t}\n}\n\n/* Left and Right Slide */\n.slide-col {\n\tfloat: left;\n\tpadding: 10px;\n\tpadding-bottom: 4em;\n}\n\n@media screen and (max-width: 768px) {\n\t.slide-col {\n\t\twidth: 100% !important;\n\t}\n}\n\n\n/* Fix `close` style on mobile */\n@media screen and (max-width: 768px) {\n\t/* Fix behavior for when sidebar should be open */\n\tbody .sidebar {\n\t\ttransform: translateX(300px);\n\t}\n\tbody .content {\n\t\ttransform: translateX(300px);\n\t}\n\t.sidebar-toggle {\n\t\tbackground-color: rgba(255,255,255,0.8);\n\t\ttransition: 1s background-color;\n\t\twidth: 284px;\n\t\tpadding: 10px;\n\t}\n\n\t/* Fix behavior for when sidebar should be closed */\n\tbody.close .sidebar {\n\t\ttransform: translateX(0);\n\t}\n\tbody.close .content {\n\t\ttransform: translateX(0px);\n\t}\n\tbody.close .sidebar-toggle {\n\t\tbackground-color: transparent;\n\t\twidth: auto;\n\t\tpadding: 30px 30px 10px 10px;\n\t}\n}\n";

styleInject(css_248z);

document.onkeydown = arrowChecker;
var nextLink = document.location.href;
var previousLink = document.location.href;

function arrowChecker(e) {
  e = e || window.event;
  if (e.keyCode == '37') {
    //left
    document.location.href = previousLink;
  } else if (e.keyCode == '39') {
    //right
    document.location.href = nextLink;
  }
}

function slidePlugin(hook, vm) {

  // multiple column-layout util functions
  function found_slide_break(str) {
    return str.match(/<!-- slide:break-?(\d+)? -->/g);
  }

  // Add left and right side of slide
  hook.afterEach(function (html) {
    // multiple column-layout
    if (html.includes('<!-- slide:start')) {

      // slide:break text
      var matches = found_slide_break(html);
      if (!matches) return;

      // slide:break-N numbers
      var widths = matches.map(slide_break => {
        var number = slide_break.match(/(\d+)/g);
        return number == null ? null : number[0];
      });

      if (!widths) return;

      // process page: slide:start, slide:break-N?, slide:end
      for (let w of widths) {

        let regex = "";
        let regex_pattern = "";

        if (w == null) {
          w = 50;
          regex_pattern = `<!-- slide:break -->`;
        } else {
          regex_pattern = `<!-- slide:break-${w} -->`;
        }

        regex = /<!-- slide:start -->/;
        html = html.replace(regex, `<div class='slide-container'><div class='slide-col slide-left' style='width: ${w}%'>`);

        regex = new RegExp(regex_pattern, "");
        html = html.replace(regex, `</div><div class='slide-col slide-right' style='width: ${100 - w}%'>`);

        regex = /<!-- slide:end -->/;
        html = html.replace(regex, "</div><div style=\"clear: left;\"/></div>");
      }
    }

    // one column-layout
    else if (html.includes('<!-- slide:break')) {
        var width = 50;
        var matches = html.match(/<!-- slide:break-\d+ -->/g);
        if (matches) {
          width = matches[0].match(/(\d+)/g)[0];
        }
        html = "<div class='slide-container'>" + "<div class='slide-col slide-left' style='width: " + width + "%'>" + html.replace(/<!-- slide:break-?(\d+)? -->/g, "</div><div class='slide-col slide-right' style='width: " + (100 - width) + "%'>") + '</div></div>';
      }

    return html;
  });

  // Make arrowidth keys go forward and backward
  hook.doneEach(function () {
    var next = document.getElementsByClassName('pagination-item pagination-item--next');
    if (next[0]) {
      nextLink = next[0].getElementsByTagName('a')[0].href;
    } else {
      nextLink = document.location.href;
    }
    var previous = document.getElementsByClassName('pagination-item pagination-item--previous');
    if (previous[0]) {
      previousLink = previous[0].getElementsByTagName('a')[0].href;
    }
  });
}

window.$docsify = window.$docsify || {};

window.$docsify.plugins = (window.$docsify.plugins || []).concat([slidePlugin]);

})));
