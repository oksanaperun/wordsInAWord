angular.module('wordInAWord')

.controller('WordCtrl', function($ionicPlatform, $scope, $rootScope, $stateParams,  $timeout, $window, $cordovaNativeAudio, WordDatabase, Utilities, AchievementsUtils) {
  $ionicPlatform.ready(function () {
    getWordData();
    if (!$rootScope.achievements[6].isEarned) {
      manageUniqueOpenedComposingWords();
    }

    if (window.cordova && $rootScope.settings.sounds) {
      $cordovaNativeAudio.preloadSimple('success', 'sounds/success.mp3');
      $cordovaNativeAudio.preloadSimple('cancel', 'sounds/cancel.wav');
      $cordovaNativeAudio.preloadSimple('bonus', 'sounds/bonus.wav');
    }
  });

  function getWordData() {
    WordDatabase.selectWordDataById($stateParams.wordId).then(function(res) {
        $scope.word = res.rows.item(0);
        getComposingWords();
        getCategoryInfo();
        }, function(err) {
         console.error(err);
      });
  }

  function getComposingWords() {
    WordDatabase.selectComposingWords($stateParams.wordId).then(function(res) {
        $scope.word.composingWords = [];
        $rootScope.word = {};
        $rootScope.word.totalComposingWordsCount = res.rows.length;
        $rootScope.word.openedComposingWordsCount = 0;

        for (var i = 0; i < res.rows.length; i++) {
          $scope.word.composingWords.push(res.rows.item(i));
          if ($scope.word.composingWords[i].isOpened) {
            $rootScope.word.openedComposingWordsCount ++;
          }
        }

        sortArrayByNameLength($scope.word.composingWords, 'asc');
        }, function(err) {
         console.error(err);
      }); 
  }

  function sortArrayByNameLength(arr, orderDirection) {
    arr.sort(function(a, b) {
        if (orderDirection = 'asc')
          return a.name.length - b.name.length ||  a.name.localeCompare(b.name);
        if (orderDirection = 'desc')
          return b.name.length - a.name.length ||  b.name.localeCompare(a.name);
    });
  }

  function getCategoryInfo() {
    WordDatabase.selectCategoryInfoById($scope.word.categoryId).then(function(res) {
        $rootScope.categoryInfo = res.rows.item(0);
      }, function(err) {
         console.error(err);
    });
  }

  function manageUniqueOpenedComposingWords() {
    WordDatabase.selectUniqueOpenedComposingWordsCount().then(function(res) {
        $scope.uniqueOpenedComposingWords = res.rows.item(0);

        if ($scope.uniqueOpenedComposingWords.count == 500) {
            AchievementsUtils.manageAchievementByIndex(6);
        }
      }, function(err) {
         console.error(err);
    });
  }

  function getAllWordNameButtons() {
    return document.getElementsByClassName('word-name-button');
  }

  $scope.disableWordNameButton = function(index) {
    var buttons = getAllWordNameButtons(),
      clickedButton = buttons[index];

    clickedButton.setAttribute('disabled', 'disabled');
    clickedButton.classList.add('word-name-button-disabled');
  }

  function enableWordNameButton(letter) {
    var buttons = getAllWordNameButtons();
    
    for (var i = buttons.length - 1; i >= 0; i--) {
      if (buttons[i].disabled && (buttons[i].innerHTML.trim() == letter)) {
        enableButton(buttons[i]);
        break;
      }
    }
  }

  function enableButton(button) {
    button.removeAttribute('disabled');
    button.classList.remove('word-name-button-disabled');
  }

  $scope.enableAllWordNameButtons = function() {
    var buttons = getAllWordNameButtons();

    for (var i = buttons.length - 1; i >= 0; i--) {
      if (buttons[i].disabled) {
        enableButton(buttons[i]);
      }
    }
  }

  $scope.addSelectedLetter = function(letter) {
    if (!$scope.composedWord) $scope.composedWord = '';

    $scope.composedWord += letter;
  }

  $scope.removeLastLetter = function() {
    if ($scope.composedWord) {
      enableWordNameButton($scope.composedWord.charAt($scope.composedWord.length - 1));
      $scope.composedWord = $scope.composedWord.slice(0, -1);
    }
  }

  $scope.clearComposedWord = function() {
    $scope.composedWord = '';
  }

  $scope.$watch('composedWord', function (newValue, oldValue) {
    if ($rootScope.achievements && $rootScope.achievements[0] && !$rootScope.achievements[0].isEarned && newValue && newValue.length == 1) {
      $scope.startComposeWordTime = new Date().getTime();
    }

    if (newValue && newValue.length > 1) {
      checkComposedWord(newValue);
    }
  });

 function checkComposedWord(composedWord) {
    var index = getComposedWordIndex(composedWord);
    
    if (index > -1) {
      if ($scope.word.composingWords[index].isOpened == 0) {
        $scope.openedWord = $scope.word.composingWords[index].name;
        $rootScope.word.openedComposingWordsCount ++;
        $rootScope.categoryInfo.openedComposingWordsCount ++;

        if ($scope.startComposeWordTime) {
            manageComposeWordTime();
        }
        manageAchievements();
        manageCoins();
        makeDefaultHeaderControls();
        openComposedWord($scope.word.composingWords[index].id, index);
      } else {
        manageAlreadyOpenedWord(index);
      }
    }
  }

  function getComposedWordIndex(composedWord) {
    for (var i = 0; i < $scope.word.composingWords.length; i++) {
      if ($scope.word.composingWords[i].name == composedWord)
        return i;
    }
    return -1;
  }

  function manageComposeWordTime() {
    $scope.endComposeWordTime = new Date().getTime();

    if ($scope.endComposeWordTime - $scope.startComposeWordTime < 500) {
      $scope.startComposeWordTime = null;
      AchievementsUtils.manageAchievementByIndex(0);
    }
  }

  function manageAchievements() {
    if (!$rootScope.achievements[1].isEarned && $scope.openedWord.length == 9) {
      AchievementsUtils.manageAchievementByIndex(1);
    }

    if (!$rootScope.achievements[2].isEarned && $rootScope.word.totalComposingWordsCount == $rootScope.word.openedComposingWordsCount) {
      AchievementsUtils.manageAchievementByIndex(2);
    }

    if (!$rootScope.achievements[5].isEarned && $rootScope.categoryInfo.totalComposingWordsCount == $rootScope.categoryInfo.openedComposingWordsCount) {
      AchievementsUtils.manageAchievementByIndex(5);
    }
  }

  function manageCoins() {
      if (window.cordova) {
          Utilities.playSound('success');
      }
     $scope.earnedCoins = $scope.openedWord.length;
     $scope.isCoinsEarned = true;
      hideEarnedCoinsMessage();

      Utilities.addToCoins($scope.earnedCoins);
  }

  function hideEarnedCoinsMessage() {
     $timeout(function () { $scope.isCoinsEarned = false; }, 1000);
  }

  function makeDefaultHeaderControls() {
      $scope.clearComposedWord();
      $scope.enableAllWordNameButtons();
  }

  function openComposedWord(id, index) {
    WordDatabase.openComposingWordById(id, 1).then(function(res) {
        $scope.word.composingWords[index].isOpened = 1;
        $rootScope.allOpenedWordsCount ++;
        Utilities.setOpenedComposingWordsCount($scope.word.id, $scope.word.categoryId, $scope.getOpenWordsCount());
        
        if (!$rootScope.achievements[6].isEarned) {
          manageUniqueOpenedComposingWords();
        }
      }, function(err) {
         console.error(err);
    });
  }

  function manageAlreadyOpenedWord(index) {
     if (window.cordova) {
            Utilities.playSound('cancel');
      }
      $scope.alreadyOpenedWord = $scope.word.composingWords[index].name;
      $scope.isAlreadyOpenedWord = true;
      hideAlreadyOpenedWordMessage();
  }

  function hideAlreadyOpenedWordMessage() {
     $timeout(function () { $scope.isAlreadyOpenedWord  = false; }, 1000);
  }
  
  $scope.displayNotOpenedWord = function(wordLength) {
    var s = '-';

    for (var i = 0; i < wordLength - 1; i++)
      s += ' -';

    return s;
  }

  $scope.getOpenWordsCount = function() {
    var count = 0;

    if ($scope.word && $scope.word.composingWords) {
      for (var i = 0; i < $scope.word.composingWords.length; i++) {
        if ($scope.word.composingWords[i].isOpened == 1)
          count +=1;
      } 
    }

    return count;
  }

  $scope.$on('$ionicView.enter', function() {
     updateComposingWords();
  })

  function updateComposingWords() {
    var openedWordId = Utilities.getOpenedWordId();

    if ($scope.word && $scope.word.composingWords) {
      for (var i = 0; i < $scope.word.composingWords.length; i++) {
        if ($scope.word.composingWords[i].id == openedWordId) {
          $scope.word.composingWords[i].isOpened = 1;
          Utilities.setOpenedComposingWordsCount($scope.word.id, $scope.word.categoryId, $scope.getOpenWordsCount());
        }
      } 
    }
  }

  $scope.getComposingWordsHeight = function() {
    if ($scope.word && $scope.word.composingWords) {
      var lettersCount = $scope.word.name.length,
          letterWidth = 68,
          composedWordControlsHeight = 50,
          composedWordCountHeight = 40,
          menuHeight = 45 + 20, // border decoration under menu has height 20
          footerHeight = 65,
          viewHeight = $window.innerHeight,
          viewWidth = $window.innerWidth,
          lettersCountInARow = Math.floor(viewWidth / letterWidth),
          lettersFullRowCount = Math.floor(lettersCount / lettersCountInARow),
          isAdditionalLettersRow = lettersCount % lettersCountInARow > 0 ? 1 : 0,
          lettersBlockHeight = (lettersFullRowCount + isAdditionalLettersRow) * letterWidth;

      return viewHeight - menuHeight - lettersBlockHeight - composedWordControlsHeight - composedWordCountHeight - footerHeight;
    }
  }
});