# Ultimate Bingo Maker

A static, purely frontend-based web application to generate, play, and print beautiful Bingo cards.

## Features
- **No Server Required**: Built with Vanilla HTML, CSS, and JS. Just open `index.html` in your browser or host it on GitHub Pages!
- **Seeded Randomness**: Enter a "seed" (like `party2026`) and you'll always get the exact same board layout. Perfect for sharing identical games with friends.
- **State Persistence**: If you accidentally refresh the page or close your mobile browser, your current board layout, theme, background, and crossed-out cells will be remembered.
- **Custom Backgrounds**: Upload your own image directly from your device to personalize your bingo board.
- **Theme Creator**: Includes an in-app tool to generate new Bingo themes easily.
- **Print Ready**: Optimized CSS for printing exactly what matters (hides the UI controls and background automatically).

## How to Run Locally

1. Clone or download this repository.
2. Open the `index.html` file in any modern web browser.
3. No build steps or installations needed!

## How to Add New Themes

1. Open the application in your browser.
2. Click the **✨ Create Theme** button.
3. Enter a name for your theme (e.g., `Office Meeting`).
4. Paste at least 24 bingo options (one per line).
5. Click **Download Theme File**. It will save a `.js` file to your computer.
6. Move the downloaded `.js` file into the `themes/` folder in your project directory.
7. Open `index.html` in a text editor and add a `<script>` tag referencing your new theme, just below the existing ones:
   ```html
   <!-- Load themes -->
   <script src="themes/eurovision.js"></script>
   <script src="themes/office-meeting.js"></script> <!-- Your new theme -->
   ```
8. Refresh the page! Your new theme will automatically appear in the dropdown.

## Hosting on GitHub Pages

1. Push this repository to GitHub.
2. Go to your repository's **Settings** > **Pages**.
3. Under **Source**, select the `main` branch (or whichever branch you are using) and the `/ (root)` folder.
4. Click **Save**. Your Bingo Maker will be live at `https://<your-username>.github.io/<repository-name>/`!

## Design Details

- **Responsive & Premium Look**: Uses modern design trends, custom Google Fonts ("Outfit"), and elegant glassmorphism.
- **Animations**: Enjoy micro-interactions when hovering, clicking, and a rainbow celebration when you score a BINGO!

## Enjoy! 🎲
