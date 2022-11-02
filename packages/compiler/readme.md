# Theme Contracts Compiler

## What

Exposes a DSL for constructing theme contracts inside of CSS files and modules

Example contract:

```
@contract anchor
{
	color: color
	weight: number
	padding: dimension
	alignment: flex-alignment
	hover {
		color: color
	}
}
```

The contract tag creates a theme contract object that can be used to enforce the existence
and types of these variables which would be consumed by the components using that CSS file.

This contract would produce 5 type-checked CSS variables:

- --anchor-color
- --anchor-weight
- --anchor-padding
- --anchor-alignment
- --anchor-hover-color

After generating the contract, it can be used to type-check an output CSS file for the existence
of all the required variables.

## Running

Example Output:
```
Report for theme: ./sample-app/themes/dark.css
✓ --anchor-color
✓ --anchor-weight
✓ --anchor-padding
✓ --anchor-alignment
✓ --anchor-hover-color
✓ --navbar-background
✓ --navbar-height
✓ --section-background

Report for theme: ./sample-app/themes/light.css
✓ --anchor-color
✓ --anchor-weight
✓ --anchor-padding
✕ --anchor-alignment
  Missing declaration
⚠ --anchor-hover-color
  Invalid type - expected [Color], found [32px]
✓ --navbar-background
✓ --navbar-height
✓ --section-background
⚠ --some-other-var
  Found variable --some-other-var, but found no matching contract declaration
```

### Try this!

- Add some new theme entries to the theme contracts in the `*.module.css` files
- Delete one of the theme variables
- Add an invalid theme entry to see detailed parser error reporting
- Change one of the theme variable types to see type checking
