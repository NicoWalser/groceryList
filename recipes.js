/* Read JSON-File from Server */
let importedRecipes;
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    importedRecipes = JSON.parse(this.responseText);
  }
};

xmlhttp.open(
  'GET',
  'https://api.jsonbin.io/b/60d38b9c8a4cd025b7a42c2d/14',
  false
);

xmlhttp.send();

// Use the hereby added recipe.selected Property to select/unselect recipes in the GUI
// and to define the shopping list.
importedRecipes.forEach(function (recipe, index) {
  recipe.selected = false;
});

window.onload = function changeCat() {
  var slides = document.getElementsByClassName('recipeItem');
  for (var i = 0; i < slides.length; i++) {
    if (slides[i].innerHTML.toString() === ' Asian') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }

    if (slides[i].innerHTML.toString() === ' Italian') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }
    if (slides[i].innerHTML.toString() === ' Greek') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }
    if (slides[i].innerHTML.toString() === ' Pizza') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }
    if (slides[i].innerHTML.toString() === ' Texmex') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }
    if (slides[i].innerHTML.toString() === ' Other') {
      slides[i].classList.add('categoryClass');
      slides[i].classList.remove('recipeItem');
    }
    if (slides[i].innerHTML.toString() === '  ') {
      slides[i].classList.add('unclickableSec');
    }
  }
};

function getRecipeCollection() {
  recipes = [];
  // We want to randomize the recipces,
  // so that each time we look at it other recipes catch our attention
  // therefore hopefully creating diversity in our nutrition.

  uniquePriorities = getUniquePriorities();
  uniquePriorities.forEach((priority) => {
    recipes.push(
      importedRecipes.filter(function (recipe) {
        return recipe.priority == priority;
      })
    );
  });
  // Flatten array

  recipes = [].concat(...recipes);

  recipes.sort(function (a, b) {
    if (a.category < b.category) {
      return -1;
    }
    if (a.category > b.category) {
      return 1;
    }
    return 0;
  });

  return recipes;
}

function getUniquePriorities() {
  priorities = importedRecipes.map(function (recipe) {
    return parseInt(recipe.priority);
  });
  uniquePriorities = [...new Set(priorities)];
  return uniquePriorities.sort();
}

// Random order of recipes
const recipeCollection = getRecipeCollection();
/* --------------------------- */

function filterSelectedAndAggregateAmounts(recipes) {
  const ingredients = {};

  counter = 1;
  filteredRecipes = recipes.filter((recipe) => recipe.selected == true);
  filteredRecipes.forEach((receipe) => {
    receipe.ingredients.forEach((ing) => {
      if (!ingredients[ing.name]) {
        ingredients[ing.name] = {
          unit: ing.unit,
          amount: ing.amount,
          department: ing.department,
        };
      } else {
        ingredients[ing.name].amount =
          ingredients[ing.name].amount + ing.amount;
      }
    });
  });

  return ingredients;
}

$('#list').on('click', 'li', function () {
  $(this).wrap('<strike>');
});

/* --------- VUE component------------*/
Vue.component('my-meal', {
  props: ['recipe', 'recipes', 'index'],
  methods: {
    toggleSelectedRecipe: function () {
      this.recipes[this.index].selected = !this.recipes[this.index].selected;
    },
  },
  template:
    '<a href="javascript:void(0);" class="list-group-item list-group-item-action recipeItem" v-bind:class="{active: recipes[index].selected}" v-on:click="toggleSelectedRecipe"> {{ recipe.recipeName }}</a>',
});

/* ---------- VUE instance ------------*/
var vm = new Vue({
  el: '#app',
  data: {
    recipes: recipeCollection,
    myString: '',
    myResult: '',
  },
  methods: {
    onCopy: function (e) {
      // alert(
      //   'The following list has been copied to the clipboard:\n\n' + e.text
      // );
      // var textRecipe = e.text;
      // window.location.href = './list.html';
      // alert(document.getElementById('recipeParagraph').innerHTML);
      document.getElementById('recipeParagraph').innerHTML = e.text;

      // textSpace = e.text;
    },
    onError: function (e) {
      alert('Error');
    },
    testFunc: function (e) {
      this.myString = new String(e.text);
      // document.getElementById('recipeParagraph').innerHTML = this.myString;
      // document.getElementById('recipeParagraph').innerHTML = e.text;
      this.myResult = this.myString.split('--');
      // document.getElementById('testerid').innerHTML = this.myResult;

      var str = '<ul>';

      this.myResult.forEach(function (ingr) {
        str +=
          '<li><input type="checkbox"><label class="strikethrough"> ' +
          ' ' +
          ingr +
          '</label></li>';
      });

      str += '</ul>';
      document.getElementById('slideContainer').innerHTML = str;
    },
    arrayFunc: function () {},
  },
  computed: {
    shoppingList: function () {
      let recipes = this.recipes;
      const ingredients = filterSelectedAndAggregateAmounts(recipes);
      const lst = Object.keys(ingredients).map((name) => ({
        name: name,
        unit: ingredients[name].unit,
        amount: ingredients[name].amount,
        department: ingredients[name].department,
      }));
      lst.sort((l, r) => (l.name <= r.name ? -1 : 1));
      const sortedByDepartment = lst.sort((l, r) =>
        l.department <= r.department ? 1 : -1
      );

      return sortedByDepartment.map(
        (ing) => `${ing.amount} ${ing.unit} ${ing.name}`
      );
    },
    clipboardShoppingList: function () {
      // date = new Date();
      return (
        // 'Shopping list for the ' +
        // date.toLocaleDateString(undefined, {
        //   weekday: 'short',
        //   year: 'numeric',
        //   month: 'long',
        //   day: 'numeric',
        // }) +
        // ':\n' +
        this.shoppingList.join('--')
      );
    },

    clipboardMenues: function () {
      let selectedRecipesSorted = this.selectedRecipes
        .sort((l, r) => (l.recipeName >= r.recipeName ? 1 : -1))
        .sort((l, r) => (l.priority >= r.priority ? 1 : -1));
      date = new Date();
      let output =
        // 'Menu list from ' +
        // date.toLocaleDateString(undefined, {
        //   weekday: 'short',
        //   year: 'numeric',
        //   month: 'long',
        //   day: 'numeric',
        // }) +
        // ':\n' +
        selectedRecipesSorted
          .map((recipe) => recipe.recipeName)
          .join(', ')
          .toUpperCase() + '\n\n';
      for (var i = 0; i < selectedRecipesSorted.length; i++) {
        output +=
          selectedRecipesSorted[i].recipeName.toUpperCase() +
          '\n' +
          '--------------------' +
          '\n';
        for (var j = 0; j < selectedRecipesSorted[i].ingredients.length; j++) {
          output +=
            selectedRecipesSorted[i].ingredients[j].amount +
            ' ' +
            selectedRecipesSorted[i].ingredients[j].unit +
            ' ' +
            selectedRecipesSorted[i].ingredients[j].name +
            '\n';
        }
        output += '\n"' + selectedRecipesSorted[i].comment;
        '"' + '\n\n\n';
      }
      return output;
    },
    selectedRecipes: function () {
      return this.recipes.filter((recipe) => recipe.selected == true);
    },
  },
});
