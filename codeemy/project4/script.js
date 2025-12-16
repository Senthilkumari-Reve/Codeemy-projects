const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const mealList = document.getElementById("mealList");
const mealDetails = document.getElementById("mealDetails");


// 🔍 Fetch meals based on ingredient
searchBtn.addEventListener("click", () => {
  const searchValue = searchInput.value.trim();
  if (searchValue) {
    fetchMeals(searchValue);
  } else {
    alert("Please enter an ingredient 🍳");
  }
});

async function fetchMeals(ingredient) {
  const apiurl = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`;
  const response = await fetch(apiurl);
  const data = await response.json();

  mealDetails.innerHTML = ""; // clear details
  if (data.meals) {
    displayMeals(data.meals);
  } else {
    mealList.innerHTML = `<p>No meals found. Try something else!</p>`;
  }
}

function displayMeals(meals) {
  mealList.innerHTML = meals.map(meal => `
    <div class="meal">
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
      <button onclick="getMealDetails(${meal.idMeal})">View Recipe</button>
    </div>
  `).join("");
}

// 🍲 Fetch and display full meal details
async function getMealDetails(mealId) {
  const apiurl = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
  const response = await fetch(apiurl);
  const data = await response.json();
  showMealDetails(data.meals[0]);
}

function showMealDetails(meal) {
  mealDetails.innerHTML = `
    <h2>${meal.strMeal}</h2>
    <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
    <p><strong>Category:</strong> ${meal.strCategory}</p>
    <p><strong>Area:</strong> ${meal.strArea}</p>
    <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
    <a href="${meal.strYoutube}" target="_blank">🎥 Watch Recipe Video</a>
  `;
}
