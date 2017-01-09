angular.module('wordInAWord')

.controller('AchievementsCtrl', function($ionicPlatform, $scope, $rootScope, WordDatabase, Utilities) {
  $ionicPlatform.ready(function () {
    getAchievements();
    getComposingWordsInfo();
  });

  function getComposingWordsInfo() {
    WordDatabase.selectComposingWordsInfo().then(function(res) {
        $scope.composingWords = res.rows.item(0);
        $rootScope.allOpenedWordsCount = $scope.composingWords.openedWordsCount;
      }, function(err) {
        console.error(err);
    });
  }

  function getAchievements() {
    Utilities.getAchievements();
  };

  $scope.getOpenedWordsPercentage = function() {
    if ($scope.composingWords) {
      return ($rootScope.allOpenedWordsCount * 100 / $scope.composingWords.totalWordsCount).toFixed(2);
    }
  };
});