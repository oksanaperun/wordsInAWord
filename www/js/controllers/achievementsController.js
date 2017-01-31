angular.module('wordInAWord')

  .controller('AchievementsCtrl', function ($ionicPlatform, $scope, $rootScope, WordDatabase, Utilities) {
    $ionicPlatform.ready(function () {
      Utilities.getAchievements();
      getUniqueOpenedComposingWordsCount();
    });

    function getUniqueOpenedComposingWordsCount() {
      WordDatabase.selectUniqueOpenedComposingWordsCount().then(function (res) {
        $scope.uniqueOpenedComposingWords = res.rows.item(0);
      }, function (err) {
        console.error(err);
      });
    }

    $scope.getOpenedWordsPercentage = function () {
      return ($rootScope.allOpenedWordsCount * 100 / $rootScope.totalComposingWordsCount).toFixed(2);
    };

    $scope.$on('$ionicView.enter', function () {
      getUniqueOpenedComposingWordsCount();
    });
  });
