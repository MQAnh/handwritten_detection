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
    // Feedback Modal Logic
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackSection = document.getElementById('feedbackSection');
    const cancelFeedbackBtn = document.getElementById('cancelFeedbackBtn');
    const feedbackForm = document.getElementById('feedbackForm');
    const feedbackInput = document.getElementById('feedbackInput');
    

    const supabaseUrl = "https://unckftabafxwbwgeifrb.supabase.co"; // Replace with your Supabase project URL
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuY2tmdGFiYWZ4d2J3Z2VpZnJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMzMyNzcsImV4cCI6MjA2MjcwOTI3N30.3OoIOiu5B7UeAkrg7kj4SDvGccWNioIHw9Xt_5IV1X4"; // Replace with your Supabase API key
    const supabases = supabase.createClient(supabaseUrl, supabaseKey);

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

    let publicUrl = ""; // Declare publicUrl variable

    submitBtn.addEventListener("click", async () => {
        const file = imageInput.files[0];
        if (!file) {
            showToast("Please upload an image first.");
            return;
        }

        loader.classList.remove("hidden");
        resultBox.value = "";
        feedbackBtn.classList.add("hidden");
        feedbackInput.value = ''; // Clear input


        try {
            // Upload the image to Supabase storage
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabases.storage
                .from("images") // Replace "images" with your Supabase storage bucket name
                .upload(fileName, file);

            if (error) {
                throw error;
            }

            // Get the public URL of the uploaded image
            const { data: publicUrlData, error: publicUrlError } = supabases
                .storage
                .from("images")
                .getPublicUrl(fileName);

            if (publicUrlError) throw publicUrlError;

            publicUrl = publicUrlData.publicUrl;

            console.log("Image uploaded successfully:", publicUrl);

            // Use the uploaded image URL for further processing
            const client = await Client.connect("MQAnh/DSAproject");
            const result = await client.predict("/predict", { image: file });
            resultBox.value = result.data;

            feedbackBtn.classList.remove("hidden");
        } catch (err) {
            console.error(err);
            resultBox.value = "Prediction failed.";
            showToast("Error during prediction.");
        } finally {
            loader.classList.add("hidden");
        }
    });

    feedbackForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const feedback = feedbackInput.value.trim();
        if (feedback) {
            try {
                // Insert feedback and publicUrl into Supabase database
                const { data, error } = await supabases
                    .from("database") // Replace "feedback" with your table name
                    .insert([
                        {
                            images: publicUrl, // Store the public URL
                            labels: feedback, // Store the feedback
                        },
                    ]);

                if (error) {
                    throw error;
                }

                alert("Thank you for your feedback!");
                feedbackSection.classList.add("hidden");
                feedbackInput.value = ''; // Clear input
            } catch (err) {
                console.error("Error storing feedback:", err);
                alert("Failed to store feedback. Please try again.");
            }
        } else {
            alert("Please enter your feedback before submitting.");
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

    

    feedbackBtn.addEventListener('click', () => {
      feedbackSection.classList.remove('hidden');
    });

    cancelFeedbackBtn.addEventListener('click', () => {
      feedbackSection.classList.add('hidden');
      feedbackInput.value = ''; // Clear input
    });

    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const feedback = feedbackInput.value.trim();
      if (feedback) {
        alert('Thank you for your feedback!');
        feedbackSection.classList.add('hidden');
        feedbackInput.value = ''; // Clear input
        // Optionally, send feedback to a server using fetch or AJAX
        // fetch('/submit-feedback', { method: 'POST', body: JSON.stringify({ feedback }), headers: { 'Content-Type': 'application/json' } });
      } else {
        alert('Please enter your feedback before submitting.');
      }
    });
