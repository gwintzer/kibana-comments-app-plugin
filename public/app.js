
import moment from 'moment-timezone';
import _ from 'lodash';

import uiModules from 'ui/modules';
import uiRoutes from 'ui/routes';

import 'ui/autoload/all';

import './less/main.less';
import template from './templates/index.html';
import chrome from 'ui/chrome';

// in dev mode, url path is prefixed by a 3-letter string to force cache reloading, 
// else the proxy path begins directly by /app
const apiPrefix = window.location.pathname.split('/')[1] === "app" ? 
  "/" : "/" + window.location.pathname.split('/')[1]; 

uiRoutes.enable();
uiRoutes
.when('/', {
  template
});

uiModules
.get('app/kibana-comments-plugin', ['ui.bootstrap.datepicker', 'ui.bootstrap.dateparser', 'ui.bootstrap.position'])
.constant('datepickerConfig', {
  formatDay: 'dd',
  formatMonth: 'MMMM',
  formatYear: 'yyyy',
  formatDayHeader: 'EEE',
  formatDayTitle: 'MMMM yyyy',
  formatMonthTitle: 'yyyy',
  datepickerMode: 'day',
  minMode: 'day',
  maxMode: 'year',
  showWeeks: true,
  startingDay: 0,
  yearRange: 20,
  minDate: null,
  maxDate: null
})
.controller('kibanaPluginCommentForm', 
            ['$scope', '$route', '$interval', '$http', '$log', '$timeout', 'datepickerConfig', 
            function ($scope, $route, $interval, $http, $log, $timeout, datepickerConfig) {

  $scope.title = 'Comments';
  $scope.description = 'A plugin to add comments at a given date, in a specific elasticsearch index';

  $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;

  $scope.date = new Date();
  $scope.date.setHours(12,0,0,0);

  $scope.isLoadingComments = false;

  var reloadList = function() {

    $scope.isLoadingComments = true;
    $timeout(function () {
      
      $http
      .get(apiPrefix + '/api/kibana-comments-plugin/comment')
      .success(function(data, status, headers, config) {
        $scope.listComments = data.map((oneData) => ({ ...oneData, date: moment(oneData.date).format('YYYY/MM/DD')}));
        $scope.isLoadingComments = false;
      })
      .error(function(data, status, headers, config) {

        $scope.messages = 'There was a network error. Try again later.';
        $scope.isLoadingComments = false;
      })
      .finally(function() {
        // Hide status messages after three seconds.
        $timeout(function() {
          $scope.messages = null;
        }, 5000);
      });
       
    }, 1000);
  };

  reloadList();
  
  $scope.deleteComment = function(commentId) {

    // Perform JSONP request.
    var $promise = $http({
        method: 'DELETE',
        url: apiPrefix + '/api/kibana-comments-plugin/comment/' + commentId, 
        headers: {
          'Content-Type': 'application/json'
        }
    })
    .success(function(res, status, headers, config) {

      console.log("res", res)
      if (res.deleted) {
        $scope.messages = {
          text: 'Your comment has been deleted!', 
          type: 'success'
        };

        // Reload comment list
        reloadList();

      } else {
        $scope.messages = {
          text: 'Oops, we received your request, but there was an error processing it.', 
          type: 'danger'
        };
        $log.error(res);
      }


    })
    .error(function(res, status, headers, config) {

      $scope.messages = {
        text: 'There was a network error. Try again later.', 
        type: 'danger'
      };

      $log.error(res);
    })
    .finally(function() {

      // Hide status messages after three seconds.
      $timeout(function() {
        $scope.messages = null;
      }, 5000);
    });
  }

  $scope.submit = function(form) {

    // Trigger validation flag.
    $scope.submitted = true;

    // If form is invalid, return and let AngularJS show validation errors.
    if (form.$invalid) {
      return;
    }

    // Default values for the request.
    var data = {
      'date' : $scope.date,
      'body' : $scope.body
    };

    // Perform JSONP request.
    var $promise = $http({
        method: 'PUT',
        url: apiPrefix + '/api/kibana-comments-plugin/comment', 
        headers: {
          'Content-Type': 'application/json'
        },
        data
    })
    .success(function(res, status, headers, config) {

      if (res.created) {
        $scope.body = null;
        $scope.messages = {
          text: 'Your comment has been saved!', 
          type: 'success'
        };
        $scope.submitted = false;

        // Reload comment list
        reloadList();

      } else {
        $scope.messages = {
          text: 'Oops, we received your request, but there was an error processing it.', 
          type: 'danger'
        };
        $log.error(res);
      }
    })
    .error(function(res, status, headers, config) {

      console.log(arguments);
      $scope.messages = {
        text: 'There was a network error. Try again later.', 
        type: 'danger'
      };

      $log.error(res);
    })
    .finally(function() {

      // Hide status messages after three seconds.
      $timeout(function() {
        $scope.messages = null;
      }, 5000);
    });

  };

}]);
