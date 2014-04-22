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

    $('body').click(function (e) {
        var $t = $(e.target),
            isNotNav = $t.closest('.sidebar').length === 0;

        if(isNotNav || $t.is('a')) {
            $navContent.addClass('collapsed');
        }
    });
});
