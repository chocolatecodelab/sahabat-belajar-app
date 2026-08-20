---
name: Academic Innovation
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#444650'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#747781'
  outline-variant: '#c4c6d2'
  surface-tint: '#425c9d'
  primary: '#001847'
  on-primary: '#ffffff'
  primary-container: '#0b2c6b'
  on-primary-container: '#7d96db'
  inverse-primary: '#b2c5ff'
  secondary: '#7a5900'
  on-secondary: '#ffffff'
  secondary-container: '#fdbc13'
  on-secondary-container: '#6b4d00'
  tertiary: '#340f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#561e00'
  on-tertiary-container: '#d6825a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2ff'
  primary-fixed-dim: '#b2c5ff'
  on-primary-fixed: '#001848'
  on-primary-fixed-variant: '#294483'
  secondary-fixed: '#ffdea3'
  secondary-fixed-dim: '#fdbc13'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#743413'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  unit-xs: 4px
  unit-sm: 8px
  unit-md: 16px
  unit-lg: 24px
  unit-xl: 48px
  unit-xxl: 80px
---

## Brand & Style

This design system is engineered for **BIAS RISTEK**, a research talent development program that bridges the gap between academic rigor and modern innovation. The brand personality is **authoritative yet accessible**, designed to evoke feelings of trust, intellectual growth, and professional advancement. 

The design style follows a **Corporate / Modern** aesthetic, heavily influenced by leading educational platforms. It prioritizes clarity through generous whitespace, a structured information hierarchy, and a refined "Modern Academic" feel. The interface avoids unnecessary decoration, focusing instead on content legibility and a systematic approach to data visualization and program pathways.

## Colors

The palette is anchored by **Deep Research Blue**, symbolizing stability and institutional trust. **Scholastic Gold** serves as the primary secondary color, used strategically for calls-to-action and highlighting achievement. **Innovation Red** is reserved for critical accents and error states to maintain its impact.

The background is a cool-toned off-white (#F8FAFC), which reduces eye strain during long reading sessions compared to pure white. Neutral grays are used to establish a clear hierarchy in text and UI borders, ensuring the interface feels layered and sophisticated.

## Typography

Note: While the request mentioned Poppins, **Plus Jakarta Sans** is utilized for headlines within this design system to provide a more contemporary, "tech-forward" academic feel that scales better in professional SaaS contexts. **Inter** is used for body text due to its exceptional legibility in data-dense environments.

Headlines use a bold weight and tight letter-spacing to create a sense of importance. Body text is optimized for long-form reading with a generous 1.6 line-height. Label styles utilize uppercase tracking to differentiate meta-information from primary content.

## Layout & Spacing

The layout utilizes a **Fixed Grid** system for desktop (12 columns) to maintain a centered, scholarly reading experience, transitioning to a fluid layout for mobile devices. 

- **Desktop:** 12 columns, 24px gutters, 64px side margins.
- **Tablet:** 8 columns, 16px gutters, 32px side margins.
- **Mobile:** 4 columns, 16px gutters, 20px side margins.

Spacing follows an 8px base grid. Use `unit-xxl` (80px) for section vertical padding to emphasize the "spacious and clean" requirement. Elements within cards should use `unit-md` (16px) for internal padding to maintain a compact yet breathable feel.

## Elevation & Depth

To achieve a clean and trustworthy look, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

1.  **Level 0 (Base):** The #F8FAFC background.
2.  **Level 1 (Cards):** White surfaces (#FFFFFF) with a very soft, diffused shadow (0px 4px 20px rgba(11, 44, 107, 0.05)). This subtle blue-tinted shadow keeps the design "grounded" in the primary brand color.
3.  **Level 2 (Hover/Interactions):** Increased shadow spread (0px 10px 30px rgba(11, 44, 107, 0.10)) to indicate interactivity.
4.  **Borders:** Use a 1px solid border (#E2E8F0) for secondary elements like input fields and inactive cards to maintain structure without adding visual weight.

## Shapes

The design system employs **Rounded** corners (8px/0.5rem) as the standard. This choice strikes a balance between the "sharp" traditional academic style and the "soft" approachable nature of modern EdTech.

- **Standard Buttons & Inputs:** 8px (Rounded).
- **Program/Feature Cards:** 16px (Rounded-LG) to create a distinct container feel.
- **Progress Bars & Tags:** 100px (Full Pill) to differentiate status indicators from structural elements.

## Components

### Feature Cards
Feature cards use a white background, Level 1 elevation, and a top-accent border (4px) in Primary Blue. Icons should be placed in a 48x48px circle with a 10% opacity version of the icon color as the background.

### Horizontal Timeline
The timeline uses a solid 2px line in Primary Blue. Each milestone is represented by a Primary Blue dot. Active/Past phases are filled; future phases use a white fill with a blue stroke. Tooltips appear above dots on hover to show phase details.

### Program Cards
These are the primary conversion drivers. They feature a 16:9 aspect ratio header image with 16px top-corner rounding. Use Scholastic Gold for "Open Enrollment" status chips and Primary Blue for "Learn More" buttons.

### Statistics & Metrics
Stats should use `display-md` typography for the numerical value. Use Primary Blue for the numbers and Secondary Gold for a small vertical "accent bar" to the left of the stat to draw the eye.

### Buttons
- **Primary:** Primary Blue fill, White text, 8px roundedness. On hover, darken the blue by 10%.
- **Secondary:** White fill, Primary Blue border (2px), Primary Blue text.
- **Tertiary/Ghost:** Transparent background, Primary Blue text, for low-priority actions.

### Input Fields
Inputs use a 1px #E2E8F0 border. On focus, the border transitions to Primary Blue with a 3px "focus ring" of 10% Primary Blue opacity.