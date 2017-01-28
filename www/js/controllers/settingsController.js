angular.module('wordInAWord')

.controller('SettingsCtrl', function($ionicPlatform, $scope, $rootScope, WordDatabase, Utilities) {
  $scope.themes = [{
    code: 'vintage', name: 'Вінтаж'
  }, {
    code: 'space', name: 'Космос'
  }, {
    code: 'seaside', name: 'Пляж'
  }];
  $scope.selectedTheme = $rootScope.settings.theme;

  $scope.manageTheme = function(theme) {
    Utilities.changeTheme(theme.code);
    updateTheme(theme.code);
  }

  $scope.updateSounds = function(isSoundsOn) {
    WordDatabase.updateSounds(isSoundsOn).then(function(res) {
        $rootScope.settings.sounds = isSoundsOn;
      }, function(err) {
        console.error(err);
    });
  }

  function updateTheme(themeCode) {
    WordDatabase.updateTheme(themeCode).then(function(res) {
        $rootScope.settings.theme = themeCode;
      }, function(err) {
        console.error(err);
    });
  }
});