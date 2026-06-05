# Cartoon Explainer Remotion Project

This repo contains the render-ready Remotion project for the cartoon explainer video.

## Local Render

```bash
npm install
npm run render
```

The rendered video is written to `renders/cartoon-explainer.mp4`.

## GitHub Render

Upload the render assets as a ZIP file on the repo's **Releases** page, then render from Actions.

The ZIP should contain:

```text
scenes.json
images/
audio/
```

It is also OK if the ZIP contains a top-level `public/` folder with those files inside it.

1. Open **Releases**.
2. Create a release and upload the ZIP as `public.zip`.
3. Open **Actions**.
4. Choose **Render Remotion Video**.
5. Click **Run workflow**.
6. Leave `release_tag` empty to use the latest release, or enter the tag you created.

The MP4 will be available as a workflow artifact.
