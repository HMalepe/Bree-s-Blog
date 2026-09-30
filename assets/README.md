# Photos and hero video

Photos are from Bree's public Instagram (@mokoena_bree), saved under the existing slot names so the HTML paths stay the same. Long edge ≤ 1600px, progressive JPEG, about quality 80, each file under ~400KB. If a file goes missing, its slot falls back to the gradient.

The hero stills (`hero-wide-poster.jpg`, `hero-tall-poster.jpg`) are the first frames of the Mixkit clips. They show until the video plays, and in place of it for reduced-motion and no-JS visitors.

| File | Ratio | Used in |
|---|---|---|
| `portrait-sea.jpg` | 3:4 | gallery **focus tile** (gets the sand frame) |
| `cliff-hat.jpg` | 4:5 | featured tall card |
| `serum-ritual.jpg` | 1:1 | bubble "Health Notes" · "Supplements" card · "Cabinet audit" note · "Pharmacy" step |
| `cafe-harbour.jpg` | 3:2 | "9-to-6" card |
| `sunscreen-smile.jpg` | 1:1 | bubble "Myths" · "Sunscreen, decoded" card · gallery · "Explainers" step |
| `bougainvillea.jpg` | 3:4 | bubble outer · gallery |
| `road-trip.jpg` | 3:2 | "Finishing the course" note |
| `frangipani.jpg` | 1:1 | "Reading a label" note · "Collaborations" step |
| `pool-day.jpg` | 4:5 | bubble "Rituals" · gallery |
| `capetown.jpg` | 16:9 | bubble "Myths" outer · gallery |
| `umbrella-laugh.jpg` | 3:4 | bubble "Quizzes" · gallery |
| `vineyard.jpg` | 16:9 | bubble "Quizzes" outer · gallery |
| `wildflowers.jpg` | 16:9 | bubble "Health Notes" outer · gallery (wide tile) |
| `forest.jpg` | 3:4 | "Slow mornings" note · gallery |
| `sunflowers.jpg` | 3:4 | gallery · "Quizzes" step |
| `meadow-picnic.jpg` | 4:5 | "Sunday reset" card · gallery |
| `tulips.jpg` | 1:1 | gallery · "Content" step |
| `greenhouse.jpg` | 1:1 | "Natural doesn't mean harmless" card |

## Hero

`hero-wide` (landscape screens) and `hero-tall` (portrait screens) are the Mixkit clips in `video-sources.txt`, each as VP9 `.webm` and H.264 `.mp4`. main.js picks the clip by screen orientation, starts it, and fades it in over the poster. Reduced-motion and no-JS visitors keep the still poster.

The four About bubbles each have a scenic outer photo (wildflowers, Cape Town, vineyard, bougainvillea). The portrait rises over it as an arch.
Keep each file under about 400KB (export as JPG at 80% quality, or convert to WebP and update the paths).
