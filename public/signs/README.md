# Sign images

Drop an image here named after a sign id and the app will use it instead of the drawing
built into `lib/signs.ts`. Any of `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`.

    public/signs/stop.png
    public/signs/curve-right.jpg

The manifest is rebuilt automatically before `npm run dev` and `npm run build`. If you
add an image while the dev server is already running, run `npm run signs` and refresh.

Open `/signs` in the app to see every sign and whether it's using your image or a drawing.

Filenames must match a sign id exactly. `npm run signs` prints the full list of valid ids
and warns about files it ignored.
