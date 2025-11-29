document.addEventListener("DOMContentLoaded", () => {
  const photoInput = document.getElementById("photoInput");
  const fileInputLabel = document.querySelector(".file-input-label");
  const preview = document.getElementById("preview");
  const previewImg = document.getElementById("previewImg");
  const previewActions = document.getElementById("previewActions");
  const removeBtn = document.getElementById("removeBtn");
  const submitBtn = document.getElementById("submitBtn");
  const photoForm = document.getElementById("photoForm");

  photoInput.addEventListener("change", handleFileSelect);
  photoForm.addEventListener("dragover", handleDragOver);
  photoForm.addEventListener("drop", handleDrop);
  removeBtn.addEventListener("click", removePhoto);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      displayPreview(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    photoForm.style.opacity = "0.7";
  }

  function handleDrop(e) {
    e.preventDefault();
    photoForm.style.opacity = "1";
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith("image/")) {
      photoInput.files = files;
      displayPreview(files[0]);
    }
  }

  function displayPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      preview.classList.add("show");
      previewActions.classList.add("show");
      fileInputLabel.classList.add("active");
      submitBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  function removePhoto(e) {
    e.preventDefault();
    photoInput.value = "";
    preview.classList.remove("show");
    previewActions.classList.remove("show");
    fileInputLabel.classList.remove("active");
    submitBtn.disabled = true;
  }

  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!photoInput.files || photoInput.files.length === 0) {
      alert("Por favor, selecione uma foto antes de continuar.");
      return;
    }

    const arquivo = photoInput.files[0];
    const formData = new FormData();
    formData.append("foto", arquivo);

    const textoOriginal = submitBtn.innerText;
    submitBtn.innerText = "Enviando...";
    submitBtn.disabled = true;

    try {
      const response = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
      console.log("ENTROU NO OK");

      const data = await response.json();
      localStorage.setItem("foto_fachada", data.url);

      alert("Foto enviada com sucesso!");

      const base = window.location.href.substring(0, window.location.href.lastIndexOf("/") + 1);
      window.location.href = base + "inserirCnpj.html";
    } else {
        const err = await response.json();
        alert("Erro no servidor: " + (err.error || "Falha desconhecida"));
        submitBtn.innerText = textoOriginal;
        submitBtn.disabled = false;
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert("Não foi possível conectar ao servidor.");
      submitBtn.innerText = textoOriginal;
      submitBtn.disabled = false;
    }
  });
});
