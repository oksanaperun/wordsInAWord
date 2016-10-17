angular.module('wordInAWord.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
})

.controller('WordsListCtrl', function($ionicPlatform, $scope, WordDatabase) {
  $ionicPlatform.ready(function () {
    getWordsList();
  });
   
  function getWordsList() {
    WordDatabase.selectWords().then(function(res) {
        console.log(res);
        $scope.wordsList = [];

        for (var i = 0; i < res.rows.length; i++)
          $scope.wordsList.push(res.rows.item(i));
      }, function(err) {
        console.error(err);
    });
  }
})

.controller('WordCtrl', function($ionicPlatform, $scope, $stateParams, WordDatabase) {
  $ionicPlatform.ready(function () {
    getWordData();
  });

  function getWordData() {
    WordDatabase.selectWordNameById($stateParams.wordId).then(function(res) {
        console.log(res);

        $scope.word = {name: res.rows.item(0).name};
        
        getComposingWords();
        }, function(err) {
         console.error(err);
      });
  }

  function getComposingWords() {
    WordDatabase.selectComposingWords($stateParams.wordId).then(function(res) {
        console.log(res);

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
      if (buttons[i].disabled && buttons[i].innerHTML == letter) {
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
    var buttons = document.getElementsByClassName('word-name-button');

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
        $scope.clearComposedWord();
        $scope.enableAllWordNameButtons();
        console.log('Open word');
        openComposedWord($scope.word.composingWords[index].id, index);
      } else {
        console.log('Already opened!');
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

  function openComposedWord(id, index) {
    WordDatabase.updateComposingWords(id).then(function(res) {
        $scope.word.composingWords[index].isOpened = 1;
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
});
