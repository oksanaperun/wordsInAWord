angular.module('wordInAWord.services', [])

.factory('WordDatabase', function($cordovaSQLite, $rootScope) {

  return {
    initDatabase: function() {
/*    window.plugins.sqlDB.remove('wordsInAWord.db', 0, function() {
      $rootScope.tryCopyDB = 'DB removed'
    }, function(error) {
      $rootScope.tryCopyDB = 'Failed to remove DB: ' + error.code;
    });*/

/*      window.plugins.sqlDB.copy('wordsInAWord.db', 0, function() {
        $rootScope.tryCopyDB = 'DB copied';
        $rootScope.db = $cordovaSQLite.openDB('wordsInAWord.db');
      }, function(error) {
        $rootScope.tryCopyDB = 'Failed to copy DB: ' + error.code;
        //$rootScope.db = $cordovaSQLite.openDB('wordsInAWord.db');
      }); */
      console.log('Connecting to DB');
      if (window.cordova) {
        $rootScope.db = window.sqlitePlugin.openDatabase({name: 'wordsInAWord.db', location: 1});
      } else {
        $rootScope.db = window.openDatabase('wordsInAWord.db', '1', 'words db', 256 * 256 * 100); // browser
      }
    },
  	selectWords: function() {
    	var query = "SELECT id, name FROM words";
      //var query = "SELECT name FROM sqlite_master WHERE type='table' AND name='composing_words'";
      //var query = "CREATE TABLE composing_words(id integer primary key, name text, description text, isOpened integer default 0, wordId integer)"
      //var query = "insert into words(id, name) values (1, 'смерека'), (2, 'автомобіль')";
      //var query = "insert into composing_words(id, name, wordId) values (3, 'авто', 2), (4, 'альбом', 2), (5, 'альт', 2), (6, 'ат', 2), (7, 'атол', 2), (8, 'атом', 2)"
      
      console.log('select words');
      return $cordovaSQLite.execute($rootScope.db, query);
	 },
   selectWordNameById: function(id) {
      var query = "SELECT name FROM words WHERE id=?";
      console.log('select word name');
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
    }
  }
});