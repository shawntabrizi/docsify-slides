// Pure HTML transformation for docsify-slides.
//
// Converts the `slide:start` / `slide:break` / `slide:end` marker comments that
// authors write in markdown into the two-column layout markup the stylesheet
// targets. Kept free of any DOM or CSS dependency so it can be unit tested in
// isolation.

// Clamp a left-column width percentage into the sane [0, 100] range so that
// malformed input (e.g. `slide:break-150`) can never produce a negative or
// over-100 width on either column. Falls back to 50 for non-numeric input.
export function clampWidth(width) {
  var n = Number(width);
  if (isNaN(n)) return 50;
  return Math.max(0, Math.min(100, n));
}

export function transformSlideHtml(html) {
  // Multiple two-column slides on one page, each delimited by
  // slide:start / slide:break(-N) / slide:end.
  if (html.includes('<!-- slide:start')) {
    var matches = html.match(/<!-- slide:break-?(\d+)? -->/g);
    // A start with no break is a no-op: return the page untouched rather than
    // dropping it (returning undefined would blank the page).
    if (!matches) return html;

    var widths = matches.map(function (slide_break) {
      var number = slide_break.match(/(\d+)/g);
      return number == null ? null : number[0];
    });

    // One iteration per break. Each pass consumes the first remaining
    // start / break / end, pairing them in document order.
    for (var i = 0; i < widths.length; i++) {
      var w = widths[i];
      var regex_pattern;
      if (w == null) {
        w = 50;
        regex_pattern = '<!-- slide:break -->';
      } else {
        regex_pattern = '<!-- slide:break-' + w + ' -->';
      }
      var left = clampWidth(w);
      var right = 100 - left;

      html = html.replace(
        /<!-- slide:start -->/,
        "<div class='slide-container'><div class='slide-col slide-left' style='width: " + left + "%'>"
      );
      html = html.replace(
        new RegExp(regex_pattern),
        "</div><div class='slide-col slide-right' style='width: " + right + "%'>"
      );
      html = html.replace(
        /<!-- slide:end -->/,
        '</div><div style="clear: left;"></div></div>'
      );
    }
    return html;
  }

  // A single two-column split for the whole page (one break, no start/end).
  // Only the first break is honoured — a page in this mode has exactly one
  // split, so any extra break comments are left as harmless hidden comments
  // rather than producing mismatched extra columns.
  if (html.includes('<!-- slide:break')) {
    var firstBreak = html.match(/<!-- slide:break-?(\d+)? -->/);
    if (!firstBreak) return html;

    var num = firstBreak[0].match(/(\d+)/g);
    var leftWidth = clampWidth(num == null ? 50 : num[0]);
    var rightWidth = 100 - leftWidth;

    return (
      "<div class='slide-container'>" +
      "<div class='slide-col slide-left' style='width: " + leftWidth + "%'>" +
      html.replace(
        /<!-- slide:break-?(\d+)? -->/,
        "</div><div class='slide-col slide-right' style='width: " + rightWidth + "%'>"
      ) +
      '</div></div>'
    );
  }

  return html;
}
