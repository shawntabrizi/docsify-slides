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
  
  // multiple column-layout util functions
  function found_slide_break(str) {
    return str.match(/<!-- slide:break-?(\d+)? -->/g);
  }

  // Add left and right side of slide
  hook.afterEach(function(html) {
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
        
        let regex = ""
        let regex_pattern = "";

        if (w == null) {
          w = 50;
          regex_pattern = `<!-- slide:break -->`;
        } else {
          regex_pattern = `<!-- slide:break-${w} -->`;
        }
      
        regex = /<!-- slide:start -->/;
        html = html.replace(regex, `<div class='slide-container'><div class='slide-col slide-left' style='width: ${w}%'>`)

        regex = new RegExp(regex_pattern, "");
        html = html.replace(regex, `</div><div class='slide-col slide-right' style='width: ${100 - w}%'>`)

        regex = /<!-- slide:end -->/;
        html = html.replace(regex, "</div><div style=\"clear: left;\"/></div>")
      }
    }
    
    // one column-layout
    else if (html.includes('<!-- slide:break')) {
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
