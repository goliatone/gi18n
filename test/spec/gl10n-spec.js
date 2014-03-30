/*global define:true, describe:true , it:true , expect:true, 
beforeEach:true, sinon:true, spyOn:true , expect:true */
/* jshint strict: false */
define(['gl10n', 'jquery'], function(Gl10n, $) {

    describe('just checking', function() {

        it('Gl10n should be loaded', function() {
            expect(Gl10n).toBeTruthy();
            var gl10n = new Gl10n();
            expect(gl10n).toBeTruthy();
        });

        it('Gl10n should initialize', function() {
            var gl10n = new Gl10n();
            var output   = gl10n.init();
            var expected = 'This is just a stub!';
            expect(output).toEqual(expected);
        });
        
    });

});