angular.module('wordInAWord.services', [])

.factory('Coins', function() {
  var coinsCount = 0;

  return {
      getCount: function() {
        return coinsCount;
      },
      setCount: function(value) {
        coinsCount = value;        
      }
  };
})

.factory('OpenedComposingWordsCount', function() {
    var count = 0,
        wordId = 0,
        categoryId = 0;

    return {
      getCount: function() {
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

.factory('OpenedWord', function() {
  var openedWordId = 0;

  return {
      getOpenedWordId: function() {
        return openedWordId;
      },
      setOpenedWordId: function(value) {
        openedWordId = value;        
      }
  };
})

.factory('WordDatabase', function($cordovaSQLite, $rootScope) {

  return {
    initDatabase: function() {
    console.log('Connecting to DB');
    if (window.cordova) {
/*      window.plugins.sqlDB.copy('wordsInAWord.db', 0, function() {
        $rootScope.tryCopyDB = 'DB copied';
        $rootScope.db = window.sqlitePlugin.openDatabase({name: 'wordsInAWord.db', location: 1});
        }, function(error) {
          $rootScope.tryCopyDB = 'Failed to copy DB: ' + error.code;
      }); */

      $rootScope.db = window.sqlitePlugin.openDatabase({name: "wordsInAWord.db", location: 'default', createFromLocation: 1});

      //$rootScope.db = window.sqlitePlugin.openDatabase({name: 'wordsInAWord.db', location: 1});
    } else {
        $rootScope.db = window.openDatabase('wordsInAWord.db', '1', 'words db', 256 * 256 * 100); // browser
    }
    },
    selectCategories: function() {
      var query = "SELECT id, name, isOpened FROM categories";
      console.log('select categories');
      return $cordovaSQLite.execute($rootScope.db, query);
    },
    openCategoryById: function(id) {
      var query = "UPDATE categories SET isOpened = 1 WHERE id=?";
      console.log('open category');
      return $cordovaSQLite.execute($rootScope.db, query, [id]);
    },
  	selectWords: function() {
    	var query = "SELECT W.id, W.name, W.categoryId, " +
      "(SELECT COUNT(id) FROM composing_words WHERE wordId = W.id) totalComposingWords, " +
      "(SELECT COUNT(case isOpened when 1 then 1 else null end) FROM composing_words WHERE wordId = W.id) openedComposingWords " +
      "FROM words as W";
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
    openComposingWordById: function(id) {
      var query = "UPDATE composing_words SET isOpened = 1, isDescriptionOpened = 1 WHERE id=?";
      console.log('open composing word');
      return $cordovaSQLite.execute($rootScope.db, query, [id]);
    },
    openComposingWordDescriptionById: function(id) {
      var query = "UPDATE composing_words SET isDescriptionOpened = 1 WHERE id=?";
      console.log('open composing word description');
      return $cordovaSQLite.execute($rootScope.db, query, [id]);
    },
    selectComposingWordDataById: function(id) {
      var query = "SELECT id, name, isOpened, description, isDescriptionOpened FROM composing_words WHERE id=?";
      console.log('select composing word data');
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
      //var query = "CREATE TABLE categories ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, isOpened INTEGER NOT NULL DEFAULT 0 )"
      //var query = "CREATE TABLE composing_words ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL, description TEXT, isOpened INTEGER NOT NULL DEFAULT 0, isDescriptionOpened INTEGER NOT NULL DEFAULT 0, wordId INTEGER NOT NULL, FOREIGN KEY(wordId) REFERENCES words(id) )"
      //var query = "CREATE TABLE words ( id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, name TEXT NOT NULL UNIQUE, categoryId INTEGER NOT NULL, FOREIGN KEY(categoryId) REFERENCES categories(id) )"
      //var query = "INSERT INTO categories VALUES (1, 'Україна', 1), (2, 'Дерева',0), (3, 'Архітектура', 0)"
      //var query = "insert into words(name, categoryId) values ('українець', 1), ('чорнозем', 1), ('барвінок', 1), ('вишиванка', 1), ('батьківщина', 1), ('горобина', 2), ('черемха', 2), ('модрина', 2), ('жакаранда', 2), ('евкаліпт', 2)";
      //var query = "insert into composing_words(name, wordId) values ('аїр', 1), ('акр', 1), ('анкер', 1), ('ар', 1)"
      //var query = "insert into composing_words(name, wordId) values ('зерно', 2), ('зеро', 2), ('мезон', 2), ('мер', 2), ('меч', 2), ('мор', 2), ('море', 2), ('мороз', 2)"
      //var query = "insert into composing_words (name, wordId) values ('акин', 4), ('вика', 4), ('вина', 4), ('вишивка', 4), ('вишина', 4)";
      //var query = "insert into composing_words (name, wordId) values ('вишка', 4), ('вишник', 4), ('вшивка', 4), ('кава', 4), ('канва', 4)";
      //var query = "insert into composing_words (name, wordId) values ('абак', 5), ('абат', 5), ('акант', 5), ('акин', 5), ('акт', 5)";
      //var query = "insert into composing_words (name, wordId) values ('ангоб', 6), ('ар', 6), ('аргон', 6), ('багно', 6), ('багор', 6)";
      //var query = "update composing_words set description = 'test description'"
      //var query = "create table user_settings(coins integer not null)"
      //var query = "insert into user_settings(coins) values (0)"
      //var query = "update user_settings set coins = 100"
      //var query = "update composing_words set isOpened = 0, isDescriptionOpened = 0 where wordId = 1";
      //var query = "update categories set isOpened = 0 where id = 2 or id = 3"
      //var query = "drop table composing_words"
      console.log('updating data');
      return $cordovaSQLite.execute($rootScope.db, query);   
    }
  }
});