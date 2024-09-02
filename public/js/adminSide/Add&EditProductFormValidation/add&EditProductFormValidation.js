function validateForm() {
  let isValid = true;
  console.log("readched inside the validate formf");

  const productname = document.getElementById("productname").value.trim();
  const category = document.getElementById("category").value.trim();
  const price = document.getElementById("price").value.trim();
  const description = document.getElementById("description").value.trim();
  const image = document.getElementById("image").files[0]; // Ensure this ID matches your file input ID
  const stock = document.getElementById("stock").value.trim();
  const ingredientsContainer = document.getElementById("ingredients-container");
  const ingredientInputs = ingredientsContainer.querySelectorAll(
    'input[name="ingredients[]"]'
  );

  if (ingredientInputs.length > 0) {
    document.getElementById("ingredientsError").innerText = "";

    ingredientInputs.forEach((input) => {
      if (input.value.trim() === "") {
        document.getElementById("ingredientsError").innerText =
          "Please enter ingredient name in the box";
        isValid = false;
      }
    });
  } else {
    document.getElementById("ingredientsError").innerText =
      "Please add aleast one ingredient";
    isValid = false;
  }
 

  // Product Name validation
  if (productname === "") {
    document.getElementById("productnameError").innerText =
      "Please enter the product name";
    isValid = false;
  } else {
    document.getElementById("productnameError").innerText = "";
  }

  // Category validation
  if (category === "") {
    document.getElementById("categoryError").innerText =
      "Please select the category from the options";
    isValid = false;
  } else {
    document.getElementById("categoryError").innerText = "";
  }

  // Price validation
  if (price === "") {
    document.getElementById("priceError").innerText = "Please enter a price..";
    isValid = false;
  } else if (isNaN(price)) {
    document.getElementById("priceError").innerText =
      "Only numbers are allowed";
    isValid = false;
  } else if (parseInt(price) <= 0) {
    document.getElementById("priceError").innerText =
      "Price should be greater than 0";
    isValid = false;
  } else {
    document.getElementById("priceError").innerText = "";
  }

  // Description validation
  if (description === "") {
    document.getElementById("descriptionError").innerText =
      "Please enter the description";
    isValid = false;
    console.log("from description isvalid", isValid);
  } else {
    document.getElementById("descriptionError").innerText = "";
  }

  // Image validation
  if (!image) {
    console.log("entered image validation");
    document.getElementById("imgError").innerText = "Please add the image";
    console.log("entered image validation  2");
    isValid = false;
    console.log("this is  image isValid", isValid);
  } else {
    document.getElementById("imgError").innerText = "";
  }

  // Stock validation
  if (stock === "") {
    document.getElementById("stockError").innerText = "Please add the stock";
    isValid = false;
  } else if (isNaN(stock)) {
    document.getElementById("stockError").innerText =
      "Only numbers are allowed";
    isValid = false;
  } else if (stock < 0) {
    document.getElementById("stockError").innerText =
      "Stock can be 0 or greater";
    isValid = false;
  } else {
    document.getElementById("stockError").innerText = "";
  }
  console.log("this is is valid", isValid);
  return isValid;
}
