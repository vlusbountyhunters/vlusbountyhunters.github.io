// The button works without JavaScript; this only displays the current version.
fetch("https://shadowofmandalore.com/launcher-download.php?info=1", {cache: "no-store"})
  .then(response => { if (!response.ok) throw new Error("Release unavailable"); return response.json(); })
  .then(release => {
    if (/^\d{4}\.\d{1,2}\.\d{1,2}\.\d+$/.test(release.version)) {
      document.getElementById("launcher-version").textContent = release.version;
    }
  }).catch(() => { /* Leave the stable download link and generic label intact. */ });
