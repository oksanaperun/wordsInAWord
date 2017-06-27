angular.module('wordInAWord.services', [])

  .factory('Utilities', function ($ionicPopup, $rootScope, $cordovaNativeAudio, WordDatabase) {
    var openedComposingWordsCount = 0,
      wordId = 0,
      categoryId = 0,
      openedComposingWordId = 0;

    return {
      addToCoins: function (value) {
        $rootScope.coinsCount += value;

        WordDatabase.updateCoins($rootScope.coinsCount).then(function (res) {
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

        WordDatabase.selectAchievements().then(function (res) {
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
        WordDatabase.openAchievementByIndex(index).then(function (res) {
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
              {text: 'Ні'},
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
      },
      firstDataUpdate: function () {
        var newComposingWords = "('омар', 58), ('волос', 78), ('лати', 16), ('лати', 51), ('абак', 5), ('абак', 20), ('абак', 38), ('саке', 17), ('саке', 60), ('саке', 71), ('саке', 100)",
            composingWordsIdsToDelete = [114, 2406, 2504, 3601, 4030],
            newWordsDescriptions = "('волос', '1. Те саме, що волосина 2. Те саме, що волосся 3. Шерсть тварин, а також волосини з гриви та хвоста коней; використовується для різних виробів і технічних потреб 4. Волокна деяких тропічних і субтропічних рослин 5. Опух з наривом під нігтем пальця 6. Тонкий, як волосинка, водяний черв’як'), " +
              "('лати', 'Металеве спорядження стародавнього воїна, яке захищало від холодної, а пізніше і від вогнепальної зброї'), " +
              "('абак', 'Те саме, що абака (1. Плита (звичайно квадратна), що становить верхню частину капітелі колони 2. Лічильна дошка у давніх греків та римлян)'), " +
              "('саке', 'Японська рисова горілка')",
            word1 = 'арак',
            word1NewDescription = 'Поширений на сході міцний спиртний напій, що виготовляється із соку пальми, рису, ячменю, пшениці та ін.',
            word2 = 'арат',
            word2NewDescription = 'У Монголії – селянин, що займається кочовим тваринництвом';

        WordDatabase.insertComposingWords(newComposingWords).then(function () {
          WordDatabase.deleteComposingWordsByIds(composingWordsIdsToDelete).then(function () {
            WordDatabase.insertWordsDescriptions(newWordsDescriptions).then(function () {
              WordDatabase.updateWordDescription(word1, word1NewDescription).then(function () {
                WordDatabase.updateWordDescription(word2, word2NewDescription).then(function () {
                }, function (err) {
                  console.error(err);
                });
              }, function (err) {
                console.error(err);
              });
            }, function (err) {
              console.error(err);
            });
          }, function (err) {
            console.error(err);
          });
        }, function (err) {
          console.error(err);
        });
      },
      secondDataUpdate: function () {
        var newComposingWords = "('саке', 95), ('дан', 13), ('дан', 26), ('дан', 36), ('твід', 14), ('біт', 5), ('біт', 14), ('біт', 85), ('біт', 90), ('біт', 95), ('ара', 9), ('ара', 19), ('ара', 23), ('ара', 25), ('ара', 26), ('ара', 32), ('ара', 40), ('ара', 49), ('ара', 56), ('ара', 59), ('ара', 68), ('ара', 72), ('ара', 76), ('ара', 92), ('ара', 97), ('ара', 98)",
            newWordsDescriptions = "('твід', 'Шерстяна тканина полотняного переплетення для верхнього одягу'), " +
              "('біт', '1. Мінімальна одиниця виміру кількості інформації та об’єму пам’яті комп’ютера (дорівнює одній комірці або одному двійковому знаку типу «так-ні») 2. Одиниця ємності пам’яті, яка відповідає одному двійковому розряду 3. Чіткий ритм в музиці || Ритм (про роботу серця) 4. Те саме, що біт-музика'), " +
              "('ара', 'Група довгохвостих папуг')";

        WordDatabase.insertComposingWords(newComposingWords).then(function () {
          WordDatabase.insertWordsDescriptions(newWordsDescriptions).then(function () {
            WordDatabase.updateComposingWordName('тетрарх ', 'тетрарх').then(function () {
              WordDatabase.updateNameInWordDescription('тетрарх ', 'тетрарх').then(function () {
              }, function (err) {
                console.error(err);
              });
            }, function (err) {
              console.error(err);
            });
          }, function (err) {
            console.error(err);
          });
        }, function (err) {
          console.error(err);
        });
      }
    };
  })

  .factory('AchievementsUtils', function ($rootScope, $window, Utilities) {
    return {
      manageAchievementByIndex: function (index) {
        if (window.cordova && $rootScope.settings.sounds) {
          Utilities.playSound('bonus');
        }

        Utilities.openAchievementByIndex(index);
        Utilities.showAchievementPopupByIndex(index);
        Utilities.addToCoins($rootScope.achievements[index].reward);
      }
    };
  })

  .factory('WordDatabase', function ($cordovaSQLite, $rootScope, $ionicPlatform) {

    return {
      initDatabase: function () {
        //console.log('Connecting to DB');
        if ($ionicPlatform.is('android')) {
          $rootScope.db = window.sqlitePlugin.openDatabase({
            name: "wordsInAWord.db",
            location: 'default',
            createFromLocation: 1
          });
        } else {
          $rootScope.db = window.openDatabase('wordsInAWord.db', '1', 'words db', 256 * 256 * 100); // browser
        }
      },
      selectCategories: function () {
        var query = "SELECT id, name, isOpened FROM categories";
        //console.log('select categories');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectCategoryInfoById: function (id) {
        var query = "SELECT (SELECT COUNT(CW.id) FROM composing_words as CW " +
          "LEFT JOIN words as W ON CW.wordId = W.id " +
          "LEFT JOIN categories as C ON W.categoryId = C.id " +
          "WHERE C.id = ?) totalComposingWordsCount, " +
          "(SELECT COUNT(case CW.isOpened when 1 then 1 else null end) FROM composing_words as CW " +
          "LEFT JOIN words as W ON CW.wordId = W.id " +
          "LEFT JOIN categories as C ON W.categoryId = C.id " +
          "WHERE C.id = ?) openedComposingWordsCount";
        //console.log('select category info');
        return $cordovaSQLite.execute($rootScope.db, query, [id, id]);
      },
      openCategoryById: function (id) {
        var query = "UPDATE categories SET isOpened = 1 WHERE id = ?";
        //console.log('open category');
        return $cordovaSQLite.execute($rootScope.db, query, [id]);
      },
      selectWords: function () {
        var query = "SELECT W.id, W.name, W.categoryId, " +
          "(SELECT COUNT(id) FROM composing_words WHERE wordId = W.id) totalComposingWords, " +
          "(SELECT COUNT(case isOpened when 1 then 1 else null end) FROM composing_words WHERE wordId = W.id) openedComposingWords " +
          "FROM words as W";
        //console.log('select words');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectWordDataById: function (id) {
        var query = "SELECT id, name, categoryId FROM words WHERE id = ?";
        //console.log('select word data');
        return $cordovaSQLite.execute($rootScope.db, query, [id]);
      },
      selectComposingWords: function (wordId) {
        var query = "SELECT id, name, isOpened FROM composing_words WHERE wordId = ?";
        //console.log('select composing words');
        return $cordovaSQLite.execute($rootScope.db, query, [wordId]);
      },
      selectUniqueOpenedComposingWordsCount: function () {
        var query = "SELECT COUNT(DISTINCT name) count FROM composing_words WHERE isComposedByUser = 1";
        //console.log('select unique composing words count opened by user');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      openComposingWordById: function (id, isComposedByUser) {
        var query = "UPDATE composing_words SET isOpened = 1, isDescriptionOpened = 1, isComposedByUser = ? WHERE id=?";
        //console.log('open composing word');
        return $cordovaSQLite.execute($rootScope.db, query, [isComposedByUser, id]);
      },
      openComposingWordDescriptionById: function (id) {
        var query = "UPDATE composing_words SET isDescriptionOpened = 1 WHERE id = ?";
        //console.log('open composing word description');
        return $cordovaSQLite.execute($rootScope.db, query, [id]);
      },
      selectComposingWordDataById: function (id) {
        var query = "SELECT CW.id, CW.name, CW.isOpened, CW.isDescriptionOpened, WD.description " +
          "FROM composing_words CW LEFT JOIN words_descriptions WD ON CW.name = WD.name " +
          "WHERE CW.id = ?";
        //console.log('select composing word data');
        return $cordovaSQLite.execute($rootScope.db, query, [id]);
      },
      insertComposingWords: function(data) {
        var query = "INSERT INTO composing_words (name, wordId) VALUES " + data;
        //console.log('insert composing words ' + data);
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateComposingWordName: function(oldName, newName) {
        var query = "UPDATE composing_words SET name = ? WHERE name = ?";
        //console.log('update composing word with old name ' + oldName);
        return $cordovaSQLite.execute($rootScope.db, query, [newName, oldName]);
      },
      deleteComposingWordsByIds: function(ids) {
        var idsList = '(' + ids[0];

        for (var i = 1; i < ids.length; i++)
          idsList += ', ' + ids[i];

        idsList += ')';

        var query = "DELETE FROM composing_words WHERE id IN " + idsList;
        //console.log('delete composing words');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      selectWordDescriptionByName: function(name) {
        var query = "SELECT * FROM words_descriptions WHERE name = ?";
        //console.log('select word description by name ' + name);
        return $cordovaSQLite.execute($rootScope.db, query, [name]);
      },
      insertWordsDescriptions: function(data) {
        var query = "INSERT INTO words_descriptions (name, description) VALUES " + data;
        //console.log('insert words descriptions ' + data);
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateNameInWordDescription: function(oldName, newName) {
        var query = "UPDATE words_descriptions SET name = ? WHERE name = ?";
        //console.log('update name in word description with old name ' + oldName);
        return $cordovaSQLite.execute($rootScope.db, query, [newName, oldName]);
      },
      updateWordDescription: function(name, newDescription) {
        var query = "UPDATE words_descriptions SET description = ? WHERE name = ?";
        //console.log('update word description');
        return $cordovaSQLite.execute($rootScope.db, query, [newDescription, name]);
      },
      selectCoins: function () {
        var query = "SELECT coins FROM user_settings";
        //console.log('select coins');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateCoins: function (value) {
        var query = "UPDATE user_settings SET coins = ?";
        //console.log('update coins with value ' + value);
        return $cordovaSQLite.execute($rootScope.db, query, [value]);
      },
      selectAchievements: function () {
        var query = "SELECT * FROM achievements";
        //console.log('select achievements');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      openAchievementByIndex: function (index) {
        var query = "UPDATE achievements SET isEarned = 1 WHERE id = ?";
        //console.log('open achievement');
        return $cordovaSQLite.execute($rootScope.db, query, [index + 1]);
      },
      selectSettings: function () {
        var query = "SELECT sounds, theme FROM user_settings";
        //console.log('select user_settings');
        return $cordovaSQLite.execute($rootScope.db, query);
      },
      updateSounds: function (isSoundsOn) {
        var query = "UPDATE user_settings SET sounds = ?";
        //console.log('update user_settings sounds');
        isSoundsOn = isSoundsOn ? 1 : 0;
        return $cordovaSQLite.execute($rootScope.db, query, [isSoundsOn]);
      },
      updateTheme: function (theme) {
        var query = "UPDATE user_settings SET theme = ?";
        //console.log('update user_settings theme');
        return $cordovaSQLite.execute($rootScope.db, query, [theme]);
      },
      editData: function () {
        //var query = "CREATE TABLE categories ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, isOpened INTEGER NOT NULL DEFAULT 0 )"
        //var query = "CREATE TABLE composing_words ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL, isOpened INTEGER NOT NULL DEFAULT 0, isComposedByUser INTEGER NOT NULL DEFAULT 0, isDescriptionOpened INTEGER NOT NULL DEFAULT 0, wordId INTEGER NOT NULL, FOREIGN KEY(wordId) REFERENCES words(id) )"
        //var query = "CREATE TABLE words ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, categoryId INTEGER NOT NULL, FOREIGN KEY(categoryId) REFERENCES categories(id) )"
        //var query = "CREATE TABLE words_descriptions (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, description TEXT)"
        //var query = "INSERT INTO categories VALUES (1, 'Україна', 1), (2, 'Дерева',0), (3, 'Архітектура', 0)"
        //var query = "insert into words(name, categoryId) values ('українець', 1), ('чорнозем', 1), ('барвінок', 1), ('вишиванка', 1), ('батьківщина', 1), ('горобина', 2), ('черемха', 2), ('модрина', 2), ('жакаранда', 2), ('евкаліпт', 2)";
        //var query = "insert into composing_words(name, wordId) values ('аїр', 1), ('акр', 1), ('анкер', 1), ('ар', 1)"
        //var query = "insert into composing_words(name, wordId) values ('зерно', 2), ('зеро', 2), ('мезон', 2), ('мер', 2), ('меч', 2), ('мор', 2), ('море', 2), ('мороз', 2)"
        //var query = "insert into composing_words (name, wordId) values ('акин', 4), ('вика', 4), ('вина', 4), ('вишивка', 4), ('вишина', 4)";
        //var query = "insert into composing_words (name, wordId) values ('вишка', 4), ('вишник', 4), ('вшивка', 4), ('кава', 4), ('канва', 4)";
        //var query = "insert into composing_words (name, wordId) values ('абак', 5), ('абат', 5), ('акант', 5), ('акин', 5), ('акт', 5)";
        //var query = "insert into composing_words (name, wordId) values ('ангоб', 6), ('ар', 6), ('аргон', 6), ('багно', 6), ('багор', 6)";
        //var query = "insert into words_descriptions (name) values ('аїр'), ('акр'), ('анкер'), ('ap'), ('зерно'), ('зеро'), ('мезон'), ('мер'), ('меч'), ('мор'), ('мороз')"
        //var query = "insert into words_descriptions (name) values ('акин'), ('вика'), ('вина'), ('вишивка'), ('вишина'), ('вишка'), ('вишник'), ('вшивка'), ('канва')"
        //var query = "insert into words_descriptions (name) values ('абак'), ('абат'), ('акант'), ('акт'), ('ангоб'), ('аргон'), ('багно'), ('багор')"
        //var query = "update words_descriptions set description = 'Одиниця виміру земельної площі в Англії і Північній Америці; дорівнює 4047 м2' where name = 'акр'"
        //var query = "create table user_settings(coins integer not null, sounds integer not null, theme text not null)"
        //var query = "insert into user_settings(coins, sounds, theme) values (0, 1, 'vintage')"
        //var query = "update user_settings set coins = 0"
        //var query = "update composing_words set isOpened = 0, isDescriptionOpened = 0, isComposedByUser = 0";
        //var query = "update categories set isOpened = 0 where id = 2 or id = 3"
        //var query = "drop table user_settings"
        //var query = "create table achievements(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL, description TEXT NOT NULL, isEarned INTEGER NOT NULL DEFAULT 0, reward INTEGER NOT NULL DEFAULT 0)"
        //var query = "insert into achievements(name, description, reward) values ('Блискавична швидкість', 'Складено слово швидше, ніж за півсекунди', 100), ('Розумник','Складено найдовше слово (не враховуються відкриті слова за монети)', 200), ('Маестро слова', 'Відкрито всі слова з одного слова, в тому числі за монети', 300)"
        //var query = "insert into achievements(name, description, reward) values ('Першовідкривач', 'Відкрито першу категорію', 400), ('На півшляху', 'Відкрито половину категорій слів', 700), ('Маестро категорії', 'Відкрито всі слова з однієї категорії, в тому числі за монети', 1000)"
        //var query = "insert into achievements(name, description, reward) values ('500 слів', 'Складено 500 унікальних слів (не враховуються відкриті слова за монети)', 1000)"
        //var query = "update achievements set isEarned = 0";

        //var query = "delete from composing_words where id > 464";
        //var query = "delete from words_descriptions where id > 59";
        //var query = "select count(id) from composing_words where name = 'ара'";
        console.log('updating data');
        return $cordovaSQLite.execute($rootScope.db, query);
      }
    }
  });
