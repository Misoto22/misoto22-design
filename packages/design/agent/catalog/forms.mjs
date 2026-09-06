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
          'label, rendered as a Radix <Label> carrying htmlFor. Optional: leave it off and the row is a control with a message under it and no name of its own.',
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
          'children — ONE element, which the field clones to add id, aria-describedby, aria-required and aria-invalid. This is the whole contract; everything else is layout.',
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
          'layout="row": the label and description in a column at the inline start, the control at the inline end, the message underneath both. Aligned to the START of the row and not centred, so a two-line description does not drag the switch down to the middle of the paragraph.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Make children the control itself, not a layout wrapper around it: the wiring is a cloneElement on the single child, so a <div> in between takes the id and the aria-describedby and the label ends up naming a box.',
      },
      {
        kind: 'do',
        text: 'Let error carry the invalid state for Input, Textarea and NativeSelect — the field sets aria-invalid on the child and all three read either spelling through isInvalid, so adding invalid as well states the same fact twice from two places that can disagree.',
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
        text: 'It cannot label a RadioGroup or a ToggleGroup. Both roots are <div role="radiogroup">, and htmlFor only binds to a labelable element, so the words above the group name nothing — give the group its own aria-label.',
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
        text: 'Select, Combobox, DatePicker and Slider swallow the wiring outright — Radix’s select root renders no DOM at all, Combobox and DatePicker never spread unknown props, and the slider root is a <span> — so the hint below them is drawn and never announced. Each takes its own required label, and that is what names it.',
      },
    ],
    accessibility: [
      'Generates an id when none is given, so the label always points at something.',
      'Wires aria-describedby, aria-required and aria-invalid onto the control, so validation is announced and not merely drawn.',
      'hint and error are one slot: when a field is wrong, the thing to read is what is wrong with it.',
      'description joins aria-describedby ahead of the message, so a settings row announces what the setting does and then what is wrong with it.',
      'The row layout moves the label to the other side of the row and changes nothing about the association — it is still htmlFor pointing at the cloned id, which is why the row works for Switch, Checkbox, Input, Textarea and NativeSelect and not for the six composite controls above.',
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
          'A <button role="combobox"> on CONTROL_BASE, so it matches the Input beside it exactly. It carries aria-label={label} and the chevron that turns over while the panel is open.',
      },
      {
        element: 'Value',
        description:
          'The chosen item’s text, or placeholder in --ink-3-aa when nothing is chosen. It has no truncation of its own, unlike the Combobox trigger.',
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
        text: 'Pass invalid as well as the Field’s error — this is the one control of the four on CONTROL_BASE that reads only that spelling, so a form library setting aria-invalid leaves the border resting while the message below it goes red.',
      },
      {
        kind: 'do',
        text: 'Divide long lists with SelectGroup and SelectLabel rather than a disabled item used as a heading: a disabled item is still an option, so a screen reader counts it and announces the list as one longer than it is.',
      },
      {
        kind: 'dont',
        text: 'The label above it does not click through. Field puts htmlFor on Radix’s select root, which renders no DOM node at all, so the words are bound to nothing — the required label prop is the trigger’s only name.',
      },
      {
        kind: 'dont',
        text: 'Do not let an option label run long: nothing truncates the value on the trigger, so it wraps and the field grows taller than the one beside it, which is the row that breaks a two-column form.',
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
      'label is required. The trigger shows a value, and a value is not a name.',
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
          'A relative <div> around the pair. It is the only control in this group that renders one, and className does NOT land on it — className goes to the <select> inside.',
      },
      {
        element: 'Control box',
        required: true,
        description:
          'The <select> on CONTROL_BASE, appearance-none so the platform’s own arrow is gone, with pe-9 of end padding so the longest option clears the drawn one.',
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
        text: 'Constrain the width from the parent rather than with className. className lands on the <select> while the chevron is positioned against the wrapper, so a narrowed field leaves its own arrow stranded at the far edge of the row.',
      },
      {
        kind: 'dont',
        text: 'multiple and size do not survive the styling: appearance-none plus a chevron pinned to the middle of the wrapper turns a list box into a scrolling column with an arrow drawn across it. Use checkboxes, or a multiple Combobox.',
      },
      {
        kind: 'dont',
        text: 'Do not use the first option as the label. “Select a country” is announced as a choosable value and it is the value an untouched form submits — put the name in a Field and give that option value="" and disabled.',
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
          'The minus that replaces the tick, chosen from props.checked === "indeterminate". That reads the CONTROLLED prop, so an uncontrolled box never draws it.',
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
        text: 'Drive indeterminate through the controlled checked prop. The glyph is picked from props.checked, so defaultChecked="indeterminate" fills the box and draws a tick — the “all of them” picture on a partly selected list.',
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
          'A <div role="radiogroup"> stacking its options. Being a div is why a label above it cannot point at it, and why the group needs aria-label rather than a Field’s htmlFor.',
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
        text: 'Give the group an aria-label. The root is a div, and htmlFor — including the one a Field draws — does not bind to a div, so without it the group is announced with no name at all and the options are three unlabelled radios.',
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
          'A <button role="combobox"> carrying aria-label={label} and aria-expanded. Its text truncates rather than wrapping, so the field keeps its height whatever is chosen.',
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
        text: 'The trigger’s aria-label replaces its text as the accessible name, so a screen reader is told “Tags” and never “3 selected”. If the choice has to be confirmable without opening the panel, print it outside the control as well.',
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
      'label is required: the trigger prints a value, and a value is not a name.',
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
          'A <button> printing format(value) or the placeholder, with a calendar glyph pinned at the end. It carries aria-label={label}, and that is the whole of its accessible name.',
      },
      {
        element: 'Panel',
        description:
          'A Popover holding the rail and the grid — side by side from sm up, stacked below it, where two months would not fit anyway.',
      },
      {
        element: 'Preset rail',
        description:
          'A role="group" of plain buttons, present only when presets is set: on by default for DateRangePicker, off by default for DatePicker.',
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
        text: 'Check disabledDates against your presets by hand. The rail calls preset.value() straight into the same setter the grid uses and is never tested against disabledDates, so “Last 30 days” will happily commit a range the grid itself refuses.',
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
        text: 'format changes only what the trigger prints. The trigger is named by aria-label, which replaces its text, so no amount of formatting reaches a screen reader — put the chosen date in the Field’s hint if it has to be heard.',
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
      'The trigger prints the date in the visitor’s own locale, not a fixed dd/mm/yyyy.',
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
          'One per entry in the value array — so the number of thumbs comes from the value, not from a prop. Each is a 16px circle with an invisible 44px hit area from a before pseudo-element.',
      },
      {
        element: 'Value readout',
        description:
          'Only with showValue: a mono row above the track, the name on the start edge and the formatted value on the end, joined by an en dash when there are two. It prints the FIRST name only.',
      },
    ],
    practices: [
      {
        kind: 'do',
        text: 'Always pass defaultValue or value. The thumbs are rendered from this component’s own array rather than from Radix’s [min] default, so a Slider given neither draws a track with nothing on it to drag.',
      },
      {
        kind: 'do',
        text: 'Pass an array of two names for a two-thumb range: every thumb after the first falls back to names[0], so both ends of a price filter otherwise announce themselves as “Minimum”.',
      },
      {
        kind: 'do',
        text: 'Put an Input beside it when the exact number matters. A slider cannot be typed into, and someone who needs 37 rather than roughly 40 is dragging a 16px thumb across a hundred steps to get it.',
      },
      {
        kind: 'dont',
        text: 'format does not reach assistive tech. It renders the printed readout and nothing sets aria-valuetext, so a thumb showing “$1,200” still announces the bare number 1200.',
      },
      {
        kind: 'dont',
        text: 'Do not rely on disabled looking disabled: the thumb is a <span>, and a disabled: variant needs a real form element, so a disabled slider is drawn exactly like a live one while refusing to move.',
      },
      {
        kind: 'dont',
        text: 'Do not use showValue as the label for a two-thumb range — the heading prints names[0] only, so a slider labelled ["Minimum", "Maximum"] shows “Minimum” above both numbers.',
      },
    ],
    accessibility: [
      'label is required. A thumb that announces "42" and nothing else leaves a screen reader user with a number and no idea what it measures.',
      'A 44px hit area sits invisibly around the 16px thumb.',
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
        text: 'Name the strip with aria-label. The root is a div, so there is nothing for a label to bind to — and with type="single" it is a radiogroup, which assistive tech announces by name and count.',
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
