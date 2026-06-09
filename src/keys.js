// Decide which way an arrow keypress should navigate, or null to ignore it.
//
// Returns 'left' / 'right' for a bare arrow key, and null otherwise. Modified
// keypresses (Ctrl/Alt/Meta/Shift) and keys pressed while the user is typing in
// a form field or editable element are ignored, so the plugin never hijacks
// text-cursor movement or editor shortcuts. Kept DOM-free for unit testing:
// it only reads plain properties off the event object.
export function arrowDirection(e) {
  if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return null;

  var target = e.target;
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return null;
  }

  if (e.key === 'ArrowLeft') return 'left';
  if (e.key === 'ArrowRight') return 'right';
  return null;
}
