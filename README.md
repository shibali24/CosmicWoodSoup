Github Repo: https://github.com/shibali24/CosmicWoodSoup
Demo: https://drive.google.com/file/d/1NZfevVqvGR_M-xVRUk2lvpnYP62F5FXN/view?usp=sharing
Link: https://openprocessing.org/sketch/2827253

# Cosmic Wood Soup

An interactive p5.js casual creator where you drag planets around a starfield to paint glowing, symmetric “cosmic silk” trails with calming wood sounds.

---

## Overview

In Cosmic Wood Soup users casually create layered, spirograph space art by dragging planets that paint ribbon trails reflected around the sun in multiple symmetric slices, so even small movements quickly become something that looks intentional and shareable. The system keeps people engaged through immediate feedback: dragging injects color into a flow field, particles swirl through it, and the trail thickens and sparkles the longer you keep moving, while each planet has its own visual identity and a looping wood sound that plays as you interact. Those wood taps, knocks, and impacts are meant to feel ASMR-like, adding a calming layer that makes the experience soothing even when you are just slowly moving a planet in circles. Clicking the sun adds another satisfying moment by triggering a burst that shifts the overall mood of the canvas. Because the symmetry and glow do a lot of the artistic work, users can make striking images without needing traditional drawing skills, and the experience naturally encourages sharing by pausing when a pattern feels complete and taking a screenshot of the final frame.

---

## Personally meaningful to me

This project is basically my digital version of making mandalas as a kid. I grew up playing with spirograph patterns on paper, and I loved the feeling of getting something intricate from simple repeated motion. I wanted that same feeling here. When a user drags a planet, the trail gets reflected across multiple axes, so it feels like you are “discovering” a pattern rather than forcing it. I was inspired by Star Wars and made it space themed because I like that mix of calm space vibes and playful adventure energy.

Also, I am a big wood soup fan. I wanted the experience to feel soothing and ASMR-like, so the sounds are soft wood taps and knocks that pair with the slow swirling visuals. These sounds were also all originally produced by me.

---

## How this challenged me

The biggest challenge was learning JavaScript well enough to build something that felt responsive and polished, since I had not used it much before. Getting the flow field, particles, symmetry drawing, and audio behavior to feel stable took a lot of iteration. I had to learn how p5.js timing, mouse events, and the sound library work together, and I had to fix small interaction issues like starting audio only after a user clicks and fading loops in and out cleanly. Next steps for me would be adding an explicit “save image” button and giving users more control over symmetry and color themes.

---

## How to run

### OpenProcessing (recommended)

Follow the link here:  
https://openprocessing.org/sketch/2827253

And enjoy!

---

## Controls

- Click once to begin (also enables audio in most browsers)
- Drag planets to paint trails and hear wood sounds
- Click the sun to trigger a burst effect
- Press **F** to toggle fullscreen

---

## Known issues

If you double click `index.html` and open it directly, it will not work. I had a lot of issues running it locally, so just use the OpenProcessing website.

---

## Credits and references

- **Planet art source:** Vecteezy “Different planets in solar system on transparent background”  
  (I photoshopped them for transparent backgrounds and isolated each planet)  
  https://www.vecteezy.com/vector-art/447949-different-planets-in-solar-system-on-transparent-background

- **Inspiration:** Star Fluid by jotrdl  
  https://jotrdl.github.io/experiments/starfluid/

- **OpenProcessing demo listing and licensing info:**  
  “shibali_m4” by Shibali Mishra  
  https://openprocessing.org/sketch/2827253  
  License: CreativeCommons Attribution NonCommercial ShareAlike  
  https://creativecommons.org/licenses/by-nc-sa/3.0
