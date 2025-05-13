
    import { Client } from "https://esm.sh/@gradio/client";

    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const resultBox = document.getElementById("resultBox");
    const clearBtn = document.getElementById("clearBtn");
    const submitBtn = document.getElementById("submitBtn");
    const loader = document.getElementById("loader");
    const dropZone = document.getElementById("dropZone");
    const copyBtn = document.getElementById("copyBtn");
    const darkToggle = document.getElementById("darkToggle");
    const toast = document.getElementById("toast");
    const downloadPdfBtn = document.getElementById("downloadPdfBtn");

    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 2000);
    }

    darkToggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });

    dropZone.addEventListener("click", () => imageInput.click());
    dropZone.addEventListener("dragover", e => {
      e.preventDefault();
      dropZone.classList.add("border-orange-400");
    });
    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("border-orange-400");
    });
    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("border-orange-400");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        imageInput.files = e.dataTransfer.files;
        previewImage(file);
      } else {
        showToast("Please drop a valid image file.");
      }
    });

    imageInput.addEventListener("change", () => {
      const file = imageInput.files[0];
      if (file) previewImage(file);
    });

    function previewImage(file) {
      const reader = new FileReader();
      reader.onload = e => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }

    clearBtn.addEventListener("click", () => {
      imageInput.value = null;
      imagePreview.src = "";
      imagePreview.classList.add("hidden");
      resultBox.value = "";
    });

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(resultBox.value);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy to Clipboard"), 1500);
      } catch {
        showToast("Failed to copy text.");
      }
    });

    submitBtn.addEventListener("click", async () => {
      const file = imageInput.files[0];
      if (!file) {
        showToast("Please upload an image first.");
        return;
      }

      loader.classList.remove("hidden");
      resultBox.value = "";

      try {
        const client = await Client.connect("MQAnh/DSAproject");
        const result = await client.predict("/predict", { image: file });
        resultBox.value = result.data;
      } catch (err) {
        console.error(err);
        resultBox.value = "Prediction failed.";
        showToast("Error during prediction.");
      } finally {
        loader.classList.add("hidden");
      }
    });

    // ✅ Download as PDF feature
    downloadPdfBtn.addEventListener("click", async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const text = resultBox.value || "No text to download.";
      const lines = doc.splitTextToSize(text, 180); // wrap text to 180mm width
      doc.text(lines, 10, 10); // 10mm margin
      doc.save("ocr_result.pdf");
    });

    document.addEventListener("DOMContentLoaded", () => {
    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
        document.body.insertAdjacentHTML("beforeend", data);
        })
        .catch(error => console.error("Error loading footer:", error));
    });
