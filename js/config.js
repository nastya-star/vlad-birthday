/* ==========================================================================
   CUSTOMIZE YOUR WEBSITE HERE
   --------------------------------------------------------------------------
   This is the only file you need to edit. The UI reads everything from
   window.BIRTHDAY_CONFIG — you never have to touch index.html, the CSS or
   app.js to change names, photos, stickers or notes.
   ========================================================================== */
window.BIRTHDAY_CONFIG = {

  /* ---------- Who it's for ---------- */
  friendName: "Vlad",                     // used everywhere {name} appears below ({NAME} = uppercase)
  fromName:   "Anastasiia",             // footer + postcard sender line

  /* ---------- Welcome poster ----------
     The big curved title around the swirl. {name} / {NAME} are replaced by
     friendName (as written / in capitals).
     Long names are automatically squeezed to fit the arc. */
  title: {
    top:    "THE GREAT",
    bottom: "{NAME} HUNT",
    ring:   "FELIZ ANIVERSÁRIO ✦ POSTAL DE ANIVERSÁRIO ✦ BOA VIAGEM ✦ ",
    tagline: "A birthday postcard, sent somewhere across Latin America",
  },

  /* ---------- Password (optional) ----------
     Forgiving match: capitals, spaces, punctuation and accents are ignored
     ("feliz cumple" unlocks "¡Feliz cumple!"). Set to "" to skip the password and show an
     "open the postcard" button instead. A hint with a "reveal" option
     pops up after `hintDelaySeconds` so nobody gets locked out. */
  password: "¡Feliz cumple!",
  hintDelaySeconds: 6,

  /* ---------- Face stickers (the hunt) ----------
     One entry per collectible sticker. The number of stickers to find is
     simply the length of this list (or `stickersRequired` if you set it).

     src     : sticker image in assets/stickers/ (PNG or WebP with a
               transparent background). If a file is missing the site shows
               a neutral numbered placeholder sticker instead.
     label   : short name shown in the sticker album
     zone    : where it hides. One of:
                 "hero"      – on the welcome poster
                 "postcards" – around the photo postcards
                 "notes"     – among the friends' notes
                 "album"     – near the sticker-album teaser
                 "cake"      – around the cake
                 "footer"    – at the very bottom of the page
     x, y    : position inside that zone, in % (0–100). Optional.
               Values near 0 or 100 make the sticker peek in from the edge.
     size    : width while hidden — px number, or a CSS string like "30%" (default 64)
     tilt    : rotation in degrees while hidden (optional)
     hint    : shown in the album until it's found
     Vlad's stickers live in assets/stickers/ as 640px web copies;
     the untouched full-size files are kept in assets/stickers/originals/. */
  stickers: [
    { id: "sunshine",   src: "assets/stickers/vlad-13.webp", label: "Sunshine",         zone: "hero",      x: 50, y: 50, size: "37%", tilt: -3,  hint: "Right in the middle of everything." },
    { id: "golden",     src: "assets/stickers/vlad-09.webp", label: "Golden Hour",      zone: "hero",      x: 5,  y: 95, size: 64,  tilt: 12,  hint: "Hiding in a corner of the poster." },
    { id: "takeoff",    src: "assets/stickers/vlad-05.webp", label: "Takeoff",          zone: "postcards", x: 95, y: 5,  size: 70,  tilt: 10,  hint: "Flying over the postcards." },
    { id: "squint",     src: "assets/stickers/vlad-06.webp", label: "Sun in His Eyes",  zone: "postcards", x: 3,  y: 52, size: 64,  tilt: -14, hint: "Squinting at the edge of the postcards." },
    { id: "smirk",      src: "assets/stickers/vlad-01.webp", label: "The Smirk",        zone: "postcards", x: 96, y: 94, size: 62,  tilt: 8,   hint: "Under the last pile of postcards." },
    { id: "ears",       src: "assets/stickers/vlad-07.webp", label: "Ear Check",        zone: "notes",     x: 3,  y: 7,  size: 64,  tilt: -10, hint: "Someone is pulling his ears near the mail." },
    { id: "ears2",      src: "assets/stickers/vlad-08.webp", label: "Ear Check, Again", zone: "notes",     x: 97, y: 62, size: 60,  tilt: 12,  hint: "Another ear check, beside a letter." },
    { id: "stare",      src: "assets/stickers/vlad-03.webp", label: "The Stare",        zone: "notes",     x: 50, y: 98, size: 60,  tilt: -6,  hint: "Watching from below the notes." },
    { id: "passport",   src: "assets/stickers/vlad-04.webp", label: "Passport Photo",   zone: "album",     x: 4,  y: 14, size: 60,  tilt: 8,   hint: "Peeking at his own album." },
    { id: "serious",    src: "assets/stickers/vlad-14.webp", label: "Mr. Serious",      zone: "album",     x: 97, y: 86, size: 60,  tilt: -9,  hint: "Guarding the album's corner." },
    { id: "bigode",     src: "assets/stickers/vlad-10.webp", label: "O Bigode",         zone: "cake",      x: 91, y: 10, size: 66,  tilt: 9,   hint: "The moustache is near the cake." },
    { id: "cakeface",   src: "assets/stickers/vlad-11.webp", label: "Cake Face",        zone: "cake",      x: 8,  y: 24, size: 66,  tilt: -14, hint: "Someone already tried the cake…" },
    { id: "cakeface2",  src: "assets/stickers/vlad-12.webp", label: "Cake Face, Again", zone: "cake",      x: 93, y: 72, size: 62,  tilt: 11,  hint: "…and went back for seconds." },
    { id: "peace",      src: "assets/stickers/vlad-02.webp", label: "Peace Out",        zone: "footer",    x: 84, y: 34, size: 62,  tilt: 8,   hint: "Saying goodbye at the very end." },
  ],
  // stickersRequired: 14,   // optional; defaults to stickers.length

  /* These stickers already include their own white die-cut edge, so the
     site's automatic outline is switched off. Set to true for plain
     cut-outs without an edge. */
  addStickerOutline: false,

  /* ---------- Photo postcards ----------
     Static sites can't list a folder's contents, so add one line per file.
     Put the files in assets/photos/ (sub-folders are fine), and optionally a
     smaller copy in assets/photos/thumbs/ for the grid.
     `category` must match one of `photoCategories`. Videos (.mp4) work too.
     Empty categories show illustrated placeholder postcards. */
  photoCategories: ["ICONIC", "FUNNY", "THE CREW", "CAKE ATTACK"],
  // src   = full-size file (shown in the big viewer)
  // thumb = optional smaller copy for the gallery grid (faster on phones)
  // place = optional; printed under the caption and in the postmark
  photos: [
    { src: "assets/photos/vlad-01.jpg", thumb: "assets/photos/thumbs/vlad-01.jpg", category: "ICONIC", caption: "three beautiful people", alt: "Vlad with the moustached ringmaster at the theatre" },
    { src: "assets/photos/vlad-02.jpg", thumb: "assets/photos/thumbs/vlad-02.jpg", category: "ICONIC", caption: "who is there", alt: "Close-up of Vlad's face in front of a colourful mural" },
    { src: "assets/photos/vlad-03.jpg", thumb: "assets/photos/thumbs/vlad-03.jpg", category: "FUNNY", caption: "ear inspection", alt: "Vlad getting his ears pulled in front of the mural" },
    { src: "assets/photos/vlad-04.jpg", thumb: "assets/photos/thumbs/vlad-04.jpg", category: "FUNNY", caption: "ear inspection, part two", alt: "Vlad with eyes closed while his ears are pulled" },
    { src: "assets/photos/vlad-05.jpg", thumb: "assets/photos/thumbs/vlad-05.jpg", category: "FUNNY", caption: "upside-down portrait", alt: "Upside-down selfie above Vlad's head" },
    { src: "assets/photos/vlad-06.jpg", thumb: "assets/photos/thumbs/vlad-06.jpg", category: "FUNNY", caption: "…now with extra hair", alt: "Second upside-down selfie with hair everywhere" },
    { src: "assets/photos/vlad-07.jpg", thumb: "assets/photos/thumbs/vlad-07.jpg", category: "THE CREW", caption: "graduation night", alt: "Vlad and friends under a rose arch, thumbs up" },
    { src: "assets/photos/vlad-08.jpg", thumb: "assets/photos/thumbs/vlad-08.jpg", category: "THE CREW", caption: "", alt: "Vlad with a peace sign by the chalkboard" },
    { src: "assets/photos/vlad-09.jpg", thumb: "assets/photos/thumbs/vlad-09.jpg", category: "FUNNY", caption: "tongue out", alt: "Selfie with Vlad sticking his tongue out" },
    { src: "assets/photos/vlad-10.jpg", thumb: "assets/photos/thumbs/vlad-10.jpg", category: "THE CREW", caption: "", alt: "Vlad and four friends in the park" },
    { src: "assets/photos/vlad-11.jpg", thumb: "assets/photos/thumbs/vlad-11.jpg", category: "CAKE ATTACK", caption: "солоденьке день народження", alt: "Vlad with a face full of cream" },
    { src: "assets/photos/vlad-12.jpg", thumb: "assets/photos/thumbs/vlad-12.jpg", category: "CAKE ATTACK", caption: "survivors of the cake", alt: "The gang throwing peace signs after the cake" },
    { src: "assets/photos/vlad-13.jpg", thumb: "assets/photos/thumbs/vlad-13.jpg", category: "CAKE ATTACK", caption: "дьявол вселился в настю", alt: "Vlad, cream-faced, walking away laughing friends" },
    { src: "assets/photos/vlad-14.jpg", thumb: "assets/photos/thumbs/vlad-14.jpg", category: "THE CREW", caption: "park selfie", alt: "Selfie of Vlad and a friend in the park" },
    { src: "assets/photos/vlad-15.jpg", thumb: "assets/photos/thumbs/vlad-15.jpg", category: "THE CREW", caption: "up and upper", alt: "Selfie on the grass with a friend staring at the camera" },
    { src: "assets/photos/vlad-16.jpg", thumb: "assets/photos/thumbs/vlad-16.jpg", category: "FUNNY", caption: "duck faces", alt: "Duck-face selfie under the trees" },
    { src: "assets/photos/vlad-17.jpg", thumb: "assets/photos/thumbs/vlad-17.jpg", category: "FUNNY", caption: "the original ear check", alt: "A friend pulling Vlad's ears in front of the mural" },
    { src: "assets/photos/vlad-18.jpg", thumb: "assets/photos/thumbs/vlad-18.jpg", category: "ICONIC", caption: "Да ти шоооо хто тут таких", alt: "Vlad and two friends posing in the park" },
    { src: "assets/photos/vlad-19.jpg", thumb: "assets/photos/thumbs/vlad-19.jpg", category: "ICONIC", caption: "class of 2021", alt: "Graduation group photo, class of 2021" },
  ],

  /* ---------- Friends' notes ----------
     Each becomes a little postcard. `from` (a city) is optional and is
     printed in the postmark. */
  notes: [
    { name: "Діана Рокова", message: "Влад, фіг знає скіки тобі років але твої вуса кажуть що вже достатньо (файні до речі). Було б круто побачить їх вживу. Пью за тебе і твоє майбутнє чеського козлика в Празі." },
    { name: "Dima Gashchenko", message: "Vlad, kurwa, najlepszego z okazji urodzin! Życzę ci, żeby hajsu było w chuj, zdrowia opór i żeby wszystko w życiu siadało idealnie. Bądź twardy jak ten legendarny bóbr, kurwa — rozwalaj każdy temat i miej na wszystko wyjebane. Sto lat, mordo!" },
    { name: "Настя", message: "С днем рождения:Р" },
    { name: "Валентина", message: "Владіііік, вітаю з Днем народження! 🥳🎉

Бажаю, щоб щастя було нескінченним, зарплата зростала експоненціально, проблеми прямували до нуля, а удача була незмінною константою! 🤓

Нехай життя буде суцільним плюсом, а якщо й траплятимуться мінуси — то тільки парами, щоб у результаті завжди виходив плюс! 😁

І нехай будь-яке життєве рівняння завжди має розв’язок на твою користь! 🎂❤️" },
  ],

  /* ---------- Final reveal (after all stickers are found) ---------- */
  reveal: {
    unlockedLine: "All {count} stickers found. The album is complete — and so is the cake.",
    message:      "Happy birthday, {name}! Wish we were there.",
    ps:           "P.S. — the next postcard should come with you in person.",
  },
};
