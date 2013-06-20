(function($){
    $.fn.screenChange = function(options) {
        var defaults = {
            speed: 500,
            effect: 'slide',
            cbBegin: function(){},
            cbEnd: function(){},
            cbChange: function(){}
        };

        this.setEffect = function(effect) {
            opts.effect = effect;
        }
        var opts = $.extend(defaults, options),
            selector = this.selector,
            DELAY_TRANSITION = 10,
            MAX_ITERATE = 10000;

        $(document).keyup(function(evt) {
            if (evt.ctrlKey && evt.shiftKey) {
                var index = $(selector + ' > .current').index() + 1;
                if (evt.which == 37 && index > 1) {
                    tagStart = $(selector).children('*:nth-child(' + index + ')')
                    tagEnd = $(selector).children('*:nth-child(' + (index - 1) + ')');
                    $.fn.screenChange.changeScreen(tagStart, tagEnd, opts);
                }
                else if (evt.which == 39 && index < $(selector + ' > *').length) {
                    tagStart = $(selector).children('*:nth-child(' + index + ')')
                    tagEnd = $(selector).children('*:nth-child(' + (index + 1) + ')');
                    $.fn.screenChange.changeScreen(tagStart, tagEnd, opts);
                }
            }

        });

        $.fn.screenChange.changeScreen = function(tagStart, tagEnd, params) {
            params = params || {}
            $.toExtend(params, opts)
            params.cbBegin.call(this, tagEnd);
            tagStart.get(0).__changeScreen__  = params
            switch(opts.effect) {
                case "fade":
                    new $.fn.screenChange.fadeEffect().animate(tagStart, tagEnd, params);
                    break;
                case "slide":
                    new $.fn.screenChange.slideEffect().animate(tagStart, tagEnd, params);
                    break;
                case "cube":
                    new $.fn.screenChange.cubeEffect().animate(tagStart, tagEnd, params);
                    break;
                case "stack":
                    new $.fn.screenChange.stackEffect().animate(tagStart, tagEnd, params);
                    break;
                case "bulldoze":
                    new $.fn.screenChange.bulldozeEffect().animate(tagStart, tagEnd, params);
                    break;
                default:
                    tagStart.removeClass('current')
                    tagEnd.addClass('current')
                    break;
            };
        };

        var endAnimation = function() {
            var dom = $(this)
            setTimeout(function(){
                dom.removeAttr('style').removeClass('bulldoze-effect').removeClass('ltr').removeClass('rtf');
                dom.parent().removeClass('three-dimension').removeAttr('style');
            }, DELAY_TRANSITION)
            params = $(this).get(0).__changeScreen__
            if (params) {
                delete $(this).get(0).__changeScreen__
                params.cbEnd.call(this)
            }
        }

        var crossBrowserCSS = function(css) {
            var parts = css.split(':'),
                result = '';
            parts[0] = parts[0].trim()
            parts[1] = parts[1].trim()
            _.each(['-webkit-', '-moz-', '-o-', '-ms-', ''], function(value) {
                result += value + parts[0] + ': ' + parts[1] + '; '
            })
            return result;
        }

        function inheritPrototype(subType, superType){
            var object = function(o){
                function F(){}
                F.prototype = o;
                return new F();
            }
            var prototype = object(superType.prototype);
            prototype.constructor = subType;
            subType.prototype = prototype;
        };

        var animateEffect = function () {
            this.args = Array.prototype.slice.call(arguments);
            this.__constructor ? this.__constructor.apply(this, this.args) : ''
        };

        $.fn.screenChange.fadeEffect = function () {
            this.args = Array.prototype.slice.call(arguments)
            animateEffect.apply(this.__proto__.__proto__, this.args);
            this.__constructor ? this.__constructor.apply(this, this.args) : ''
        };
        inheritPrototype($.fn.screenChange.fadeEffect, animateEffect);
        $.fn.screenChange.fadeEffect.prototype.animate = function (tagStart, tagEnd, params) {
            tagStart.removeClass('current').css({display: 'block'});
            tagEnd.addClass('current').css({opacity: 0});
            setTimeout(function() {
                d3.select(tagStart.get(0)).style('display', 'block')
                    .transition().duration(params.speed).ease("quad")
                    .style('opacity', 0)
                    .each('end', endAnimation);
                d3.select(tagEnd.get(0)).style('display', 'block')
                    .transition().duration(params.speed).ease("quad")
                    .style('opacity', 1)
                    .each('end', endAnimation);
            }, DELAY_TRANSITION)
        };

        $.fn.screenChange.slideEffect = function () {
            this.args = Array.prototype.slice.call(arguments);
            animateEffect.apply(this.__proto__.__proto__, this.args);
            this.__constructor ? this.__constructor.apply(this, this.args) : ''
        };
        inheritPrototype($.fn.screenChange.slideEffect, animateEffect);
        $.fn.screenChange.slideEffect.prototype.animate = function (tagStart, tagEnd, params) {
            var iIte = 0,
                iRun = 1,
                tagIte = tagStart,
                dWidth = tagStart.parent().parent().width();
            tagStart.removeClass('current').css({display: 'block'});
            tagEnd.addClass('current');
            tagStart.index() < tagEnd.index() ? factor = 1 :  factor = -1
            while(iIte < MAX_ITERATE) {
                d3.select(tagIte.get(0)).style('display', 'block').style('left', iIte++*dWidth*factor+'px');
                if (tagIte.get(0).isEqualNode(tagEnd.get(0))) break;
                tagIte = (factor == 1 ? tagIte.next() : tagIte.prev());
            }
            setTimeout(function(){
                tagIte = tagStart;
                while(iIte < MAX_ITERATE) {
                    d3.select(tagIte.get(0)).transition().duration(params.speed).ease("quad")
                        .style('left', (factor * (iRun++-iIte) * dWidth)+'px')
                        .each('end', endAnimation);
                    if (tagIte.get(0).isEqualNode(tagEnd.get(0))) break;
                    tagIte = (factor == 1 ? tagIte.next() : tagIte.prev());
                }
            }, DELAY_TRANSITION)
        };

        $.fn.screenChange.cubeEffect = function () {
            this.args = Array.prototype.slice.call(arguments);
            animateEffect.apply(this.__proto__.__proto__, this.args);
            this.__constructor ? this.__constructor.apply(this, this.args) : '';
        };
        inheritPrototype($.fn.screenChange.cubeEffect, animateEffect);
        $.fn.screenChange.cubeEffect.prototype.animate = function (tagStart, tagEnd, params) {
            var factor = -1;
            tagStart.removeClass('current').css({display: 'block'});
            tagEnd.addClass('current');
            tagStart.parent().addClass('three-dimension').css({'overflow-y': 'visible'})
            d3.select(tagStart.get(0)).attr('style', function() {
                return 'display: block; ' + crossBrowserCSS('backface-visibility: hidden') + '; ' + crossBrowserCSS('transform: translateZ(-565px) rotateY(0deg) translateZ(565px)')
            })
            if (tagStart.index() < tagEnd.index())
                factor = 1
            d3.select(tagEnd.get(0)).attr('style', function() {
                return 'display: block; ' + crossBrowserCSS('backface-visibility: hidden') + '; ' + crossBrowserCSS('transform: translateZ(-565px) rotateY('+(factor*90)+'deg) translateZ(565px)')
            })
            setTimeout(function() {
                d3.select(tagStart.get(0)).transition().duration(params.speed).ease("quad")
                    .attr('style', function() {
                        return 'display: block; ' + crossBrowserCSS('backface-visibility: hidden') + '; ' + crossBrowserCSS('transform: translateZ(-565px) rotateY('+(factor*-90)+'deg) translateZ(565px)')
                    })
                    .each('end', endAnimation);
                d3.select(tagEnd.get(0)).transition().duration(params.speed).ease("quad")
                    .attr('style', function() {
                        return 'display: block; ' + crossBrowserCSS('backface-visibility: hidden') + '; ' + crossBrowserCSS('transform: translateZ(-565px) rotateY(0deg) translateZ(565px)')
                    })
                    .each('end', endAnimation);
            }, DELAY_TRANSITION)
        };

        $.fn.screenChange.stackEffect = function () {
            this.args = Array.prototype.slice.call(arguments);
            animateEffect.apply(this.__proto__.__proto__, this.args);
            this.__constructor ? this.__constructor.apply(this, this.args) : '';
        };
        inheritPrototype($.fn.screenChange.stackEffect, animateEffect);
        $.fn.screenChange.stackEffect.prototype.animate = function (tagStart, tagEnd, params) {
            var dWidth = tagStart.parent().parent().width();
            tagStart.removeClass('current');
            tagEnd.addClass('current')
            d3.select(tagStart.get(0)).attr('style', function() {
                return 'display: block; opacity: 1; ' + crossBrowserCSS('transform: translateX(0px) scale(1, 1)')
            })
            if (tagStart.index() < tagEnd.index())
                d3.select(tagEnd.get(0)).attr('style', function(){
                    return 'display: block; opacity: 1; ' + crossBrowserCSS('transform: translateX('+dWidth+'px) scale(1, 1)')
                })
            else
                d3.select(tagEnd.get(0)).attr('style', function(){
                    return 'display: block; opacity: 1; ' + crossBrowserCSS('transform: translateX('+-dWidth+'px) scale(1, 1)')
                })
            setTimeout(function() {
                d3.select(tagStart.get(0)).transition().duration(params.speed).ease("quad")
                    .attr('style', function() {
                        return 'display: block; opacity: 0; ' + crossBrowserCSS('transform: translateX(0px) scale(0, 0)')
                    })
                    .each('end', endAnimation);
                d3.select(tagEnd.get(0)).transition().duration(params.speed).ease("quad")
                    .attr('style', function() {
                        return 'display: block; opacity: 1; ' + crossBrowserCSS('transform: translateX(0px) scale(1, 1)')
                    })
                    .each('end', endAnimation);
            }, DELAY_TRANSITION);
        }

        $.fn.screenChange.bulldozeEffect = function () {
            this.args = Array.prototype.slice.call(arguments);
            animateEffect.apply(this.__proto__.__proto__, this.args);
            this.__constructor ? this.__constructor.apply(this, this.args) : '';
        };
        inheritPrototype($.fn.screenChange.bulldozeEffect, animateEffect);
        $.fn.screenChange.bulldozeEffect.prototype.animate = function (tagStart, tagEnd, params) {
            tagStart.addClass('bulldoze-effect').removeClass('current');
            tagEnd.addClass('bulldoze-effect').addClass('current');
            if (tagStart.index() < tagEnd.index()) {
                tagStart.addClass('ltr');
                tagEnd.addClass('rtf');
            } else {
                tagStart.addClass('rtf');
                tagEnd.addClass('ltr');
            }
            d3.select(tagStart.get(0)).attr('style', function() {
                return 'zIndex: -1; display: block; ' + crossBrowserCSS('transform: scale(1, 1)')
            });
            d3.select(tagEnd.get(0)).attr('style', function(){
                return 'zIndex: 1; display: block; ' + crossBrowserCSS('transform: scale(0, 1)')
            })
            setTimeout(function() {
                d3.select(tagEnd.get(0)).transition().duration(params.speed).ease("quad")
                    .attr("style", function () {
                        return 'zIndex: 1; display: block; ' + crossBrowserCSS('transform: scale(1, 1)')
                    })
                    .each('end', endAnimation);
                d3.select(tagStart.get(0)).transition().duration(params.speed).ease("quad")
                    .attr('style', function() {
                        return 'zIndex: -1; display: block; ' + crossBrowserCSS('transform: scale(0, 1)')
                     })
                    .each('end', endAnimation);
            }, DELAY_TRANSITION)
        };
        return this;
    }
})(jQuery);

