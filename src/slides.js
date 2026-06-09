import stylesheet from './stylesheet.css'
import { transformSlideHtml } from './transform'
import { arrowDirection } from './keys'

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

export function slidePlugin(hook, vm) {

  // Rewrite slide marker comments into two-column layout markup.
  hook.afterEach(function(html) {
    return transformSlideHtml(html);
  });

  // Make arrow keys go forward and backward using the pagination links.
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
    } else {
      previousLink = document.location.href;
    }
  });
};
