$(function () {
    'use strict';

    var $siteNav = $('#site-nav'),
        $toggleBtn = $('#toggle'),
        $navContent = $siteNav.find('.content');

    $siteNav.waypoint('sticky', {
        offset: 20
    });

    $toggleBtn.click(function () {
        $navContent.toggleClass('collapsed');
    });

});
