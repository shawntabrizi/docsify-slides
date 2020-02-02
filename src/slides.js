import stylesheet from './stylesheet.css'

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

export function slidePlugin(hook, vm) {
  // Add left and right side of slide
  hook.afterEach(function(html) {
    if (html.includes('<!-- slide:break')) {
      var width = 50;
      var matches = html.match(/<!-- slide:break-\d+ -->/g);
      if (matches) {
        width = matches[0].match(/(\d+)/g)[0];
      }
      html =
        "<div class='slide-container'>" +
        "<div class='slide-col slide-left' style='width: " +
        width +
        "%'>" +
        html.replace(
          /<!-- slide:break-?(\d+)? -->/g,
          "</div><div class='slide-col slide-right' style='width: " +
            (100 - width) +
            "%'>"
        ) +
        '</div></div>';
    }

    return html;
  });

  // Make arrowidth keys go forward and backward
  hook.doneEach(function() {
    var next = document.getElementsByClassName(
      'pagination-item pagination-item--next'
    );
    if (next[0]) {
      nextLink = next[0].getElementsByTagName('a')[0].href;
    } else {
      nextLink = document.location.href;
    }
    var previous = document.getElementsByClassName(
      'pagination-item pagination-item--previous'
    );
    if (previous[0]) {
      previousLink = previous[0].getElementsByTagName('a')[0].href;
    }
  });
};
