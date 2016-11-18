angular.module('wordInAWord')

.controller('WordsListCtrl', function($ionicPlatform, $scope, WordDatabase, OpenedComposingWordsCount) {
  $ionicPlatform.ready(function () {  
    getCategories();
    getWordsList();
  });

  function getCategories() {
    WordDatabase.selectCategories().then(function(res) {
        //console.log(res);
        $scope.categories = [];

        for (var i = 0; i < res.rows.length; i++)
          $scope.categories.push(res.rows.item(i));
      }, function(err) {
        console.error(err);
    });
  }
   
  function getWordsList() {
    WordDatabase.selectWords().then(function(res) {
        //console.log(res);
        $scope.wordsList = [];

        for (var i = 0; i < res.rows.length; i++)
          $scope.wordsList.push(res.rows.item(i));

        getCategoriesToDisplayWithWordsList();
      }, function(err) {
        console.error(err);
    });
  }

  function getCategoriesToDisplayWithWordsList() {
    $scope.categoriesToDisplay = [];

    for (var i = 0; i < $scope.categories.length; i++) {
      var categoryToDisplay = $scope.categories[i],
        wordsList = [];

      for (var j = 0; j < $scope.wordsList.length; j++) {    
        if ($scope.wordsList[j].categoryId == $scope.categories[i].id) {
          wordsList.push($scope.wordsList[j]);
        }
      }
      categoryToDisplay.wordsList = wordsList;
      $scope.categoriesToDisplay.push(categoryToDisplay);

      if (!$scope.categories[i].isOpened) {
        $scope.closedCategoryId = $scope.categories[i].id;
        break;
      }
    }

    setComposingWordsCount();
  }

  $scope.$on('$ionicView.enter', function() {
     updateOpenedComposingWordsCount();
     setComposingWordsCount();
     openCategoryIfNeeded();
  })

  function updateOpenedComposingWordsCount() {
    var updatedCount = OpenedComposingWordsCount.getCount();

    if ($scope.categoriesToDisplay) {
      for (var i = 0; i < $scope.categoriesToDisplay.length; i++) {
        if ($scope.categoriesToDisplay[i].id == updatedCount.categoryId) {
          for (var j = 0; j < $scope.categoriesToDisplay[i].wordsList.length; j++) {    
            if ($scope.categoriesToDisplay[i].wordsList[j].id == updatedCount.wordId) {
              $scope.categoriesToDisplay[i].wordsList[j].openedComposingWords = updatedCount.count;
            }
          }
        }      
      }
    }
  }

  $scope.expandCategory = function(index) {
    $scope.categories[index].expanded = !$scope.categories[index].expanded;
  }

  $scope.toggleCategory = function(category) {
    if (category.isOpened) {
      if ($scope.isCategoryShown(category)) {
        $scope.shownCategory = null;
      } else {
        $scope.shownCategory = category;
      }
   }
  };

  $scope.isCategoryShown = function(category) {
    return $scope.shownCategory === category;
  };

  $scope.getOpenedCategoriesCount = function() {
    if ($scope.categoriesToDisplay)
      return ($scope.categoriesToDisplay.length - 1);
  }

  function setComposingWordsCount() {
    var totalComposingWordsCount = 0,
      openedComposingWordsCount = 0,
      composingWordsCountToOpenCategory = 0;

    if ($scope.categoriesToDisplay) {
      for (var i = 0; i < $scope.categoriesToDisplay.length; i++) {
        if ($scope.categoriesToDisplay[i].isOpened) {
          for (var j = 0; j < $scope.categoriesToDisplay[i].wordsList.length; j++) {
            totalComposingWordsCount += $scope.categoriesToDisplay[i].wordsList[j].totalComposingWords;
            openedComposingWordsCount += $scope.categoriesToDisplay[i].wordsList[j].openedComposingWords;
          }         
        }
      }

    composingWordsCountToOpenCategory = Math.floor(totalComposingWordsCount * 0.5);

    $scope.remainingComposingWordsCountToOpenCategory = composingWordsCountToOpenCategory - openedComposingWordsCount;
    }
  }

  function openCategoryByIdAndLoadDataAgain(id) {
    WordDatabase.openCategoryById(id).then(function(res) {
        //console.log(res);
        console.log('Category opened');
        getCategories();
        getWordsList();    
      }, function(err) {
        console.error(err);
    });
  }

  function openCategoryIfNeeded() {
      if ($scope.remainingComposingWordsCountToOpenCategory <= 0) {
        openCategoryByIdAndLoadDataAgain($scope.closedCategoryId);
    } 
  }

  $scope.editData = function() {
      WordDatabase.editData().then(function(res) {
        //console.log(res);
        console.log('Data updated');
        }, function(err) {
         console.error(err);
      });   
  }
});
