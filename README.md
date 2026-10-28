# 🎙️ LocalVoice

**Free, private, in-browser text-to-speech. Turn text or PDFs into MP3 files. No account, no credits, no server.**

Created by **RJxBlack**.

> LocalVoice is a bold attempt to give everyone the **right to own a local text-to-speech tool**, especially people on low-end ("potato") PCs, **students, and people who don't have enough money to buy the premium plans of paid software**.
> It does the same job as paid TTS tools, but in a lite way: it takes more time than paid software, because everything runs inside your browser, and **no data is ever shared with any server**.

---

## ⚠️ Disclaimer: lite use only

This project is meant for **personal, lite use**. It is **not intended for professional or commercial purposes** (no paid client work, no reselling, no running it as a paid service). See [LICENSE](LICENSE).

---

## ✨ Features

- **28 natural AI voices** (13 male, 15 female, American and British English)
- **Instant voice previews**: every voice has a short pre-recorded "Hi, I'm …" sample (about 7 seconds)
- **Text → speech** and **PDF / TXT → speech**
- **Download as MP3**, with a built-in audio player
- **Speed, pitch and audio-level controls**
- **Stop button** and a "time left" estimate while audio is being created
- **Light and dark mode**
- **Private**: the AI model runs in your browser; your text is never uploaded
- **Zero setup**: plain HTML, CSS and JavaScript. No build step, no backend

## ⚡ Built to be light on the browser

| Before | Now |
|---|---|
| The AI voice ran on the page itself, so the tab froze or crashed while creating audio | The AI voice runs in a **background worker**; the page stays smooth and only shows progress |
| MP3 encoding and pitch change ran on the page | They run in a **second background worker**, in parallel with the next part being spoken |
| Every voice preview loaded and ran the 90 MB AI model | Previews are **small pre-recorded MP3 files** (no model, instant, works offline once cached) |
| GitHub Pages gave the AI only one CPU core | A tiny service worker (`coi-sw.js`) turns on **multi-core** mode in Chrome and Edge |
| Heavy blur effects on low-end GPUs | Removed; animations pause while audio is being created |

The voice model, voices, sample rate and bitrate are **unchanged**, so the voice quality and natural tone are exactly the same.

## 🚀 Quick start

### Option 1: Use it online (GitHub Pages)
1. Fork or upload this repo to your GitHub account.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

The first visit reloads once by itself. That is the multi-core switch turning on.

### Option 2: Run on your computer
1. Download or clone this repo.
2. Serve the folder (browsers block the voice engine on `file://`):
   ```bash
   python -m http.server 8000
   ```
   then open <http://localhost:8000>.

## 🎧 Make the voice previews (one time)

The `audio/previews/` folder holds one MP3 per voice. Create them once:

1. Open `tools/make-previews.html` on your site or via `python -m http.server`.
2. Click **Create all previews** and wait. It records all 28 voices with the real AI voice.
3. Click **Download previews.zip** and unzip it inside the repo folder, so you get `audio/previews/am_adam.mp3`, `audio/previews/af_heart.mp3`, and so on.
4. Commit and push the `audio` folder. About 2–3 MB in total.

Want a different sentence? Edit `previewText` in `js/voices.js`, then run the tool again.
If a preview file is missing, the site still works: it makes that one preview in the background (this downloads the AI model the first time).

## 🌐 Internet note (important)

LocalVoice runs the AI **on your device**, but it needs internet **the first time** to download:

| What | Size | When |
|---|---|---|
| Voice model (Kokoro-82M, quantized) | ~90 MB | First time you click Generate |
| PDF reader (pdf.js) | small | First PDF opened |
| MP3 encoder (lamejs) | small | First generation |

After the browser has cached them, later use is much faster. Voice previews do **not** need the model. Voice photos come from randomuser.me; if they can't load, built-in SVG avatars are used instead.

## 🧭 How to use

1. Click **Choose a voice** and preview voices with the play button.
2. Paste text, open a `.txt` file, or switch to the **PDF / TXT** tab.
3. Adjust speed, pitch and audio level.
4. Click **Generate Speech**, listen, then **Download**. Click **Stop** any time to keep the part that is already done.

Scanned PDFs (images only) can't be read because there is no text layer.

## 🛟 If something goes wrong

- **Generation fails right after the page reloads:** add `?safe` to the end of the web address once (for example `https://you.github.io/localvoice/?safe`). This turns multi-core mode off and runs in normal single-core mode. Use `?fast` to turn it back on.
- **Very slow:** close other heavy tabs, and use a recent Chrome or Edge. A browser can't match a paid server, so long texts take time. That is the trade-off for privacy and zero cost.

## 📁 Project structure

```
localvoice/
├── index.html            # Main page
├── coi-sw.js             # Turns on multi-core mode on GitHub Pages
├── css/
│   └── style.css         # Styles (light and dark themes)
├── js/
│   ├── app.js            # Page logic (UI, previews, PDF reading, generation loop)
│   ├── engine.js         # Talks to the background workers
│   ├── tts-worker.js     # Kokoro AI voice, runs in the background
│   ├── encoder-worker.js # Pitch + MP3 encoding, runs in the background
│   └── voices.js         # Voice list and the preview sentence
├── audio/
│   └── previews/         # One pre-recorded MP3 per voice
├── tools/
│   └── make-previews.html  # One-time tool that records the previews
├── icons/
│   └── favicon.svg
├── images/
│   └── avatars/          # Fallback avatars for each voice
├── .nojekyll             # Tells GitHub Pages to serve files as-is
├── .gitignore
├── LICENSE
└── README.md
```

## 🛠️ Built with

- [Kokoro-82M](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX) via [kokoro-js](https://www.npmjs.com/package/kokoro-js): in-browser neural TTS
- [pdf.js](https://mozilla.github.io/pdf.js/): PDF text extraction
- [lamejs](https://github.com/zhuker/lamejs): MP3 encoding
- [randomuser.me](https://randomuser.me): voice portraits

## 💻 Tips for low-end PCs

- Close other heavy tabs and apps before generating.
- Generate long text in smaller parts; very long files take time. Keep the tab open.
- Use a recent Chrome or Edge for the best speed.

## 📜 License

Personal, non-commercial, lite-use license. See [LICENSE](LICENSE).
Third-party components keep their own licenses.

## 👤 Author

**RJxBlack**, who built this so that nobody has to pay just to hear their own text read aloud.
