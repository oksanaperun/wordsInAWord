angular.module('wordInAWord')

  .controller('ComposingWordCtrl', function ($ionicPlatform, $scope, $rootScope, $stateParams, $timeout, $window, $cordovaNativeAudio, DB, Utils, Achv) {
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
      DB.selectComposingWordDataById($stateParams.composingWordId).then(function (res) {
        $scope.composingWord = res.rows.item(0);
        $scope.composingWordPrice = $scope.composingWord.name.length * $scope.letterPrice;
      }, function (err) {
        console.error(err);
      });
    }

    $scope.displayNotOpenedComposingWord = function () {
      var s = '-';

      if ($scope.composingWord) {
        for (var i = 0; i < $scope.composingWord.name.length - 1; i++)
          s += ' -';

        return s;
      }
    };

    $scope.displayDescription = function () {
      if ($scope.composingWord && $scope.composingWord.isDescriptionOpened && $scope.composingWord.description) {
        return $scope.composingWord.description.replace(/ ([2-9]). /g, '<br>$1. ');
      } else return '';
    };

    $scope.openComposedWord = function () {
      if (isEnoughCoinsForOpeningWord()) {
        if (window.cordova && $rootScope.settings.sounds) {
          Utils.playSound('purchase');
        }

        DB.openComposingWordById($scope.composingWord.id, 0).then(function (res) {
          $scope.composingWord.isOpened = true;
          $scope.composingWord.isDescriptionOpened = true;

          $rootScope.allOpenedWordsCount++;
          $rootScope.word.openedComposingWordsCount++;
          $rootScope.categoryInfo.openedComposingWordsCount++;

          manageAchievements();

          Utils.addToCoins(-$scope.composingWordPrice);
          Utils.setOpenedWordId($scope.composingWord.id);
        }, function (err) {
          console.error(err);
        });
      } else {
        if (window.cordova && $rootScope.settings.sounds) {
          Utils.playSound('error');
        }

        $scope.isNotEnoughCoins = true;
        hideNotEnoughCoinsMessage();
      }
    };

    function isEnoughCoinsForOpeningWord() {
      return ($scope.coinsCount >= $scope.composingWordPrice);
    }

    function manageAchievements() {
      if (!$rootScope.achievements[2].isEarned && $rootScope.word.totalComposingWordsCount == $rootScope.word.openedComposingWordsCount) {
        Achv.manageAchievementByIndex(2);
      }

      if (!$rootScope.achievements[5].isEarned && $rootScope.categoryInfo.totalComposingWordsCount == $rootScope.categoryInfo.openedComposingWordsCount) {
        Achv.manageAchievementByIndex(5);
      }

      if ($rootScope.totalComposingWordsCount == $rootScope.allOpenedWordsCount) {
        if (window.cordova && $rootScope.settings.sounds) {
          Utils.playSound('bonus');
        }

        Utils.showAllWordsOpenedPopup();
      }
    }

    $scope.openDescription = function () {
      if (isEnoughCoinsForPrompt()) {
        if (window.cordova && $rootScope.settings.sounds) {
          Utils.playSound('purchase');
        }

        DB.openComposingWordDescriptionById($scope.composingWord.id).then(function (res) {
          $scope.composingWord.isDescriptionOpened = true;
          Utils.addToCoins(-$scope.promptPrice);
        }, function (err) {
          console.error(err);
        });
      } else {
        if (window.cordova && $rootScope.settings.sounds) {
          Utils.playSound('error');
        }

        $scope.isNotEnoughCoins = true;
        hideNotEnoughCoinsMessage();
      }
    };

    function isEnoughCoinsForPrompt() {
      return ($scope.coinsCount >= $scope.promptPrice);
    }

    function hideNotEnoughCoinsMessage() {
      $timeout(function () {
        $scope.isNotEnoughCoins = false;
      }, 1000);
    }
  });
