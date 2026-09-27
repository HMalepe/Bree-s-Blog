# Photos and hero video

12 AI-generated images (Canva, regenerated 2026-09-27 in the "Salt / Sun / Sea" palette: cobalt, turquoise,
white, hibiscus). They show fictional women, not Bree. Long edge ≤ 1600px, progressive JPEG, quality 80.
They were exported from the Canva design "Bree site photos – export" (the ocean copy, `DAHWZCabVJI`) and
pulled in by `.github/workflows/fetch-assets.yml`. To swap one, replace the file under the same name, or
re-run that workflow with a manifest of fresh Canva export links. If a file goes missing, its slots fall
back to the gradient.

| File | Ratio | Canva | Used in |
|---|---|---|---|
| `hero-beach.jpg` | 16:9 | [MAHWZMj76UM](https://www.canva.com/M/MAHWZMj76UM) | bubble "Health Notes" outer · gallery (wide tile) |
| `portrait-sea.jpg` | 3:4 | [MAHWZBVu5Xk](https://www.canva.com/M/MAHWZBVu5Xk) | gallery **focus tile** (gets the sand frame) |
| `cliff-hat.jpg` | 4:5 | [MAHWZAKaK20](https://www.canva.com/M/MAHWZAKaK20) | featured tall card · gallery |
| `serum-ritual.jpg` | 1:1 | [MAHWZC1QpqQ](https://www.canva.com/M/MAHWZC1QpqQ) | bubble "Health Notes" · "Supplements" card · "Cabinet audit" note · gallery · "Pharmacy" step |
| `cafe-harbour.jpg` | 3:2 | [MAHWZJWcQTs](https://www.canva.com/M/MAHWZJWcQTs) | "9-to-6" card · "Slow mornings" note · gallery · "Quizzes" step |
| `sunscreen-smile.jpg` | 1:1 | [MAHWZBu698s](https://www.canva.com/M/MAHWZBu698s) | bubble "Myths" · "Sunscreen, decoded" card · gallery · "Explainers" step |
| `bougainvillea.jpg` | 3:4 | [MAHWZEe9rEk](https://www.canva.com/M/MAHWZEe9rEk) | bubble outer · gallery |
| `road-trip.jpg` | 3:2 | [MAHWZDaK0R4](https://www.canva.com/M/MAHWZDaK0R4) | "Finishing the course" note · gallery · "Content" step |
| `frangipani.jpg` | 1:1 | [MAHWZJ2QSrg](https://www.canva.com/M/MAHWZJ2QSrg) | "Natural" card · "Reading a label" note · gallery · "Collaborations" step |
| `pool-day.jpg` | 4:5 | [MAHWZNSzb9U](https://www.canva.com/M/MAHWZNSzb9U) | bubble "Rituals" · "Sunday reset" card · gallery |
| `capetown.jpg` | 16:9 | [MAHWZLSSuIo](https://www.canva.com/M/MAHWZLSSuIo) | bubble "Myths" outer · gallery |
| `umbrella-laugh.jpg` | 3:4 | [MAHWZAeJrUE](https://www.canva.com/M/MAHWZAeJrUE) | bubble "Quizzes" · gallery |

## Hero video

`hero-wide.mp4` (landscape screens) and `hero-tall.mp4` (portrait screens) are free Mixkit stock clips, trimmed and
re-encoded by the same workflow (`video_url` input; `video_search` lists candidates in the job log).
Each `<clip>-poster.jpg` is that clip's first frame: it shows until the video plays, and in place of it for
reduced-motion and no-JS visitors. `video-sources.txt` records each source clip and trim. main.js picks the clip by screen orientation.

The four About bubbles each have a scenic outer photo (rock pool, Cape Town, cliff path, bougainvillea). The portrait rises over it as an arch.
Keep each file under about 400KB (export as JPG at 80% quality, or convert to WebP and update the paths).
