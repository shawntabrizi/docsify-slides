import { describe, it, expect } from 'vitest'
import { clampWidth, transformSlideHtml } from '../src/transform.js'

// Count occurrences of a substring, used to assert markup is balanced.
function count(haystack, needle) {
  return haystack.split(needle).length - 1
}

describe('clampWidth', () => {
  it('passes through valid percentages unchanged', () => {
    // Valid author input must not be altered, or layouts would shift silently.
    expect(clampWidth(70)).toBe(70)
    expect(clampWidth('40')).toBe(40)
    expect(clampWidth(0)).toBe(0)
    expect(clampWidth(100)).toBe(100)
  })

  it('clamps out-of-range widths so neither column can go negative', () => {
    // A right column width is computed as 100 - left; an unclamped 150 would
    // yield -50%, breaking the layout. Clamping keeps both columns in [0,100].
    expect(clampWidth(150)).toBe(100)
    expect(clampWidth(-20)).toBe(0)
  })

  it('falls back to 50 for non-numeric input', () => {
    expect(clampWidth('abc')).toBe(50)
    expect(clampWidth(undefined)).toBe(50)
  })
})

describe('transformSlideHtml — pass-through', () => {
  it('leaves pages without slide markers untouched', () => {
    // Ordinary docsify pages must render exactly as docsify produced them.
    const html = '<h1>Hello</h1><p>no slides here</p>'
    expect(transformSlideHtml(html)).toBe(html)
  })

  it('leaves an unclosed slide:start in place rather than blanking the page', () => {
    // Regression: this case once hit an early `return` (undefined) that blanked
    // the page. A start with no matching end does not form a block, so the page
    // must pass through untouched.
    const html = '<!-- slide:start -->\n<p>content</p>'
    expect(transformSlideHtml(html)).toBe(html)
  })
})

