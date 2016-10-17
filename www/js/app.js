// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('wordInAWord', ['ionic', 'wordInAWord.controllers', 'wordInAWord.services', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSQLite, $rootScope, WordDatabase) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    } 

    WordDatabase.initDatabase();
   });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

    .state('app.info', {
      url: '/info',
      views: {
        'menuContent': {
          templateUrl: 'templates/info.html'
        }
      }
  })

    .state('app.achievements', {
    url: '/achievements',
    views: {
      'menuContent': {
        templateUrl: 'templates/achievements.html'
      }
    }
  })

    .state('app.wordsList', {
      url: '/wordslist',
      views: {
        'menuContent': {
          templateUrl: 'templates/wordsList.html',
          controller: 'WordsListCtrl'
        }
      }
    })

  .state('app.single', {
    url: '/wordslist/:wordId',
    views: {
      'menuContent': {
        templateUrl: 'templates/word.html',
        controller: 'WordCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/wordslist');
});
