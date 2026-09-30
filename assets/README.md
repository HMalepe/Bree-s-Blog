# Photos and hero video

Photos are from Bree's public Instagram (@mokoena_bree). Each file is used once. Long edge ≤ 1600px, progressive JPEG, about quality 80, each file under ~400KB. If a file goes missing, its slot falls back to the gradient.

The hero stills (`hero-wide-poster.jpg`, `hero-tall-poster.jpg`) are the first frames of the Mixkit clips. They show until the video plays, and in place of it for reduced-motion and no-JS visitors.

| File | Ratio | Used in |
|---|---|---|
| `portrait-sea.jpg` | 3:4 | gallery **focus tile** (gets the sand frame) |
| `cliff-hat.jpg` | 4:5 | featured tall card |
| `serum-ritual.jpg` | 1:1 | bubble "Health Notes" |
| `supplements.jpg` | 4:5 | "Supplements" card |
| `cafe-harbour.jpg` | 16:11 | "9-to-6" card (dispensary interior) |
| `sunscreen-smile.jpg` | 1:1 | bubble "Myths" |
| `bougainvillea.jpg` | 3:4 | bubble outer |
| `road-trip.jpg` | 16:10 | "Finishing the course" note |
| `frangipani.jpg` | 1:1 | "Reading a label" note |
| `pool-day.jpg` | 4:5 | bubble "Rituals" |
| `capetown.jpg` | 16:9 | bubble "Myths" outer |
| `umbrella-laugh.jpg` | 3:4 | bubble "Quizzes" |
| `vineyard.jpg` | 16:9 | bubble "Quizzes" outer |
| `wildflowers.jpg` | 16:9 | bubble "Health Notes" outer |
| `forest.jpg` | 3:4 | "Slow mornings" note |
| `meadow-picnic.jpg` | 4:5 | "Sunday reset" card |
| `greenhouse.jpg` | 16:11 | "Natural doesn't mean harmless" card |
| `cabinet.jpg` | 16:10 | "Cabinet audit" note |
| `pharmacy.jpg` | 4:3 | "Pharmacy" step |
| `skin-card.jpg` | 1:1 | "Sunscreen, decoded" card |
| `explainers.jpg` | 1:1 | "Explainers" step |
| `content-step.jpg` | 16:10 | "Content" step |
| `collab-step.jpg` | 4:3 | "Collaborations" step |
| `quizzes-step.jpg` | 16:10 | "Quizzes" step (quiz card placeholder) |
| `gallery-garden.jpg` | 3:4 | gallery |
| `gallery-skin.jpg` | 3:4 | gallery |
| `gallery-coat.jpg` | 3:4 | gallery |
| `gallery-table.jpg` | 1:1 | gallery |
| `gallery-yard.jpg` | 1:1 | gallery |
| `gallery-board.jpg` | 4:3 | gallery wide tile |
| `gallery-trees.jpg` | 1:1 | gallery |
| `gallery-shade.jpg` | 1:1 | gallery |
| `gallery-coast.jpg` | 3:4 | gallery |
| `gallery-couch.jpg` | 3:4 | gallery |
| `gallery-town.jpg` | 3:4 | gallery |

## Hero

`hero-wide` (landscape screens) and `hero-tall` (portrait screens) are the Mixkit clips in `video-sources.txt`, each as VP9 `.webm` and H.264 `.mp4`. main.js picks the clip by screen orientation, starts it, and fades it in over the poster. Reduced-motion and no-JS visitors keep the still poster.

The four About bubbles each have a scenic outer photo (wildflowers, Cape Town, vineyard, bougainvillea). The portrait rises over it as an arch.
Keep each file under about 400KB (export as JPG at 80% quality, or convert to WebP and update the paths).