describe('transformSlideHtml — single split (no slide:start)', () => {
  it('splits a default break into balanced 50/50 columns', () => {
    const out = transformSlideHtml('<p>left</p><!-- slide:break --><p>right</p>')
    expect(out).toContain("slide-left' style='width: 50%'")
    expect(out).toContain("slide-right' style='width: 50%'")
    // Container must open and close exactly once around the two columns.
    expect(count(out, 'slide-container')).toBe(1)
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('honours a custom width and gives the remainder to the right column', () => {
    const out = transformSlideHtml('<p>L</p><!-- slide:break-70 --><p>R</p>')
    expect(out).toContain("slide-left' style='width: 70%'")
    expect(out).toContain("slide-right' style='width: 30%'")
  })

  it('clamps an over-100 width instead of emitting a negative column', () => {
    // Regression for unvalidated widths: break-150 must not yield width: -50%.
    const out = transformSlideHtml('<p>L</p><!-- slide:break-150 --><p>R</p>')
    expect(out).not.toContain('-50%')
    expect(out).toContain("slide-left' style='width: 100%'")
    expect(out).toContain("slide-right' style='width: 0%'")
  })

  it('only splits on the first break, leaving extras as inert comments', () => {
    // Regression: a global replace produced one slide-left and N mismatched
    // slide-right columns, all sized from the first break. This mode is a single
    // split, so exactly one right column is produced.
    const out = transformSlideHtml(
      '<p>a</p><!-- slide:break-30 --><p>b</p><!-- slide:break-70 --><p>c</p>'
    )
    expect(count(out, 'slide-left')).toBe(1)
    expect(count(out, 'slide-right')).toBe(1)
    expect(out).toContain("slide-left' style='width: 30%'")
    // The second break is not turned into a second, wrongly-sized column.
    expect(out).toContain('<!-- slide:break-70 -->')
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })
})

describe('transformSlideHtml — slide:start blocks', () => {
  it('wraps a start/break/end block in a balanced, closed container', () => {
    // Regression: the clearing div was written self-closing (`<div .../>`),
    // which HTML parsers treat as an open tag, leaving slide-container unclosed.
    const out = transformSlideHtml(
      '<!-- slide:start --><p>L</p><!-- slide:break --><p>R</p><!-- slide:end -->'
    )
    expect(out).toContain("slide-left' style='width: 50%'")
    expect(out).toContain("slide-right' style='width: 50%'")
    expect(out).toContain('<div style="clear: left;"></div>')
    // No self-closing div, and every div is closed.
    expect(out).not.toContain('clear: left;"/>')
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('gives each slide on the page its own width', () => {
    // Regression: widths must not bleed between slides — slide one is 40/60 and
    // slide two is 80/20 independently.
    const out = transformSlideHtml(
      '<!-- slide:start -->A<!-- slide:break-40 -->B<!-- slide:end -->' +
        '<!-- slide:start -->C<!-- slide:break-80 -->D<!-- slide:end -->'
    )
    expect(out).toContain("slide-left' style='width: 40%'")
    expect(out).toContain("slide-right' style='width: 60%'")
    expect(out).toContain("slide-left' style='width: 80%'")
    expect(out).toContain("slide-right' style='width: 20%'")
    // Two independent, balanced containers.
    expect(count(out, 'slide-container')).toBe(2)
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('clamps widths inside slide:start blocks too', () => {
    const out = transformSlideHtml(
      '<!-- slide:start -->A<!-- slide:break-150 -->B<!-- slide:end -->'
    )
    expect(out).not.toContain('-50%')
    expect(out).toContain("slide-left' style='width: 100%'")
    expect(out).toContain("slide-right' style='width: 0%'")
  })

  it('transforms each block independently regardless of marker counts', () => {
    // Regression: marker pairing by document index scrambled the page when a
    // break-less block preceded a normal one — block one's start was paired
    // with block two's break. Each block must be handled as its own unit.
    const out = transformSlideHtml(
      '<!-- slide:start -->X<!-- slide:end -->' +
        '<!-- slide:start -->A<!-- slide:break-40 -->B<!-- slide:end -->'
    )
    // The break-less first block contributes no column markup...
    expect(count(out, 'slide-container')).toBe(1)
    expect(out).toContain('X')
    // ...and the second block splits correctly into 40/60.
    expect(out).toContain("slide-left' style='width: 40%'")
    expect(out).toContain("slide-right' style='width: 60%'")
    // No raw markers leak through, and the markup is balanced.
    expect(out).not.toContain('<!-- slide:start -->')
    expect(out).not.toContain('<!-- slide:end -->')
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('renders a block with no break as plain content', () => {
    // A start/end block without a break has nothing to split: emit the inner
    // content with the markers stripped, not broken half-open markup.
    const out = transformSlideHtml('<!-- slide:start --><p>solo</p><!-- slide:end -->')
    expect(out).toBe('<p>solo</p>')
  })

  it('splits a block on its first break only, leaving extras as comments', () => {
    const out = transformSlideHtml(
      '<!-- slide:start -->A<!-- slide:break-30 -->B<!-- slide:break-70 -->C<!-- slide:end -->'
    )
    expect(count(out, 'slide-left')).toBe(1)
    expect(count(out, 'slide-right')).toBe(1)
    expect(out).toContain("slide-left' style='width: 30%'")
    expect(out).toContain('<!-- slide:break-70 -->')
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('preserves content surrounding the blocks', () => {
    // Matches the documented multiple-layout pages: paragraphs between blocks.
    const out = transformSlideHtml(
      '<p>intro</p>' +
        '<!-- slide:start -->A<!-- slide:break-40 -->B<!-- slide:end -->' +
        '<p>mid</p>' +
        '<!-- slide:start -->C<!-- slide:break-60 -->D<!-- slide:end -->' +
        '<p>end</p>'
    )
    expect(out).toContain('<p>intro</p>')
    expect(out).toContain('<p>mid</p>')
    expect(out).toContain('<p>end</p>')
    expect(count(out, 'slide-container')).toBe(2)
    expect(out).toContain("slide-left' style='width: 40%'")
    expect(out).toContain("slide-left' style='width: 60%'")
    expect(count(out, '<div')).toBe(count(out, '</div>'))
  })

  it('leaves an unclosed block in place instead of crashing', () => {
    const html = '<!-- slide:start -->A<!-- slide:break-40 -->B'
    expect(transformSlideHtml(html)).toBe(html)
  })
})
