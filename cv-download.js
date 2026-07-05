const CV_FILE_PATH = "assets/CV.pdf";
// Keep the URL stable for Safari while forcing browsers/CDNs to fetch the latest PDF.
const CV_FILE_URL = `${CV_FILE_PATH}?v=2026-07-05`;
const DEFAULT_CV_BASENAME = "Celal-Oguz-Kurtoglu-CV";
const DEFAULT_CV_FILENAME = `${DEFAULT_CV_BASENAME}.pdf`;

function getCvI18nText(key, fallback) {
  if (typeof I18N !== "undefined" && I18N.translations && I18N.translations[key]) {
    return I18N.translations[key];
  }
  return fallback;
}

/** Drops the last dotted segment so the download is always forced to .pdf. */
function stripTrailingExtensionForCvName(input) {
  const trimmed = input.trim();
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot <= 0) {
    return trimmed;
  }
  return trimmed.slice(0, lastDot);
}

function normalizeCvFileName(input) {
  const base = stripTrailingExtensionForCvName(input)
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return base ? `${base}.pdf` : DEFAULT_CV_FILENAME;
}

async function downloadCvWithName(fileName) {
  const link = document.createElement("a");

  link.href = CV_FILE_URL;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
}

function setupCvDownload() {
  const downloadButton = document.getElementById("cv-download-button");
  if (!downloadButton) {
    return;
  }

  downloadButton.addEventListener("click", async () => {
    const promptText = getCvI18nText(
      "cv_download_prompt",
      "Enter file name only; it will always be saved as a .pdf file:",
    );
    const rawName = window.prompt(promptText, DEFAULT_CV_BASENAME);
    if (rawName === null) {
      return;
    }

    const fileName = normalizeCvFileName(rawName);

    try {
      downloadButton.disabled = true;
      await downloadCvWithName(fileName);
    } catch (error) {
      // Fallback to the same direct URL when programmatic download fails.
      const fallbackLink = document.createElement("a");
      fallbackLink.href = CV_FILE_URL;
      fallbackLink.download = fileName;
      fallbackLink.click();

      const errorMessage = getCvI18nText(
        "cv_download_error",
        "CV could not be downloaded. Please try again.",
      );
      console.error(errorMessage, error);
    } finally {
      downloadButton.disabled = false;
    }
  });
}

document.addEventListener("DOMContentLoaded", setupCvDownload);
