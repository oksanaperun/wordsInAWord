angular.module('wordInAWord')

.controller('WordCtrl', function($ionicPlatform, $scope, $stateParams,  $timeout, $window, WordDatabase, OpenedComposingWordsCount, Coins) {
  $ionicPlatform.ready(function () {
    getWordData();
    getCoins();

    var supportsOrientationChange = 'onorientationchange' in window,
      orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

    window.addEventListener(orientationEvent, function() {
      var scrollBlock = document.getElementsByTagName('ion-scroll')[0];

      scrollBlock.style.height = $scope.getComposingWordsHeight() + 'px';
    }, false);
  });

  function getWordData() {
    WordDatabase.selectWordDataById($stateParams.wordId).then(function(res) {
        //console.log(res);

        $scope.word = res.rows.item(0);
        
        getComposingWords();
        }, function(err) {
         console.error(err);
      });
  }

  function getComposingWords() {
    WordDatabase.selectComposingWords($stateParams.wordId).then(function(res) {
        //console.log(res);

        $scope.word.composingWords = [];

        for (var i = 0; i < res.rows.length; i++)
          $scope.word.composingWords.push(res.rows.item(i));

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

  function getCoins() {
    WordDatabase.selectCoins().then(function(res) {
      //console.log(res);

      $scope.coinsCount = res.rows.item(0).coins;
      Coins.setCount($scope.coinsCount);
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

  function getAllWordNameButtons() {
    return document.getElementsByClassName('word-name-button');
  }

  $scope.disableWordNameButton = function(index) {
    var buttons = getAllWordNameButtons(),
      clickedButton = buttons[index];
    console.log('disable button');
    clickedButton.setAttribute('disabled', 'disabled');
    clickedButton.classList.remove('word-name-button-default');
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
    console.log('enable button');
    button.removeAttribute('disabled');
    button.classList.remove('word-name-button-disabled');
    button.classList.add('word-name-button-default');
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
    if (newValue && newValue != '' && newValue.length > 1) 
      checkComposedWord(newValue);
  });

 function checkComposedWord(composedWord) {
    console.log('Check composed word');
    var index = getComposedWordIndex(composedWord);
    
    if (index > -1) {
      console.log('Valid word');
      if ($scope.word.composingWords[index].isOpened == 0) {
        $scope.earnedCoins = $scope.word.composingWords[index].name.length;
        $scope.isCoinsEarned = true;
        hideEarnedCoinsMessage();
        $scope.clearComposedWord();
        $scope.enableAllWordNameButtons();
        console.log('Open word');
        openComposedWord($scope.word.composingWords[index].id, index);
        setCoins($scope.coinsCount + $scope.earnedCoins);
        Coins.setCount($scope.coinsCount + $scope.earnedCoins);
      } else {
        console.log('Already opened!');
        $scope.alreadyOpenedWord = $scope.word.composingWords[index].name;
        $scope.isAlreadyOpenedWord = true;
        hideAlreadyOpenedWordMessage();
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

  function hideEarnedCoinsMessage() {
     $timeout(function () { $scope.isCoinsEarned = false; }, 1000);
  }

  function hideAlreadyOpenedWordMessage() {
     $timeout(function () { $scope.isAlreadyOpenedWord  = false; }, 1000);
  }

  function openComposedWord(id, index) {
    WordDatabase.openComposingWordById(id).then(function(res) {
        $scope.word.composingWords[index].isOpened = 1;
        OpenedComposingWordsCount.setCount($scope.word.id, $scope.word.categoryId, $scope.getOpenWordsCount());
        }, function(err) {
         console.error(err);
    });
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
     updateCoinsCount();
  })

  function updateCoinsCount() {
    $scope.coinsCount = Coins.getCount();  
  }

  $scope.getComposingWordsHeight = function() {
    if ($scope.word && $scope.word.composingWords) {
      var lettersCount = $scope.word.name.length,
          letterWidth = 60,
          composedWordControlsHeight = 50,
          composedWordCountHeight = 30,
          menuHeight = 45,
          footerHeight = 45,
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