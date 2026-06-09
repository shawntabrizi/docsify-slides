(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  function styleInject(css, ref) {
    if (ref === void 0) ref = {};
    var insertAt = ref.insertAt;
    if (typeof document === 'undefined') {
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

  // Pure HTML transformation for docsify-slides.
  //
  // Converts the `slide:start` / `slide:break` / `slide:end` marker comments that
  // authors write in markdown into the two-column layout markup the stylesheet
  // targets. Kept free of any DOM or CSS dependency so it can be unit tested in
  // isolation.

  // Clamp a left-column width percentage into the sane [0, 100] range so that
  // malformed input (e.g. `slide:break-150`) can never produce a negative or
  // over-100 width on either column. Falls back to 50 for non-numeric input.
  function clampWidth(width) {
    var n = Number(width);
    if (isNaN(n)) return 50;
    return Math.max(0, Math.min(100, n));
  }

  // Turn one slice of content into a two-column slide, splitting on its first
  // `slide:break(-N)` marker. The left column gets N% (default 50), the right the
  // remainder. Content with no break has nothing to split, so it is returned
  // unchanged. Any break beyond the first is left as an inert comment.
  function transformBlock(inner) {
    var firstBreak = inner.match(/<!-- slide:break-?(\d+)? -->/);
    if (!firstBreak) return inner;
    var num = firstBreak[0].match(/(\d+)/g);
    var left = clampWidth(num == null ? 50 : num[0]);
    var right = 100 - left;
    return "<div class='slide-container'>" + "<div class='slide-col slide-left' style='width: " + left + "%'>" + inner.replace(/<!-- slide:break-?(\d+)? -->/, "</div><div class='slide-col slide-right' style='width: " + right + "%'>") + '</div><div style="clear: left;"></div></div>';
  }
  function transformSlideHtml(html) {
    // Multiple two-column slides on one page, each delimited by its own
    // slide:start / slide:break(-N) / slide:end. Each block is matched as a unit
    // (non-greedy, so a block ends at its own slide:end and never swallows the
    // next) and transformed independently — there is no positional pairing of
    // markers, so unbalanced or break-less blocks degrade gracefully instead of
    // scrambling the page. An unclosed slide:start simply does not match and is
    // left in place.
    if (html.includes('<!-- slide:start')) {
      return html.replace(/<!-- slide:start -->([\s\S]*?)<!-- slide:end -->/g, function (match, inner) {
        return transformBlock(inner);
      });
    }

    // A single two-column split for the whole page (one break, no start/end).
    if (html.includes('<!-- slide:break')) {
      return transformBlock(html);
    }
    return html;
  }

  // Decide which way an arrow keypress should navigate, or null to ignore it.
  //
  // Returns 'left' / 'right' for a bare arrow key, and null otherwise. Modified
  // keypresses (Ctrl/Alt/Meta/Shift) and keys pressed while the user is typing in
  // a form field or editable element are ignored, so the plugin never hijacks
  // text-cursor movement or editor shortcuts. Kept DOM-free for unit testing:
  // it only reads plain properties off the event object.
  function arrowDirection(e) {
    if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return null;
    var target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
      return null;
    }
    if (e.key === 'ArrowLeft') return 'left';
    if (e.key === 'ArrowRight') return 'right';
    return null;
  }

  document.addEventListener('keydown', arrowChecker);
  var nextLink = document.location.href;
  var previousLink = document.location.href;
  function arrowChecker(e) {
    var direction = arrowDirection(e);
    if (direction === 'left') {
      document.location.href = previousLink;
    } else if (direction === 'right') {
      document.location.href = nextLink;
    }
  }
  function slidePlugin(hook, vm) {
    // Rewrite slide marker comments into two-column layout markup.
    hook.afterEach(function (html) {
      return transformSlideHtml(html);
    });

    // Make arrow keys go forward and backward using the pagination links.
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
      } else {
        previousLink = document.location.href;
      }
    });
  }

  window.$docsify = window.$docsify || {};
  window.$docsify.plugins = (window.$docsify.plugins || []).concat([slidePlugin]);

}));
