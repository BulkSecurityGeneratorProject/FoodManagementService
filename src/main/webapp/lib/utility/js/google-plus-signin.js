'use strict';

/*
 * angular-google-plus-directive v0.0.1
 * ♡ CopyHeart 2013 by Jerad Bitner http://jeradbitner.com
 * Copying is an act of love. Please copy.
 */

angular.module('directive.g+signin', []).
  directive('googlePlusSignin', ['$window', function ($window) {
    var ending = /\.apps\.googleusercontent\.com$/;

    return {
      restrict: 'E',
      transclude: true,
      template: '<span></span>',
      replace: true,
      link: function (scope, element, attrs, ctrl, linker) {
        attrs.clientid += (ending.test(attrs.clientid) ? '' : '.apps.googleusercontent.com');

        attrs.$set('data-clientid', attrs.clientid);

        // Some default values, based on prior versions of this directive
        var defaults = {
          callback: 'signinCallback',
          cookiepolicy: 'single_host_origin',
          requestvisibleactions: 'http://schemas.google.com/AddActivity',
          scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
          width: 'wide',
        };

        defaults.clientid = attrs.clientid;

        // Overwrite default values if explicitly set
        angular.forEach(Object.getOwnPropertyNames(defaults), function(propName) {
          if (attrs.hasOwnProperty(propName)) {
            defaults[propName] = attrs[propName];
          }
        });

        // Default language
        // Supported languages: https://developers.google.com/+/web/api/supported-languages
        attrs.$observe('language', function(value){
          $window.___gcfg = {
            lang: value ? value : 'en'
          };
        });
        
        // Asynchronously load the G+ SDK.
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/client:plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);

        linker(function(el, tScope){
          po.onload = function() {
            if (el.length) {
              element.append(el);
            }
            gapi.signin.render(element[0], defaults);
          };
        });
      }
    }
}]).
  run(['$window','$rootScope',function($window, $rootScope) {
    $window.signinCallback = function (authResult) {
    	var data1="none";
      if (authResult && authResult.access_token){
    	  console.log(authResult);
    	  $.ajax({
              type: "GET",
              url: "https://www.googleapis.com/oauth2/v2/userinfo?access_token="+authResult.access_token
          })
          .done(function( data ){
        	  data1=data;
              $rootScope.$broadcast('event:google-plus-signin-success', authResult,data1);
          });
        
      } else {
        $rootScope.$broadcast('event:google-plus-signin-failure', authResult,data1);
      }
    }; 
}]);
