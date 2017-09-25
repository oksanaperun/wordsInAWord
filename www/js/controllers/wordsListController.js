angular.module('wordInAWord')

  .controller('WordsListCtrl', function ($ionicPlatform, $ionicLoading, $scope, $rootScope, $cordovaNativeAudio, DB, Data, Utils, Achv) {
    $ionicLoading.show({
      template: '<ion-spinner icon="bubbles"></ion-spinner>',
      noBackdrop: true
    });

    if ($ionicPlatform.is('android')) {
      document.addEventListener('deviceready', function () {
        DB.initDatabase();
        loadAndManageData();

        if ($rootScope.settings && $rootScope.settings.sounds) {
          $cordovaNativeAudio.preloadSimple('bonus', 'sounds/bonus.wav');
        }
      });
    } else {
      $ionicPlatform.ready(function () {
        loadAndManageData();
      });
    }

    function loadAndManageData() {
      //'волос'- new word description
      DB.selectWordDescriptionByName('волос').then(function (res) {
        //console.log('First data update is started');
        if (res.rows.length === 0) {
          Data.firstDataUpdate();
          secondUpdateAndLoadData();
        } else {
          secondUpdateAndLoadData();
        }
      }, function (err) {
        console.error(err);
      });
    }

    function secondUpdateAndLoadData() {
      //'твід' - new word description
      DB.selectWordDescriptionByName('твід').then(function (res) {
        //console.log('Second data update is started');
        if (res.rows.length === 0) {
          Data.secondDataUpdate();
          thirdUpdateAndLoadData();
        } else {
          thirdUpdateAndLoadData();
        }      
      }, function (err) {
        console.error(err);
      });
    }

    function thirdUpdateAndLoadData() {
      //'мураха' - new word description
      DB.selectWordDescriptionByName('мураха').then(function (res) {
        //console.log('Third data update is started');
        if (res.rows.length === 0) {
          Data.thirdDataUpdate();
          loadData();
        } else {
          loadData();
        }      
      }, function (err) {
        console.error(err);
      });
    }

    function loadData() {
      //console.log('Load data');
      manageSettings();
      getCoins();
      getCategories();
      getWordsList();
      Utils.getAchievements();
    }

    function manageSettings() {
      DB.selectSettings().then(function (res) {
        $rootScope.settings = res.rows.item(0);
        if ($rootScope.settings.sounds)
          $rootScope.settings.sounds = true;
        else $rootScope.settings.sounds = false;

        Utils.changeTheme($rootScope.settings.theme);
      }, function (err) {
        console.error(err);
      });
    }

    function getCategories() {
      DB.selectCategories().then(function (res) {
        $scope.categories = [];

        var i;

        for (i = 0; i < res.rows.length; i++)
          $scope.categories.push(res.rows.item(i));

        for (i = 0; i < $scope.categories.length; i++) {
          if ($scope.categories[i].isOpened === 0) {
            $scope.firstClosedCategory = $scope.categories[i];
            $scope.firstClosedCategory.index = i;
            break;
          }
        }
      }, function (err) {
        console.error(err);
      });
    }

    function getWordsList() {
      DB.selectWords().then(function (res) {
        $scope.wordsList = [];

        for (var i = 0; i < res.rows.length; i++) {
          $scope.wordsList.push(res.rows.item(i));
        }

        getCategoriesToDisplayWithWordsList();
        setRemainingComposingWordsCount();
        openCategoryIfNeeded();

        $ionicLoading.hide();
      }, function (err) {
        console.error(err);
      })
    }

    function getCategoriesToDisplayWithWordsList() {
      $scope.categoriesToDisplay = [];
      $rootScope.totalComposingWordsCount = 0;
      $rootScope.allOpenedWordsCount = 0;
      $scope.openedCategoriesCount = 0;
      $scope.openedCategoriesTotalComposingWordsCount = 0;

      for (var i = 0; i < $scope.categories.length; i++) {
        var categoryToDisplay = $scope.categories[i],
          wordsList = [];

        categoryToDisplay.totalComposingWordsCount = 0;
        categoryToDisplay.openedComposingWordsCount = 0;

        for (var j = 0; j < $scope.wordsList.length; j++) {
          if ($scope.wordsList[j].categoryId == $scope.categories[i].id) {
            wordsList.push($scope.wordsList[j]);
            $rootScope.totalComposingWordsCount += $scope.wordsList[j].totalComposingWords;
            categoryToDisplay.totalComposingWordsCount += $scope.wordsList[j].totalComposingWords;
            $rootScope.allOpenedWordsCount += $scope.wordsList[j].openedComposingWords;
            categoryToDisplay.openedComposingWordsCount += $scope.wordsList[j].openedComposingWords;

            if ($scope.categories[i].isOpened) {
              $scope.openedCategoriesTotalComposingWordsCount += $scope.wordsList[j].totalComposingWords;
            }
          }
        }

        if ($scope.categories[i].isOpened) {
          $scope.openedCategoriesCount++;
        }

        categoryToDisplay.wordsList = wordsList;
        $scope.categoriesToDisplay.push(categoryToDisplay);
      }
    }

    function getFirstClosedCategory() {
      if ($scope.categoriesToDisplay) {
        for (var i = 0; i < $scope.categoriesToDisplay.length; i++) {
          if ($scope.categoriesToDisplay[i].isOpened === 0) {
            $scope.firstClosedCategory = $scope.categoriesToDisplay[i];
            $scope.firstClosedCategory.index = i;
            break;
          }
        }
      }
    }

    function getCoins() {
      DB.selectCoins().then(function (res) {
        $rootScope.coinsCount = res.rows.item(0).coins;
      }, function (err) {
        console.error(err);
      });
    }

    $scope.expandCategory = function (index) {
      $scope.categoriesToDisplay[index].expanded = !$scope.categoriesToDisplay[index].expanded;
    };

    $scope.toggleCategory = function (category) {
      if (category.isOpened) {
        if ($scope.isCategoryShown(category)) {
          $scope.shownCategory = null;
        } else {
          $scope.shownCategory = category;
        }
      }
    };

    $scope.isCategoryShown = function (category) {
      return $scope.shownCategory === category;
    };

    $scope.$on('$ionicView.enter', function () {
      updateOpenedComposingWordsCount();
      setRemainingComposingWordsCount();
      openCategoryIfNeeded();
    });

    function updateOpenedComposingWordsCount() {
      var updatedCount = Utils.getOpenedComposingWordsCount();

      if ($scope.categoriesToDisplay) {
        for (var i = 0; i < $scope.categoriesToDisplay.length; i++) {
          if ($scope.categoriesToDisplay[i].id == updatedCount.categoryId) {
            for (var j = 0; j < $scope.categoriesToDisplay[i].wordsList.length; j++) {
              if ($scope.categoriesToDisplay[i].wordsList[j].id == updatedCount.wordId) {
                $scope.categoriesToDisplay[i].openedComposingWordsCount -= $scope.categoriesToDisplay[i].wordsList[j].openedComposingWords;
                $scope.categoriesToDisplay[i].wordsList[j].openedComposingWords = updatedCount.count;
                $scope.categoriesToDisplay[i].openedComposingWordsCount += updatedCount.count;
                break;
              }
            }
          }
        }
      }
    }

    function setRemainingComposingWordsCount() {
      var composingWordsCountToOpenCategory = Math.floor($scope.openedCategoriesTotalComposingWordsCount * 0.5);

      $scope.remainingComposingWordsCountToOpenCategory = composingWordsCountToOpenCategory - $rootScope.allOpenedWordsCount;
    }

    function openCategory(id) {
      DB.openCategoryById(id).then(function (res) {
        $scope.categories[$scope.firstClosedCategory.index].isOpened = 1;

        getCategoriesToDisplayWithWordsList();
        getFirstClosedCategory();
        setRemainingComposingWordsCount();
      }, function (err) {
        console.error(err);
      });
    }

    function openCategoryIfNeeded() {
      if ($scope.remainingComposingWordsCountToOpenCategory <= 0 && $scope.firstClosedCategory) {
        openCategory($scope.firstClosedCategory.id);
        manageAhievements();

        if ($ionicPlatform.is('android') && $rootScope.settings.sounds) {
          Utils.playSound('bonus');
        }

        Utils.showOpenedCategoryPopup($scope.firstClosedCategory.name);
      }
    }

    function manageAhievements() {
      if ($scope.firstClosedCategory.id == 2) {
        Achv.manageAchievementByIndex(3);
      }
      if ($scope.firstClosedCategory.id == 10) {
        Achv.manageAchievementByIndex(4);
      }
    }

    $scope.getWordsCountTextByRemainingCount = function () {
      var wordText = '';

      if ($scope.remainingComposingWordsCountToOpenCategory >= 5 && $scope.remainingComposingWordsCountToOpenCategory <= 20) {
        wordText = 'слів';
      }
      else switch ($scope.remainingComposingWordsCountToOpenCategory % 10) {
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
    };

/*    $scope.editData = function () {
      DB.editData().then(function (res) {
        console.log('Data updated');
      }, function (err) {
        console.error(err);
      });
    };

    $scope.showAlert = function () {
      Utils.showAchievementPopupByIndex(0);
    };

    $scope.showHiddenAchievement = function () {
      Utils.showAllWordsOpenedPopup();
    };

    $scope.showConfirm = function () {
      Utils.showConfirmExitPopup();
    }*/
  });
