# Figma AST Viewer

This project demonstrates a front-end UI implementation based on the Figma AST (Abstract Syntax Tree) data extracted from the `/tools/figma-ast-split` directory. The UI represents a design for an event management system with bidding functionality.

## Features

- Responsive design that works on desktop and mobile devices
- Interactive UI elements with hover effects
- Material Icons integration
- Clean, modern styling based on the Figma design tokens
- Components matching the Figma structure:
  - Page Header with actions
  - Event Details section
  - Bids section with active and inactive items
  - Status badges and icons

## Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling with design tokens matching Figma
- `script.js` - Simple JavaScript for interactivity

## How to Use

1. Open `index.html` in a web browser to view the UI
2. Interact with buttons and elements to see hover effects
3. Check the console for interaction logs

## Design Elements

The UI implements several components from the Figma design:

- **Page Header** - With back button, title, description, and action buttons
- **Event Details** - Shows event information with extra details
- **Bids Section** - Displays active bids with vendor information
- **Inactive Bids** - Shows expired or inactive bids

## Design Tokens

The UI uses design tokens extracted from the Figma AST:

- Primary color: `hsl(221, 83%, 53%)`
- Primary foreground: `hsl(210, 40%, 98%)`
- Accent: `hsl(210, 40%, 96.1%)`
- Accent foreground: `hsl(222.2, 47.4%, 11.2%)`
- Border: `hsl(214.3, 31.8%, 91.4%)`

## Future Improvements

- Add dynamic data loading from the AST files
- Implement more interactive features
- Add form functionality for bid submissions
- Expand the UI to cover more screens from the Figma design
