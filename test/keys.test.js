import { describe, it, expect } from 'vitest'
import { arrowDirection } from '../src/keys.js'

describe('arrowDirection', () => {
  it('maps bare arrow keys to a navigation direction', () => {
    // The plugin's core behavior: left/right arrows page backward/forward.
    expect(arrowDirection({ key: 'ArrowLeft' })).toBe('left')
    expect(arrowDirection({ key: 'ArrowRight' })).toBe('right')
  })

  it('ignores non-arrow keys', () => {
    expect(arrowDirection({ key: 'Enter' })).toBe(null)
    expect(arrowDirection({ key: 'a' })).toBe(null)
  })

  it('ignores arrows while typing in a text field', () => {
    // Regression: navigating on every arrow keypress hijacked the text cursor
    // in docsify's search box and any other input/textarea.
    expect(arrowDirection({ key: 'ArrowRight', target: { tagName: 'INPUT' } })).toBe(null)
    expect(arrowDirection({ key: 'ArrowLeft', target: { tagName: 'TEXTAREA' } })).toBe(null)
    expect(
      arrowDirection({ key: 'ArrowRight', target: { isContentEditable: true } })
    ).toBe(null)
  })

  it('ignores arrows pressed with a modifier key', () => {
    // Modified arrows (e.g. browser/editor shortcuts) must not trigger nav.
    expect(arrowDirection({ key: 'ArrowRight', ctrlKey: true })).toBe(null)
    expect(arrowDirection({ key: 'ArrowLeft', metaKey: true })).toBe(null)
    expect(arrowDirection({ key: 'ArrowRight', altKey: true })).toBe(null)
    expect(arrowDirection({ key: 'ArrowLeft', shiftKey: true })).toBe(null)
  })

  it('still navigates for arrows on non-editable elements', () => {
    expect(arrowDirection({ key: 'ArrowRight', target: { tagName: 'DIV' } })).toBe('right')
  })
})
