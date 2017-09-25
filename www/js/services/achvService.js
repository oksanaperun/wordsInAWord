angular.module('wordInAWord')

.factory('Achv', function ($rootScope, $window, Utils) {
  return {
    manageAchievementByIndex: function (index) {
      if (window.cordova && $rootScope.settings.sounds) {
        Utils.playSound('bonus');
      }

      Utils.openAchievementByIndex(index);
      Utils.showAchievementPopupByIndex(index);
      Utils.addToCoins($rootScope.achievements[index].reward);
    }
  };
})
