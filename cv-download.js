const CV_FILE_PATH = "assets/CV.pdf";
const DEFAULT_CV_FILENAME = "Celal-Oguz-Kurtoglu-CV.pdf";

function getCvI18nText(key, fallback) {
  if (typeof I18N !== "undefined" && I18N.translations && I18N.translations[key]) {
    return I18N.translations[key];
  }
  return fallback;
}

function normalizeCvFileName(input) {
  const safeName = input
    .replace(/\.pdf$/i, "")
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  return safeName ? `${safeName}.pdf` : DEFAULT_CV_FILENAME;
}

async function downloadCvWithName(fileName) {
  const response = await fetch(CV_FILE_PATH);
  if (!response.ok) {
    throw new Error(`CV fetch failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function setupCvDownload() {
  const downloadButton = document.getElementById("cv-download-button");
  if (!downloadButton) {
    return;
  }

  downloadButton.addEventListener("click", async () => {
    const promptText = getCvI18nText(
      "cv_download_prompt",
      "Enter file name (extension is optional):",
    );
    const rawName = window.prompt(promptText, DEFAULT_CV_FILENAME);
    if (rawName === null) {
      return;
    }

    const fileName = normalizeCvFileName(rawName);

    try {
      downloadButton.disabled = true;
      await downloadCvWithName(fileName);
    } catch (error) {
      // Fallback to direct link when blob download fails.
      const fallbackLink = document.createElement("a");
      fallbackLink.href = CV_FILE_PATH;
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
