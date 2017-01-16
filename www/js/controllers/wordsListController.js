angular.module('wordInAWord')

.controller('WordsListCtrl', function($ionicPlatform, $scope, $rootScope, $cordovaNativeAudio, WordDatabase, Utilities, AchievementsUtils) {
  if (window.cordova) {
    document.addEventListener('deviceready', function() {
      loadAndManageData();
      $cordovaNativeAudio.preloadSimple('bonus', 'sounds/bonus.wav');
    });
  } else {
      $ionicPlatform.ready(function () {
      loadAndManageData();
    });
  }

  function loadAndManageData() {
    manageSettings();
    getCoins();
    getCategories();
    getWordsList();
    Utilities.getAchievements();
    openCategoryIfNeeded();
  }

  function manageSettings() {
    WordDatabase.selectSettings().then(function(res) {
        $rootScope.settings = res.rows.item(0);
        Utilities.changeTheme($rootScope.settings.theme);
      }, function(err) {
        console.error(err);
    });
  }

  function getCategories() {
    WordDatabase.selectCategories().then(function(res) {
        $scope.categories = [];

        for (var i = 0; i < res.rows.length; i++)
          $scope.categories.push(res.rows.item(i));
      }, function(err) {
        console.error(err);
    });
  }
   
  function getWordsList() {
    WordDatabase.selectWords().then(function(res) {
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
    $rootScope.allOpenedWordsCount = 0;

    for (var i = 0; i < $scope.categories.length; i++) {
      var categoryToDisplay = $scope.categories[i],
        wordsList = [];

      for (var j = 0; j < $scope.wordsList.length; j++) {    
        if ($scope.wordsList[j].categoryId == $scope.categories[i].id) {
          wordsList.push($scope.wordsList[j]);
          $rootScope.allOpenedWordsCount += $scope.wordsList[j].openedComposingWords;
        }    
      }

      categoryToDisplay.wordsList = wordsList;
      $scope.categoriesToDisplay.push(categoryToDisplay);

      if (!$scope.categories[i].isOpened) {
        $scope.openedCategoriesCount = i;
        $scope.closedCategoryId = $scope.categories[i].id;
        break;
      }

      var lastCategoryIndex = $scope.categories.length - 1;

      if ($scope.categories[lastCategoryIndex].isOpened) {
        $scope.openedCategoriesCount = lastCategoryIndex + 1;
      }
    }

    setComposingWordsCount();
  }

  function getCoins() {
    WordDatabase.selectCoins().then(function(res) {
      $rootScope.coinsCount = res.rows.item(0).coins;
      }, function(err) {
        console.error(err);
    }); 
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

  $scope.$on('$ionicView.enter', function() {
    updateOpenedComposingWordsCount();
    setComposingWordsCount();
    openCategoryIfNeeded();
  });

  function updateOpenedComposingWordsCount() {
    var updatedCount = Utilities.getOpenedComposingWordsCount();

    if ($scope.categoriesToDisplay) {
      for (var i = 0; i < $scope.categoriesToDisplay.length; i++) {
        if ($scope.categoriesToDisplay[i].id == updatedCount.categoryId) {
          for (var j = 0; j < $scope.categoriesToDisplay[i].wordsList.length; j++) {
            if ($scope.categoriesToDisplay[i].wordsList[j].id == updatedCount.wordId) {
              $scope.categoriesToDisplay[i].wordsList[j].openedComposingWords = updatedCount.count;
              break;
            }
          }
        } 
      }
    }
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
        getCategories();
        getWordsList();    
      }, function(err) {
        console.error(err);
    });
  }

  function openCategoryIfNeeded() {
    if ($scope.remainingComposingWordsCountToOpenCategory <= 0) {
        openCategoryByIdAndLoadDataAgain($scope.closedCategoryId);
        manageAhievements();
    } 
  }

  function manageAhievements() {
    if ($scope.closedCategoryId == 2) {
        AchievementsUtils.manageAchievementByIndex(3);
    }
    if ($scope.closedCategoryId == 10) {
        AchievementsUtils.manageAchievementByIndex(4);
    }
  }

  $scope.getWordsCountTextByRemainingCount = function() {
    var wordText = '';

    if ($scope.remainingComposingWordsCountToOpenCategory >= 5 && $scope.remainingComposingWordsCountToOpenCategory <= 20) {
      wordText = 'слів';
    }
    else switch($scope.remainingComposingWordsCountToOpenCategory % 10) {
        case 1:
          wordText = 'слово';
          break;
        case 2:
        case 3:
        case 4:
          wordText = 'слова';
          break;
        default:
          wordText = 'слів';
          break;
      }

      return wordText;
  }

  $scope.editData = function() {
      WordDatabase.editData().then(function(res) {
        console.log('Data updated');
        }, function(err) {
         console.error(err);
      });   
  }

  $scope.showAlert = function() {
      Utilities.showAchievementPopupByIndex(0);
  }
});
