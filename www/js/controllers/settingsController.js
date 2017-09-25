angular.module('wordInAWord')

  .controller('SettingsCtrl', function ($ionicPlatform, $scope, $rootScope, DB, Utils) {
    $scope.themes = [
      {
        code: 'flowers', name: 'Весняні квіти'
      }, {
        code: 'vintage', name: 'Вінтаж'
      }, {
        code: 'space', name: 'Космос'
      }, {
        code: 'seaside', name: 'Пляж'
      }
    ];
    $scope.selectedTheme = $rootScope.settings.theme;
    $scope.soundsMode = $rootScope.settings.sounds;

    $scope.manageTheme = function (theme) {
      Utils.changeTheme(theme.code);
      updateTheme(theme.code);
    };

    $scope.updateSounds = function (isSoundsOn) {
      DB.updateSounds(isSoundsOn).then(function (res) {
        $scope.soundsMode = isSoundsOn;
        $rootScope.settings.sounds = isSoundsOn;
      }, function (err) {
        console.error(err);
      });
    };

    function updateTheme(themeCode) {
      DB.updateTheme(themeCode).then(function (res) {
        $rootScope.settings.theme = themeCode;
      }, function (err) {
        console.error(err);
      });
    }
  });
