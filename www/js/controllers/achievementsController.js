angular.module('wordInAWord')

.controller('AchievementsCtrl', function($ionicPlatform, $scope, $rootScope, WordDatabase, Utilities) {
  $ionicPlatform.ready(function () {
    getAchievements();
    getComposingWordsInfo();
    getUniqueOpenedComposingWordsCount();
  });

  function getAchievements() {
    Utilities.getAchievements();
  };

  function getComposingWordsInfo() {
    WordDatabase.selectComposingWordsInfo().then(function(res) {
        $scope.composingWords = res.rows.item(0);
        $rootScope.allOpenedWordsCount = $scope.composingWords.openedWordsCount;
      }, function(err) {
        console.error(err);
    });
  }

  function getUniqueOpenedComposingWordsCount() {
    WordDatabase.selectUniqueOpenedComposingWordsCount().then(function(res) {
        $scope.uniqueOpenedComposingWords = res.rows.item(0);
      }, function(err) {
         console.error(err);
    });
  }

  $scope.getOpenedWordsPercentage = function() {
    if ($scope.composingWords) {
      return ($rootScope.allOpenedWordsCount * 100 / $scope.composingWords.totalWordsCount).toFixed(2);
    }
  };

  $scope.$on('$ionicView.enter', function() {
     getUniqueOpenedComposingWordsCount();
  })
});