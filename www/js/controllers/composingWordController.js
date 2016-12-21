angular.module('wordInAWord')

.controller('ComposingWordCtrl', function($ionicPlatform, $scope, $stateParams,  $timeout, $cordovaNativeAudio, WordDatabase, Coins, OpenedWord) {
  $ionicPlatform.ready(function () {
    $scope.promptPrice = 15;
    $scope.letterPrice = 10;

    getComposingWordData();
    getCoins();

     if (window.cordova) {
      $cordovaNativeAudio.preloadSimple('error', 'sounds/error.wav');
    }
  });

  function getComposingWordData() {
    WordDatabase.selectComposingWordDataById($stateParams.composingWordId).then(function(res) {
        //console.log(res);

        $scope.composingWord = res.rows.item(0);
        $scope.composingWordPrice = $scope.composingWord.name.length * $scope.letterPrice;
        }, function(err) {
         console.error(err);
      });
  }

  function getCoins() {
    WordDatabase.selectCoins().then(function(res) {
      //console.log(res);

      $scope.coinsCount = res.rows.item(0).coins;
      }, function(err) {
        console.error(err);
    }); 
  }

  function setCoins(value) {
    WordDatabase.updateCoins(value).then(function(res) {
      $scope.coinsCount = value;
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
    if ($scope.composingWord && $scope.composingWord.isDescriptionOpened) {
      var description = $scope.composingWord.description.replace(/ ([2-9]). /g, '<br>$1. ');

      return description;
    } else return '';
  }

  function isEnoughCoinsForOpeningWord() {
    if ($scope.coinsCount >= $scope.composingWordPrice) return true
    else return false;
  }

  $scope.openComposedWord = function() {
    if (isEnoughCoinsForOpeningWord()) {
      WordDatabase.openComposingWordById($scope.composingWord.id).then(function(res) {
        $scope.composingWord.isOpened = true;
        $scope.composingWord.isDescriptionOpened = true;
        Coins.setCount($scope.coinsCount - $scope.composingWordPrice);
        setCoins($scope.coinsCount - $scope.composingWordPrice);
        OpenedWord.setOpenedWordId($scope.composingWord.id);
      }, function(err) {
         console.error(err);
      });
    } else {
        if (window.cordova) {
          playSound('error');
        }
      $scope.isNotEnoughCoins= true;
      hideNotEnoughCoinsMessage();
    }
  }

  function isEnoughCoinsForPrompt() {
    if ($scope.coinsCount >= $scope.promptPrice) return true
    else return false;
  }

  $scope.openDescription = function() {
    if (isEnoughCoinsForPrompt()) {
      WordDatabase.openComposingWordDescriptionById($scope.composingWord.id).then(function(res) {
        $scope.composingWord.isDescriptionOpened = true;
        Coins.setCount($scope.coinsCount - $scope.promptPrice);
        setCoins($scope.coinsCount - $scope.promptPrice);
      }, function(err) {
         console.error(err);
      });
    } else {
        if (window.cordova) {
          playSound('error');
        }
      $scope.isNotEnoughCoins= true;
      hideNotEnoughCoinsMessage();
    }
  }

  function playSound(sound) {
    $cordovaNativeAudio.play(sound);
  }

  function hideNotEnoughCoinsMessage() {
     $timeout(function () { $scope.isNotEnoughCoins = false; }, 1000);
  }

  $scope.$on('$ionicView.enter', function() {
     updateCoinsCount();
  })

  function updateCoinsCount() {
    $scope.coinsCount = Coins.getCount();  
  }
});