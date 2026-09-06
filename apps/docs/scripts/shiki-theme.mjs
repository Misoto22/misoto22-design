/**
 * The White Reset, as a syntax theme.
 *
 * The site used to highlight with `github-light-high-contrast` and its dark
 * twin. They are good themes and they are somebody else's: seven hues on a
 * page whose whole argument is that it has none, so every code block was the
 * most colourful thing on screen — on a documentation site, where the code
 * blocks are half the page.
 *
 * The rule here is the system's own. Structure is carried by WEIGHT, not by
 * hue: a keyword is ink and bold, an identifier is ink, punctuation and
 * comments step back down the neutral ramp. The only two colours are the ones
 * the system already spends on status, and they are spent on the two things a
 * reader genuinely scans a snippet for — a literal string and a number.
 *
 * Every value here is a token from `tokens.css`, written as a literal because
 * a TextMate theme cannot read a custom property. `--paper-2` is the ground:
 * these are the contrast ratios that matter, and each clears AA on it.
 *   ink        #101010 / #f4f4f2   19.6 : 1   ·  15.9 : 1
 *   ink-2      #4a4a4a / #b4b4b0    8.3 : 1   ·   8.9 : 1
 *   ink-3-aa   #5c5c5c / #9a9a96    6.4 : 1   ·   6.2 : 1
 *   ok         #3d6b34 / #84b47b    6.0 : 1   ·   7.7 : 1
 *   warn       #8a5a00 / #d9a55d    5.4 : 1   ·   9.1 : 1
 */

/** Scopes that carry the same role in every grammar the site highlights. */
function settings({ ink, ink2, ink3, ok, warn }) {
  return [
    { scope: ['comment', 'punctuation.definition.comment', 'string.comment'], settings: { foreground: ink3, fontStyle: 'italic' } },

    // The two colours, and the two things a reader scans for.
    { scope: ['string', 'string.quoted', 'string.template', 'constant.other.symbol', 'meta.jsx.children', 'text.html'], settings: { foreground: ok } },
    { scope: ['constant.numeric', 'constant.language', 'constant.character', 'keyword.other.unit', 'support.constant'], settings: { foreground: warn } },

    // Structure is weight.
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.control', 'keyword.operator.new', 'keyword.operator.expression', 'variable.language'], settings: { foreground: ink, fontStyle: 'bold' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call.generic', 'entity.name.tag', 'support.class.component'], settings: { foreground: ink, fontStyle: 'bold' } },
    { scope: ['entity.name.type', 'entity.name.class', 'support.type', 'support.class', 'entity.other.inherited-class'], settings: { foreground: ink } },

    // Everything that is scaffolding rather than content steps back.
    { scope: ['punctuation', 'meta.brace', 'keyword.operator', 'punctuation.separator', 'punctuation.terminator', 'punctuation.definition.tag'], settings: { foreground: ink2 } },
    { scope: ['entity.other.attribute-name', 'meta.object-literal.key', 'support.type.property-name', 'variable.other.property'], settings: { foreground: ink2 } },
    { scope: ['variable', 'variable.other', 'variable.parameter', 'meta.definition.variable'], settings: { foreground: ink } },

    // CSS reads differently: the selector is the subject, the property is the
    // predicate, and the value is the fact. Same three weights, same order.
    { scope: ['entity.name.tag.css', 'entity.other.attribute-name.class.css', 'entity.other.attribute-name.id.css', 'entity.other.attribute-name.pseudo-class.css'], settings: { foreground: ink, fontStyle: 'bold' } },
    { scope: ['support.type.property-name.css', 'support.type.vendored.property-name.css'], settings: { foreground: ink2 } },
    { scope: ['variable.css', 'variable.argument.css', 'support.constant.property-value.css'], settings: { foreground: ink } },

    { scope: ['invalid', 'invalid.illegal'], settings: { foreground: '#a83214' } },
  ]
}

export const WHITE_RESET_LIGHT = {
  name: 'white-reset-light',
  type: 'light',
  fg: '#101010',
  // Transparent, so the block takes the surface it is sitting on rather than
  // painting a second one a shade off it.
  bg: 'transparent',
  settings: settings({
    ink: '#101010',
    ink2: '#4a4a4a',
    ink3: '#5c5c5c',
    ok: '#3d6b34',
    warn: '#8a5a00',
  }),
}

export const WHITE_RESET_DARK = {
  name: 'white-reset-dark',
  type: 'dark',
  fg: '#f4f4f2',
  bg: 'transparent',
  settings: settings({
    ink: '#f4f4f2',
    ink2: '#b4b4b0',
    ink3: '#9a9a96',
    ok: '#84b47b',
    warn: '#d9a55d',
  }),
}

/** The one call every `codeToHtml` in the generator makes. */
export const HIGHLIGHT = {
  themes: { light: WHITE_RESET_LIGHT.name, dark: WHITE_RESET_DARK.name },
  defaultColor: false,
}
