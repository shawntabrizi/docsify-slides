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

  return (
    "<div class='slide-container'>" +
    "<div class='slide-col slide-left' style='width: " + left + "%'>" +
    inner.replace(
      /<!-- slide:break-?(\d+)? -->/,
      "</div><div class='slide-col slide-right' style='width: " + right + "%'>"
    ) +
    '</div><div style="clear: left;"></div></div>'
  );
}

export function transformSlideHtml(html) {
  // Multiple two-column slides on one page, each delimited by its own
  // slide:start / slide:break(-N) / slide:end. Each block is matched as a unit
  // (non-greedy, so a block ends at its own slide:end and never swallows the
  // next) and transformed independently — there is no positional pairing of
  // markers, so unbalanced or break-less blocks degrade gracefully instead of
  // scrambling the page. An unclosed slide:start simply does not match and is
  // left in place.
  if (html.includes('<!-- slide:start')) {
    return html.replace(
      /<!-- slide:start -->([\s\S]*?)<!-- slide:end -->/g,
      function (match, inner) {
        return transformBlock(inner);
      }
    );
  }

  // A single two-column split for the whole page (one break, no start/end).
  if (html.includes('<!-- slide:break')) {
    return transformBlock(html);
  }

  return html;
}
