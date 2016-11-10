angular.module('wordInAWord.services', [])

.factory('OpenedComposingWordsCount', function() {
    var count = 0,
        wordId = 0,
        categoryId = 0;

    return {
      getCount: function () {
        return {
          wordId: wordId,
          categoryId: categoryId,
          count: count
        };
      },
      setCount: function(id, wordCategoryId, value) {
        wordId = id;
        categoryId = wordCategoryId;
        count = value;        
      }
    };
})

.factory('WordDatabase', function($cordovaSQLite, $rootScope) {

  return {
    initDatabase: function() {
/*    window.plugins.sqlDB.remove('wordsInAWord.db', 0, function() {
      $rootScope.tryCopyDB = 'DB removed'
    }, function(error) {
      $rootScope.tryCopyDB = 'Failed to remove DB: ' + error.code;
    });*/

    console.log('Connecting to DB');
    if (window.cordova) {
/*      window.plugins.sqlDB.copy('wordsInAWord.db', 0, function() {
        $rootScope.tryCopyDB = 'DB copied';
        $rootScope.db = window.sqlitePlugin.openDatabase({name: 'wordsInAWord.db', location: 1});
        }, function(error) {
          $rootScope.tryCopyDB = 'Failed to copy DB: ' + error.code;
          //$rootScope.db = $cordovaSQLite.openDB('wordsInAWord.db');
      }); */

      $rootScope.db = window.sqlitePlugin.openDatabase({name: 'wordsInAWord.db', location: 1});
    } else {
        $rootScope.db = window.openDatabase('wordsInAWord.db', '1', 'words db', 256 * 256 * 100); // browser
    }
    },
    selectCategories: function() {
      var query = "SELECT id, name, isOpened FROM categories";
      console.log('select categories');
      return $cordovaSQLite.execute($rootScope.db, query);
    },
  	selectWords: function() {
    	var query = "SELECT W.id, W.name, W.categoryId, " +
      "(SELECT COUNT(id) FROM composing_words WHERE wordId = W.id) totalComposingWords, " +
      "(SELECT COUNT(case isOpened when 1 then 1 else null end) FROM composing_words WHERE wordId = W.id) openedComposingWords " +
      "FROM words as W";
      //var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='composing_words'";
      //var query = "CREATE TABLE composing_words(id integer primary key, name text, description text, isOpened integer default 0, wordId integer)"
      //var query = "insert into words(id, name) values (1, 'смерека'), (2, 'автомобіль')";
      //var query = "insert into composing_words(id, name, wordId) values (3, 'авто', 2), (4, 'альбом', 2), (5, 'альт', 2), (6, 'ат', 2), (7, 'атол', 2), (8, 'атом', 2)"
      
      console.log('select words');
      return $cordovaSQLite.execute($rootScope.db, query);
	 },
   selectWordDataById: function(id) {
      var query = "SELECT id, name, categoryId FROM words WHERE id=?";
      console.log('select word data');
      return $cordovaSQLite.execute($rootScope.db, query, [id]);
   },
   selectComposingWords: function(wordId) {
      var query = "SELECT id, name, description, isOpened FROM composing_words WHERE wordId=?";
      console.log('select composing words');
      return $cordovaSQLite.execute($rootScope.db, query, [wordId]);
    },
    updateComposingWords: function(id) {
      var query = "UPDATE composing_words SET isOpened = 1 WHERE id=?";
      console.log('update composing words');
      return $cordovaSQLite.execute($rootScope.db, query, [id]);
    },
    selectCoins: function() {
      var query = "SELECT coins FROM user_settings";
      console.log('select coins');
      return $cordovaSQLite.execute($rootScope.db, query);
    },
    updateCoins: function(value) {
      var query = "UPDATE user_settings SET coins=?";
      console.log('update coins');
      return $cordovaSQLite.execute($rootScope.db, query, [value]);
    },
    editData: function() {
      //var query = "insert into words(name, categoryId) values ('горобина', 2), ('черемха', 2), ('модрина', 2), ('жакаранда', 2), ('евкаліпт', 2)";
      //var query = "update categories set isOpened = 1 where id = 1"
      //var query = "create table user_settings(coins integer not null)"
      //var query = "update composing_words set isOpened = 0 where wordId = 1";
      console.log('updating data');
      return $cordovaSQLite.execute($rootScope.db, query);   
    }
  }
});