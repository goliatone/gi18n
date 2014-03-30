/*global define:true requirejs:true*/
/* jshint strict: false */
requirejs.config({
    paths: {
        'jquery': 'jquery/jquery',
        'gl10n': 'gl10n'
    }
});

define(['gl10n', 'jquery'], function (Gl10n, $) {
    console.log('Loading');
     var updateStrings = function(code){
        $('[data-lcl]').each(function(i, item){
            var $i = $(item);
            var content = $i.html();
            $i.html(_(content));
            $i.data('lcl', code);
            window.item = $i;
        });
    };

	var gl10n = new Gl10n({
        onUpdated:updateStrings
    });

    /**
     * Initialize l10n menu. This is a joke, thou :P
     */
    $('.l10n-btn').on('click',function(){
        var code = $(this).data('l10n');
        location = location.origin + location.pathname + "?lang="+code;
    });



    window.gl = gl10n;
});