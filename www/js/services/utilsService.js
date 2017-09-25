angular.module('wordInAWord')

  .factory('Utils', function ($ionicPopup, $rootScope, $cordovaNativeAudio, DB) {
    var openedComposingWordsCount = 0,
      wordId = 0,
      categoryId = 0,
      openedComposingWordId = 0;

    return {
      addToCoins: function (value) {
        $rootScope.coinsCount += value;

        DB.updateCoins($rootScope.coinsCount).then(function (res) {
        }, function (err) {
          console.error(err);
        });
      },
      getOpenedComposingWordsCount: function () {
        return {
          wordId: wordId,
          categoryId: categoryId,
          count: openedComposingWordsCount
        };
      },
      setOpenedComposingWordsCount: function (id, wordCategoryId, value) {
        wordId = id;
        categoryId = wordCategoryId;
        openedComposingWordsCount = value;
      },
      getOpenedWordId: function () {
        return openedComposingWordId;
      },
      setOpenedWordId: function (value) {
        openedComposingWordId = value;
      },
      getAchievements: function () {
        $rootScope.achievements = [];

        DB.selectAchievements().then(function (res) {
          for (var i = 0; i < res.rows.length; i++)
            $rootScope.achievements.push(res.rows.item(i));
        }, function (err) {
          console.error(err);
        });
      },
      showAchievementPopupByIndex: function (index) {
        var popupBody = '<div class="achievement-popup">' +
          '<p>Ви здобули винагороду</p>' +
          '<h5>' + $rootScope.achievements[index].reward + ' монет</h5>' +
          '<p>за досягнення</p>' +
          '<h4>«' + $rootScope.achievements[index].name + '»</h4>' +
          '</div>',
          achievementPopup = $ionicPopup.alert({
            title: 'ДОСЯГНЕННЯ',
            template: popupBody
          });

        achievementPopup.then(function (res) {
        });
      },
      showAllWordsOpenedPopup: function () {
        var popupBody = '<div class="achievement-popup">' +
          '<h3>Ви - переможець! Всі можливі слова у грі складено! Дякуємо за Вашу наполегливість! Бажаємо успіхів!</h3>' +
          '</div>',
          achievementPopup = $ionicPopup.alert({
            title: 'ВІТАННЯ!',
            template: popupBody
          });

        achievementPopup.then(function (res) {
        });
      },
      showOpenedCategoryPopup: function (name) {
        var popupBody = '<div class="achievement-popup">' +
          '<p>Ви відкрили категорію</p>' +
          '<h4>«' + name + '»</h4>' +
          '</div>',
          achievementPopup = $ionicPopup.alert({
            title: 'ВІТАННЯ!',
            template: popupBody
          });

        achievementPopup.then(function (res) {
        });
      },
      openAchievementByIndex: function (index) {
        DB.openAchievementByIndex(index).then(function (res) {
          $rootScope.achievements[index].isEarned = 1;
        }, function (err) {
          console.error(err);
        });
      },
      playSound: function (sound) {
        if ($rootScope.settings && $rootScope.settings.sounds) {
          $cordovaNativeAudio.play(sound);
        }
      },
      changeTheme: function (theme) {
        var styleElements = document.getElementsByTagName('link');

        for (var i = 0; i < styleElements.length; i++) {
          if (styleElements[i].title == 'theme') {
            //console.log('Change theme');
            styleElements[i].href = 'css/' + theme + '.css';
          }
        }
      },
      showConfirmExitPopup: function () {
        var popupBody = '<div class="confirm-exit-popup">' +
          '<h4>Ви дійсно бажаєте вийти з гри?</h4>' +
          '</div>',
          confirmLeavePopup = $ionicPopup.confirm({
            title: 'ВИХІД',
            template: popupBody,
            buttons: [
              { text: 'Ні' },
              {
                text: 'Так',
                type: 'button-positive',
                onTap: function (e) {
                  ionic.Platform.exitApp();
                }
              }
            ]
          });

        confirmLeavePopup.then(function (res) {
        });
      }
    };
  })
