angular.module('wordInAWord')

  .controller('AchievementsCtrl', function ($ionicPlatform, $scope, $rootScope, DB, Utils) {
    $ionicPlatform.ready(function () {
      Utils.getAchievements();
      getUniqueOpenedComposingWordsCount();
    });

    function getUniqueOpenedComposingWordsCount() {
      DB.selectUniqueOpenedComposingWordsCount().then(function (res) {
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
