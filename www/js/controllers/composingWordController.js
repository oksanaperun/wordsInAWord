angular.module('wordInAWord')

.controller('ComposingWordCtrl', function($ionicPlatform, $scope, $rootScope, $stateParams, $timeout, $window, $cordovaNativeAudio, WordDatabase, Utilities, AchievementsUtils) {
  $ionicPlatform.ready(function () {
    $scope.promptPrice = 15;
    $scope.letterPrice = 10;

    getComposingWordData();

     if (window.cordova && $rootScope.settings.sounds) {
      $cordovaNativeAudio.preloadSimple('error', 'sounds/error.wav');
      $cordovaNativeAudio.preloadSimple('bonus', 'sounds/bonus.wav');
      $cordovaNativeAudio.preloadSimple('purchase', 'sounds/purchase.wav');
    }
  });

  function getComposingWordData() {
    WordDatabase.selectComposingWordDataById($stateParams.composingWordId).then(function(res) {
        $scope.composingWord = res.rows.item(0);
        $scope.composingWordPrice = $scope.composingWord.name.length * $scope.letterPrice;
        }, function(err) {
         console.error(err);
      });
  }

  $scope.displayNotOpenedComposingWord = function() {
    var s = '-';

    if ($scope.composingWord) {
      for (var i = 0; i < $scope.composingWord.name.length - 1; i++)
        s += ' -';

      return s;
      }
  }

  $scope.displayDescription = function() {
    if ($scope.composingWord && $scope.composingWord.isDescriptionOpened && $scope.composingWord.description) {
      var description = $scope.composingWord.description.replace(/ ([2-9]). /g, '<br>$1. ');

      return description;
    } else return '';
  }

  $scope.openComposedWord = function() {
    if (isEnoughCoinsForOpeningWord()) {
      if (window.cordova) {
          Utilities.playSound('purchase');
      }
      WordDatabase.openComposingWordById($scope.composingWord.id, 0).then(function(res) {
        $scope.composingWord.isOpened = true;
        $scope.composingWord.isDescriptionOpened = true;
        $rootScope.allOpenedWordsCount ++;
        $rootScope.word.openedComposingWordsCount ++;
        $rootScope.categoryInfo.openedComposingWordsCount ++;
        manageAchievements();
        Utilities.addToCoins(-$scope.composingWordPrice);
        Utilities.setOpenedWordId($scope.composingWord.id);

        if ($rootScope.totalComposingWordsCount == $rootScope.allOpenedWordsCount) {
          if (window.cordova) {
            Utilities.playSound('bonus');
          }
          Utilities.showAllWordsOpenedPopup();
        }
      }, function(err) {
         console.error(err);
      });
    } else {
        if (window.cordova) {
          Utilities.playSound('error');
        }
      $scope.isNotEnoughCoins= true;
      hideNotEnoughCoinsMessage();
    }
  }

  function isEnoughCoinsForOpeningWord() {
    if ($scope.coinsCount >= $scope.composingWordPrice) return true
    else return false;
  }

  function manageAchievements() {
    if (!$rootScope.achievements[2].isEarned && $rootScope.word.totalComposingWordsCount == $rootScope.word.openedComposingWordsCount) {
      AchievementsUtils.manageAchievementByIndex(2);
    }

    if (!$rootScope.achievements[5].isEarned && $rootScope.categoryInfo.totalComposingWordsCount == $rootScope.categoryInfo.openedComposingWordsCount) {
      AchievementsUtils.manageAchievementByIndex(5);
    }
  }

  $scope.openDescription = function() {
    if (isEnoughCoinsForPrompt()) {
      if (window.cordova) {
          Utilities.playSound('purchase');
      }
      WordDatabase.openComposingWordDescriptionById($scope.composingWord.id).then(function(res) {
        $scope.composingWord.isDescriptionOpened = true;
        Utilities.addToCoins(-$scope.promptPrice);
      }, function(err) {
         console.error(err);
      });
    } else {
        if (window.cordova) {
          Utilities.playSound('error');
        }
      $scope.isNotEnoughCoins= true;
      hideNotEnoughCoinsMessage();
    }
  }

  function isEnoughCoinsForPrompt() {
    if ($scope.coinsCount >= $scope.promptPrice) return true
    else return false;
  }

  function hideNotEnoughCoinsMessage() {
     $timeout(function () { $scope.isNotEnoughCoins = false; }, 1000);
  }
});