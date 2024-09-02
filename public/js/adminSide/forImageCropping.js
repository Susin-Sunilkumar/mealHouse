const imageContainer = document.getElementById('image-container');
const existingImages = document.querySelectorAll('#image-container img').length;
let croppers = [];
let croppedImagesData = []; // Array to store cropped image data
let isSaveClicked = false; // Flag to track if the Save button is clicked

document.getElementById('image').addEventListener('change', (event) => {
  const files = event.target.files;

  for (const file of files) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const image = new Image();
      image.src = event.target.result;

      image.onload = () => {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'image-container';

        const imageElement = document.createElement('img');
        imageElement.src = image.src;
        containerDiv.appendChild(imageElement);

        // Set a fixed height for the container
        containerDiv.style.height = '150px';

        // Create a new Cropper for each image without a fixed aspect ratio
        const cropper = new Cropper(imageElement, {
          aspectRatio: 2, // Allow freeform cropping
          viewMode:1 , // Set the cropping mode (0: freeform, 1: restrict to the aspect ratio)
        });

        // Create a "Save" button for each image
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-success save-button';
        saveButton.textContent = 'Save';
        saveButton.addEventListener('click', () => {
          // Get the cropped image data for the specific cropper
          const croppedCanvas = cropper.getCroppedCanvas();
          const croppedImageData = croppedCanvas.toDataURL('image/jpeg');

          // Store cropped image data in the array
          croppedImagesData.push(croppedImageData);

          // Optionally, you can remove the "Save" button after saving
          containerDiv.removeChild(saveButton);

          // Set the flag to indicate that Save button is clicked
          isSaveClicked = true;
        });

        // Create a "Remove" button for each image
        const removeButton = document.createElement('button');
        removeButton.className = 'btn btn-danger remove-button';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          // Remove the corresponding image and cropper
          const index = croppers.indexOf(cropper);
          if (index !== -1) {
            croppers.splice(index, 1);
            croppedImagesData.splice(index, 1);
          }
          containerDiv.remove();

          // Reset the flag if there are no images left
          if (croppers.length === 0) {
            isSaveClicked = false;
          }
        });

        containerDiv.appendChild(saveButton);
        containerDiv.appendChild(removeButton);

        imageContainer.appendChild(containerDiv);
        croppers.push(cropper);
      };
    };

    reader.readAsDataURL(file);
  }
});

// Handle form submission (for adding product)
document.querySelector('form').addEventListener('submit', async (event) => {
  // Prevent form submission if no images are saved and no existing images
  if (!isSaveClicked && existingImages === 0) {
    event.preventDefault();
    // Show validation message
    document.getElementById('validationMessage').textContent = 'Please save the image first.';
  } else {
    // Add the cropped image data to the form data
    croppedImagesData.forEach((croppedImageData, index) => {
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'hidden';
      hiddenInput.name = `croppedImages[${index}]`;
      hiddenInput.value = croppedImageData;
      document.querySelector('form').appendChild(hiddenInput);
    });

    // Optionally, you can also reset the croppers and image containers
    resetCroppersAndContainers();
  }
});

// Function to reset croppers and containers
function resetCroppersAndContainers() {
  // Reset the croppers array
  croppers = [];

  // Remove all child elements from the imageContainer
  while (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
  }

  // Clear the file input
  const fileInput = document.getElementById('image');
  fileInput.value = '';

  // Clear the cropped image data array
  croppedImagesData = [];

  // Reset the Save button click flag
  isSaveClicked = false;

  // Clear the validation message
  document.getElementById('validationMessage').textContent = '';
}
