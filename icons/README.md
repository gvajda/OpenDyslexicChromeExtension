# Extension Icons

The extension requires PNG icons in three sizes:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

## Creating Icons from SVG

You can use the provided `icon.svg` file to generate the required PNG files:

### Using ImageMagick (command line):
```bash
# Install ImageMagick if not already installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate PNG files
convert icon.svg -resize 16x16 icon16.png
convert icon.svg -resize 48x48 icon48.png
convert icon.svg -resize 128x128 icon128.png
```

### Using Inkscape (command line):
```bash
inkscape icon.svg --export-filename=icon16.png -w 16 -h 16
inkscape icon.svg --export-filename=icon48.png -w 48 -h 48
inkscape icon.svg --export-filename=icon128.png -w 128 -h 128
```

### Using Online Tools:
- https://cloudconvert.com/svg-to-png
- https://svgtopng.com/

### Using Design Software:
- Open icon.svg in Figma, Sketch, Adobe Illustrator, or Inkscape
- Export as PNG at the required sizes

## Temporary Placeholder Icons

For testing purposes, you can create simple solid-color PNG files using this ImageMagick command:

```bash
convert -size 16x16 xc:#4A90E2 icon16.png
convert -size 48x48 xc:#4A90E2 icon48.png
convert -size 128x128 xc:#4A90E2 icon128.png
```

This will create blue square icons that will work for development and testing.
