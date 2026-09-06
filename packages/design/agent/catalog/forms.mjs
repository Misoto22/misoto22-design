/**
 * The Forms entries, and nothing else.
 *
 * `catalog.mjs` is still the module: it keeps the typedefs, the group list, the
 * slug rule and the axis table, and it assembles `CATALOG` by concatenating these
 * files in `GROUPS` order. Nothing imports this one directly.
 *
 * A group is the unit because an entry is prose, not a row — several paragraphs
 * per component — and ninety-two of them in one file is a file only one person can
 * be writing at a time.
 */

/** @type {import('../catalog.mjs').CatalogEntry[]} */
export const FORMS = [
  {
    name: 'Field',
    group: 'Forms',
    summary: 'A labelled form row: label, control, and the one message below it — and, in row layout, the settings row.',
    when: 'Any labelled control. layout="row" is the settings row — label and description at the inline start, control at the inline end — which is a layout here rather than a second component, because the label wiring, the required marker and the message slot are the same three things either way.',
    anatomy: [
      {
        element: 'Label',
        description:
          'label, rendered as a Radix <Label> carrying htmlFor and an id. The id is what a trigger names itself from, alongside its own value, and what a group points back at — neither of which htmlFor can do.',
      },
      {
        element: 'Required mark',
        description:
          'The --danger asterisk after the label when required. aria-hidden, but still inside the label’s text, so the accessible name ends “Email *”.',
      },
      {
        element: 'Control slot',
        required: true,
        description:
          'children — ONE element, which the field clones to add id, aria-describedby, aria-required and aria-invalid, and which each control forwards to whatever element carries its role: the trigger for Select, Combobox and DatePicker, the root for a group, the thumb for a Slider. This is the whole contract; everything else is layout.',
      },
      {
        element: 'Description',
        description:
          'description, a second line under the LABEL explaining what the setting does — as distinct from hint, which sits under the control and belongs to the input. It has its own id and joins aria-describedby ahead of the message, so a row with both announces both.',
      },
      {
        element: 'Message',
        description:
          'A single <p> below the control: error if there is one, hint otherwise, never both. It owns the id that aria-describedby points at, and it is --danger or --ink-3-aa accordingly.',
      },
      {
        element: 'Row layout',
        description:
          'layout="row": the label and description in a column at the inline start, the control at the inline end, the message underneath both. The two columns are TOP-aligned — items-start on the block axis, not items-center — so a two-line description does not drag the switch down to the middle of the paragraph, and a column of settings rows keeps every control on the same line as the words that name it.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Make children the control itself, not a layout wrapper around it: the wiring is a cloneElement on the single child, so a <div> in between takes the id and the aria-describedby and the label ends up naming a box.',
      },
      {
        kind: 'do',
        text: 'Let error carry the invalid state. The field sets aria-invalid on the control, and Input, Textarea, NativeSelect, Select and Combobox all read either spelling through isInvalid, so passing invalid as well states the same fact twice from two places that can disagree.',
      },
      {
        kind: 'do',
        text: 'Pass htmlFor, and the same id on the control, whenever something outside the row has to address it — a form library, a scroll-to-first-error, a test. The generated id is a useId value nothing else can predict.',
      },
      {
        kind: 'dont',
        text: 'required here is aria-required and an asterisk, and nothing else: it never reaches the control’s own required attribute, so the browser will not block the submit and the row stays unmarked until you pass error yourself.',
      },
      {
        kind: 'dont',
        text: 'The words above a RadioGroup or a ToggleGroup name it but do not click through. Both roots are <div role="radiogroup">, which htmlFor does not bind to, so the label is pointed AT by the group instead — a reader who clicks it the way they click "Email" gets nothing, exactly as with a <legend>.',
      },
      {
        kind: 'do',
        text: 'Build a settings screen out of layout="row" with description, not out of three hand-rolled divs. The label still reaches the control through the same wiring, so the switch on the far side of the row is named by the words on the near side.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for description as a second hint. It explains the SETTING and sits under the label; hint explains the INPUT and sits under the control. A row that uses one for the other reads correctly and lands in the wrong place.',
      },
      {
        kind: 'dont',
        text: 'required is announced on every control here except DatePicker, whose trigger is a plain <button> — a role with nowhere to put aria-required. There the asterisk is the whole of the marking, and a screen reader meets an ordinary optional field.',
      },
    ],
    accessibility: [
      'Generates an id when none is given, so the label always points at something.',
      'Wires aria-describedby, aria-required and aria-invalid onto the control, so validation is announced and not merely drawn.',
      'hint and error are one slot: when a field is wrong, the thing to read is what is wrong with it.',
      'description joins aria-describedby ahead of the message, so a settings row announces what the setting does and then what is wrong with it.',
      'Every control forwards the wiring to the element that carries its role, so the hint under a Select or a Slider is announced and not merely drawn.',
      'The row layout moves the label to the other side of the row and changes nothing about the association, so a settings row with a Switch or a Select in it is named by the words on the near side. Slider is the exception, and the layout cannot fix it: role="slider" is on the THUMB while the field’s label points at the roleless root, so there the label prop on the Slider is still the only name a reader hears.',
    ],
    related: ['input', 'select', 'switch'],
  },
  {
    name: 'Input',
    group: 'Forms',
    summary: 'A single line of text entry.',
    anatomy: [
      {
        element: 'Control box',
        required: true,
        description:
          'The <input>, on the CONTROL_BASE it shares with Textarea and the Select trigger. Its padding is --field-px / --field-py, so a subtree marked data-density="compact" tightens the fields along with the buttons.',
      },
      {
        element: 'Placeholder',
        description:
          'placeholder, in --ink-3-aa inside the box — the same slot the value occupies, which is why it cannot also be the name.',
      },
      {
        element: 'Focus border',
        description:
          'focus:border-(--ink) on the border already there, not an added ring. The box does not gain a pixel on focus, so nothing in the row shifts.',
      },
      {
        element: 'Danger border',
        description:
          'What invalid — or an aria-invalid set by a Field with an error — swaps in. It changes the border colour and nothing else, so the reason has to come from the message below.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Spell out type and inputMode. An <Input> with no type is type="text", so an email field that never says so gets a phone keyboard with no @ on it and no browser validation at all.',
      },
      {
        kind: 'do',
        text: 'Name the field to the browser with autoComplete: a password field without current-password or new-password is one a manager fills with the wrong value and one no browser offers to save.',
      },
      {
        kind: 'do',
        text: 'Reach for readOnly rather than disabled when the value is real but not editable — a disabled input is skipped by Tab AND left out of the submitted form data, so the server hears nothing about a field the reader can plainly see.',
      },
      {
        kind: 'dont',
        text: 'readOnly is styled by nothing here: CONTROL_BASE dims on :disabled only, so a read-only input is pixel-identical to an editable one and the first thing a reader learns about it is that typing does nothing.',
      },
      {
        kind: 'dont',
        text: 'type="number" is for quantities, not for digits. A phone number, a card number or a postcode loses its leading zeros, and a scroll wheel over the focused control changes the value without a keystroke.',
      },
      {
        kind: 'dont',
        text: 'A Tooltip on a disabled input never opens — disabled:pointer-events-none means the control receives no hover — so the explanation for why it is disabled has to live in the Field’s hint instead.',
      },
    ],
    accessibility: [
      'A placeholder is not a label — it disappears the moment anyone types. Pair with Field.',
    ],
    related: ['field', 'textarea'],
  },
  {
    name: 'NumberField',
    group: 'Forms',
    summary: 'A number, typed or swept to.',
    when: 'The number has a range and a sensible increment. A bare quantity is an Input with type="number"; a value judged by WHERE it sits on a track is a Slider.',
    anatomy: [
      {
        element: 'Field',
        required: true,
        description:
          'A native number input wearing CONTROL_BASE, so it is the same box as Input, Textarea and Select — same padding, same focus, same disabled opacity. The native spinner buttons are hidden: they are three different controls in three browsers and none of them is this system’s.',
      },
      {
        element: 'Scrub grip',
        description:
          'A horizontal-arrows glyph at the inline start, on unless scrub is false. Dragging it changes the value by one step every 4px, ten steps with Shift held, and it follows the reading direction — in an RTL page, more is to the left. Pointer only and aria-hidden, because the keyboard already has the arrow keys.',
      },
      {
        element: 'Unit',
        description:
          'unit, drawn inside the end of the box and announced through aria-describedby. The slot is a fixed 3rem, so a unit longer than about four characters runs under a long number.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Reach for it when a value is TUNED rather than entered — a duration, a line height, an offset. The grip is the whole argument for this over an Input: a reader finds those by sweeping past the neighbouring values, not by typing candidates one at a time.',
      },
      {
        kind: 'do',
        text: 'Wrap it in a Field. The root is a div and the id lands on the input inside it, so the label binds and clicks through exactly as it does for an Input — but only if there is a Field to do it.',
      },
      {
        kind: 'do',
        text: 'Pass min, max and step. They are what the arrows step by, what one notch of a scrub is worth, and what the value is reconciled with when the field is left; without them the control is an Input with a grip on it.',
      },
      {
        kind: 'dont',
        text: 'Do not expect the range to hold mid-keystroke. Clamping happens on blur, not on every character, because a minimum of 10 otherwise makes 50 unreachable — the 5 is clamped up before the 0 arrives. onValueChange can report a number outside the range; the value that SETTLES is always inside it.',
      },
      {
        kind: 'dont',
        text: 'Do not turn the grip off and expect a pointer to have another way through. There are no spinner buttons behind it — hiding those is the point — so scrub={false} leaves a mouse with typing and nothing else. Turn it off for a quantity that is chosen rather than swept to, and accept that trade knowingly.',
      },
      {
        kind: 'dont',
        text: 'Do not put the unit in the box and nowhere else past about four characters. The slot is fixed, so “requests” runs under the number; a long unit belongs in the Field’s label, where it is read rather than clipped.',
      },
    ],
    accessibility: [
      'It is a real <input type="number">, so the platform supplies the spinbutton role, the value, and the range it is announced against.',
      'unit reaches assistive tech through aria-describedby, so “300” is not announced as a number with no dimension.',
      'The grip is aria-hidden and not focusable: it commits nothing a keyboard cannot already reach, and announcing it would offer a reader a control that does nothing when they press it.',
      'invalid and aria-invalid are read together, so a form library setting either one paints the same border.',
    ],
    keyboard: [
      { keys: ['↑', '↓'], does: 'Steps by one step, honouring min and max.' },
      { keys: ['Enter'], does: 'Reconciles what has been typed with the range and the step.' },
      { keys: ['Escape'], does: 'Abandons the edit and restores the last settled value.' },
    ],
    related: ['input', 'slider', 'field'],
  },
  {
    name: 'Textarea',
    group: 'Forms',
    summary: 'Multi-line text entry, resizable vertically only.',
    anatomy: [
      {
        element: 'Control box',
        required: true,
        description:
          'The <textarea>, on the same CONTROL_BASE as Input plus a min-h-24 floor. That floor is under rows, not over it: rows={2} still renders six rems tall.',
      },
      {
        element: 'Resize grip',
        description:
          'The browser’s own corner handle, constrained to resize-y — a reader can lengthen the box but cannot drag it past the measure or out of the page’s gutter.',
      },
      {
        element: 'Danger border',
        description:
          'The same pair isInvalid reads on Input: the invalid prop or an aria-invalid, including the one a Field sets when it has an error.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Set rows to the answer you expect. It is the only thing that raises the resting height above the six-rem floor, and the size of the box is the clearest thing on the page about how long an answer should be.',
      },
      {
        kind: 'do',
        text: 'If there is a length limit, set maxLength AND say so in the hint: maxLength swallows the keystroke without explaining, and a paste one character too long is silently truncated.',
      },
      {
        kind: 'do',
        text: 'Keep Enter meaning newline. A textarea that submits on Enter has taken the one key the control exists to accept, and the reader loses the paragraph they were halfway through.',
      },
      {
        kind: 'dont',
        text: 'There is no auto-grow. The height is whatever rows and min-h-24 settled on and it never follows the content, so a long answer is reviewed through a six-rem window unless the call site says otherwise.',
      },
      {
        kind: 'dont',
        text: 'Do not put a required format in the Field’s hint and nothing else: hint and error share one slot, so the format vanishes the instant the field is wrong — which is the only moment anyone needed it.',
      },
    ],
    related: ['input', 'field'],
  },
  {
    name: 'Select',
    group: 'Forms',
    summary: 'A choice from a list, styled the whole way down.',
    when: 'Up to roughly a dozen options. Past that a Combobox wins, because a list nobody can filter is slower to scan than one you can type into.',
    anatomy: [
      {
        element: 'Trigger',
        required: true,
        description:
          'A <button role="combobox"> on CONTROL_BASE, so it matches the Input beside it exactly. It is named by the label and by its own value together, and carries the chevron that turns over while the panel is open.',
      },
      {
        element: 'Value',
        description:
          'The chosen item’s text, or placeholder in --ink-3-aa when nothing is chosen. It truncates, and it is the half of the accessible name that says what was picked.',
      },
      {
        element: 'Panel',
        description:
          'Portalled, at least as wide as the trigger and at most 18rem tall, with a scroll chevron appearing at each end once the list is longer than that.',
      },
      {
        element: 'Item',
        description:
          'One option. The 3.5 tick box is always drawn and only the tick inside it appears, so choosing does not shunt every label sideways; data-highlighted is the fill, the tick is the chosen one.',
      },
      {
        element: 'Group heading',
        description:
          'SelectLabel — a mono eyebrow inside a SelectGroup. It is a heading, not an option, which is the difference between it and a disabled item used as a divider.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass name when the value has to survive a submit. The trigger is a <button>; Radix renders the hidden native <select> that carries the value only when the control is inside a <form>, and only a named one sends anything.',
      },
      {
        kind: 'do',
        text: 'Pick one spelling of invalid. The trigger reads the invalid prop and aria-invalid alike, including the one a Field sets from error, so setting both is two sources of truth for one border.',
      },
      {
        kind: 'do',
        text: 'Divide long lists with SelectGroup and SelectLabel rather than a disabled item used as a heading: a disabled item is still an option, so a screen reader counts it and announces the list as one longer than it is.',
      },
      {
        kind: 'dont',
        text: 'Inside a Field with a label, the label prop here is not announced — the field’s words name the trigger — so a label that disagrees with the one above it is dead text nobody will ever hear.',
      },
      {
        kind: 'dont',
        text: 'Do not lean on the closed trigger to show a long option: it truncates to keep the field’s height, so the end of the value is only readable with the panel open.',
      },
      {
        kind: 'dont',
        text: 'Do not point contentClassName at the trigger. className is the trigger; contentClassName is the panel, and confusing them is how a select gets a 18rem-wide dropdown over the thing it is choosing for.',
      },
    ],
    accessibility: [
      'Inside a bounded frame — a device preview, an embedded console — wrap the subtree in `<OverlayContainer container={el}>`. The panel then renders into that element and collides with its edges instead of the viewport’s, and inherits the `dir` and `data-density` set there.',
      'The option list is ours, so it does not change typeface, spacing and selection colour the moment it opens — which is what a native select does.',
      "The keyboard contract is the platform's: typeahead, arrows, Home and End, Escape to close without choosing.",
      'label is required, and it is announced WITH the value: the trigger reads "Region, Australia", because a value is not a name and a name without the value is not the answer. Inside a Field the FIELD’s label supplies the name half — the trigger’s aria-labelledby points at that label and at the value — and the label prop here is neither rendered nor announced, so one that disagrees with the words above it is text nobody will hear.',
    ],
    keyboard: [
      { keys: ['Enter', 'Space', '↓'], does: 'Opens the list.' },
      { keys: ['↑', '↓'], does: 'Moves between options.' },
      { keys: ['a–z'], does: 'Typeahead — jumps to the next option starting with that letter.' },
      { keys: ['Home', 'End'], does: 'Jumps to the first or last option.' },
      { keys: ['Escape'], does: 'Closes without choosing.' },
    ],
    related: ['combobox', 'native-select', 'field'],
  },
  {
    name: 'NativeSelect',
    group: 'Forms',
    summary: 'The platform’s own picker, restyled where it can be.',
    when: 'The escape hatch, not the default. Reach for it where the platform genuinely wins: a very long list on a phone, a form that must work without JavaScript, a page counting its last kilobyte.',
    anatomy: [
      {
        element: 'Wrapper',
        required: true,
        description:
          'A relative <div> around the pair, and the element className lands on. It is the only control in this group where className does not go to the field itself, because the chevron is pinned to this box: a width set anywhere else strands the arrow at the far edge of the row.',
      },
      {
        element: 'Control box',
        required: true,
        description:
          'The <select> on CONTROL_BASE, appearance-none so the platform’s own arrow is gone, with pe-9 of end padding so the longest option clears the drawn one. It fills the wrapper, so the wrapper’s width is the field’s width.',
      },
      {
        element: 'Chevron',
        required: true,
        description:
          'A pointer-events-none icon pinned to the wrapper’s end edge. It is ours, not the platform’s, so it does not flip or move when the picker opens.',
      },
      {
        element: 'Option list',
        description:
          'children, drawn by the operating system on open. <option> and <optgroup> are the only things in it, and neither takes these tokens.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Give it an explicit empty first option, or a defaultValue. A <select> nobody touches has its first option selected, so an untouched form submits the top of the list as though someone chose it.',
      },
      {
        kind: 'do',
        text: 'Group with <optgroup>: it is the one piece of structure the OS picker actually renders, and there is no styled equivalent to fall back on the way SelectLabel gives Select one.',
      },
      {
        kind: 'do',
        text: 'Set the width with className. It lands on the wrapper the chevron is pinned to and the select fills it, so the arrow travels with the edge of the field rather than staying where the row ends.',
      },
      {
        kind: 'dont',
        text: 'multiple and size do not survive the styling: appearance-none plus a chevron pinned to the middle of the wrapper turns a list box into a scrolling column with an arrow drawn across it. Use checkboxes, or a multiple Combobox.',
      },
      {
        kind: 'dont',
        text: 'Do not use the first option as the label. “Select a country” is announced as a choosable value and it is the value an untouched form submits — put the name in a Field and give that option value="" and disabled.',
      },
      {
        kind: 'dont',
        text: 'Do not send the control’s own ink or border through className: it dresses the wrapper, and the <select> inside keeps CONTROL_BASE whatever the box around it says.',
      },
    ],
    accessibility: [
      'Typeahead and the mobile wheel come free, from the browser.',
      'What it cannot do is look like the rest of the system once open — the option list is drawn by the operating system and carries none of these tokens.',
    ],
    keyboard: [
      { keys: ['Space', '↓'], does: 'Opens the platform picker.' },
      { keys: ['a–z'], does: 'Typeahead, from the browser’s own implementation.' },
    ],
    related: ['select', 'field'],
  },
  {
    name: 'Checkbox',
    group: 'Forms',
    summary: 'A choice that takes effect when the form is submitted.',
    when: 'A setting that applies immediately is a Switch.',
    anatomy: [
      {
        element: 'Box',
        required: true,
        description:
          'An 18px <button role="checkbox"> on --radius-xs. It fills with --accent for BOTH checked and indeterminate, so the fill says “not off” rather than “on”.',
      },
      {
        element: 'Tick',
        description: 'The check glyph, aria-hidden — Radix shows the indicator, the state is carried by the role.',
      },
      {
        element: 'Dash',
        description:
          'The minus that replaces the tick, chosen from the state the box is actually in — controlled or not, so defaultChecked="indeterminate" draws the dash it promised rather than a tick.',
      },
      {
        element: 'Label',
        description:
          'Not rendered here. Unlike RadioGroupItem, nothing wraps the box in a <label>, so the words beside it and the click target they give it are the call site’s job.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Wrap it and its words in a <label>, or put it in a Field: the control renders no label of its own, so a bare Checkbox has no accessible name and an 18px box is the entire click target.',
      },
      {
        kind: 'do',
        text: 'Hold an indeterminate box on controlled state. It is a report about OTHER rows, and clicking it hands you true — a “select all” header that keeps its own answer stops describing the list underneath it on the first click.',
      },
      {
        kind: 'do',
        text: 'Default the value on the server. An unticked box sends no entry at all in a form submission, so the field a reader deliberately cleared and a field that was never rendered arrive identically as undefined.',
      },
      {
        kind: 'dont',
        text: 'checked without onCheckedChange gives a box that never moves: Radix treats the prop as the source of truth, so the reader clicks a control that is neither broken nor working and gets no feedback either way.',
      },
      {
        kind: 'dont',
        text: 'There is no readOnly on a Radix checkbox. disabled is the only lock and it drops the box out of the tab order and out of the form, so a value that must be shown but not changed is better drawn as text.',
      },
      {
        kind: 'dont',
        text: 'Do not put the indeterminate state on a leaf. It means “some of the things under this one”, so a box with nothing under it that draws a dash is reporting a state its own value cannot hold.',
      },
    ],
    accessibility: [
      'Supports the indeterminate state, which is what a “select all” header needs when only some rows are selected.',
    ],
    keyboard: [
      { keys: ['Space'], does: 'Toggles it.' },
    ],
    related: ['switch', 'radio-group'],
  },
  {
    name: 'RadioGroup',
    group: 'Forms',
    summary: 'A set of mutually exclusive choices.',
    anatomy: [
      {
        element: 'Group',
        required: true,
        description:
          'A <div role="radiogroup"> stacking its options. Being a div is why the label above it names the group by being pointed AT — aria-labelledby, not htmlFor — and why the words do not click through.',
      },
      {
        element: 'Row',
        required: true,
        description:
          'The <label> RadioGroupItem wraps around control and words. It is the click target — a bare 18px circle is below every pointer-target guideline — and it is the only source of the option’s accessible name.',
      },
      {
        element: 'Circle',
        required: true,
        description: 'The 18px control itself, its border turning --accent when chosen.',
      },
      {
        element: 'Dot',
        description: 'The 10px --accent fill inside the circle, present only on the chosen option.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Name the group. Inside a Field its label does it, through aria-labelledby; standing alone it needs its own aria-label, and without either the group is announced as three unlabelled radios.',
      },
      {
        kind: 'do',
        text: 'Set defaultValue or value. Selection follows focus here, so a group that starts empty commits an answer the moment anybody arrows into it — including a reader who was only passing through on the way to the next field.',
      },
      {
        kind: 'do',
        text: 'Add an explicit “None” or “Any” option when the answer is genuinely optional: there is no way back to nothing once a radio is chosen, neither by clicking it again nor from the keyboard.',
      },
      {
        kind: 'dont',
        text: 'Do not hang an expensive effect on onValueChange. Every arrow press commits, so a group whose options fetch or navigate fires once per key on the way past the ones nobody wanted.',
      },
      {
        kind: 'dont',
        text: 'Do not reach past RadioGroupItem to the Radix primitive or hand-roll the row: selection-follows-focus is implemented in this item’s own focus handler, not upstream, so a hand-rolled one moves the outline and selects nothing.',
      },
      {
        kind: 'dont',
        text: 'Do not disable one option to mean “not available here”: the roving focus skips it entirely, so a keyboard reader never learns the option exists. Say why in the Field’s hint and leave the option out.',
      },
    ],
    accessibility: [
      'One tab stop for the whole group; the arrow keys move between options, per the ARIA radiogroup pattern.',
      'The label is inside the <label>, so the whole row is the click target.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the group, and out of it — the whole group is one stop.' },
      { keys: ['↑', '↓', '←', '→'], does: 'Moves between options AND selects as it goes.' },
    ],
    related: ['checkbox', 'select'],
  },
  {
    name: 'Switch',
    group: 'Forms',
    summary: 'A setting that takes effect immediately.',
    when: 'Inside a form with a Save button, a switch is a lie about when the change happened. Use a Checkbox.',
    anatomy: [
      {
        element: 'Track',
        required: true,
        description:
          'A 36×20 <button role="switch"> on a pill radius, filled --stone when off and --accent when on. Filled rather than outlined, so it still reads as a control on a white page.',
      },
      {
        element: 'Thumb',
        required: true,
        description:
          'A 14px paper circle with a hairline, not a white disc on a shadow — this system has no shadows. It stretches to 20px while pressed and rounds out as it lands; motion-reduce drops that entirely.',
      },
      {
        element: 'Label',
        description:
          'Not rendered here either. The Radix root IS a <button>, though, which a <label for> does bind to — so unlike Select or RadioGroup, a Field’s label above a Switch really does click through to it.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Handle the failure at the control. The flip has already claimed the change happened, so an onCheckedChange whose request fails must put the thumb back and say why, or the page is showing a setting the server does not have.',
      },
      {
        kind: 'do',
        text: 'Name it for the state, not the action: the accessible name is read together with “on” or “off”, so “Email notifications, on” is a sentence and “Turn on email notifications, on” is two contradictory ones.',
      },
      {
        kind: 'do',
        text: 'Keep the flip instant to the eye even when the write is not — an optimistic thumb with a quiet undo beats a spinner on a control whose whole claim is that it already took effect.',
      },
      {
        kind: 'dont',
        text: 'A switch has two states and no third. “Inherit from the workspace” cannot be a switch, because the only way to draw it is unchecked, which announces “off” — that is a RadioGroup or a Select.',
      },
      {
        kind: 'dont',
        text: 'There is no readOnly: disabled is the only lock, and it takes the control out of the tab order, so a keyboard reader tabbing the form passes the setting without ever hearing its value.',
      },
      {
        kind: 'dont',
        text: 'Do not add transition-all from a call site. It replaces transition-[transform,width] wholesale, which puts the track’s colour on the thumb’s longer duration and turns a flip into a fade.',
      },
    ],
    keyboard: [
      { keys: ['Space', 'Enter'], does: 'Toggles it, and the change applies immediately.' },
    ],
    related: ['checkbox'],
  },
  {
    name: 'Combobox',
    group: 'Forms',
    summary: 'A select you can type into.',
    when: 'Past roughly a dozen options. Below that a native Select is better: the platform picker on a phone, typeahead for free, no JavaScript.',
    anatomy: [
      {
        element: 'Trigger',
        required: true,
        description:
          'A <button role="combobox"> named by the label and its own summary together, carrying aria-expanded. Its text truncates rather than wrapping, so the field keeps its height whatever is chosen.',
      },
      {
        element: 'Summary',
        description:
          'The trigger’s text: the placeholder, or up to two chosen labels joined by commas, then “n selected”. Counting past two is what stops a multiple picker reflowing the form on every choice.',
      },
      {
        element: 'Clear',
        description:
          'A <span role="button"> beside the chevron, on multiple with something chosen. A span rather than a nested <button>, which is invalid inside the trigger and which browsers reparent out of the field.',
      },
      {
        element: 'Filter field',
        description:
          'cmdk’s input inside the panel. It is named through the Command wrapper as “label: searchPlaceholder”, because aria-labelledby beats aria-label and naming the input directly did nothing.',
      },
      {
        element: 'Option row',
        description:
          'A tick for single, a fillable box for multiple, then the label. emptyMessage takes the list’s place when the filter matches nothing.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Spell “nothing chosen” as an empty string when the value is controlled. value={undefined} is precisely how this component decides it is UNCONTROLLED, so clearing that way hands it back its own state and it stops following the parent.',
      },
      {
        kind: 'do',
        text: 'Put readable text in label and anything else worth matching in keywords: cmdk scores against the option’s value too, so a list keyed by UUID is being ranked on a string no reader will ever type.',
      },
      {
        kind: 'do',
        text: 'Say what WOULD match in emptyMessage. The default tells a reader the filter ran and nothing about which of the four hundred options they should have typed instead.',
      },
      {
        kind: 'dont',
        text: 'Past two choices the trigger stops naming them — it announces “Tags, 3 selected”, and WHICH three is only in the panel. Print them beside the field when the choice has to be checkable without opening it.',
      },
      {
        kind: 'dont',
        text: 'Do not hand it thousands of options. Nothing here virtualises: every option in the array renders into the panel on open and stays there behind the filter, so the list length is a DOM cost, not a search cost.',
      },
      {
        kind: 'dont',
        text: 'A disabled option is not a hidden one — it still renders and still matches the filter, so a reader can type its exact name, watch it come up, and be unable to pick it with no reason offered.',
      },
    ],
    accessibility: [
      'The highlight moves through aria-activedescendant while focus stays in the input — the ARIA combobox pattern. Hand-rolled comboboxes move focus into the list, and the typed text stops being editable.',
      'label is required, and it is announced with the summary rather than instead of it: the trigger reads “Tags, 3 selected”. Inside a Field the FIELD’s label supplies the name half and the label prop is neither rendered nor announced on the trigger — it still names the clear control, as “Clear Tags”, so it has to stay truthful even where the trigger no longer says it.',
    ],
    keyboard: [
      { keys: ['Enter', 'Space', '↓'], does: 'Opens the list.' },
      { keys: ['↑', '↓'], does: 'Moves the highlight while focus stays in the filter.' },
      { keys: ['Enter'], does: 'Chooses the highlighted option; choosing the current one clears it.' },
      { keys: ['Escape'], does: 'Closes without choosing.' },
    ],
    related: ['select', 'command'],
  },
  {
    name: 'DatePicker',
    group: 'Forms',
    summary: 'A date — or a span of them — chosen from a calendar.',
    when: 'Deliberately not a text input with a calendar attached: parsing a typed date needs a format, and 03/04 is March the fourth in one country and the third of April in the next. When the date is a long way back, the calendar’s month and year are dropdowns.',
    anatomy: [
      {
        element: 'Trigger',
        required: true,
        description:
          'A <button> printing format(value) or the placeholder, with a calendar glyph pinned at the end. It is named by the label and the printed date together, so the format is heard as well as seen.',
      },
      {
        element: 'Panel',
        description:
          'A Popover holding the rail and the grid — side by side from sm up, stacked below it, where two months would not fit anyway.',
      },
      {
        element: 'Preset rail',
        description:
          'A role="group" of plain buttons, present only when presets is set: on by default for DateRangePicker, off by default for DatePicker. A shortcut that lands on a disabledDates day is drawn unavailable and refuses the click.',
      },
      {
        element: 'Calendar grid',
        description:
          'The shared Calendar, autoFocus on open so the keyboard lands in the month rather than back at the trigger. Two months at once on the range picker, from months.',
      },
      {
        element: 'Half-range text',
        description:
          'The range trigger prints “from – …” while only one end is chosen, so a half-answered range says so on the closed control instead of looking finished.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Put the restriction in disabledDates rather than in your own handler. The rail asks it too, so a shortcut on a blocked day is disabled instead of committing a date the grid beside it refuses — a range preset is tested at its ENDS, so one straddling a blocked day is still offered, exactly as the grid still allows it.',
      },
      {
        kind: 'do',
        text: 'Pick controlled or uncontrolled and stay there. The current value is value ?? uncontrolled, so a controlled picker that clears by setting value to undefined falls through to whatever defaultValue seeded and the old date reappears.',
      },
      {
        kind: 'do',
        text: 'Validate a range before you use it: half a range is a legal state here — from set, to undefined — so a submit handler that reads value.to without checking gets undefined from a reader who simply closed the panel early.',
      },
      {
        kind: 'dont',
        text: 'A Field’s required does not reach the trigger. It is a plain <button>, a role with nowhere to put aria-required, so the asterisk above is the whole of the marking and a screen reader meets an ordinary optional field.',
      },
      {
        kind: 'dont',
        text: 'Do not reach for it for a birth date. There is no defaultMonth to pass: the panel always opens on the current month, so a date decades back begins with every reader in the month-and-year picker.',
      },
      {
        kind: 'dont',
        text: 'Do not disable it to show a fixed date. disabled takes the trigger out of the tab order and blocks its pointer events, and the trigger is the only place the chosen date is printed at all.',
      },
    ],
    accessibility: [
      'The trigger prints the date in the visitor’s own locale, not a fixed dd/mm/yyyy, and announces it as part of its own name — so format reaches a screen reader too.',
      'DateRangePicker keeps the panel open until both ends are chosen — a range is not a value until it has a second date.',
      'The shortcut rail is plain buttons, not a menu: they set the same value the grid beside them sets, so they belong to one control and Tab in the same pass.',
      'Presets are computed on click, so “today” means today even on a tab left open overnight.',
    ],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens the calendar.' },
      { keys: ['Escape'], does: 'Closes it without choosing.' },
    ],
    related: ['calendar', 'field'],
  },
  {
    name: 'ColorPicker',
    group: 'Forms',
    summary: 'A colour, chosen or typed.',
    when: 'A person is choosing the colour. A colour that is merely being SHOWN is a swatch, and a set of fixed brand colours is a RadioGroup — a picker offers sixteen million answers to a question with six.',
    anatomy: [
      {
        element: 'Trigger',
        required: true,
        description:
          'The closed control: a swatch, then the value as text, in the same box as Input and Select. Named by its label AND by its own value, so a reader hears “Brand colour, #a78bfa” rather than either half.',
      },
      {
        element: 'Swatch',
        description:
          'The colour over a checkerboard, so a half-transparent value reads as transparent rather than as a paler colour.',
      },
      {
        element: 'Notation strip',
        description:
          'Hex, OKLCH and Display P3, as a single-value ToggleGroup. It changes what onValueChange emits, not what the colour is — and hex and P3 are bounded, so switching to one of them fits the colour to that gamut on the way out.',
      },
      {
        element: 'Field',
        required: true,
        description:
          'The plane: chroma across, lightness up. Each ROW is normalised to the most chroma that exists at that lightness and hue, so the whole surface is reachable instead of a lens of colour inside bands of clipped duplicates. Underneath it are two real sliders rather than key handlers on a canvas, which is what gives it arrows, Home, End and an announced position.',
      },
      {
        element: 'Hue track',
        description:
          'A ramp taken at the lightness and chroma already chosen, not a generic rainbow — so the strip shows the hues of THIS colour rather than of some other one.',
      },
      {
        element: 'Opacity track',
        description: 'Transparent to the current colour, over the same checkerboard as the swatch.',
      },
      {
        element: 'CSS box',
        description:
          'The value as text. Accepts hex, rgb(), hsl(), oklch() and color(display-p3 …) in both syntaxes, and paints itself invalid on anything else.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Wrap it in a Field. The trigger is a button, which a label binds to and clicks through — one of the few composites where that works without help.',
      },
      {
        kind: 'do',
        text: 'Pass the notation you want back. The panel emits in whatever notation the value arrived in until somebody changes it in the strip, so a defaultValue of "#a78bfa" keeps a consumer in hex.',
      },
      {
        kind: 'do',
        text: 'Reach for this over <input type="color"> when the colours are being TUNED. The native picker works in HSV, where a row of constant lightness visibly darkens as it saturates — so a reader building a palette is fighting the instrument. OKLCH is the space where two colours at the same height genuinely match.',
      },
      {
        kind: 'dont',
        text: 'Do not pass a named colour. Hex, rgb(), hsl(), oklch() and color(display-p3 …) parse; "rebeccapurple" does not, and the box will show it as invalid. Resolving names needs a table of every CSS keyword or a live DOM, and a picker that takes some names and not others is worse than one that takes none.',
      },
      {
        kind: 'dont',
        text: 'Do not read the emitted string as a fixed notation. It is whatever the strip is set to, so a consumer that slices a "#" off the front breaks the first time a reader picks OKLCH.',
      },
      {
        kind: 'dont',
        text: 'Do not use it to pick text or background colour and call the result accessible. Nothing here measures contrast; a picker that lets a reader choose #eeeeee for body copy is doing exactly what it was asked.',
      },
    ],
    accessibility: [
      'label is required. The trigger shows a value, and a value is not a name.',
      'The plane is a group of two real sliders — Chroma and Lightness — each announced with a percentage, so the 2D surface is operable and reported rather than merely clickable.',
      'The focus ring is drawn on the plane, because the sliders that take the focus are visually hidden and the browser’s own ring is clipped away with them.',
      'Alpha is doubled by a checkerboard everywhere it is shown, so transparency is not carried by lightness alone.',
    ],
    keyboard: [
      { keys: ['Enter', 'Space'], does: 'Opens the panel.' },
      { keys: ['←', '→'], does: 'Moves the focused axis or track by one step.' },
      { keys: ['Home', 'End'], does: 'Jumps that axis or track to its ends.' },
      { keys: ['Escape'], does: 'Closes the panel; focus returns to the trigger.' },
    ],
    related: ['field', 'input', 'popover'],
  },
  {
    name: 'Slider',
    group: 'Forms',
    summary: 'A value chosen along a range.',
    anatomy: [
      {
        element: 'Track',
        required: true,
        description: 'A 1px rule in --stone that thickens to 1.5 when the pointer is anywhere over the control, not only over the thumb.',
      },
      {
        element: 'Range',
        description: 'The --accent fill from the minimum to the thumb, or between the two thumbs of a range.',
      },
      {
        element: 'Thumb',
        description:
          'One per entry in the value array — so the number of thumbs comes from the value, not from a prop, and a slider given neither value nor defaultValue falls back to the primitive’s own default of one thumb at the minimum. Each is a 16px circle with an invisible 44px hit area from a before pseudo-element.',
      },
      {
        element: 'Value readout',
        description:
          'Only with showValue: a mono row above the track, the names on the start edge and the formatted values on the end, each joined by an en dash and in the thumbs’ own order — so a two-ended range reads “Minimum – Maximum” over “10 – 90”.',
      },
      {
        element: 'Editable readout',
        description:
          'What editable turns those figures into: one box per thumb, showing format’s output at rest and the bare number while it has focus, so a reader still sees “$1,200” and a typist is never asked to type a currency symbol back. Each is named separately from its thumb — two controls announcing “Quality” is one control announced twice.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Pass defaultValue or value whenever there is more than one end to it. The thumb count comes from that array, so a price filter left to the default is a single thumb sitting at the minimum.',
      },
      {
        kind: 'do',
        text: 'Pass an array of two names for a two-thumb range: every thumb after the first falls back to names[0], so both ends of a price filter otherwise announce themselves as “Minimum”.',
      },
      {
        kind: 'do',
        text: 'Turn on editable when the exact number matters. A slider on its own cannot be typed into, and someone who needs 37 rather than roughly 40 is dragging a 16px thumb across a hundred steps to get it — the box in the readout is the way out, and it replaces the second Input this used to ask for.',
      },
      {
        kind: 'dont',
        text: 'format becomes each thumb’s aria-valuetext, which REPLACES the number rather than decorating it — so a formatter that rounds hard or drops the unit is what a screen reader gets instead of the value.',
      },
      {
        kind: 'dont',
        text: 'editable typing is bounded by the NEIGHBOURING thumb as well as by min and max, and it has to be: 90 typed into the lower end of a range sitting at 70 would otherwise cross the two thumbs over. So a number can be accepted and then land somewhere else, and the box shows where it landed.',
      },
      {
        kind: 'dont',
        text: 'Do not disable a slider to make it read-only: the whole control dims and stops taking the pointer, and Radix drops the thumb out of the tab order, so the value becomes unreachable rather than uneditable.',
      },
      {
        kind: 'dont',
        text: 'Do not pass two names to a one-thumb slider: the heading prints one name per THUMB, so the second is drawn nowhere and announced nowhere.',
      },
      {
        kind: 'dont',
        text: 'A Field’s label above it does not name it and does not click through: the role is on the THUMB and the root is a <span>, so the label prop here is the only name a reader hears. The hint and the error do reach the thumb.',
      },
    ],
    accessibility: [
      'label is required. A thumb that announces "42" and nothing else leaves a screen reader user with a number and no idea what it measures.',
      'A 44px hit area sits invisibly around the 16px thumb.',
      'format is announced as aria-valuetext, so a thumb showing “$1,200” says that rather than 1200.',
      'Arrows step, Page keys jump, Home and End reach the ends.',
    ],
    keyboard: [
      { keys: ['←', '→'], does: 'Moves by one step.' },
      { keys: ['Page Up', 'Page Down'], does: 'Moves by a larger step.' },
      { keys: ['Home', 'End'], does: 'Jumps to the minimum or maximum.' },
    ],
    related: ['progress'],
  },
  {
    name: 'ToggleGroup',
    group: 'Forms',
    summary: 'A segmented control: several options, one strip.',
    when: 'It changes a VALUE. Something that switches panels is Tabs.',
    anatomy: [
      {
        element: 'Strip',
        required: true,
        description:
          'The bordered pill holding the segments, w-fit as well as inline-flex — without it a flex or grid parent stretches the strip to the widest sibling and leaves dead space after the last segment.',
      },
      {
        element: 'Travelling pill',
        description:
          'The --accent block behind the selection, on single-value groups only and only once it has measured a selected segment. It moves rather than cross-fading, so the eye follows one thing.',
      },
      {
        element: 'Segment',
        required: true,
        description:
          'A button at --control-h-sm. In a single group it changes ink only and lets the pill behind it do the filling; in a multiple group it fills itself, because there is nothing travelling.',
      },
      {
        element: 'Segment content',
        description:
          'children, in a gap-2 row. There is no iconOnly path here the way Button has one, so an icon with no words is a segment with no name.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Give a single-value group a defaultValue or a value. The pill appears only after it has measured a selected segment, so a group that starts empty is a bare strip with nothing marked in it.',
      },
      {
        kind: 'do',
        text: 'Name the strip. Inside a Field its label does it, through aria-labelledby — the root is a div, so there is nothing for htmlFor to bind to — and standing alone it needs its own aria-label, which with type="single" is what a radiogroup is announced by.',
      },
      {
        kind: 'do',
        text: 'Give an icon-only segment its own aria-label: nothing strips the text or supplies a name for you here, so a strip of three glyphs announces three unnamed buttons.',
      },
      {
        kind: 'dont',
        text: 'type="single" has radio semantics but not radio behaviour: pressing the selected segment deselects it and commits an empty string, so a view switcher built on it can be switched off into no view at all.',
      },
      {
        kind: 'dont',
        text: 'Segments are --control-h-sm — 36px comfortable, 30px under data-density="compact" — which is below the 44px pointer floor (WCAG 2.5.5). A strip meant for a thumb needs its own height.',
      },
      {
        kind: 'dont',
        text: 'Do not put six options in it. The strip neither wraps nor scrolls, so past about five segments it simply runs out past its container, and that is a Select or a Combobox anyway.',
      },
      {
        kind: 'dont',
        text: 'A Field’s required marks a single-value strip and leaves a multiple-value one unmarked: that one is a role="toolbar", which takes no aria-required at all, so on type="multiple" the asterisk is the whole of the marking.',
      },
    ],
    accessibility: [
      'type="single" gets radio semantics; type="multiple" gets independent toggles. Choosing wrong tells a screen reader that picking one option unpicks the others.',
    ],
    keyboard: [
      { keys: ['Tab'], does: 'Moves into the strip — one stop for the group.' },
      { keys: ['←', '→'], does: 'Moves between segments.' },
      { keys: ['Enter', 'Space'], does: 'Toggles the focused segment.' },
    ],
    related: ['tabs', 'radio-group'],
  },
]
