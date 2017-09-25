angular.module('wordInAWord')

  .controller('WordCtrl', function ($ionicPlatform, $scope, $rootScope, $stateParams, $timeout, $window, $cordovaNativeAudio, DB, Utils, Achv) {
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

    $scope.windowWidth = $window.innerWidth;
    $scope.windowHeight = $window.innerHeight;
    $scope.letterWidth = $scope.windowHeight < 600 ? 58 : 68;
    $scope.composedWordControlsWidth = $scope.windowHeight < 600 ? 285 : 305;
    $scope.composingWordWidth = Math.floor($scope.windowWidth / 3);

    function getWordData() {
      DB.selectWordDataById($stateParams.wordId).then(function (res) {
        $scope.word = res.rows.item(0);
        $scope.word.name = $scope.word.name.replace('-', '');

        var calculatedLettersCountInARow = Math.floor($scope.windowWidth / $scope.letterWidth);

        $scope.lettersCountInARow = calculatedLettersCountInARow > 8 ? 8 : calculatedLettersCountInARow;
        $scope.chunkedLetters = chunk($scope.word.name.split(''), $scope.lettersCountInARow);

        getComposingWords();
        getCategoryInfo();
        setSize();
      }, function (err) {
        console.error(err);
      });
    }

    function getComposingWords() {
      DB.selectComposingWords($stateParams.wordId).then(function (res) {
        $scope.word.composingWords = [];
        $rootScope.word = {};
        $rootScope.word.totalComposingWordsCount = res.rows.length;
        $rootScope.word.openedComposingWordsCount = 0;

        for (var i = 0; i < res.rows.length; i++) {
          $scope.word.composingWords.push(res.rows.item(i));
          if ($scope.word.composingWords[i].isOpened) {
            $rootScope.word.openedComposingWordsCount++;
          }
        }

        sortArrayByNameLength($scope.word.composingWords, 'asc');
        $scope.chunkedComposingWords = chunk($scope.word.composingWords, 3);
      }, function (err) {
        console.error(err);
      });
    }

    function sortArrayByNameLength(arr, orderDirection) {
      arr.sort(function (a, b) {
        if (orderDirection = 'asc')
          return a.name.length - b.name.length || a.name.localeCompare(b.name);
        if (orderDirection = 'desc')
          return b.name.length - a.name.length || b.name.localeCompare(a.name);
      });
    }

    function getCategoryInfo() {
      DB.selectCategoryInfoById($scope.word.categoryId).then(function (res) {
        $rootScope.categoryInfo = res.rows.item(0);
      }, function (err) {
        console.error(err);
      });
    }

    function manageUniqueOpenedComposingWords() {
      DB.selectUniqueOpenedComposingWordsCount().then(function (res) {
        $scope.uniqueOpenedComposingWords = res.rows.item(0);

        if ($scope.uniqueOpenedComposingWords.count == 700) {
          Achv.manageAchievementByIndex(6);
        }
      }, function (err) {
        console.error(err);
      });
    }

    function getAllWordNameButtons() {
      return document.getElementsByClassName('word-name-button');
    }

    $scope.disableWordNameButton = function (index, rowIndex) {
      var buttons = getAllWordNameButtons(),
        clickedButton = buttons[index + rowIndex * $scope.lettersCountInARow];

      clickedButton.setAttribute('disabled', 'disabled');
      clickedButton.classList.add('word-name-button-disabled');
    };

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

    $scope.enableAllWordNameButtons = function () {
      var buttons = getAllWordNameButtons();

      for (var i = buttons.length - 1; i >= 0; i--) {
        if (buttons[i].disabled) {
          enableButton(buttons[i]);
        }
      }
    };

    $scope.addSelectedLetter = function (letter) {
      if (!$scope.composedWord) $scope.composedWord = '';

      $scope.composedWord += letter;
    };

    $scope.removeLastLetter = function () {
      if ($scope.composedWord) {
        enableWordNameButton($scope.composedWord.charAt($scope.composedWord.length - 1));
        $scope.composedWord = $scope.composedWord.slice(0, -1);
      }
    };

    $scope.clearComposedWord = function () {
      $scope.composedWord = '';
    };

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
          $rootScope.word.openedComposingWordsCount++;
          $rootScope.categoryInfo.openedComposingWordsCount++;

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
        Achv.manageAchievementByIndex(0);
      }
    }

    function manageAchievements() {
      if (!$rootScope.achievements[1].isEarned && $scope.openedWord.length == 9) {
        Achv.manageAchievementByIndex(1);
      }

      if (!$rootScope.achievements[2].isEarned && $rootScope.word.totalComposingWordsCount == $rootScope.word.openedComposingWordsCount) {
        Achv.manageAchievementByIndex(2);
      }

      if (!$rootScope.achievements[5].isEarned && $rootScope.categoryInfo.totalComposingWordsCount == $rootScope.categoryInfo.openedComposingWordsCount) {
        Achv.manageAchievementByIndex(5);
      }
    }

    function manageCoins() {
      if (window.cordova && $rootScope.settings.sounds) {
        Utils.playSound('success');
      }
      $scope.earnedCoins = $scope.openedWord.length;
      $scope.isCoinsEarned = true;
      hideEarnedCoinsMessage();

      Utils.addToCoins($scope.earnedCoins);
    }

    function hideEarnedCoinsMessage() {
      $timeout(function () {
        $scope.isCoinsEarned = false;
      }, 1000);
    }

    function makeDefaultHeaderControls() {
      $scope.clearComposedWord();
      $scope.enableAllWordNameButtons();
    }

    function openComposedWord(id, index) {
      DB.openComposingWordById(id, 1).then(function (res) {
        $scope.word.composingWords[index].isOpened = 1;
        $rootScope.allOpenedWordsCount++;
        Utils.setOpenedComposingWordsCount($scope.word.id, $scope.word.categoryId, $scope.getOpenedWordsCount());

        if (!$rootScope.achievements[6].isEarned) {
          manageUniqueOpenedComposingWords();
        }

        if ($rootScope.totalComposingWordsCount == $rootScope.allOpenedWordsCount) {
          if (window.cordova && $rootScope.settings.sounds) {
            Utils.playSound('bonus');
          }
          Utils.showAllWordsOpenedPopup();
        }
      }, function (err) {
        console.error(err);
      });
    }

    function manageAlreadyOpenedWord(index) {
      if (window.cordova && $rootScope.settings.sounds) {
        Utils.playSound('cancel');
      }
      $scope.alreadyOpenedWord = $scope.word.composingWords[index].name;
      $scope.isAlreadyOpenedWord = true;
      hideAlreadyOpenedWordMessage();
    }

    function hideAlreadyOpenedWordMessage() {
      $timeout(function () {
        $scope.isAlreadyOpenedWord = false;
      }, 1000);
    }

    $scope.displayNotOpenedWord = function (wordLength) {
      var s = '-';

      for (var i = 0; i < wordLength - 1; i++)
        s += ' -';

      return s;
    };

    $scope.getOpenedWordsCount = function () {
      var count = 0;

      if ($scope.word && $scope.word.composingWords) {
        for (var i = 0; i < $scope.word.composingWords.length; i++) {
          if ($scope.word.composingWords[i].isOpened == 1)
            count += 1;
        }
      }

      return count;
    };

    $scope.getEndOfOpenedWordsDescription = function () {
      if ($scope.word && $scope.word.composingWords) {
        if ($scope.word.composingWords.length.toString().slice(-2) == 11)
          return 'слів';
        else if ($scope.word.composingWords.length % 10 == 1)
          return 'слова';
        else return 'слів';
      }
    };

    $scope.$on('$ionicView.enter', function () {
      updateComposingWords();
    });

    function updateComposingWords() {
      var openedWordId = Utils.getOpenedWordId();

      if ($scope.word && $scope.word.composingWords) {
        for (var i = 0; i < $scope.word.composingWords.length; i++) {
          if ($scope.word.composingWords[i].id == openedWordId) {
            $scope.word.composingWords[i].isOpened = 1;
            Utils.setOpenedComposingWordsCount($scope.word.id, $scope.word.categoryId, $scope.getOpenedWordsCount());
          }
        }
      }
    }

    function setSize() {
        var borderDecorationHeight = 20,
          marginTop = 4,
          composedWordControlsHeight = 50,
          composedWordCountHeight = 15,
          menuHeight = 44, 
          footerHeight = 65,
          lettersCount = $scope.word.name.length,
          lettersFullRowCount = Math.floor(lettersCount / $scope.lettersCountInARow),
          isAdditionalLettersRow = lettersCount % $scope.lettersCountInARow > 0 ? 1 : 0,
          lettersRowsCount = lettersFullRowCount + isAdditionalLettersRow,
          headerBlockHeigth = borderDecorationHeight * 2 + marginTop + lettersRowsCount * $scope.letterWidth + composedWordControlsHeight + composedWordCountHeight;

        $scope.lettersBlockHeight = lettersRowsCount * $scope.letterWidth;
        $scope.composingWordsListHeight = $scope.windowHeight - menuHeight - headerBlockHeigth - footerHeight;
    }

    function chunk(arr, size) {
      var newArr = [];

      for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
      }
      return newArr;
    }
  });
